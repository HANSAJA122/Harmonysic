"use client";
import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, PlaySquare } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import './MusicPlayer.css';

const MusicPlayer: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlayPause, setIsPlaying, setFullScreen, 
    progress, setProgress, volume, 
    playNext, playPrevious, isShuffle, isRepeat, toggleShuffle, toggleRepeat,
    setCurrentTrackDuration, setYoutubePlayer,
    isRightSidebarOpen, setRightSidebarOpen,
    likedSongs, toggleLikeSong
  } = usePlayerStore();
  
  const isCurrentTrackLiked = currentTrack ? likedSongs.some(s => s.id === currentTrack.id) : false;
  
  const ytPlayerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set up progress polling
  useEffect(() => {
    let interval: any;
    if (isPlaying && playerReady && ytPlayerRef.current) {
      interval = setInterval(async () => {
        try {
          const currentTime = await ytPlayerRef.current.getCurrentTime();
          setProgress(currentTime);
        } catch (e) {
          // ignore
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playerReady, setProgress]);

  // Sync volume changes
  useEffect(() => {
    if (playerReady && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(volume * 100);
      } catch (e) {
        console.warn('Failed to set volume', e);
      }
    }
  }, [volume, playerReady]);

  // Deep diagnostic logging whenever track changes
  useEffect(() => {
    if (currentTrack) {
      console.log('=== DEEP DIAGNOSTIC LOG ===');
      console.log('1. Selected Track Object:', currentTrack);
      console.log('2. Extracted videoId:', currentTrack.id);
      console.log('3. Generated YouTube URL:', `https://www.youtube.com/watch?v=${currentTrack.id}`);
      console.log('4. ReactPlayer (react-youtube) State:', { isPlaying, playerReady });
      
      setTimeout(() => {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          console.log('5. Found Iframe in DOM:', iframe);
          console.log('6. Iframe src attribute:', iframe.src);
          console.log('7. Src contains videoId?', iframe.src.includes(currentTrack.id));
        } else {
          console.warn('5. Iframe NOT found in DOM!');
        }
      }, 1000);
    }
  }, [currentTrack]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayerClick = () => {
    if (window.innerWidth < 768) {
      setFullScreen(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ytPlayerRef.current || !currentTrack || !playerReady) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * currentTrack.duration;
    
    try {
      ytPlayerRef.current.seekTo(newTime, true);
      setProgress(newTime);
    } catch (e) {
      console.warn('Failed to seek', e);
    }
  };

  const progressPercent = currentTrack && currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;
  
  // Use a fallback valid URL to pre-initialize the iframe API safely
  // IMPORTANT: Keep this static so react-youtube NEVER rebuilds the iframe!
  const [initialVideoId] = useState('dQw4w9WgXcQ');

  const onReady = (event: any) => {
    console.log('[YouTube API] onReady fired!');
    ytPlayerRef.current = event.target;
    setPlayerReady(true);
    setYoutubePlayer(event.target);
    
    try {
      event.target.setVolume(volume * 100);
      
      if (currentTrack && isPlaying) {
        event.target.playVideo();
      }
    } catch (e) {
      console.warn('Failed onReady actions', e);
    }
  };

  const onStateChange = (event: any) => {
    console.log('[YouTube API] State changed to:', event.data);
    // 1 = PLAYING
    if (event.data === 1) {
      setIsPlaying(true);
      const duration = event.target.getDuration();
      console.log('[YouTube API] onDuration fired:', duration);
      setCurrentTrackDuration(duration);
    }
    // 2 = PAUSED
    if (event.data === 2) {
      setIsPlaying(false);
    }
    // 0 = ENDED
    if (event.data === 0) {
      playNext();
    }
  };

  const onError = (event: any) => {
    console.error('[YouTube API] onError fired with code:', event.data);
    console.log('Error codes: 150/101 = Copyright Block. 2 = Invalid ID.');
    setIsPlaying(false);
    
    // Automatically skip to the next track if this one fails to play
    console.log('Skipping to next track due to playback error...');
    playNext();
  };

  // We still keep the useEffect to sync from external changes, but we shouldn't rely solely on it for clicks
  useEffect(() => {
    if (playerReady && ytPlayerRef.current) {
      try {
        const iframe = ytPlayerRef.current.getIframe();
        if (!iframe || !document.body.contains(iframe)) return;

        // If isPlaying is true but player state is not 1 (PLAYING), try to play
        const state = ytPlayerRef.current.getPlayerState();
        if (isPlaying && state !== 1) {
          ytPlayerRef.current.playVideo();
        } else if (!isPlaying && state === 1) {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (e) {
        console.warn('Failed to sync play state', e);
      }
    }
  }, [isPlaying, playerReady]);

  // Sync track changes manually without triggering react-youtube prop changes
  useEffect(() => {
    if (playerReady && ytPlayerRef.current && currentTrack) {
      try {
        console.log('[Sync] Loading new video from effect:', currentTrack.id);
        ytPlayerRef.current.loadVideoById(currentTrack.id);
        if (isPlaying) {
          ytPlayerRef.current.playVideo();
        }
      } catch (e) {
        console.warn('Failed to sync track', e);
      }
    }
  }, [currentTrack?.id]);

  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Optimistically toggle state
    togglePlayPause();
    
    // Synchronously command YouTube API to bypass Safari gesture blocks
    if (ytPlayerRef.current && playerReady) {
      try {
        if (!isPlaying) {
          console.log('[Direct Click] Forcing playVideo()');
          ytPlayerRef.current.playVideo();
        } else {
          console.log('[Direct Click] Forcing pauseVideo()');
          ytPlayerRef.current.pauseVideo();
        }
      } catch (err) {
        console.error('Direct click API failed:', err);
      }
    }
  };

  return (
    <>
      {/* Hidden YouTube Iframe - MUST stay in DOM and have size to bypass browser throttling! */}
      {isClient && (
        <div style={{ position: 'fixed', top: '10px', left: '10px', width: '300px', height: '200px', opacity: 0.001, pointerEvents: 'none', zIndex: -50 }}>
          <YouTube 
            videoId={initialVideoId}
            opts={{
              width: '300px',
              height: '200px',
              playerVars: {
                autoplay: 0,
                controls: 0,
                playsinline: 1,
                modestbranding: 1
              }
            }}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {currentTrack && (
        <div className="music-player" onClick={handlePlayerClick}>
          <div className="player-left">
            <img src={currentTrack.albumUrl} alt={currentTrack.title} className="player-artwork" />
            <div className="player-track-info">
              <span className="player-title">{currentTrack.title}</span>
              <span className="player-artist">{currentTrack.artist}</span>
            </div>
            <button 
              className="player-control-btn" 
              style={{ marginLeft: 'var(--spacing-2)', color: isCurrentTrackLiked ? 'var(--color-primary)' : 'inherit' }}
              onClick={(e) => { e.stopPropagation(); toggleLikeSong(currentTrack); }}
            >
              <Heart size={16} fill={isCurrentTrackLiked ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="player-center" onClick={(e) => e.stopPropagation()}>
            <div className="player-controls">
              <button className="player-control-btn" onClick={toggleShuffle} style={{ color: isShuffle ? 'var(--color-primary)' : 'inherit' }}>
                <Shuffle size={16} />
              </button>
              <button className="player-control-btn" onClick={(e) => { e.stopPropagation(); playPrevious(); }}>
                <SkipBack size={20} fill="currentColor" />
              </button>
              <button className="player-play-btn" onClick={handlePlayPauseClick}>
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
              </button>
              <button className="player-control-btn" onClick={(e) => { e.stopPropagation(); playNext(); }}>
                <SkipForward size={20} fill="currentColor" />
              </button>
              <button className="player-control-btn" onClick={toggleRepeat} style={{ color: isRepeat ? 'var(--color-primary)' : 'inherit' }}>
                <Repeat size={16} />
              </button>
            </div>
            <div className="player-progress-container">
              <span className="player-time">{formatTime(progress)}</span>
              <div className="player-progress-bar" onClick={handleSeek} style={{ cursor: 'pointer' }}>
                <div className="player-progress-fill" style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
              </div>
              <span className="player-time">{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="player-right" onClick={(e) => e.stopPropagation()}>
            <button 
              className="player-control-btn" 
              onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
              style={{ color: isRightSidebarOpen ? 'var(--color-primary)' : 'inherit' }}
            >
              <PlaySquare size={16} />
            </button>
            <button className="player-control-btn"><Volume2 size={20} /></button>
            <div className="volume-bar">
              <div className="volume-fill" style={{ width: `${volume * 100}%` }}></div>
            </div>
          </div>

          <div className="mobile-player-controls" onClick={(e) => e.stopPropagation()}>
            <button 
              className="player-control-btn"
              onClick={(e) => { e.stopPropagation(); toggleLikeSong(currentTrack); }}
              style={{ color: isCurrentTrackLiked ? 'var(--color-primary)' : 'inherit' }}
            >
              <Heart size={20} fill={isCurrentTrackLiked ? "currentColor" : "none"} />
            </button>
            <button className="player-play-btn" onClick={handlePlayPauseClick} style={{ backgroundColor: 'transparent', color: 'var(--color-text-primary)' }}>
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MusicPlayer;

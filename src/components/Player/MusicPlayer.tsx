"use client";
import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart, PlaySquare, Mic2, PictureInPicture } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { FastAverageColor } from 'fast-average-color';
import './MusicPlayer.css';

const MusicPlayer: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlayPause, setIsPlaying, setFullScreen, 
    progress, setProgress, volume, setVolume,
    playNext, playPrevious, isShuffle, isRepeat, toggleShuffle, toggleRepeat,
    setCurrentTrackDuration, setYoutubePlayer,
    isRightSidebarOpen, setRightSidebarOpen,
    likedSongs, toggleLikeSong,
    isLyricsOpen, setLyricsOpen
  } = usePlayerStore();
  
  const isCurrentTrackLiked = currentTrack ? likedSongs.some(s => s.id === currentTrack.id) : false;
  
  const { user } = useAuthStore();
  const ytPlayerRef = useRef<any>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [remoteSession, setRemoteSession] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Multi-Device Sync (Harmonysic Connect)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      const data = snapshot.data();
      if (data?.currentlyPlaying) {
        const remote = data.currentlyPlaying;
        const localId = localStorage.getItem('harmonysic_device_id');
        if (remote.deviceId && remote.deviceId !== localId) {
          setRemoteSession(remote);
          // If we are currently playing, and another device took over, pause local playback
          const state = usePlayerStore.getState();
          if (state.isPlaying) {
             state.setIsPlaying(false);
             if (ytPlayerRef.current && state.youtubePlayer) {
               ytPlayerRef.current.pauseVideo();
             }
          }
        } else {
          setRemoteSession(null);
        }
      } else {
        setRemoteSession(null);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const handleTakeover = () => {
    if (!remoteSession) return;
    // We recreate the track object as best as we can
    const trackToResume = {
      id: remoteSession.trackId,
      title: remoteSession.title,
      artist: remoteSession.artist,
      albumUrl: remoteSession.albumUrl,
      duration: 180 // default
    };
    usePlayerStore.getState().setCurrentTrack(trackToResume);
    usePlayerStore.getState().setIsPlaying(true);
  };

  const startPiP = async () => {
    try {
      // 1. Try Modern Document Picture-in-Picture API first (Chrome/Edge)
      if ('documentPictureInPicture' in window) {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 300,
          height: 300,
        });
        
        pipWindow.document.body.style.margin = '0';
        pipWindow.document.body.style.display = 'flex';
        pipWindow.document.body.style.flexDirection = 'column';
        pipWindow.document.body.style.backgroundColor = '#121212';
        pipWindow.document.body.style.color = 'white';
        pipWindow.document.body.style.fontFamily = 'system-ui, sans-serif';

        const img = document.createElement('img');
        img.src = currentTrack?.albumUrl || '';
        img.style.width = '100%';
        img.style.aspectRatio = '1/1';
        img.style.objectFit = 'cover';
        pipWindow.document.body.appendChild(img);

        const info = document.createElement('div');
        info.style.padding = '12px';
        info.innerHTML = `<strong style="font-size: 16px; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${currentTrack?.title}</strong><span style="font-size: 14px; color: #b3b3b3;">${currentTrack?.artist}</span>`;
        pipWindow.document.body.appendChild(info);
        return;
      }

      // 2. Fallback to Canvas/Video hack
      if (!pipVideoRef.current || !pipCanvasRef.current) return;
      const video = pipVideoRef.current;
      const canvas = pipCanvasRef.current;
      const stream = canvas.captureStream(30);
      video.srcObject = stream;
      await video.play();
      await video.requestPictureInPicture();
    } catch (err: any) {
      console.error('Failed to enter PiP mode', err);
      alert(`PiP Error: ${err.message || 'Not supported by your browser.'}`);
    }
  };

  // Pre-draw album art to canvas whenever track changes
  useEffect(() => {
    if (!currentTrack || !pipCanvasRef.current) return;
    const canvas = pipCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentTrack.albumUrl;
    
    img.onload = () => {
      canvas.width = img.width || 500;
      canvas.height = img.height || 500;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // If already in PiP, this will seamlessly update the floating window!
    };
  }, [currentTrack]);

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

  // Deep diagnostic logging whenever track changes, AND Media Session update
  useEffect(() => {
    if (currentTrack) {
      // Setup Media Session API for OS integration
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: 'Harmonysic',
          artwork: [
            { src: currentTrack.albumUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: currentTrack.albumUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: currentTrack.albumUrl, sizes: '192x192', type: 'image/jpeg' },
            { src: currentTrack.albumUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: currentTrack.albumUrl, sizes: '384x384', type: 'image/jpeg' },
            { src: currentTrack.albumUrl, sizes: '512x512', type: 'image/jpeg' },
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          togglePlayPause();
          if (ytPlayerRef.current && playerReady) ytPlayerRef.current.playVideo();
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          togglePlayPause();
          if (ytPlayerRef.current && playerReady) ytPlayerRef.current.pauseVideo();
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime && ytPlayerRef.current && playerReady) {
            ytPlayerRef.current.seekTo(details.seekTime, true);
            setProgress(details.seekTime);
          }
        });
      }

      // Extract Dynamic Color
      if (currentTrack.albumUrl) {
        const fac = new FastAverageColor();
        fac.getColorAsync(currentTrack.albumUrl, { crossOrigin: 'anonymous' })
          .then(color => {
            document.documentElement.style.setProperty('--dynamic-theme-color', color.hex);
            document.documentElement.style.setProperty('--dynamic-theme-color-dark', color.hex + '40');
          })
          .catch(e => {
            console.warn('Failed to extract color:', e);
            document.documentElement.style.removeProperty('--dynamic-theme-color');
            document.documentElement.style.removeProperty('--dynamic-theme-color-dark');
          });
      }
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!ytPlayerRef.current || !currentTrack || !playerReady) return;
    const newTime = parseFloat(e.target.value);
    
    try {
      ytPlayerRef.current.seekTo(newTime, true);
      setProgress(newTime);
    } catch (e) {
      console.warn('Failed to seek', e);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
  };

  const progressPercent = currentTrack && currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;
  
  const [initialVideoId] = useState('dQw4w9WgXcQ');

  const onReady = (event: any) => {
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
    if (event.data === 1) {
      setIsPlaying(true);
      const duration = event.target.getDuration();
      setCurrentTrackDuration(duration);
    }
    if (event.data === 2) {
      setIsPlaying(false);
    }
    if (event.data === 0) {
      playNext();
    }
  };

  const onError = (event: any) => {
    setIsPlaying(false);
    playNext();
  };

  useEffect(() => {
    if (playerReady && ytPlayerRef.current) {
      try {
        const iframe = ytPlayerRef.current.getIframe();
        if (!iframe || !document.body.contains(iframe)) return;

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

  useEffect(() => {
    if (playerReady && ytPlayerRef.current && currentTrack) {
      try {
        ytPlayerRef.current.loadVideoById(currentTrack.id);
        if (isPlaying) {
          ytPlayerRef.current.playVideo();
        }
      } catch (e) {
        console.warn('Failed to sync track', e);
      }
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          if (ytPlayerRef.current && playerReady) {
            if (!isPlaying) ytPlayerRef.current.playVideo();
            else ytPlayerRef.current.pauseVideo();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          playNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          playPrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, playerReady, togglePlayPause, playNext, playPrevious]);

  const handlePlayPauseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePlayPause();
    
    if (ytPlayerRef.current && playerReady) {
      try {
        if (!isPlaying) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      } catch (err) {
        console.error('Direct click API failed:', err);
      }
    }
  };

  return (
    <>
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

      {(currentTrack || remoteSession) && (() => {
        const displayTrack = currentTrack || remoteSession;
        return (
        <div className="music-player" onClick={handlePlayerClick} style={{ position: 'relative' }}>
          
          {remoteSession && !currentTrack && (
            <div style={{ position: 'absolute', top: '-40px', left: 0, right: 0, background: 'var(--color-primary)', color: 'black', padding: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', zIndex: 10 }}>
              Listening on another device
              <button 
                onClick={(e) => { e.stopPropagation(); handleTakeover(); }}
                style={{ background: 'black', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Listen Here
              </button>
            </div>
          )}

          {remoteSession && currentTrack && !isPlaying && (
            <div style={{ position: 'absolute', top: '-40px', left: 0, right: 0, background: 'var(--color-primary)', color: 'black', padding: '8px', textAlign: 'center', fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', zIndex: 10 }}>
              Playback paused because you started listening on another device.
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                style={{ background: 'black', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Take Over
              </button>
            </div>
          )}

          <div className="player-left">
            <img src={displayTrack.albumUrl} alt={displayTrack.title} className="player-artwork" />
            <div className="player-track-info">
              <span className="player-title">{displayTrack.title}</span>
              <span className="player-artist">{displayTrack.artist}</span>
            </div>
            {currentTrack && (
              <button 
                className="player-control-btn" 
                style={{ marginLeft: 'var(--spacing-2)', color: isCurrentTrackLiked ? 'var(--color-primary)' : 'inherit' }}
                onClick={(e) => { e.stopPropagation(); toggleLikeSong(currentTrack); }}
              >
                <Heart size={16} fill={isCurrentTrackLiked ? "currentColor" : "none"} />
              </button>
            )}
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
              <div className="player-progress-wrapper">
                <input 
                  type="range" 
                  min="0" 
                  max={currentTrack.duration || 100} 
                  value={progress} 
                  onChange={handleSeek}
                  className="player-progress-slider"
                  style={{ '--progress': `${progressPercent}%` } as any}
                />
              </div>
              <span className="player-time">{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="player-right" onClick={(e) => e.stopPropagation()}>
            <button 
              className="player-control-btn" 
              onClick={() => setLyricsOpen(!isLyricsOpen)}
              style={{ color: isLyricsOpen ? 'var(--color-primary)' : 'inherit' }}
              title="Lyrics"
            >
              <Mic2 size={16} />
            </button>
            <button 
              className="player-control-btn" 
              onClick={startPiP}
              title="Picture-in-Picture"
            >
              <PictureInPicture size={16} />
            </button>
            <button 
              className="player-control-btn" 
              onClick={() => setRightSidebarOpen(!isRightSidebarOpen)}
              style={{ color: isRightSidebarOpen ? 'var(--color-primary)' : 'inherit' }}
              title="Queue"
            >
              <PlaySquare size={16} />
            </button>
            <button className="player-control-btn"><Volume2 size={20} /></button>
            <div className="volume-wrapper">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume} 
                onChange={handleVolumeChange}
                className="volume-slider"
                style={{ '--volume': `${volume * 100}%` } as any}
              />
            </div>
          </div>

          <div className="mobile-player-controls" onClick={(e) => e.stopPropagation()}>
            {currentTrack && (
              <button 
                className="player-control-btn"
                onClick={(e) => { e.stopPropagation(); toggleLikeSong(currentTrack); }}
                style={{ color: isCurrentTrackLiked ? 'var(--color-primary)' : 'inherit' }}
              >
                <Heart size={20} fill={isCurrentTrackLiked ? "currentColor" : "none"} />
              </button>
            )}
            <button className="player-play-btn" onClick={handlePlayPauseClick} style={{ backgroundColor: 'transparent', color: 'var(--color-text-primary)' }}>
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
          </div>
        </div>
        );
      })()}
      <canvas ref={pipCanvasRef} style={{ display: 'none' }} />
      <video ref={pipVideoRef} muted playsInline style={{ display: 'none' }} />
    </>
  );
};

export default MusicPlayer;

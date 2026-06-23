"use client";
import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause, SkipBack, SkipForward, Maximize2, Mic2, Heart, Radio } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { FastAverageColor } from 'fast-average-color';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import './MusicPlayer.css';

const MusicPlayer: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlayPause, setIsPlaying, setFullScreen, 
    progress, setProgress, volume, setVolume,
    playNext, playPrevious,
    setCurrentTrackDuration, setYoutubePlayer,
    isRightSidebarOpen, setRightSidebarOpen,
    isLyricsOpen, setLyricsOpen,
    likedSongs, toggleLikeSong,
    isRadioMode, toggleRadioMode
  } = usePlayerStore();
  
  const isOnline = useNetworkStatus();
  
  const { user } = useAuthStore();
  const ytPlayerRef = useRef<any>(null);
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
    
    if (!isOnline && !isPlaying) {
      alert("Playback is not available offline.");
      return;
    }

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = Number(e.target.value);
    if (ytPlayerRef.current && playerReady) {
      ytPlayerRef.current.seekTo(newTime, true);
      setProgress(newTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
        <div className="music-player">
          
          {remoteSession && !currentTrack && (
            <div className="remote-session-banner">
              Listening elsewhere
              <button 
                onClick={(e) => { e.stopPropagation(); handleTakeover(); }}
                style={{ background: 'black', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Listen Here
              </button>
            </div>
          )}

          {remoteSession && currentTrack && !isPlaying && (
            <div className="remote-session-banner">
              Paused (Playing elsewhere)
              <button 
                onClick={(e) => { e.stopPropagation(); setIsPlaying(true); }}
                style={{ background: 'black', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Take Over
              </button>
            </div>
          )}

          <div className="player-vinyl-container" onClick={() => setFullScreen(true)}>
            <svg className="progress-ring" viewBox="0 0 70 70">
              <circle className="progress-ring-circle-bg" cx="35" cy="35" r="32"></circle>
              <circle 
                className="progress-ring-circle" 
                cx="35" cy="35" r="32" 
                style={{'--progress': progressPercent} as React.CSSProperties}
              ></circle>
            </svg>
            <img 
              src={displayTrack.albumUrl} 
              alt={displayTrack.title} 
              className={`player-artwork-vinyl ${isPlaying ? '' : 'paused'}`} 
            />
          </div>

          <div className="player-expanded-content">
            <div className="player-track-info" onClick={() => setFullScreen(true)}>
              <span className="player-title">{displayTrack.title}</span>
              <span className="player-artist">{displayTrack.artist}</span>
            </div>
            
            <div className="player-controls-wrapper">
              <div className="player-controls">
                <button className="player-control-btn" onClick={(e) => { e.stopPropagation(); playPrevious(); }}>
                  <SkipBack size={18} fill="currentColor" />
                </button>
                
                <button className="player-play-btn" onClick={handlePlayPauseClick}>
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
                </button>
                
                <button className="player-control-btn" onClick={(e) => { e.stopPropagation(); playNext(); }}>
                  <SkipForward size={18} fill="currentColor" />
                </button>

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}></div>

                <button 
                  className="player-control-btn" 
                  onClick={(e) => { e.stopPropagation(); toggleRadioMode(); }}
                  style={{ color: isRadioMode ? 'var(--color-primary)' : 'inherit', position: 'relative' }}
                  title="Infinite Radio Mode"
                >
                  <Radio size={18} />
                  {isRadioMode && <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                </button>

                <button 
                  className="player-control-btn" 
                  onClick={(e) => { e.stopPropagation(); toggleLikeSong(displayTrack); }}
                  style={{ color: likedSongs.some(s => s.id === displayTrack.id) ? 'var(--color-primary)' : 'inherit' }}
                >
                  <Heart size={18} fill={likedSongs.some(s => s.id === displayTrack.id) ? "currentColor" : "none"} />
                </button>

                <button 
                  className="player-control-btn" 
                  onClick={(e) => { e.stopPropagation(); setLyricsOpen(!isLyricsOpen); }}
                  style={{ color: isLyricsOpen ? 'var(--color-primary)' : 'inherit' }}
                >
                  <Mic2 size={18} />
                </button>
                
                <button 
                  className="player-control-btn" 
                  onClick={(e) => { e.stopPropagation(); setRightSidebarOpen(!isRightSidebarOpen); }}
                  style={{ color: isRightSidebarOpen ? 'var(--color-primary)' : 'inherit' }}
                >
                  <Maximize2 size={18} />
                </button>
              </div>
              <div className="mini-progress-container" onClick={e => e.stopPropagation()}>
                <span className="mini-time">{formatTime(progress)}</span>
                <input 
                  type="range" 
                  min="0" 
                  max={displayTrack.duration || 100} 
                  value={progress} 
                  onChange={handleSeek}
                  className="mini-seek-bar"
                  style={{ background: `linear-gradient(to right, var(--color-primary) ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)` }}
                />
                <span className="mini-time">{formatTime(displayTrack.duration)}</span>
              </div>
            </div>
          </div>

        </div>
        );
      })()}
    </>
  );
};

export default MusicPlayer;

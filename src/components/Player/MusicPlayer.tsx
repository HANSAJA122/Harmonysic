"use client";
import React, { useEffect, useRef, useState } from 'react';
import YouTubePlayer from 'youtube-player';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import './MusicPlayer.css';

const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, setIsPlaying, setFullScreen, progress, setProgress, volume } = usePlayerStore();
  const playerRef = useRef<ReturnType<typeof YouTubePlayer> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize YouTube Player
  useEffect(() => {
    if (containerRef.current && !playerRef.current) {
      playerRef.current = YouTubePlayer(containerRef.current, {
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0
        }
      });
      
      playerRef.current.on('ready', () => {
        setIsReady(true);
        if (playerRef.current) playerRef.current.setVolume(volume * 100);
      });

      playerRef.current.on('stateChange', (event) => {
        // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
        if (event.data === 1) {
          setIsPlaying(true);
        } else if (event.data === 2) {
          setIsPlaying(false);
        } else if (event.data === 0) {
          setIsPlaying(false);
          setProgress(0);
        }
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Sync track loading and playing
  useEffect(() => {
    if (playerRef.current && currentTrack && isReady) {
      playerRef.current.loadVideoById(currentTrack.id).then(() => {
        if (isPlaying) {
          playerRef.current?.playVideo();
        } else {
          playerRef.current?.pauseVideo();
        }
      });
    }
  }, [currentTrack, isReady]);

  // Sync play/pause from Zustand -> YouTube
  useEffect(() => {
    if (playerRef.current && isReady) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying, isReady]);

  // Sync volume
  useEffect(() => {
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume, isReady]);

  // Progress update interval
  useEffect(() => {
    let interval: number;
    if (isPlaying && currentTrack && isReady) {
      interval = window.setInterval(async () => {
        if (playerRef.current) {
          const time = await playerRef.current.getCurrentTime();
          setProgress(time);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, isReady, setProgress]);

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

  const handleSeek = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !currentTrack) return;
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * currentTrack.duration;
    await playerRef.current.seekTo(newTime, true);
    setProgress(newTime);
  };

  if (!currentTrack) return null;

  const progressPercent = (progress / currentTrack.duration) * 100;

  return (
    <div className="music-player" onClick={handlePlayerClick}>
      {/* Hidden YouTube Iframe Container */}
      <div style={{ display: 'none' }} ref={containerRef}></div>

      <div className="player-left">
        <img src={currentTrack.albumUrl} alt={currentTrack.title} className="player-artwork" />
        <div className="player-track-info">
          <span className="player-title">{currentTrack.title}</span>
          <span className="player-artist">{currentTrack.artist}</span>
        </div>
        <button className="player-control-btn" style={{ marginLeft: 'var(--spacing-2)' }}>
          <Heart size={16} />
        </button>
      </div>

      <div className="player-center" onClick={(e) => e.stopPropagation()}>
        <div className="player-controls">
          <button className="player-control-btn"><Shuffle size={16} /></button>
          <button className="player-control-btn"><SkipBack size={20} fill="currentColor" /></button>
          <button className="player-play-btn" onClick={togglePlayPause}>
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" style={{ marginLeft: '2px' }} />}
          </button>
          <button className="player-control-btn"><SkipForward size={20} fill="currentColor" /></button>
          <button className="player-control-btn"><Repeat size={16} /></button>
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
        <button className="player-control-btn"><Volume2 size={20} /></button>
        <div className="volume-bar">
          <div className="volume-fill" style={{ width: `${volume * 100}%` }}></div>
        </div>
      </div>

      <div className="mobile-player-controls" onClick={(e) => e.stopPropagation()}>
        <button className="player-control-btn"><Heart size={20} /></button>
        <button className="player-play-btn" onClick={togglePlayPause} style={{ backgroundColor: 'transparent', color: 'var(--color-text-primary)' }}>
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;

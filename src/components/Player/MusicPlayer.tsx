"use client";
import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import './MusicPlayer.css';

const MusicPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, setFullScreen, progress, incrementProgress } = usePlayerStore();
  
  // Mock progress simulation
  useEffect(() => {
    let interval: number;
    if (isPlaying && currentTrack) {
      interval = window.setInterval(() => {
        incrementProgress();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, incrementProgress]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePlayerClick = () => {
    // Open full screen player on mobile when clicking the mini player
    if (window.innerWidth < 768) {
      setFullScreen(true);
    }
  };

  if (!currentTrack) return null;

  const progressPercent = (progress / currentTrack.duration) * 100;

  return (
    <div className="music-player" onClick={handlePlayerClick}>
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
          <div className="player-progress-bar">
            <div className="player-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span className="player-time">{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      <div className="player-right" onClick={(e) => e.stopPropagation()}>
        <button className="player-control-btn"><Volume2 size={20} /></button>
        <div className="volume-bar">
          <div className="volume-fill"></div>
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

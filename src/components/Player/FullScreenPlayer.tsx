"use client";
import React from 'react';
import { ChevronDown, MoreHorizontal, Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, MonitorSpeaker, ListMusic } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import './FullScreenPlayer.css';

const FullScreenPlayer: React.FC = () => {
  const { currentTrack, isPlaying, togglePlayPause, setFullScreen, progress } = usePlayerStore();

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = (progress / currentTrack.duration) * 100;

  return (
    <div className="fullscreen-player animate-slide-up">
      <div className="fs-header">
        <button onClick={() => setFullScreen(false)} className="player-control-btn">
          <ChevronDown size={28} />
        </button>
        <div className="fs-header-title">Playing from playlist</div>
        <button className="player-control-btn">
          <MoreHorizontal size={24} />
        </button>
      </div>

      <div className="fs-artwork-container">
        <img src={currentTrack.albumUrl} alt={currentTrack.title} className="fs-artwork" />
      </div>

      <div className="fs-track-info">
        <div>
          <div className="fs-title">{currentTrack.title}</div>
          <div className="fs-artist">{currentTrack.artist}</div>
        </div>
        <button className="player-control-btn">
          <Heart size={24} />
        </button>
      </div>

      <div className="fs-progress">
        <div className="fs-progress-bar">
          <div className="fs-progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="fs-time-labels">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      <div className="fs-controls">
        <button className="player-control-btn"><Shuffle size={24} /></button>
        <button className="player-control-btn"><SkipBack size={36} fill="currentColor" /></button>
        <button className="fs-play-btn" onClick={togglePlayPause}>
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '4px' }} />}
        </button>
        <button className="player-control-btn"><SkipForward size={36} fill="currentColor" /></button>
        <button className="player-control-btn"><Repeat size={24} /></button>
      </div>

      <div className="fs-bottom-actions">
        <button className="player-control-btn"><MonitorSpeaker size={20} /></button>
        <button className="player-control-btn"><ListMusic size={20} /></button>
      </div>
    </div>
  );
};

export default FullScreenPlayer;

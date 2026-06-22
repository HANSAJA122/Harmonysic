"use client";
import React from 'react';
import { ChevronDown, MoreHorizontal, Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, MonitorSpeaker, ListMusic, Mic2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import AddToPlaylistModal from '../UI/AddToPlaylistModal';
import { LyricsView } from './LyricsView';
import './FullScreenPlayer.css';

const FullScreenPlayer: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlayPause, setFullScreen, progress, isFullScreen,
    playNext, playPrevious, isShuffle, isRepeat, toggleShuffle, toggleRepeat,
    likedSongs, toggleLikeSong, isLyricsOpen, setLyricsOpen
  } = usePlayerStore();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  if (!currentTrack || !isFullScreen) return null;

  const isLiked = likedSongs.some(s => s.id === currentTrack.id);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = currentTrack.duration > 0 ? (progress / currentTrack.duration) * 100 : 0;

  return (
    <div className="fullscreen-player animate-slide-up">
      <div className="fs-content-wrapper">
        <div className="fs-header">
          <button onClick={() => setFullScreen(false)} className="player-control-btn">
            <ChevronDown size={32} color="var(--color-text-primary)" />
          </button>
          <div className="fs-header-title">Now Playing</div>
          <button className="player-control-btn" onClick={() => setIsAddModalOpen(true)}>
            <MoreHorizontal size={28} />
          </button>
        </div>

        {isLyricsOpen ? (
          <div className="fs-lyrics-container">
            <LyricsView />
          </div>
        ) : (
          <>
            <div className="fs-artwork-container">
              <img src={currentTrack.albumUrl} alt={currentTrack.title} className="fs-artwork" />
            </div>

            <div className="fs-track-info">
              <div>
                <div className="fs-title">{currentTrack.title}</div>
                <div className="fs-artist">{currentTrack.artist}</div>
              </div>
              <button 
                className="player-control-btn" 
                onClick={() => toggleLikeSong(currentTrack)}
                style={{ color: isLiked ? 'var(--color-primary)' : 'inherit' }}
              >
                <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
              </button>
            </div>
          </>
        )}

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
          <button className="player-control-btn" onClick={toggleShuffle} style={{ color: isShuffle ? 'var(--color-primary)' : 'inherit' }}>
            <Shuffle size={24} />
          </button>
          <button className="player-control-btn" onClick={playPrevious}>
            <SkipBack size={40} fill="currentColor" color="var(--color-text-primary)" />
          </button>
          <button className="fs-play-btn" onClick={togglePlayPause}>
            {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" style={{ marginLeft: '4px' }} />}
          </button>
          <button className="player-control-btn" onClick={playNext}>
            <SkipForward size={40} fill="currentColor" color="var(--color-text-primary)" />
          </button>
          <button className="player-control-btn" onClick={toggleRepeat} style={{ color: isRepeat ? 'var(--color-primary)' : 'inherit' }}>
            <Repeat size={24} />
          </button>
        </div>

        <div className="fs-bottom-actions">
          <button className="player-control-btn"><MonitorSpeaker size={24} /></button>
          <button 
            className="player-control-btn" 
            onClick={() => setLyricsOpen(!isLyricsOpen)}
            style={{ color: isLyricsOpen ? 'var(--color-primary)' : 'inherit' }}
          >
            <Mic2 size={24} />
          </button>
          <button className="player-control-btn"><ListMusic size={24} /></button>
        </div>
      </div>

      <AddToPlaylistModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        track={currentTrack} 
      />
    </div>
  );
};

export default FullScreenPlayer;

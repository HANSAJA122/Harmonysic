"use client";
import React from 'react';
import { ChevronDown, MoreHorizontal, Heart, Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, MonitorSpeaker, ListMusic, Mic2, Radio, Wand2 } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import AddToPlaylistModal from '../UI/AddToPlaylistModal';
import { LyricsView } from './LyricsView';
import ChameleonBackground from './ChameleonBackground';
import './FullScreenPlayer.css';

const FullScreenPlayer: React.FC = () => {
  const { 
    currentTrack, isPlaying, togglePlayPause, setFullScreen, progress, isFullScreen,
    playNext, playPrevious, isShuffle, isRepeat, toggleShuffle, toggleRepeat,
    likedSongs, toggleLikeSong, isLyricsOpen, setLyricsOpen,
    isRadioMode, toggleRadioMode, chameleonMode, cycleChameleonMode,
    youtubePlayer, setProgress
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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newTime = Number(e.target.value);
    if (youtubePlayer) {
      youtubePlayer.seekTo(newTime, true);
      setProgress(newTime);
    }
  };

  return (
    <div className={`fullscreen-player ${isFullScreen ? 'open' : ''}`}>
      <ChameleonBackground />
      
      {/* Dynamic Background Image Layer */}
      {currentTrack.albumUrl && chameleonMode === 'none' && (
        <div 
          className="fs-bg-image" 
          style={{ backgroundImage: `url(${currentTrack.albumUrl})` }} 
        />
      )}

      <div className="fs-content-wrapper">
        <div className="fs-header">
          <button className="player-control-btn" onClick={() => setFullScreen(false)}>
            <ChevronDown size={32} />
          </button>
          <div className="fs-header-title">Now Playing</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="player-control-btn" onClick={cycleChameleonMode} title="Toggle Chameleon Mode" style={{ color: chameleonMode !== 'none' ? 'var(--color-primary)' : 'inherit' }}>
              <Wand2 size={24} />
            </button>
            <button className="player-control-btn" onClick={() => setIsAddModalOpen(true)}>
              <MoreHorizontal size={24} />
            </button>
          </div>
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
          <input 
            type="range" 
            min="0" 
            max={currentTrack.duration || 100} 
            value={progress} 
            onChange={handleSeek}
            className="fs-seek-bar"
            style={{ background: `linear-gradient(to right, var(--color-text-primary) ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)` }}
          />
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
          <button 
            className="player-control-btn" 
            onClick={toggleRadioMode}
            style={{ color: isRadioMode ? 'var(--color-primary)' : 'inherit' }}
          >
            <Radio size={24} />
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

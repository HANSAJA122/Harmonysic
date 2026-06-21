import React from 'react';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import type { Track } from '@/store/playerStore';
import { usePlayerStore } from '@/store/playerStore';
import AddToPlaylistModal from './AddToPlaylistModal';
import './Cards.css';

interface SongCardProps {
  track: Track;
  index?: number;
  onClick?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({ track, index, onClick }) => {
  const { setCurrentTrack, currentTrack, isPlaying, setIsPlaying, youtubePlayer, likedSongs, toggleLikeSong } = usePlayerStore();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const isLiked = likedSongs.some(s => s.id === track.id);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      if (youtubePlayer) {
        try {
          console.log('[Direct Click] loadVideoById & playVideo on existing player');
          youtubePlayer.loadVideoById(track.id);
          youtubePlayer.playVideo();
        } catch (e) {
          console.error('Failed direct load/play', e);
        }
      }
    }
  };

  const isCurrentTrack = currentTrack?.id === track.id;

  return (
    <div className="song-card" onClick={handleClick}>
      {index !== undefined && (
        <div style={{ width: '24px', textAlign: 'center', color: isCurrentTrack ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
          {isCurrentTrack && isPlaying ? (
            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2fd4.gif" alt="playing" width="14" height="14" />
          ) : (
            index + 1
          )}
        </div>
      )}
      <div className="song-artwork-container">
        <img src={track.albumUrl} alt={track.title} className="song-artwork" />
        <div className="song-play-overlay">
          <Play size={20} fill="currentColor" />
        </div>
      </div>
      <div className="song-info">
        <div className="song-title" style={{ color: isCurrentTrack ? 'var(--color-primary)' : 'inherit' }}>
          {track.title}
        </div>
        <div className="song-artist">{track.artist}</div>
      </div>
      <div className="song-actions" onClick={(e) => e.stopPropagation()}>
        <button 
          className="song-action-btn"
          onClick={() => toggleLikeSong(track)}
          style={{ color: isLiked ? 'var(--color-primary)' : 'inherit' }}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
        </button>
        <button className="song-action-btn" onClick={() => setIsAddModalOpen(true)}>
          <MoreHorizontal size={20} />
        </button>
      </div>

      <AddToPlaylistModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        track={track} 
      />
    </div>
  );
};

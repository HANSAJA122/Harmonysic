import React from 'react';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import type { Track } from '@/store/playerStore';
import { usePlayerStore } from '@/store/playerStore';
import './Cards.css';

interface SongCardProps {
  track: Track;
  index?: number;
}

export const SongCard: React.FC<SongCardProps> = ({ track, index }) => {
  const { setCurrentTrack, currentTrack, isPlaying } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === track.id;

  return (
    <div className="song-card" onClick={() => setCurrentTrack(track)}>
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
        <button className="song-action-btn"><Heart size={20} /></button>
        <button className="song-action-btn"><MoreHorizontal size={20} /></button>
      </div>
    </div>
  );
};

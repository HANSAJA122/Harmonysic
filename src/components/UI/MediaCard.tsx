import React from 'react';
import { Play, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import './Cards.css';

export interface MediaItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  type: 'playlist' | 'album' | 'artist';
}

interface MediaCardProps {
  item: MediaItem;
  onClick?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const { savedPlaylists, toggleSavePlaylist } = usePlayerStore();
  const isSaved = savedPlaylists.some(p => p.id === item.id);

  return (
    <div className={`media-card ${item.type}`} onClick={onClick}>
      <div className="media-artwork-container">
        <img src={item.imageUrl} alt={item.title} className="media-artwork" />
        {item.type !== 'artist' && (
          <>
            <button className="media-play-btn" onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}>
              <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
            </button>
            <button 
              className="media-like-btn" 
              onClick={(e) => {
                e.stopPropagation();
                toggleSavePlaylist(item);
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSaved ? 'var(--color-primary)' : 'white',
                cursor: 'pointer',
                opacity: isSaved ? 1 : 0,
                transition: 'all 0.2s ease',
              }}
            >
              <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
            </button>
          </>
        )}
      </div>
      <div className="media-title">{item.title}</div>
      <div className="media-subtitle line-clamp-2">{item.subtitle}</div>
    </div>
  );
};

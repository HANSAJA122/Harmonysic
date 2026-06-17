import React from 'react';
import { Play } from 'lucide-react';
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
  return (
    <div className={`media-card ${item.type}`} onClick={onClick}>
      <div className="media-artwork-container">
        <img src={item.imageUrl} alt={item.title} className="media-artwork" />
        {item.type !== 'artist' && (
          <button className="media-play-btn" onClick={(e) => {
            e.stopPropagation();
            // In a real app, this would play the context
          }}>
            <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
          </button>
        )}
      </div>
      <div className="media-title">{item.title}</div>
      <div className="media-subtitle line-clamp-2">{item.subtitle}</div>
    </div>
  );
};

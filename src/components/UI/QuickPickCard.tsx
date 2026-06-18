import React from 'react';
import './Cards.css';

interface QuickPickCardProps {
  title: string;
  imageUrl: string;
  onClick?: () => void;
}

export const QuickPickCard: React.FC<QuickPickCardProps> = ({ title, imageUrl, onClick }) => {
  return (
    <div className="quick-pick-card" onClick={onClick}>
      <img src={imageUrl} alt={title} className="quick-pick-img" />
      <div className="quick-pick-title">{title}</div>
      <div className="quick-pick-play-btn" onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}>
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" style={{ marginLeft: '4px' }}>
          <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
        </svg>
      </div>
    </div>
  );
};

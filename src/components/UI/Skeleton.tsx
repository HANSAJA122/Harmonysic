import React from 'react';
import './Skeleton.css';

export const SkeletonTrack = () => {
  return (
    <div className="skeleton-track">
      <div className="skeleton-art skeleton-pulse"></div>
      <div className="skeleton-info">
        <div className="skeleton-title skeleton-pulse"></div>
        <div className="skeleton-artist skeleton-pulse"></div>
      </div>
      <div className="skeleton-duration skeleton-pulse"></div>
    </div>
  );
};

export const SkeletonPlaylist = () => {
  return (
    <div className="skeleton-playlist">
      <div className="skeleton-playlist-art skeleton-pulse"></div>
      <div className="skeleton-playlist-title skeleton-pulse"></div>
      <div className="skeleton-playlist-subtitle skeleton-pulse"></div>
    </div>
  );
};

"use client";

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { X, MoreHorizontal } from 'lucide-react';
import './RightSidebar.css';

const RightSidebar: React.FC = () => {
  const { currentTrack, isRightSidebarOpen, setRightSidebarOpen } = usePlayerStore();

  if (!currentTrack || !isRightSidebarOpen) return null;

  return (
    <aside className="right-sidebar">
      <div className="right-sidebar-header">
        <span style={{ fontWeight: 700 }}>Now Playing</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="icon-btn"><MoreHorizontal size={20} /></button>
          <button className="icon-btn" onClick={() => setRightSidebarOpen(false)}><X size={20} /></button>
        </div>
      </div>
      
      <div className="right-sidebar-artwork-container">
        <img src={currentTrack.albumUrl} alt={currentTrack.title} className="right-sidebar-artwork" />
      </div>

      <div className="right-sidebar-info">
        <div className="right-sidebar-title">{currentTrack.title}</div>
        <div className="right-sidebar-artist">{currentTrack.artist}</div>
      </div>

      <div className="right-sidebar-card">
        <div className="right-sidebar-card-header">
          <span style={{ fontWeight: 700 }}>Credits</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Show all</span>
        </div>
        <div className="right-sidebar-credit">
          <span className="credit-name">{currentTrack.artist}</span>
          <span className="credit-role">Main Artist</span>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;

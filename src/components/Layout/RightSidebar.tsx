"use client";

import React, { useState } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { X, MoreHorizontal, Play } from 'lucide-react';
import './RightSidebar.css';

const RightSidebar: React.FC = () => {
  const { currentTrack, queue, currentIndex, isRightSidebarOpen, setRightSidebarOpen, setQueue } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'now-playing' | 'queue'>('queue');

  if (!currentTrack || !isRightSidebarOpen) return null;

  const upNextTracks = queue.slice(currentIndex + 1);

  return (
    <aside className="right-sidebar">
      <div className="right-sidebar-header">
        <div className="right-sidebar-tabs">
          <button 
            className={`sidebar-tab ${activeTab === 'now-playing' ? 'active' : ''}`}
            onClick={() => setActiveTab('now-playing')}
          >
            Now Playing
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Queue
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="icon-btn" onClick={() => setRightSidebarOpen(false)}><X size={20} /></button>
        </div>
      </div>
      
      {activeTab === 'now-playing' ? (
        <div className="now-playing-content">
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
        </div>
      ) : (
        <div className="queue-content">
          <h3 className="queue-section-title">Now Playing</h3>
          <div className="queue-item active">
            <img src={currentTrack.albumUrl} alt={currentTrack.title} className="queue-item-img" />
            <div className="queue-item-info">
              <div className="queue-item-title">{currentTrack.title}</div>
              <div className="queue-item-artist">{currentTrack.artist}</div>
            </div>
            <div className="queue-item-playing-icon">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>

          {upNextTracks.length > 0 && (
            <>
              <h3 className="queue-section-title" style={{ marginTop: '24px' }}>Up Next</h3>
              <div className="queue-list">
                {upNextTracks.map((track, i) => {
                  const absoluteIndex = currentIndex + 1 + i;
                  return (
                    <div 
                      key={`${track.id}-${i}`} 
                      className="queue-item"
                      onClick={() => setQueue(queue, absoluteIndex)}
                    >
                      <img src={track.albumUrl} alt={track.title} className="queue-item-img" />
                      <div className="queue-item-info">
                        <div className="queue-item-title">{track.title}</div>
                        <div className="queue-item-artist">{track.artist}</div>
                      </div>
                      <div className="queue-item-action">
                        <Play size={16} fill="currentColor" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;

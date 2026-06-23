"use client";

import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { X, Play, GripVertical, Users } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { ArtistInsights } from '../Sidebar/ArtistInsights';
import './RightSidebar.css';

const RightSidebar: React.FC = () => {
  const { currentTrack, queue, currentIndex, isRightSidebarOpen, setRightSidebarOpen, setQueue, reorderQueue } = usePlayerStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'now-playing' | 'queue' | 'friends'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  
  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    // Listen to all users in the DB
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach(doc => {
        if (doc.id !== user?.uid) {
           usersData.push({ id: doc.id, ...doc.data() });
        }
      });
      setFriends(usersData);
    }, (error) => {
      console.error("Error fetching friends:", error);
    });
    return () => unsubscribe();
  }, [user]);

  if (!isRightSidebarOpen) return null;

  const upNextTracks = queue.slice(currentIndex + 1);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from immediately hiding if we do styling
    setTimeout(() => {
      const el = e.target as HTMLElement;
      if (el) el.classList.add('dragging');
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverIndex(null);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    const el = e.target as HTMLElement;
    if (el) el.classList.remove('dragging');
  };

  const handleDrop = (e: React.DragEvent, dropTargetIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropTargetIndex) {
      // Map local upNext index to global queue index
      const globalFrom = currentIndex + 1 + draggedIndex;
      const globalTo = currentIndex + 1 + dropTargetIndex;
      reorderQueue(globalFrom, globalTo);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <aside className="right-sidebar">
      <div className="right-sidebar-header">
        <div className="right-sidebar-tabs">
          <button 
            className={`sidebar-tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Friends
          </button>
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
      
      {activeTab === 'friends' ? (
        <div className="friends-content" style={{ padding: '0 16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
             <Users size={16} />
             <span style={{ fontSize: '14px', fontWeight: 600 }}>Friend Activity</span>
          </div>
          {friends.length === 0 && (
             <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
               No friends found. Invite some people to join!
             </div>
          )}
          {friends.map(friend => (
            <div 
              key={friend.id} 
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onClick={() => router.push(`/profile/${friend.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <div style={{ position: 'relative' }}>
                <img src={friend.photoURL || `https://ui-avatars.com/api/?name=${friend.displayName || 'User'}&background=random`} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                {friend.currentlyPlaying?.isPlaying && (
                   <div style={{ position: 'absolute', bottom: -2, right: -2, width: '14px', height: '14px', background: 'var(--color-primary)', borderRadius: '50%', border: '2px solid var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <div style={{ width: '4px', height: '4px', background: 'black', borderRadius: '50%' }}></div>
                   </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', color: 'white', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); router.push(`/profile/${friend.id}`); }}>
                  {friend.displayName || 'Anonymous User'}
                </div>
                {friend.currentlyPlaying ? (
                   <div>
                     <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                       {friend.currentlyPlaying.title}
                     </div>
                     <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                       🎵 {friend.currentlyPlaying.artist}
                     </div>
                   </div>
                ) : (
                   <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                     Not listening to anything
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'now-playing' && currentTrack ? (
        <div className="now-playing-content animate-fade-in">
          <div className="right-sidebar-artwork-container">
            <img src={currentTrack.albumUrl} alt={currentTrack.title} className="right-sidebar-artwork" />
          </div>

          <div className="right-sidebar-info">
            <div className="right-sidebar-title">{currentTrack.title}</div>
            <div className="right-sidebar-artist">{currentTrack.artist}</div>
          </div>

          <ArtistInsights artistName={currentTrack.artist} />
        </div>
      ) : activeTab === 'queue' && currentTrack ? (
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
                      className={`queue-item draggable-item ${dragOverIndex === i ? (draggedIndex! < i ? 'drop-below' : 'drop-above') : ''} ${draggedIndex === i ? 'is-dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragLeave={handleDragLeave}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, i)}
                      onDoubleClick={() => setQueue(queue, absoluteIndex)}
                    >
                      <div className="drag-handle">
                        <GripVertical size={16} color="var(--color-text-secondary)" />
                      </div>
                      <img src={track.albumUrl} alt={track.title} className="queue-item-img" />
                      <div className="queue-item-info">
                        <div className="queue-item-title">{track.title}</div>
                        <div className="queue-item-artist">{track.artist}</div>
                      </div>
                      <div className="queue-item-action" onClick={() => setQueue(queue, absoluteIndex)}>
                        <Play size={16} fill="currentColor" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
           Nothing playing right now.
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;

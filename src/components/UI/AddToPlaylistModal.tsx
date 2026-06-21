"use client";

import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { usePlayerStore, Track } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import CreatePlaylistModal from './CreatePlaylistModal';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ isOpen, onClose, track }) => {
  const { userPlaylists, addSongToPlaylist } = usePlayerStore();
  const { user, openLoginModal } = useAuthStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!isOpen || !track) return null;

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user) {
      onClose();
      openLoginModal();
      return;
    }
    await addSongToPlaylist(playlistId, track);
    onClose();
  };

  return (
    <>
      <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 9998 }}>
        <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', height: '60vh', display: 'flex', flexDirection: 'column' }}>
          <div className="modal-header" style={{ paddingBottom: '16px', borderBottom: '1px solid var(--color-surface-hover)' }}>
            <h2>Add to Playlist</h2>
            <button className="icon-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          
          <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px',
                textAlign: 'left'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                <Plus size={24} />
              </div>
              <span style={{ fontWeight: 600, fontSize: '16px' }}>New Playlist</span>
            </button>

            {userPlaylists.map(playlist => {
              const isAdded = playlist.tracks.some((t: any) => t.id === track.id);
              
              return (
                <button 
                  key={playlist.id}
                  onClick={() => !isAdded && handleAddToPlaylist(playlist.id)}
                  disabled={isAdded}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: isAdded ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
                    cursor: isAdded ? 'default' : 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    opacity: isAdded ? 0.5 : 1
                  }}
                  onMouseOver={e => { if(!isAdded) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)' }}
                  onMouseOut={e => { if(!isAdded) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden' }}>
                    {playlist.tracks.length > 0 && playlist.tracks[0].albumUrl ? (
                      <img src={playlist.tracks[0].albumUrl} alt={playlist.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Music size={24} color="var(--color-text-secondary)" />
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontSize: '16px' }}>{playlist.title}</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                      {playlist.tracks.length} songs {isAdded && '• Already added'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <CreatePlaylistModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  );
};

export default AddToPlaylistModal;

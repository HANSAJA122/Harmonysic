"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPlaylist } = usePlayerStore();
  const { user, openLoginModal } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onClose();
      openLoginModal();
      return;
    }
    
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    await createPlaylist(name.trim());
    setIsSubmitting(false);
    setName('');
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2>Create Playlist</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Playlist Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-surface-hover)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                fontSize: '16px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'transparent',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!name.trim() || isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary)',
                color: '#000',
                fontWeight: 600,
                cursor: !name.trim() || isSubmitting ? 'not-allowed' : 'pointer',
                opacity: !name.trim() || isSubmitting ? 0.5 : 1,
                border: 'none'
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;

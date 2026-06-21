"use client";

import React from 'react';
import { Settings, ChevronRight, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/lib/firebase';

const Profile: React.FC = () => {
  const { user, openLoginModal } = useAuthStore();

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-10) var(--spacing-4)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-8)' }}>
        <h1 className="text-2xl font-bold">Profile</h1>
        <button className="icon-btn"><Settings size={20} /></button>
      </header>

      {user ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--color-surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} className="text-secondary" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.displayName || 'Harmony User'}</h2>
              <p className="text-secondary text-sm">{user.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="font-bold text-xl">12</div>
              <div className="text-secondary text-xs uppercase tracking-wider">Playlists</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="font-bold text-xl">148</div>
              <div className="text-secondary text-xs uppercase tracking-wider">Followers</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div className="font-bold text-xl">256</div>
              <div className="text-secondary text-xs uppercase tracking-wider">Following</div>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            {['Account', 'Data Saver', 'Languages', 'Playback', 'Explicit Content', 'Devices', 'Car', 'Social'].map((item, i) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: i === 7 ? 'none' : '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }} className="hover-scale">
                <span className="font-medium">{item}</span>
                <ChevronRight size={20} className="text-secondary" />
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => auth.signOut()}
            style={{ width: '100%', padding: '16px', textAlign: 'center', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-6)', color: 'var(--color-text-primary)', fontWeight: 'bold' }}>
            Log out
          </button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-10) 0' }}>
          <User size={64} className="text-secondary" style={{ marginBottom: 'var(--spacing-4)' }} />
          <h2 className="text-xl font-bold mb-2">Log in to Harmony</h2>
          <p className="text-secondary text-center mb-6 max-w-sm">
            Save your favorite songs, build custom playlists, and sync across all your devices.
          </p>
          <button 
            onClick={openLoginModal}
            style={{ background: 'var(--color-primary)', color: '#000', padding: '12px 32px', borderRadius: 'var(--radius-full)', fontWeight: 'bold', fontSize: '1rem' }}
            className="hover-scale"
          >
            Log in
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

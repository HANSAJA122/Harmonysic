"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Search, Music } from 'lucide-react';
import { MediaCard } from '@/components/UI/MediaCard';
import { usePlayerStore } from '@/store/playerStore';
import CreatePlaylistModal from '@/components/UI/CreatePlaylistModal';
import Link from 'next/link';
import './Library.css';

const Library: React.FC = () => {
  const { likedSongs, userPlaylists } = usePlayerStore();
  const [activeTab, setActiveTab] = useState('Playlists');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const tabs = ['Playlists', 'Artists', 'Albums', 'Downloaded'];
  
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(data => {
        if (data.playlists) setPlaylists(data.playlists);
        if (data.artists) setArtists(data.artists);
      })
      .catch(err => console.error('Failed to load library data', err));
  }, []);

  return (
    <div className="library-page animate-fade-in">
      <header className="library-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
            H
          </div>
          <h1 className="text-2xl font-bold">Your Library</h1>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button className="icon-btn" style={{ background: 'transparent' }}><Search size={24} /></button>
          <button className="icon-btn" style={{ background: 'transparent' }} onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div className="library-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`library-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
        {activeTab === 'Playlists' && (
          <>
            {/* Liked Songs Special Card */}
            <Link href="/library/liked-songs" style={{ textDecoration: 'none' }}>
              <div className="media-card" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px' }}>
                  <h3 className="text-2xl font-bold mb-2 text-white">Liked Songs</h3>
                  <p className="text-sm text-white opacity-80">{likedSongs.length} songs</p>
                </div>
              </div>
            </Link>
            {/* User Created Playlists */}
            {userPlaylists.map(playlist => (
              <Link href={`/library/playlist/${playlist.id}`} key={playlist.id} style={{ textDecoration: 'none' }}>
                <div className="media-card" style={{ background: 'var(--color-surface-hover)' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', alignItems: 'center', justifyContent: 'center' }}>
                    {playlist.tracks.length > 0 && playlist.tracks[0].albumUrl ? (
                      <img src={playlist.tracks[0].albumUrl} alt={playlist.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }} />
                    ) : (
                      <div style={{ width: '100%', aspectRatio: '1/1', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Music size={48} color="var(--color-text-secondary)" />
                      </div>
                    )}
                    <h3 className="text-base font-bold mb-1 text-white text-center w-full truncate">{playlist.title}</h3>
                    <p className="text-sm text-secondary text-center">Playlist • {playlist.tracks.length} songs</p>
                  </div>
                </div>
              </Link>
            ))}

            {playlists.map(p => <MediaCard key={p.id} item={p} />)}
          </>
        )}
        {activeTab === 'Artists' && artists.map(a => <MediaCard key={a.id} item={a} />)}
        {activeTab === 'Albums' && <div className="text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No albums saved yet.</div>}
        {activeTab === 'Downloaded' && <div className="text-secondary" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>No downloaded content.</div>}
      </div>

      <CreatePlaylistModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Library;

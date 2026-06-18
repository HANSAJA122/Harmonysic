"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { likedSongs, savedPlaylists, setQueue } = usePlayerStore();

  const handlePlayLikedSongs = () => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs, 0);
    }
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link href="/library" className={`sidebar-nav-item ${pathname === '/library' ? 'active' : ''}`} style={{ padding: '0 8px', gap: '16px' }}>
          <Library size={24} />
          <span>Your Library</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <button className="icon-btn"><PlusSquare size={16} /></button>
        </div>
      </nav>

      <div className="sidebar-filters">
        <button className="filter-pill">Playlists</button>
        <button className="filter-pill">Artists</button>
        <button className="filter-pill">Albums</button>
      </div>

      <div className="sidebar-search-row">
        <button className="icon-btn" style={{ padding: 4 }}><Search size={16} /></button>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          Recents <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M15 14.5H1V13h14v1.5zm0-5.75H1v-1.5h14v1.5zM15 3H1V1.5h14V3z"></path></svg>
        </span>
      </div>
      
      {/* Real Library Data */}
      <div className="sidebar-library-list">
        <div className="library-item" onClick={handlePlayLikedSongs}>
          <div className="library-item-icon liked-songs-icon">
            <Heart size={16} fill="currentColor" />
          </div>
          <div className="library-item-info">
            <div className="library-item-title">Liked Songs</div>
            <div className="library-item-subtitle"><span style={{ color: 'var(--color-primary)' }}>★ Playlist</span> • {likedSongs.length} songs</div>
          </div>
        </div>

        {savedPlaylists.map((playlist) => (
          <div key={playlist.id} className="library-item">
            <img src={playlist.imageUrl} className="library-item-img" alt={playlist.title} />
            <div className="library-item-info">
              <div className="library-item-title">{playlist.title}</div>
              <div className="library-item-subtitle">Playlist • {playlist.subtitle || 'Saved'}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;

"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Library, PlusSquare, Heart, User, Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { likedSongs, savedPlaylists, userPlaylists, setQueue, createPlaylist } = usePlayerStore();

  const handlePlayLikedSongs = () => {
    if (likedSongs.length > 0) {
      setQueue(likedSongs, 0);
    }
  };

  const handleCreatePlaylist = async () => {
    const name = prompt("Enter playlist name:");
    if (name && name.trim().length > 0) {
      await createPlaylist(name.trim());
    }
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <Link href="/library" className={`sidebar-nav-item ${pathname === '/library' ? 'active' : ''}`} style={{ padding: '0 8px', gap: '16px' }}>
          <Library size={24} />
          <span>Your Library</span>
        </Link>
        <Link href="/profile" className={`sidebar-nav-item ${pathname === '/profile' ? 'active' : ''}`} style={{ padding: '0 8px', gap: '16px' }}>
          <User size={24} />
          <span>Profile</span>
        </Link>
        <Link href="/ai-playlist" className={`sidebar-nav-item ${pathname === '/ai-playlist' ? 'active' : ''}`} style={{ padding: '0 8px', gap: '16px', color: 'var(--color-primary)' }}>
          <Sparkles size={24} />
          <span>AI Playlist ✨</span>
        </Link>
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <button className="icon-btn" onClick={handleCreatePlaylist} title="Create Playlist"><PlusSquare size={16} /></button>
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

        {/* User Created Playlists */}
        {userPlaylists.map((playlist) => (
          <div 
            key={playlist.id} 
            className="library-item"
            onClick={() => router.push(`/playlist/${playlist.id}`)}
          >
            {playlist.imageUrl ? (
              <img src={playlist.imageUrl} className="library-item-img" alt={playlist.title} />
            ) : (
              <div className="library-item-icon" style={{ background: '#282828' }}>
                <span style={{ color: '#b3b3b3' }}>♪</span>
              </div>
            )}
            <div className="library-item-info">
              <div className="library-item-title">{playlist.title}</div>
              <div className="library-item-subtitle">Playlist • You</div>
            </div>
          </div>
        ))}

        {/* Saved YouTube Playlists */}
        {savedPlaylists.map((playlist) => (
          <div 
            key={playlist.id} 
            className="library-item"
            onClick={() => router.push(`/playlist/${playlist.id}`)}
          >
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

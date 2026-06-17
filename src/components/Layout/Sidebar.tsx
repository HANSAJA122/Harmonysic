"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div style={{ color: 'var(--color-primary)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        Harmony
      </div>

      <nav className="sidebar-nav">
        <Link href="/" className={`sidebar-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </Link>
        <Link href="/search" className={`sidebar-nav-item ${pathname === '/search' ? 'active' : ''}`}>
          <Search size={24} />
          <span>Search</span>
        </Link>
        <Link href="/library" className={`sidebar-nav-item ${pathname === '/library' ? 'active' : ''}`}>
          <Library size={24} />
          <span>Your Library</span>
        </Link>
      </nav>

      <div className="sidebar-nav" style={{ marginTop: 'var(--spacing-4)' }}>
        <button className="sidebar-nav-item" style={{ width: '100%' }}>
          <div className="flex-center" style={{ background: '#b3b3b3', color: '#000', width: 24, height: 24, borderRadius: 2 }}>
            <PlusSquare size={16} />
          </div>
          <span>Create Playlist</span>
        </button>
        <button className="sidebar-nav-item" style={{ width: '100%' }}>
          <div className="flex-center" style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)', color: '#fff', width: 24, height: 24, borderRadius: 2 }}>
            <Heart size={14} fill="currentColor" />
          </div>
          <span>Liked Songs</span>
        </button>
      </div>
      
      <div className="sidebar-divider"></div>
      
      {/* Mock Playlists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        <p className="hover-scale interactive-opacity" style={{ cursor: 'pointer' }}>Chill Vibes</p>
        <p className="hover-scale interactive-opacity" style={{ cursor: 'pointer' }}>Top Hits 2024</p>
        <p className="hover-scale interactive-opacity" style={{ cursor: 'pointer' }}>Focus Flow</p>
        <p className="hover-scale interactive-opacity" style={{ cursor: 'pointer' }}>Gym Power</p>
      </div>
    </aside>
  );
};

export default Sidebar;

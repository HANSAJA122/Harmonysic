"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Bell, Download, User } from 'lucide-react';
import './Topbar.css';

const Topbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo">
          <div style={{ color: 'var(--color-text-primary)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <Link href="/" className={`topbar-home-btn ${pathname === '/' ? 'active' : ''}`}>
          <Home size={24} fill={pathname === '/' ? 'currentColor' : 'none'} />
        </Link>
        <div className="topbar-search-container">
          <Search size={20} className="topbar-search-icon" />
          <input 
            type="text" 
            placeholder="What do you want to play?" 
            className="topbar-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchSubmit}
            onFocus={() => {
              if (pathname !== '/search') {
                router.push('/search');
              }
            }}
          />
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-install-btn">
          <Download size={16} />
          <span>Install App</span>
        </button>
        <button className="topbar-icon-btn">
          <Bell size={20} />
        </button>
        <button className="topbar-profile-btn">
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;

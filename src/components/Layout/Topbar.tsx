"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Home, Search, Bell, Download, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { auth } from '@/lib/firebase';
import './Topbar.css';

const Topbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openLoginModal } = useAuthStore();
  const searchParams = useSearchParams();
  // Initialize searchInput with URL param if it exists on mount
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Keep searchInput in sync with URL if it changes externally
  React.useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearchInput(q);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    
    if (pathname === '/search') {
      router.replace(`/search?q=${encodeURIComponent(val)}`);
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  // PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
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
            onChange={handleSearchChange}
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
        {isInstallable && (
          <button className="topbar-install-btn" onClick={handleInstallClick}>
            <Download size={16} />
            <span>Install App</span>
          </button>
        )}
        <button className="topbar-icon-btn">
          <Bell size={20} />
        </button>
        
        {user ? (
          <div className="topbar-user-menu">
            <button 
              className="topbar-profile-btn" 
              style={{ padding: 0, overflow: 'hidden' }}
              title={user.displayName || 'User Profile'}
              onClick={() => router.push('/profile')}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={20} />
              )}
            </button>
            <button 
              className="topbar-icon-btn logout-btn" 
              onClick={() => auth.signOut()}
              title="Log out"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button className="topbar-login-btn" onClick={openLoginModal}>
            Log in
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;

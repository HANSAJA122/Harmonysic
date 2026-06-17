"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, User } from 'lucide-react';
import './BottomNav.css';

const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link href="/search" className={`bottom-nav-item ${pathname === '/search' ? 'active' : ''}`}>
        <Search size={24} />
        <span>Search</span>
      </Link>
      <Link href="/library" className={`bottom-nav-item ${pathname === '/library' ? 'active' : ''}`}>
        <Library size={24} />
        <span>Library</span>
      </Link>
      <Link href="/profile" className={`bottom-nav-item ${pathname === '/profile' ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default BottomNav;

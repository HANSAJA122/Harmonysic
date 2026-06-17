"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Splash: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Simulate loading time, then redirect to login
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-background)' }}>
      <div className="animate-pulse" style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-4)' }}>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </div>
      <h1 className="text-3xl font-bold animate-fade-in" style={{ letterSpacing: '2px' }}>HARMONY</h1>
      
      <div style={{ position: 'absolute', bottom: '10%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div>
      </div>
    </div>
  );
};

export default Splash;

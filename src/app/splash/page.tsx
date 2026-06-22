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
        <img src="/logo.jpeg" alt="Harmonics Audio" width="80" height="80" style={{ borderRadius: '18px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }} />
      </div>
      <h1 className="text-3xl font-bold animate-fade-in" style={{ letterSpacing: '2px' }}>HARMONY</h1>
      
      <div style={{ position: 'absolute', bottom: '10%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}></div>
      </div>
    </div>
  );
};

export default Splash;

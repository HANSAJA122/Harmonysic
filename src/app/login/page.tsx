"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login
      router.push('/');
  };

  return (
    <div className="animate-fade-in" style={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-background)', padding: 'var(--spacing-6)' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--spacing-10)', marginTop: 'var(--spacing-10)' }}>
        <div style={{ color: 'var(--color-primary)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13"></path>
            <circle cx="6" cy="18" r="3"></circle>
            <circle cx="18" cy="16" r="3"></circle>
          </svg>
        </div>
        <h1 className="text-3xl font-bold">Harmony</h1>
      </header>

      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        <h2 className="text-2xl font-bold mb-8" style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>Log in to start listening</h2>

        <button style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-full)', backgroundColor: 'transparent', border: '1px solid var(--color-text-secondary)', color: 'var(--color-text-primary)', fontWeight: 'bold', marginBottom: 'var(--spacing-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Continue with Google
        </button>
        
        <button style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-full)', backgroundColor: 'transparent', border: '1px solid var(--color-text-secondary)', color: 'var(--color-text-primary)', fontWeight: 'bold', marginBottom: 'var(--spacing-8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Continue with Apple
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <span className="text-secondary text-sm">or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Email address</label>
            <input 
              type="email" 
              placeholder="Email address"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'var(--color-surface)', color: 'white' }}
            />
          </div>
          
          <div style={{ marginBottom: 'var(--spacing-6)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
            <input 
              type="password" 
              placeholder="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.2)', backgroundColor: 'var(--color-surface)', color: 'white' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary)', color: '#000', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
            Log In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-8)' }}>
          <span className="text-secondary">Don't have an account? </span>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 'bold', cursor: 'pointer' }} className="hover-scale">Sign up for Harmony</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

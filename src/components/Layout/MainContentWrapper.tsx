"use client";

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { LyricsView } from '@/components/Player/LyricsView';

export const MainContentWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isLyricsOpen } = usePlayerStore();
  
  // When lyrics are open, the background matches the dynamic album art color
  const bgStyle = isLyricsOpen 
    ? { background: 'linear-gradient(to bottom, var(--dynamic-theme-color-dark, var(--color-surface)), #000000)' } 
    : {};

  return (
    <div 
      style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 1s',
        ...bgStyle
      }}
    >
      {isLyricsOpen ? (
        <LyricsView />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', height: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
};

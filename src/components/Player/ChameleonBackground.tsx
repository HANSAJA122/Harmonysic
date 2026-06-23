"use client";

import React, { useMemo } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import './ChameleonBackground.css';

export default function ChameleonBackground() {
  const { chameleonMode } = usePlayerStore();

  // Memoize random elements so they don't jump around on re-renders
  const rainDrops = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      animationDuration: `${0.5 + Math.random() * 0.5}s`,
      animationDelay: `${Math.random() * 2}s`
    }));
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => {
      const size = 5 + Math.random() * 15;
      return {
        left: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: `${10 + Math.random() * 20}s`,
        animationDelay: `${Math.random() * 10}s`
      };
    });
  }, []);

  const lavaBlobs = useMemo(() => {
    const colors = ['#ff0055', '#7a00ff', '#00e5ff'];
    return Array.from({ length: 6 }).map((_, i) => {
      const size = 200 + Math.random() * 300;
      return {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        background: colors[i % colors.length],
        animationDuration: `${10 + Math.random() * 10}s`,
        animationDelay: `-${Math.random() * 10}s`
      };
    });
  }, []);

  if (chameleonMode === 'none') {
    return null;
  }

  return (
    <div className={`chameleon-wrapper chameleon-${chameleonMode}`}>
      {chameleonMode === 'rain' && (
        <>
          {rainDrops.map((style, i) => (
            <div key={i} className="rain-drop" style={style} />
          ))}
        </>
      )}

      {chameleonMode === 'synthwave' && (
        <>
          <div className="synth-sun" />
          <div className="synth-grid" />
        </>
      )}

      {chameleonMode === 'particles' && (
        <>
          {particles.map((style, i) => (
            <div key={i} className="particle" style={style} />
          ))}
        </>
      )}

      {chameleonMode === 'lava' && (
        <>
          {lavaBlobs.map((style, i) => (
            <div key={i} className="lava-blob" style={style} />
          ))}
        </>
      )}
    </div>
  );
}

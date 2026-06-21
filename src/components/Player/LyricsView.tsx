"use client";

import React, { useEffect, useState, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchLyrics, LyricLine } from '@/lib/lyrics';
import { X, Mic2, AlertCircle } from 'lucide-react';

export const LyricsView: React.FC = () => {
  const { currentTrack, isLyricsOpen, setLyricsOpen, progress, youtubePlayer, setProgress } = usePlayerStore();
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Fetch lyrics when track changes or view opens
  useEffect(() => {
    if (!isLyricsOpen || !currentTrack) return;

    const loadLyrics = async () => {
      setIsLoading(true);
      setError(null);
      setLyrics(null);
      
      const fetchedLyrics = await fetchLyrics(currentTrack.title, currentTrack.artist);
      
      if (fetchedLyrics && fetchedLyrics.length > 0) {
        setLyrics(fetchedLyrics);
      } else {
        setError("Lyrics not available for this track.");
      }
      setIsLoading(false);
    };

    loadLyrics();
  }, [currentTrack, isLyricsOpen]);

  const handleSeek = (time: number) => {
    if (youtubePlayer && typeof youtubePlayer.seekTo === 'function') {
      youtubePlayer.seekTo(time, true);
      setProgress(time);
    }
  };

  // Update active line based on progress
  useEffect(() => {
    if (!lyrics || lyrics.length === 0 || !isLyricsOpen) return;

    // Find the last lyric line that is before or equal to the current progress time
    // Adding a small offset (0.3s) so it highlights right before the singer sings
    const activeIndex = lyrics.findIndex((line, index) => {
      const nextLine = lyrics[index + 1];
      if (!nextLine) return true; // Last line
      return progress >= (line.time - 0.3) && progress < (nextLine.time - 0.3);
    });

    if (activeIndex !== -1 && activeIndex !== activeLineIndex) {
      setActiveLineIndex(activeIndex);
      
      // Smooth scroll to the active line
      if (activeLineRef.current && containerRef.current) {
        activeLineRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [progress, lyrics, isLyricsOpen, activeLineIndex]);

  if (!isLyricsOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col animate-slide-up"
      style={{ 
        background: 'linear-gradient(to bottom, var(--dynamic-theme-color-dark, var(--color-surface)), #000000)',
        paddingTop: 'var(--spacing-16)', // Clear topbar space
        paddingBottom: '120px', // Clear player space
        transition: 'background 1s ease-in-out'
      }}
    >
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold">{currentTrack?.title}</h2>
          <p className="text-secondary">{currentTrack?.artist}</p>
        </div>
        <button 
          onClick={() => setLyricsOpen(false)}
          className="icon-btn hover:bg-white/10 p-2 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-8 md:px-24 py-12 hide-scrollbar scroll-smooth"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-secondary">
            <Mic2 size={48} className="animate-pulse mb-4" />
            <p className="text-xl font-bold">Loading lyrics...</p>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-secondary">
            <AlertCircle size={48} className="mb-4" />
            <p className="text-xl font-bold">{error}</p>
          </div>
        ) : lyrics ? (
          <div className="max-w-3xl mx-auto space-y-8 pb-32 pt-16">
            {lyrics.map((line, i) => {
              const isActive = i === activeLineIndex;
              const isPast = i < activeLineIndex;
              
              return (
                <div 
                  key={i}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => handleSeek(line.time)}
                  className={`text-3xl md:text-5xl font-bold transition-all duration-500 ease-out cursor-pointer hover:scale-[1.02] ${
                    isActive 
                      ? 'text-white scale-105 origin-left' 
                      : isPast
                        ? 'text-white/30 hover:text-white/60'
                        : 'text-white/50 hover:text-white/80'
                  }`}
                  style={{ 
                    lineHeight: '1.4',
                    filter: isActive ? 'none' : 'blur(2px)',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  {line.text || '♪'}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchLyrics, LyricLine } from '@/lib/lyrics';
import { Mic2, AlertCircle } from 'lucide-react';

export const LyricsView: React.FC = () => {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isLyricsOpen = usePlayerStore(state => state.isLyricsOpen);
  
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const lyricsWrapperRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch lyrics when track changes
  useEffect(() => {
    if (!isLyricsOpen || !currentTrack) return;

    const loadLyrics = async () => {
      setIsLoading(true);
      setError(null);
      setLyrics(null);
      setActiveLineIndex(-1);
      
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

  // Handle clicking a lyric to seek
  const handleSeek = useCallback((time: number) => {
    const state = usePlayerStore.getState();
    if (state.youtubePlayer && typeof state.youtubePlayer.seekTo === 'function') {
      state.youtubePlayer.seekTo(time, true);
      state.setProgress(time);
      if (!state.isPlaying) {
        state.togglePlayPause();
        state.youtubePlayer.playVideo();
      }
      
      // Force auto-scroll to resume immediately
      isUserScrollingRef.current = false;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  // Track progress without causing React re-renders for the whole component
  useEffect(() => {
    if (!lyrics || lyrics.length === 0 || !isLyricsOpen) return;

    const unsubscribe = usePlayerStore.subscribe((state) => {
      const progress = state.progress;
      
      // Find the active lyric line
      const activeIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        if (!nextLine) return true; // Last line
        return progress >= (line.time - 0.3) && progress < (nextLine.time - 0.3);
      });

      if (activeIndex !== -1) {
        // Only trigger state update if the active index actually changed
        setActiveLineIndex((prevIndex) => {
          if (prevIndex !== activeIndex) {
            return activeIndex;
          }
          return prevIndex;
        });
      }
    });

    return () => unsubscribe();
  }, [lyrics, isLyricsOpen]);

  // Smooth scroll logic whenever activeLineIndex changes
  useEffect(() => {
    if (activeLineIndex === -1 || !activeLineRef.current || !containerRef.current) return;
    
    if (!isUserScrollingRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  // Handle manual user scrolling
  const handleUserInteraction = useCallback(() => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      // Snap back to active line when timeout finishes
      if (activeLineRef.current) {
         activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 3000);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  if (!isLyricsOpen) return null;

  return (
    <div className="flex flex-col h-full w-full relative animate-fade-in select-none">
      <div 
        ref={containerRef}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className="flex-1 overflow-y-auto px-4 md:px-24 hide-scrollbar scroll-smooth"
        style={{
          // Creates a fade effect at the top and bottom of the scrolling container
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
        }}
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
          <div ref={lyricsWrapperRef} className="max-w-4xl mx-auto pb-[60vh] pt-[40vh] text-center flex flex-col items-center">
            {lyrics.map((line, i) => {
              const isActive = i === activeLineIndex;
              const isPast = i < activeLineIndex;
              
              // Spotify styling rules
              let textClasses = 'text-white/30';
              if (isActive) textClasses = 'text-white scale-[1.05]';
              else if (isPast) textClasses = 'text-white/50';
              
              return (
                <div 
                  key={i}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => handleSeek(line.time)}
                  className={`text-3xl md:text-5xl font-bold transition-all duration-500 ease-out cursor-pointer hover:text-white/80 w-full mb-8 ${textClasses}`}
                  style={{ 
                    lineHeight: '1.4',
                    transformOrigin: 'center center',
                    filter: isActive ? 'none' : 'blur(0.5px)',
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


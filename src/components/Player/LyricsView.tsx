"use client";

import React, { useEffect, useState, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchLyrics, LyricLine } from '@/lib/lyrics';
import { Mic2, AlertCircle } from 'lucide-react';

export const LyricsView: React.FC = () => {
  const { currentTrack, isLyricsOpen, progress, youtubePlayer, setProgress } = usePlayerStore();
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      // Immediately cancel user scrolling to snap to the new lyric
      setIsUserScrolling(false);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    }
  };

  const handleUserInteraction = () => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
      // Snap back to active line when timeout finishes
      if (activeLineRef.current) {
         activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 3000);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

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
      
      // Smooth scroll to the active line ONLY if user is not manually scrolling
      if (!isUserScrolling && activeLineRef.current && containerRef.current) {
        activeLineRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [progress, lyrics, isLyricsOpen, activeLineIndex, isUserScrolling]);

  // If lyrics aren't open, don't render (handled mostly by Wrapper now, but good safety)
  if (!isLyricsOpen) return null;

  return (
    <div className="flex flex-col h-full w-full relative animate-fade-in">
      <div 
        ref={containerRef}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className="flex-1 overflow-y-auto px-8 md:px-24 hide-scrollbar"
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
          <div className="max-w-4xl mx-auto pb-[50vh] pt-[40vh]">
            {lyrics.map((line, i) => {
              const isActive = i === activeLineIndex;
              const isPast = i < activeLineIndex;
              
              return (
                <div 
                  key={i}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => handleSeek(line.time)}
                  className={`text-4xl md:text-6xl font-bold transition-all duration-500 ease-out cursor-pointer hover:scale-[1.02] mb-6 ${
                    isActive 
                      ? 'text-white scale-[1.02] origin-left' 
                      : 'text-white/40 hover:text-white/80 origin-left'
                  }`}
                  style={{ 
                    lineHeight: '1.5',
                    filter: isActive ? 'none' : 'blur(1px)',
                    transform: isActive ? 'scale(1.02)' : 'scale(1)'
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

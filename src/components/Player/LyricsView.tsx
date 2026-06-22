"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { fetchLyrics, LyricLine } from '@/lib/lyrics';
import { Mic2, AlertCircle, Share2, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import './LyricsView.css';

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
  const shareCardRef = useRef<HTMLDivElement>(null);
  
  const isUserScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [lyricToShare, setLyricToShare] = useState<string | null>(null);

  const handleShare = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Don't trigger the click-to-seek
    if (!shareCardRef.current || !currentTrack) return;
    
    setLyricToShare(text);
    setIsGeneratingCard(true);

    try {
      // Need a tiny timeout to allow React to render the lyricToShare into the hidden card before capturing
      setTimeout(async () => {
        if (!shareCardRef.current) return;
        
        const dataUrl = await toPng(shareCardRef.current, { 
          quality: 1, 
          pixelRatio: 3, // High-res export
          cacheBust: true,
        });
        
        // Trigger download
        const link = document.createElement('a');
        link.download = `${currentTrack.title}_lyric_card.png`;
        link.href = dataUrl;
        link.click();
        
        setIsGeneratingCard(false);
        setLyricToShare(null);
      }, 100);
    } catch (err) {
      console.error('Failed to generate lyric card', err);
      setIsGeneratingCard(false);
      setLyricToShare(null);
    }
  };

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
    <div className="lyrics-container">
      <div 
        ref={containerRef}
        onWheel={handleUserInteraction}
        onTouchMove={handleUserInteraction}
        className="lyrics-scroll-area"
      >
        {isLoading ? (
          <div className="lyrics-message">
            <Mic2 size={48} className="animate-pulse mb-4" />
            <p className="lyrics-message-text">Loading lyrics...</p>
          </div>
        ) : error ? (
          <div className="lyrics-message">
            <AlertCircle size={48} className="mb-4" />
            <p className="lyrics-message-text">{error}</p>
          </div>
        ) : lyrics ? (
          <div ref={lyricsWrapperRef} className="lyrics-wrapper">
            {lyrics.map((line, i) => {
              const isActive = i === activeLineIndex;
              
              return (
                <div 
                  key={i}
                  ref={isActive ? activeLineRef : null}
                  onClick={() => handleSeek(line.time)}
                  className={`lyric-line ${isActive ? 'active' : ''}`}
                >
                  <span className="lyric-text">{line.text || '♪'}</span>
                  {isActive && line.text && (
                    <button 
                      className="lyric-share-btn"
                      onClick={(e) => handleShare(e, line.text)}
                      title="Share Lyric Card"
                    >
                      <Share2 size={16} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* Hidden Card for generating image exports */}
      <div 
        ref={shareCardRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: -9999,
          opacity: 0,
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle at center, ${typeof document !== 'undefined' ? document.documentElement.style.getPropertyValue('--dynamic-theme-color') || '#1db954' : '#1db954'} 0%, #121212 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          borderRadius: '24px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <h1 style={{ fontSize: '36px', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
             "{lyricToShare}"
           </h1>
        </div>
        
        {currentTrack && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: 'auto', background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '16px', backdropFilter: 'blur(10px)' }}>
            <img src={currentTrack.albumUrl} crossOrigin="anonymous" alt="" style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{currentTrack.title}</div>
              <div style={{ fontSize: '16px', opacity: 0.8 }}>{currentTrack.artist}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6, fontWeight: 700, fontSize: '14px' }}>
               <Mic2 size={16} /> HARMONYSIC
            </div>
          </div>
        )}
      </div>
    </div>
  );
};



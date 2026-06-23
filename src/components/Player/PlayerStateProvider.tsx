"use client";

import React, { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export default function PlayerStateProvider({ children }: { children: React.ReactNode }) {
  const { 
    isPlaying, 
    incrementListeningTime, 
    isRadioMode, 
    queue, 
    currentIndex, 
    appendRadioTracks 
  } = usePlayerStore();

  // 1. Listening Time Tracker
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        incrementListeningTime(5);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, incrementListeningTime]);

  // 2. Infinite Radio Mode logic
  const isFetchingRadioRef = React.useRef(false);

  useEffect(() => {
    // If radio mode is on, we have a queue, and we are on the last or second-to-last song
    if (isRadioMode && queue.length > 0 && currentIndex >= queue.length - 2) {
      if (isFetchingRadioRef.current) return;

      const currentTrack = queue[currentIndex];
      
      const fetchRadio = async () => {
        isFetchingRadioRef.current = true;
        try {
          const res = await fetch(`/api/radio?videoId=${currentTrack.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.tracks && data.tracks.length > 0) {
              appendRadioTracks(data.tracks);
            }
          }
        } catch (e) {
          console.error("Failed to fetch radio tracks", e);
        } finally {
          // Allow fetching again later, e.g., when index advances
          setTimeout(() => {
            isFetchingRadioRef.current = false;
          }, 5000);
        }
      };

      fetchRadio();
    }
  }, [isRadioMode, currentIndex, queue.length]);

  return <>{children}</>;
}

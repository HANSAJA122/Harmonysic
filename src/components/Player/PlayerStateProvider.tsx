"use client";

import React, { useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';

export default function PlayerStateProvider({ children }: { children: React.ReactNode }) {
  const { isPlaying, incrementListeningTime } = usePlayerStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      // Increment listening time by 5 seconds every 5 seconds
      interval = setInterval(() => {
        incrementListeningTime(5);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, incrementListeningTime]);

  return <>{children}</>;
}

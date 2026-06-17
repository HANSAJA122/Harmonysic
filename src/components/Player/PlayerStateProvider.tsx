"use client";

import React from 'react';
import { usePlayerStore } from '@/store/playerStore';

export default function PlayerStateProvider({ children }: { children: React.ReactNode }) {
  // We use this component to render the FullScreenPlayer conditionally based on Zustand state, 
  // since layout.tsx is a Server Component and cannot directly consume Zustand state.
  return <>{children}</>;
}

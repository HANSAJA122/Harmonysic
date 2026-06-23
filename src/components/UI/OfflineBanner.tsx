"use client";

import React from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import './OfflineBanner.css';

export default function OfflineBanner() {
  const isOnline = useNetworkStatus();

  return (
    <div className={`offline-banner ${!isOnline ? 'visible' : ''}`}>
      <div className="offline-banner-content">
        <WifiOff size={18} />
        <span>You are offline. Showing downloaded playlists and history.</span>
      </div>
    </div>
  );
}

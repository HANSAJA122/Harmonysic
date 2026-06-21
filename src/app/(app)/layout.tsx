import React, { Suspense } from 'react';
import Topbar from '@/components/Layout/Topbar';
import Sidebar from '@/components/Layout/Sidebar';
import RightSidebar from '@/components/Layout/RightSidebar';
import BottomNav from '@/components/Layout/BottomNav';
import MusicPlayer from '@/components/Player/MusicPlayer';
import FullScreenPlayer from '@/components/Player/FullScreenPlayer';
import { AuthProvider } from '@/components/Auth/AuthProvider';
import '@/components/Layout/AppLayout.css';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      <AuthProvider>
        {/* Global Topbar */}
        <Suspense fallback={<div style={{height: 'var(--topbar-height)'}}></div>}>
          <Topbar />
        </Suspense>

        <div className="app-main-wrapper">
          {/* Desktop Left Sidebar */}
          <Sidebar />

          {/* Center Main Content Area */}
          <main className="app-main">
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
          </main>

          {/* Desktop Right Sidebar */}
          <RightSidebar />
        </div>

        {/* Persistent Music Player */}
        <MusicPlayer />
        
        {/* Mobile Bottom Navigation */}
        <BottomNav />
        
        {/* Full Screen Player Modal */}
        <FullScreenPlayer />
      </AuthProvider>
    </div>
  );
}

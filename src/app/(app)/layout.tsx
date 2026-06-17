import Sidebar from '@/components/Layout/Sidebar';
import BottomNav from '@/components/Layout/BottomNav';
import MusicPlayer from '@/components/Player/MusicPlayer';
import FullScreenPlayer from '@/components/Player/FullScreenPlayer';
import '@/components/Layout/AppLayout.css';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="app-main">
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </main>

      {/* Persistent Music Player */}
      <MusicPlayer />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      {/* Full Screen Player Modal */}
      <FullScreenPlayer />
    </div>
  );
}

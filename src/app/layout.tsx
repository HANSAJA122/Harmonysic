import type { Metadata } from 'next';
import './globals.css';
import PlayerStateProvider from '@/components/Player/PlayerStateProvider';

export const metadata: Metadata = {
  title: 'Harmony Music',
  description: 'Premium music streaming application',
  manifest: '/manifest.json',
  themeColor: '#121212',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Harmony Music',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PlayerStateProvider>
          {children}
        </PlayerStateProvider>
      </body>
    </html>
  );
}

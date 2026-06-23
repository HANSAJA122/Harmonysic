import type { Metadata, Viewport } from 'next';
import './globals.css';
import PlayerStateProvider from '@/components/Player/PlayerStateProvider';

export const metadata: Metadata = {
  title: 'Harmonysic',
  description: 'Premium AI music streaming application',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Harmonysic',
  },
};

export const viewport: Viewport = {
  themeColor: '#121212',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
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

import type { Metadata } from 'next';
import './globals.css';
import PlayerStateProvider from '@/components/Player/PlayerStateProvider';

export const metadata: Metadata = {
  title: 'Harmony Music',
  description: 'Premium music streaming application',
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

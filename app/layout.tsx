import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "The Dragon's Call — An Interactive Journey",
  description: 'A scroll-driven cinematic experience. Enter the painting.',
  openGraph: {
    title: "The Dragon's Call",
    description: 'A scroll-driven cinematic experience',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0e14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

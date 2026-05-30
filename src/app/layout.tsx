import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#cca152', // Synced with --color-brand-500 Master Core Gold
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Printly',
  description: 'Assignment submission and printing for your class.',
  manifest: '/manifest.webmanifest',
  
  // PWA compatible cross-platform icon configuration
  icons: {
    icon: [
      { url: '/favicon_io/favicon.ico', sizes: 'any' },
      { url: '/favicon_io/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon_io/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon_io/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },

  // PWA/Apple standalone application settings
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Printly',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  );
}
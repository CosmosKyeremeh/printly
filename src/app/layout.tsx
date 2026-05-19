import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrintLy',
  description: 'Centralized assignment submission and printing for your class.',
  
  // Fully compatible cross-platform icon configuration
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  
  // Links the Android/Chrome home screen manifest file
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-950 antialiased">
        {children}
      </body>
    </html>
  );
}

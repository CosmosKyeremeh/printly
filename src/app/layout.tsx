import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PrintLy',
  description: 'Centralized assignment submission and printing for your class.',
  icons: { icon: '/umat-logo.jpeg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-brand-950 antialiased">
        {children}
      </body>
    </html>
  );
}
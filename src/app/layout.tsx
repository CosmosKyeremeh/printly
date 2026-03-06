import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClassPrint Hub',
  description: 'Centralized assignment submission and printing for your class.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 antialiased">
        {children}
      </body>
    </html>
  );
}
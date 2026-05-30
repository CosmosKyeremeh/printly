import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Printly',
    short_name: 'Printly',
    description: 'Assignment submission and printing for your class.',
    start_url: '/',
    display: 'standalone',
    background_color: '#040b15',
    theme_color: '#b67e7d',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon_io/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon_io/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
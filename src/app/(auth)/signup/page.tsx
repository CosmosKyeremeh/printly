'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PrinterIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SCHOOL_IMAGES: string[] = [];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (SCHOOL_IMAGES.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % SCHOOL_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  async function handleSignup(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('Security key requirements demand min. 8 alphanumeric bounds.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName, 
          role: 'student' // Hardcoded to student for safety
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login?signup=success');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex font-sans antialiased">
      {/* Left Slideshow/Fallback Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16 border-r border-zinc-900/60 bg-zinc-950">
        <div className="absolute inset-0 z-0">
          {SCHOOL_IMAGES.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={SCHOOL_IMAGES[currentImage] || ''}
                  alt="Campus workspace environment"
                  fill
                  className="object-cover scale-105"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div 
              className="absolute inset-0 bg-zinc-950 opacity-[0.015]"
              style={{
                backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/50 z-10" />
        </div>

        <div className="flex items-center gap-2.5 relative z-20">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 shadow-sm">
            <PrinterIcon className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-200">Printly</span>
        </div>

        <div className="relative z-20 max-w-sm my-auto space-y-4">
          <h1 className="text-4xl font-medium tracking-tight text-white leading-[1.15]">
            Create your <br />
            <span className="text-zinc-400 font-normal italic">deployment key.</span>
          </h1>
          <p className="text-zinc-400 text-[14px] leading-relaxed">
            Register your institutional directory credentials to hook directly into live department print nodes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 relative z-20 h-1">
          {SCHOOL_IMAGES.length > 1 && SCHOOL_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentImage ? 'w-5 bg-zinc-400' : 'w-1 bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-zinc-950">
        <div className="w-full max-w-[360px]">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Create account</h2>
            <p className="text-sm text-zinc-500">Configure your global platform routing permissions.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-medium text-zinc-400">Full name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="E.g., Leslie Mensah"
                required
                className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-zinc-400">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mrhoney@yahoo.com"
                required
                className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-zinc-400">Security password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
              />
            </div>

            {error && (
              <div className="rounded-lg p-3 border border-red-500/10 bg-red-500/[0.02]">
                <p className="text-xs text-red-400 font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium text-sm transition-colors rounded-lg mt-2 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Identity...
                </span>
              ) : 'Generate Account'}
            </Button>
          </form>

          <p className="text-xs text-center mt-6 text-zinc-500">
            Already mapped?{' '}
            <Link href="/login" className="text-zinc-300 hover:text-amber-500 font-medium underline underline-offset-4 transition-colors">
              Access workspace
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
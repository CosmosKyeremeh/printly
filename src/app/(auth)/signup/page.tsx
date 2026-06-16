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
  const [joinCode, setJoinCode] = useState('');
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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 8) {
      setError('Security key requirements demand min. 8 alphanumeric bounds.');
      setLoading(false);
      return;
    }

    let orgId = null;

    if (joinCode) {
      try {
        const res = await fetch(`/api/organizations/lookup?code=${encodeURIComponent(joinCode)}`);
        const { orgId: fetchedOrgId, error: lookupError } = await res.json();
        
        if (lookupError || !fetchedOrgId) {
          setError('Invalid join code. Ask your class rep for the correct code.');
          setLoading(false);
          return;
        }
        
        orgId = fetchedOrgId;
      } catch (err) {
        setError('Network error validating verification credentials.');
        setLoading(false);
        return;
      }
    } else {
      setError('An organization join code is required to complete registration.');
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'student',
          org_id: orgId,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push('/login?signup=success');
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-zinc-950 relative overflow-x-hidden">
      
      {/* 🌟 TRUE FULLSCREEN BACKGROUND UNDERLAY */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {SCHOOL_IMAGES.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <Image
                src={SCHOOL_IMAGES[currentImage] || ''}
                alt="Campus environment"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 opacity-25">
            <Image
              src="/images/school/bg.png"
              alt="Global Application Background"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </div>
        )}
        {/* Subtle vignette layer over the entire wallpaper to guarantee text isolation */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/95 via-zinc-950/85 to-zinc-950/95" />
      </div>

      {/* Left Panel: Decorative / Hero */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-zinc-900/40 z-10">
        <div className="flex items-center gap-2.5 relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900/60 border border-zinc-800/50 shadow-sm backdrop-blur-md">
            <PrinterIcon className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-200">
            Printly
          </span>
        </div>

        <div className="max-w-sm my-auto space-y-4">
          <h1 className="text-4xl font-medium tracking-tight text-white leading-[1.15]">
            Create your <br />
            <span className="text-zinc-400 font-normal italic">
              deployment key.
            </span>
          </h1>
          <p className="text-zinc-400 text-[14px] leading-relaxed">
            Register your institutional directory credentials to hook directly into live department print nodes.
          </p>
        </div>
      </div>

      {/* Right Panel: Interactive Form Box */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 z-10 backdrop-blur-[3px] lg:backdrop-blur-none bg-zinc-950/40 lg:bg-transparent">
        <div className="w-full max-w-[360px] bg-zinc-950/60 lg:bg-transparent p-6 sm:p-0 rounded-2xl border border-zinc-900/50 sm:border-none shadow-xl sm:shadow-none">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">
              Create account
            </h2>
            <p className="text-sm text-zinc-500">
              Configure your global platform routing permissions.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs text-zinc-400">
                Full name
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800/80 focus:border-amber-500/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-zinc-400">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800/80 focus:border-amber-500/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-zinc-400">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900/50 border-zinc-800/80 focus:border-amber-500/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="joinCode" className="text-xs text-zinc-400">
                Organization Code
              </Label>
              <Input
                id="joinCode"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter your org code"
                className="bg-zinc-900/50 border-zinc-800/80 focus:border-amber-500/50"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-red-400">{error}</div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-xs text-center mt-6 text-zinc-500">
            Already have access?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
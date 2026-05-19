'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PrinterIcon, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_CODE ?? 'ADMIN2026';

// const SCHOOL_IMAGES = [
//   '/images/school/pic-1.jpeg',
//   '/images/school/school-3.jpg',
//   '/images/school/school-4.jpg',
//   '/images/school/school-5.jpg',
// ];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % SCHOOL_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (role === 'admin' && adminCode !== ADMIN_CODE) {
      setError('Invalid system administrative signature code.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Security key requirements demand min. 8 alphanumeric bounds.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
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

      {/* ── Left Slideshow Panel (Smooth Crossfade) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16 border-r border-zinc-900/60">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }} // Subdued background presence to prioritize readability
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0"
            >
              <Image
                src={SCHOOL_IMAGES[currentImage]}
                alt="Campus workspace environment"
                fill
                className="object-cover scale-105"
                priority
              />
            </motion.div>
          </AnimatePresence>
          {/* Modern overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/50 z-10" />
        </div>

        {/* Branding header overlay */}
        <div className="flex items-center gap-2.5 relative z-20">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 shadow-sm">
            <PrinterIcon className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-200">Printly</span>
        </div>

        {/* Core panel callout */}
        <div className="relative z-20 max-w-sm my-auto space-y-4">
          <h1 className="text-4xl font-medium tracking-tight text-white leading-[1.15]">
            Create your <br />
            <span className="text-zinc-400 font-normal italic">deployment key.</span>
          </h1>
          <p className="text-zinc-400 text-[14px] leading-relaxed">
            Register your institutional directory credentials to hook directly into live department print nodes.
          </p>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-1.5 relative z-20">
          {SCHOOL_IMAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentImage ? 'w-5 bg-zinc-400' : 'w-1 bg-zinc-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-zinc-950">
        <div className="w-full max-w-[360px]">
          
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Create account</h2>
            <p className="text-sm text-zinc-500">Configure your global platform routing permissions.</p>
          </div>

          {/* Minimal Tab-Slider Controls */}
          <div className="grid grid-cols-2 gap-1 mb-6 p-1 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
            {(['student', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  role === r
                    ? 'bg-zinc-800 border border-zinc-700/60 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {r === 'student' ? <GraduationCap className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
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
              <Label htmlFor="email" className="text-xs font-medium text-zinc-400">University email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu.gh"
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

            {role === 'admin' && (
              <motion.div
                className="space-y-1.5 pt-0.5"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Label htmlFor="adminCode" className="text-xs font-medium text-zinc-400">System authorization token</Label>
                <Input
                  id="adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter administrative token signature"
                  required
                  className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
                />
              </motion.div>
            )}

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
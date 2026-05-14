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

const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_SIGNUP_CODE ?? 'ADMIN2026';

const SCHOOL_IMAGES = [
  '/images/school/ASCESbadge.jpeg',
  '/images/school/pic-1.jpeg',
  '/images/school/school-3.jpg',
  '/images/school/school-4.jpg',
  '/images/school/school-5.jpg',
];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [nextImage, setNextImage] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Slideshow logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrentImage(prev => (prev + 1) % SCHOOL_IMAGES.length);
        setNextImage(prev => (prev + 1) % SCHOOL_IMAGES.length);
        setTransitioning(false);
      }, 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (role === 'admin' && adminCode !== ADMIN_CODE) {
      setError('Invalid admin access code.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
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

    router .push('/login?singup=success');
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* ── Left brand panel with slideshow ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center">

        {/* Slideshow images */}
        <div className="absolute inset-0">
          {SCHOOL_IMAGES.map((src, i) => (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-1000"
              style={{
                opacity: i === currentImage ? (transitioning ? 0 : 1) : 0,
                zIndex: i === currentImage ? 1 : 0,
              }}
            >
              <Image
                src={src}
                alt={`School photo ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Dark overlay with gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/30" />

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 z-10 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Amber glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 bg-amber-500/15 rounded-full blur-3xl z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-sm w-full px-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <PrinterIcon className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ClassPrint Hub</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] mb-4 tracking-tight">
            Join your<br />
            <span className="text-amber-500">class today.</span>
          </h1>
          <p className="text-zinc-300 text-base leading-relaxed mb-10">
            Upload assignments, track submissions, and never miss a deadline again.
          </p>

          {/* Role info */}
          <div className="space-y-3">
            <div className="flex items-start gap-4 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <GraduationCap className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">Student</p>
                <p className="text-zinc-400 text-xs mt-0.5">Upload files, track prints, manage payments</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">Admin / Class Rep</p>
                <p className="text-zinc-400 text-xs mt-0.5">Manage queue, categories, and print batches</p>
              </div>
            </div>
          </div>

          {/* Slideshow dots */}
          <div className="flex items-center gap-2 mt-8">
            {SCHOOL_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentImage
                    ? 'w-6 h-1.5 bg-amber-500'
                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <PrinterIcon className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg">ClassPrint Hub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-1">
              Create account
            </h2>
            <p className="text-zinc-400 text-sm">Get started in under a minute</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            {(['student', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === r
                    ? 'bg-amber-500 text-zinc-950 shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r === 'student'
                  ? <GraduationCap className="w-4 h-4" />
                  : <ShieldCheck className="w-4 h-4" />
                }
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-zinc-300 text-sm font-medium">
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Borngreat Mensah"
                required
                className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu.gh"
                required
                className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-colors"
              />
            </div>

            {role === 'admin' && (
              <div className="space-y-1.5">
                <Label htmlFor="adminCode" className="text-zinc-300 text-sm font-medium">
                  Admin access code
                </Label>
                <Input
                  id="adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Provided by your institution"
                  required
                  className="h-11 bg-zinc-900 border-amber-500/30 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-colors"
                />
                <p className="text-zinc-500 text-xs">Contact your class coordinator for this code</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="text-zinc-500 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
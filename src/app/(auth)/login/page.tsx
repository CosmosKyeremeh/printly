'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PrinterIcon, Eye, EyeOff, GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get('signup') === 'success';
  const passwordReset = searchParams.get('reset') === 'success';
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single();

    router.push(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex font-sans antialiased">

      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-16 bg-zinc-950 border-r border-zinc-900/60">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        
        {/* Top Branding Header */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 shadow-sm">
            <PrinterIcon className="w-4 h-4 text-amber-500" strokeWidth={2} />
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-200">Printly</span>
        </div>

        {/* Centerpiece Messaging */}
        <motion.div
          className="relative z-10 max-w-md my-auto space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-4xl font-medium tracking-tight text-white leading-[1.15]">
            Academic printing, <br />
            <span className="text-zinc-400 font-normal italic">reimagined for speed.</span>
          </h1>
          <p className="leading-relaxed text-zinc-400 text-[15px] font-normal max-w-sm">
            An automated submission engine mapping file workflows smoothly from student device directly to your campus queue.
          </p>

          <div className="pt-6 space-y-3 max-w-sm">
            {[
              { icon: <GraduationCap className="w-4 h-4 text-zinc-400" />, title: 'Fluid Workflow', desc: 'Deploy assets and monitor real-time print execution rings.' },
              { icon: <ShieldCheck className="w-4 h-4 text-zinc-400" />, title: 'Administrative Edge', desc: 'Control queue batch pipelines and transaction ledgers easily.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start p-3.5 rounded-xl border border-zinc-900/50 bg-zinc-900/10">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-zinc-900 border border-zinc-800/80">
                  {icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-zinc-200 text-sm font-medium">{title}</p>
                  <p className="text-xs text-zinc-500 leading-normal">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer Meta */}
        <div className="text-xs text-zinc-600 relative z-10">
          Secure identity verification managed by Supabase Vault Architecture.
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-zinc-950">
        
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden w-full max-w-md flex items-center gap-2.5 mb-12">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800">
            <PrinterIcon className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-bold text-sm tracking-tight text-zinc-200">Printly</span>
        </div>

        <motion.div
          className="w-full max-w-[360px]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {/* Action Banners */}
          {justSignedUp && (
            <div className="flex items-start gap-3 rounded-xl p-3.5 mb-6 border border-emerald-500/10 bg-emerald-500/[0.02]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-emerald-400">Account verified</p>
                <p className="text-[11px] text-zinc-500 leading-normal">Your profile is initialized. Sign in below to enter the terminal.</p>
              </div>
            </div>
          )}

          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Welcome back</h2>
            <p className="text-sm text-zinc-500">Sign in to initialize your campus workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-zinc-400">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@university.edu.gh"
                required
                className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-zinc-400">Password</Label>
                <Link href="/forgot-password" className="text-[11px] font-normal text-zinc-500 hover:text-amber-500 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 pr-10 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
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
                  Processing...
                </span>
              ) : 'Sign in to Workspace'}
            </Button>
          </form>

          <p className="text-xs text-center mt-6 text-zinc-500">
            New to the network?{' '}
            <Link href="/signup" className="text-zinc-300 hover:text-amber-500 font-medium underline underline-offset-4 transition-colors">
              Request access token
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <LoginForm />
    </Suspense>
  );
}
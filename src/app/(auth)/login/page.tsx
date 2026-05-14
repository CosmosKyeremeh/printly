'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PrinterIcon, GraduationCap, ShieldCheck, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justSignedUp = searchParams.get('signup') === 'success';
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
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    router.push(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 flex-col items-center justify-center p-12">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm w-full">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <PrinterIcon className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-lg tracking-tight">ClassPrint Hub</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.08] tracking-tight mb-5">
            Print smarter.<br />
            <span className="text-amber-500">Not harder.</span>
          </h1>
          <p className="text-zinc-400 leading-relaxed mb-12">
            One place for your whole class to submit, queue, and collect printed assignments.
          </p>

          <div className="space-y-3">
            {[
              { icon: <GraduationCap className="w-4 h-4 text-amber-500" />, title: 'Students', desc: 'Upload files and track print status' },
              { icon: <ShieldCheck className="w-4 h-4 text-amber-500" />, title: 'Admins', desc: 'Manage queue, categories and payments' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 bg-zinc-800/50 border border-zinc-700/40 rounded-xl p-4">
                <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-zinc-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <PrinterIcon className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold">ClassPrint Hub</span>
          </div>
        </div>

        {/* Mobile hero */}
        <div className="lg:hidden bg-zinc-900/50 border-b border-zinc-800 px-6 py-6">
          <h2 className="text-2xl font-black text-white">
            Print smarter.<br />
            <span className="text-amber-500">Not harder.</span>
          </h2>
          <p className="text-zinc-500 text-sm mt-1.5">Submit assignments, track prints, pay fees.</p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">

            {/* Success banner after signup */}
            {justSignedUp && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-emerald-400 text-sm font-semibold">Account created!</p>
                  <p className="text-emerald-400/70 text-xs mt-0.5">Sign in below to access your dashboard</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
              <p className="text-zinc-500 text-sm mt-1">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-colors"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 mt-2 rounded-xl"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </Button>
            </form>

            {/* Role hints */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <GraduationCap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-zinc-400 text-xs font-medium">Student</p>
                <p className="text-zinc-600 text-xs mt-0.5">Use your student email</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
                <ShieldCheck className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-zinc-400 text-xs font-medium">Admin</p>
                <p className="text-zinc-600 text-xs mt-0.5">Use your admin email</p>
              </div>
            </div>

            <p className="text-zinc-500 text-sm text-center mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>
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
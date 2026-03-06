'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PrinterIcon } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

    if (profile?.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 flex-col items-center justify-center p-12">
        {/* dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* amber glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <PrinterIcon className="w-5 h-5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">ClassPrint Hub</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] mb-5 tracking-tight">
            Print smarter.<br />
            <span className="text-amber-500">Not harder.</span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed mb-12">
            Upload your assignments once. Your class rep handles the rest.
            No more queues, no more confusion.
          </p>

          {/* Steps */}
          <div className="space-y-3">
            {[
              { n: '01', label: 'Upload your assignment files' },
              { n: '02', label: 'Admin organises and queues prints' },
              { n: '03', label: 'Pay and collect — done' },
            ].map(({ n, label }) => (
              <div
                key={n}
                className="flex items-center gap-4 bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 backdrop-blur-sm"
              >
                <span className="text-amber-500 text-xs font-bold font-mono">{n}</span>
                <span className="text-zinc-300 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <PrinterIcon className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold text-lg">ClassPrint Hub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-1">
              Welcome back
            </h2>
            <p className="text-zinc-400 text-sm">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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
                placeholder="••••••••"
                required
                className="h-11 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="text-zinc-500 text-sm text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PrinterIcon, User, Mail, Lock, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = { isFirstSetup: boolean };

export function SignupForm({ isFirstSetup }: Props) {
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [classCode, setClassCode] = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const router   = useRouter();
  const supabase = createClient();

  // ── Fix: Clear Stale Session Local Storage Post-Password Reset ──
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('reset=success')) {
      // Wipes local storage auth states locally so Supabase client doesn't auto-fetch with bad tokens
      supabase.auth.signOut({ scope: 'local' });
    }
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      let orgId: string | undefined;
      let role: 'admin' | 'student' = 'student';

      if (isFirstSetup) {
        const res = await fetch('/api/organizations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schoolName: 'My Class', className: 'Default' }),
        });
        const data = await res.json();
        if (!res.ok || !data.orgId) {
          setError(data.error ?? 'Could not set up your class. Please try again.');
          return;
        }
        orgId = data.orgId;
        role  = 'admin';

      } else if (classCode.trim()) {
        const code = classCode.trim().toUpperCase();
        const res  = await fetch(`/api/organizations/lookup?code=${code}`);
        const data = await res.json();
        if (!res.ok || !data.orgId) {
          setError('That class code is not valid. Check with your class rep.');
          return;
        }
        orgId = data.orgId;
        role  = 'student';
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            ...(orgId ? { org_id: orgId } : {}),
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/login?signup=success');

    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-between p-6 md:p-12 bg-cover bg-center bg-no-repeat relative font-sans"
      style={{ backgroundImage: "linear-gradient(to bottom, rgba(9, 10, 15, 0.15), rgba(9, 10, 15, 0.35)), url('/images/school/bg.png')" }}
    >
      {/* Top Navbar Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500  shadow-lg shadow-brand-500/20">
            <PrinterIcon className="w-4 h-4 text-brand-950" strokeWidth={2.5} />
          </div>
          <span className="text-brand-50 font-semibold tracking-wide text-lg">Printly</span>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto relative z-10">
        
        {/* Left Column Text Panel */}
        <div className="lg:col-span-6 xl:col-span-7 text-left space-y-6 hidden lg:block pr-8">
          <h1 className="text-5xl font-black text-amber-500 tracking-tight leading-none whitespace-pre-line drop-shadow-md">
            {isFirstSetup ? 'Create your\ndeployment key.' : 'Connect to your\nacademic circle.'}
          </h1>
          <p className="text-brand-100/80 max-w-md text-white leading-relaxed drop-shadow">
            Streamline your workflow deployments and coordinate computational frameworks directly inside your hub.
          </p>
        </div>

        {/* Right Column Registration Component */}
        <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end">
          <motion.div
            className="w-full max-w-md bg-brand-950/10 border border-white/15 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-2xl shadow-black/30"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="mb-8">
              <div className="lg:hidden flex items-center gap-2 mb-4">
                <PrinterIcon className="w-4 h-4 text-amber-500" />
                <span className="text-xs tracking-widest text-white font-mono uppercase">Printly Hub</span>
              </div>
              <h2 className="text-2xl font-bold text-amber-500 tracking-tight mb-1.5">
                {isFirstSetup ? 'Set up your class' : 'Create account'}
              </h2>
              <p className="text-xs text-brand-200/90 leading-relaxed">
                {isFirstSetup
                  ? 'First initialization setup. Create your class workspace.'
                  : 'Join your class workspace ecosystem.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white tracking-wide uppercase">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
                  <Input
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="h-11 pl-10 text-sm text-brand-50 bg-white/5 border-white/10 placeholder:text-brand-300/40 focus-visible:ring-1 focus-visible:ring-brand-400 focus-visible:border-brand-400 rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white tracking-wide uppercase">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11 pl-10 text-sm text-brand-50 bg-white/5 border-white/10 placeholder:text-brand-300/40 focus-visible:ring-1 focus-visible:ring-brand-400 focus-visible:border-brand-400 rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-white tracking-wide uppercase">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="h-11 pl-10 pr-10 text-sm text-brand-50 bg-white/5 border-white/10 placeholder:text-brand-300/40 focus-visible:ring-1 focus-visible:ring-brand-400 focus-visible:border-brand-400 rounded-xl transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-brand-300 hover:text-brand-100"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Optional Class Code Input */}
              {!isFirstSetup && (
                <div className="space-y-2 pt-3 border-t border-white/10 mt-5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-white tracking-wide uppercase">Organization Code</Label>
                    <span className="text-[10px] text-amber-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider scale-90">
                      optional
                    </span>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-300" />
                    <Input
                      value={classCode}
                      onChange={e => {
                        setClassCode(e.target.value.toUpperCase());
                        setError('');
                      }}
                      placeholder="Organization Code"
                      className="h-11 pl-10 text-sm text-brand-50 bg-white/5 border-white/10 placeholder:text-brand-300/40 focus-visible:ring-1 focus-visible:ring-brand-400 focus-visible:border-brand-400 rounded-xl font-mono tracking-widest transition-all"
                    />
                  </div>
                </div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs px-4 py-3 rounded-xl border text-red-200 bg-red-950/20 border-red-900/30"
                >
                  {error}
                </motion.p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-bold text-sm text-neutral-950 bg-gradient-to-r from-brand-300 to-brand-500 hover:from-brand-200 hover:to-brand-400 rounded-xl flex items-center justify-center gap-2 mt-6 shadow-xl shadow-brand-500/10 active:scale-[0.99] transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing Profile...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-sm text-center mt-6 text-brand-200">
              Already have an account?{' '}
              <Link href="/login" className="text-amber-400 hover:text-brand-200 font-semibold transition-colors ml-1">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Persistent Page Footer */}
      <footer className="w-full max-w-7xl mx-auto flex justify-between items-center relative z-10 pt-6 border-t border-white/5">
        <p className="text-xs text-brand-300/60 font-mono">
          © {new Date().getFullYear()} Printly Hub Engine. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
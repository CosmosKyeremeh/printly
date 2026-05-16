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
    <div className="min-h-screen bg-brand-950 flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(145deg, #420001 0%, #2a0001 50%, #040b15 100%)' }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #b67e7d 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #64000040 0%, transparent 70%)' }}
        />

        <motion.div
          className="relative z-10 max-w-sm w-full"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex items-center gap-3 mb-14">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: '#b67e7d', boxShadow: '0 8px 24px #b67e7d30' }}
            >
              <PrinterIcon className="w-5 h-5 text-brand-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-lg tracking-tight">ClassPrint Hub</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.08] tracking-tight mb-5">
            Print smarter.<br />
            <span style={{ color: '#b67e7d' }}>Not harder.</span>
          </h1>
          <p className="leading-relaxed mb-12" style={{ color: '#c99897' }}>
            One place for your whole class to submit, queue, and collect printed assignments.
          </p>

          <div className="space-y-3">
            {[
              { icon: <GraduationCap className="w-4 h-4" style={{ color: '#b67e7d' }} />, title: 'Students', desc: 'Upload files and track print status' },
              { icon: <ShieldCheck className="w-4 h-4" style={{ color: '#b67e7d' }} />, title: 'Admins', desc: 'Manage queue, categories and payments' },
            ].map(({ icon, title, desc }) => (
              <div key={title}
                className="flex items-center gap-4 rounded-xl p-4 border"
                style={{ background: '#42000130', borderColor: '#64000060' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: '#64000040' }}
                >
                  {icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9d6463' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-brand-950">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center px-6 py-5 border-b" style={{ borderColor: '#64000040' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#b67e7d' }}>
              <PrinterIcon className="w-4 h-4 text-brand-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold">ClassPrint Hub</span>
          </div>
        </div>

        {/* Mobile hero */}
        <div className="lg:hidden border-b px-6 py-6" style={{ background: '#42000120', borderColor: '#64000040' }}>
          <h2 className="text-2xl font-black text-white">
            Print smarter.<br />
            <span style={{ color: '#b67e7d' }}>Not harder.</span>
          </h2>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Banners */}
            {justSignedUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl p-4 mb-6 border"
                style={{ background: '#420001', borderColor: '#64000060' }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#b67e7d' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#b67e7d' }}>Account created!</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9d6463' }}>Sign in below to access your dashboard</p>
                </div>
              </motion.div>
            )}

            {passwordReset && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 rounded-xl p-4 mb-6 border"
                style={{ background: '#420001', borderColor: '#64000060' }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: '#b67e7d' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#b67e7d' }}>Password updated!</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9d6463' }}>Sign in with your new password</p>
                </div>
              </motion.div>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
              <p className="text-sm mt-1" style={{ color: '#9d6463' }}>Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#c99897' }}>
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu.gh"
                  required
                  className="h-11 text-white placeholder:text-brand-700 transition-colors"
                  style={{
                    background: '#420001',
                    borderColor: '#640000',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#c99897' }}>
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 text-white placeholder:text-brand-700 pr-11 transition-colors"
                    style={{ background: '#420001', borderColor: '#640000' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#9d6463' }}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: '#b67e7d' }}
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-3.5 border"
                  style={{ background: '#42000180', borderColor: '#640000' }}
                >
                  <p className="text-sm" style={{ color: '#c99897' }}>{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-black text-sm transition-all rounded-xl mt-2 text-white"
                style={{
                  background: loading ? '#640000' : 'linear-gradient(135deg, #640000, #b67e7d)',
                  boxShadow: '0 8px 24px #64000040',
                }}
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
              {[
                { icon: <GraduationCap className="w-5 h-5 mx-auto mb-1" style={{ color: '#b67e7d' }} />, label: 'Student', hint: 'Use your student email' },
                { icon: <ShieldCheck className="w-5 h-5 mx-auto mb-1" style={{ color: '#b67e7d' }} />, label: 'Admin', hint: 'Use your admin email' },
              ].map(({ icon, label, hint }) => (
                <div key={label}
                  className="rounded-xl p-3 text-center border"
                  style={{ background: '#42000130', borderColor: '#64000050' }}
                >
                  {icon}
                  <p className="text-sm font-medium" style={{ color: '#c99897' }}>{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a4a49' }}>{hint}</p>
                </div>
              ))}
            </div>

            <p className="text-sm text-center mt-6" style={{ color: '#7a4a49' }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold transition-colors hover:opacity-80" style={{ color: '#b67e7d' }}>
                Create one free
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-950" />}>
      <LoginForm />
    </Suspense>
  );
}
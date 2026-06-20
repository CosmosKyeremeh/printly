'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResetPasswordPage() {
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [done, setDone]               = useState(false);
  const supabase = createClient();
  const router   = useRouter();

  useEffect(() => {
    // Check existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });

    // Listen for PASSWORD_RECOVERY event from the hash token in the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) {
          setSessionReady(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!sessionReady) {
      setError('Session expired. Request a new password reset link.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.push('/login?reset=success'), 2000);
  }

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-brand-500/10 border border-brand-500/20">
          <ShieldCheck className="w-6 h-6 text-brand-500" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-1">
          Set new password
        </h1>
        <p className="text-sm mb-8 text-brand-200/60">
          Choose a strong password for your account.
        </p>

        {done ? (
          <div className="rounded-xl p-4 text-center border bg-emerald-950/30 border-emerald-900/50">
            <p className="text-emerald-400 font-semibold text-sm">
              Password updated. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-brand-300">
                New password
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="h-11 text-white pr-10 bg-brand-900/40 border-brand-800 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors text-brand-600 hover:text-brand-300"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-brand-300">
                Confirm password
              </Label>
              <Input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                required
                className="h-11 text-white bg-brand-900/40 border-brand-800 focus-visible:ring-1 focus-visible:ring-brand-500 focus-visible:border-brand-500"
              />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3 border text-red-300 bg-red-950/40 border-red-900/50">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading || !sessionReady}
              className="w-full h-12 font-black text-sm text-brand-950 rounded-xl shadow-lg transition-all active:scale-[0.98] bg-gradient-to-br from-brand-300 to-brand-500 hover:from-brand-200 hover:to-brand-400"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin text-brand-950" />Updating...</>
                : 'Update password'
              }
            </Button>

            {!sessionReady && (
              <p className="text-xs text-center text-brand-600">
                Waiting for session from reset link...
              </p>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
}
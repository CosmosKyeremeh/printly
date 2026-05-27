'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PrinterIcon, Loader2, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 antialiased">
      <motion.div
        className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 shadow-sm">
            <PrinterIcon className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Printly</span>
        </div>

        <div className="rounded-2xl p-8 border border-zinc-900 bg-zinc-900/20 backdrop-blur-xl shadow-2xl">
          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-zinc-900 border border-zinc-800">
                <Mail className="w-5 h-5 text-zinc-400" />
              </div>

              <h1 className="text-2xl font-medium tracking-tight text-zinc-100 mb-1">
                Reset your password
              </h1>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                Enter your email address and we&apos;ll broadcast an access-token reset link to your inbox.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-zinc-400">
                    Email address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu.gh"
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
                    <span className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending Link...
                    </span>
                  ) : 'Send reset link'}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5 bg-zinc-900 border border-zinc-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-medium text-zinc-100 mb-2 tracking-tight">Check your email</h2>
              <p className="text-sm text-zinc-500 leading-relaxed">
                We broadcasted an allocation token link to <span className="text-zinc-300 font-medium">{email}</span>. Please verify your execution context.
              </p>
            </motion.div>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 mt-6 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
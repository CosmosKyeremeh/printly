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
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#b67e7d' }}>
            <PrinterIcon className="w-4 h-4 text-brand-950" strokeWidth={2.5} />
          </div>
          <span className="text-white font-black tracking-tight">Printly</span>
        </div>

        <div
          className="rounded-2xl p-8 border"
          style={{ background: '#420001', borderColor: '#64000060' }}
        >
          {!sent ? (
            <>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: '#64000050' }}
              >
                <Mail className="w-7 h-7" style={{ color: '#b67e7d' }} />
              </div>

              <h1 className="text-2xl font-black text-white tracking-tight mb-1">
                Reset your password
              </h1>
              <p className="text-sm mb-6" style={{ color: '#9d6463' }}>
                Enter your email and we&apos;ll send a reset link.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium" style={{ color: '#c99897' }}>
                    Email address
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu.gh"
                    required
                    className="h-11 text-white placeholder:text-brand-700"
                    style={{ background: '#2a0001', borderColor: '#640000' }}
                  />
                </div>

                {error && (
                  <p className="text-sm" style={{ color: '#c99897' }}>{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 font-bold text-sm rounded-xl text-white"
                  style={{ background: 'linear-gradient(135deg, #640000, #b67e7d)' }}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </span>
                  ) : 'Send reset link'}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: '#64000050' }}
              >
                <CheckCircle2 className="w-8 h-8" style={{ color: '#b67e7d' }} />
              </div>
              <h2 className="text-xl font-black text-white mb-2">Check your email</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#9d6463' }}>
                We sent a reset link to <span style={{ color: '#b67e7d' }}>{email}</span>.
                Check your inbox and follow the link to reset your password.
              </p>
            </motion.div>
          )}
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 mt-6 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: '#9d6463' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </motion.div>
    </div>
  );
}
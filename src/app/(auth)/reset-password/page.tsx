'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PrinterIcon, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login?reset=success');
  }

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#b67e7d' }}>
            <PrinterIcon className="w-4 h-4 text-brand-950" strokeWidth={2.5} />
          </div>
          <span className="text-white font-black tracking-tight">ClassPrint Hub</span>
        </div>

        <div className="rounded-2xl p-8 border" style={{ background: '#420001', borderColor: '#64000060' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: '#64000050' }}
          >
            <ShieldCheck className="w-7 h-7" style={{ color: '#b67e7d' }} />
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            Set new password
          </h1>
          <p className="text-sm mb-6" style={{ color: '#9d6463' }}>
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium" style={{ color: '#c99897' }}>
                New password
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="h-11 text-white pr-11"
                  style={{ background: '#2a0001', borderColor: '#640000' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#9d6463' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium" style={{ color: '#c99897' }}>
                Confirm password
              </Label>
              <Input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                required
                className="h-11 text-white"
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
                  Updating...
                </span>
              ) : 'Update password'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
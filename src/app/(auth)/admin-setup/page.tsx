'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PrinterIcon, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSetupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleAdminRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Secure server-side signature validation check
    const res = await fetch('/api/auth/validate-admin-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: adminCode }),
    });

    if (!res.ok) {
      setError('System verification failed: Invalid authorization signature.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Security key requirements demand min. 8 alphanumeric bounds.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          full_name: fullName, 
          role: 'admin' 
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login?signup=success');
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-center items-center p-6 font-sans antialiased">
      <motion.div
        className="w-full max-w-[400px] border border-zinc-900 bg-zinc-900/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 shadow-sm">
            <PrinterIcon className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-semibold text-base tracking-tight text-zinc-200">Printly Console</span>
        </div>

        <div className="mb-6 space-y-1.5">
          <div className="flex items-center gap-2 text-red-400 text-xs font-semibold tracking-wider uppercase">
            <ShieldAlert className="w-3.5 h-3.5" /> Elevated Interface
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-zinc-100">Initialize Admin Profile</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Provision infrastructure parameters. Requires valid security signature activation token.
          </p>
        </div>

        <form onSubmit={handleAdminRegister} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-medium text-zinc-400">Full name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="E.g., Administrator Name"
              required
              className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-zinc-400">Administrative email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@university.edu.gh"
              required
              className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium text-zinc-400">Security password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              className="h-10 px-3 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 text-sm placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adminCode" className="text-xs font-medium text-zinc-400">System authorization token</Label>
            <Input
              id="adminCode"
              type="password"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Enter cryptographic signature code"
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
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Validating Signatures...
              </span>
            ) : 'Authorize & Provision'}
          </Button>
        </form>

        <p className="text-xs text-center mt-6 text-zinc-500">
          <Link href="/login" className="text-zinc-400 hover:text-zinc-200 transition-colors">
            Return to regular workspace
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2, PrinterIcon, GraduationCap,
  Building2, KeyRound, CheckCircle2,
} from 'lucide-react';

type Props = { isFirstSetup: boolean };

export function SignupForm({ isFirstSetup }: Props) {
  const [fullName, setFullName]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [orgName, setOrgName]         = useState('');
  const [className, setClassName]     = useState('');
  const [joinCode, setJoinCode]       = useState('');
  const [resolvedOrg, setResolvedOrg] = useState<{ id: string; name: string } | null>(null);
  const [codeChecking, setCodeChecking] = useState(false);
  const [codeError, setCodeError]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleCodeBlur() {
    if (!joinCode.trim()) return;
    setCodeChecking(true);
    setCodeError('');
    setResolvedOrg(null);

    const res = await fetch(`/api/organizations/lookup?code=${joinCode.trim()}`);
    const data = await res.json();

    if (!res.ok || data.error) {
      setCodeError('Invalid join code. Ask your class rep for the correct code.');
    } else {
      setResolvedOrg({ id: data.orgId, name: data.orgName });
    }
    setCodeChecking(false);
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    let orgId: string;
    let role: string;

    if (isFirstSetup) {
      if (!orgName.trim() || !className.trim()) {
        setError('Please fill in your school and class name.');
        return;
      }

      // ── Call with explicit timeout so it can't hang forever ──
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      let res: Response;
      try {
        res = await fetch('/api/organizations/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolName: orgName.trim(),
            className: className.trim(),
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (fetchErr: unknown) {
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          setError('Request timed out. Check your internet connection.');
        } else {
          setError(`Network error: ${fetchErr instanceof Error ? fetchErr.message : 'Unknown'}`);
        }
        return;
      }

      // ── Parse response safely ──
      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        setError(`Server returned invalid response (status ${res.status}). Check terminal logs.`);
        return;
      }

      if (!res.ok || !data.orgId) {
        setError(
          typeof data.error === 'string'
            ? data.error
            : `Failed to create organization (status ${res.status})`
        );
        return;
      }

      orgId = data.orgId as string;
      role  = 'superadmin';

    } else {
      if (!resolvedOrg) {
        setError('Please enter and validate your join code first.');
        return;
      }
      orgId = resolvedOrg.id;
      role  = 'student';
    }

    // ── Sign up the user ──
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          org_id: orgId,
        },
      },
    });

    if (authError) {
      setError(`Auth error: ${authError.message}`);
      return;
    }

    router.push('/login?signup=success');

  } catch (unexpectedErr: unknown) {
    setError(
      `Unexpected error: ${unexpectedErr instanceof Error ? unexpectedErr.message : 'Unknown error'}`
    );
  } finally {
    // ── Always reset loading — no matter what path was taken ──
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen flex relative overflow-hidden font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* ── Vivid Full-Screen Background Image (Matches printly-background.jpg layout) ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/school/printly-background.jpg"
          alt="Campus Workspace"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Subtle vignette layer just to ground the layout edges without masking out the scenery */}
        <div className="absolute inset-0 bg-zinc-950/20 mix-blend-multiply" />
      </div>

      {/* ── Left Side Panel: Info Glass Card ── */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900/90 shadow-xl border border-zinc-800">
            <PrinterIcon className="w-5 h-5 text-amber-400" strokeWidth={2.5} />
          </div>
          <span className="text-white font-black text-xl tracking-wider uppercase drop-shadow">Printly</span>
        </div>

        <motion.div
          className="max-w-md backdrop-blur-xl rounded-3xl p-8 border border-white/[0.08] bg-zinc-950/70 shadow-2xl"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {isFirstSetup ? (
            <>
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
                Create your<br />
                <span className="text-amber-400">deployment key.</span>
              </h1>
              <p className="text-sm leading-relaxed mb-6 text-zinc-300">
                Fluid workflow optimizes your school network. Initialize the infrastructure workspace settings here to establish the platform's superadmin nodes.
              </p>
              <div className="flex items-start gap-4 rounded-2xl p-4 border border-zinc-800/80 bg-zinc-900/40">
                <Building2 className="w-5 h-5 mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-zinc-200 text-sm font-semibold">Administrative Edge</p>
                  <p className="text-xs mt-1 leading-relaxed text-zinc-400">
                    Achieves complete workspace configuration. Direct processing chains let you coordinate user pools and access points immediately after staging completes.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
                Join your<br />
                <span className="text-amber-400">class cluster.</span>
              </h1>
              <p className="text-sm leading-relaxed mb-6 text-zinc-300">
                Your designated classroom operator has generated this network environment. Enter your dynamic string parameter key to mount your personal account layout.
              </p>
              <div className="flex items-center gap-4 rounded-2xl p-4 border border-zinc-800/80 bg-zinc-900/40">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-950 border border-zinc-800">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-zinc-200 text-sm font-semibold">Verified Student Node</p>
                  <p className="text-xs mt-0.5 text-zinc-400">Upload individual engineering files and track your hardware print pipelines live.</p>
                </div>
              </div>
            </>
          )}
        </motion.div>
        
        <p className="text-xs text-white/60 font-mono tracking-widest bg-zinc-950/40 backdrop-blur-sm self-start px-3 py-1 rounded-md border border-white/[0.04]">
          STABLE // SYSTEM_ONLINE
        </p>
      </div>

      {/* ── Right Side Panel: Form Container (backdrop-blur-md bg-zinc-950/60) ── */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10 justify-center items-center p-6 sm:p-12 lg:p-16">
        
        {/* Mobile Header Block */}
        <div className="lg:hidden w-full max-w-md flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08] bg-zinc-950/40 backdrop-blur-md p-4 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800">
              <PrinterIcon className="w-4 h-4 text-amber-400" strokeWidth={2} />
            </div>
            <span className="text-white font-bold tracking-wider text-sm">PRINTLY</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">V2.4</span>
        </div>

        {/* Form Panel Glass Overlay matching visual specifications exact code tags */}
        <motion.div
          className="w-full max-w-md backdrop-blur-md bg-zinc-950/60 border border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              {isFirstSetup ? 'Create Workspace' : 'Create Account'}
            </h2>
            <p className="text-xs mt-1 font-mono text-zinc-400">
              backdrop-blur-md bg-zinc-950/60
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── First setup inputs ── */}
            {isFirstSetup && (
              <div className="space-y-3 pb-4 border-b border-white/[0.08]">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold tracking-wide uppercase text-zinc-300">School / University</Label>
                  <Input
                    value={orgName}
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="University of Mines and Technology"
                    required={isFirstSetup}
                    className="h-11 text-sm bg-zinc-950/90 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 transition-all rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold tracking-wide uppercase text-zinc-300">Class / Department</Label>
                  <Input
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="Computer Engineering — Level 300"
                    required={isFirstSetup}
                    className="h-11 text-sm bg-zinc-950/90 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 transition-all rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* ── Join Key Input ── */}
            {!isFirstSetup && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold tracking-wide uppercase text-zinc-300">Organization Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    value={joinCode}
                    onChange={e => {
                      setJoinCode(e.target.value.toUpperCase());
                      setResolvedOrg(null);
                      setCodeError('');
                    }}
                    onBlur={handleCodeBlur}
                    placeholder="Organization Code"
                    className="h-11 text-sm bg-zinc-950/90 border-zinc-800 text-white pl-10 uppercase tracking-widest font-mono placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 transition-all rounded-xl"
                  />
                  {codeChecking && (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-amber-400" />
                  )}
                  {resolvedOrg && (
                    <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  )}
                </div>
                {codeError && (
                  <p className="text-xs font-mono text-rose-400 mt-1">{codeError}</p>
                )}
                {resolvedOrg && (
                  <p className="text-xs font-mono text-emerald-400 mt-1">
                    ✓ Code Active: <span className="underline font-bold text-emerald-300">{resolvedOrg.name}</span>
                  </p>
                )}
              </div>
            )}

            {/* ── User Setup Parameters ── */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide uppercase text-zinc-300">Full Name</Label>
              <Input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                required
                className="h-11 text-sm bg-zinc-950/90 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide uppercase text-zinc-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@university.edu.gh"
                required
                className="h-11 text-sm bg-zinc-950/90 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold tracking-wide uppercase text-zinc-300">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                className="h-11 text-sm bg-zinc-950/90 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:border-amber-400 transition-all rounded-xl"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono"
              >
                {error}
              </motion.div>
            )}

            {/* Gradient Gold Form Action Call (Matches create account action button styling) */}
            <Button
              type="submit"
              disabled={loading || (!isFirstSetup && !resolvedOrg)}
              className="w-full h-11 font-bold text-xs uppercase tracking-wider text-zinc-950 rounded-xl mt-4 transition-all bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-[0.99] disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500"
              style={{
                boxShadow: '0 4px 25px rgba(245, 158, 11, 0.2)'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1">
                  Create Account <span className="text-sm">→</span>
                </span>
              )}
            </Button>
          </form>

          <p className="text-xs text-center font-medium mt-6 text-zinc-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4">
              Sign in
            </Link>
          </p>

          {isFirstSetup && (
            <p className="text-[10px] text-center font-mono mt-4 text-zinc-500 border-t border-white/[0.06] pt-4">
              NOTICE: Deploy sequence locked. This configuration screen will deprecate immediately upon successful root account activation.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
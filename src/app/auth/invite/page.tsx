'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PrinterIcon, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';

function InviteContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [copied, setCopied] = useState(false);

  function copyCode() {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const signupHref = code ? `/signup?code=${encodeURIComponent(code)}` : '/signup';

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6 antialiased selection:bg-brand-500/20 selection:text-brand-300">
      <div className="w-full max-w-md text-center">

        {/* Subtle Ambient Glow Behind Icon */}
        <div className="relative mx-auto mb-6 w-14 h-14">
          <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full" />
          <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-900 border border-brand-500/20 shadow-xl shadow-brand-950/50">
            <PrinterIcon className="w-6 h-6 text-brand-400" strokeWidth={1.75} />
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-3xl font-medium text-zinc-100 tracking-tight mb-2">
          You&apos;re invited to Printly
        </h1>
        <p className="text-sm text-brand-300/70 max-w-sm mx-auto mb-8 leading-relaxed">
          Your class rep has set up Printly for assignment submissions and printing.
          Create your account to get started.
        </p>

        {/* Join code — carried over from the invite link so the student can copy it before signing up */}
        {code && (
          <div className="rounded-xl border border-brand-500/20 bg-brand-900/10 backdrop-blur-sm p-4 mb-6 text-left">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-300/70 mb-2">
              Your class join code
            </p>
            <div className="flex items-center gap-3 rounded-lg bg-black/20 border border-brand-500/10 px-3.5 py-2.5">
              <span className="flex-1 text-lg font-mono font-medium tracking-[0.2em] text-brand-100">
                {code}
              </span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0"
                style={{
                  background: copied ? 'rgba(20,83,45,0.2)' : 'rgba(106,73,32,0.2)',
                  color: copied ? '#4ade80' : '#cca152',
                }}
              >
                {copied
                  ? <><CheckCircle2 className="w-3.5 h-3.5" />Copied</>
                  : <><Copy className="w-3.5 h-3.5" />Copy</>
                }
              </button>
            </div>
            <p className="text-[11px] text-brand-300/60 mt-2 leading-relaxed">
              It&apos;s already filled in for you below — copy it anyway in case you sign up later or on another device.
            </p>
          </div>
        )}

        {/* Core Actions */}
        <div className="space-y-3">
          <Link
            href={signupHref}
            className="group flex items-center justify-center gap-2 w-full h-12 text-sm font-medium text-zinc-950 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-300 hover:to-brand-400 rounded-xl transition-all duration-300 transform active:scale-[0.99] shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20"
          >
            Create my account
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center w-full h-12 text-sm font-medium text-brand-300 hover:text-brand-200 rounded-xl border border-brand-800/60 bg-brand-900/10 hover:bg-brand-900/30 backdrop-blur-sm transition-all duration-300"
          >
            I already have an account
          </Link>
        </div>

        {/* Footer Support Notice */}
        <p className="text-xs text-brand-800 mt-8 font-medium tracking-wide">
          Need help? Contact your class rep.
        </p>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-950" />}>
      <InviteContent />
    </Suspense>
  );
}

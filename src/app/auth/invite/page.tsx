import Link from 'next/link';
import { PrinterIcon, ArrowRight } from 'lucide-react';

export default function InvitePage() {
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

        {/* Core Actions */}
        <div className="space-y-3">
          <Link 
            href="/signup"
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
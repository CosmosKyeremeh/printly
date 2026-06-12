import Link from 'next/link';
import { PrinterIcon, ArrowRight } from 'lucide-react';

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: '#b67e7d', boxShadow: '0 8px 24px #b67e7d30' }}>
          <PrinterIcon className="w-7 h-7" style={{ color: '#040b15' }} strokeWidth={2.5} />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-2">
          You&apos;re invited to Printly
        </h1>
        <p className="mb-8" style={{ color: '#9d6463' }}>
          Your class rep has set up Printly for assignment submissions and printing.
          Create your account to get started.
        </p>

        <div className="space-y-3">
          <Link href="/signup"
            className="flex items-center justify-center gap-2 w-full h-12 font-black text-sm text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #640000, #b67e7d)' }}>
            Create my account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login"
            className="flex items-center justify-center w-full h-12 font-semibold text-sm rounded-xl border transition-all"
            style={{ color: '#9d6463', borderColor: '#64000050', background: '#42000120' }}>
            I already have an account
          </Link>
        </div>

        <p className="text-xs mt-8" style={{ color: '#7a4a49' }}>
          Need help? Contact your class rep.
        </p>
      </div>
    </div>
  );
}
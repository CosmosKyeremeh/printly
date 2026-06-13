import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  PrinterIcon, Upload, Shield, Bell, CreditCard,
  RefreshCw, ArrowRight, CheckCircle2, Users,
  Star, AlertCircle
} from 'lucide-react';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LandingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const next = typeof resolvedParams.next === 'string' ? resolvedParams.next : '';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    redirect(profile?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
  }

  // Construct search query string for internal links
  const authQuery = next ? `?next=${encodeURIComponent(next)}` : '';

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <PrinterIcon className="w-3.5 h-3.5 text-zinc-950" strokeWidth={2.5} />
            </div>
            <span className="text-white font-black text-sm tracking-tight">Printly</span>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href={`/login${authQuery}`}
              className="text-zinc-400 hover:text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link 
              href={`/signup${authQuery}`}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold px-3 py-2 rounded-lg transition-all shadow-lg shadow-amber-500/20"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO & CONTEXT BANNER ── */}
      <section className="relative pt-32 pb-24 px-5 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          
          {/* Graceful Authentication Context Banner */}
          {next && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-3xl max-w-md mx-auto mb-6 flex items-center gap-3 bg-zinc-900/80 border border-amber-500/30 rounded-xl p-3 shadow-xl backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-zinc-300 text-xs font-medium text-left">
                Please <Link href={`/login${authQuery}`} className="text-amber-400 font-bold hover:underline">sign in</Link> or <Link href={`/signup${authQuery}`} className="text-amber-400 font-bold hover:underline">create an account</Link> to access that page.
              </p>
            </div>
          )}

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-amber-400 text-xs font-semibold">Experience consistent printing</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Stop wasting time<br />
            <span className="text-amber-500">at the printer queue.</span>
          </h1>

          <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your assignments once. Your class rep organises, queues, and prints everything in bulk.
            No more confusion. No more waiting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/signup${authQuery}`}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-base px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/login${authQuery}`}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-semibold text-base px-7 py-3.5 rounded-xl transition-all w-full sm:w-auto justify-center"
            >
              Sign in
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-10">
            {[
              { value: '100%', label: 'Free to start' },
              { value: '50MB', label: 'Max file size' },
              { value: '10+', label: 'File formats' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM STRIP ── */}
      <section className="py-12 px-5 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-zinc-500 text-sm font-semibold uppercase tracking-widest mb-8">
            Sound familiar?
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: '😩', text: 'Waiting 30 minutes in the print queue before a deadline' },
              { emoji: '😤', text: 'The printing manager confused by 50 different files from 50 students' },
              { emoji: '💸', text: 'Chasing students for printing money one by one' },
            ].map(({ emoji, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <span className="text-2xl shrink-0">{emoji}</span>
                <p className="text-zinc-400 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-4xl font-black tracking-tight">
              Three steps.<br />
              <span className="text-zinc-400">That&apos;s it.</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            {[
              {
                step: '01',
                icon: <Upload className="w-6 h-6" />,
                title: 'Student uploads',
                desc: 'Select your category, drag and drop your files, add any printing instructions — done in under a minute.',
              },
              {
                step: '02',
                icon: <PrinterIcon className="w-6 h-6" />,
                title: 'Admin organises',
                desc: 'The class rep sees everything sorted by category. Selects files in bulk and sends to print with one click.',
              },
              {
                step: '03',
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: 'Pay and collect',
                desc: 'Pay your printing fee via mobile money or card. Get notified when your assignment is ready.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 rounded-2xl p-6 transition-colors group">
                  <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center text-amber-500 mb-4 group-hover:bg-amber-500/25 transition-colors">
                    {icon}
                  </div>
                  <span className="text-amber-500/50 text-xs font-bold font-mono">{step}</span>
                  <h3 className="text-white font-bold text-lg mt-1 mb-2">{title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-5 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-500 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-black tracking-tight">Everything you need.</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Upload className="w-5 h-5" />,
                title: 'Multi-file upload',
                desc: 'PDF, DOCX, PPTX, XLSX, ZIP, images — drag and drop up to 50MB per file.',
              },
              {
                icon: <RefreshCw className="w-5 h-5" />,
                title: 'File conversion',
                desc: 'Convert between PDF and DOCX instantly without leaving the app.',
              },
              {
                icon: <Bell className="w-5 h-5" />,
                title: 'Deadline alerts',
                desc: 'Admins send reminders. Students never miss a submission deadline.',
              },
              {
                icon: <CreditCard className="w-5 h-5" />,
                title: 'Mobile money payments',
                desc: 'Pay printing fees via MTN MoMo, Stripe, or card. Receipts sent automatically.',
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: 'Role-based access',
                desc: 'Students see their own files. Admins see everything. Secured at the database level.',
              },
              {
                icon: <PrinterIcon className="w-5 h-5" />, // Replaced text-only Icon assignment
                title: 'Printing instructions',
                desc: 'Leave notes per file — number of copies, double-sided, edits needed. Admin sees it all.',
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-colors"
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-amber-500 mb-4">
                  {icon}
                </div>
                <h3 className="text-white font-bold text-sm mb-1.5">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR STUDENTS / FOR ADMINS ── */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
          {/* Students */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">For Students</p>
                <h3 className="text-white font-black text-xl">Submit in seconds</h3>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                'Upload multiple files at once',
                'Leave printing instructions per file',
                'Track print status in real time',
                'Convert PDFs to editable DOCX',
                'Pay printing fees from your phone',
                'Get notified when prints are ready',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-zinc-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/signup${authQuery}`}
              className="inline-flex items-center gap-2 mt-8 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-lg transition-all"
            >
              Sign up as student <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Admins */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">For Admins</p>
                <h3 className="text-white font-black text-xl">Total control</h3>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                'See all submissions in one dashboard',
                'Read per-file printing instructions',
                'Bulk select and queue for printing',
                'Create categories with deadlines',
                'Send announcements to all students',
                'Track payments and print history',
              ].map(item => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="text-zinc-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/signup${authQuery}`}
              className="inline-flex items-center gap-2 mt-8 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg transition-all"
            >
              Sign up as admin <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/30">
                <PrinterIcon className="w-7 h-7 text-zinc-950" strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-black tracking-tight mb-4">
                Ready to end the<br />printer chaos?
              </h2>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                Join your class on Printly. Free to start, takes 30 seconds to set up.
              </p>
              <Link
                href={`/signup${authQuery}`}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-base px-8 py-4 rounded-xl transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5"
              >
                Create your free account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-900 bg-zinc-950 pt-16 pb-12 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-zinc-900">
            
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-amber-500 rounded flex items-center justify-center shadow-md shadow-amber-500/20">
                  <PrinterIcon className="w-3 h-3 text-zinc-950" strokeWidth={2.5} />
                </div>
                <span className="text-white font-black text-sm tracking-tight">Printly</span>
              </div>
              <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
                The centralized assignment submission and automated bulk printing network
              </p>
            </div>

            {/* Platform Links */}
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Platform</p>
              <ul className="space-y-2 text-xs">
                <li><Link href={`/login${authQuery}`} className="text-zinc-500 hover:text-white transition-colors">Student Portal</Link></li>
                <li><Link href={`/login${authQuery}`} className="text-zinc-500 hover:text-white transition-colors">Admin Dashboard</Link></li>
                <li><Link href={`/signup${authQuery}`} className="text-zinc-500 hover:text-white transition-colors">Register Cohort</Link></li>
              </ul>
            </div>

            {/* Technical Links */}
            <div className="space-y-3">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">System</p>
              <ul className="space-y-2 text-xs">
                <li><span className="text-zinc-600">Status: </span><span className="text-emerald-500/80 font-medium">Operational</span></li>
                <li><Link href="#" className="text-zinc-500 hover:text-white transition-colors">Database Security</Link></li>
                <li><Link href="#" className="text-zinc-500 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-xs font-medium tracking-tight">
              &copy; 2026 Printly. All rights reserved.
            </p>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs bg-zinc-900/40 border border-zinc-900/80 px-3 py-1.5 rounded-full">
              <span>Crafted for You</span>
              <span className="text-zinc-700">|</span>
              <span>🤏</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
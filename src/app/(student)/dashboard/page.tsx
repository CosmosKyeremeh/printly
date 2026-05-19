import { createClient } from '@/lib/supabase/server';
import { FileText, Upload, Clock, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';
import { FadeIn } from '@/components/shared/FadeIn';

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single();

  const { data: files } = await supabase
    .from('files')
    .select('status, payment_status, created_at')
    .eq('owner_id', user!.id);

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, content, type, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const total    = files?.length ?? 0;
  const queued   = files?.filter(f => f.status === 'queued').length ?? 0;
  const printing = files?.filter(f => f.status === 'printing').length ?? 0;
  const done     = files?.filter(f => f.status === 'done').length ?? 0;
  const unpaid   = files?.filter(f => f.payment_status === 'pending').length ?? 0;

  const stats = [
    { label: 'Total Uploads',   value: total,    icon: <FileText className="w-5 h-5" />,     color: 'text-zinc-400',   bg: 'bg-zinc-800' },
    { label: 'In Queue',        value: queued,   icon: <Clock className="w-5 h-5" />,         color: 'text-amber-400',  bg: 'bg-amber-500/15' },
    { label: 'Printing',        value: printing, icon: <Upload className="w-5 h-5" />,        color: 'text-blue-400',   bg: 'bg-blue-500/15' },
    { label: 'Completed',       value: done,     icon: <CheckCircle2 className="w-5 h-5" />,  color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  ];

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Greeting section */}
      <FadeIn delay={0}>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Hey, {firstName} 👋
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Here&apos;s an overview of your submissions.
          </p>
        </div>
      </FadeIn>

      {/* Stats grid */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color} mb-3`}>
                {icon}
              </div>
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* Unpaid alert or quick actions */}
      <FadeIn delay={0.2}>
        <div className="space-y-6">
          {/* Unpaid alert */}
          {unpaid > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-amber-400 font-semibold text-sm">Payment required</p>
                <p className="text-amber-400/70 text-xs mt-0.5">
                  {unpaid} file{unpaid > 1 ? 's' : ''} pending payment before printing
                </p>
              </div>
              <Link
                href="/payments"
                className="text-xs font-bold text-amber-500 hover:text-amber-400 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 rounded-lg transition-all"
              >
                Pay now →
              </Link>
            </div>
          )}

          {/* Quick actions or Onboarding block */}
          {total === 0 ? (
            /* ── Onboarding empty state ── */
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 bg-amber-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Upload className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">Welcome to Printly</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                You&apos;re all set. Upload your first assignment to get started.
                Select a category, drop your file, and leave any printing instructions for your admin.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/upload"
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 w-full sm:w-auto justify-center"
                >
                  <Upload className="w-4 h-4" />
                  Upload your first file
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-zinc-800">
                {[
                  { step: '01', text: 'Upload your assignment' },
                  { step: '02', text: 'Admin queues it for printing' },
                  { step: '03', text: 'Pay and collect' },
                ].map(({ step, text }) => (
                  <div key={step} className="text-center">
                    <span className="text-amber-500 text-xs font-bold font-mono">{step}</span>
                    <p className="text-zinc-500 text-xs mt-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ── Quick actions (existing) ── */
            <div>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick actions</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  href="/upload"
                  className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 rounded-xl p-4 transition-all group"
                >
                  <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
                    <Upload className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Upload assignment</p>
                    <p className="text-zinc-500 text-xs">Submit files for printing</p>
                  </div>
                </Link>
                <Link
                  href="/files"
                  className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all group"
                >
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">View my files</p>
                    <p className="text-zinc-500 text-xs">Track status and downloads</p>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {/* Notifications */}
      <FadeIn delay={0.3}>
        {notifications && notifications.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Announcements</h2>
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                  <p className="text-white text-sm font-semibold">{n.title}</p>
                  <p className="text-zinc-400 text-xs mt-1">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}
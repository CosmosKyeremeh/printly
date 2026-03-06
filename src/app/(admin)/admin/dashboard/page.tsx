import { createClient } from '@/lib/supabase/server';
import { Users, FileText, PrinterIcon, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalFiles },
    { count: totalStudents },
    { count: queuedFiles },
    { count: unpaidFiles },
  ] = await Promise.all([
    supabase.from('files').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('print_queue').select('*', { count: 'exact', head: true }).eq('status', 'queued'),
    supabase.from('files').select('*', { count: 'exact', head: true }).eq('payment_status', 'pending'),
  ]);

  const { data: recentFiles } = await supabase
    .from('files')
    .select('id, file_name, created_at, status, profiles(full_name, email), categories(name)')
    .order('created_at', { ascending: false })
    .limit(8);

  const stats = [
    { label: 'Total Students', value: totalStudents ?? 0, icon: <Users className="w-5 h-5" />,       color: 'text-zinc-400',    bg: 'bg-zinc-800',        href: null },
    { label: 'Total Files',    value: totalFiles ?? 0,    icon: <FileText className="w-5 h-5" />,     color: 'text-blue-400',    bg: 'bg-blue-500/15',     href: null },
    { label: 'In Queue',       value: queuedFiles ?? 0,   icon: <PrinterIcon className="w-5 h-5" />,  color: 'text-amber-400',   bg: 'bg-amber-500/15',    href: '/admin/queue' },
    { label: 'Awaiting Payment', value: unpaidFiles ?? 0, icon: <CreditCard className="w-5 h-5" />,   color: 'text-red-400',     bg: 'bg-red-500/15',      href: '/admin/payments' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Overview of all submissions and queue status.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, color, bg, href }) => {
          const card = (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${color} mb-3`}>
                {icon}
              </div>
              <p className="text-3xl font-black text-white">{value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
            </div>
          );
          return href
            ? <Link key={label} href={href}>{card}</Link>
            : <div key={label}>{card}</div>;
        })}
      </div>

      {/* Recent submissions */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Recent Submissions</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {recentFiles?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 text-sm">No submissions yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3">File</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3 hidden sm:table-cell">Student</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3 hidden lg:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles?.map((file, i) => (
                  <tr
                    key={file.id}
                    className={`border-b border-zinc-800/50 ${i === (recentFiles.length - 1) ? 'border-0' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <p className="text-white text-sm font-medium truncate max-w-[180px]">{file.file_name}</p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <p className="text-zinc-400 text-sm">
                        {(file.profiles as { full_name: string | null; email: string } | null)?.full_name ??
                         (file.profiles as { full_name: string | null; email: string } | null)?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <p className="text-zinc-500 text-sm">
                        {(file.categories as { name: string } | null)?.name ?? '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        file.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                        file.status === 'printing' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-zinc-700 text-zinc-300'
                      }`}>
                        {file.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
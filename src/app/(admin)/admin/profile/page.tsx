import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/shared/ProfileForm';
import { PrintlyQRCode } from '@/components/shared/PrintlyQRCode';
import { OrgDetailsCard } from '@/components/admin/OrgDetailsCard';
import { UserCircle, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not even authenticated, bounce them to home
  if (!user) {
    redirect('/');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 🔒 Security Gate: If profile doesn't exist or user isn't an admin, reject access
  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch org details separately — includes join code for display
  const org = profile?.org_id
  ? await supabase
      .from('organizations')
      .select('id, name, join_code, created_at')
      .eq('id', profile.org_id)
      .single()
      .then(({ data }) => data)
  : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans antialiased text-zinc-50 space-y-8">
      
      {/* Header Profile Module */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800/80 shadow-sm">
          <UserCircle className="w-4 h-4 text-amber-500" strokeWidth={2} />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-xl font-medium text-zinc-100 tracking-tight">My Profile</h1>
          <p className="text-xs text-zinc-500">Manage your administrative credentials and network access</p>
        </div>
      </div>

      {/* Main Content Layout Block */}
      <div className="space-y-6">
        {/* Org details — shown first so admin sees it immediately */}
        {org && <OrgDetailsCard org={org} />}

        {/* Profile Form Wrapper */}
        <ProfileForm profile={profile} />

        {/* QR Code Segment */}
        <PrintlyQRCode />
      </div>

      {/* ── Administrative Quick Command Links ── */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          System Control Shortcuts
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: '/admin/dashboard', title: 'Operational Terminal', icon: <Terminal className="w-3.5 h-3.5" />, desc: 'Monitor active queue workflows and stream states.' },
            { href: '/admin/categories', title: 'Hardware Parameters', icon: <ShieldCheck className="w-3.5 h-3.5" />, desc: 'Configure cluster parameters and system thresholds.' },
          ].map((link) => (
            <Link 
              key={link.title} 
              href={link.href}
              className="p-3.5 rounded-xl border border-zinc-900/80 bg-zinc-900/10 hover:bg-zinc-900/40 hover:border-zinc-800 text-left transition-all group flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-zinc-400 group-hover:text-amber-500 transition-colors">
                    {link.icon}
                  </div>
                  <p className="text-sm font-medium text-zinc-200">{link.title}</p>
                </div>
                <p className="text-xs text-zinc-500 leading-normal max-w-[220px]">{link.desc}</p>
              </div>
              <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors mt-0.5 shrink-0" />
            </Link>
          ))}
        </div>
      </div>
      
    </div>
  );
}
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/shared/ProfileForm';
import { UserCircle, FileText, Layers, Ban } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Guard against null or unauthenticated sessions safely
  if (!user) {
    redirect('/login');
  }

  // 2. Access user.id safely without type-forcing or risking testing regressions
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans antialiased text-zinc-50 space-y-8">
      
      {/* Header Profile Module */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800/80 shadow-sm">
          <UserCircle className="w-4 h-4 text-amber-500" strokeWidth={2} />
        </div>
        <div className="space-y-0.5">
          <h1 className="text-xl font-medium text-zinc-100 tracking-tight">My Profile</h1>
          <p className="text-xs text-zinc-500">Manage and update your account workspace details</p>
        </div>
      </div>

      {/* Profile Form Canvas */}
      <ProfileForm profile={profile} />

      {/* ── Modern Activity Metrics Rings ── */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Workspace Fleet Activity
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Pending in Queue', value: '0', icon: <Layers className="w-3.5 h-3.5 text-amber-500" /> },
            { label: 'Completed Jobs', value: '12', icon: <FileText className="w-3.5 h-3.5 text-zinc-400" /> },
            { label: 'Canceled / Dropped', value: '0', icon: <Ban className="w-3.5 h-3.5 text-zinc-600" /> },
          ].map((metric) => (
            <div 
              key={metric.label} 
              className="p-4 rounded-xl border border-zinc-900/80 bg-zinc-900/20 flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-zinc-500 leading-none">{metric.label}</p>
                <p className="text-xl font-medium tracking-tight text-zinc-200">{metric.value}</p>
              </div>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900 border border-zinc-800/60 shadow-inner">
                {metric.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
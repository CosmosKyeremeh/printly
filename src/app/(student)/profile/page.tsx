import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/shared/ProfileForm';
import { UserCircle } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto px-1 py-2">
      
      {/* Header Profile Module */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 text-brand-400">
          <UserCircle className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100 tracking-tight">My Profile</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage and update your account workspace details</p>
        </div>
      </div>

      {/* Profile Form Canvas */}
      <ProfileForm profile={profile} />
      
    </div>
  );
}
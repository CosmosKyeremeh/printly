import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/shared/ProfileForm';
import { UserCircle } from 'lucide-react';

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
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
          <p className="text-xs text-zinc-500 mt-0.5">Manage and view your structural account permissions</p>
        </div>
      </div>

      {/* Profile Form Wrapper */}
      <ProfileForm profile={profile} />
      
    </div>
  );
}
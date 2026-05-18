import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/shared/ProfileForm';
import { UserCircle } from 'lucide-react';
import { redirect } from 'next/navigation'; // Import the redirect utility

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Guard against null or unauthenticated sessions
  if (!user) {
    redirect('/login'); 
  }

  // 2. Now it is completely safe to access user.id without forcing a crash
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id) 
    .single();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: '#64000030' }}>
          <UserCircle className="w-4 h-4" style={{ color: '#b67e7d' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1>
          <p className="text-xs" style={{ color: '#7a4a49' }}>Manage your account details</p>
        </div>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
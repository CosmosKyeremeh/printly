import { createClient } from '@/lib/supabase/server';
import { UserRoleManager } from '@/components/admin/UserRoleManager';
import { InviteStudents } from '@/components/admin/InviteStudents';
import { Users } from 'lucide-react';

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('role')
    .order('full_name');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Users</h1>
          <p className="text-zinc-500 text-xs">
            {profiles?.length ?? 0} registered users
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <InviteStudents />
        <UserRoleManager
          users={profiles ?? []}
          currentUserId={user!.id}
        />
      </div>
    </div>
  );
}
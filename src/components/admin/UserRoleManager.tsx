'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
};

export function UserRoleManager({ users, currentUserId }: { users: UserProfile[]; currentUserId: string }) {
  const [list, setList] = useState(users);
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  async function toggleRole(userId: string, currentRole: string) {
    if (userId === currentUserId) return; // Can't change own role
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    setUpdating(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      setList(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
    }
    setUpdating(null);
  }

  const admins = list.filter(u => u.role === 'admin');
  const students = list.filter(u => u.role === 'student');

  return (
    <div className="space-y-6">
      {/* Admins */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <h3 className="text-white font-bold text-sm">Admins ({admins.length})</h3>
        </div>
        <div className="space-y-2">
          {admins.map(user => (
            <UserRow
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              updating={updating === user.id}
              onToggle={() => toggleRole(user.id, user.role)}
            />
          ))}
        </div>
      </div>

      {/* Students */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-zinc-400" />
          <h3 className="text-white font-bold text-sm">Students ({students.length})</h3>
        </div>
        {students.length === 0 ? (
          <div className="text-center py-10 bg-zinc-900 border border-zinc-800 rounded-xl">
            <Users className="w-7 h-7 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">No students yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map(user => (
              <UserRow
                key={user.id}
                user={user}
                isSelf={false}
                updating={updating === user.id}
                onToggle={() => toggleRole(user.id, user.role)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({
  user,
  isSelf,
  updating,
  onToggle,
}: {
  user: UserProfile;
  isSelf: boolean;
  updating: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="w-9 h-9 bg-zinc-800 rounded-full flex items-center justify-center shrink-0">
        <span className="text-white text-sm font-bold">
          {(user.full_name ?? user.email).charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {user.full_name ?? 'No name set'}
          {isSelf && <span className="text-amber-500 text-xs ml-1.5">(you)</span>}
        </p>
        <p className="text-zinc-500 text-xs truncate">{user.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          user.role === 'admin'
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
        }`}>
          {user.role}
        </span>
        {!isSelf && (
          <button
            onClick={onToggle}
            disabled={updating}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50"
            style={{
              background: '#42000130',
              borderColor: '#64000050',
              color: '#9d6463',
            }}
          >
            {updating
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : `Make ${user.role === 'admin' ? 'student' : 'admin'}`
            }
          </button>
        )}
      </div>
    </div>
  );
}
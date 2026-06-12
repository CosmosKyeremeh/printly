'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export function NotificationBell({ role = 'student' }: { role?: 'student' | 'admin' }) {
  const [unread, setUnread] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  const href = role === 'admin' ? '/admin/notifications' : '/notifications';

  // Memoized fetch function so it can be called safely inside the effect and realtime stream
  const fetchUnread = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('id, read_by')
      .eq('is_global', true);

    if (data) {
      const count = data.filter(n => !n.read_by?.includes(uid)).length;
      setUnread(count);
    }
  }, [supabase]);

  useEffect(() => {
    let channel: any;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserId(user.id);
      fetchUnread(user.id);

      // Realtime subscription — fires fetchUnread whenever notifications alter
      channel = supabase
        .channel('notification-bell')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => fetchUnread(user.id)
        )
        .subscribe();
    });

    // Cleanup subscription channel on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, fetchUnread]);

  return (
    <Link href={href} className="relative p-2 rounded-lg transition-all hover:bg-zinc-800">
      <Bell className="w-5 h-5 text-zinc-400" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-zinc-950 text-xs font-black rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
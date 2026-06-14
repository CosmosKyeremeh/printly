'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export function NotificationBell({ role = 'student' }: { role?: 'student' | 'admin' }) {
  const [unread, setUnread] = useState(0);
  const supabase = createClient();
  const href = role === 'admin' ? '/admin/notifications' : '/notifications';

  const fetchUnread = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('id, read_by')
      .eq('is_global', true);
    if (data) {
      // Counts all entries where the current user id does not exist inside the tracking block
      setUnread(data.filter(n => !n.read_by?.includes(uid)).length);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    let activeChannel: any = null;

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;
      
      await fetchUnread(user.id);

      const channelName = `bell-${user.id}`;

      const existingChannel = supabase.getChannels().find(ch => 
        (ch as any).topic === `realtime:public:${channelName}` || (ch as any).topic?.endsWith(channelName)
      );
      
      if (existingChannel) {
        await supabase.removeChannel(existingChannel);
      }

      if (!isMounted) return;

      activeChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications' },
          () => { if (isMounted) fetchUnread(user.id); }
        );

      activeChannel.subscribe();
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, [supabase, fetchUnread]);

  return (
    <Link
      href={href}
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all hover:bg-zinc-800"
    >
      <Bell className="w-5 h-5 text-zinc-400" />
      {unread > 0 && (
        <span className="absolute top-0.5 right-0.5 flex min-w-[16px] h-4 bg-amber-500 text-zinc-950 text-[9px] font-black rounded-full items-center justify-center px-1 shadow-[0_0_0_2px_rgba(24,24,27,1)] select-none">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
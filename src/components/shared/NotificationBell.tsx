'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUnread() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('notifications')
        .select('id, read_by')
        .eq('is_global', true);

      if (data) {
        const count = data.filter(n => !n.read_by?.includes(user.id)).length;
        setUnread(count);
      }
    }
    fetchUnread();
  }, [supabase]);

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-zinc-400" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-zinc-950 text-xs font-black rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </div>
  );
}
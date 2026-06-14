import { createClient } from '@/lib/supabase/server';
import { Bell } from 'lucide-react';
import { NotificationAccordion } from '@/components/student/NotificationAccordion';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  const unread = notifications?.filter(n => !n.read_by?.includes(user!.id)) ?? [];
  const read   = notifications?.filter(n =>  n.read_by?.includes(user!.id)) ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center">
          <Bell className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-zinc-500 text-xs">
            {unread.length > 0
              ? `${unread.length} unread · tap a message to read it`
              : `All ${read.length} notifications read`}
          </p>
        </div>
      </div>

      {(!notifications || notifications.length === 0) ? (
        <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm font-medium">No notifications yet</p>
          <p className="text-zinc-600 text-xs mt-1">Your admin will send announcements here</p>
        </div>
      ) : (
        <NotificationAccordion
          unread={unread}
          read={read}
          userId={user!.id}
        />
      )}
    </div>
  );
}
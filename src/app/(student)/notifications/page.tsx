import { createClient } from '@/lib/supabase/server';
import { Bell } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MarkNotificationsRead } from '@/components/student/MarkNotificationsRead';

const typeColors: Record<string, string> = {
  deadline:    'bg-red-500/20 text-red-400 border-red-500/30',
  print_ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  payment:     'bg-amber-500/20 text-amber-400 border-amber-500/30',
  submission:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  general:     'bg-zinc-700 text-zinc-300 border-zinc-600',
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  const unreadIds = notifications
    ?.filter(n => !n.read_by?.includes(user!.id))
    .map(n => n.id) ?? [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
            <p className="text-zinc-500 text-xs">
              {unreadIds.length > 0 ? `${unreadIds.length} unread` : 'All caught up'}
            </p>
          </div>
        </div>
        {unreadIds.length > 0 && (
          <MarkNotificationsRead userId={user!.id} notificationIds={unreadIds} />
        )}
      </div>

      <div className="space-y-3">
        {!notifications || notifications.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => {
            const isUnread = unreadIds.includes(n.id);
            const colorClass = typeColors[n.type] ?? typeColors.general;
            return (
              <div
                key={n.id}
                className={`bg-zinc-900 border rounded-xl p-4 transition-colors ${
                  isUnread ? 'border-amber-500/20' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isUnread && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
                      )}
                      <p className="text-white text-sm font-semibold">{n.title}</p>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{n.content}</p>
                    <p className="text-zinc-600 text-xs mt-2">
                      {formatDate(n.created_at ?? new Date().toISOString())}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${colorClass}`}>
                    {n.type}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
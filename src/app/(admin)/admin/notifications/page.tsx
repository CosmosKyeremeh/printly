import { createClient } from '@/lib/supabase/server';
import { Bell } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { NotificationForm } from '@/components/admin/NotificationForm';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
          <Bell className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-zinc-500 text-xs">Send announcements and deadline reminders to all students</p>
        </div>
      </div>

      {/* Send form */}
      <NotificationForm adminId={user!.id} />

      {/* History */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Sent Notifications
        </h2>
        <div className="space-y-3">
          {!notifications || notifications.length === 0 ? (
            <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No notifications sent yet</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{n.title}</p>
                    <p className="text-zinc-400 text-sm mt-1">{n.content}</p>
                    <p className="text-zinc-600 text-xs mt-2">
                      {formatDate(n.created_at ?? new Date().toISOString())}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-700 text-zinc-300 shrink-0">
                    {n.type}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
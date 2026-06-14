import { createClient } from '@/lib/supabase/server';
import { Bell } from 'lucide-react';
import { NotificationForm } from '@/components/admin/NotificationForm';

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  // Split into recent (last 7 days) and older
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const recent = notifications?.filter(n =>
    now - new Date(n.created_at ?? '').getTime() < sevenDays
  ) ?? [];
  const older = notifications?.filter(n =>
    now - new Date(n.created_at ?? '').getTime() >= sevenDays
  ) ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: '#64000030' }}>
          <Bell className="w-4 h-4" style={{ color: '#b67e7d' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-xs" style={{ color: '#7a4a49' }}>
            {notifications?.length ?? 0} sent total
          </p>
        </div>
      </div>

      <NotificationForm
        adminId={user!.id}
        initialNotifications={notifications ?? []}
        recentCount={recent.length}
        olderCount={older.length}
      />
    </div>
  );
}
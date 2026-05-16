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

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: '#64000030' }}
        >
          <Bell className="w-4 h-4" style={{ color: '#b67e7d' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-xs" style={{ color: '#7a4a49' }}>Send announcements to all students</p>
        </div>
      </div>
      <NotificationForm
        adminId={user!.id}
        initialNotifications={notifications ?? []}
      />
    </div>
  );
}
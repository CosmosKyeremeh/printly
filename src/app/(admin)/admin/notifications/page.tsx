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
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      {/* Header Section aligned with the Gold/Zinc theme */}
      <div className="flex items-center gap-4 mb-8 pb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.08)]">
          <Bell className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            <span className="text-amber-400 font-semibold">{notifications?.length ?? 0} sent</span> total records
          </p>
        </div>
      </div>

      <NotificationForm
        adminId={user!.id}
        initialNotifications={notifications ?? []}
      />
    </div>
  );
}
import { createClient } from '@/lib/supabase/server';
import { Bell } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { MarkNotificationsRead } from '@/components/student/MarkNotificationsRead';
import { NotificationAccordion } from '@/components/student/NotificationAccordion';

const typeColors: Record<string, string> = {
  deadline:    'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.05)]',
  print_ready: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.05)]',
  payment:     'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.05)]',
  submission:  'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.05)]',
  general:     'bg-zinc-800/40 text-zinc-300 border-zinc-700/50 shadow-sm',
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

  const unread = notifications?.filter(n => !n.read_by?.includes(user!.id)) ?? [];
  const read = notifications?.filter(n => n.read_by?.includes(user!.id)) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 font-sans antialiased">
      
      {/* ── Page Header Module ── */}
      <div className="flex items-center justify-between mb-8 mt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 backdrop-blur-md bg-zinc-900/40 border border-white/5 rounded-xl flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <Bell className="w-4 h-4 text-amber-500 shadow-sm" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
            <p className="text-zinc-500 text-xs font-medium mt-0.5 tracking-wide">
              {unread.length > 0
                ? `${unread.length} unread · ${read.length} read`
                : `All ${read.length} read`
              }
            </p>
          </div>
        </div>

        {/* Mark all as read controller */}
        {unreadIds.length > 0 && (
          <div className="flex items-center gap-2.5 bg-zinc-900/20 backdrop-blur-sm border border-white/5 py-1.5 px-3 rounded-lg shadow-sm">
            <span className="text-zinc-400 text-[11px] font-semibold uppercase tracking-wider">Mark all read</span>
            <MarkNotificationsRead userId={user!.id} notificationIds={unreadIds} />
          </div>
        )}
      </div>

      {/* ── Main Notifications Feed Canvas ── */}
      <div className="space-y-4">
        {!notifications || notifications.length === 0 ? (
          
          /* Glassmorphic Empty State Element */
          <div className="text-center py-16 backdrop-blur-md bg-zinc-900/20 border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-3 opacity-60" />
            <p className="text-zinc-200 text-sm font-semibold">No notifications yet</p>
            <p className="text-zinc-500 text-xs mt-1">Your admin will send announcements here</p>
          </div>
          
        ) : (
          
          /* Dynamic Glassmorphic Card Feed */
          notifications.map(n => {
            const isUnread = unreadIds.includes(n.id);
            const colorClass = typeColors[n.type] ?? typeColors.general;
            
            return (
              <div
                key={n.id}
                className={`backdrop-blur-md bg-zinc-900/20 border transition-all duration-300 rounded-xl p-4 shadow-[0_4px_20px_0_rgba(0,0,0,0.25)] ${
                  isUnread 
                    ? 'border-amber-500/30 bg-amber-500/[0.015] shadow-[0_0_15px_rgba(245,158,11,0.03),inset_0_1px_0_0_rgba(255,255,255,0.08)]' 
                    : 'border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {isUnread && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0 shadow-[0_0_8px_#f59e0b]" />
                      )}
                      <p className="text-white text-sm font-semibold tracking-tight">{n.title}</p>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed font-normal">{n.content}</p>
                    <p className="text-zinc-500 text-[11px] font-medium mt-3 tracking-wide">
                      {formatDate(n.created_at ?? new Date().toISOString())}
                    </p>
                  </div>
                  
                  {/* Category Status Pill */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border shrink-0 backdrop-blur-sm shadow-inner transition-all ${colorClass}`}>
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
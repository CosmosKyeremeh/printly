'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface MarkNotificationsReadProps {
  userId: string;
  notificationIds: string[];
}

export function MarkNotificationsRead({
  userId,
  notificationIds,
}: MarkNotificationsReadProps) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (notificationIds.length === 0) return;

    // Fire all RPC database mutations concurrently
    Promise.all(
      notificationIds.map(id =>
        supabase.rpc('mark_notification_read', {
          notif_id: id,
          user_id: userId,
        })
      )
    ).then(() => {
      // router.refresh() forces Next.js to re-fetch Server Component data
      // This will instantly update the UI and clear the NotificationBell count!
      router.refresh();
    });
  }, [notificationIds, userId, supabase, router]);

  return null;
}
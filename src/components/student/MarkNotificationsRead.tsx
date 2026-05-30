'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function MarkNotificationsRead({
  userId,
  notificationIds,
}: {
  userId: string;
  notificationIds: string[];
}) {
  const supabase = createClient();

  useEffect(() => {
    if (notificationIds.length === 0) return;
    notificationIds.forEach(id => {
      supabase.rpc('mark_notification_read', { notif_id: id, user_id: userId });
    });
  }, [notificationIds, userId, supabase]);

  return null;
}
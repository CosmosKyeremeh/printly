'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function MarkNotificationsRead({
  userId,
  notificationIds,
}: {
  userId: string;
  notificationIds: string[];
}) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (notificationIds.length === 0) return;

    async function markRead() {
      // Fetch current read_by arrays and append userId for each
      for (const id of notificationIds) {
        const { data } = await supabase
          .from('notifications')
          .select('read_by')
          .eq('id', id)
          .single();

        if (data) {
          const current = data.read_by ?? [];
          if (!current.includes(userId)) {
            await supabase
              .from('notifications')
              .update({ read_by: [...current, userId] })
              .eq('id', id);
          }
        }
      }
      router.refresh();
    }

    markRead();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
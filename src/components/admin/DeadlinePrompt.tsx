'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Clock, Loader2, CheckCircle2 } from 'lucide-react';

type Category = { id: string; name: string; deadline: string | null };

export function DeadlinePrompt({ categories }: { categories: Category[] }) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);
  const supabase = createClient();

  const upcoming = categories.filter(c => {
    if (!c.deadline) return false;
    const diff = new Date(c.deadline).getTime() - Date.now();
    return diff > 0 && diff < 1000 * 60 * 60 * 48; // within 48 hours
  });

  if (upcoming.length === 0) return null;

  async function sendReminder(category: Category) {
    setUpdating(category.id);
    await supabase.from('notifications').insert({
      title: `Deadline reminder: ${category.name}`,
      content: `The deadline for ${category.name} is approaching. Submit your files now.`,
      type: 'deadline',
      is_global: true,
    });
    setUpdated(category.id);
    setUpdating(null);
    setTimeout(() => setUpdated(null), 3000);
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-500" />
        <p className="text-amber-400 font-semibold text-sm">Upcoming deadlines</p>
      </div>
      <div className="space-y-2">
        {upcoming.map(cat => (
          <div key={cat.id} className="flex items-center justify-between">
            <p className="text-zinc-300 text-sm">{cat.name}</p>
            <Button
              size="sm"
              disabled={updating === cat.id || updated === cat.id}
              onClick={() => sendReminder(cat)}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs h-7"
            >
              {updating === cat.id && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              {updated === cat.id && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {updated === cat.id ? 'Sent' : 'Remind students'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
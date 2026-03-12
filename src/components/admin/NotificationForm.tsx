'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

type NotificationType = 'deadline' | 'submission' | 'print_ready' | 'payment' | 'general';

export function NotificationForm({ adminId }: { adminId: string }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('general');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSending(true);
    setError('');

    const { error } = await supabase.from('notifications').insert({
      title,
      content,
      type,
      created_by: adminId,
      is_global: true,
    });

    if (error) {
      setError(error.message);
      setSending(false);
      return;
    }

    setSent(true);
    setTitle('');
    setContent('');
    setType('general');
    setSending(false);
    router.refresh();

    setTimeout(() => setSent(false), 3000);
  }

  const typeOptions: { value: NotificationType; label: string }[] = [
    { value: 'general',     label: 'General' },
    { value: 'deadline',    label: 'Deadline' },
    { value: 'submission',  label: 'Submission' },
    { value: 'print_ready', label: 'Print Ready' },
    { value: 'payment',     label: 'Payment' },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-white font-bold text-sm mb-4">Send Notification</h3>
      <form onSubmit={handleSend} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title *"
            required
            className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:border-amber-500 text-sm"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value as NotificationType)}
            className="h-10 bg-zinc-800 border border-zinc-700 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Message content *"
          required
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
        />

        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        <Button
          type="submit"
          disabled={sending || sent}
          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm h-10 px-5"
        >
          {sending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
          {sent && <CheckCircle2 className="w-4 h-4 mr-1.5 text-zinc-950" />}
          {!sending && !sent && <Send className="w-4 h-4 mr-1.5" />}
          {sent ? 'Sent!' : sending ? 'Sending...' : 'Send to all students'}
        </Button>
      </form>
    </div>
  );
}
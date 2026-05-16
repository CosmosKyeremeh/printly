'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';

type NotificationType = 'deadline' | 'submission' | 'print_ready' | 'payment' | 'general';

type Notification = {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string | null;
};

const typeOptions: { value: NotificationType; label: string }[] = [
  { value: 'general',     label: 'General' },
  { value: 'deadline',    label: 'Deadline' },
  { value: 'submission',  label: 'Submission' },
  { value: 'print_ready', label: 'Print Ready' },
  { value: 'payment',     label: 'Payment' },
];

export function NotificationForm({
  adminId,
  initialNotifications,
}: {
  adminId: string;
  initialNotifications: Notification[];
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('general');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState(initialNotifications);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    setError('');

    const { data, error } = await supabase
      .from('notifications')
      .insert({ title, content, type, created_by: adminId, is_global: true })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSending(false);
      return;
    }

    if (data) setNotifications(prev => [data, ...prev]);
    setSent(true);
    setTitle('');
    setContent('');
    setType('general');
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Send form */}
      <div className="rounded-2xl p-5 border" style={{ background: '#420001', borderColor: '#64000060' }}>
        <h3 className="text-white font-bold text-sm mb-4">Send Notification</h3>
        <form onSubmit={handleSend} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title *"
              required
              className="h-10 text-white placeholder:text-brand-700 text-sm"
              style={{ background: '#2a0001', borderColor: '#640000' }}
            />
            <select
              aria-label="Notification type"
              value={type}
              onChange={e => setType(e.target.value as NotificationType)}
              className="h-10 rounded-lg px-3 text-white text-sm focus:outline-none border"
              style={{ background: '#2a0001', borderColor: '#640000' }}
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
            className="w-full rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none transition-colors resize-none border"
            style={{ background: '#2a0001', borderColor: '#640000' }}
          />

          {error && <p className="text-sm" style={{ color: '#c99897' }}>{error}</p>}

          <Button
            type="submit"
            disabled={sending || sent}
            className="font-bold text-sm h-10 px-5 text-white rounded-lg"
            style={{ background: 'linear-gradient(135deg, #640000, #b67e7d)' }}
          >
            {sending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {sent && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
            {!sending && !sent && <Send className="w-4 h-4 mr-1.5" />}
            {sent ? 'Sent!' : sending ? 'Sending...' : 'Send to all students'}
          </Button>
        </form>
      </div>

      {/* Notification history */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#9d6463' }}>
          Sent Notifications
        </h2>
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border" style={{ background: '#42000130', borderColor: '#64000040' }}>
              <p className="text-sm" style={{ color: '#7a4a49' }}>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="flex items-start gap-4 rounded-xl p-4 border"
                  style={{ background: '#420001', borderColor: '#64000060' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{n.title}</p>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: '#9d6463' }}>{n.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full border font-semibold"
                        style={{ background: '#64000030', borderColor: '#64000060', color: '#b67e7d' }}
                      >
                        {n.type}
                      </span>
                      <span className="text-xs" style={{ color: '#7a4a49' }}>
                        {formatDate(n.created_at ?? new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    disabled={deleting === n.id}
                    className="p-2 rounded-lg transition-all shrink-0 border border-transparent hover:border-red-500/20"
                    style={{ color: '#7a4a49' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#7a4a49'}
                  >
                    {deleting === n.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />
                    }
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
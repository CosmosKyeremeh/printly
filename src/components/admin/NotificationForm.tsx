'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

type NotificationType = 'deadline' | 'submission' | 'print_ready' | 'payment' | 'general';

type Notification = {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string | null;
};

const typeOptions: { value: NotificationType; label: string }[] = [
  { value: 'general',     label: 'General Announcement' },
  { value: 'deadline',    label: 'Academic Deadline' },
  { value: 'submission',  label: 'Assignment Upload' },
  { value: 'print_ready', label: 'Job Print Completed' },
  { value: 'payment',     label: 'Finances & Fees' },
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
    <div className="space-y-8 max-w-4xl">
      {/* Broadcast Creation Form Card */}
      <div className="rounded-2xl p-6 border border-brand-900/40 bg-zinc-900/20 backdrop-blur-sm shadow-xl">
        <h3 className="text-white font-semibold text-base mb-4 tracking-tight">Broadcast System Notification</h3>
        
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Notification Title *"
              required
              className="h-11 text-white bg-zinc-900/60 border-zinc-800 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20 placeholder:text-zinc-500 text-sm transition-all rounded-xl"
            />
            <select
              aria-label="Notification type"
              value={type}
              onChange={e => setType(e.target.value as NotificationType)}
              className="h-11 rounded-xl px-3 text-zinc-200 bg-zinc-900/60 border border-zinc-800 focus:border-brand-500/50 focus:outline-none text-sm transition-all cursor-pointer"
            >
              {typeOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-zinc-950 text-white">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type your communication details here... *"
            required
            rows={4}
            className="w-full rounded-xl px-4 py-3 text-white bg-zinc-900/60 border border-zinc-800 focus:border-brand-500/50 focus:outline-none placeholder:text-zinc-500 text-sm transition-all resize-none"
          />

          {error && <p className="text-sm text-red-400 font-medium">{error}</p>}

          <Button
            type="submit"
            disabled={sending || sent || !title.trim() || !content.trim()}
            className={cn(
              "font-semibold text-sm h-11 px-6 text-brand-950 rounded-xl transition-all cursor-pointer active:scale-[0.98]",
              sent 
                ? "bg-emerald-500 text-white" 
                : "bg-brand-500 hover:bg-brand-400 disabled:bg-zinc-800 disabled:text-zinc-500 shadow-lg shadow-brand-500/10"
            )}
          >
            {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {sent && <CheckCircle2 className="w-4 h-4 mr-2" />}
            {!sending && !sent && <Send className="w-4 h-4 mr-2" />}
            {sent ? 'Dispatched Successfully' : sending ? 'Broadcasting...' : 'Publish to All Terminal Feeds'}
          </Button>
        </form>
      </div>

      {/* History Ledger Stream */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          History Ledger
        </h2>
        
        <AnimatePresence mode="popLayout">
          {notifications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 rounded-2xl border border-zinc-800/60 bg-zinc-900/5"
            >
              <p className="text-sm text-zinc-500">No managed notifications found in active registry.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {notifications.map(n => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
                  className="flex items-start gap-4 rounded-xl p-5 border border-zinc-800/60 bg-zinc-900/10 backdrop-blur-xs hover:border-zinc-800 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-100 text-sm font-semibold tracking-tight">{n.title}</p>
                    <p className="text-zinc-400 text-sm mt-1.5 leading-relaxed font-normal">{n.content}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-md border bg-brand-500/5 border-brand-500/20 text-brand-300 font-medium uppercase tracking-wider">
                        {n.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {formatDate(n.created_at ?? new Date().toISOString())}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(n.id)}
                    disabled={deleting === n.id}
                    className="p-2 rounded-lg transition-all shrink-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 disabled:opacity-40"
                    title="Purge notification log"
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
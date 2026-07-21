'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, CheckCircle2, Trash2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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
  related_file_id: string | null;
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
  
  const [showRecent, setShowRecent] = useState(true);
  const [showOlder, setShowOlder] = useState(false);
  
  const supabase = createClient();

  // Live-update the ledger when a submission notification lands (e.g. from the
  // files-insert trigger) while this page is already open — no manual refresh.
  useEffect(() => {
    const channel = supabase
      .channel('admin-notifications-ledger')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const row = payload.new as Notification;
          setNotifications(prev =>
            prev.some(n => n.id === row.id) ? prev : [row, ...prev]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  
  const recent = notifications.filter(n =>
    now - new Date(n.created_at ?? '').getTime() < sevenDays
  );
  const older = notifications.filter(n =>
    now - new Date(n.created_at ?? '').getTime() >= sevenDays
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSending(true);
    setError('');

    const { data, error } = await supabase
      .from('notifications')
      .insert({ title, content, type, created_by: adminId, is_global: true, read_by: [] })
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
    <div className="space-y-8 max-w-4xl font-sans antialiased">
      <div className="rounded-2xl p-6 border border-zinc-900 bg-zinc-900/30 backdrop-blur-md shadow-xl">
        <h3 className="text-white font-semibold text-base mb-4 tracking-tight">Broadcast System Notification</h3>
        
        <form onSubmit={handleSend} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Notification Title *"
              required
              className="h-11 text-white bg-zinc-900/60 border-zinc-800 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 placeholder:text-zinc-500 text-sm transition-all rounded-xl"
            />
            <select
              aria-label="Notification type"
              value={type}
              onChange={e => setType(e.target.value as NotificationType)}
              className="h-11 rounded-xl px-3 text-zinc-200 bg-zinc-900/60 border border-zinc-800 focus:border-amber-500/50 focus:outline-none text-sm transition-all cursor-pointer"
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
            className="w-full rounded-xl px-4 py-3 text-white bg-zinc-900/60 border border-zinc-800 focus:border-amber-500/50 focus:outline-none placeholder:text-zinc-500 text-sm transition-all resize-none"
          />

          {error && <p className="text-sm text-red-400 font-medium">{error}</p>}

          <Button
            type="submit"
            disabled={sending || sent || !title.trim() || !content.trim()}
            className={cn(
              "font-bold text-sm h-11 px-6 rounded-xl transition-all cursor-pointer active:scale-[0.98]",
              sent 
                ? "bg-emerald-500 text-white" 
                : "bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-500 shadow-lg shadow-amber-500/10"
            )}
          >
            {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {sent && <CheckCircle2 className="w-4 h-4 mr-2" />}
            {!sending && !sent && <Send className="w-4 h-4 mr-2" />}
            {(() => {
              if (sent) return 'Dispatched Successfully';
              if (sending) return 'Broadcasting...';
              return 'Publish to All Terminal Feeds';
            })()}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">
          History Ledger
        </h2>
        
        <div className="space-y-6">
          <div>
            <button
              onClick={() => setShowRecent(p => !p)}
              className="w-full flex items-center justify-between px-1 py-2 group mb-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-zinc-200 font-bold text-sm tracking-tight group-hover:text-white transition-colors">Last 7 days</span>
                <span className="text-[10px] font-bold font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                  {recent.length}
                </span>
              </div>
              {showRecent ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </button>
            <div className="h-px bg-zinc-900 mb-3" />
            
            <AnimatePresence mode="popLayout">
              {showRecent && (
                <div className="space-y-2">
                  {recent.length === 0 ? (
                    <p className="text-center text-sm py-8 text-zinc-600 font-medium">No notifications sent this week</p>
                  ) : (
                    recent.map(n => (
                      <AdminNotifRow key={n.id} n={n} onDelete={handleDelete} deleting={deleting} />
                    ))
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {older.length > 0 && (
            <div>
              <button
                onClick={() => setShowOlder(p => !p)}
                className="w-full flex items-center justify-between px-1 py-2 group mb-2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight">Older Notifications</span>
                  <span className="text-[10px] font-bold font-mono bg-zinc-900/50 border border-zinc-900 text-zinc-500 px-2 py-0.5 rounded-full">
                    {older.length}
                  </span>
                </div>
                {showOlder ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-600" />}
              </button>
              <div className="h-px bg-zinc-900/60 mb-3" />
              
              <AnimatePresence mode="popLayout">
                {showOlder && (
                  <div className="space-y-2">
                    {older.map(n => (
                      <AdminNotifRow key={n.id} n={n} onDelete={handleDelete} deleting={deleting} />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminNotifRow({ 
  n, 
  onDelete, 
  deleting 
}: {
  n: Notification;
  onDelete: (id: string) => void;
  deleting: string | null;
}) {
  const [isContentOpen, setIsContentOpen] = useState(false);

  const meta = (
    {
      deadline:    { label: 'Deadline',    cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
      print_ready: { label: 'Print Ready', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
      payment:     { label: 'Payment',     cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
      submission:  { label: 'Submission',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
      general:     { label: 'General',     cls: 'bg-zinc-800 text-zinc-400 border-zinc-700/50' },
    }[n.type as NotificationType] ?? { label: 'General', cls: 'bg-zinc-800 text-zinc-400 border-zinc-700/50' }
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }}
      className="rounded-xl border border-zinc-900 bg-zinc-900/20 backdrop-blur-xs hover:border-zinc-800 transition-colors shadow-sm overflow-hidden"
    >
      <div className="flex items-start gap-4 p-4">
        <button 
          onClick={() => setIsContentOpen(!isContentOpen)}
          className="flex-1 min-w-0 text-left group"
        >
          <div className="flex items-center gap-2">
            <p className="text-zinc-100 text-sm font-semibold tracking-tight group-hover:text-amber-400 transition-colors">
              {n.title}
            </p>
            <motion.div
              animate={{ rotate: isContentOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-zinc-500 shrink-0"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.div>
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-bold uppercase tracking-wider", meta.cls)}>
              {meta.label}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {formatDate(n.created_at ?? new Date().toISOString())}
            </span>
          </div>
        </button>

        {n.related_file_id && (
          <Link
            href={`/admin/queue#file-${n.related_file_id}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 text-blue-400 bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View file
          </Link>
        )}

        <button
          onClick={() => onDelete(n.id)}
          disabled={deleting === n.id}
          className="p-2 rounded-lg transition-all shrink-0 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 disabled:opacity-40"
          title="Purge notification log"
        >
          {deleting === n.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isContentOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-1 border-t border-zinc-900/60 text-sm text-zinc-400 whitespace-pre-wrap">
              <div className="h-px bg-zinc-800/40 mb-3" />
              {n.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
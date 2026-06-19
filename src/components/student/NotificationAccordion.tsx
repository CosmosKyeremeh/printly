'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, Bell, BellOff } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Notification = {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string | null;
};

type Props = {
  unread: Notification[];
  read: Notification[];
  userId: string;
};

const typeMeta: Record<string, { label: string; className: string }> = {
  deadline:    { label: 'Deadline',    className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  print_ready: { label: 'Print Ready', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  payment:     { label: 'Payment',     className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  submission:  { label: 'Submission',  className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  general:     { label: 'General',     className: 'bg-zinc-800 text-zinc-400 border-zinc-700' },
};

// ── Individual accordion card ──────────────────────────────────────────────
function NotificationCard({
  n,
  isUnread,
  onFirstOpen,
}: {
  n: Notification;
  isUnread: boolean;
  onFirstOpen?: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [markedRead, setMarkedRead] = useState(false);
  const meta = typeMeta[n.type] ?? typeMeta.general;

  function handleToggle() {
    // Mark as read on first expand only
    if (!expanded && isUnread && !markedRead) {
      setMarkedRead(true);
      onFirstOpen?.(n.id);
    }
    setExpanded(prev => !prev);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`rounded-xl border overflow-hidden transition-colors duration-200 ${
        isUnread && !markedRead
          ? 'border-amber-500/25 bg-zinc-900'
          : 'border-zinc-800/60 bg-zinc-900/40'
      }`}
    >
      {/* ── Header row — always visible ── */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left group"
      >
        {/* Unread dot */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 transition-all duration-500 ${
            isUnread && !markedRead
              ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
              : 'bg-transparent'
          }`}
        />

        {/* Title */}
        <span className={`flex-1 text-sm font-semibold text-left leading-snug ${
          isUnread && !markedRead ? 'text-white' : 'text-zinc-400'
        }`}>
          {n.title}
        </span>

        {/* Type badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 hidden sm:inline-flex ${meta.className}`}>
          {meta.label}
        </span>

        {/* Date */}
        <span className="text-zinc-600 text-xs shrink-0 hidden md:block">
          {formatDate(n.created_at ?? new Date().toISOString())}
        </span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className={`shrink-0 transition-colors ${
            expanded ? 'text-amber-500' : 'text-zinc-600 group-hover:text-zinc-400'
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* ── Expandable content ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-0">
              {/* Divider */}
              <div className="h-px bg-zinc-800/60 mb-3" />

              {/* Message body */}
              <p className="text-zinc-400 text-sm leading-relaxed">
                {n.content}
              </p>

              {/* Mobile meta row */}
              <div className="flex items-center gap-2 mt-3 sm:hidden">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${meta.className}`}>
                  {meta.label}
                </span>
                <span className="text-zinc-600 text-xs">
                  {formatDate(n.created_at ?? new Date().toISOString())}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Section wrapper with collapse toggle ──────────────────────────────────
function Section({
  title,
  icon,
  count,
  badge,
  defaultOpen,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  badge: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-1 py-2.5 group"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
            {icon}
          </span>
          <span className="text-sm font-bold text-white tracking-tight">{title}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badge}`}>
            {count}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-zinc-600 group-hover:text-zinc-400 transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <div className="h-px bg-zinc-800/50 mb-3" />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="section-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-2 pb-2">
              {count === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-8 font-medium">
                  {title === 'Unread'
                    ? '✓ All caught up — no unread messages'
                    : 'No read notifications yet'}
                </p>
              ) : (
                children
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Root accordion component ───────────────────────────────────────────────
export function NotificationAccordion({ unread: initialUnread, read: initialRead }: Props) {
  const [unreadList, setUnreadList] = useState(initialUnread);
  const [readList, setReadList] = useState(initialRead);

  // Unread status management matching exact structural API routes with automatic rollback variables
  const handleFirstOpen = useCallback(async (notifId: string) => {
    const notif = unreadList.find(n => n.id === notifId);
    if (!notif) return;

    // Optimistic Update Layout Stack
    setUnreadList(prev => prev.filter(n => n.id !== notifId));
    setReadList(prev => [notif, ...prev]);

    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notifId }),
      });

      if (!res.ok) {
        // Structural Fallback Rollback Sequence
        setUnreadList(prev => [notif, ...prev]);
        setReadList(prev => prev.filter(n => n.id !== notifId));
      }
    } catch {
      // Emergency Error Network Catch Rollback
      setUnreadList(prev => [notif, ...prev]);
      setReadList(prev => prev.filter(n => n.id !== notifId));
    }
  }, [unreadList]);

  return (
    <div className="space-y-6">
      {/* Unread — always open by default */}
      <Section
        title="Unread"
        icon={<Bell className="w-4 h-4" />}
        count={unreadList.length}
        badge="bg-amber-500/15 text-amber-400"
        defaultOpen={true}
      >
        <AnimatePresence mode="popLayout">
          {unreadList.map(n => (
            <NotificationCard
              key={n.id}
              n={n}
              isUnread={true}
              onFirstOpen={handleFirstOpen}
            />
          ))}
        </AnimatePresence>
      </Section>

      {/* Read — collapsed by default when unreads exist */}
      <Section
        title="Read"
        icon={<BellOff className="w-4 h-4" />}
        count={readList.length}
        badge="bg-zinc-800 text-zinc-500"
        defaultOpen={unreadList.length === 0}
      >
        <AnimatePresence mode="popLayout">
          {readList.map(n => (
            <NotificationCard
              key={n.id}
              n={n}
              isUnread={false}
            />
          ))}
        </AnimatePresence>
      </Section>
    </div>
  );
}
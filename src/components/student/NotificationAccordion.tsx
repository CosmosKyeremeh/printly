'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Bell, BellOff } from 'lucide-react';
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
};

const typeColors: Record<string, string> = {
  deadline:    'bg-red-500/20 text-red-400 border-red-500/30',
  print_ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  payment:     'bg-amber-500/20 text-amber-400 border-amber-500/30',
  submission:  'bg-blue-500/20 text-blue-400 border-blue-500/30',
  general:     'bg-zinc-700 text-zinc-300 border-zinc-600',
};

function NotificationCard({ n, isUnread }: { n: Notification; isUnread: boolean }) {
  const colorClass = typeColors[n.type] ?? typeColors.general;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`rounded-xl p-4 border transition-colors ${
        isUnread
          ? 'border-amber-500/20 bg-zinc-900'
          : 'border-zinc-800/50 bg-zinc-900/50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {isUnread && (
            <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0 mt-1.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${isUnread ? 'text-white' : 'text-zinc-400'}`}>
              {n.title}
            </p>
            <p className="text-zinc-500 text-sm mt-1 leading-relaxed">{n.content}</p>
            <p className="text-zinc-600 text-xs mt-2">
              {formatDate(n.created_at ?? new Date().toISOString())}
            </p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${colorClass}`}>
          {n.type}
        </span>
      </div>
    </motion.div>
  );
}

function Section({
  title,
  icon,
  count,
  children,
  defaultOpen = true,
  accentColor = 'text-zinc-400',
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accentColor?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-2">
      {/* Section header — click to toggle */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-1 py-2 group"
      >
        <div className="flex items-center gap-2">
          <span className={`${accentColor} transition-colors`}>{icon}</span>
          <span className="text-sm font-bold text-white">{title}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            accentColor.includes('amber')
              ? 'bg-amber-500/15 text-amber-400'
              : 'bg-zinc-800 text-zinc-500'
          }`}>
            {count}
          </span>
        </div>
        <div className={`transition-colors ${accentColor} group-hover:text-white`}>
          {open
            ? <ChevronUp className="w-4 h-4" />
            : <ChevronDown className="w-4 h-4" />
          }
        </div>
      </button>

      {/* Divider */}
      <div className="h-px bg-zinc-800/60" />

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-2 pt-1">
              {count === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-6">
                  {title === 'Unread' ? 'All caught up! No unread notifications.' : 'No read notifications yet.'}
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

export function NotificationAccordion({ unread, read }: Props) {
  return (
    <div className="space-y-6">
      {/* Unread section — open by default */}
      <Section
        title="Unread"
        icon={<Bell className="w-4 h-4" />}
        count={unread.length}
        defaultOpen={true}
        accentColor="text-amber-500"
      >
        {unread.map(n => (
          <NotificationCard key={n.id} n={n} isUnread={true} />
        ))}
      </Section>

      {/* Read section — collapsed by default if there are unreads */}
      <Section
        title="Read"
        icon={<BellOff className="w-4 h-4" />}
        count={read.length}
        defaultOpen={unread.length === 0}
        accentColor="text-zinc-500"
      >
        {read.map(n => (
          <NotificationCard key={n.id} n={n} isUnread={false} />
        ))}
      </Section>
    </div>
  );
}
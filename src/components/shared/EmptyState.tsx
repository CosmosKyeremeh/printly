import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-zinc-700" />
      </div>
      <p className="text-zinc-400 font-semibold">{title}</p>
      <p className="text-zinc-600 text-sm mt-1 max-w-xs mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 mt-4 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm px-4 py-2 rounded-lg transition-all"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
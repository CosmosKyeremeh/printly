type Status = 'queued' | 'printing' | 'done' | 'cancelled' | 'pending' | 'paid' | 'failed';

const styles: Record<Status, string> = {
  queued:    'bg-zinc-700 text-zinc-300',
  printing:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  done:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
  pending:   'bg-zinc-700 text-zinc-300',
  paid:      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  failed:    'bg-red-500/20 text-red-400 border border-red-500/30',
};

const labels: Record<Status, string> = {
  queued:    'Queued',
  printing:  'Printing',
  done:      'Done',
  cancelled: 'Cancelled',
  pending:   'Pending',
  paid:      'Paid',
  failed:    'Failed',
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
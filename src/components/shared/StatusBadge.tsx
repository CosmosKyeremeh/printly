type Status = 'queued' | 'printing' | 'done' | 'cancelled' | 'pending' | 'paid' | 'failed';

const styles: Record<Status, { background: string; color: string; border: string }> = {
  queued:    { background: '#42000130', color: '#9d6463', border: '#64000050' },
  printing:  { background: '#64000030', color: '#b67e7d', border: '#64000080' },
  done:      { background: '#14532d30', color: '#4ade80', border: '#16a34a40' },
  cancelled: { background: '#7f1d1d30', color: '#f87171', border: '#dc262640' },
  pending:   { background: '#42000130', color: '#9d6463', border: '#64000050' },
  paid:      { background: '#14532d30', color: '#4ade80', border: '#16a34a40' },
  failed:    { background: '#7f1d1d30', color: '#f87171', border: '#dc262640' },
};

const labels: Record<Status, string> = {
  queued: 'Queued', printing: 'Printing', done: 'Done',
  cancelled: 'Cancelled', pending: 'Pending', paid: 'Paid', failed: 'Failed',
};

export function StatusBadge({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ background: s.background, color: s.color, borderColor: s.border }}
    >
      {labels[status]}
    </span>
  );
}
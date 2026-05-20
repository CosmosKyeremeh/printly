import { createClient } from '@/lib/supabase/server';
import { CreditCard, TrendingUp, Clock } from 'lucide-react';

export async function PaymentOverview() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, status, currency');

  const { data: unpaidFiles } = await supabase
    .from('files')
    .select('id')
    .eq('payment_status', 'pending');

  const totalPaid = payments
    ?.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const stats = [
    { label: 'Collected', value: `GHS ${totalPaid.toFixed(2)}`, icon: <TrendingUp className="w-4 h-4 text-emerald-400" />, bg: 'bg-emerald-500/15' },
    { label: 'Transactions', value: payments?.length ?? 0, icon: <CreditCard className="w-4 h-4 text-amber-400" />, bg: 'bg-amber-500/15' },
    { label: 'Awaiting', value: unpaidFiles?.length ?? 0, icon: <Clock className="w-4 h-4 text-zinc-400" />, bg: 'bg-zinc-800' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ label, value, icon, bg }) => (
        <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-2`}>
            {icon}
          </div>
          <p className="text-white font-black text-xl">{value}</p>
          <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}
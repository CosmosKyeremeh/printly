import { createClient } from '@/lib/supabase/server';
import { CreditCard } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export default async function AdminPaymentsPage() {
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from('payments')
    .select('*, files(file_name), profiles(full_name, email)')
    .order('created_at', { ascending: false });

  const { data: unpaidFiles } = await supabase
    .from('files')
    .select('id, file_name, created_at, profiles(full_name, email)')
    .eq('payment_status', 'pending');

  const totalPaid = payments
    ?.filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Payments</h1>
          <p className="text-zinc-500 text-xs">Track printing fees and payment status</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-3xl font-black text-white">
            GHS {totalPaid.toFixed(2)}
          </p>
          <p className="text-zinc-500 text-xs mt-1">Total collected</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-3xl font-black text-amber-400">
            {unpaidFiles?.length ?? 0}
          </p>
          <p className="text-zinc-500 text-xs mt-1">Awaiting payment</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-3xl font-black text-white">
            {payments?.length ?? 0}
          </p>
          <p className="text-zinc-500 text-xs mt-1">Total transactions</p>
        </div>
      </div>

      {/* Unpaid files */}
      {unpaidFiles && unpaidFiles.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Awaiting Payment
          </h2>
          <div className="space-y-2">
            {unpaidFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between bg-zinc-900 border border-amber-500/20 rounded-xl p-4"
              >
                <div>
                  <p className="text-white text-sm font-semibold">{file.file_name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {(file.profiles as { full_name: string | null; email: string } | null)?.full_name ??
                     (file.profiles as { full_name: string | null; email: string } | null)?.email}
                    {' · '}
                    {formatDate(file.created_at ?? new Date().toISOString())}
                  </p>
                </div>
                <StatusBadge status="pending" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment history */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Payment History
        </h2>
        {!payments || payments.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <CreditCard className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No payments recorded yet</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3">File</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3 hidden sm:table-cell">Student</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, i) => (
                  <tr
                    key={payment.id}
                    className={`border-b border-zinc-800/50 ${i === payments.length - 1 ? 'border-0' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <p className="text-white text-sm truncate max-w-[160px]">
                        {(payment.files as { file_name: string } | null)?.file_name ?? 'Unknown'}
                      </p>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <p className="text-zinc-400 text-sm">
                        {(payment.profiles as { full_name: string | null; email: string } | null)?.full_name ??
                         (payment.profiles as { full_name: string | null; email: string } | null)?.email}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-white text-sm font-semibold">
                        {payment.currency} {Number(payment.amount).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={payment.status as 'pending' | 'paid' | 'failed'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
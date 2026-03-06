import { createClient } from '@/lib/supabase/server';
import { CreditCard } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: payments } = await supabase
    .from('payments')
    .select('*, files(file_name)')
    .eq('student_id', user!.id)
    .order('created_at', { ascending: false });

  const { data: unpaidFiles } = await supabase
    .from('files')
    .select('id, file_name, created_at')
    .eq('owner_id', user!.id)
    .eq('payment_status', 'pending');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Payments</h1>
          <p className="text-zinc-500 text-xs">Manage printing fees for your files</p>
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
                  <p className="text-zinc-500 text-xs mt-0.5">{formatDate(file.created_at ?? new Date().toISOString())}</p>
                </div>
                <StatusBadge status="pending" />
              </div>
            ))}
          </div>
          <p className="text-zinc-500 text-xs mt-3">
            Payment integration coming soon. Contact your admin to confirm payment.
          </p>
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
            <p className="text-zinc-500 text-sm">No payment history yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map(payment => (
              <div
                key={payment.id}
                className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl p-4"
              >
                <div>
                  <p className="text-white text-sm font-semibold">
                    {(payment.files as { file_name: string } | null)?.file_name ?? 'Unknown file'}
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    {payment.currency} {payment.amount} · {formatDate(payment.created_at ?? new Date().toISOString())}
                  </p>
                </div>
                <StatusBadge status={payment.status as 'pending' | 'paid' | 'failed'} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
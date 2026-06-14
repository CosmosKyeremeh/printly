'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { CreditCard, Smartphone } from 'lucide-react';
import { MoMoPaymentModal } from './MoMoPaymentModal';

type UnpaidFile = { id: string; file_name: string; created_at: string | null };
type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string | null;
  files: { file_name: string } | null;
};

export function PaymentsList({
  unpaidFiles,
  payments: initialPayments,
}: {
  unpaidFiles: UnpaidFile[];
  payments: Payment[];
}) {
  const [payingFile, setPayingFile] = useState<{ id: string; name: string } | null>(null);
  const [unpaid, setUnpaid] = useState(unpaidFiles);
  const [payments, setPayments] = useState(initialPayments);

  function handlePaymentSuccess(fileId: string, fileName: string) {
    // Remove from unpaid list immediately
    setUnpaid(prev => prev.filter(f => f.id !== fileId));
    // Add to payment history
    setPayments(prev => [{
      id: `demo-${Date.now()}`,
      amount: 2.00,
      currency: 'GHS',
      status: 'paid',
      created_at: new Date().toISOString(),
      files: { file_name: fileName },
    }, ...prev]);
    setPayingFile(null);
  }

  return (
    <>
      {/* ── Section: Awaiting Payment (Zinc/Amber Theme) ── */}
      {unpaid.length > 0 && (
        <div className="mb-8 font-sans antialiased">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-amber-500/90 shadow-sm">
            Awaiting Payment
          </h2>
          <div className="space-y-3">
            {unpaid.map(file => (
              <div 
                key={file.id}
                className="backdrop-blur-md bg-zinc-900/40 border border-amber-500/20 rounded-xl p-4 transition-all duration-300 shadow-[0_4px_20px_0_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:border-amber-500/30"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold tracking-tight">{file.file_name}</p>
                    <p className="text-zinc-500 text-[11px] font-medium mt-0.5 tracking-wide">
                      {formatDate(file.created_at ?? new Date().toISOString())}
                    </p>
                    <p className="text-zinc-400 text-xs mt-2.5 leading-relaxed bg-zinc-950/30 border border-white/[0.02] p-2 rounded-lg max-w-md">
                      💡 <span className="text-zinc-300">Alternative:</span> Pay cash to your class rep — they will mark it as paid.
                    </p>
                  </div>
                  
                  {/* Premium Gold Gradient Action Trigger */}
                  <button
                    onClick={() => setPayingFile({ id: file.id, name: file.file_name })}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 active:scale-[0.98] transition-all duration-200 rounded-xl text-xs font-bold text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0"
                  >
                    <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
                    Pay with MoMo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Section: Empty State (Frosted Glass Container) ── */}
      {unpaid.length === 0 && payments.length === 0 && (
        <div className="text-center py-16 backdrop-blur-md bg-zinc-900/20 border border-white/5 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          <CreditCard className="w-8 h-8 text-zinc-600 mx-auto mb-3 opacity-60" />
          <p className="text-zinc-200 text-sm font-semibold">No payments yet</p>
          <p className="text-zinc-500 text-xs mt-1">All your financial transactions will stream here</p>
        </div>
      )}

      {/* ── Section: Payment History (Clean Deep Zinc Theme) ── */}
      {payments.length > 0 && (
        <div className="font-sans antialiased">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-zinc-400/90 tracking-wide">
            Payment History
          </h2>
          <div className="space-y-2">
            {payments.map(payment => (
              <div 
                key={payment.id}
                className="flex items-center justify-between rounded-xl p-4 backdrop-blur-md bg-zinc-900/20 border border-white/5 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.02)] transition-all"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-zinc-200 text-sm font-medium truncate">
                    {(payment.files as { file_name: string } | null)?.file_name ?? 'Unknown file'}
                  </p>
                  <p className="text-zinc-500 text-[11px] font-medium mt-1 tracking-wide">
                    <span className="text-amber-500/80 font-semibold">{payment.currency} {payment.amount.toFixed(2)}</span>
                    <span className="text-zinc-600 mx-1.5">·</span>
                    {formatDate(payment.created_at ?? new Date().toISOString())}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={payment.status as 'pending' | 'paid' | 'failed'} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Overlay Modal Controller ── */}
      {payingFile && (
        <MoMoPaymentModal
          fileId={payingFile.id}
          fileName={payingFile.name}
          onClose={() => setPayingFile(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
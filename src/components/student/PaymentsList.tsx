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
  payments,
}: {
  unpaidFiles: UnpaidFile[];
  payments: Payment[];
}) {
  const [payingFile, setPayingFile] = useState<{ id: string; name: string } | null>(null);

  return (
    <>
      {/* Unpaid files stream */}
      {unpaidFiles.length > 0 && (
        <div className="mb-8 max-w-5xl">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3 pl-1">
            Awaiting Payment
          </h2>
          <div className="space-y-2.5">
            {unpaidFiles.map(file => (
              <div 
                key={file.id}
                className="flex items-center justify-between rounded-xl p-4 border border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-zinc-200 text-sm font-semibold truncate tracking-tight">
                    {file.file_name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatDate(file.created_at ?? new Date().toISOString())}
                  </p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setPayingFile({ id: file.id, name: file.file_name })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all text-white w-full justify-center sm:w-auto"
                    style={{ background: 'linear-gradient(135deg, #640000, #b67e7d)', borderColor: 'transparent' }}
                  >
                    Pay with MoMo (demo)
                  </button>
                  <p className="text-xs" style={{ color: '#7a4a49' }}>
                    Or pay cash to your class rep — they will mark it as paid.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Ledger */}
      <div className="max-w-5xl">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-3 pl-1">
          Payment History
        </h2>
        {payments.length === 0 ? (
          <div className="text-center py-14 rounded-2xl border border-zinc-900 bg-zinc-900/5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3.5 bg-zinc-900 border border-zinc-800/80 text-zinc-600">
              <CreditCard className="w-4 h-4" />
            </div>
            <p className="text-zinc-500 text-xs font-medium">No prior billing interactions detected</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {payments.map(payment => (
              <div 
                key={payment.id}
                className="flex items-center justify-between rounded-xl p-4 border border-zinc-900 bg-zinc-900/10"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-zinc-300 text-sm font-medium truncate tracking-tight">
                    {(payment.files as { file_name: string } | null)?.file_name ?? 'Archived Asset Document'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 font-medium tracking-wide">
                    {payment.currency} {payment.amount.toFixed(2)} <span className="text-zinc-700 mx-1.5">•</span> {formatDate(payment.created_at ?? new Date().toISOString())}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={payment.status as 'pending' | 'paid' | 'failed'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MoMo Payment Sheet Modal Mount */}
      {payingFile && (
        <MoMoPaymentModal
          fileId={payingFile.id}
          fileName={payingFile.name}
          onClose={() => setPayingFile(null)}
        />
      )}
    </>
  );
}
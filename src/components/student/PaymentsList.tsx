'use client';

import { useState } from 'react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Clock, CreditCard, Smartphone } from 'lucide-react';
import { PaystackPaymentModal } from './PaystackPaymentModal';

// Price is only considered "set" once admin has explicitly locked it — mirrors /api/payments/initialize
function computePrice(file: UnpaidFile): number | null {
  if (file.price_locked && file.manual_price !== null) {
    return Number(file.manual_price);
  }
  return null;
}

type UnpaidFile = {
  id: string;
  file_name: string;
  created_at: string | null;
  page_count: number | null;
  manual_price: number | null;
  price_locked: boolean | null;
};

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string | null;
  files: { file_name: string } | null;
};

type PayingFile = {
  id: string;
  name: string;
  price: number;
};

export function PaymentsList({
  unpaidFiles,
  payments: initialPayments,
}: {
  unpaidFiles: UnpaidFile[];
  payments: Payment[];
}) {
  const [payingFile, setPayingFile] = useState<PayingFile | null>(null);
  const [unpaid, setUnpaid] = useState(unpaidFiles);
  const [payments, setPayments] = useState(initialPayments);

  function handlePaymentSuccess(fileId: string, fileName: string, amount: number) {
    setUnpaid(prev => prev.filter(f => f.id !== fileId));
    setPayments(prev => [{
      id: `local-${Date.now()}`,
      amount,
      currency: 'GHS',
      status: 'paid',
      created_at: new Date().toISOString(),
      files: { file_name: fileName },
    }, ...prev]);
    setPayingFile(null);
  }

  return (
    <>
      {unpaid.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-amber-500/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            Awaiting Payment
          </h2>
          <div className="space-y-4">
            {unpaid.map(file => {
              const price = computePrice(file);
              return (
                <div 
                  key={file.id}
                  className="relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 hover:translate-y-[-2px]"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.03), rgba(212, 175, 55, 0.08))',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderColor: 'rgba(212, 175, 55, 0.25) rgba(212, 175, 55, 0.15) rgba(212, 175, 55, 0.1) rgba(212, 175, 55, 0.25)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Subtle 3D Ambient Radial Glow Behind Card */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
                    <div className="space-y-1.5 max-w-xl">
                      <p className="text-zinc-100 text-sm font-semibold tracking-wide drop-shadow-sm">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-zinc-400 font-medium">
                        {file.created_at ? formatDate(file.created_at) : '—'}
                      </p>
                      
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {price !== null ? (
                          <>
                            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                              GHS {price.toFixed(2)}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Fixed by admin
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-400 font-medium italic">
                            Under review — admin will set the price shortly
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 italic pt-1">
                        Or pay cash to your class rep — they will mark it as paid.
                      </p>
                    </div>

                    <button
                      onClick={() => price !== null && setPayingFile({ id: file.id, name: file.file_name, price })}
                      disabled={price === null}
                      className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all duration-300 transform active:scale-95 disabled:cursor-not-allowed"
                      style={ price !== null ? {
                        color: '#09090b',
                        background: 'linear-gradient(135deg, #fcd34d 0%, #d4af37 50%, #b45309 100%)',
                        boxShadow: '0 4px 14px 0 rgba(212, 175, 55, 0.4), inset 0 1px 0px 0 rgba(255, 255, 255, 0.4)'
                      } : {
                        color: '#71717a',
                        background: 'rgba(212, 175, 55, 0.06)',
                        border: '1px solid rgba(212, 175, 55, 0.15)',
                      }}
                    >
                      {price !== null ? (
                        <>
                          <Smartphone className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                          <span>Pay GHS {price.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Awaiting price</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {unpaid.length === 0 && payments.length === 0 && (
        <div 
          className="text-center py-16 rounded-2xl border"
          style={{ 
            background: 'rgba(212, 175, 55, 0.02)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor: 'rgba(212, 175, 55, 0.1)',
            boxShadow: 'inset 0 0 24px 0 rgba(0,0,0,0.2)'
          }}
        >
          <CreditCard className="w-8 h-8 mx-auto mb-3 text-amber-500/40" />
          <p className="text-sm font-medium text-zinc-400">No payments yet</p>
        </div>
      )}

      {payments.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-400">
            Payment History
          </h2>
          <div className="space-y-3">
            {payments.map(payment => (
              <div 
                key={payment.id}
                className="flex items-center justify-between rounded-xl p-4 border transition-all duration-200"
                style={{ 
                  background: 'rgba(24, 24, 27, 0.4)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderColor: 'rgba(255, 255, 255, 0.04)',
                  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.15)'
                }}
              >
                <div className="space-y-1">
                  <p className="text-zinc-200 text-sm font-medium">
                    {(payment.files as { file_name: string } | null)?.file_name ?? 'Unknown file'}
                  </p>
                  <p className="text-xs text-zinc-400">
                    <span className="font-semibold text-amber-400/90">{payment.currency} {payment.amount.toFixed(2)}</span>
                    {payment.created_at ? ` · ${formatDate(payment.created_at)}` : ''}
                  </p>
                </div>
                <StatusBadge status={payment.status as 'pending' | 'paid' | 'failed'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {payingFile && (
        <PaystackPaymentModal
          fileId={payingFile.id}
          fileName={payingFile.name}
          onClose={() => setPayingFile(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
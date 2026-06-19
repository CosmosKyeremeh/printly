'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Phone, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Step = 'enter_number' | 'waiting' | 'success';

type Props = {
  fileId: string;
  fileName: string;
  filePrice: number;                                          // ← from DB, not hardcoded
  onClose: () => void;
  onSuccess: (fileId: string, fileName: string, amount: number) => void;
};

export function MoMoPaymentModal({ fileId, fileName, filePrice, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('enter_number');
  const [momoNumber, setMomoNumber] = useState('');
  const [network, setNetwork] = useState<'MTN' | 'Vodafone' | 'AirtelTigo'>('MTN');
  const [error, setError] = useState('');
  // Re-fetch price on mount to ensure it's fresh from DB, not stale props
  const [confirmedPrice, setConfirmedPrice] = useState<number>(filePrice);
  const [priceLoading, setPriceLoading] = useState(true);
  const supabase = createClient();

  // Re-fetch the latest price when modal opens
  useEffect(() => {
    async function fetchLatestPrice() {
      const { data } = await supabase
        .from('files')
        .select('page_count, manual_price, price_locked')
        .eq('id', fileId)
        .single();

      if (data) {
        const fresh = (data.price_locked && data.manual_price !== null)
          ? Number(data.manual_price)
          : Math.max(1, data.page_count ?? 1) * 1.00;
        setConfirmedPrice(fresh);
      }
      setPriceLoading(false);
    }
    fetchLatestPrice();
  }, [fileId, supabase]);

  async function handleInitiate(e: React.FormEvent) {
    e.preventDefault();
    if (momoNumber.length < 10) {
      setError('Enter a valid 10-digit MoMo number');
      return;
    }
    setError('');
    setStep('waiting');

    // Simulate MoMo network delay
    await new Promise(res => setTimeout(res, 4000));

    const res = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId,
        momoNumber,
        network,
        amount: confirmedPrice,  // ← actual price from DB
      }),
    });

    if (!res.ok) {
      setStep('enter_number');
      setError('Payment failed. Please try again.');
      return;
    }

    setStep('success');
    setTimeout(() => onSuccess(fileId, fileName, confirmedPrice), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: '#040b15cc' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{ background: '#420001', borderColor: '#64000080' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#64000040' }}>
              <Smartphone className="w-5 h-5" style={{ color: '#b67e7d' }} />
            </div>
            <div>
              <p className="text-white font-black text-sm">MoMo Payment</p>
              <p className="text-xs truncate max-w-[160px]" style={{ color: '#7a4a49' }}>
                {fileName}
              </p>
            </div>
          </div>
          {step !== 'waiting' && (
            <button onClick={onClose} style={{ color: '#7a4a49' }}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 'enter_number' && (
            <motion.div key="enter"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}>

              {/* Price — always from DB */}
              <div className="mb-4 p-3 rounded-xl text-center border"
                style={{ background: '#64000020', borderColor: '#64000050' }}>
                {priceLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: '#b67e7d' }} />
                ) : (
                  <>
                    <p className="text-2xl font-black text-white">
                      GHS {confirmedPrice.toFixed(2)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9d6463' }}>
                      Printing fee
                    </p>
                  </>
                )}
              </div>

              <form onSubmit={handleInitiate} className="space-y-3">
                {/* Network selector */}
                <div className="grid grid-cols-3 gap-2">
                  {(['MTN', 'Vodafone', 'AirtelTigo'] as const).map(n => (
                    <button key={n} type="button" onClick={() => setNetwork(n)}
                      className="py-2 rounded-lg text-xs font-bold border transition-all"
                      style={network === n
                        ? { background: '#b67e7d', color: '#040b15', borderColor: '#b67e7d' }
                        : { background: '#42000130', color: '#9d6463', borderColor: '#64000050' }
                      }>
                      {n}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: '#c99897' }}>
                    MoMo number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: '#7a4a49' }} />
                    <Input
                      type="tel"
                      value={momoNumber}
                      onChange={e => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="0XX XXX XXXX"
                      required
                      className="h-11 pl-9 text-white"
                      style={{ background: '#2a0001', borderColor: '#640000' }}
                    />
                  </div>
                </div>

                {error && <p className="text-xs" style={{ color: '#c99897' }}>{error}</p>}

                <Button type="submit" disabled={priceLoading}
                  className="w-full h-11 font-black text-sm text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #640000, #b67e7d)' }}>
                  Pay GHS {confirmedPrice.toFixed(2)}
                </Button>
              </form>

              <p className="text-xs text-center mt-3" style={{ color: '#7a4a49' }}>
                Demo mode — no real charge will be made
              </p>
            </motion.div>
          )}

          {step === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-6">
              <div className="relative w-16 h-16 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: '#b67e7d' }} />
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: '#64000040' }}>
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#b67e7d' }} />
                </div>
              </div>
              <p className="text-white font-bold mb-1">Waiting for approval</p>
              <p className="text-sm" style={{ color: '#9d6463' }}>
                Check your {network} prompt on {momoNumber}
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: '#14532d30' }}>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-black text-lg mb-1">Payment confirmed!</p>
              <p className="text-sm mb-2" style={{ color: '#9d6463' }}>
                GHS {confirmedPrice.toFixed(2)} paid via {network} MoMo
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
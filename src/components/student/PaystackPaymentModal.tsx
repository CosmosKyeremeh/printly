'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, X, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Step = 'confirm' | 'processing' | 'success' | 'error';

type Props = {
  fileId:    string;
  fileName:  string;
  onClose:   () => void;
  onSuccess: (fileId: string, fileName: string, amount: number) => void;
};

export function PaystackPaymentModal({ fileId, fileName, onClose, onSuccess }: Props) {
  const [step, setStep]         = useState<Step>('confirm');
  const [price, setPrice]       = useState<number | null>(null);
  const [isPriceSet, setIsPriceSet] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);

  // Fetch latest price status when modal opens
  useEffect(() => {
    fetch('/api/payments/initialize', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fileId, previewOnly: true }),
    })
      .then(r => r.json())
      .then(d => {
        setPrice(d.amount ?? null);
        setIsPriceSet(d.isPriceSet ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [fileId]);

  async function handlePay() {
    setStep('processing');

    const res  = await fetch('/api/payments/initialize', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fileId }),
    });
    const data = await res.json();

    if (!res.ok || !data.reference) {
      setError(data.error ?? 'Could not initialize payment.');
      setStep('error');
      return;
    }

    // @ts-ignore
    const PaystackPop = (await import('@paystack/inline-js')).default;
    const handler = PaystackPop.setup({
      key:      data.publicKey,
      email:    '',
      amount:   Math.round(data.amount * 100),
      ref:      data.reference,
      currency: 'GHS',
      channels: ['mobile_money', 'card'],
      callback: () => {
        setStep('success');
        setTimeout(() => onSuccess(fileId, fileName, data.amount), 2000);
      },
      onClose: () => {
        setStep('confirm');
      },
    });

    handler.openIframe();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: '#090a0fcc' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm rounded-2xl border p-6"
        style={{ background: '#0f0c06', borderColor: '#6a4920' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#6a492030' }}>
              <CreditCard className="w-5 h-5" style={{ color: '#cca152' }} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Pay for printing</p>
              <p className="text-xs truncate max-w-[160px]" style={{ color: '#93682c' }}>
                {fileName}
              </p>
            </div>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} style={{ color: '#6a4920' }}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">

          {step === 'confirm' && (
            <motion.div key="confirm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Price display area */}
              <div className="rounded-xl p-4 text-center mb-5 border"
                style={{ background: '#1a1409', borderColor: '#6a492040' }}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto"
                    style={{ color: '#cca152' }} />
                ) : isPriceSet && price !== null ? (
                  <>
                    <p className="text-2xl font-medium text-white">
                      GHS {price.toFixed(2)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#93682c' }}>
                      Printing fee
                    </p>
                  </>
                ) : (
                  // Price not set yet by admin
                  <>
                    <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: '#6a4920' }} />
                    <p className="text-sm font-medium" style={{ color: '#e9cb93' }}>
                      Price not set yet
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6a4920' }}>
                      Admin will review your file and update the price shortly.
                      Check back here once you receive a notification.
                    </p>
                  </>
                )}
              </div>

              {isPriceSet && price !== null && (
                <p className="text-xs text-center mb-4" style={{ color: '#6a4920' }}>
                  Pay with MTN MoMo, Vodafone Cash, AirtelTigo, or card.
                  Your Rep will set price soon.
                </p>
              )}

              <Button
                onClick={handlePay}
                disabled={loading || !isPriceSet || price === null}
                className="w-full h-11 font-medium text-sm rounded-xl"
                style={{
                  background: isPriceSet ? '#cca152' : '#1a1409',
                  color: isPriceSet ? '#090a0f' : '#6a4920',
                  cursor: isPriceSet ? 'pointer' : 'not-allowed',
                  border: isPriceSet ? 'none' : '1px solid #6a4920',
                }}
              >
                {isPriceSet && price !== null
                  ? `Pay GHS ${price.toFixed(2)}`
                  : 'Awaiting admin pricing'}
              </Button>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-6">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4"
                style={{ color: '#cca152' }} />
              <p className="text-white font-medium">Opening payment...</p>
              <p className="text-xs mt-1" style={{ color: '#93682c' }}>
                Complete the payment in the Paystack window
              </p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#14532d20' }}>
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-medium text-lg">Payment received!</p>
              <p className="text-sm mt-1" style={{ color: '#93682c' }}>
                GHS {price?.toFixed(2)} paid successfully
              </p>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-6">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <Button
                onClick={() => setStep('confirm')}
                variant="outline"
                className="text-sm"
                style={{ borderColor: '#6a4920', color: '#e9cb93' }}
              >
                Try again
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
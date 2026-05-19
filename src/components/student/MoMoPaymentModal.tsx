'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, Phone, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type Step = 'enter_number' | 'waiting' | 'success';

type Props = {
  fileId: string;
  fileName: string;
  onClose: () => void;
};

export function MoMoPaymentModal({ fileId, fileName, onClose }: Props) {
  const [step, setStep] = useState<Step>('enter_number');
  const [momoNumber, setMomoNumber] = useState('');
  const [network, setNetwork] = useState<'MTN' | 'Vodafone' | 'AirtelTigo'>('MTN');
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  async function handleInitiate(e: React.FormEvent) {
    e.preventDefault();
    if (momoNumber.length < 10) {
      setError('Enter a valid 10-digit MoMo number');
      return;
    }
    setError('');
    setStep('waiting');

    // Simulate network delay (demo)
    await new Promise(res => setTimeout(res, 4000));

    // Mark as paid in DB
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('files')
        .update({ payment_status: 'paid' })
        .eq('id', fileId);

      await supabase.from('payments').insert({
        file_id: fileId,
        student_id: user.id,
        amount: 2.00,
        currency: 'GHS',
        provider: 'momo',
        provider_payment_id: `DEMO-${Date.now()}`,
        status: 'paid',
        metadata: { network, phone: momoNumber, demo: true },
      });
    }

    setStep('success');
    router.refresh();
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm rounded-2xl border border-zinc-900 bg-zinc-950 p-6 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Module */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800 text-brand-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-zinc-100 font-semibold text-sm tracking-tight">Mobile Money Payment</p>
              <p className="text-xs text-zinc-500 truncate max-w-[180px] mt-0.5">
                {fileName}
              </p>
            </div>
          </div>
          {step !== 'waiting' && (
            <button 
              onClick={onClose} 
              className="text-zinc-500 hover:text-zinc-200 p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">

          {/* Step 1 — Enter number */}
          {step === 'enter_number' && (
            <motion.div 
              key="enter"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <div className="mb-4 p-4 rounded-xl text-center border border-zinc-900 bg-zinc-900/30">
                <p className="text-2xl font-bold text-zinc-100 tracking-tight">GHS 2.00</p>
                <p className="text-xs text-zinc-500 mt-0.5 font-medium">Standard Printing Fee</p>
              </div>

              <form onSubmit={handleInitiate} className="space-y-4">
                {/* Network Selector Cluster */}
                <div className="grid grid-cols-3 gap-1.5">
                  {(['MTN', 'Vodafone', 'AirtelTigo'] as const).map(n => {
                    const isSelected = network === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNetwork(n)}
                        className={cn(
                          "py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer",
                          isSelected
                            ? "bg-brand-500 text-brand-950 border-brand-500 shadow-md shadow-brand-500/5"
                            : "bg-zinc-900/50 text-zinc-400 border-zinc-900 hover:text-zinc-200 hover:border-zinc-800"
                        )}
                      >
                        {n === 'Vodafone' ? 'Telecel' : n}
                      </button>
                    );
                  })}
                </div>

                {/* Input Controls */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    Wallet Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <Input
                      type="tel"
                      value={momoNumber}
                      onChange={e => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="050 000 0000"
                      required
                      className="h-11 pl-9 text-zinc-100 bg-zinc-900 border-zinc-800 focus:border-brand-500/40 focus:ring-1 focus:ring-brand-500/10 placeholder:text-zinc-600 rounded-xl text-sm tracking-wide"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-400 font-medium pl-0.5">{error}</p>
                )}

                <Button 
                  type="submit"
                  disabled={momoNumber.length < 10}
                  className="w-full h-11 font-bold text-sm bg-brand-500 hover:bg-brand-400 text-brand-950 rounded-xl transition-all shadow-lg shadow-brand-500/5 cursor-pointer disabled:opacity-40 active:scale-[0.99]"
                >
                  Authorize GHS 2.00
                </Button>
              </form>

              <p className="text-[11px] text-center text-zinc-600 mt-4 font-medium">
                Sandbox Environment — Simulator Authorization Only
              </p>
            </motion.div>
          )}

          {/* Step 2 — Waiting */}
          {step === 'waiting' && (
            <motion.div 
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <div className="relative w-14 h-14 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full animate-ping opacity-10 bg-brand-400" />
                <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-800 text-brand-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
              <p className="text-zinc-200 font-semibold text-sm tracking-tight mb-1">Awaiting Instant Authorization</p>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
                Please complete the payment prompt pushed to your <span className="font-bold text-zinc-200">{network}</span> terminal on <span className="font-mono text-brand-300 font-medium">{momoNumber}</span>.
              </p>
            </motion.div>
          )}

          {/* Step 3 — Success */}
          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-zinc-100 font-bold tracking-tight text-base mb-1">Transaction Verified</p>
              <p className="text-xs text-zinc-500 mb-6 font-medium">
                GHS 2.00 captured successfully via {network === 'Vodafone' ? 'Telecel' : network} Wallet
              </p>
              <Button 
                onClick={onClose}
                className="w-full h-11 font-semibold text-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl transition-all cursor-pointer"
              >
                Return to Workspace
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
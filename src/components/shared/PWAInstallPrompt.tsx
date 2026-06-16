'use client';

import { useState, useEffect } from 'react';
import { Download, X, PrinterIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already installed as PWA — don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // Previously dismissed
    if (localStorage.getItem('pwa-dismissed')) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      // Small delay so it doesn't pop up immediately on load
      setTimeout(() => setVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      setPrompt(null);
    }
  }

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem('pwa-dismissed', '1');
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="fixed bottom-5 left-4 right-4 z-50 sm:left-auto sm:right-5 sm:w-[320px]"
        >
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
            
            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-lg text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content Body */}
            <div className="flex items-start gap-3 pr-6">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/10 border border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.1)]">
                <PrinterIcon className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-white font-black text-sm tracking-tight">Install Printly</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Add to your home screen for instant access — works offline too.
                </p>
              </div>
            </div>

            {/* Interaction Row */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-md shadow-amber-500/5 active:scale-[0.98] cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Install app
              </button>
              <button
                onClick={handleDismiss}
                className="h-9 px-4 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800 transition-all cursor-pointer"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
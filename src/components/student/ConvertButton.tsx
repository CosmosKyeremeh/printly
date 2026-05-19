'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getConversionFormats } from '@/lib/conversion/convertapi';

type ConvertButtonProps = {
  fileId: string;
  fileType: string;
};

export function ConvertButton({ fileId, fileType }: ConvertButtonProps) {
  const [status, setStatus] = useState<'idle' | 'converting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const conversion = getConversionFormats(fileType);
  if (!conversion.canConvert) return null;

  async function handleConvert() {
    setStatus('converting');
    setErrorMsg('');

    try {
      const response = await fetch(`/api/files/${fileId}/convert`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Conversion failed');
      }

      setStatus('done');
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  }

  return (
    <div className="space-y-1.5">
      <Button
        onClick={handleConvert}
        disabled={status === 'converting' || status === 'done'}
        variant="outline"
        size="sm"
        className="border-zinc-800 text-zinc-400 bg-zinc-900/20 backdrop-blur-xs hover:text-brand-300 hover:border-brand-500/40 text-xs h-8 rounded-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'converting' && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
        {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />}
        {status === 'idle' && <RefreshCw className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:rotate-45" />}
        {status === 'error' && <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-red-400/80" />}
        
        {status === 'done' 
          ? 'Converted — check My Files' 
          : status === 'converting' 
          ? 'Processing Asset...' 
          : conversion.label
        }
      </Button>
      
      {status === 'error' && (
        <p className="text-red-400 text-[11px] pl-1 font-medium tracking-wide animate-in fade-in-50 duration-200">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
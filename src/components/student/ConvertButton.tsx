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
    <div className="space-y-1">
      <Button
        onClick={handleConvert}
        disabled={status === 'converting' || status === 'done'}
        variant="outline"
        size="sm"
        className="border-zinc-700 text-zinc-300 hover:text-amber-500 hover:border-amber-500/50 text-xs h-8"
      >
        {status === 'converting' && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
        {status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />}
        {status === 'idle' && <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
        {status === 'done' ? 'Converted — check My Files' : conversion.label}
      </Button>
      {status === 'error' && (
        <p className="text-red-400 text-xs">{errorMsg}</p>
      )}
    </div>
  );
}
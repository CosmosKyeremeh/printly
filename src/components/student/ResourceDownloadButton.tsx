'use client';

import { createClient } from '@/lib/supabase/client';
import { Download } from 'lucide-react';

export function ResourceDownloadButton({ filePath, fileName }: { filePath: string; fileName: string }) {
  const supabase = createClient();

  return (
    <button
      onClick={() => {
        supabase.storage
          .from('resources')
          .createSignedUrl(filePath, 120)
          .then(({ data }) => {
            if (data?.signedUrl) {
              const a = document.createElement('a');
              a.href = data.signedUrl;
              a.download = fileName;
              a.click();
            }
          });
      }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-semibold border border-amber-500/20 transition-all shrink-0"
    >
      <Download className="w-3.5 h-3.5" />
      Download
    </button>
  );
}
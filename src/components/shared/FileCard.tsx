import { File } from 'lucide-react';
import { formatBytes } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';

type Props = {
  fileName: string;
  fileSize: number;
  category?: string;
  status: 'queued' | 'printing' | 'done' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
};

export function FileCard({ fileName, fileSize, category, status, paymentStatus }: Props) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
        <File className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{fileName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-zinc-500 text-xs">{formatBytes(fileSize)}</span>
          {category && (
            <>
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-zinc-500 text-xs">{category}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusBadge status={status} />
        <StatusBadge status={paymentStatus} />
      </div>
    </div>
  );
}
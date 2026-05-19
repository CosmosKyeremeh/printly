'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Printer, CheckCheck, X, File, Download, Banknote, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type QueueItem = {
  id: string;
  status: string;
  queued_at: string;
  files: {
    id: string;
    file_name: string;
    file_size: number;
    file_path: string;
    payment_status: string;
    instructions: string | null;
    profiles: { full_name: string | null; email: string } | null;
    categories: { name: string } | null;
  } | null;
};

export function PrintQueue({ initialQueue }: { initialQueue: QueueItem[] }) {
  const [queue, setQueue] = useState(initialQueue);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updating, setUpdating] = useState<string | null>(null);
  const supabase = createClient();

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === queue.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(queue.map(q => q.id)));
    }
  }

  async function updateStatus(ids: string[], status: string) {
    if (ids.length === 0) return;
    setUpdating(ids[0]);
    
    await supabase
      .from('print_queue')
      .update({
        status,
        ...(status === 'done' ? { printed_at: new Date().toISOString() } : {}),
      })
      .in('id', ids);

    setQueue(prev =>
      prev.map(item => ids.includes(item.id) ? { ...item, status } : item)
    );
    setSelected(new Set());
    setUpdating(null);
  }

  async function markAsPaid(fileId: string, queueId: string) {
    setUpdating(queueId);

    await supabase
      .from('files')
      .update({ payment_status: 'paid' })
      .eq('id', fileId);

    setQueue(prev =>
      prev.map(item =>
        item.id === queueId && item.files
          ? { ...item, files: { ...item.files, payment_status: 'paid' } }
          : item
      )
    );
    setUpdating(null);
  }

  async function handleDownload(path: string, name: string) {
    const { data } = await supabase.storage
      .from('assignments')
      .createSignedUrl(path, 60);
    if (data?.signedUrl) {
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = name;
      a.click();
    }
  }

  const allQueue = queue;
  const unpaidCount = queue.filter(q => q.files?.payment_status !== 'paid').length;

  return (
    <div className="space-y-4 max-w-5xl">

      {/* Info Banner — Pending Payments */}
      {unpaidCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 border border-amber-500/10 bg-brand-500/5">
          <Banknote className="w-4 h-4 mt-0.5 shrink-0 text-brand-400" />
          <p className="text-sm text-zinc-400 leading-normal">
            <span className="font-semibold text-brand-300">{unpaidCount} file{unpaidCount > 1 ? 's' : ''} pending payment.</span>
            {' '}You can mark over-the-counter cash payments as paid or proceed with printing directly.
          </p>
        </div>
      )}

      {/* Bulk Operations Toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-brand-500/20 bg-zinc-900/40 backdrop-blur-xs flex-wrap animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-sm font-semibold text-brand-300">
            {selected.size} jobs selected
          </span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <Button 
              size="sm" 
              onClick={() => updateStatus(Array.from(selected), 'printing')}
              className="font-semibold text-xs h-8 bg-brand-500 text-brand-950 hover:bg-brand-400 cursor-pointer rounded-lg"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Mark Printing
            </Button>
            <Button 
              size="sm" 
              onClick={() => updateStatus(Array.from(selected), 'done')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-8 cursor-pointer rounded-lg"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> Mark Done
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => updateStatus(Array.from(selected), 'cancelled')}
              className="border-red-500/20 text-red-400 hover:bg-red-500/5 text-xs h-8 cursor-pointer rounded-lg"
            >
              <X className="w-3.5 h-3.5 mr-1.5" /> Cancel Queue
            </Button>
          </div>
        </div>
      )}

      {/* Select All Toggle Wrapper */}
      {allQueue.length > 0 && (
        <div className="flex items-center gap-2.5 px-1 py-1">
          <input
            type="checkbox"
            id="selectAllQueue"
            checked={selected.size === allQueue.length}
            onChange={toggleAll}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500/20 focus:ring-offset-zinc-950 accent-brand-500 cursor-pointer"
          />
          <label htmlFor="selectAllQueue" className="text-xs text-zinc-500 font-medium select-none cursor-pointer hover:text-zinc-400 transition-colors">
            Select all active queue items
          </label>
        </div>
      )}

      {/* Queue Stream Container */}
      {allQueue.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-zinc-900 bg-zinc-900/5">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-zinc-900 text-zinc-600">
            <Printer className="w-5 h-5" />
          </div>
          <p className="font-semibold text-sm text-zinc-400">Queue is completely empty</p>
          <p className="text-xs text-zinc-600 mt-1">
            Incoming assignment submissions will populate here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {allQueue.map(item => {
            const isPaid = item.files?.payment_status === 'paid';
            const isSelected = selected.has(item.id);
            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl border bg-zinc-900/10 transition-all duration-150",
                  isSelected 
                    ? "border-brand-500/30 bg-brand-500/[0.02]" 
                    : "border-zinc-800/60 hover:border-zinc-800"
                )}
              >
                <div className="flex items-center gap-4 p-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 shrink-0 accent-brand-500 cursor-pointer"
                  />

                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-zinc-900 border border-zinc-800 text-brand-400">
                    <File className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 text-sm font-semibold truncate tracking-tight">
                      {item.files?.file_name ?? 'Missing File Link'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-zinc-500">
                      <span className="font-medium text-zinc-400">
                        {item.files?.profiles?.full_name ?? item.files?.profiles?.email ?? 'Unknown Student'}
                      </span>
                      {item.files?.categories && (
                        <>
                          <span>•</span>
                          <span className="text-brand-300 bg-brand-500/5 border border-brand-500/10 px-1.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider">
                            {item.files.categories.name}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>
                        {formatDate(item.queued_at)}
                      </span>
                    </div>
                  </div>

                  {/* Actions & Badges */}
                  <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                    <StatusBadge status={item.status as 'queued' | 'printing' | 'done' | 'cancelled'} />
                    
                    {isPaid ? (
                      <StatusBadge status="paid" />
                    ) : (
                      <button
                        onClick={() => item.files && markAsPaid(item.files.id, item.id)}
                        disabled={updating === item.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-500/5 text-brand-300 border border-brand-500/20 hover:bg-brand-500/10 transition-all cursor-pointer disabled:opacity-40"
                        title="Mark as paid (cash)"
                      >
                        {updating === item.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Banknote className="w-3 h-3" />
                        )}
                        Cash Paid
                      </button>
                    )}
                    
                    {item.files && (
                      <button
                        onClick={() => handleDownload(item.files!.file_path, item.files!.file_name)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer"
                        title="Download Asset File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Optional Internal Printing Instructions Module */}
                {item.files?.instructions && (
                  <div className="mx-4 mb-4 rounded-xl px-3.5 py-3 border border-zinc-800 bg-zinc-950/40">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                      Operational Context / Print Settings
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {item.files.instructions}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
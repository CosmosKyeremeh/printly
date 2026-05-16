'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { Printer, CheckCheck, X, File, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    if (selected.size === paidQueue.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paidQueue.map(q => q.id)));
    }
  }

  async function updateStatus(ids: string[], status: string) {
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

  const paidQueue = queue.filter(q => q.files?.payment_status === 'paid');
  const unpaidQueue = queue.filter(q => q.files?.payment_status !== 'paid');

  return (
    <div className="space-y-4">

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex-wrap">
          <span className="text-amber-400 text-sm font-semibold">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <Button
              size="sm"
              onClick={() => updateStatus(Array.from(selected), 'printing')}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs h-8"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Mark Printing
            </Button>
            <Button
              size="sm"
              onClick={() => updateStatus(Array.from(selected), 'done')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              Mark Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateStatus(Array.from(selected), 'cancelled')}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Unpaid warning */}
      {unpaidQueue.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-400 text-sm font-semibold mb-2">
            {unpaidQueue.length} unpaid file{unpaidQueue.length > 1 ? 's' : ''} — held from queue
          </p>
          <div className="space-y-2">
            {unpaidQueue.map(item => (
              <div key={item.id} className="flex items-center gap-3 opacity-50">
                <File className="w-4 h-4 text-zinc-600 shrink-0" />
                <span className="text-zinc-500 text-xs truncate flex-1">
                  {item.files?.file_name}
                </span>
                <StatusBadge status="pending" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Select all */}
      {paidQueue.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={selected.size === paidQueue.length}
            onChange={toggleAll}
            className="accent-amber-500 w-4 h-4"
          />
          <span className="text-zinc-500 text-xs">Select all paid</span>
        </div>
      )}

      {/* Queue items */}
      {paidQueue.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Printer className="w-7 h-7 text-zinc-700" />
          </div>
          <p className="text-zinc-400 font-medium">Queue is empty</p>
          <p className="text-zinc-600 text-sm mt-1">Paid submissions will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {paidQueue.map(item => (
            <div
              key={item.id}
              className={`bg-zinc-900 border rounded-xl p-4 transition-colors ${
                selected.has(item.id)
                  ? 'border-amber-500/40'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="accent-amber-500 w-4 h-4 shrink-0"
                />

                <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                  <File className="w-4 h-4 text-zinc-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {item.files?.file_name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-zinc-500 text-xs">
                      {item.files?.profiles?.full_name ?? item.files?.profiles?.email}
                    </span>
                    {item.files?.categories && (
                      <>
                        <span className="text-zinc-700 text-xs">·</span>
                        <span className="text-zinc-500 text-xs">
                          {item.files.categories.name}
                        </span>
                      </>
                    )}
                    <span className="text-zinc-700 text-xs">·</span>
                    <span className="text-zinc-500 text-xs">
                      {formatDate(item.queued_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge
                    status={item.status as 'queued' | 'printing' | 'done' | 'cancelled'}
                  />
                  <button
                    onClick={() =>
                      item.files &&
                      handleDownload(item.files.file_path, item.files.file_name)
                    }
                    className="p-1.5 text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Printing instructions */}
              {item.files?.instructions && (
                <div className="mt-3 ml-13 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2.5">
                  <p className="text-amber-500/70 text-xs font-semibold uppercase tracking-wide mb-1">
                    Printing instructions
                  </p>
                  <p className="text-amber-300/90 text-sm leading-relaxed">
                    {item.files.instructions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
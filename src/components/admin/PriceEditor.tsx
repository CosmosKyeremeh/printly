'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Lock, Unlock, Edit2, Check } from 'lucide-react';

type Props = {
  fileId: string;
  pageCount: number;
  manualPrice: number | null;
  priceLocked: boolean;
};

export function PriceEditor({ fileId, pageCount, manualPrice, priceLocked }: Props) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(manualPrice?.toString() ?? '');
  const [locked, setLocked] = useState(priceLocked);
  const [currentManual, setCurrentManual] = useState(manualPrice);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const autoPrice = pageCount * 1.0;
  const displayPrice = locked && currentManual !== null ? currentManual : autoPrice;

  async function handleSave() {
    if (!price || isNaN(Number(price))) return;

    setSaving(true);
    const newPrice = Number(Number(price).toFixed(2));

    await supabase
      .from('files')
      .update({
        manual_price: newPrice,
        price_locked: true,
      })
      .eq('id', fileId);

    setCurrentManual(newPrice);
    setLocked(true);
    setEditing(false);
    setSaving(false);
  }

  async function handleUnlock() {
    setSaving(true);

    await supabase
      .from('files')
      .update({
        manual_price: null,
        price_locked: false,
      })
      .eq('id', fileId);

    setCurrentManual(null);
    setLocked(false);
    setPrice('');
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2">
      {editing ? (
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-400 text-xs">GHS</span>

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.50"
            className="w-16 h-7 bg-zinc-800 border border-zinc-700 rounded-lg px-2 text-white text-xs focus:border-amber-500 focus:outline-none"
            autoFocus
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10 transition-all"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span
            className={`text-sm font-bold ${
              locked ? 'text-amber-400' : 'text-zinc-300'
            }`}
          >
            GHS {displayPrice.toFixed(2)}
          </span>

          {locked && (
            <span
              className="inline-flex items-center ml-1"
              title="Price manually locked"
            >
              <Lock
                className="w-3 h-3 text-amber-500/60"
                aria-hidden="true"
              />
              <span className="sr-only">Price manually locked</span>
            </span>
          )}

          <span className="text-zinc-600 text-xs">({pageCount}p)</span>

          <button
            onClick={() => {
              setPrice(displayPrice.toFixed(2));
              setEditing(true);
            }}
            className="p-1 rounded text-zinc-600 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
            title="Edit price"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          {locked && (
            <button
              onClick={handleUnlock}
              disabled={saving}
              className="p-1 rounded text-zinc-600 hover:text-zinc-400 transition-all"
              title="Reset to auto price"
            >
              <Unlock className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
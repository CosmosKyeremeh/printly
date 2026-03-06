'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
  description: string | null;
  deadline: string | null;
  created_at: string | null;
};

export function CategoryManager({ initial }: { initial: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, description: description || null, deadline: deadline || null })
      .select()
      .single();

    if (!error && data) {
      setCategories(prev => [data, ...prev]);
      setName('');
      setDescription('');
      setDeadline('');
    }
    setCreating(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from('categories').delete().eq('id', id);
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">New Category</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Category name *"
              required
              className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:border-amber-500 text-sm"
            />
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 focus-visible:border-amber-500 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <Input
              type="datetime-local"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="h-10 bg-zinc-800 border-zinc-700 text-white focus-visible:border-amber-500 text-sm flex-1"
            />
            <Button
              type="submit"
              disabled={creating}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm h-10 px-5 shrink-0"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1.5" />Create</>}
            </Button>
          </div>
        </form>
      </div>

      {/* Category list */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No categories yet</p>
          </div>
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{cat.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {cat.description && (
                    <span className="text-zinc-500 text-xs">{cat.description}</span>
                  )}
                  {cat.deadline && (
                    <span className="text-amber-500/70 text-xs">
                      Due {formatDate(cat.deadline)}
                    </span>
                  )}
                  {!cat.description && !cat.deadline && (
                    <span className="text-zinc-600 text-xs">Created {formatDate(cat.created_at ?? new Date().toISOString())}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deleting === cat.id}
                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                {deleting === cat.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Trash2 className="w-4 h-4" />
                }
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
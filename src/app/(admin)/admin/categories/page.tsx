import { createClient } from '@/lib/supabase/server';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { Tag } from 'lucide-react';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
          <Tag className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Categories</h1>
          <p className="text-zinc-500 text-xs">Organise submissions by assignment type</p>
        </div>
      </div>
      <CategoryManager initial={categories ?? []} />
    </div>
  );
}
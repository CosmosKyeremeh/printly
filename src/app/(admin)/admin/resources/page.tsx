import { createClient } from '@/lib/supabase/server';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { BookOpen } from 'lucide-react';

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: resources } = await supabase
    .from('admin_resources')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Resources</h1>
          <p className="text-zinc-500 text-xs">Upload templates and files for students to download</p>
        </div>
      </div>
      <ResourceManager adminId={user!.id} initial={resources ?? []} />
    </div>
  );
}
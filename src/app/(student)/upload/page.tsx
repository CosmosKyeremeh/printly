import { createClient } from '@/lib/supabase/server';
import { UploadZone } from '@/components/student/UploadZone';
import { Upload } from 'lucide-react';

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Upload Assignment</h1>
        </div>
        <p className="text-zinc-400 text-sm ml-12">
          Select a category and upload your files. The admin will be notified automatically.
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <UploadZone categories={categories ?? []} />
      </div>
    </div>
  );
}
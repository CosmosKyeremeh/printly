import { createClient } from '@/lib/supabase/server';
import { BookOpen, Download } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';
import { ResourceDownloadButton } from '@/components/student/ResourceDownloadButton';

export default async function ResourcesPage() {
  const supabase = await createClient();
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
          <p className="text-zinc-500 text-xs">Templates and materials from your admin</p>
        </div>
      </div>

      <div className="space-y-3">
        {!resources || resources.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No resources available yet</p>
            <p className="text-zinc-600 text-xs mt-1">Your admin will upload templates and materials here</p>
          </div>
        ) : (
          resources.map(r => (
            <div key={r.id}
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{r.title}</p>
                {r.description && (
                  <p className="text-zinc-400 text-xs mt-0.5">{r.description}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-zinc-600 text-xs">{formatBytes(r.file_size)}</span>
                  <span className="text-zinc-700 text-xs">·</span>
                  <span className="text-zinc-600 text-xs">
                    {formatDate(r.created_at ?? new Date().toISOString())}
                  </span>
                </div>
              </div>
              <ResourceDownloadButton filePath={r.file_path} fileName={r.file_name} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
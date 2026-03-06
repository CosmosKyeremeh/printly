'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatBytes, formatDate } from '@/lib/utils';
import { Download, Trash2, File, Loader2 } from 'lucide-react';

type FileRow = {
  id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  description: string | null;
  status: string;
  payment_status: string;
  created_at: string;
  categories: { name: string } | null;
};

export function FileList({ files }: { files: FileRow[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [list, setList] = useState(files);
  const supabase = createClient();

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

  async function handleDelete(id: string, path: string) {
    setDeleting(id);
    await supabase.storage.from('assignments').remove([path]);
    await supabase.from('files').delete().eq('id', id);
    setList(prev => prev.filter(f => f.id !== id));
    setDeleting(null);
  }

  if (list.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <File className="w-7 h-7 text-zinc-700" />
        </div>
        <p className="text-zinc-400 font-medium">No files uploaded yet</p>
        <p className="text-zinc-600 text-sm mt-1">Upload your first assignment to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map(file => (
        <div
          key={file.id}
          className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors"
        >
          <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
            <File className="w-5 h-5 text-zinc-400" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{file.file_name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-zinc-500 text-xs">{formatBytes(file.file_size)}</span>
              {file.categories && (
                <>
                  <span className="text-zinc-700 text-xs">·</span>
                  <span className="text-zinc-500 text-xs">{file.categories.name}</span>
                </>
              )}
              <span className="text-zinc-700 text-xs">·</span>
              <span className="text-zinc-500 text-xs">{formatDate(file.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={file.status as 'queued' | 'printing' | 'done' | 'cancelled'} />
            <StatusBadge status={file.payment_status as 'pending' | 'paid' | 'failed'} />
            <button
              onClick={() => handleDownload(file.file_path, file.file_name)}
              className="p-2 text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(file.id, file.file_path)}
              disabled={deleting === file.id}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
              title="Delete"
            >
              {deleting === file.id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Trash2 className="w-4 h-4" />
              }
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
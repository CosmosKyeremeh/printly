'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatBytes, formatDate } from '@/lib/utils';
import { Download, Trash2, File, Loader2, RefreshCw } from 'lucide-react';

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
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: '#42000130' }}
        >
          <File className="w-7 h-7" style={{ color: '#640000' }} />
        </div>
        <p className="text-white font-medium">No files uploaded yet</p>
        <p className="text-sm mt-1" style={{ color: '#7a4a49' }}>
          Upload your first assignment to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {list.map(file => (
        <div
          key={file.id}
          className="flex items-center gap-4 rounded-xl p-4 border transition-all"
          style={{ background: '#420001', borderColor: '#64000060' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#b67e7d30'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#64000060'}
        >
          {/* File icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#64000030' }}
          >
            <File className="w-5 h-5" style={{ color: '#b67e7d' }} />
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{file.file_name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs" style={{ color: '#7a4a49' }}>
                {formatBytes(file.file_size)}
              </span>
              {file.categories && (
                <>
                  <span className="text-xs" style={{ color: '#640000' }}>·</span>
                  <span className="text-xs" style={{ color: '#7a4a49' }}>
                    {file.categories.name}
                  </span>
                </>
              )}
              <span className="text-xs" style={{ color: '#640000' }}>·</span>
              <span className="text-xs" style={{ color: '#7a4a49' }}>
                {formatDate(file.created_at)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <StatusBadge status={file.status as 'queued' | 'printing' | 'done' | 'cancelled'} />
            <StatusBadge status={file.payment_status as 'pending' | 'paid' | 'failed'} />

            {/* Convert CTA */}
            <Link
              href={`/files/${file.id}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              style={{ color: '#b67e7d', borderColor: '#64000060', background: '#64000020' }}
              title="View details & convert"
            >
              <RefreshCw className="w-3 h-3" />
              Convert
            </Link>

            {/* Download */}
            <button
              onClick={() => handleDownload(file.file_path, file.file_name)}
              className="p-2 rounded-lg transition-all border border-transparent"
              style={{ color: '#9d6463' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#b67e7d';
                e.currentTarget.style.background = '#64000030';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#9d6463';
                e.currentTarget.style.background = 'transparent';
              }}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDelete(file.id, file.file_path)}
              disabled={deleting === file.id}
              className="p-2 rounded-lg transition-all border border-transparent disabled:opacity-50"
              style={{ color: '#9d6463' }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.background = '#7f1d1d20';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#9d6463';
                e.currentTarget.style.background = 'transparent';
              }}
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
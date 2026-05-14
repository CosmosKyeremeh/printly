'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import { FILE_SIZE_LIMIT_BYTES, SUPPORTED_FILE_TYPES } from '@/config/constants';

type Category = { id: string; name: string };
type FileStatus = 'idle' | 'uploading' | 'done' | 'error';

type QueuedFile = {
  file: File;
  status: FileStatus;
  progress: number;
  error?: string;
};

export function UploadZone({ categories }: { categories: Category[] }) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const supabase = createClient();

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles = accepted.map(file => ({
      file,
      status: 'idle' as FileStatus,
      progress: 0,
    }));
    setQueue(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: FILE_SIZE_LIMIT_BYTES,
    accept: Object.fromEntries(SUPPORTED_FILE_TYPES.map(t => [t, []])),
  });

  function removeFile(index: number) {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }

  async function uploadAll() {
    if (!categoryId) {
      alert('Please select a category first.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status === 'done') continue;

      setQueue(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      try {
        const file = queue[i].file;
        const path = `${user.id}/${Date.now()}_${file.name}`;

        const { error: storageError } = await supabase.storage
          .from('assignments')
          .upload(path, file);

        if (storageError) throw storageError;

        setQueue(prev => prev.map((f, idx) =>
          idx === i ? { ...f, progress: 70 } : f
        ));

        const { error: dbError } = await supabase.from('files').insert({
          owner_id: user.id,
          category_id: categoryId,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          file_type: file.type,
          description: description || null,
          instructions: instructions || null,
        });

        if (dbError) throw dbError;

        setQueue(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'done', progress: 100 } : f
        ));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setQueue(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'error', error: message } : f
        ));
      }
    }
  }

  const pendingCount = queue.filter(f => f.status !== 'done').length;

  return (
    <div className="space-y-5">

      {/* Category + description */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-sm font-medium">Category *</label>
          <select
            aria-label="Assignment category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full h-11 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="">Select a category...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-zinc-300 text-sm font-medium">
            Description
            <span className="text-zinc-600 font-normal ml-1">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. Final submission"
            className="w-full h-11 bg-zinc-900 border border-zinc-700 rounded-lg px-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Printing instructions */}
      <div className="space-y-1.5">
        <label className="text-zinc-300 text-sm font-medium">
          Printing instructions
          <span className="text-zinc-600 font-normal ml-1">(optional)</span>
        </label>
        <textarea
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="e.g. Print 2 copies, double-sided. Please bold the title on page 1 before printing."
          rows={3}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 transition-colors resize-none"
        />
        <p className="text-zinc-600 text-xs">
          The admin will see these instructions in the print queue
        </p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-amber-500 bg-amber-500/5'
            : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
            isDragActive ? 'bg-amber-500/20' : 'bg-zinc-800'
          }`}>
            <Upload className={`w-6 h-6 ${isDragActive ? 'text-amber-500' : 'text-zinc-400'}`} />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-zinc-500 text-xs mt-1">
              or <span className="text-amber-500">click to browse</span> — PDF, DOCX, PPTX, XLSX, ZIP, images up to 50MB
            </p>
          </div>
        </div>
      </div>

      {/* File queue */}
      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5"
            >
              <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                <File className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-zinc-500 text-xs">{formatBytes(item.file.size)}</p>
                {item.status === 'uploading' && (
                  <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
                {item.status === 'error' && (
                  <p className="text-red-400 text-xs mt-0.5">{item.error}</p>
                )}
              </div>
              <div className="shrink-0">
                {item.status === 'idle' && (
                  <button
                    onClick={() => removeFile(i)}
                    className="text-zinc-600 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {item.status === 'uploading' && (
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                )}
                {item.status === 'done' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <Button
          onClick={uploadAll}
          className="w-full h-11 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20"
        >
          Upload {pendingCount} file{pendingCount > 1 ? 's' : ''}
        </Button>
      )}

    </div>
  );
}
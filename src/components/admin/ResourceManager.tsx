'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, File, Trash2, Download, Loader2, BookOpen } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

type Resource = {
  id: string;
  title: string;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  created_at: string | null;
};

export function ResourceManager({
  adminId,
  initial,
}: {
  adminId: string;
  initial: Resource[];
}) {
  const [resources, setResources] = useState(initial);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
  });

  async function handleUpload(e: React.SubmitEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setUploading(true);

    const path = `templates/${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase.storage
      .from('resources')
      .upload(path, file, { upsert: false });

    if (storageError) {
      setUploading(false);
      return;
    }

    const { data, error: dbError } = await supabase
      .from('admin_resources')
      .insert({
        title,
        description: description || null,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        file_type: file.type,
        created_by: adminId,
      })
      .select()
      .single();

    if (!dbError && data) {
      setResources(prev => [data, ...prev]);
      setTitle('');
      setDescription('');
      setFile(null);
    }
    setUploading(false);
  }

  async function handleDelete(id: string, path: string) {
    setDeleting(id);
    await supabase.storage.from('resources').remove([path]);
    await supabase.from('admin_resources').delete().eq('id', id);
    setResources(prev => prev.filter(r => r.id !== id));
    setDeleting(null);
  }

  async function handleDownload(path: string, name: string) {
    const { data } = await supabase.storage
      .from('resources')
      .createSignedUrl(path, 120);
    if (data?.signedUrl) {
      const a = document.createElement('a');
      a.href = data.signedUrl;
      a.download = name;
      a.click();
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-4">Upload New Resource</h3>
        <form onSubmit={handleUpload} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Resource title *"
              required
              className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
            />
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="h-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
            />
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-700 hover:border-zinc-500 bg-zinc-800/30'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <File className="w-4 h-4 text-amber-500" />
                <span className="text-white text-sm font-medium">{file.name}</span>
                <span className="text-zinc-500 text-xs">({formatBytes(file.size)})</span>
              </div>
            ) : (
              <div>
                <Upload className="w-5 h-5 text-zinc-500 mx-auto mb-2" />
                <p className="text-zinc-400 text-sm">
                  {isDragActive ? 'Drop file here' : 'Drag file here or click to browse'}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={uploading || !file || !title.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm h-10 px-5"
          >
            {uploading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
            {uploading ? 'Uploading...' : 'Upload resource'}
          </Button>
        </form>
      </div>

      {/* Resource list */}
      <div className="space-y-2">
        {resources.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No resources uploaded yet</p>
          </div>
        ) : (
          resources.map(r => (
            <div key={r.id}
              className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">{r.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-zinc-500 text-xs">{r.file_name}</span>
                  <span className="text-zinc-700 text-xs">·</span>
                  <span className="text-zinc-500 text-xs">{formatBytes(r.file_size)}</span>
                  <span className="text-zinc-700 text-xs">·</span>
                  <span className="text-zinc-500 text-xs">
                    {formatDate(r.created_at ?? new Date().toISOString())}
                  </span>
                </div>
                {r.description && (
                  <p className="text-zinc-600 text-xs mt-0.5">{r.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(r.file_path, r.file_name)}
                  className="p-2 text-zinc-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(r.id, r.file_path)}
                  disabled={deleting === r.id}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === r.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
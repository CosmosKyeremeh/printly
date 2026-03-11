import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ConvertButton } from '@/components/student/ConvertButton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatBytes, formatDate } from '@/lib/utils';
import { FileText, Download } from 'lucide-react';

export default async function FileDetailPage({
  params,
}: {
  params: Promise<{ fileId: string }>;
}) {
  const { fileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: file } = await supabase
    .from('files')
    .select('*, categories(name)')
    .eq('id', fileId)
    .eq('owner_id', user!.id)
    .single();

  if (!file) notFound();

  const { data: signedData } = await supabase.storage
    .from('assignments')
    .createSignedUrl(file.file_path, 60);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6 text-zinc-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-lg truncate">{file.file_name}</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              {formatBytes(file.file_size)} · Uploaded {formatDate(file.created_at ?? new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Print Status</p>
            <StatusBadge status={file.status as 'queued' | 'printing' | 'done' | 'cancelled'} />
          </div>
          <div className="bg-zinc-800/50 rounded-xl p-4">
            <p className="text-zinc-500 text-xs mb-1">Payment</p>
            <StatusBadge status={file.payment_status as 'pending' | 'paid' | 'failed'} />
          </div>
          {file.categories && (
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Category</p>
              <p className="text-white text-sm font-medium">
                {(file.categories as { name: string }).name}
              </p>
            </div>
          )}
          {file.description && (
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">Description</p>
              <p className="text-white text-sm">{file.description}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
          {signedData?.signedUrl && (
            
             <a href={signedData.signedUrl}
              download={file.file_name}
              className="flex items-center gap-2 text-sm font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-4 py-2 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
          <ConvertButton fileId={file.id} fileType={file.file_type} />
        </div>

      </div>
    </div>
  );
}
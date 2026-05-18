import { createClient } from '@/lib/supabase/server';
import { PrintQueue } from '@/components/admin/PrintQueue';
import { PrinterIcon } from 'lucide-react';

export default async function QueuePage() {
  const supabase = await createClient();

  const { data: queue } = await supabase
    .from('print_queue')
    .select(`
      id, status, queued_at,
      files (
        id, file_name, file_size, file_path, payment_status, instructions,
        profiles ( full_name, email ),
        categories ( name )
      )
    `)
    .order('queued_at', { ascending: true });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: '#64000030' }}>
          <PrinterIcon className="w-4 h-4" style={{ color: '#b67e7d' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Print Queue</h1>
          <p className="text-xs" style={{ color: '#7a4a49' }}>
            {queue?.length ?? 0} item{queue?.length !== 1 ? 's' : ''} in queue
          </p>
        </div>
      </div>
      <PrintQueue initialQueue={(queue ?? []) as Parameters<typeof PrintQueue>[0]['initialQueue']} />
    </div>
  );
}
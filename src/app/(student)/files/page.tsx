import { createClient } from '@/lib/supabase/server';
import { FileList } from '@/components/student/FileList';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function FilesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: files } = await supabase
    .from('files')
    .select(`
      *,
      categories(name),
      print_queue(status, position)
    `)
    .eq('owner_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">My Files</h1>
            <p className="text-zinc-500 text-xs">{files?.length ?? 0} file{files?.length !== 1 ? 's' : ''} uploaded</p>
          </div>
        </div>
        <Link href="/upload">
          <Button className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm h-9">
            + Upload
          </Button>
        </Link>
      </div>

      <FileList files={(files ?? []) as Parameters<typeof FileList>[0]['files']} />
    </div>
  );
}
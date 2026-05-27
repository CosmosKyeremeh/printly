import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { fileId, momoNumber, network } = await request.json();
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the file belongs to this user
  const { data: file } = await supabase
    .from('files')
    .select('id, owner_id')
    .eq('id', fileId)
    .eq('owner_id', user.id)
    .single();

  if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  // In production: call real MoMo API here
  // For demo: I'm only simulating a delay then confirm

  await supabase.from('files')
    .update({ payment_status: 'paid' })
    .eq('id', fileId);

  await supabase.from('payments').insert({
    file_id: fileId,
    student_id: user.id,
    amount: 2.00,
    currency: 'GHS',
    provider: 'momo',
    provider_payment_id: `DEMO-${Date.now()}`,
    status: 'paid',
    metadata: { network, phone: momoNumber, demo: true },
  });

  return NextResponse.json({ success: true });
}
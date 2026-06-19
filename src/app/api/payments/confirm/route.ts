import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { fileId, momoNumber, network, amount } = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify file belongs to this user
    const { data: file } = await supabase
      .from('files')
      .select('id, owner_id, page_count, manual_price, price_locked')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .single();

    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    // Re-compute authoritative price server-side — cannot be spoofed
    const serverPrice = (file.price_locked && file.manual_price !== null)
      ? Number(file.manual_price)
      : Math.max(1, file.page_count ?? 1) * 1.00;

    const admin = adminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    await admin.from('files').update({ payment_status: 'paid' }).eq('id', fileId);

    await admin.from('payments').insert({
      file_id: fileId,
      student_id: user.id,
      amount: serverPrice,           // ← always from DB, never from client
      currency: 'GHS',
      provider: 'momo',
      provider_payment_id: `DEMO-${Date.now()}`,
      status: 'paid',
      metadata: { network, phone: momoNumber, demo: true },
    });

    return NextResponse.json({ success: true, amount: serverPrice });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body      = await request.text();
    const signature = request.headers.get('x-paystack-signature') ?? '';

    // Verify the request actually came from Paystack
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid Paystack webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Only handle successful charges
    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true });
    }

    const { reference, metadata, amount, status } = event.data;
    const fileId    = metadata?.file_id;
    const studentId = metadata?.student_id;

    if (!fileId || !studentId) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Mark the file as paid
    await admin
      .from('files')
      .update({ payment_status: 'paid' })
      .eq('id', fileId);

    // Update the payment record
    await admin
      .from('payments')
      .update({
        status:          'paid',
        paystack_status: status,
        provider_payment_id: reference,
      })
      .eq('paystack_reference', reference);

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
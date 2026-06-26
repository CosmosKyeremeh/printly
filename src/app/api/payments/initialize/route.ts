import { createClient } from '@/lib/supabase/server';
import { createClient as adminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fileId, previewOnly = false } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: file } = await supabase
      .from('files')
      .select('id, owner_id, file_name, page_count, manual_price, price_locked, payment_status')
      .eq('id', fileId)
      .eq('owner_id', user.id)
      .single();

    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    if (file.payment_status === 'paid') {
      return NextResponse.json({ error: 'File is already paid for' }, { status: 400 });
    }

    // Price is only considered "set" when admin has explicitly locked it
    const isPriceSet = file.price_locked === true && file.manual_price !== null;

    const amountGHS = isPriceSet
      ? Number(file.manual_price)
      : null; // No price yet — admin hasn't reviewed

    // Preview only — just return price status, create nothing
    if (previewOnly) {
      return NextResponse.json({ amount: amountGHS, isPriceSet });
    }

    // Block payment if price hasn't been set by admin
    if (!isPriceSet || amountGHS === null) {
      return NextResponse.json(
        { error: 'Admin has not set a price for this file yet.' },
        { status: 400 }
      );
    }

    // Initialize Supabase Admin Client
    const admin = adminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ── Check if a pending payment already exists for this file ──
    // If so, reuse its reference — avoids Duplicate Transaction Reference error
    const { data: existingPayment } = await admin
      .from('payments')
      .select('paystack_reference, amount')
      .eq('file_id', fileId)
      .eq('student_id', user.id)
      .eq('status', 'pending')
      .eq('provider', 'paystack')
      .maybeSingle();

    if (existingPayment?.paystack_reference) {
      return NextResponse.json({
        reference: existingPayment.paystack_reference,
        amount:    existingPayment.amount,
        isPriceSet: true,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email:     user.email, // Passing user context back down to frontend context securely
      });
    }

    // ── No existing pending — generate a fresh unique reference and hit Paystack ──
    const amountPesewas = Math.round(amountGHS * 100);
    const reference = `PRINTLY-${fileId.slice(0, 8).toUpperCase()}-${Date.now()}`;

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email:    user.email,
        amount:   amountPesewas,
        currency: 'GHS',
        reference,
        metadata: {
          file_id:    fileId,
          student_id: user.id,
          file_name:  file.file_name,
        },
        channels: ['mobile_money', 'card'],
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      return NextResponse.json({ error: 'Payment initialization failed.' }, { status: 500 });
    }

    // Log the fresh record safely down to database
    await admin.from('payments').insert({
      file_id:            fileId,
      student_id:         user.id,
      amount:             amountGHS,
      currency:           'GHS',
      provider:           'paystack',
      status:             'pending',
      paystack_reference: reference,
      paystack_status:    'initialized',
    });

    return NextResponse.json({
      reference,
      amount:    amountGHS,
      isPriceSet,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email:     user.email,
    });

  } catch (err) {
    console.error('Payment initialize error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
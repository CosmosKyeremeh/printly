import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { notificationId } = await request.json();

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS for the update
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: notif } = await admin
      .from('notifications')
      .select('read_by')
      .eq('id', notificationId)
      .single();

    if (!notif) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const current: string[] = notif.read_by ?? [];
    if (current.includes(user.id)) {
      return NextResponse.json({ already: true });
    }

    const { error } = await admin
      .from('notifications')
      .update({ read_by: [...current, user.id] })
      .eq('id', notificationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    );
  }
}
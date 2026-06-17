import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.toUpperCase().trim();

  if (!code) {
    return NextResponse.json({ error: 'Code required' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('join_code', code)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Invalid join code' }, { status: 404 });
  }

  return NextResponse.json({ orgId: data.id, orgName: data.name });
}
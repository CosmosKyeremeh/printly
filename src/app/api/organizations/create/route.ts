import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function makeJoinCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase() +
    '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // name is now optional — fall back to a sensible default
    const name = body.name?.trim() || 'My Class';
    const slug = `class-${Date.now()}`;

    const { data: org, error } = await getAdmin()
      .from('organizations')
      .insert({ name, slug, join_code: makeJoinCode() })
      .select('id, join_code')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ orgId: org.id, joinCode: org.join_code });

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
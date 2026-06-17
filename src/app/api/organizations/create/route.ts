import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Uses service role — bypasses RLS, safe because this is server-only
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function generateJoinCode(name: string): string {
  const prefix = name
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase();
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { schoolName, className } = body;

    if (!schoolName?.trim() || !className?.trim()) {
      return NextResponse.json(
        { error: 'School name and class name are required' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    const slug = `${className}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);

    const joinCode = generateJoinCode(className);

    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        name: `${schoolName.trim()} — ${className.trim()}`,
        slug,
        join_code: joinCode,
      })
      .select('id, join_code')
      .single();

    if (error) {
      console.error('Org creation error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orgId:    org.id,
      joinCode: org.join_code,
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Server error — please try again' },
      { status: 500 }
    );
  }
}
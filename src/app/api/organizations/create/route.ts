import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateJoinCode(slug: string): string {
  // e.g. CE300-X7K2
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const prefix = slug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 5).toUpperCase();
  return `${prefix}-${suffix}`;
}

export async function POST(request: Request) {
  try {
    const { schoolName, className } = await request.json();

    if (!schoolName?.trim() || !className?.trim()) {
      return NextResponse.json({ error: 'School and class name required' }, { status: 400 });
    }

    const supabase = await createClient();

    const slug = `${className}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const joinCode = generateJoinCode(className);

    // Insert org — Postgres auto-generates the UUID
    const { data: org, error } = await supabase
      .from('organizations')
      .insert({
        name: `${schoolName} — ${className}`,
        slug,
        join_code: joinCode,
      })
      .select('id')
      .single();

    if (error || !org) {
      return NextResponse.json({ error: error?.message ?? 'Failed to create org' }, { status: 500 });
    }

    return NextResponse.json({
      orgId: org.id,      // ← the auto-generated UUID
      joinCode,
    });

  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
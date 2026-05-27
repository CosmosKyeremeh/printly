import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json();

  if (code !== process.env.ADMIN_CODE) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}
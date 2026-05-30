import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as 'signup' | 'recovery' | 'email',
      token_hash,
    });

    if (!error) {
      // Check role to redirect correctly
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        const redirectTo = profile?.role === 'admin'
          ? '/admin/dashboard'
          : next;

        return NextResponse.redirect(
          new URL(redirectTo, request.url)
        );
      }
    }
  }

  // Something went wrong — send to login with error
  return NextResponse.redirect(
    new URL('/login?error=confirmation_failed', request.url)
  );
}
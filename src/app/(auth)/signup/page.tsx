import { Suspense } from 'react';
import { createClient as adminClient } from '@supabase/supabase-js';
import { SignupForm } from '@/components/auth/SignupForm';

export default async function SignupPage() {
  // Service role bypasses RLS — gives accurate count
  const admin = adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { count } = await admin
    .from('organizations')
    .select('*', { count: 'exact', head: true });

  const isFirstSetup = (count ?? 0) === 0;

  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-950" />}>
      <SignupForm isFirstSetup={isFirstSetup} />
    </Suspense>
  );
}
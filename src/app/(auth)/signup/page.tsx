import { createClient } from '@/lib/supabase/server';
import { SignupForm } from '@/components/auth/SignupForm';

export default async function SignupPage() {
  const supabase = await createClient();

  // Server-side check — no org means first admin setup
  const { count } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });

  const isFirstSetup = (count ?? 0) === 0;

  return <SignupForm isFirstSetup={isFirstSetup} />;
}
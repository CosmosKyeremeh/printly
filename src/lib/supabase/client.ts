import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase.types';

export function createClient() {
  // No global fetch override — storage uploads need unbounded time
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
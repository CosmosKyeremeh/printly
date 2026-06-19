import { createClient } from '@/lib/supabase/server';
import { PaymentsList } from '@/components/student/PaymentsList';
import { CreditCard } from 'lucide-react';

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch unpaid files WITH price fields — single source of truth
  const { data: unpaidFiles } = await supabase
    .from('files')
    .select('id, file_name, created_at, page_count, manual_price, price_locked')
    .eq('owner_id', user!.id)
    .eq('payment_status', 'pending')
    .order('created_at', { ascending: false });

  const { data: payments } = await supabase
    .from('payments')
    .select('*, files(file_name)')
    .eq('student_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-zinc-800 rounded-lg flex items-center justify-center">
          <CreditCard className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Payments</h1>
          <p className="text-zinc-500 text-xs">Printing fees for your submitted files</p>
        </div>
      </div>
      <PaymentsList
        unpaidFiles={unpaidFiles ?? []}
        payments={(payments ?? []) as Parameters<typeof PaymentsList>[0]['payments']}
      />
    </div>
  );
}
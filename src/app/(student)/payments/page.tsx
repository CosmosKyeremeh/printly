import { createClient } from '@/lib/supabase/server';
import { CreditCard } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { PaymentsList } from '@/components/student/PaymentsList';

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: payments } = await supabase
    .from('payments')
    .select('*, files(file_name)')
    .eq('student_id', user!.id)
    .order('created_at', { ascending: false });

  const { data: unpaidFiles } = await supabase
    .from('files')
    .select('id, file_name, created_at')
    .eq('owner_id', user!.id)
    .eq('payment_status', 'pending');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: '#64000030' }}>
          <CreditCard className="w-4 h-4" style={{ color: '#b67e7d' }} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Payments</h1>
          <p className="text-xs" style={{ color: '#7a4a49' }}>Manage printing fees for your files</p>
        </div>
      </div>

      <PaymentsList
        unpaidFiles={unpaidFiles ?? []}
        payments={(payments ?? []) as Parameters<typeof PaymentsList>[0]['payments']}
      />
    </div>
  );
}
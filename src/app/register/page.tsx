'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PrinterIcon, Loader2, Building2 } from 'lucide-react';

export default function RegisterOrgPage() {
  const [schoolName, setSchoolName] = useState('');
  const [className, setClassName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1 — Create the organization via API route (server-side, uses service role)
      const res = await fetch('/api/organizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schoolName, className }),
      });

      const { orgId, joinCode, error: orgError } = await res.json();
      if (orgError) throw new Error(orgError);

      // 2 — Sign up the admin user with org_id in metadata
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: adminName,
            role: 'admin',
            org_id: orgId,  // ← attached to their profile via trigger
          },
        },
      });

      if (authError) throw authError;

      // 3 — Send to success page with the join code
      router.push(`/register/success?code=${joinCode}&org=${className}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: '#b67e7d' }}>
            <PrinterIcon className="w-5 h-5" style={{ color: '#040b15' }} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-black">Printly</p>
            <p className="text-xs" style={{ color: '#7a4a49' }}>Register your class</p>
          </div>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: '#420001', borderColor: '#64000060' }}>
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5" style={{ color: '#b67e7d' }} />
            <h1 className="text-white font-black text-lg">Set up your class</h1>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input value={schoolName} onChange={e => setSchoolName(e.target.value)}
              placeholder="School / University name *" required
              className="h-11 text-white" style={{ background: '#2a0001', borderColor: '#640000' }} />
            <Input value={className} onChange={e => setClassName(e.target.value)}
              placeholder="Class name (e.g. CE Level 300) *" required
              className="h-11 text-white" style={{ background: '#2a0001', borderColor: '#640000' }} />
            <hr style={{ borderColor: '#64000040' }} />
            <Input value={adminName} onChange={e => setAdminName(e.target.value)}
              placeholder="Your full name *" required
              className="h-11 text-white" style={{ background: '#2a0001', borderColor: '#640000' }} />
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email *" required
              className="h-11 text-white" style={{ background: '#2a0001', borderColor: '#640000' }} />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password (min 8 chars) *" required
              className="h-11 text-white" style={{ background: '#2a0001', borderColor: '#640000' }} />

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button type="submit" disabled={loading}
              className="w-full h-11 font-black text-sm text-white rounded-xl"
              style={{ background: 'linear-gradient(135deg, #640000, #b67e7d)' }}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create my class →'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#7a4a49' }}>
          Already have a join code?{' '}
          <a href="/signup" className="font-semibold" style={{ color: '#b67e7d' }}>Sign up here</a>
        </p>
      </div>
    </div>
  );
}
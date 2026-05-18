'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, UserCircle, Mail, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();
  const router = useRouter();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', profile!.id);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.');
        setSaving(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        setSaving(false);
        return;
      }
      const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
      if (passwordError) {
        setError(passwordError.message);
        setSaving(false);
        return;
      }
    }

    setSaved(true);
    setSaving(false);
    setNewPassword('');
    setConfirmPassword('');
    router.refresh();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      {/* Info card */}
      <div className="rounded-2xl p-5 border" style={{ background: '#420001', borderColor: '#64000060' }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: '#64000030' }}>
            <UserCircle className="w-8 h-8" style={{ color: '#b67e7d' }} />
          </div>
          <div>
            <p className="text-white font-bold">{profile?.full_name ?? 'No name set'}</p>
            <p className="text-sm" style={{ color: '#9d6463' }}>{profile?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3.5 flex items-center gap-3 border"
            style={{ background: '#42000130', borderColor: '#64000040' }}>
            <Mail className="w-4 h-4 shrink-0" style={{ color: '#7a4a49' }} />
            <div className="min-w-0">
              <p className="text-xs" style={{ color: '#7a4a49' }}>Email</p>
              <p className="text-white text-sm font-medium truncate">{profile?.email}</p>
            </div>
          </div>
          <div className="rounded-xl p-3.5 flex items-center gap-3 border"
            style={{ background: '#42000130', borderColor: '#64000040' }}>
            <Shield className="w-4 h-4 shrink-0" style={{ color: '#b67e7d' }} />
            <div>
              <p className="text-xs" style={{ color: '#7a4a49' }}>Role</p>
              <p className="text-sm font-semibold capitalize" style={{ color: '#b67e7d' }}>
                {profile?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-2xl p-5 border" style={{ background: '#420001', borderColor: '#64000060' }}>
        <h3 className="text-white font-bold text-sm mb-4">Edit Details</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium" style={{ color: '#c99897' }}>Full name</Label>
            <Input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="h-11 text-white"
              style={{ background: '#2a0001', borderColor: '#640000' }}
            />
          </div>

          <div className="border-t pt-4" style={{ borderColor: '#64000040' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#7a4a49' }}>
              Change Password (optional)
            </p>
            <div className="space-y-3">
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password (min. 8 characters)"
                className="h-11 text-white"
                style={{ background: '#2a0001', borderColor: '#640000' }}
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-11 text-white"
                style={{ background: '#2a0001', borderColor: '#640000' }}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm" style={{ color: '#c99897' }}>{error}</p>
          )}

          <Button
            type="submit"
            disabled={saving || saved}
            className="w-full h-11 font-bold text-sm text-white rounded-xl"
            style={{ background: 'linear-gradient(135deg, #640000, #b67e7d)' }}
          >
            {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {saved && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
            {saved ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
          </Button>
        </form>
      </div>
    </div>
  );
}
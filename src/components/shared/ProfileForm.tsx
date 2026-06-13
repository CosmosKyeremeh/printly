'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, UserCircle, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone?: string | null;
  whatsapp?: string | null;
  created_at: string | null;
};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [whatsapp, setWhatsapp] = useState(profile?.whatsapp ?? '');
  
  const supabase = createClient();
  const router = useRouter();

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        phone: phone || null,
        whatsapp: whatsapp || null,
        updated_at: new Date().toISOString() 
      })
      .eq('id', profile!.id);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    if (newPassword) {
      if (newPassword.length < 8) {
        setError('Security key requirements demand min. 8 alphanumeric bounds.');
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
    <div className="space-y-4 font-sans antialiased text-zinc-200">
      
      {/* ── Top Identity Overview Module ── */}
      <div className="rounded-2xl p-5 border border-zinc-900/80 bg-zinc-900/30 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-zinc-950 border border-zinc-800/60 shadow-inner">
              <UserCircle className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-100 font-medium tracking-tight text-base">{profile?.full_name ?? 'Anonymous Operator'}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{profile?.email}</p>
              
              {/* Context clearance badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-950 border border-zinc-800/60 text-zinc-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" /> System Secure
                </span>
                {profile?.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-950 border border-zinc-800/60 text-amber-500/90">
                    <span className="w-1 h-1 rounded-full bg-amber-500" /> Cluster Override
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Grid Layout to fix mobile layout squishing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl p-3.5 flex items-center gap-3 border border-zinc-900 bg-zinc-950/40">
            <Mail className="w-4 h-4 shrink-0 text-zinc-600" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">Routing Email</p>
              <p className="text-zinc-300 text-xs font-medium truncate mt-0.5">{profile?.email}</p>
            </div>
          </div>
          
          <div className="rounded-xl p-3.5 flex items-center gap-3 border border-zinc-900 bg-zinc-950/40">
            <Shield className="w-4 h-4 shrink-0 text-amber-500/80" />
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500">Security Clearance</p>
              <p className="text-amber-500 text-xs font-semibold capitalize mt-0.5 tracking-wide">
                {profile?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Configuration Fields Canvas ── */}
      <div className="rounded-2xl p-5 border border-zinc-900/80 bg-zinc-900/30 shadow-sm">
        <h3 className="text-zinc-200 font-medium text-sm mb-4">Edit Details</h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          {/* Full Name Field Block */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">Full name</Label>
            <Input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              required
              className="h-10 text-zinc-200 bg-zinc-950 border-zinc-800/80 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 rounded-lg placeholder:text-zinc-700 transition-all"
            />
          </div>

          {/* New Field Block: Phone Number */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">
              Phone number <span className="text-zinc-600 font-normal">(optional)</span>
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="0XX XXX XXXX"
              className="h-10 text-zinc-200 bg-zinc-950 border-zinc-800/80 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 rounded-lg placeholder:text-zinc-700 transition-all"
            />
          </div>

          {/* New Field Block: WhatsApp Number */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400">
              WhatsApp number <span className="text-zinc-600 font-normal">(optional)</span>
            </Label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value)}
              placeholder="0XX XXX XXXX"
              className="h-10 text-zinc-200 bg-zinc-950 border-zinc-800/80 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 rounded-lg placeholder:text-zinc-700 transition-all"
            />
          </div>

          <div className="border-t border-zinc-900 pt-4 mt-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Change Password (optional)
            </p>
            
            <div className="space-y-3">
              {/* Field 1: New Password Entry */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="New password (min. 8 characters)"
                  className="h-10 text-zinc-200 bg-zinc-950 border-zinc-800/80 pr-10 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 rounded-lg placeholder:text-zinc-700 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Field 2: Confirm Password Entry */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-10 text-zinc-200 bg-zinc-950 border-zinc-800/80 pr-10 focus-visible:ring-1 focus-visible:ring-amber-500/30 focus-visible:border-amber-500 rounded-lg placeholder:text-zinc-700 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg p-3 border border-red-500/10 bg-red-500/[0.02] mt-2">
              <p className="text-xs text-red-400 font-medium">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={saving || saved}
            className="w-full h-10 font-medium text-sm text-zinc-950 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-80 transition-colors rounded-lg mt-2 shadow-sm"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {saved && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />}
            {saved ? 'Changes Commited' : saving ? 'Updating Vault...' : 'Save changes'}
          </Button>
        </form>
      </div>
      
    </div>
  );
}
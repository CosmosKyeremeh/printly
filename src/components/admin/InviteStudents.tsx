'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, Mail } from 'lucide-react';

export function InviteStudents({ joinCode }: { joinCode: string | null }) {
  const [copied, setCopied]         = useState(false);
  // Filled in on mount — window.location.origin isn't available during SSR
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    // window.location.origin reflects the real host — avoids falling back to
    // localhost:3000 when NEXT_PUBLIC_APP_URL isn't set in production
    const query = joinCode ? `?code=${encodeURIComponent(joinCode)}` : '';
    setInviteLink(`${window.location.origin}/auth/invite${query}`);
  }, [joinCode]);

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-white font-bold text-sm mb-1">Invite Students</h3>
      <p className="text-zinc-500 text-xs mb-4">
        {joinCode
          ? 'Share this link — your class join code is included, so students land straight on the invite page with it ready to copy.'
          : 'Share this link with your classmates to invite them to Printly.'}
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 overflow-hidden">
          <span className="text-zinc-400 text-sm truncate block">{inviteLink}</span>
        </div>
        <Button
          onClick={copyLink}
          size="sm"
          className="shrink-0 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold h-10 px-4"
        >
          {copied
            ? <><CheckCircle2 className="w-4 h-4 mr-1.5" />Copied</>
            : <><Copy className="w-4 h-4 mr-1.5" />Copy</>
          }
        </Button>
      </div>
      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-zinc-800">
        <Mail className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
        <p className="text-zinc-600 text-xs leading-relaxed">
          To send direct email invitations, go to{' '}
          <span className="text-zinc-500">Supabase → Authentication → Users → Invite</span>.
        </p>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, Mail } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function InviteStudents() {
  const [copied, setCopied] = useState(false);
  const inviteLink = `${siteConfig.url}/auth/invite`;

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="text-white font-bold text-sm mb-1">Invite Students</h3>
      <p className="text-zinc-500 text-xs mb-4">
        Share this link with your classmates to invite them to Printly.
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
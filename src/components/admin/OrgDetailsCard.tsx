'use client';

import { useState } from 'react';
import { Building2, Copy, CheckCircle2, Key } from 'lucide-react';
import { formatDate } from '@/lib/utils';

type Org = {
  id: string;
  name: string;
  join_code: string | null;
  created_at: string | null;
};

export function OrgDetailsCard({ org }: { org: Org }) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  function copyCode() {
    if (!org.join_code) return;
    navigator.clipboard.writeText(org.join_code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  }

  function copyLink() {
    const link = `${window.location.origin}/signup`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: '#6a4920' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ background: '#1a1409', borderColor: '#6a4920' }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#6a492030' }}>
          <Building2 className="w-4 h-4" style={{ color: '#cca152' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{org.name}</p>
          <p className="text-xs" style={{ color: '#6a4920' }}>
            {org.created_at ? `Created ${formatDate(org.created_at)}` : 'Your organization'}
          </p>
        </div>
      </div>

      {/* Join code */}
      <div className="px-5 py-4" style={{ background: '#0f0c06' }}>
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-3.5 h-3.5" style={{ color: '#6a4920' }} />
          <p className="text-xs font-medium uppercase tracking-wider"
            style={{ color: '#6a4920' }}>
            Class join code
          </p>
        </div>

        <p className="text-xs mb-3 leading-relaxed" style={{ color: '#6a4920' }}>
          Share this code with students during signup. They enter it to join your class.
        </p>

        {/* Code display */}
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 border mb-3"
          style={{ background: '#1a1409', borderColor: '#6a492060' }}>
          <span className="flex-1 text-xl font-mono font-medium tracking-[0.2em]"
            style={{ color: '#e9cb93' }}>
            {org.join_code ?? '—'}
          </span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: codeCopied ? '#14532d20' : '#6a492020',
              color: codeCopied ? '#4ade80' : '#cca152',
              border: `1px solid ${codeCopied ? '#14532d40' : '#6a492040'}`,
            }}
          >
            {codeCopied
              ? <><CheckCircle2 className="w-3.5 h-3.5" />Copied</>
              : <><Copy className="w-3.5 h-3.5" />Copy</>
            }
          </button>
        </div>

        {/* Copy signup link */}
        <button
          onClick={copyLink}
          className="w-full h-9 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition-all"
          style={{
            background: 'transparent',
            borderColor: '#6a4920',
            color: linkCopied ? '#4ade80' : '#93682c',
          }}
        >
          {linkCopied
            ? <><CheckCircle2 className="w-3.5 h-3.5" />Signup link copied!</>
            : <><Copy className="w-3.5 h-3.5" />Copy signup link to share</>
          }
        </button>
      </div>

      {/* Info strip */}
      <div className="px-5 py-3 border-t"
        style={{ background: '#1a1409', borderColor: '#6a492040' }}>
        <p className="text-xs" style={{ color: '#6a4920' }}>
          💡 Students go to <span className="font-mono" style={{ color: '#cca152' }}>/signup</span> → enter this code → they join your class automatically.
        </p>
      </div>
    </div>
  );
}
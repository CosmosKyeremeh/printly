import { createClient } from '@/lib/supabase/server';
import { Phone, MessageCircle, Mail, ShieldCheck } from 'lucide-react';

export default async function ContactPage() {
  const supabase = await createClient();

  // Explicitly selecting full_name, email, phone, and whatsapp as per the instruction
  const { data: admins } = await (supabase as any)
    .from('profiles')
    .select('full_name, email, phone, whatsapp')
    .eq('role', 'admin');

  return (
    <div className="max-w-2xl mx-auto font-sans antialiased px-1">
      {/* ── Page Header Module ── */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.05)]">
          <ShieldCheck className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Contact Admin</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Reach your class rep directly</p>
        </div>
      </div>

      {/* ── Content Stream ── */}
      <div className="space-y-4">
        {!admins || admins.length === 0 ? (
          <div className="text-center py-16 backdrop-blur-md bg-zinc-900/20 border border-zinc-900 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
            <ShieldCheck className="w-8 h-8 text-zinc-700 mx-auto mb-3 opacity-60" />
            <p className="text-zinc-400 text-sm font-medium">No admin contact info available yet</p>
          </div>
        ) : (
          admins.map((admin: { full_name: string | null; email: string; phone: string | null; whatsapp: string | null }) => (
            <div 
              key={admin.email} 
              className="backdrop-blur-md bg-zinc-900/30 border border-zinc-900/80 rounded-2xl p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.03)]"
            >
              {/* Profile Card Header */}
              <div className="flex items-center gap-3.5 mb-5 border-b border-zinc-900 pb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-amber-400 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 font-black text-xl shadow-inner">
                  {(admin.full_name ?? admin.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-zinc-100 font-bold text-base tracking-tight">{admin.full_name ?? 'Admin'}</p>
                  <span className="inline-flex items-center mt-1 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                    Class Rep
                  </span>
                </div>
              </div>

              {/* Contact Action Cards */}
              <div className="space-y-2.5">
                {/* Email Anchor */}
                <a 
                  href={`mailto:${admin.email}`}
                  className="flex items-center gap-3.5 p-3.5 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-900/60 rounded-xl transition-all duration-200 group"
                >
                  <Mail className="w-4 h-4 text-amber-500/80 group-hover:text-amber-400 transition-colors" />
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Email Address</p>
                    <p className="text-zinc-200 text-sm font-medium mt-0.5 truncate">{admin.email}</p>
                  </div>
                </a>

                {/* Phone Anchor */}
                {admin.phone && (
                  <a 
                    href={`tel:${admin.phone}`}
                    className="flex items-center gap-3.5 p-3.5 bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-900/60 rounded-xl transition-all duration-200 group"
                  >
                    <Phone className="w-4 h-4 text-amber-500/80 group-hover:text-amber-400 transition-colors" />
                    <div className="min-w-0 flex-1">
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Phone Line</p>
                      <p className="text-zinc-200 text-sm font-medium mt-0.5 tracking-wide">{admin.phone}</p>
                    </div>
                  </a>
                )}

                {/* WhatsApp Anchor */}
                {admin.whatsapp && (
                  <a
                    href={`https://wa.me/233${admin.whatsapp.replace(/^0/, '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3.5 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.06] border border-emerald-500/10 rounded-xl transition-all duration-200 group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-emerald-500/70 text-[10px] uppercase font-bold tracking-wider">WhatsApp Link</p>
                      <p className="text-emerald-400 text-sm font-semibold mt-0.5 flex items-center gap-1.5">
                        Chat now <span className="text-emerald-500/60 font-normal group-hover:translate-x-0.5 transition-transform">→</span> <span className="text-zinc-300 font-mono font-normal text-xs">{admin.whatsapp}</span>
                      </p>
                    </div>
                  </a>
                )}

                {/* Fallback warning block */}
                {!admin.phone && !admin.whatsapp && (
                  <p className="text-zinc-600 text-xs text-center py-3 bg-zinc-900/10 border border-zinc-900/50 border-dashed rounded-xl">
                    Admin hasn't added phone or WhatsApp fallback details yet.
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
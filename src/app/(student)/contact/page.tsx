import { createClient } from '@/lib/supabase/server';
import { Phone, MessageCircle, Mail, ShieldCheck } from 'lucide-react';

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: admins } = await supabase
    .from('profiles')
    .select('full_name, email, phone, whatsapp')
    .eq('role', 'admin');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Contact Admin</h1>
          <p className="text-zinc-500 text-xs">Reach your class rep directly</p>
        </div>
      </div>

      <div className="space-y-3">
        {!admins || admins.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No admin contact info available yet</p>
          </div>
        ) : (
          admins.map(admin => (
            <div key={admin.email}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(admin.full_name ?? admin.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-bold">{admin.full_name ?? 'Admin'}</p>
                  <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Class Rep
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <a href={`mailto:${admin.email}`}
                  className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors group">
                  <Mail className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  <span className="text-zinc-300 text-sm">{admin.email}</span>
                </a>

                {admin.phone && (
                  <a href={`tel:${admin.phone}`}
                    className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors group">
                    <Phone className="w-4 h-4 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                    <span className="text-zinc-300 text-sm">{admin.phone}</span>
                  </a>
                )}

                {admin.whatsapp && (
                  <a
                    href={`https://wa.me/${admin.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors group border"
                    style={{ background: '#25D36615', borderColor: '#25D36630' }}
                  >
                    <MessageCircle className="w-4 h-4 transition-colors" style={{ color: '#25D366' }} />
                    <span className="text-sm font-semibold" style={{ color: '#25D366' }}>
                      Chat on WhatsApp
                    </span>
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
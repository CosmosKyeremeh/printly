import { createClient } from '@/lib/supabase/server';
import { Phone, MessageCircle, Mail, ShieldCheck, User } from 'lucide-react';

export default async function ContactPage() {
  const supabase = await createClient();

  // This now works: "read_admins_in_org" policy allows students to
  // read admin profiles in their own org
  const { data: admins, error } = await supabase
    .from('profiles')
    .select('full_name, email, phone, whatsapp')
    .eq('role', 'admin');

  if (error) console.error('Contact fetch error:', error.message);

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

      <div className="space-y-4">
        {!admins || admins.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No admin contact info yet</p>
            <p className="text-zinc-600 text-xs mt-1">
              Ask your admin to add their phone number in Profile settings
            </p>
          </div>
        ) : (
          admins.map((admin) => (
            <div key={admin.email}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-950"
                  style={{ background: 'linear-gradient(135deg, #fcd34d 0%, #d4af37 50%, #b45309 100%)' }}>
                  <User className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
                </div>
                <div>
                  <p className="text-white font-bold">{admin.full_name ?? 'Admin'}</p>
                  <span className="text-xs bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                    Class Rep
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {admin.email && (
                  <a href={`mailto:${admin.email}`}
                    className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                    <Mail className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-zinc-400 text-xs">Email</p>
                      <p className="text-white text-sm">{admin.email}</p>
                    </div>
                  </a>
                )}

                {admin.phone && (
                  <a href={`tel:${admin.phone}`}
                    className="flex items-center gap-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                    <Phone className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="text-zinc-400 text-xs">Phone</p>
                      <p className="text-white text-sm">{admin.phone}</p>
                    </div>
                  </a>
                )}

                {admin.whatsapp && (
                  <a
                    href={`https://wa.me/233${admin.whatsapp.replace(/^0/, '').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors border"
                    style={{ background: '#25D36615', borderColor: '#25D36630' }}
                  >
                    <MessageCircle className="w-4 h-4" style={{ color: '#25D366' }} />
                    <div>
                      <p className="text-xs" style={{ color: '#25D36699' }}>WhatsApp</p>
                      <p className="text-sm font-semibold" style={{ color: '#25D366' }}>
                        Chat now → {admin.whatsapp}
                      </p>
                    </div>
                  </a>
                )}

                {!admin.phone && !admin.whatsapp && (
                  <p className="text-zinc-600 text-xs text-center py-3">
                    Admin hasn&apos;t added phone or WhatsApp yet
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
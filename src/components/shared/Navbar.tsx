'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PrinterIcon, LayoutDashboard, Upload, FileText, CreditCard, LogOut, Menu, X, UserCircle, Bell } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Upload',    href: '/upload',    icon: <Upload className="w-4 h-4" /> },
  { label: 'My Files',  href: '/files',     icon: <FileText className="w-4 h-4" /> },
  { label: 'Payments',  href: '/payments',  icon: <CreditCard className="w-4 h-4" /> },
  { label: 'Profile',   href: '/profile',   icon: <UserCircle className="w-4 h-4" /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard',     href: '/admin/dashboard',     icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Print Queue',   href: '/admin/queue',         icon: <PrinterIcon className="w-4 h-4" /> },
  { label: 'Categories',    href: '/admin/categories',    icon: <FileText className="w-4 h-4" /> },
  { label: 'Notifications', href: '/admin/notifications', icon: <Bell className="w-4 h-4" /> },
  { label: 'Payments',      href: '/admin/payments',      icon: <CreditCard className="w-4 h-4" /> },
  { label: 'Profile',       href: '/admin/profile',       icon: <UserCircle className="w-4 h-4" /> },
];

export function Navbar({ role }: { role: 'student' | 'admin' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const nav = role === 'admin' ? adminNav : studentNav;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <>
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30 border-r border-brand-900/40 bg-gradient-to-b from-brand-950 via-brand-950 to-[#050608]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-brand-900/30">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-brand-500 shadow-[0_4px_12px_rgba(204,161,82,0.15)]">
            <PrinterIcon className="w-4 h-4 text-brand-950" strokeWidth={2.5} />
          </div>
          <span className="text-white font-black text-sm tracking-tight">Printly</span>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3">
          <span className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors",
            role === 'admin' 
              ? "bg-brand-500/10 text-brand-400 border-brand-500/20" 
              : "bg-zinc-800/40 text-zinc-400 border-zinc-800/60"
          )}>
            {role === 'admin' ? '⚡ Admin' : '🎓 Student'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {nav.map(({ label, href, icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border',
                  active 
                    ? 'bg-brand-500/10 border-brand-500/20 text-brand-300' 
                    : 'text-zinc-400 border-transparent hover:text-brand-300 hover:bg-brand-500/5'
                )}
              >
                <span className={cn('transition-colors', active ? 'text-brand-400' : 'text-zinc-500 group-hover:text-brand-400')}>
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-brand-900/30">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/5 group"
          >
            <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-red-400 transition-colors" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Top bar (mobile) ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 border-b border-brand-900/30 bg-brand-950">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-brand-500">
            <PrinterIcon className="w-3.5 h-3.5 text-brand-950" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-sm">Printly</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1 text-zinc-400 hover:text-brand-400 transition-colors"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 backdrop-blur-sm bg-brand-950/80"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-14 bottom-0 w-64 p-3 border-r border-brand-900/30 bg-brand-950"
            onClick={e => e.stopPropagation()}
          >
            <nav className="space-y-0.5">
              {nav.map(({ label, href, icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border",
                      active
                        ? "bg-brand-500/10 border-brand-500/20 text-brand-300"
                        : "text-zinc-400 border-transparent"
                    )}
                  >
                    <span className={active ? 'text-brand-400' : 'text-zinc-500'}>
                      {icon}
                    </span>
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-4 left-3 right-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full text-zinc-400 hover:text-red-400"
              >
                <LogOut className="w-4 h-4 text-zinc-500" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
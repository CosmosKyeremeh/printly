'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PrinterIcon, LayoutDashboard, Upload, FileText, CreditCard, LogOut, Menu, X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const studentNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard',       icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Upload',    href: '/upload',           icon: <Upload className="w-4 h-4" /> },
  { label: 'My Files',  href: '/files',            icon: <FileText className="w-4 h-4" /> },
  { label: 'Payments',  href: '/payments',         icon: <CreditCard className="w-4 h-4" /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard',     href: '/admin/dashboard',     icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Print Queue',   href: '/admin/queue',         icon: <PrinterIcon className="w-4 h-4" /> },
  { label: 'Categories',    href: '/admin/categories',    icon: <FileText className="w-4 h-4" /> },
  { label: 'Notifications', href: '/admin/notifications', icon: <ShieldCheck className="w-4 h-4" /> },
  { label: 'Payments',      href: '/admin/payments',      icon: <CreditCard className="w-4 h-4" /> },
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

  return (
    <>
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-zinc-900 border-r border-zinc-800 fixed left-0 top-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
            <PrinterIcon className="w-4 h-4 text-zinc-950" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-sm tracking-tight">ClassPrint Hub</span>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            role === 'admin'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-zinc-700 text-zinc-400'
          }`}>
            {role === 'admin' ? '⚡ Admin' : '🎓 Student'}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {nav.map(({ label, href, icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-zinc-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Top bar (mobile) ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
            <PrinterIcon className="w-3.5 h-3.5 text-zinc-950" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-sm">ClassPrint Hub</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-zinc-400 hover:text-white p-1">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-20 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="absolute left-0 top-14 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 p-3" onClick={e => e.stopPropagation()}>
            <nav className="space-y-0.5">
              {nav.map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    pathname === href
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-4 left-3 right-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { PrinterIcon, LayoutDashboard, Upload, FileText, CreditCard, LogOut, Menu, X, ShieldCheck, UserCircle, Bell } from 'lucide-react';
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
      <aside
        className="hidden lg:flex flex-col w-60 min-h-screen fixed left-0 top-0 z-30 border-r"
        style={{
          background: 'linear-gradient(180deg, #420001 0%, #2a0001 60%, #040b15 100%)',
          borderColor: '#64000050',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: '#64000050' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: '#b67e7d', boxShadow: '0 4px 12px #b67e7d30' }}
          >
            <PrinterIcon className="w-4 h-4" style={{ color: '#040b15' }} strokeWidth={2.5} />
          </div>
          <span className="text-white font-black text-sm tracking-tight">ClassPrint Hub</span>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full border"
            style={{
              background: role === 'admin' ? '#64000030' : '#42000150',
              color: role === 'admin' ? '#b67e7d' : '#9d6463',
              borderColor: role === 'admin' ? '#64000080' : '#64000040',
            }}
          >
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border',
                isActive(href) ? 'border-opacity-100' : 'border-transparent hover:border-transparent'
              )}
              style={
                isActive(href)
                  ? { background: '#64000040', borderColor: '#b67e7d30', color: '#b67e7d' }
                  : { color: '#9d6463' }
              }
              onMouseEnter={e => {
                if (!isActive(href)) {
                  e.currentTarget.style.color = '#c99897';
                  e.currentTarget.style.background = '#64000020';
                }
              }}
              onMouseLeave={e => {
                if (!isActive(href)) {
                  e.currentTarget.style.color = '#9d6463';
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {icon}
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t" style={{ borderColor: '#64000050' }}>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full border border-transparent"
            style={{ color: '#9d6463' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#f87171';
              e.currentTarget.style.background = '#7f1d1d20';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#9d6463';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Top bar (mobile) ── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 border-b"
        style={{ background: '#420001', borderColor: '#64000050' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: '#b67e7d' }}
          >
            <PrinterIcon className="w-3.5 h-3.5" style={{ color: '#040b15' }} strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-sm">ClassPrint Hub</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1 transition-colors"
          style={{ color: '#9d6463' }}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Mobile drawer ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-20 backdrop-blur-sm"
          style={{ background: '#040b15cc' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute left-0 top-14 bottom-0 w-64 p-3 border-r"
            style={{ background: '#420001', borderColor: '#64000050' }}
            onClick={e => e.stopPropagation()}
          >
            <nav className="space-y-0.5">
              {nav.map(({ label, href, icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border"
                  style={
                    isActive(href)
                      ? { background: '#64000040', borderColor: '#b67e7d30', color: '#b67e7d' }
                      : { color: '#9d6463', borderColor: 'transparent' }
                  }
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-4 left-3 right-3">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all w-full"
                style={{ color: '#9d6463' }}
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
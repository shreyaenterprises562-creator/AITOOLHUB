'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Users,
  Package,
  Layers,
  MapPin,
  Percent,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  Bike,
} from 'lucide-react';

interface AdminInfo {
  userId: string;
  name: string;
  phone: string;
  email: string | null;
  role: 'ADMIN';
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.admin) {
            setAdmin(data.admin);
          } else {
            router.push('/admin/login');
          }
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAdminAuth();
  }, [pathname, isLoginPage, router]);

  async function handleLogout() {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/admin/login');
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#FFD000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-300">Loading Admin Control Panel...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/sellers', label: 'Sellers', icon: Store },
    { href: '/admin/riders', label: 'Riders', icon: Bike },
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Layers },
    { href: '/admin/service-area', label: 'Service Area', icon: MapPin },
    { href: '/admin/delivery-fees', label: 'Delivery Fees', icon: Percent },
    { href: '/admin/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-950 text-white border-r border-slate-800 shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10 shrink-0">
              <Image
                src="/assets/12rush-logo.png"
                alt="12RUSH"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-black tracking-tight text-white">
                  12<span className="text-[#E60028]">RUSH</span>
                </span>
                <span className="text-[9px] uppercase font-black px-1.5 py-0.5 bg-[#FFD000] text-slate-950 rounded">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Control Panel</span>
            </div>
          </Link>
        </div>

        {/* Admin Identity Card */}
        {admin && (
          <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-[#FFD000] flex items-center justify-center font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-200">{admin.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">Ph: {admin.phone}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin/dashboard'
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FFD000] text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors"
          >
            <span>Customer Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-bold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 px-4 h-14 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0">
              <Image
                src="/assets/12rush-logo.png"
                alt="12RUSH"
                fill
                sizes="28px"
                className="object-contain"
              />
            </div>
            <span className="text-sm font-black text-white">
              12<span className="text-[#E60028]">RUSH</span>
              <span className="text-[10px] ml-1 bg-[#FFD000] text-slate-950 px-1.5 py-0.5 rounded font-black">
                Admin
              </span>
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 text-white border-b border-slate-800 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin/dashboard'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isActive ? 'bg-[#FFD000] text-slate-950' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <Link
                href="/"
                target="_blank"
                className="text-xs text-slate-400 hover:text-white"
              >
                Storefront &rarr;
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

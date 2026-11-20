'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  LogOut,
  Store,
  ExternalLink,
  Bell,
  Clock,
} from 'lucide-react';

interface SellerSessionInfo {
  sellerId: string;
  shopName: string;
  name: string;
  phone: string;
  email?: string | null;
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerSessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/seller/login';

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    async function checkSellerAuth() {
      try {
        const res = await fetch('/api/seller/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.seller) {
            setSeller(data.seller);
          } else {
            router.push('/seller/login');
          }
        } else {
          router.push('/seller/login');
        }
      } catch {
        router.push('/seller/login');
      } finally {
        setLoading(false);
      }
    }

    checkSellerAuth();
  }, [pathname, isLoginPage, router]);

  async function handleLogout() {
    try {
      await fetch('/api/seller/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    router.push('/seller/login');
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#FFD000] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-300">Loading Seller Portal...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/seller/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/seller/products', label: 'Products & Stock', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col pb-20 sm:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand & Store Name */}
          <div className="flex items-center gap-3">
            <Link href="/seller/dashboard" className="flex items-center gap-2">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden ring-1 ring-white/10 shrink-0">
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
                  <span className="text-sm sm:text-base font-black tracking-tight text-white">
                    12<span className="text-[#E60028]">RUSH</span>
                  </span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 bg-[#FFD000] text-slate-950 rounded">
                    Seller
                  </span>
                </div>
              </div>
            </Link>

            {/* Current Shop Name */}
            {seller && (
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800">
                <Store className="w-4 h-4 text-[#FFD000]" />
                <span className="text-xs font-bold text-slate-200">
                  {seller.shopName}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Store Online" />
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/seller/dashboard'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FFD000] text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-colors"
            >
              <span>Customer Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-bold transition-colors"
              title="Logout from Seller Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Shop Identifier Bar */}
        {seller && (
          <div className="md:hidden bg-slate-900/90 px-4 py-1.5 border-t border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-slate-200 truncate max-w-[240px]">
                {seller.shopName}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{seller.name}</span>
          </div>
        )}
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/seller/dashboard'
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-slate-950 font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1.5 rounded-full mb-0.5 ${
                  isActive ? 'bg-[#FFD000] text-slate-950' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

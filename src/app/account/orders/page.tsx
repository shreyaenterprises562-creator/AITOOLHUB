'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowLeft,
  ChevronRight,
  Store,
  Calendar,
  Banknote,
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { StoredOrderRecord } from '../../../lib/order-store';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<StoredOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/account/login?returnUrl=/account/orders');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Fetch orders from server
  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) return;
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          }
        }
      } catch (err) {
        console.warn('Failed to load customer orders:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#FFD000] selection:text-black pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/account"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Account</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5">
            <div className="relative w-6 h-6 rounded-lg overflow-hidden">
              <Image
                src="/assets/12rush-logo.png"
                alt="12RUSH"
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">
              My Orders
            </span>
          </Link>

          <div className="w-16" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-slate-900">Order History</h1>
          <span className="text-xs font-bold text-slate-500">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#E60028]" />
            <span className="text-xs font-bold">Loading your orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-slate-700 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="w-6 h-6 text-slate-700" />
            </div>
            <h2 className="text-base font-black text-slate-900">No Orders Placed Yet</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your past and active cleaning supply deliveries will appear here.
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#FFD000] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95"
              >
                <span>Browse Cleaning Essentials</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((ord) => {
              const formattedDate = new Date(ord.createdAt || ord.placedAt).toLocaleDateString(
                'en-IN',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  {/* Top Bar: Order ID, Status, Date */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono font-black text-slate-950 text-xs sm:text-sm">
                        #{ord.orderNumber}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                      {ord.status}
                    </span>
                  </div>

                  {/* Middle Info: Seller & Item summary */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ord.sellerName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {ord.items.length} {ord.items.length === 1 ? 'item' : 'items'}
                        {ord.items[0] && ` (${ord.items[0].productName}${ord.items.length > 1 ? ` +${ord.items.length - 1} more` : ''})`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total
                      </span>
                      <span className="text-sm font-black text-slate-950 tabular-nums">
                        ₹{ord.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Payment mode & View Details CTA */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cash on Delivery</span>
                    </div>

                    <Link
                      href={`/account/orders/${ord.id}`}
                      className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-[#E60028] transition-colors"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

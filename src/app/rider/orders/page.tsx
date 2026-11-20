'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  ArrowRight,
  Store,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useRider } from '../../../context/RiderContext';
import RiderHeader from '../../../components/rider/RiderHeader';
import RiderBottomNav from '../../../components/rider/RiderBottomNav';

export default function RiderOrdersHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useRider();

  const [filter, setFilter] = useState<'CURRENT' | 'COMPLETED'>('CURRENT');
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/rider/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rider/orders?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.warn('Failed to load rider orders history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, isAuthenticated]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-24">
      <RiderHeader />

      <main className="max-w-md w-full mx-auto p-4 space-y-4 flex-1">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-black text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FFD000]" />
            <span>My Deliveries</span>
          </h1>

          <button
            onClick={fetchOrders}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setFilter('CURRENT')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'CURRENT'
                ? 'bg-[#FFD000] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'COMPLETED'
                ? 'bg-[#FFD000] text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Order List */}
        {isLoading ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Loading deliveries...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
            <Package className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-bold text-slate-300">
              {filter === 'CURRENT'
                ? 'No deliveries currently in progress'
                : 'No completed deliveries yet'}
            </p>
            <p className="text-[11px] text-slate-500">
              {filter === 'CURRENT'
                ? 'Check the dashboard to accept available pickup jobs.'
                : 'Completed deliveries will appear here once delivered.'}
            </p>
            {filter === 'CURRENT' && (
              <Link
                href="/rider/dashboard"
                className="inline-block mt-2 px-4 py-2 bg-[#FFD000] text-slate-950 font-black rounded-xl text-xs"
              >
                Go to Pickups
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isDelivered = order.status === 'DELIVERED';

              return (
                <Link
                  key={order.id}
                  href={`/rider/delivery/${order.id}`}
                  className="block bg-slate-900 border border-slate-800 hover:border-amber-400/40 rounded-3xl p-4 shadow-lg transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      #{order.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Store className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{order.shopName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-[#E60028] shrink-0" />
                      <span className="truncate">{order.deliveryAddress}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="text-slate-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' • '}
                      {order.items.length} items
                    </div>
                    <div className="flex items-center gap-1 font-bold text-white">
                      <span>COD: ₹{order.totalAmount}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <RiderBottomNav />
    </div>
  );
}

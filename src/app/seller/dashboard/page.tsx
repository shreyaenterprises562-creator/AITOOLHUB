'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  AlertTriangle,
  Package,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  XCircle,
  Truck,
} from 'lucide-react';

interface DashboardStats {
  totalOrdersToday: number;
  pendingAcceptanceCount: number;
  inPreparationCount: number;
  readyForPickupCount: number;
  completedOrdersCount: number;
  todaySalesAmount: number;
  totalProductsCount: number;
  lowStockCount: number;
}

interface OrderItemSummary {
  id: string;
  productName: string;
  quantity: number;
  unitSellingPrice: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: 'PLACED' | 'CONFIRMED' | 'PACKING' | 'READY_FOR_PICKUP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  deliveryName: string;
  deliveryArea: string;
  placedAt: string;
  items: OrderItemSummary[];
}

export default function SellerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Auto-refresh interval (every 10s for live order polling)
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update clock every second for 5-minute countdown precision
  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/seller/dashboard');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.recentOrders) setOrders(data.recentOrders);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptOrder(orderId: string) {
    setActionLoading(orderId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Error: ${data.error || 'Failed to accept order.'}`);
      } else {
        setActionMessage('Order accepted successfully!');
        fetchDashboardData();
      }
    } catch {
      setActionMessage('Network error occurred.');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRejectOrder(orderId: string) {
    if (!confirm('Are you sure you want to reject this order? Reserved stock will be restocked.')) {
      return;
    }

    setActionLoading(orderId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected from dashboard' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Error: ${data.error || 'Failed to reject order.'}`);
      } else {
        setActionMessage('Order rejected and inventory restocked.');
        fetchDashboardData();
      }
    } catch {
      setActionMessage('Network error occurred.');
    } finally {
      setActionLoading(null);
    }
  }

  // Calculate remaining seconds for 5-minute SLA
  function getRemainingSeconds(placedAtIso: string): number {
    const placedTime = new Date(placedAtIso).getTime();
    const elapsedSeconds = Math.floor((currentTime - placedTime) / 1000);
    const totalSlaSeconds = 5 * 60; // 300 seconds
    return Math.max(0, totalSlaSeconds - elapsedSeconds);
  }

  function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-bold">Refreshing live store statistics...</p>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'PLACED');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Seller Operations Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time quick-commerce order dispatch &amp; 5-minute acceptance SLA
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/seller/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
          >
            <span>All Orders</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
            actionMessage.startsWith('Error')
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{actionMessage}</span>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-black uppercase tracking-wider underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* URGENT 5-MINUTE ACCEPTANCE BANNER */}
      {pendingOrders.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-500/10 border-2 border-amber-400 rounded-2xl space-y-3 animate-in fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm sm:text-base">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
              </span>
              <span>
                ACTION REQUIRED: {pendingOrders.length}{' '}
                {pendingOrders.length === 1 ? 'New Order' : 'New Orders'} Awaiting Acceptance
              </span>
            </div>
            <div className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2.5 py-1 rounded-lg">
              5-Min Acceptance SLA
            </div>
          </div>

          <p className="text-xs text-amber-950/80">
            Accept pending orders within 5 minutes of placement to meet the 12RUSH 10-minute delivery target.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {pendingOrders.map((ord) => {
              const remaining = getRemainingSeconds(ord.placedAt);
              const isExpired = remaining <= 0;

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-2xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {ord.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ord.deliveryName} &bull; {ord.deliveryArea}
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${
                        isExpired
                          ? 'bg-rose-100 text-rose-800'
                          : remaining < 60
                          ? 'bg-rose-50 text-rose-700 animate-pulse'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isExpired ? 'EXPIRED' : formatTimer(remaining)}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 border-t border-slate-100 pt-2 flex items-center justify-between">
                    <span>
                      {ord.items.length} items &bull; ₹{ord.totalAmount} (COD)
                    </span>
                    <Link
                      href={`/seller/orders/${ord.id}`}
                      className="text-[11px] font-bold text-slate-900 hover:underline"
                    >
                      Review &rarr;
                    </Link>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleAcceptOrder(ord.id)}
                      disabled={actionLoading === ord.id || isExpired}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Order</span>
                    </button>

                    <button
                      onClick={() => handleRejectOrder(ord.id)}
                      disabled={actionLoading === ord.id}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today's Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today&apos;s Orders
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {stats?.totalOrdersToday ?? 0}
            </div>
          </div>
        </div>

        {/* Card 2: Pending Acceptance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              (stats?.pendingAcceptanceCount ?? 0) > 0
                ? 'bg-amber-100 text-amber-700 animate-pulse'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending SLA
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {stats?.pendingAcceptanceCount ?? 0}
            </div>
          </div>
        </div>

        {/* Card 3: In Preparation / Ready */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              In Packing / Ready
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {(stats?.inPreparationCount ?? 0) + (stats?.readyForPickupCount ?? 0)}
            </div>
          </div>
        </div>

        {/* Card 4: Today's Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Today&apos;s Revenue
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              ₹{stats?.todaySalesAmount ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/seller/products"
          className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD000]/20 text-slate-950 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 group-hover:text-amber-600">
                Products &amp; Stock Management
              </div>
              <div className="text-[11px] text-slate-500">
                {stats?.totalProductsCount ?? 0} catalog items &bull;{' '}
                <span className={stats?.lowStockCount ? 'text-rose-600 font-bold' : ''}>
                  {stats?.lowStockCount ?? 0} low stock
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/seller/orders"
          className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 group-hover:text-blue-600">
                Fulfillment Pipeline
              </div>
              <div className="text-[11px] text-slate-500">
                Pending &bull; Packing &bull; Ready for Pickup
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Recent Store Orders
            </h2>
            <p className="text-[11px] text-slate-500">
              Live incoming customer orders for your store
            </p>
          </div>
          <Link
            href="/seller/orders"
            className="text-xs font-bold text-[#E60028] hover:underline"
          >
            View All ({orders.length})
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No orders placed yet</p>
            <p className="text-[11px] text-slate-500">
              Customer orders placed for your store will appear here in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.slice(0, 5).map((ord) => {
              const statusColors: Record<string, string> = {
                PLACED: 'bg-amber-100 text-amber-900',
                CONFIRMED: 'bg-blue-100 text-blue-900',
                PACKING: 'bg-purple-100 text-purple-900',
                READY_FOR_PICKUP: 'bg-indigo-100 text-indigo-900',
                DELIVERED: 'bg-emerald-100 text-emerald-900',
                CANCELLED: 'bg-rose-100 text-rose-900',
              };

              const statusLabels: Record<string, string> = {
                PLACED: 'Pending Acceptance',
                CONFIRMED: 'Accepted',
                PACKING: 'Preparing / Packing',
                READY_FOR_PICKUP: 'Ready for Pickup',
                DELIVERED: 'Delivered',
                CANCELLED: 'Cancelled',
              };

              return (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          statusColors[ord.status] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {statusLabels[ord.status] || ord.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      <span>Customer: {ord.deliveryName}</span> &bull;{' '}
                      <span>{ord.deliveryArea}</span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {new Date(ord.placedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      &bull; {ord.items.length} items &bull; Total: ₹{ord.totalAmount} (COD)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/seller/orders/${ord.id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

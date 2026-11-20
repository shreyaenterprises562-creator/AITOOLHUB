'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Store,
  Users,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  todayOrders: number;
  pendingAcceptanceCount: number;
  preparingCount: number;
  readyForPickupCount: number;
  deliveredCount: number;
  cancelledCount: number;
  totalCustomers: number;
  activeSellers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    sellerName: string;
    deliveryName: string;
    deliveryArea: string;
    totalAmount: number;
    status: string;
    placedAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.warn('Admin dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  function getRemainingSeconds(placedAtIso: string): number {
    const placedTime = new Date(placedAtIso).getTime();
    const elapsedSeconds = Math.floor((currentTime - placedTime) / 1000);
    const totalSlaSeconds = 5 * 60;
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
        <p className="text-xs text-slate-500 font-bold">Loading platform statistics...</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PLACED: 'bg-amber-100 text-amber-900 border-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
    PACKING: 'bg-purple-100 text-purple-900 border-purple-300',
    READY_FOR_PICKUP: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-900 border-rose-300',
  };

  const statusLabels: Record<string, string> = {
    PLACED: 'Pending Acceptance',
    CONFIRMED: 'Accepted',
    PACKING: 'Packing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };

  const pendingSlaOrders = stats?.recentOrders.filter((o) => o.status === 'PLACED') || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            12RUSH Platform Operations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central governance, seller SLA monitoring &amp; marketplace dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboard();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SLA ALERT BANNER IF PENDING ORDERS */}
      {pendingSlaOrders.length > 0 && (
        <div className="p-4 sm:p-5 bg-amber-500/10 border-2 border-amber-400 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
              </span>
              <span>
                SELLER SLA ALERT: {pendingSlaOrders.length} Order(s) Awaiting Seller Acceptance
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-900 uppercase bg-amber-200 px-2 py-0.5 rounded">
              5-Min Target
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingSlaOrders.map((ord) => {
              const remaining = getRemainingSeconds(ord.placedAt);
              const isExpired = remaining <= 0;

              return (
                <div
                  key={ord.id}
                  className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900">{ord.orderNumber}</div>
                    <div className="text-[11px] text-slate-500">
                      Seller: <span className="font-bold text-slate-700">{ord.sellerName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Area: {ord.deliveryArea} &bull; ₹{ord.totalAmount} (COD)
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div
                      className={`text-xs font-black px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                        isExpired
                          ? 'bg-rose-100 text-rose-800'
                          : remaining < 60
                          ? 'bg-rose-50 text-rose-700 animate-pulse'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{isExpired ? 'EXPIRED' : formatTimer(remaining)}</span>
                    </div>
                    <div>
                      <Link
                        href={`/admin/orders/${ord.id}`}
                        className="text-[11px] font-bold text-blue-600 hover:underline block"
                      >
                        Inspect &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today's Orders */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Today&apos;s Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.todayOrders ?? 0}</div>
          <div className="text-[11px] text-slate-400">Total All-Time: {stats?.totalOrders ?? 0}</div>
        </div>

        {/* Card 2: Pending Acceptance */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Pending Acceptance</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.pendingAcceptanceCount ?? 0}</div>
          <div className="text-[11px] text-slate-400">5-minute SLA clock active</div>
        </div>

        {/* Card 3: In Fulfillment Pipeline */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Preparing / Ready</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {(stats?.preparingCount ?? 0) + (stats?.readyForPickupCount ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400">
            {stats?.preparingCount ?? 0} packing &bull; {stats?.readyForPickupCount ?? 0} ready
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Gross Sales</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹{stats?.totalRevenue ?? 0}</div>
          <div className="text-[11px] text-slate-400">Delivered &amp; Active orders</div>
        </div>

        {/* Card 5: Active Sellers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Active Sellers</span>
            <Store className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.activeSellers ?? 0}</div>
          <Link href="/admin/sellers" className="text-[11px] text-blue-600 hover:underline">
            Manage stores &rarr;
          </Link>
        </div>

        {/* Card 6: Total Customers */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Customers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalCustomers ?? 0}</div>
          <Link href="/admin/customers" className="text-[11px] text-blue-600 hover:underline">
            View accounts &rarr;
          </Link>
        </div>

        {/* Card 7: Total Master Products */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Master Products</span>
            <Package className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.totalProducts ?? 0}</div>
          <div className="text-[11px] text-slate-400">In platform catalog</div>
        </div>

        {/* Card 8: Low Stock Alert */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
            <span>Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats?.lowStockProducts ?? 0}</div>
          <div className="text-[11px] text-slate-400">&lt; 5 units remaining</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/admin/service-area"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 group-hover:text-blue-600">
                Service Area Hub
              </div>
              <div className="text-[11px] text-slate-500">Rajkot 15 KM boundary</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/delivery-fees"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 group-hover:text-amber-600">
                Delivery Fee Tiers
              </div>
              <div className="text-[11px] text-slate-500">0–10 KM FREE / 10–15 KM ₹20</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <Link
          href="/admin/settings"
          className="p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 group-hover:text-emerald-600">
                Platform Settings
              </div>
              <div className="text-[11px] text-slate-500">SLA timeouts &amp; support lines</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Recent Platform Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Recent Marketplace Orders
            </h2>
            <p className="text-[11px] text-slate-500">Live order activity across all partner stores</p>
          </div>
          <Link href="/admin/orders" className="text-xs font-bold text-[#E60028] hover:underline">
            View All ({stats?.totalOrders ?? 0})
          </Link>
        </div>

        {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No orders recorded yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{ord.orderNumber}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        statusColors[ord.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {statusLabels[ord.status] || ord.status}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Seller: <span className="font-bold text-slate-800">{ord.sellerName}</span> &bull;{' '}
                    Customer: {ord.deliveryName} ({ord.deliveryArea})
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <div className="font-black text-slate-900">₹{ord.totalAmount}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(ord.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <Link
                    href={`/admin/orders/${ord.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors inline-flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

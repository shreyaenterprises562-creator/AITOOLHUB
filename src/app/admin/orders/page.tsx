'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  ChevronRight,
  RefreshCw,
  Search,
  Store,
  User,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  sellerId: string;
  sellerName: string;
  deliveryPartnerId?: string | null;
  deliveryPartnerName?: string | null;
  status: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryName: string;
  deliveryPhone: string;
  deliveryArea: string;
  placedAt: string;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    totalPrice: number;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(clock);
  }, []);

  async function fetchOrders() {
    try {
      const url =
        activeTab === 'ALL'
          ? '/api/admin/orders'
          : `/api/admin/orders?status=${activeTab}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.orders) setOrders(data.orders);
      }
    } catch (err) {
      console.warn('Failed to load admin orders:', err);
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

  const tabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PLACED', label: 'Pending Acceptance' },
    { key: 'CONFIRMED', label: 'Accepted' },
    { key: 'PACKING', label: 'Packing' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const statusColors: Record<string, string> = {
    PLACED: 'bg-amber-100 text-amber-900 border-amber-300',
    CONFIRMED: 'bg-blue-100 text-blue-900 border-blue-300',
    PACKING: 'bg-purple-100 text-purple-900 border-purple-300',
    READY_FOR_PICKUP: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    PICKED_UP: 'bg-teal-100 text-teal-900 border-teal-300',
    OUT_FOR_DELIVERY: 'bg-sky-100 text-sky-900 border-sky-300',
    DELIVERED: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-900 border-rose-300',
  };

  const statusLabels: Record<string, string> = {
    PLACED: 'Pending Acceptance',
    CONFIRMED: 'Accepted',
    PACKING: 'Packing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    PICKED_UP: 'Picked Up',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };

  const filtered = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.sellerName.toLowerCase().includes(q) ||
      o.deliveryName.toLowerCase().includes(q) ||
      o.deliveryArea.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Platform Order Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live orders across all partner stores &bull; SLA monitoring &amp; audit inspection
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchOrders();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number (e.g. 12R-), seller store, customer name, or area..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setLoading(true);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No orders found</p>
          <p className="text-[11px] text-slate-500">
            {searchQuery
              ? `No orders match "${searchQuery}".`
              : activeTab === 'ALL'
              ? 'No platform orders recorded yet.'
              : `No orders in "${activeTab}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ord) => {
            const isPlaced = ord.status === 'PLACED';
            const remaining = getRemainingSeconds(ord.placedAt);
            const isExpired = isPlaced && remaining <= 0;

            return (
              <div
                key={ord.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">{ord.orderNumber}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                        statusColors[ord.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {statusLabels[ord.status] || ord.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {/* 5-Min SLA countdown */}
                    {isPlaced && (
                      <div
                        className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 ${
                          isExpired
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : remaining < 60
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{isExpired ? 'SLA EXPIRED' : `SLA: ${formatTimer(remaining)}`}</span>
                      </div>
                    )}

                    <span className="text-slate-400 text-[11px]">
                      {new Date(ord.placedAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Details row: Seller, Customer, Rider, Amounts */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Assigned Store</div>
                    <div className="font-bold text-slate-900 mt-0.5">{ord.sellerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">ID: {ord.sellerId}</div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Delivery Partner (Rider)</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {ord.deliveryPartnerName ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span>{ord.deliveryPartnerName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {ord.deliveryPartnerId ? `ID: ${ord.deliveryPartnerId}` : 'Awaiting Rider'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Customer &amp; Area</div>
                    <div className="font-bold text-slate-900 mt-0.5">{ord.deliveryName}</div>
                    <div className="text-[11px] text-slate-500">
                      {ord.deliveryArea} &bull; Ph: {ord.deliveryPhone}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Bill Breakdown</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      ₹{ord.totalAmount} (COD)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Subtotal: ₹{ord.subtotal} &bull; Delivery: {ord.deliveryFee === 0 ? 'FREE' : `₹${ord.deliveryFee}`}
                    </div>
                  </div>
                </div>

                {/* Footer link */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {ord.items.length} unique item(s) in parcel
                  </span>

                  <Link
                    href={`/admin/orders/${ord.id}`}
                    className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 transition-all active:scale-95"
                  >
                    <span>Inspect Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

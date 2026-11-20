'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  ChevronRight,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productUnit: string;
  unitSellingPrice: number;
  quantity: number;
  totalPrice: number;
}

interface SellerOrder {
  id: string;
  orderNumber: string;
  status: 'PLACED' | 'CONFIRMED' | 'PACKING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryName: string;
  deliveryPhone: string;
  deliveryArea: string;
  deliveryAddress: string;
  placedAt: string;
  createdAt: string;
  items: OrderItem[];
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  async function fetchOrders() {
    try {
      const url =
        activeTab === 'ALL'
          ? '/api/seller/orders'
          : `/api/seller/orders?status=${activeTab}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch seller orders:', err);
    } finally {
      setLoading(false);
    }
  }

  // 1. Accept Order (PLACED -> CONFIRMED)
  async function handleAccept(orderId: string) {
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
        setActionMessage('Order accepted! You can now start packing.');
        fetchOrders();
      }
    } catch {
      setActionMessage('Network error occurred.');
    } finally {
      setActionLoading(null);
    }
  }

  // 2. Reject Order (PLACED -> CANCELLED)
  async function handleReject(orderId: string) {
    if (!confirm('Are you sure you want to reject this order? Reserved stock will be returned.')) {
      return;
    }

    setActionLoading(orderId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected from seller orders list' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Error: ${data.error || 'Failed to reject order.'}`);
      } else {
        setActionMessage('Order rejected and inventory restocked.');
        fetchOrders();
      }
    } catch {
      setActionMessage('Network error occurred.');
    } finally {
      setActionLoading(null);
    }
  }

  // 3. Advance Status (CONFIRMED -> PACKING -> READY_FOR_PICKUP)
  async function handleAdvanceStatus(orderId: string, nextStatus: 'PACKING' | 'READY_FOR_PICKUP') {
    setActionLoading(orderId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Error: ${data.error || 'Failed to update order status.'}`);
      } else {
        setActionMessage(
          nextStatus === 'PACKING'
            ? 'Order status updated to Packing.'
            : 'Order marked ready for delivery partner pickup!'
        );
        fetchOrders();
      }
    } catch {
      setActionMessage('Network error occurred.');
    } finally {
      setActionLoading(null);
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
    { key: 'PACKING', label: 'Preparing / Packing' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
    { key: 'PICKED_UP', label: 'Picked Up' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
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
              Order Fulfillment Pipeline
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live incoming customer orders for your store &bull; 5-min acceptance SLA
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

        {actionMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
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

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number (e.g. 12R-), recipient name, or area..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
          />
        </div>

        {/* Filter Tabs */}
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
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No orders found</p>
          <p className="text-[11px] text-slate-500">
            {searchQuery
              ? `No orders match "${searchQuery}".`
              : activeTab === 'ALL'
              ? 'No orders placed for this seller yet.'
              : `No orders in "${activeTab}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const remaining = getRemainingSeconds(ord.placedAt);
            const isPlaced = ord.status === 'PLACED';
            const isExpired = isPlaced && remaining <= 0;

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
              PACKING: 'Preparing / Packing',
              READY_FOR_PICKUP: 'Ready for Pickup',
              PICKED_UP: 'Picked Up by Rider',
              OUT_FOR_DELIVERY: 'Out for Delivery',
              DELIVERED: 'Delivered',
              CANCELLED: 'Cancelled',
            };

            return (
              <div
                key={ord.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5 hover:border-slate-300 transition-colors"
              >
                {/* Header row: Order Number, Badge, Timer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border ${
                        statusColors[ord.status] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {statusLabels[ord.status] || ord.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {/* 5-Minute Timer Badge for PLACED */}
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
                        <span>
                          {isExpired ? 'DEADLINE EXPIRED' : `SLA: ${formatTimer(remaining)} left`}
                        </span>
                      </div>
                    )}

                    <span className="text-slate-400 text-[11px]">
                      Placed{' '}
                      {new Date(ord.placedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Middle details: Customer Address & Item Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{ord.deliveryName}</div>
                    <div className="text-slate-500 mt-0.5">
                      {ord.deliveryAddress}, {ord.deliveryArea}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Ph: {ord.deliveryPhone}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 space-y-1">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Ordered Products ({ord.items.length})
                    </div>
                    <div className="space-y-0.5">
                      {ord.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between text-slate-700"
                        >
                          <span className="truncate max-w-[200px]">
                            {item.quantity}x {item.productName} ({item.productUnit})
                          </span>
                          <span className="font-bold shrink-0">₹{item.totalPrice}</span>
                        </div>
                      ))}
                      {ord.items.length > 3 && (
                        <div className="text-[10px] text-slate-400">
                          +{ord.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom row: Total & Pipeline Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="text-xs">
                    <span className="text-slate-500">Bill Total: </span>
                    <span className="text-base font-black text-slate-900">
                      ₹{ord.totalAmount}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded ml-2">
                      Cash on Delivery
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 1. Status PLACED Actions: Accept / Reject */}
                    {isPlaced && (
                      <>
                        <button
                          onClick={() => handleAccept(ord.id)}
                          disabled={actionLoading === ord.id || isExpired}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>

                        <button
                          onClick={() => handleReject(ord.id)}
                          disabled={actionLoading === ord.id}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {/* 2. Status CONFIRMED Action: Start Packing */}
                    {ord.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, 'PACKING')}
                        disabled={actionLoading === ord.id}
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span>Start Packing</span>
                      </button>
                    )}

                    {/* 3. Status PACKING Action: Mark Ready for Pickup */}
                    {ord.status === 'PACKING' && (
                      <button
                        onClick={() => handleAdvanceStatus(ord.id, 'READY_FOR_PICKUP')}
                        disabled={actionLoading === ord.id}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {/* 4. Link to Invoice */}
                    <Link
                      href={`/seller/orders/${ord.id}`}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Invoice</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

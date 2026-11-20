'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  IndianRupee,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productUnit: string;
  unitMrp: number;
  unitSellingPrice: number;
  quantity: number;
  totalPrice: number;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  sellerId: string;
  sellerName: string;
  status: 'PLACED' | 'CONFIRMED' | 'PACKING' | 'READY_FOR_PICKUP' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'PENDING' | 'COLLECTED' | 'FAILED' | 'REFUNDED';
  deliveryName: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryLandmark?: string | null;
  deliveryArea: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPostalCode: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  distanceKm: number;
  placedAt: string;
  createdAt: string;
  items: OrderItem[];
}

export default function SellerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    fetchOrderDetail();
    const interval = setInterval(() => {
      fetchOrderDetail();
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    const clock = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  async function fetchOrderDetail() {
    try {
      const res = await fetch(`/api/seller/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        } else {
          setError('Order not found.');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Unauthorized or order not found.');
      }
    } catch {
      setError('Network error fetching order details.');
    } finally {
      setLoading(false);
    }
  }

  // 1. Accept Order
  async function handleAccept() {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/accept`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback(`Error: ${data.error || 'Failed to accept order.'}`);
      } else {
        setActionFeedback('Order accepted successfully!');
        fetchOrderDetail();
      }
    } catch {
      setActionFeedback('Network error occurred.');
    } finally {
      setActionLoading(false);
    }
  }

  // 2. Reject Order
  async function handleReject() {
    if (!confirm('Reject this order and return items to inventory stock?')) {
      return;
    }

    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rejected from order details view' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback(`Error: ${data.error || 'Failed to reject order.'}`);
      } else {
        setActionFeedback('Order rejected and inventory restocked.');
        fetchOrderDetail();
      }
    } catch {
      setActionFeedback('Network error occurred.');
    } finally {
      setActionLoading(false);
    }
  }

  // 3. Advance Status
  async function handleAdvanceStatus(nextStatus: 'PACKING' | 'READY_FOR_PICKUP') {
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/seller/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionFeedback(`Error: ${data.error || 'Failed to advance status.'}`);
      } else {
        setActionFeedback(
          nextStatus === 'PACKING'
            ? 'Status updated: Packing / Preparing order.'
            : 'Order is now Ready for Pickup!'
        );
        fetchOrderDetail();
      }
    } catch {
      setActionFeedback('Network error occurred.');
    } finally {
      setActionLoading(false);
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
        <p className="text-xs text-slate-500 font-bold">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 max-w-lg mx-auto mt-6">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-black text-slate-900">Access Denied or Order Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            {error || 'This order does not belong to your store.'}
          </p>
        </div>
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Seller Orders</span>
        </Link>
      </div>
    );
  }

  const remaining = getRemainingSeconds(order.placedAt);
  const isPlaced = order.status === 'PLACED';
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
    CONFIRMED: 'Accepted / Order Confirmed',
    PACKING: 'Preparing & Packing',
    READY_FOR_PICKUP: 'Ready for Rider Pickup',
    PICKED_UP: 'Picked Up by Rider',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled / Rejected',
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/seller/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <span className="text-[11px] text-slate-500 font-mono">
          Seller ID: {order.sellerId}
        </span>
      </div>

      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
            actionFeedback.startsWith('Error')
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{actionFeedback}</span>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs font-black uppercase tracking-wider underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Order Header Card */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Customer Order Number
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {order.orderNumber}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Placed: {new Date(order.placedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-xl border ${
                statusColors[order.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {statusLabels[order.status] || order.status}
            </span>

            {/* 5-Minute Timer */}
            {isPlaced && (
              <div
                className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 ${
                  isExpired
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : remaining < 60
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {isExpired ? 'DEADLINE EXPIRED (5 MIN)' : `Acceptance SLA: ${formatTimer(remaining)} left`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar for Status Transitions */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-black text-slate-900">
              Order Pipeline Status: {statusLabels[order.status] || order.status}
            </div>
            <div className="text-[11px] text-slate-500">
              {order.status === 'PLACED'
                ? 'Review products and accept before the 5-minute deadline.'
                : order.status === 'CONFIRMED'
                ? 'Order accepted. Gather items and initiate packing.'
                : order.status === 'PACKING'
                ? 'Items packed. Mark ready once handoff parcel is ready.'
                : order.status === 'READY_FOR_PICKUP'
                ? 'Parcel is ready for pickup by delivery partner.'
                : order.status === 'DELIVERED'
                ? 'Order successfully delivered to customer.'
                : 'Order has been cancelled / rejected.'}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            {order.status === 'PLACED' && (
              <>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading || isExpired}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Order</span>
                </button>

                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {order.status === 'CONFIRMED' && (
              <button
                onClick={() => handleAdvanceStatus('PACKING')}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
              >
                <Package className="w-4 h-4" />
                <span>Start Packing</span>
              </button>
            )}

            {order.status === 'PACKING' && (
              <button
                onClick={() => handleAdvanceStatus('READY_FOR_PICKUP')}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
              >
                <Truck className="w-4 h-4" />
                <span>Mark Ready for Pickup</span>
              </button>
            )}

            {order.status === 'READY_FOR_PICKUP' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Awaiting Delivery Partner</span>
              </div>
            )}

            {order.status === 'PICKED_UP' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs font-bold">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>Picked Up by Partner</span>
              </div>
            )}

            {order.status === 'OUT_FOR_DELIVERY' && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Out for Delivery</span>
              </div>
            )}
          </div>
        </div>

        {/* Customer & Delivery Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Recipient Details */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Customer Information</span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">{order.deliveryName}</div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{order.deliveryPhone}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address Snapshot */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Delivery Address Snapshot</span>
            </div>

            <div className="text-slate-700 leading-relaxed">
              <div>{order.deliveryAddress}</div>
              {order.deliveryLandmark && (
                <div className="text-slate-500">Landmark: {order.deliveryLandmark}</div>
              )}
              <div>
                {order.deliveryArea}, {order.deliveryCity}, {order.deliveryState} -{' '}
                {order.deliveryPostalCode}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Coordinates: {order.deliveryLatitude.toFixed(4)},{' '}
                {order.deliveryLongitude.toFixed(4)}
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Products Table */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Order Items ({order.items.length})
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 text-xs bg-white"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{item.productName}</div>
                  <div className="text-[11px] text-slate-500">
                    Unit: {item.productUnit} &bull; ₹{item.unitSellingPrice} each
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-slate-900">
                    Qty: {item.quantity}
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    ₹{item.totalPrice}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Breakdown Summary */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Item Subtotal</span>
            <span>₹{order.subtotal}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Delivery Fee</span>
            <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
          </div>

          <div className="flex items-center justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
            <span>Total Payable (COD)</span>
            <span>₹{order.totalAmount}</span>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cash to be collected upon customer delivery.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

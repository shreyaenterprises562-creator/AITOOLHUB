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
  Store,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface OrderDetail {
  id: string;
  orderNumber: string;
  sellerId: string;
  sellerName: string;
  deliveryPartnerId?: string | null;
  deliveryPartnerName?: string | null;
  status: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
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
  items: Array<{
    id: string;
    productName: string;
    productUnit: string;
    unitMrp: number;
    unitSellingPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  useEffect(() => {
    fetchOrderDetail();
  }, [orderId]);

  async function fetchOrderDetail() {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.order) setOrder(data.order);
        else setError('Order not found.');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch order.');
      }
    } catch {
      setError('Network error fetching order details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminCancel(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;

    setActionLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason.trim() || 'Cancelled by Admin' }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to cancel order.', isError: true });
      } else {
        setStatusMessage({
          text: 'Order cancelled safely and reserved items restocked to inventory.',
          isError: false,
        });
        setShowCancelModal(false);
        fetchOrderDetail();
      }
    } catch {
      setStatusMessage({ text: 'Network error cancelling order.', isError: true });
    } finally {
      setActionLoading(false);
    }
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
          <h2 className="text-sm font-black text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'This order does not exist.'}</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
      </div>
    );
  }

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
    PACKING: 'Preparing & Packing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    PICKED_UP: 'Picked Up',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };

  const canCancel = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Platform Orders</span>
        </Link>

        <span className="text-[11px] text-slate-400 font-mono">Order ID: {order.id}</span>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
            statusMessage.isError
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
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
              Operational Invoice
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {order.orderNumber}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Placed: {new Date(order.placedAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black uppercase px-3 py-1 rounded-xl border ${
                statusColors[order.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {statusLabels[order.status] || order.status}
            </span>

            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all border border-rose-200"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Assigned Store & Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Seller Store Info */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              <Store className="w-3.5 h-3.5 text-amber-500" />
              <span>Assigned Partner Store</span>
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-slate-900 text-sm">{order.sellerName}</div>
              <div className="text-[11px] text-slate-500 font-mono">Seller ID: {order.sellerId}</div>
            </div>
          </div>

          {/* Delivery Partner Rider Info */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Assigned Delivery Partner</span>
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-slate-900 text-sm">
                {order.deliveryPartnerName ? order.deliveryPartnerName : <span className="text-slate-400 font-normal italic">Unassigned</span>}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {order.deliveryPartnerId ? `Rider ID: ${order.deliveryPartnerId}` : 'Awaiting Rider Acceptance'}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Customer Information</span>
            </div>
            <div className="space-y-0.5">
              <div className="font-black text-slate-900 text-sm">{order.deliveryName}</div>
              <div className="text-slate-600 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{order.deliveryPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Address Snapshot */}
        <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 uppercase tracking-wider text-[10px]">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
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
            <div className="text-[10px] text-slate-400 mt-1 font-mono">
              Coordinates: {order.deliveryLatitude.toFixed(4)}, {order.deliveryLongitude.toFixed(4)}
            </div>
          </div>
        </div>

        {/* Itemized Products */}
        <div className="space-y-2 pt-2">
          <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Order Products ({order.items.length})
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
                  <div className="font-black text-slate-900">Qty: {item.quantity}</div>
                  <div className="text-xs font-bold text-slate-700">₹{item.totalPrice}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bill Breakdown */}
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
            <span>Payment Method: Cash on Delivery (COD) &bull; Payment Status: {order.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <div className="space-y-1">
              <h3 className="text-base font-black text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Order Cancellation</span>
              </h3>
              <p className="text-xs text-slate-500">
                Cancelling this order will mark it CANCELLED and immediately return reserved stock to inventory.
              </p>
            </div>

            <form onSubmit={handleAdminCancel} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Cancellation Reason *
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Customer requested cancellation / address incorrect"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Order & Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

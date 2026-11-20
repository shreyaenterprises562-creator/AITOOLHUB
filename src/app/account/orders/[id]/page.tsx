'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowLeft,
  MapPin,
  Store,
  Calendar,
  Banknote,
  Loader2,
  CheckCircle2,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { StoredOrderRecord } from '../../../../lib/order-store';

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  const router = useRouter();
  const { customer, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [order, setOrder] = useState<StoredOrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(`/account/login?returnUrl=/account/orders/${orderId}`);
    }
  }, [isAuthLoading, isAuthenticated, orderId, router]);

  // Fetch order details
  useEffect(() => {
    async function fetchOrder() {
      if (!isAuthenticated || !orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          if (res.status === 404 || res.status === 403) {
            setError('Order not found or you do not have permission to view it.');
          } else {
            setError('Failed to load order details.');
          }
          return;
        }

        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError('Order data unavailable.');
        }
      } catch {
        setError('Unable to connect. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchOrder();
    }
  }, [isAuthenticated, orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-[#E60028]" />
          <span>Loading order #{orderId}...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-base font-black text-slate-900">Order Not Available</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'This order does not exist or you do not have access to view it.'}
          </p>
          <div className="pt-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-900 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt || order.placedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#FFD000] selection:text-black pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/account/orders"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Orders</span>
          </Link>

          <span className="font-mono font-black text-sm text-slate-900">
            #{order.orderNumber}
          </span>

          <div className="w-16" />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Status Header Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Order Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                order.status === 'DELIVERED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'OUT_FOR_DELIVERY' || order.status === 'PICKED_UP'
                  ? 'bg-sky-100 text-sky-800'
                  : order.status === 'CANCELLED'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {order.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-500">· {formattedDate}</span>
            </div>
            {order.deliveryPartnerName && (
              <div className="text-[11px] text-slate-600 font-medium pt-0.5">
                Delivery Partner: <strong className="text-slate-900">{order.deliveryPartnerName}</strong>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Amount
            </span>
            <span className="text-lg font-black text-slate-950 tabular-nums">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        {/* Store Partner Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-slate-800 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Fulfilled By Local Store
            </span>
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {order.sellerName}
            </span>
          </div>
        </div>

        {/* Line Items List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#E60028]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Items in this Order ({order.items.length})
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 space-y-0.5">
                  {item.brand && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.brand}
                    </span>
                  )}
                  <p className="font-bold text-slate-900 truncate leading-snug">
                    {item.productName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.productUnit} · ₹{item.unitSellingPrice} × {item.quantity}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-slate-900 tabular-nums">
                    ₹{item.totalPrice}
                  </span>
                  {item.unitMrp > item.unitSellingPrice && (
                    <span className="text-[10px] text-slate-400 line-through tabular-nums block">
                      ₹{item.unitMrp * item.quantity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address Snapshot */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#E60028]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Delivery Address Snapshot
            </h2>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl space-y-1 text-xs">
            <div className="font-bold text-slate-900">
              {order.deliveryName}{' '}
              <span className="font-normal text-slate-500">· +91 {order.deliveryPhone}</span>
            </div>
            <div className="text-slate-600 leading-relaxed text-[11px]">
              {order.deliveryAddress}
              {order.deliveryLandmark && ` (Near ${order.deliveryLandmark})`}
              {order.deliveryArea && `, ${order.deliveryArea}`}
              {order.deliveryCity && `, ${order.deliveryCity}`}
              {order.deliveryPostalCode && ` - ${order.deliveryPostalCode}`}
            </div>
            {order.distanceKm !== undefined && (
              <div className="text-[10px] text-slate-400 font-medium pt-1">
                📍 {order.distanceKm} KM from service hub · Coordinates ({order.deliveryLatitude.toFixed(4)}, {order.deliveryLongitude.toFixed(4)})
              </div>
            )}
          </div>
        </div>

        {/* Bill Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#E60028]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Payment & Bill Breakdown
            </h2>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-bold text-slate-900">
                {order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 'Online'}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Payment Status</span>
              <span className="font-bold text-amber-800 uppercase text-[10px]">
                {order.paymentStatus}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-bold text-slate-900 tabular-nums">₹{order.subtotal}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Delivery Fee</span>
              {order.deliveryFee === 0 ? (
                <span className="font-black text-emerald-700 text-[11px] uppercase">FREE</span>
              ) : (
                <span className="font-bold text-slate-900 tabular-nums">₹{order.deliveryFee}</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-950">
              <span>Total Paid / Payable</span>
              <span className="tabular-nums">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <Link
            href="/account/orders"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Order History
          </Link>
        </div>
      </main>
    </div>
  );
}

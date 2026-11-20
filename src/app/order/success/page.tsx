'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  MapPin,
  Store,
  Banknote,
  ArrowRight,
  ShoppingBag,
  Clock,
  Loader2,
} from 'lucide-react';
import { StoredOrderRecord } from '../../../lib/order-store';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<StoredOrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId && !orderNumber) {
        setIsLoading(false);
        return;
      }

      try {
        const idToQuery = orderId || orderNumber;
        const res = await fetch(`/api/orders/${idToQuery}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.order) {
            setOrder(data.order);
          }
        }
      } catch (err) {
        console.warn('Failed to load order details:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, orderNumber]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#FFD000] selection:text-black py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <Link href="/" className="inline-flex items-center justify-center gap-2 group">
            <div className="relative w-8 h-8 rounded-xl overflow-hidden shadow-xs ring-1 ring-black/5">
              <Image
                src="/assets/12rush-logo.png"
                alt="12RUSH"
                fill
                sizes="32px"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">
              12<span className="text-[#E60028]">RUSH</span>
            </span>
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
          {/* Green Animated Badge */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
              Order Placed Successfully
            </span>
            <h1 className="text-2xl font-black text-slate-900">
              Thank You for Your Order!
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your order has been placed with Cash on Delivery. Our partner store is preparing your cleaning essentials.
            </p>
          </div>

          {/* Order Snapshot Box */}
          <div className="p-4 sm:p-5 bg-slate-50/80 border border-slate-200/80 rounded-2xl text-left space-y-3.5 text-xs">
            {/* Order Number & Date */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Order Number
                </span>
                <span className="font-mono font-black text-slate-950 text-sm">
                  #{order?.orderNumber || orderNumber || '12R-ORDER'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                {order?.status || 'PLACED'}
              </span>
            </div>

            {/* Seller */}
            <div className="flex items-start gap-2.5">
              <Store className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Store Partner
                </span>
                <span className="font-bold text-slate-900">
                  {order?.sellerName || 'Patel Super Clean Mart'}
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#E60028] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery Address
                </span>
                <p className="font-semibold text-slate-800 leading-snug">
                  {order?.deliveryName && `${order.deliveryName} · +91 ${order.deliveryPhone}`}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {order?.deliveryAddress}
                  {order?.deliveryLandmark && ` (Near ${order.deliveryLandmark})`}
                  {order?.deliveryArea && `, ${order.deliveryArea}`}
                  {order?.deliveryCity && `, ${order.deliveryCity}`}
                </p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-2.5">
              <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Payment Method
                </span>
                <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
                <p className="text-[11px] text-slate-500">Pay cash upon package arrival</p>
              </div>
            </div>

            {/* Financial Totals Breakdown */}
            {order && (
              <div className="pt-3 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery</span>
                  {order.deliveryFee === 0 ? (
                    <span className="font-black text-emerald-700 text-[11px] uppercase">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-900 tabular-nums">₹{order.deliveryFee}</span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-950">
                  <span>Total Amount</span>
                  <span className="tabular-nums">₹{order.totalAmount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/account/orders"
              className="py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
            >
              <span>View My Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/"
              className="py-3 px-4 bg-[#FFD000] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#E60028]" />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}

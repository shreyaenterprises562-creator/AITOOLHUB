'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Package,
  CheckCircle2,
  Navigation,
  AlertCircle,
  Loader2,
  Banknote,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useRider } from '../../../../context/RiderContext';
import RiderHeader from '../../../../components/rider/RiderHeader';
import RiderBottomNav from '../../../../components/rider/RiderBottomNav';

export default function RiderDeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const { isAuthenticated, isLoading: isAuthLoading, refreshData } = useRider();

  const [delivery, setDelivery] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/rider/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Load delivery details
  const fetchDelivery = useCallback(async () => {
    if (!orderId || !isAuthenticated) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/rider/deliveries/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.delivery) {
          setDelivery(data.delivery);
        } else {
          setErrorMessage(data.error || 'Delivery not found or not assigned to you.');
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || 'Failed to fetch delivery details.');
      }
    } catch {
      setErrorMessage('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, isAuthenticated]);

  useEffect(() => {
    fetchDelivery();
  }, [fetchDelivery]);

  // Handle Action Button (Picked Up -> Start -> Deliver)
  const handleAction = async () => {
    if (!delivery || isSubmitting) return;

    setIsSubmitting(true);
    setActionSuccessMessage(null);
    setErrorMessage(null);

    let endpoint = '';
    if (delivery.status === 'READY_FOR_PICKUP') {
      endpoint = `/api/rider/deliveries/${orderId}/pickup`;
    } else if (delivery.status === 'PICKED_UP') {
      endpoint = `/api/rider/deliveries/${orderId}/start`;
    } else if (delivery.status === 'OUT_FOR_DELIVERY') {
      endpoint = `/api/rider/deliveries/${orderId}/deliver`;
    } else {
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Action failed. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setActionSuccessMessage(data.message || 'Status updated successfully.');
      await fetchDelivery();
      await refreshData();
    } catch {
      setErrorMessage('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { key: 'CONFIRMED', label: 'Accepted' },
    { key: 'READY_FOR_PICKUP', label: 'Ready' },
    { key: 'PICKED_UP', label: 'Picked' },
    { key: 'OUT_FOR_DELIVERY', label: 'On Way' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStatusIndex = steps.findIndex((s) => s.key === delivery?.status);

  // External Navigation Link (Google Maps / OpenStreetMap)
  const navUrl = delivery?.deliveryLatitude && delivery?.deliveryLongitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${delivery.deliveryLatitude},${delivery.deliveryLongitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(delivery?.deliveryAddress || '')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-24">
      <RiderHeader />

      <main className="max-w-md w-full mx-auto p-4 space-y-4 flex-1">
        {/* Top Back bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/rider/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          {delivery && (
            <span className="text-xs font-mono font-bold text-amber-400">
              #{delivery.orderNumber}
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-xs text-slate-400">Loading delivery details...</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success message */}
        {actionSuccessMessage && (
          <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {delivery && !isLoading && (
          <div className="space-y-4">
            {/* Status Progress Timeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Delivery Pipeline
              </div>
              <div className="flex items-center justify-between relative">
                {/* Connecting bar */}
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-800 -z-0" />
                <div
                  className="absolute top-3 left-4 h-0.5 bg-[#FFD000] transition-all duration-300 -z-0"
                  style={{
                    width: `${Math.max(
                      0,
                      Math.min(100, (currentStatusIndex / (steps.length - 1)) * 100)
                    )}%`,
                  }}
                />

                {steps.map((st, idx) => {
                  const isDone = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;

                  return (
                    <div key={st.key} className="flex flex-col items-center gap-1 z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          isCurrent
                            ? 'bg-[#FFD000] text-slate-950 ring-4 ring-amber-400/20'
                            : isDone
                            ? 'bg-amber-400/30 text-amber-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[9px] font-bold ${
                          isCurrent ? 'text-[#FFD000]' : isDone ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTON CONTAINER */}
            <div className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Next Action:</span>
                <span className="font-bold text-[#FFD000] uppercase tracking-wider">
                  {delivery.status === 'READY_FOR_PICKUP' && 'Step 1: Store Pickup'}
                  {delivery.status === 'PICKED_UP' && 'Step 2: Transit'}
                  {delivery.status === 'OUT_FOR_DELIVERY' && 'Step 3: Customer Handover'}
                  {delivery.status === 'DELIVERED' && 'Completed'}
                </span>
              </div>

              {delivery.status === 'READY_FOR_PICKUP' && (
                <button
                  onClick={handleAction}
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFD000] hover:bg-amber-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Store className="w-4 h-4" />
                      <span>Confirm Picked Up from Store</span>
                    </>
                  )}
                </button>
              )}

              {delivery.status === 'PICKED_UP' && (
                <button
                  onClick={handleAction}
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFD000] hover:bg-amber-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Start Delivery (On the Way)</span>
                    </>
                  )}
                </button>
              )}

              {delivery.status === 'OUT_FOR_DELIVERY' && (
                <button
                  onClick={handleAction}
                  disabled={isSubmitting}
                  className="w-full py-4 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Delivered &amp; Collect ₹{delivery.totalAmount} COD</span>
                    </>
                  )}
                </button>
              )}

              {delivery.status === 'DELIVERED' && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">Delivery Completed!</div>
                  <div className="text-xs text-slate-400">
                    Cash payment of ₹{delivery.totalAmount} was recorded as collected.
                  </div>
                  <Link
                    href="/rider/dashboard"
                    className="inline-block mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    Return to Available Orders
                  </Link>
                </div>
              )}
            </div>

            {/* PICKUP STORE INFORMATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Store className="w-4 h-4" />
                  <span>Pickup Location (Seller)</span>
                </span>
                {delivery.shopContactPhone && (
                  <a
                    href={`tel:${delivery.shopContactPhone}`}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call Store</span>
                  </a>
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-white text-sm">{delivery.shopName}</div>
                <div className="text-xs text-slate-300">{delivery.shopAddress}</div>
                {delivery.shopContactPhone && (
                  <div className="text-[11px] text-slate-400">Contact: +91 {delivery.shopContactPhone}</div>
                )}
              </div>
            </div>

            {/* CUSTOMER DROP INFORMATION */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#E60028] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <MapPin className="w-4 h-4" />
                  <span>Drop Location (Customer)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {delivery.deliveryPhone && (
                    <a
                      href={`tel:${delivery.deliveryPhone}`}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                  )}
                  <a
                    href={navUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#FFD000] hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-black transition-colors"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </a>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1">
                <div className="font-bold text-white text-sm">{delivery.deliveryName}</div>
                <div className="text-xs text-slate-300">{delivery.deliveryAddress}</div>
                {delivery.deliveryLandmark && (
                  <div className="text-[11px] text-amber-300">
                    <strong>Landmark:</strong> {delivery.deliveryLandmark}
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  {delivery.deliveryArea}, {delivery.deliveryCity} - {delivery.deliveryPostalCode}
                </div>
              </div>
            </div>

            {/* PAYMENT & ITEMS BREAKDOWN */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Cash on Delivery (COD)</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {delivery.paymentStatus === 'COLLECTED' ? 'COLLECTED' : 'TO COLLECT'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-sm">
                <span className="text-slate-400">Amount to collect:</span>
                <span className="text-xl font-black text-[#FFD000] tabular-nums">
                  ₹{delivery.totalAmount}
                </span>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Items to Hand Over ({delivery.items.length})
                </div>
                <div className="space-y-1.5">
                  {delivery.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/40"
                    >
                      <div className="truncate max-w-[220px]">
                        <span className="font-semibold text-slate-200">{item.productName}</span>
                        <span className="text-[10px] text-slate-500 ml-1">({item.productUnit})</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-slate-300">×{item.quantity}</span>
                        <span className="font-bold text-white ml-2">₹{item.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <RiderBottomNav />
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bike,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Power,
  Store,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Phone,
  Navigation,
  Loader2,
} from 'lucide-react';
import { useRider } from '../../../context/RiderContext';
import RiderHeader from '../../../components/rider/RiderHeader';
import RiderBottomNav from '../../../components/rider/RiderBottomNav';

export default function RiderDashboardPage() {
  const router = useRouter();
  const { rider, stats, isLoading, isAuthenticated, refreshData, toggleAvailability } = useRider();

  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState<boolean>(true);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Protect route
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/rider/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Load available deliveries
  const fetchAvailable = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingAvailable(true);
    try {
      const res = await fetch('/api/rider/deliveries/available');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setAvailableOrders(data.orders);
        }
      }
    } catch (err) {
      console.warn('Failed to load available orders:', err);
    } finally {
      setIsLoadingAvailable(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  // Handle Accept Delivery
  const handleAcceptDelivery = async (orderId: string) => {
    if (acceptingOrderId) return;
    setAcceptingOrderId(orderId);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/rider/deliveries/${orderId}/accept`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setActionMessage({
          text: data.error || 'Failed to accept delivery. It may have been assigned to another rider.',
          type: 'error',
        });
        setAcceptingOrderId(null);
        await fetchAvailable();
        return;
      }

      setActionMessage({
        text: 'Delivery accepted! Directing you to pickup details...',
        type: 'success',
      });

      await refreshData();
      // Navigate to current delivery
      setTimeout(() => {
        router.push(`/rider/delivery/${orderId}`);
      }, 600);
    } catch {
      setActionMessage({
        text: 'Network error occurred while accepting delivery.',
        type: 'error',
      });
      setAcceptingOrderId(null);
    }
  };

  const isOnline = stats?.isOnline ?? rider?.isOnline ?? false;
  const activeDelivery = stats?.activeDelivery;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-24">
      <RiderHeader />

      <main className="max-w-md w-full mx-auto p-4 space-y-4 flex-1">
        {/* Rider Status & Metrics Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Vehicle: {rider?.vehicleType}
              </span>
              <h2 className="text-xl font-black text-white">{rider?.name}</h2>
              <span className="text-xs text-slate-400 font-mono">{rider?.vehicleNumber}</span>
            </div>

            <button
              onClick={() => toggleAvailability(!isOnline)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 ring-2 ring-emerald-400/40'
                  : 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-400/40'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'ONLINE' : 'GO ONLINE'}</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800 text-center">
            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">Today&apos;s Deliveries</div>
              <div className="text-lg font-black text-white tabular-nums">
                {stats?.todayCompletedCount ?? 0}
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">Earnings</div>
              <div className="text-lg font-black text-[#FFD000] tabular-nums">
                ₹{stats?.todayEarnings ?? 0}
              </div>
            </div>

            <div className="bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800/80">
              <div className="text-[11px] text-slate-400 font-medium">Available</div>
              <div className="text-lg font-black text-amber-400 tabular-nums">
                {availableOrders.length}
              </div>
            </div>
          </div>
        </div>

        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>You are currently <strong>OFFLINE</strong>. Turn ON to receive and accept new delivery tasks.</span>
            </div>
            <button
              onClick={() => toggleAvailability(true)}
              className="px-3 py-1.5 bg-[#FFD000] text-slate-950 font-bold rounded-xl text-xs shrink-0 cursor-pointer"
            >
              Go Online
            </button>
          </div>
        )}

        {/* Action Message Feedback */}
        {actionMessage && (
          <div
            className={`p-3.5 rounded-2xl flex items-center gap-2 text-xs animate-in fade-in duration-200 ${
              actionMessage.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
            }`}
          >
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* CURRENT ACTIVE DELIVERY (TOP PRIORITY) */}
        {activeDelivery && (
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border-2 border-[#FFD000] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FFD000]"></span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-[#FFD000]">
                  ACTIVE DELIVERY IN PROGRESS
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                #{activeDelivery.orderNumber}
              </span>
            </div>

            {/* Current Stage */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Current Status:</span>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-black uppercase bg-[#FFD000] text-slate-950">
                  {activeDelivery.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-300 flex items-start gap-2 pt-1 border-t border-slate-900">
                <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">{activeDelivery.shopName}</div>
                  <div className="text-[11px] text-slate-400">{activeDelivery.shopAddress}</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 flex items-start gap-2 pt-1 border-t border-slate-900">
                <MapPin className="w-4 h-4 text-[#E60028] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">{activeDelivery.deliveryName}</div>
                  <div className="text-[11px] text-slate-400">{activeDelivery.deliveryAddress}</div>
                </div>
              </div>
            </div>

            <Link
              href={`/rider/delivery/${activeDelivery.id}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFD000] hover:bg-amber-400 transition-all shadow-lg active:scale-95"
            >
              <span>Continue Delivery Workflow</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* AVAILABLE PICKUP JOBS */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FFD000]" />
              <span>Available Pickups ({availableOrders.length})</span>
            </h3>
            <button
              onClick={() => {
                fetchAvailable();
                refreshData();
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {isLoadingAvailable ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Scanning for ready pickup orders...</p>
            </div>
          ) : availableOrders.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
              <Bike className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-300">No ready pickups at the moment</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Orders appear here automatically once sellers complete packing and mark them
                &apos;Ready for Pickup&apos;.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableOrders.map((order) => {
                const isAccepting = acceptingOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg hover:border-amber-400/40 transition-all space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        #{order.orderNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Ready for Pickup
                      </span>
                    </div>

                    {/* Store Pickup & Customer Drop Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-white text-[11px]">PICKUP FROM:</div>
                          <div className="font-semibold text-slate-200">{order.shopName}</div>
                          <div className="text-[10px] text-slate-400">{order.shopAddress}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                        <MapPin className="w-4 h-4 text-[#E60028] shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-white text-[11px]">DELIVER TO:</div>
                          <div className="font-semibold text-slate-200">{order.deliveryName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                            {order.deliveryAddress}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order summary pill */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{order.items.length} item(s)</span>
                      <span className="font-bold text-white">COD: ₹{order.totalAmount}</span>
                    </div>

                    {/* Accept Delivery CTA Button */}
                    <button
                      onClick={() => handleAcceptDelivery(order.id)}
                      disabled={!isOnline || isAccepting || !!activeDelivery}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFD000] hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      {isAccepting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Accepting Job...</span>
                        </>
                      ) : (
                        <>
                          <span>Accept Delivery</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <RiderBottomNav />
    </div>
  );
}

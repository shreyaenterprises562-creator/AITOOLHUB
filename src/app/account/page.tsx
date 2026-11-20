'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Package,
  Home,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CustomerLocation } from '../../types/catalog';
import { getStoredLocation } from '../../services/location.service';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading, logout } = useAuth();
  const [storedLocation, setStoredLocation] = useState<CustomerLocation | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  // Read saved customer location from localStorage
  useEffect(() => {
    const loc = getStoredLocation();
    if (loc) {
      setStoredLocation(loc);
    }
  }, []);

  // Fetch customer order count
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            setOrderCount(data.orders.length);
          }
        }
      } catch {
        // Non-blocking
      }
    }
    if (isAuthenticated) {
      fetchCount();
    }
  }, [isAuthenticated]);

  // Protect route: if not authenticated, redirect to login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/account/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.replace('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
          <Loader2 className="w-4 h-4 animate-spin text-[#E60028]" />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#FFD000] selection:text-black pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5">
            <div className="relative w-6 h-6 rounded-lg overflow-hidden">
              <Image
                src="/assets/12rush-logo.png"
                alt="12RUSH"
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">
              12<span className="text-[#E60028]">RUSH</span>
            </span>
          </Link>

          <div className="w-14" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Customer Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-slate-950 flex items-center justify-center font-black text-lg shadow-inner">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 leading-tight">
                  {customer.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  Customer
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3 h-3 text-slate-400" />
                  +91 {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1 font-medium truncate max-w-[180px]">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200/80 active:scale-95 shrink-0"
          >
            {isLoggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Logout</span>
          </button>
        </div>

        {/* Section 1: My Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-[#E60028]" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                My Orders
              </h2>
            </div>
            {orderCount && orderCount > 0 ? (
              <Link
                href="/account/orders"
                className="text-xs font-bold text-[#E60028] hover:underline"
              >
                View All ({orderCount})
              </Link>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Phase 1
              </span>
            )}
          </div>

          {orderCount && orderCount > 0 ? (
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-slate-800 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    You have {orderCount} {orderCount === 1 ? 'order' : 'orders'} placed
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Track status and review delivery invoices
                  </p>
                </div>
              </div>

              <Link
                href="/account/orders"
                className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shrink-0 inline-flex items-center gap-1 active:scale-95"
              >
                <span>Orders</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="p-6 bg-slate-50/70 border border-slate-200/60 rounded-xl text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-xs font-bold text-slate-700">No orders placed yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Orders will appear here after your first order.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFD000] hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-2xs active:scale-95"
                >
                  <span>Browse Cleaning Essentials</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Saved Delivery Address */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#E60028]" />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Saved Delivery Location
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-bold text-[#E60028] hover:underline"
            >
              Update on Map
            </Link>
          </div>

          {storedLocation ? (
            <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                  {storedLocation.addressDetails?.addressType || 'Default Location'}
                </span>
                {typeof storedLocation.distanceKm === 'number' && (
                  <span className="text-xs font-bold text-slate-700">
                    {storedLocation.distanceKm} KM from hub (
                    {storedLocation.deliveryFee === 0 ? 'FREE' : `₹${storedLocation.deliveryFee}`})
                  </span>
                )}
              </div>

              <div className="text-xs font-bold text-slate-900">
                {storedLocation.addressDetails?.recipientName || customer.name}
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                {storedLocation.addressDetails?.houseNumber && `${storedLocation.addressDetails.houseNumber}, `}
                {storedLocation.addressDetails?.buildingName && `${storedLocation.addressDetails.buildingName}, `}
                {storedLocation.addressDetails?.area || storedLocation.area}
                {storedLocation.addressDetails?.landmark && ` (Near ${storedLocation.addressDetails.landmark})`}
                {`, ${storedLocation.city}, ${storedLocation.state}`}
              </div>

              <div className="text-[10px] text-slate-400 font-medium pt-1">
                📍 Coordinates: {storedLocation.latitude.toFixed(4)}, {storedLocation.longitude.toFixed(4)}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-xl text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700">No delivery address set yet</p>
              <p className="text-[11px] text-slate-500">
                Select your location and pin on the storefront to set your delivery point.
              </p>
            </div>
          )}
        </div>

        {/* Section 3: Account Assurance & Privacy */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-0.5">
            <span className="font-bold text-slate-900 block">Verified 12RUSH Customer Account</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Your customer session is protected with secure HTTP-only cookies and bcrypt encryption. No passwords or tokens are stored in unencrypted client storage.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

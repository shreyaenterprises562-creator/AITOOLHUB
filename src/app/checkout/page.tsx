'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ArrowLeft,
  ShoppingBag,
  Store,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  ShieldCheck,
  Loader2,
  Banknote,
  ChevronRight,
  Edit2,
  Home,
  Briefcase,
  Building,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { CustomerLocation } from '../../types/catalog';
import { getStoredLocation, saveStoredLocation } from '../../services/location.service';
import { LocationSelectorModal } from '../../components/customer/LocationSelectorModal';
import { AVAILABLE_DELIVERY_ZONES, INITIAL_LOCATION } from '../../data/fixtures';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, sellerName, subtotal, clearCart } = useCart();
  const { customer, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [location, setLocation] = useState<CustomerLocation | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load customer delivery location on mount
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocation(stored);
    }
  }, []);

  // Update location handler from modal
  const handleLocationUpdated = (newLoc: CustomerLocation) => {
    saveStoredLocation(newLoc);
    setLocation(newLoc);
    setIsLocationModalOpen(false);
  };

  const isServiceable = location ? location.serviceable !== false : false;
  const deliveryFee = location && typeof location.deliveryFee === 'number' ? location.deliveryFee : 0;
  const grandTotal = Number((subtotal + deliveryFee).toFixed(2));

  // Determine if full address details (house number, recipient) exist
  const hasFullAddress = Boolean(
    location?.addressDetails?.houseNumber &&
    location?.addressDetails?.recipientName &&
    location?.addressDetails?.phone
  );

  const recipientName = location?.addressDetails?.recipientName || customer?.name || '';
  const recipientPhone = location?.addressDetails?.phone || customer?.phone || '';
  const houseNumber = location?.addressDetails?.houseNumber || '';
  const buildingName = location?.addressDetails?.buildingName || '';
  const areaName = location?.addressDetails?.area || location?.area || '';
  const landmark = location?.addressDetails?.landmark || '';
  const addressType = location?.addressDetails?.addressType || 'HOME';

  // Handle Place Order
  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setErrorMessage(null);

    // 1. Authentication Check
    if (!isAuthenticated || !customer) {
      router.push('/account/login?returnUrl=/checkout');
      return;
    }

    // 2. Empty Cart Check
    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before checking out.');
      return;
    }

    // 3. Location & Serviceability Check
    if (!location) {
      setIsLocationModalOpen(true);
      return;
    }

    if (!isServiceable) {
      setErrorMessage(
        'Delivery is not available at this location. We currently deliver only within 15 KM of our service hub.'
      );
      return;
    }

    if (!hasFullAddress) {
      setIsLocationModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.product.id,
          sellerProductId: i.product.id,
          quantity: i.quantity,
        })),
        deliveryAddress: {
          recipientName,
          phone: recipientPhone,
          houseNumber,
          buildingName: buildingName || undefined,
          area: areaName,
          landmark: landmark || undefined,
          addressType,
          city: location.city || 'Rajkot',
          state: location.state || 'Gujarat',
          postalCode: location.postalCode || '360005',
          latitude: location.latitude,
          longitude: location.longitude,
        },
        paymentMethod: 'COD',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsSubmitting(false);
        setErrorMessage(data.error || 'Failed to place order. Please review your cart.');
        return;
      }

      // Order successfully created!
      // Clear customer local cart
      clearCart();

      // Navigate to order success screen
      router.push(`/order/success?orderNumber=${data.order.orderNumber}&orderId=${data.order.id}`);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Unable to connect to order server. Please try again.');
    }
  };

  // If cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-center">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-[#FFD000] rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-7 h-7 text-slate-800" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Add floor, bathroom, or kitchen cleaning essentials from a verified local seller to proceed with checkout.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#FFD000] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#FFD000] selection:text-black pb-32">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Store</span>
          </Link>

          <div className="flex items-center gap-1.5">
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
              Checkout
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-500">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-in fade-in duration-150 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Auth Notice (if not logged in) */}
        {!isAuthLoading && !isAuthenticated && (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900">Login Required to Place Order</p>
              <p className="text-[11px] text-slate-600">
                Sign in with your verified mobile number to complete checkout.
              </p>
            </div>
            <Link
              href="/account/login?returnUrl=/checkout"
              className="px-4 py-2 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-900 transition-all shrink-0"
            >
              Login
            </Link>
          </div>
        )}

        {/* 1. DELIVERY ADDRESS SECTION */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E60028]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                1. Delivery Address
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#E60028] hover:underline"
            >
              <Edit2 className="w-3 h-3" />
              <span>Change Address</span>
            </button>
          </div>

          {location ? (
            <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 text-[10px] font-black uppercase tracking-wider">
                  {addressType === 'WORK' ? (
                    <Briefcase className="w-2.5 h-2.5" />
                  ) : addressType === 'OTHER' ? (
                    <Building className="w-2.5 h-2.5" />
                  ) : (
                    <Home className="w-2.5 h-2.5" />
                  )}
                  {addressType}
                </span>

                {typeof location.distanceKm === 'number' && (
                  <span className="text-[11px] font-bold text-slate-700">
                    {location.distanceKm} KM from hub (
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-black">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                    )
                  </span>
                )}
              </div>

              {hasFullAddress ? (
                <>
                  <div className="font-bold text-slate-900 text-sm">
                    {recipientName}{' '}
                    <span className="font-normal text-slate-500 text-xs">· +91 {recipientPhone}</span>
                  </div>
                  <div className="text-slate-600 leading-relaxed text-xs">
                    {houseNumber && `${houseNumber}, `}
                    {buildingName && `${buildingName}, `}
                    {areaName}
                    {landmark && ` (Near ${landmark})`}
                    {`, ${location.city || 'Rajkot'}, ${location.state || 'Gujarat'}`}
                  </div>
                </>
              ) : (
                <div className="space-y-1.5 py-1">
                  <div className="text-slate-700 font-bold">
                    📍 {areaName}, {location.city || 'Rajkot'}
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium">
                    ⚠️ Complete house/flat number and recipient contact to ensure prompt delivery.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs font-black text-[#E60028] hover:underline"
                  >
                    + Add Flat / House / Recipient details
                  </button>
                </div>
              )}

              {/* Serviceability Warning */}
              {!isServiceable && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-rose-800 text-xs mt-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Outside 15 KM delivery area. Please select an address within Rajkot city limits.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
              <p className="text-xs text-slate-600 font-medium">No delivery address selected</p>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="px-4 py-2 bg-[#FFD000] text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-all"
              >
                Select Delivery Location
              </button>
            </div>
          )}
        </section>

        {/* 2. ORDER SUMMARY SECTION */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#E60028]" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
                2. Order Summary
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-slate-900">{sellerName || 'Patel Super Clean Mart'}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 relative shrink-0 overflow-hidden flex items-center justify-center">
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Package className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {item.product.brand}
                    </span>
                    <p className="font-bold text-slate-900 truncate leading-snug">
                      {item.product.name}
                    </p>
                    <span className="text-[11px] text-slate-500">
                      {item.product.unit} · Qty {item.quantity}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-slate-900 tabular-nums">
                    ₹{item.product.sellingPrice * item.quantity}
                  </span>
                  {item.product.baseMrp > item.product.sellingPrice && (
                    <span className="text-[10px] text-slate-400 line-through tabular-nums block">
                      ₹{item.product.baseMrp * item.quantity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 & 5. DELIVERY FEE & BILL DETAILS */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#E60028]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              3. Bill Details
            </h2>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-bold text-slate-900 tabular-nums">₹{subtotal}</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="font-black text-emerald-700 uppercase tracking-wider text-[11px]">
                  FREE
                </span>
              ) : (
                <span className="font-bold text-slate-900 tabular-nums">₹{deliveryFee}</span>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-950">
              <span>Total Payable</span>
              <span className="tabular-nums">₹{grandTotal}</span>
            </div>
          </div>
        </section>

        {/* 4. PAYMENT METHOD SECTION (COD ONLY) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-[#E60028]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">
              4. Payment Method
            </h2>
          </div>

          <div className="p-3.5 bg-slate-50 border-2 border-slate-950 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center bg-slate-950 text-white shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">Cash on Delivery (COD)</p>
                <p className="text-[11px] text-slate-500">Pay when your order arrives at your door</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
              Selected
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Exact change is appreciated. Delivery partner will provide an instant physical receipt.</span>
          </div>
        </section>
      </main>

      {/* 6. STICKY BOTTOM PLACE ORDER BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 sm:p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Amount
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-slate-950 tabular-nums">
                ₹{grandTotal}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold">
                {deliveryFee === 0 ? 'Free Delivery' : 'Includes Delivery'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isSubmitting || (location ? !isServiceable : false)}
            className="flex-1 max-w-xs py-3.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FFD000]" />
                <span>Placing Order...</span>
              </>
            ) : (
              <>
                <span>Place Order (COD)</span>
                <ChevronRight className="w-4 h-4 text-[#FFD000]" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Embedded Location Selector Modal (Reuses existing component) */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location || INITIAL_LOCATION}
        isLocationSelected={!!location}
        onSelectZone={(zone) => {
          handleLocationUpdated({
            city: 'Rajkot',
            state: 'Gujarat',
            area: zone.name,
            postalCode: zone.postalCode,
            latitude: location?.latitude || INITIAL_LOCATION.latitude,
            longitude: location?.longitude || INITIAL_LOCATION.longitude,
            isWithinRadius: zone.distanceKm <= 15,
            serviceRadiusKm: 15,
            distanceKm: zone.distanceKm,
            deliveryFee: zone.deliveryFee,
            serviceable: zone.distanceKm <= 15,
            selectionType: 'manual',
          });
        }}
        onSelectGpsLocation={handleLocationUpdated}
      />
    </div>
  );
}

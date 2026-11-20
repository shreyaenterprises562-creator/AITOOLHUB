'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  AlertTriangle,
} from 'lucide-react';

interface SellerItem {
  id: string;
  shopName: string;
  slug: string;
  userName: string;
  contactPhone: string;
  contactEmail: string | null;
  shopAddress: string;
  isActive: boolean;
  approvalStatus: string;
  productCount: number;
  pendingOrderCount: number;
  createdAt: string;
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  useEffect(() => {
    fetchSellers();
  }, []);

  async function fetchSellers() {
    try {
      const res = await fetch('/api/admin/sellers');
      if (res.ok) {
        const data = await res.json();
        if (data.sellers) setSellers(data.sellers);
      }
    } catch (err) {
      console.warn('Failed to fetch sellers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(sellerId: string, currentActive: boolean) {
    const nextState = !currentActive;
    const confirmPrompt = nextState
      ? 'Activate this seller store? The merchant will be allowed to log in and fulfill orders.'
      : 'Deactivate this seller store? The merchant will be blocked from logging in. Note: All historical orders, products, and inventory remain 100% preserved.';

    if (!confirm(confirmPrompt)) return;

    setActionLoading(sellerId);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to update seller status.', isError: true });
      } else {
        setStatusMessage({
          text: `Seller store ${nextState ? 'activated' : 'deactivated'} successfully.`,
          isError: false,
        });
        setSellers((prev) =>
          prev.map((s) => (s.id === sellerId ? { ...s, isActive: nextState } : s))
        );
      }
    } catch {
      setStatusMessage({ text: 'Network error updating seller status.', isError: true });
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = sellers.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.shopName.toLowerCase().includes(q) ||
      s.userName.toLowerCase().includes(q) ||
      s.contactPhone.includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Seller Management &amp; Oversight
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Partner store accounts, activation controls, product mapping &amp; live orders
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchSellers();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between ${
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

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sellers by store name, contact person, or phone number..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Sellers Grid / Cards */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Loading registered sellers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <Store className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No sellers found</p>
          <p className="text-[11px] text-slate-500">
            {searchQuery ? `No sellers match "${searchQuery}".` : 'No sellers registered in platform.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className={`p-4 sm:p-5 rounded-2xl border shadow-2xs space-y-3 transition-colors ${
                s.isActive
                  ? 'bg-white border-slate-200/90'
                  : 'bg-slate-50/80 border-slate-300 opacity-80'
              }`}
            >
              {/* Top: Store Name & Status Badge */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">{s.shopName}</h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">Merchant: {s.userName}</div>
                </div>

                <button
                  onClick={() => handleToggleActive(s.id, s.isActive)}
                  disabled={actionLoading === s.id}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                    s.isActive
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                  }`}
                >
                  {s.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {/* Contact & Address */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{s.contactPhone}</span>
                  {s.contactEmail && (
                    <>
                      <span className="text-slate-300">&bull;</span>
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{s.contactEmail}</span>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{s.shopAddress}</span>
                </div>
              </div>

              {/* Statistics Pill Strip */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Products Mapped</span>
                  <span className="font-black text-slate-900">{s.productCount}</span>
                </div>

                <div className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Pending Orders</span>
                  <span
                    className={`font-black ${
                      s.pendingOrderCount > 0 ? 'text-amber-600' : 'text-slate-900'
                    }`}
                  >
                    {s.pendingOrderCount}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Percent,
  IndianRupee,
  RefreshCw,
  Save,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface FeeTier {
  minDistanceKm: number;
  maxDistanceKm: number;
  fee: number;
}

export default function AdminDeliveryFeesPage() {
  const [tiers, setTiers] = useState<FeeTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier1Fee, setTier1Fee] = useState<number>(0);
  const [tier2Fee, setTier2Fee] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  useEffect(() => {
    fetchFees();
  }, []);

  async function fetchFees() {
    try {
      const res = await fetch('/api/admin/delivery-fees');
      if (res.ok) {
        const data = await res.json();
        if (data.tiers && Array.isArray(data.tiers)) {
          setTiers(data.tiers);
          if (data.tiers[0]) setTier1Fee(data.tiers[0].fee);
          if (data.tiers[1]) setTier2Fee(data.tiers[1].fee);
        }
      }
    } catch (err) {
      console.warn('Failed to load delivery fee tiers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tier1Fee < 0 || tier2Fee < 0) {
      setStatusMessage({ text: 'Delivery fees cannot be negative.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = [
      { minDistanceKm: 0.0, maxDistanceKm: 10.0, fee: Number(tier1Fee) },
      { minDistanceKm: 10.0, maxDistanceKm: 15.0, fee: Number(tier2Fee) },
    ];

    try {
      const res = await fetch('/api/admin/delivery-fees', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers: payload }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to update fee rules.', isError: true });
      } else {
        setStatusMessage({ text: 'Delivery fee tiers updated successfully!', isError: false });
        fetchFees();
      }
    } catch {
      setStatusMessage({ text: 'Network error updating fee tiers.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-bold">Loading delivery fee rules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Delivery Fee Distance Tiers
          </h1>
          <button
            onClick={() => {
              setLoading(true);
              fetchFees();
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Enforce distance tiers with strict upper boundary inclusivity
        </p>

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
      </div>

      {/* Boundary Specification Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Boundary Specification Matrix
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
          <div className="p-3 bg-slate-50 font-bold text-slate-600 grid grid-cols-3">
            <span>Distance Range</span>
            <span>Policy Description</span>
            <span className="text-right">Active Delivery Fee</span>
          </div>

          <div className="p-3 grid grid-cols-3 items-center">
            <span className="font-mono font-bold text-slate-900">0.00 KM &ndash; 10.00 KM</span>
            <span className="text-slate-600">Free delivery promotion zone</span>
            <span className="text-right font-black text-emerald-600">₹{tier1Fee}</span>
          </div>

          <div className="p-3 grid grid-cols-3 items-center">
            <span className="font-mono font-bold text-slate-900">10.01 KM &ndash; 15.00 KM</span>
            <span className="text-slate-600">Extended radius distance surcharge</span>
            <span className="text-right font-black text-amber-700">₹{tier2Fee}</span>
          </div>

          <div className="p-3 grid grid-cols-3 items-center bg-rose-50/40">
            <span className="font-mono font-bold text-rose-900">&gt; 15.00 KM</span>
            <span className="text-rose-700 font-medium">Outside 12RUSH operating radius</span>
            <span className="text-right font-black text-rose-700">NOT SERVICEABLE</span>
          </div>
        </div>
      </div>

      {/* Editor Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="text-xs font-black text-slate-900 uppercase tracking-wider">
          Update Fee Tier Pricing
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Tier 1 (0 to 10 KM) Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={tier1Fee}
                onChange={(e) => setTier1Fee(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
              <p className="text-[10px] text-slate-400">Default: ₹0 (Free)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Tier 2 (&gt;10 to 15 KM) Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                value={tier2Fee}
                onChange={(e) => setTier2Fee(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
              <p className="text-[10px] text-slate-400">Default: ₹20</p>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#FFD000] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Update Fee Tiers'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

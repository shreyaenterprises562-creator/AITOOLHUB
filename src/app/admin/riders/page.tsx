'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bike, Phone, Power, CheckCircle2, AlertCircle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

interface AdminRiderRecord {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  isActive: boolean;
  currentDelivery: string | null;
  completedCount: number;
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<AdminRiderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRiders();
  }, []);

  async function fetchRiders() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/riders');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.riders)) {
          setRiders(data.riders);
        }
      }
    } catch (err) {
      console.warn('Failed to load riders for admin:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bike className="w-5 h-5 text-[#FFD000]" />
            <span>Delivery Partners (Riders)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time delivery partner roster, availability, and active fulfillment monitoring.
          </p>
        </div>

        <button
          onClick={fetchRiders}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Roster Cards */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-bold">Loading delivery fleet...</p>
        </div>
      ) : riders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
          <Bike className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">No delivery partners found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riders.map((r) => (
            <div
              key={r.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900 text-base">{r.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">ID: {r.id}</div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                    r.isOnline
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      r.isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{r.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle</span>
                  <span className="font-semibold text-slate-800">{r.vehicleType}</span>
                  <div className="text-[11px] font-mono text-slate-500">{r.vehicleNumber}</div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact</span>
                  <span className="font-semibold text-slate-800">+91 {r.phone}</span>
                  <div className="text-[11px] text-slate-500 truncate">{r.email || 'No email'}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-500">Current Job: </span>
                  {r.currentDelivery ? (
                    <span className="font-bold text-amber-600">#{r.currentDelivery}</span>
                  ) : (
                    <span className="text-slate-400 italic">None (Idle)</span>
                  )}
                </div>

                <div className="font-bold text-slate-900">
                  {r.completedCount} Deliveries Completed
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

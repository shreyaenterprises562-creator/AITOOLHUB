'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Save,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

interface ServiceAreaConfig {
  name: string;
  city: string;
  state: string;
  centerLatitude: number;
  centerLongitude: number;
  radiusKm: number;
  isActive: boolean;
}

export default function AdminServiceAreaPage() {
  const [config, setConfig] = useState<ServiceAreaConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState<number>(22.3039);
  const [lng, setLng] = useState<number>(70.8022);
  const [radius, setRadius] = useState<number>(15.0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  useEffect(() => {
    fetchServiceArea();
  }, []);

  async function fetchServiceArea() {
    try {
      const res = await fetch('/api/admin/service-area');
      if (res.ok) {
        const data = await res.json();
        if (data.serviceArea) {
          setConfig(data.serviceArea);
          setName(data.serviceArea.name);
          setCity(data.serviceArea.city);
          setState(data.serviceArea.state);
          setLat(data.serviceArea.centerLatitude);
          setLng(data.serviceArea.centerLongitude);
          setRadius(data.serviceArea.radiusKm);
        }
      }
    } catch (err) {
      console.warn('Failed to load service area:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (lat < -90 || lat > 90) {
      setStatusMessage({ text: 'Center latitude must be between -90 and 90.', isError: true });
      return;
    }

    if (lng < -180 || lng > 180) {
      setStatusMessage({ text: 'Center longitude must be between -180 and 180.', isError: true });
      return;
    }

    if (radius <= 0 || radius > 50) {
      setStatusMessage({ text: 'Service radius must be a positive number up to 50 KM.', isError: true });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/service-area', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          city: city.trim(),
          state: state.trim(),
          centerLatitude: Number(lat),
          centerLongitude: Number(lng),
          radiusKm: Number(radius),
          isActive: true,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to update service area.', isError: true });
      } else {
        setStatusMessage({ text: 'Service area updated successfully and synced with platform!', isError: false });
        fetchServiceArea();
      }
    } catch {
      setStatusMessage({ text: 'Network error updating service area.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-bold">Loading service area configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Service Area &amp; Geo-Hub Governance
          </h1>
          <button
            onClick={() => {
              setLoading(true);
              fetchServiceArea();
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Authoritative dispatch boundary &bull; Governs checkout serviceability and delivery distance calculation
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

      {/* Policy Card */}
      <div className="bg-amber-500/10 border border-amber-300 rounded-2xl p-4 space-y-2 text-xs text-amber-950">
        <div className="font-bold flex items-center gap-1.5 text-amber-900">
          <Navigation className="w-4 h-4 text-amber-700" />
          <span>Active Boundary &amp; Fee Policy</span>
        </div>
        <p className="leading-relaxed">
          Customer delivery coordinates are evaluated relative to the Hub coordinates below via server-side Haversine calculation:
        </p>
        <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 font-medium pl-1">
          <li><strong>0.00 KM to 10.00 KM:</strong> ₹0 FREE DELIVERY</li>
          <li><strong>10.01 KM to 15.00 KM:</strong> ₹20 DELIVERY FEE</li>
          <li><strong>Greater than 15.00 KM:</strong> Outside Service Area (Unserviceable / Rejected)</li>
        </ul>
      </div>

      {/* Editor Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Hub Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Center Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Center Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Service Radius (KM)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#FFD000] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Hub Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

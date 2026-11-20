'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Clock,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Form states
  const [timeoutMinutes, setTimeoutMinutes] = useState('5');
  const [targetDelivery, setTargetDelivery] = useState('10');
  const [supportPhone, setSupportPhone] = useState('+91 98765 43210');
  const [supportEmail, setSupportEmail] = useState('support@cleanrush.local');
  const [defaultCity, setDefaultCity] = useState('Rajkot');

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          if (data.settings.orderAcceptanceTimeoutMinutes) {
            setTimeoutMinutes(data.settings.orderAcceptanceTimeoutMinutes);
          }
          if (data.settings.targetDeliveryMinutes) {
            setTargetDelivery(data.settings.targetDeliveryMinutes);
          }
          if (data.settings.supportPhone) {
            setSupportPhone(data.settings.supportPhone);
          }
          if (data.settings.supportEmail) {
            setSupportEmail(data.settings.supportEmail);
          }
          if (data.settings.defaultCity) {
            setDefaultCity(data.settings.defaultCity);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSetting(key: string, value: string) {
    setSavingKey(key);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to update setting.', isError: true });
      } else {
        setStatusMessage({ text: `Setting "${key}" updated successfully!`, isError: false });
        fetchSettings();
      }
    } catch {
      setStatusMessage({ text: 'Network error updating setting.', isError: true });
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-[#FFD000] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-bold">Loading platform settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Platform Operational Settings
          </h1>
          <button
            onClick={() => {
              setLoading(true);
              fetchSettings();
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Governs SLA constraints, customer support channels &amp; business defaults
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

      {/* Security Privacy Notice */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          Zero-Secret Policy: Environment credentials, JWT secrets, database connection strings, and SMS OTP tokens are strictly isolated from the UI.
        </span>
      </div>

      {/* Settings Grid */}
      <div className="space-y-4">
        {/* Setting 1: Seller Acceptance SLA */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Seller Acceptance Timeout (Minutes)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Incoming customer orders must be accepted by the assigned seller within this window (Default: 5 min).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="60"
              value={timeoutMinutes}
              onChange={(e) => setTimeoutMinutes(e.target.value)}
              className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
            />
            <button
              onClick={() => handleSaveSetting('orderAcceptanceTimeoutMinutes', timeoutMinutes)}
              disabled={savingKey === 'orderAcceptanceTimeoutMinutes'}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Save
            </button>
          </div>
        </div>

        {/* Setting 2: Target Delivery SLA */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Target Delivery SLA Target (Minutes)</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Target hyper-local fulfillment time displayed across branding (Default: 10 min).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min="5"
              max="60"
              value={targetDelivery}
              onChange={(e) => setTargetDelivery(e.target.value)}
              className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
            />
            <button
              onClick={() => handleSaveSetting('targetDeliveryMinutes', targetDelivery)}
              disabled={savingKey === 'targetDeliveryMinutes'}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Save
            </button>
          </div>
        </div>

        {/* Setting 3: Support Phone Hotline */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>Support Hotline Phone</span>
            </div>
            <p className="text-[11px] text-slate-500">Customer care number displayed on storefront &amp; order invoices.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-44 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
            />
            <button
              onClick={() => handleSaveSetting('supportPhone', supportPhone)}
              disabled={savingKey === 'supportPhone'}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Save
            </button>
          </div>
        </div>

        {/* Setting 4: Escalation Email */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Mail className="w-4 h-4 text-purple-500" />
              <span>Escalation Support Email</span>
            </div>
            <p className="text-[11px] text-slate-500">Official escalation email for ticket routing.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-52 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FFD000]"
            />
            <button
              onClick={() => handleSaveSetting('supportEmail', supportEmail)}
              disabled={savingKey === 'supportEmail'}
              className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              Save
            </button>
          </div>
        </div>

        {/* Setting 5: Payment Policy */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <span>Allowed Payment Policy</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Payment method active across checkout &amp; order fulfillment.
            </p>
          </div>

          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black uppercase">
            Cash On Delivery (COD) Only
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Bike, ShieldCheck, ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { useRider } from '../../../context/RiderContext';

export default function RiderLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useRider();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if already logged in as delivery partner
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/rider/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your mobile number or email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await login(identifier.trim(), password);
    if (!res.success) {
      setErrorMessage(res.error || 'Invalid rider credentials. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push('/rider/dashboard');
  }

  // Quick 1-click demo fill helper for testing
  function fillDemoRider(phone: string, pass: string) {
    setIdentifier(phone);
    setPassword(pass);
    setErrorMessage('');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8">
      {/* Container */}
      <div className="max-w-md w-full space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-[#FFD000]/40 shadow-xl mx-auto">
            <Image
              src="/logo.png"
              alt="12RUSH Logo"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <span>12RUSH</span>
              <span className="text-xs px-2 py-0.5 rounded-md font-black bg-[#FFD000] text-slate-950 uppercase tracking-wider">
                RIDER
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Delivery Partner Fast Fulfillment Portal</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bike className="w-5 h-5 text-[#FFD000]" />
              <span>Delivery Partner Sign In</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage assigned orders and live quick deliveries.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Mobile Number or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9999900005"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#FFD000] focus:ring-1 focus:ring-[#FFD000] rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-[#FFD000] focus:ring-1 focus:ring-[#FFD000] rounded-xl px-3.5 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FFD000] hover:bg-amber-400 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Partner...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Rider</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Logins for Testing */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Fast 1-Click Demo Rider:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemoRider('9999900005', 'CleanRushDev@2026')}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-400/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400">
                  Vikram Singh
                </div>
                <div className="text-[10px] text-slate-400">Electric Scooter</div>
                <div className="text-[9px] font-mono text-emerald-400 mt-0.5">Online</div>
              </button>

              <button
                type="button"
                onClick={() => fillDemoRider('9999900006', 'CleanRushDev@2026')}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-400/50 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400">
                  Suresh Dave
                </div>
                <div className="text-[10px] text-slate-400">Motorcycle</div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5">Offline</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p>
            Customer wanting to order?{' '}
            <Link href="/" className="text-[#FFD000] hover:underline font-semibold">
              Go to 12RUSH Storefront
            </Link>
          </p>
          <p>
            Registered Seller?{' '}
            <Link href="/seller/login" className="text-slate-300 hover:underline">
              Seller Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

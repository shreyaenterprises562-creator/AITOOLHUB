'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, AlertCircle, Sparkles, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter your administrator mobile number or email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid administrator credentials.');
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/dashboard');
    } catch {
      setErrorMessage('Network error occurred. Please check your connection.');
      setIsSubmitting(false);
    }
  }

  function fillDemoAdmin() {
    setIdentifier('9999900001');
    setPassword('CleanRushDev@2026');
    setErrorMessage('');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-[#FFD000]/40 shadow-lg mx-auto">
            <Image
              src="/assets/12rush-logo.png"
              alt="12RUSH"
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>12</span>
              <span className="text-[#E60028]">RUSH</span>
              <span className="text-xs uppercase font-black px-2 py-0.5 bg-[#FFD000] text-slate-950 rounded-md">
                Admin Control
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Platform Governance, Marketplace Oversight &amp; Operations
            </p>
          </div>
        </div>

        {/* Demo 1-Click Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFD000]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD000]" />
            <span>Instant Test Administrator Account:</span>
          </div>

          <button
            type="button"
            onClick={fillDemoAdmin}
            className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-700/60 transition-all group active:scale-95 flex items-center justify-between"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-[#FFD000]">
                System Administrator
              </div>
              <div className="text-[10px] text-slate-400">Mobile: 9999900001 &bull; admin@cleanrush.local</div>
            </div>
            <span className="text-[10px] uppercase font-black bg-[#FFD000] text-slate-950 px-2 py-0.5 rounded">
              Fill &amp; Test
            </span>
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrator Identifier (Mobile / Email)
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9999900001 or admin@cleanrush.local"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Administrator Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#FFD000] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 underline underline-offset-4">
            &larr; Back to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

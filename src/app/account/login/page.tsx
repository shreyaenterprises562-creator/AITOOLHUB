'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Phone, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, RefreshCw, User } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function UnifiedCustomerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || searchParams.get('redirect') || '/';

  const { sendOtp, verifyOtp, completeNameRegistration, resendPhoneOtp, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Screen steps: 'PHONE' | 'OTP' | 'NAME'
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'NAME'>('PHONE');

  // Phone Step State
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // OTP Step State (6-digit array)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState<number>(60);

  // Name Step State
  const [name, setName] = useState('');

  // UI status
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(returnUrl);
    }
  }, [isAuthenticated, isAuthLoading, router, returnUrl]);

  // Resend cooldown timer
  useEffect(() => {
    if (step !== 'OTP' || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phone.trim().replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    const result = await sendOtp(cleanPhone);
    setIsSubmitting(false);

    if (result.success && result.verificationId) {
      setVerificationId(result.verificationId);
      setIsExistingUser(!!result.isExistingUser);
      setDevOtp(result.devOtp || null);
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setStep('OTP');
      // Autofocus first OTP digit
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } else {
      setError(result.error || 'Failed to send verification code. Please try again.');
    }
  };

  // Step 2: Handle OTP input & paste
  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setError(null);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    setError(null);

    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyOtp(verificationId, fullOtp);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Incorrect OTP code. Please try again.');
      return;
    }

    if (result.needsName) {
      // New user requires name
      setStep('NAME');
    } else {
      // Existing user or account successfully authenticated!
      router.replace(returnUrl);
    }
  };

  // Step 2: Resend OTP
  const handleResend = async () => {
    if (cooldown > 0 || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    const result = await resendPhoneOtp(verificationId);
    setIsSubmitting(false);

    if (result.success) {
      setCooldown(60);
      setDevOtp(result.devOtp || null);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } else {
      setError(result.error || 'Failed to resend OTP.');
    }
  };

  // Step 3: Complete Name Registration (New Customer)
  const handleCompleteName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your name (minimum 2 characters).');
      return;
    }

    setIsSubmitting(true);
    const result = await completeNameRegistration(verificationId, name.trim());
    setIsSubmitting(false);

    if (result.success) {
      router.replace(returnUrl);
    } else {
      setError(result.error || 'Failed to activate account. Please try again.');
    }
  };

  const cleanPhoneDisplay = phone.trim().replace(/\D/g, '').slice(-10);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#FFD000] selection:text-black">
      {/* Top Back Nav */}
      <div className="max-w-md w-full mx-auto mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto">
        <div className="bg-white py-8 px-6 sm:px-8 border border-slate-200/90 rounded-3xl shadow-sm space-y-6">
          {/* 12RUSH LOGO HEADER */}
          <div className="text-center space-y-3">
            <Link href="/" className="inline-block relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-900/5 mx-auto">
              <Image
                src="/assets/12rush-logo.png"
                alt="12RUSH"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </Link>

            {step === 'PHONE' && (
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Welcome to 12<span className="text-[#E60028]">RUSH</span>
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Cleaning essentials &amp; groceries delivered fast
                </p>
              </div>
            )}

            {step === 'OTP' && (
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Verify Mobile
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  OTP sent to <span className="font-bold text-slate-800">+91 {cleanPhoneDisplay}</span>
                </p>
              </div>
            )}

            {step === 'NAME' && (
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  Almost there!
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  What should we call you?
                </p>
              </div>
            )}
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Dev Mode Simulated OTP Banner (Only visible in dev testing mode) */}
          {devOtp && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center justify-between">
                <span>SMS Test Simulator (Local Dev)</span>
                <span className="font-mono bg-amber-200/80 px-2 py-0.5 rounded font-black text-amber-950">
                  {devOtp}
                </span>
              </div>
              <p className="text-[10px] text-amber-800/80">
                Pasted automatically or click to fill code.
              </p>
              <button
                type="button"
                onClick={() => {
                  const digits = devOtp.split('').slice(0, 6);
                  setOtpDigits(digits);
                  setError(null);
                }}
                className="text-[11px] font-bold text-amber-900 underline block"
              >
                Autofill test code {devOtp}
              </button>
            </div>
          )}

          {/* SCREEN 1: ENTER MOBILE NUMBER */}
          {step === 'PHONE' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative flex rounded-2xl shadow-2xs">
                  <span className="inline-flex items-center px-4 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-100 text-slate-700 font-bold text-sm select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    autoFocus
                    placeholder="Enter 10-digit mobile"
                    value={phone}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(clean);
                      setError(null);
                    }}
                    maxLength={10}
                    className="block w-full flex-1 rounded-none rounded-r-2xl border border-slate-200 py-3.5 px-4 text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || phone.replace(/\D/g, '').length !== 10}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFD000] hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SCREEN 2: ENTER OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              {/* 6 Digit Inputs */}
              <div>
                <div className="flex items-center justify-between gap-2 on-paste" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all shadow-2xs"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Cooldown */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('PHONE');
                    setError(null);
                  }}
                  className="font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Edit number
                </button>

                <div>
                  {cooldown > 0 ? (
                    <span className="font-mono text-slate-500 font-bold">
                      Resend OTP in 00:{cooldown < 10 ? `0${cooldown}` : cooldown}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSubmitting}
                      className="font-black text-[#E60028] hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpDigits.join('').length !== 6}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFD000] hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SCREEN 3: ASK NAME (NEW CUSTOMER ONLY) */}
          {step === 'NAME' && (
            <form onSubmit={handleCompleteName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Aarav Mehta"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError(null);
                    }}
                    className="block w-full rounded-2xl border border-slate-200 py-3.5 pl-10 pr-4 text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FFD000] focus:border-transparent transition-all shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || name.trim().length < 2}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-950 bg-[#FFD000] hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Finish &amp; Start Shopping</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust Badges */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fast, passwordless login with mobile OTP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedCustomerAuthPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      }
    >
      <UnifiedCustomerAuthContent />
    </React.Suspense>
  );
}


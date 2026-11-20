import { NextRequest, NextResponse } from 'next/server';
import { findUserByPhone } from '../../../../../lib/auth-store';
import {
  generateCryptographicOtp,
  createPhoneOtpVerification,
} from '../../../../../lib/verification-store';
import { getOtpProvider } from '../../../../../services/otp/otp.service';

/**
 * POST /api/auth/otp/send
 * Initiates fast passwordless customer mobile verification.
 * Sends cryptographically secure 6-digit SMS OTP.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { phone } = body || {};

    // 1. Strict validation of 10-digit Indian Mobile Number
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 2. Check if this mobile number belongs to an existing customer
    const existingUser = await findUserByPhone(cleanPhone);
    const isExistingUser = !!(existingUser && existingUser.role === 'CUSTOMER');

    // 3. Generate cryptographically secure 6-digit OTP
    const phoneOtp = generateCryptographicOtp();

    // 4. Dispatch SMS OTP via pluggable SMS Provider (Fast2SMS / Twilio / Webhook / Dev Simulator)
    const otpProvider = getOtpProvider();
    const smsResult = await otpProvider.sendSmsOtp(cleanPhone, phoneOtp);

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || 'SMS verification service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // 5. Store pending verification record with hashed OTP
    const verification = createPhoneOtpVerification({
      phone: cleanPhone,
      isExistingUser,
      existingUserId: existingUser?.id,
      phoneOtp,
    });

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      verificationId: verification.verificationId,
      phone: cleanPhone,
      isExistingUser,
      expiresAt: verification.expiresAt,
      resendCooldownSeconds: verification.resendCooldownSeconds,
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.OTP_DEV_MODE === 'true' &&
      verification.devOtp
        ? { devOtp: verification.devOtp }
        : {}),
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to send OTP.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

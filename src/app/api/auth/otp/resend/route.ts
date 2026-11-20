import { NextRequest, NextResponse } from 'next/server';
import {
  generateCryptographicOtp,
  getPendingPhoneOtp,
  resendPhoneOtpCode,
} from '../../../../../lib/verification-store';
import { getOtpProvider } from '../../../../../services/otp/otp.service';

/**
 * POST /api/auth/otp/resend
 * Resends SMS OTP to customer mobile number.
 * Strictly enforces 60-second cooldown period.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { verificationId } = body || {};

    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing verification session.' },
        { status: 400 }
      );
    }

    const pending = getPendingPhoneOtp(verificationId);
    if (!pending) {
      return NextResponse.json(
        { error: 'Verification session expired. Please start again.' },
        { status: 400 }
      );
    }

    // Generate fresh OTP
    const newOtp = generateCryptographicOtp();

    // Dispatch via real SMS provider
    const otpProvider = getOtpProvider();
    const smsResult = await otpProvider.sendSmsOtp(pending.phone, newOtp);

    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || 'Failed to dispatch SMS. Please try again.' },
        { status: 503 }
      );
    }

    // Update store (enforces 60-second cooldown)
    const result = resendPhoneOtpCode(verificationId, newOtp);
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Please wait before requesting a new OTP.',
          remainingSeconds: result.remainingSeconds,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A new OTP has been sent to +91 ${pending.phone}`,
      remainingSeconds: result.remainingSeconds,
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.OTP_DEV_MODE === 'true' &&
      result.devOtp
        ? { devOtp: result.devOtp }
        : {}),
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to resend OTP.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

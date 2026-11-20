import { NextRequest, NextResponse } from 'next/server';
import {
  getPendingRegistration,
  generateCryptographicOtp,
  updateResendOtps,
} from '../../../../../lib/verification-store';
import { getOtpProvider } from '../../../../../services/otp/otp.service';
import { getEmailProvider } from '../../../../../services/email/email.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { verificationId } = body || {};

    if (!verificationId || typeof verificationId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid verification session.' },
        { status: 400 }
      );
    }

    const pending = getPendingRegistration(verificationId);
    if (!pending) {
      return NextResponse.json(
        { error: 'Registration session not found or expired. Please start again.' },
        { status: 400 }
      );
    }

    // Generate fresh cryptographic OTPs
    const newPhoneOtp = generateCryptographicOtp();
    const newEmailOtp = generateCryptographicOtp();

    // Enforce 60-second cooldown and update hashes
    const updateResult = updateResendOtps(verificationId, newPhoneOtp, newEmailOtp);
    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error, remainingSeconds: updateResult.remainingSeconds },
        { status: 429 }
      );
    }

    // Dispatch fresh verification codes
    const otpProvider = getOtpProvider();
    const emailProvider = getEmailProvider();

    const [smsRes, emailRes] = await Promise.all([
      otpProvider.sendSmsOtp(pending.phone, newPhoneOtp),
      emailProvider.sendVerificationCode(pending.email, newEmailOtp, pending.fullName),
    ]);

    if (!smsRes.success || !emailRes.success) {
      return NextResponse.json(
        { error: 'Verification service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to resend verification code. Please try again.' },
      { status: 500 }
    );
  }
}

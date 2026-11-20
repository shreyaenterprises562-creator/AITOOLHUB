import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '../../../../../lib/auth';
import { findUserByPhone, findUserByEmail } from '../../../../../lib/auth-store';
import {
  generateCryptographicOtp,
  createPendingRegistration,
} from '../../../../../lib/verification-store';
import { getOtpProvider } from '../../../../../services/otp/otp.service';
import { getEmailProvider } from '../../../../../services/email/email.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, email, password, confirmPassword } = body || {};

    // 1. Validate Full Name
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid full name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    // 2. Validate Indian Mobile Number (Exactly 10 digits)
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 3. Validate Email (Mandatory for real verification)
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 }
      );
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 }
      );
    }

    // 4. Validate Password & Confirmation
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match. Please re-enter.' },
        { status: 400 }
      );
    }

    // 5. Check duplicate mobile number
    const existingPhoneUser = await findUserByPhone(cleanPhone);
    if (existingPhoneUser) {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists.' },
        { status: 409 }
      );
    }

    // 6. Check duplicate email address
    const existingEmailUser = await findUserByEmail(cleanEmail);
    if (existingEmailUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // 7. Generate cryptographically secure random 6-digit OTPs
    const phoneOtp = generateCryptographicOtp();
    const emailOtp = generateCryptographicOtp();

    // 8. Dispatch verification codes via pluggable providers
    const otpProvider = getOtpProvider();
    const emailProvider = getEmailProvider();

    const [smsResult, emailResult] = await Promise.all([
      otpProvider.sendSmsOtp(cleanPhone, phoneOtp),
      emailProvider.sendVerificationCode(cleanEmail, emailOtp, fullName.trim()),
    ]);

    // If real providers are not configured or dispatch fails
    if (!smsResult.success) {
      return NextResponse.json(
        { error: smsResult.error || 'Verification service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Verification service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // 9. Hash password securely with bcrypt
    const passwordHash = await hashPassword(password);

    // 10. Store pending verification record with 5-minute expiry & rate limits
    const { verificationId } = createPendingRegistration({
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash,
      phoneOtp,
      emailOtp,
    });

    // 11. Return verification requirement (NO authenticated session created!)
    return NextResponse.json({
      verificationRequired: true,
      verificationId,
      phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
      email: cleanEmail,
      message: 'Verification codes sent to your mobile number and email.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration initialization failed.';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

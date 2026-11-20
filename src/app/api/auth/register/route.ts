import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '../../../../lib/auth';
import { findUserByPhone, findUserByEmail } from '../../../../lib/auth-store';
import {
  generateCryptographicOtp,
  createPendingRegistration,
} from '../../../../lib/verification-store';
import { getOtpProvider } from '../../../../services/otp/otp.service';
import { getEmailProvider } from '../../../../services/email/email.service';

/**
 * Registration Entrypoint: Enforces Mobile + Email Verification Requirement
 * NEVER creates an active user account or session without OTP verification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, fullName, phone, password, confirmPassword, email } = body || {};

    const userFullName = (fullName || name || '').trim();
    if (!userFullName || userFullName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid full name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match. Please re-enter.' },
        { status: 400 }
      );
    }

    // Check duplicate mobile
    const existingPhone = await findUserByPhone(cleanPhone);
    if (existingPhone) {
      return NextResponse.json(
        { error: 'An account with this mobile number already exists.' },
        { status: 409 }
      );
    }

    // Check duplicate email
    const existingEmail = await findUserByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Generate cryptographic OTPs
    const phoneOtp = generateCryptographicOtp();
    const emailOtp = generateCryptographicOtp();

    // Dispatch via real/configured providers
    const otpProvider = getOtpProvider();
    const emailProvider = getEmailProvider();

    const [smsRes, emailRes] = await Promise.all([
      otpProvider.sendSmsOtp(cleanPhone, phoneOtp),
      emailProvider.sendVerificationCode(cleanEmail, emailOtp, userFullName),
    ]);

    if (!smsRes.success || !emailRes.success) {
      return NextResponse.json(
        { error: 'Verification service is temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Save pending registration record
    const { verificationId } = createPendingRegistration({
      fullName: userFullName,
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash,
      phoneOtp,
      emailOtp,
    });

    // Verification required: Account is NOT active yet.
    return NextResponse.json(
      {
        verificationRequired: true,
        verificationId,
        phone: `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
        email: cleanEmail,
        message: 'Verification codes sent to your mobile number and email. Account will be created once verified.',
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Registration failed.';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

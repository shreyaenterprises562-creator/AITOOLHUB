import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateRiderCredentials,
  createRiderSessionToken,
  RIDER_AUTH_COOKIE_NAME,
  RIDER_SESSION_DURATION_SECONDS,
} from '../../../../../lib/rider-auth';

/**
 * POST /api/rider/auth/login
 * Dedicated Rider login endpoint.
 * Authenticates phone/email + password, checks role === 'DELIVERY_PARTNER',
 * and issues secure HTTP-only session cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const { identifier, password } = body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Mobile number or email is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    const rider = await authenticateRiderCredentials(identifier, password);
    if (!rider) {
      return NextResponse.json(
        { error: 'Invalid delivery partner credentials. Please check your mobile/email and password.' },
        { status: 401 }
      );
    }

    // Generate signed tamper-proof session token
    const token = createRiderSessionToken({
      riderId: rider.riderId,
      userId: rider.userId,
      name: rider.name,
      phone: rider.phone,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful. Welcome back, ' + rider.name,
      rider: {
        riderId: rider.riderId,
        name: rider.name,
        phone: rider.phone,
        email: rider.email,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        isOnline: rider.isOnline,
        role: rider.role,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set(RIDER_AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: RIDER_SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'An unexpected error occurred during login.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

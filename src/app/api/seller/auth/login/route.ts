import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateSellerCredentials,
  createSellerSessionToken,
  SELLER_AUTH_COOKIE_NAME,
  SELLER_SESSION_DURATION_SECONDS,
} from '../../../../../lib/seller-auth';

/**
 * POST /api/seller/auth/login
 * Dedicated Seller login endpoint.
 * Authenticates phone/email + password, checks role === 'SELLER', and issues HTTP-only session cookie.
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

    const seller = await authenticateSellerCredentials(identifier, password);
    if (!seller) {
      return NextResponse.json(
        { error: 'Invalid seller credentials. Please check your mobile/email and password.' },
        { status: 401 }
      );
    }

    const token = createSellerSessionToken({
      userId: seller.userId,
      sellerId: seller.sellerId,
      shopName: seller.shopName,
      slug: seller.slug,
      phone: seller.phone,
    });

    const response = NextResponse.json({
      success: true,
      seller: {
        sellerId: seller.sellerId,
        shopName: seller.shopName,
        name: seller.name,
        phone: seller.phone,
        email: seller.email,
        slug: seller.slug,
        shopAddress: seller.shopAddress,
      },
    });

    response.cookies.set(SELLER_AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SELLER_SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'An error occurred during seller login.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

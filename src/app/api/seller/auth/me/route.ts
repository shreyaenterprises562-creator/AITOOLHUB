import { NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../../lib/seller-auth';

/**
 * GET /api/seller/auth/me
 * Retrieves current authenticated seller profile.
 */
export async function GET() {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ error: 'Unauthorized. Seller login required.' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    seller: {
      sellerId: seller.sellerId,
      shopName: seller.shopName,
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      slug: seller.slug,
      shopAddress: seller.shopAddress,
      approvalStatus: seller.approvalStatus,
    },
  });
}

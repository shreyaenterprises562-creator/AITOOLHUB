import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../lib/seller-auth';
import { getSellerProducts } from '../../../../lib/seller-store';

/**
 * GET /api/seller/products
 * Retrieves catalog products strictly mapped to the authenticated seller.
 */
export async function GET(req: NextRequest) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ error: 'Unauthorized. Seller login required.' }, { status: 401 });
  }

  try {
    const products = await getSellerProducts(seller.sellerId);
    return NextResponse.json({
      success: true,
      sellerId: seller.sellerId,
      shopName: seller.shopName,
      products,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch seller products.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

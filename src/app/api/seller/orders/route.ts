import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../lib/seller-auth';
import { getSellerOrders } from '../../../../lib/seller-store';

/**
 * GET /api/seller/orders
 * Retrieves orders strictly belonging to the authenticated seller.
 * Supports status query filtering: ?status=PLACED|CONFIRMED|PACKING|READY_FOR_PICKUP|ALL
 */
export async function GET(req: NextRequest) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ error: 'Unauthorized. Seller login required.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status') || 'ALL';

  try {
    const orders = await getSellerOrders(seller.sellerId, statusFilter);
    return NextResponse.json({
      success: true,
      sellerId: seller.sellerId,
      orders,
      totalCount: orders.length,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch seller orders.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

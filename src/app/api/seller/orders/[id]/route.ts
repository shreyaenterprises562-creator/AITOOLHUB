import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../../lib/seller-auth';
import { getSellerOrderById } from '../../../../../lib/seller-store';

/**
 * GET /api/seller/orders/[id]
 * Retrieves single order details strictly verifying seller ownership.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const seller = await getCurrentSeller();
  if (!seller) {
    return NextResponse.json({ error: 'Unauthorized. Seller login required.' }, { status: 401 });
  }

  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  try {
    const order = await getSellerOrderById(seller.sellerId, orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found for this seller.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch order details.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

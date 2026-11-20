import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../../../lib/seller-auth';
import { advanceSellerOrderStatus } from '../../../../../../lib/seller-store';

/**
 * POST /api/seller/orders/[id]/status
 * Advances order status in the fulfillment pipeline:
 * - CONFIRMED -> PACKING (Start preparing/packing)
 * - PACKING -> READY_FOR_PICKUP (Ready for rider pickup)
 * Enforces strict state machine transition validation and seller isolation.
 */
export async function POST(
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
    const body = await req.json().catch(() => null);
    if (!body || !body.status) {
      return NextResponse.json(
        { error: 'Target status (PACKING or READY_FOR_PICKUP) is required.' },
        { status: 400 }
      );
    }

    const targetStatus = body.status;
    if (targetStatus !== 'PACKING' && targetStatus !== 'READY_FOR_PICKUP') {
      return NextResponse.json(
        { error: 'Invalid target status. Allowed transitions: PACKING, READY_FOR_PICKUP.' },
        { status: 400 }
      );
    }

    const result = await advanceSellerOrderStatus(seller.sellerId, orderId, targetStatus);
    return NextResponse.json({
      success: true,
      message: `Order status advanced to ${targetStatus}.`,
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update order status.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../../../lib/seller-auth';
import { acceptSellerOrder } from '../../../../../../lib/seller-store';

/**
 * POST /api/seller/orders/[id]/accept
 * Accepts an incoming pending order (PLACED -> CONFIRMED).
 * Enforces server-side 5-minute acceptance deadline (platformConfig.orders.sellerAcceptanceTimeoutMinutes = 5).
 * Enforces strict seller isolation.
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
    const result = await acceptSellerOrder(seller.sellerId, orderId);
    return NextResponse.json({
      success: true,
      message: 'Order accepted successfully. Ready to start packing.',
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to accept order.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

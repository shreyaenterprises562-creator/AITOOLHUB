import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSeller } from '../../../../../../lib/seller-auth';
import { rejectSellerOrder } from '../../../../../../lib/seller-store';

/**
 * POST /api/seller/orders/[id]/reject
 * Rejects a pending order (PLACED -> CANCELLED).
 * Automatically restocks reserved product quantities.
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
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || 'Rejected by seller';

    const result = await rejectSellerOrder(seller.sellerId, orderId, reason);
    return NextResponse.json({
      success: true,
      message: 'Order rejected and inventory restocked successfully.',
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to reject order.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

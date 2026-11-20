import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../../../lib/rider-auth';
import { markOrderPickedUp } from '../../../../../../lib/rider-store';

/**
 * POST /api/rider/deliveries/[id]/pickup
 * Marks an assigned order as PICKED_UP from store.
 * Strict status transition: READY_FOR_PICKUP -> PICKED_UP.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rider = await getCurrentRider();
  if (!rider) {
    return NextResponse.json({ error: 'Unauthorized. Rider login required.' }, { status: 401 });
  }

  const { id: orderId } = await params;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
  }

  try {
    const result = await markOrderPickedUp(rider.riderId, orderId);
    return NextResponse.json({
      success: true,
      message: 'Order marked as Picked Up from store.',
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to mark order as picked up.';
    const status = msg.includes('Unauthorized') ? 403 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}

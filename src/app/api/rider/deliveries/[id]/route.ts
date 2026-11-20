import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../../lib/rider-auth';
import { getRiderDeliveryById } from '../../../../../lib/rider-store';

/**
 * GET /api/rider/deliveries/[id]
 * Retrieves details of an assigned delivery.
 * Enforces strict RIDER ISOLATION: Rider can only view deliveries assigned to them.
 */
export async function GET(
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
    const delivery = await getRiderDeliveryById(rider.riderId, orderId);
    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found or not assigned to you.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      delivery,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch delivery details.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

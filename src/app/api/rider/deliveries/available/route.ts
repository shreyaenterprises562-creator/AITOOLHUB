import { NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../../lib/rider-auth';
import { getAvailablePickupOrders } from '../../../../../lib/rider-store';

/**
 * GET /api/rider/deliveries/available
 * Retrieves eligible orders ready for pickup.
 * Enforces:
 * 1. Rider is authenticated and online.
 * 2. Order status === 'READY_FOR_PICKUP'.
 * 3. Order is not assigned to any rider.
 * 4. Order is not cancelled.
 */
export async function GET() {
  const rider = await getCurrentRider();
  if (!rider) {
    return NextResponse.json({ error: 'Unauthorized. Rider login required.' }, { status: 401 });
  }

  try {
    const orders = await getAvailablePickupOrders(rider.riderId);
    return NextResponse.json({
      success: true,
      orders,
      isOnline: rider.isOnline,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch available deliveries.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

import { NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../lib/rider-auth';
import { getRiderDashboardStats } from '../../../../lib/rider-store';

/**
 * GET /api/rider/dashboard
 * Retrieves real-time dashboard data for the authenticated delivery partner:
 * - Online / Offline status
 * - Current active delivery
 * - Available pickups count
 * - Today's completed delivery count
 * - Today's earnings
 */
export async function GET() {
  const rider = await getCurrentRider();
  if (!rider) {
    return NextResponse.json({ error: 'Unauthorized. Rider login required.' }, { status: 401 });
  }

  try {
    const stats = await getRiderDashboardStats(rider.riderId);
    return NextResponse.json({
      success: true,
      stats,
      rider: {
        riderId: rider.riderId,
        name: rider.name,
        phone: rider.phone,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
      },
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to load dashboard metrics.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

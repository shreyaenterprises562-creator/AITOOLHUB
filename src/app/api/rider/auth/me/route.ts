import { NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../../lib/rider-auth';

/**
 * GET /api/rider/auth/me
 * Retrieves the currently authenticated delivery partner profile.
 */
export async function GET() {
  const rider = await getCurrentRider();
  if (!rider) {
    return NextResponse.json({ error: 'Unauthorized. Rider login required.' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    rider: {
      riderId: rider.riderId,
      name: rider.name,
      phone: rider.phone,
      email: rider.email,
      vehicleType: rider.vehicleType,
      vehicleNumber: rider.vehicleNumber,
      isOnline: rider.isOnline,
      role: rider.role,
    },
  });
}

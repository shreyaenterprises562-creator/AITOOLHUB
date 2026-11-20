import { NextRequest, NextResponse } from 'next/server';
import { getCurrentRider } from '../../../../lib/rider-auth';
import { setRiderOnlineStatus } from '../../../../lib/rider-store';

/**
 * PATCH /api/rider/availability
 * Toggles delivery partner availability (online / offline).
 * Enforces authenticated rider identity from server session.
 */
export async function PATCH(req: NextRequest) {
  const rider = await getCurrentRider();
  if (!rider) {
    return NextResponse.json({ error: 'Unauthorized. Rider login required.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.isOnline !== 'boolean') {
      return NextResponse.json(
        { error: 'Valid isOnline boolean field is required.' },
        { status: 400 }
      );
    }

    const result = await setRiderOnlineStatus(rider.riderId, body.isOnline);
    return NextResponse.json({
      success: true,
      message: `You are now ${body.isOnline ? 'ONLINE' : 'OFFLINE'}.`,
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update availability.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

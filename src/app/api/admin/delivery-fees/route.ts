import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAdminDeliveryFeeRules, updateAdminDeliveryFeeRules } from '../../../../lib/admin-store';

/**
 * GET /api/admin/delivery-fees
 * Returns configured delivery fee distance tiers.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const tiers = await getAdminDeliveryFeeRules();
    return NextResponse.json({
      success: true,
      tiers,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch delivery fee rules.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/admin/delivery-fees
 * Updates delivery fee distance tiers.
 * Validates ranges and boundary conditions.
 */
export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.tiers)) {
      return NextResponse.json(
        { error: 'An array of tiers is required: { tiers: [{ minDistanceKm, maxDistanceKm, fee }] }' },
        { status: 400 }
      );
    }

    const updated = await updateAdminDeliveryFeeRules(body.tiers);
    return NextResponse.json({
      success: true,
      message: 'Delivery fee tiers updated successfully.',
      tiers: updated,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update delivery fee rules.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

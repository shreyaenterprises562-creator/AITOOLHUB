import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAdminServiceArea, updateAdminServiceArea } from '../../../../lib/admin-store';

/**
 * GET /api/admin/service-area
 * Returns current active service area configuration.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const serviceArea = await getAdminServiceArea();
    return NextResponse.json({
      success: true,
      serviceArea,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch service area.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PUT /api/admin/service-area
 * Updates the active service area.
 * Validates: valid latitude (-90 to 90), valid longitude (-180 to 180), positive radius.
 */
export async function PUT(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const { centerLatitude, centerLongitude, radiusKm, name, city, state } = body;

    const updated = await updateAdminServiceArea({
      name,
      city,
      state,
      centerLatitude: Number(centerLatitude),
      centerLongitude: Number(centerLongitude),
      radiusKm: Number(radiusKm),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Service area updated successfully.',
      serviceArea: updated,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update service area.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

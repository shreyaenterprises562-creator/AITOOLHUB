import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../../../lib/admin-auth';
import { toggleSellerActive } from '../../../../../../lib/admin-store';

/**
 * PATCH /api/admin/sellers/[id]/status
 * Activates or deactivates a seller account safely.
 * DOES NOT DELETE seller products, inventory, historical orders, or history!
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  const { id: sellerId } = await params;
  if (!sellerId) {
    return NextResponse.json({ error: 'Seller ID is required.' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'isActive boolean property is required.' },
        { status: 400 }
      );
    }

    const result = await toggleSellerActive(sellerId, body.isActive);
    return NextResponse.json({
      success: true,
      message: `Seller status updated to ${body.isActive ? 'Active' : 'Inactive'}.`,
      ...result,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update seller status.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

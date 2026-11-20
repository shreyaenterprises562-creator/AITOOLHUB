import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAllCustomers } from '../../../../lib/admin-store';

/**
 * GET /api/admin/customers
 * Returns operational list of customers.
 * STRICT SECURITY: Omits passwords, OTPs, and authentication secrets!
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const customers = await getAllCustomers();
    return NextResponse.json({
      success: true,
      customers,
      totalCount: customers.length,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch customers.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

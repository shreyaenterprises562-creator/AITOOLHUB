import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAdminPlatformSettings, updateAdminPlatformSetting } from '../../../../lib/admin-store';

/**
 * GET /api/admin/settings
 * Returns operational platform configuration.
 * STRICT: Does not expose secrets, credentials, or keys.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const settings = await getAdminPlatformSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch platform settings.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/settings
 * Updates an operational platform setting.
 */
export async function PATCH(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.key || typeof body.key !== 'string' || body.value === undefined) {
      return NextResponse.json(
        { error: 'key and value are required properties.' },
        { status: 400 }
      );
    }

    const updated = await updateAdminPlatformSetting(body.key, String(body.value));
    return NextResponse.json({
      success: true,
      message: `Setting ${body.key} updated successfully.`,
      setting: updated,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update setting.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

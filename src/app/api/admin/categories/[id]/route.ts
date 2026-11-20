import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../../lib/admin-auth';
import { updateCategory } from '../../../../../lib/admin-store';

/**
 * PATCH /api/admin/categories/[id]
 * Updates category details or active status.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  const { id: categoryId } = await params;
  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required.' }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid update payload.' }, { status: 400 });
    }

    const updated = await updateCategory(categoryId, body);
    return NextResponse.json({
      success: true,
      message: 'Category updated successfully.',
      category: updated,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to update category.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

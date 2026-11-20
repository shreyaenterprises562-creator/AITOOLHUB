import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '../../../../lib/admin-auth';
import { getAllCategories, createCategory } from '../../../../lib/admin-store';

/**
 * GET /api/admin/categories
 * Returns dynamic categories with parent/children and product counts.
 */
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const categories = await getAllCategories();
    return NextResponse.json({
      success: true,
      categories,
      totalCount: categories.length,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to fetch categories.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/categories
 * Creates a new category.
 */
export async function POST(req: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required.' }, { status: 400 });
    }

    const slug =
      body.slug && typeof body.slug === 'string' && body.slug.trim()
        ? body.slug.trim()
        : body.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    const created = await createCategory({
      name: body.name.trim(),
      slug,
      description: body.description,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : 10,
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      category: created,
    });
  } catch (err: unknown) {
    const msg = (err as Error)?.message || 'Failed to create category.';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

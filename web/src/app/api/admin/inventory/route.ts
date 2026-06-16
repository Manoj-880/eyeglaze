import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

const ADMIN_ROLES = ['admin', 'store_manager', 'support_agent'];

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !ADMIN_ROLES.includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const lowStockOnly = searchParams.get('lowStock') === 'true';

    const products = await Product.find({ isActive: true }).select('sku name colors isBestseller');

    const inventory = products.map((p) => ({
      id: p._id,
      sku: p.sku,
      name: p.name,
      isBestseller: p.isBestseller,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      colors: p.colors.map((c: any) => ({
        name: c.name,
        stock: c.stock,
        isLowStock: c.stock < 10,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalStock: p.colors.reduce((sum: number, c: any) => sum + (c.stock || 0), 0),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hasLowStock: p.colors.some((c: any) => c.stock < 10),
    }));

    const filtered = lowStockOnly ? inventory.filter((p) => p.hasLowStock) : inventory;

    return NextResponse.json({ inventory: filtered });
  } catch (error) {
    console.error('GET inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

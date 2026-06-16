import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const frameType = searchParams.get('frameType');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const compatible = searchParams.get('compatible');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { isActive: true };

    if (category) {
      query.$or = [{ category }, { categories: category }];
    }
    if (frameType) {
      const existing = query.$or || [];
      query.$or = [...existing, { frameType }, { 'frame.type': frameType }];
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query['price.selling'] = {};
      if (minPrice) query['price.selling'].$gte = parseFloat(minPrice);
      if (maxPrice) query['price.selling'].$lte = parseFloat(maxPrice);
    }
    if (compatible) {
      query[`compatible.${compatible}`] = true;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { 'price.selling': 1 },
      price_desc: { 'price.selling': -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
      bestseller: { soldCount: -1 },
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !['admin', 'store_manager'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();

    if (!body.sku) {
      const lastProduct = await Product.findOne().sort({ createdAt: -1 });
      const lastNum = lastProduct?.sku?.match(/\d+$/)?.[0];
      const nextNum = lastNum ? String(parseInt(lastNum) + 1).padStart(4, '0') : '0001';
      body.sku = `EG-${nextNum}`;
    }

    const product = new Product(body);
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

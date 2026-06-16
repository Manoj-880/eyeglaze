import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Review } from '@/models/Review';
import { getAuthUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    let product;
    if (id.startsWith('EG-')) {
      product = await Product.findOne({ sku: id });
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    } else {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = await Review.find({ product: product._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name');

    return NextResponse.json({ product, reviews });
  } catch (error) {
    console.error('GET product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !['admin', 'store_manager'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const product = await Product.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !['admin', 'store_manager'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;

    await Product.findByIdAndUpdate(id, { isActive: false });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

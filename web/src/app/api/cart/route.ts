import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Cart } from '@/models/Cart';
import { Product } from '@/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const cart = await Cart.findOne({ user: auth.userId }).populate(
      'items.product',
      'name images price sku frame colors'
    );

    if (!cart) {
      return NextResponse.json({ cart: { items: [], total: 0 } });
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('GET cart error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { productId, color, qty = 1, lens } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let cart = await Cart.findOne({ user: auth.userId });
    if (!cart) {
      cart = new Cart({ user: auth.userId, items: [] });
    }

    // Check for duplicate item
    const existingIdx = cart.items.findIndex(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.lensType === (lens?.lensType || null)
    );

    if (existingIdx >= 0) {
      cart.items[existingIdx].qty += qty;
    } else {
      const newItem = {
        product: productId,
        qty,
        color,
        framePrice: product.price?.selling || 1,
        fittingCharge: lens ? 199 : 0,
        deliveryCharge: 99,
        ...(lens || {}),
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('POST cart error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

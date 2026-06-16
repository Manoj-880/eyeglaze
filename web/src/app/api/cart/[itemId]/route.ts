import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Cart } from '@/models/Cart';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { itemId } = await params;
    const body = await req.json();
    const { qty } = body;

    const cart = await Cart.findOne({ user: auth.userId });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    if (qty <= 0) {
      cart.items = cart.items.filter((item: { _id?: { toString(): string } }) => item._id?.toString() !== itemId) as typeof cart.items;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = cart.items.find((item: any) => item._id?.toString() === itemId);
      if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      item.qty = qty;
    }

    cart.updatedAt = new Date();
    await cart.save();
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    console.error('PUT cart item error:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { itemId } = await params;

    const cart = await Cart.findOne({ user: auth.userId });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    cart.items = cart.items.filter((item: { _id?: { toString(): string } }) => item._id?.toString() !== itemId) as typeof cart.items;
    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE cart item error:', error);
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}

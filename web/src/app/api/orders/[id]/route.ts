import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

const ADMIN_ROLES = ['admin', 'store_manager', 'support_agent'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { id } = await params;

    const order = await Order.findOne({ $or: [{ orderId: id }, { orderNumber: id }] })
      .populate('user', 'name email mobile phone')
      .populate('items.product', 'name images sku');

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.user._id.toString() !== auth.userId && !ADMIN_ROLES.includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('GET order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

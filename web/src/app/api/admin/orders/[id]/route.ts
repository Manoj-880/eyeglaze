import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { getAuthUser } from '@/lib/auth';

const ADMIN_ROLES = ['admin', 'store_manager', 'support_agent'];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !ADMIN_ROLES.includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const order = await Order.findOne({ $or: [{ orderId: id }, { orderNumber: id }, { _id: id }] })
      .populate('user', 'name email mobile phone addresses')
      .populate('items.product', 'name images sku');

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (error) {
    console.error('GET admin order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !ADMIN_ROLES.includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const order = await Order.findOne({ $or: [{ orderId: id }, { orderNumber: id }, { _id: id }] });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (body.status) {
      order.status = body.status;
      order.statusHistory.push({ status: body.status, timestamp: new Date(), note: body.note });
    }
    if (body.trackingNumber) order.trackingNumber = body.trackingNumber;
    if (body.courierPartner) order.courierPartner = body.courierPartner;
    if (body.internalNote) {
      order.internalNotes.push({
        note: body.internalNote,
        addedBy: auth.userId as unknown as import('mongoose').Types.ObjectId,
        addedAt: new Date(),
      });
    }
    if (body.prescriptionVerified !== undefined) {
      order.prescriptionVerified = body.prescriptionVerified;
    }
    if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
    if (body.isFlagged !== undefined) order.isFlagged = body.isFlagged;

    await order.save();
    return NextResponse.json({ order });
  } catch (error) {
    console.error('PUT admin order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

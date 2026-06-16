import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import { Coupon } from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const orders = await Order.find({ user: auth.userId })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images sku');

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('GET orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { deliveryAddress, paymentMethod, couponCode } = body;

    if (!deliveryAddress) {
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 });
    }

    const cart = await Cart.findOne({ user: auth.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Recalculate pricing server-side
    let subtotal = 0;
    let totalFittingCharge = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItems = cart.items.map((item: any) => {
      const framePrice = 1;
      const lensPrice = item.lensPrice || 0;
      const fittingCharge = item.lensType ? 199 : 0;
      subtotal += (framePrice + lensPrice) * item.qty;
      totalFittingCharge += fittingCharge * item.qty;

      return {
        product: item.product,
        qty: item.qty,
        color: item.color,
        lensType: item.lensType,
        lensSubType: item.lensSubType,
        power: item.power,
        lensQuality: item.lensQuality,
        lensPrice,
        framePrice,
        fittingCharge,
      };
    });

    const deliveryCharge = 99;
    let discount = 0;
    let couponData;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const orderTotal = subtotal + totalFittingCharge + deliveryCharge;
        if (coupon.discountType === 'percent') {
          discount = (orderTotal * coupon.discountValue) / 100;
          const cap = coupon.maxDiscount || coupon.maxDiscountCap;
          if (cap) discount = Math.min(discount, cap);
        } else {
          discount = coupon.discountValue;
        }
        discount = Math.round(discount);
        couponData = {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          amountSaved: discount,
        };
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const total = subtotal + totalFittingCharge + deliveryCharge - discount;

    // Generate order ID
    const count = await Order.countDocuments();
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const orderId = `EGO-${dateStr}-${String(count + 1).padStart(4, '0')}`;

    const estimatedDelivery = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const order = new Order({
      orderNumber: orderId,
      orderId,
      user: auth.userId,
      items: orderItems,
      address: deliveryAddress,
      subtotal,
      deliveryCharge,
      fittingCharge: totalFittingCharge,
      discount,
      total,
      coupon: couponData,
      paymentMethod,
      paymentStatus: 'paid', // stub — replace with real gateway
      status: 'pending',
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
      estimatedDelivery,
    });

    await order.save();

    // Clear cart
    cart.items = [] as typeof cart.items;
    cart.updatedAt = new Date();
    await cart.save();

    return NextResponse.json({ orderId, total, estimatedDelivery }, { status: 201 });
  } catch (error) {
    console.error('POST orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Coupon } from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { code, cartTotal } = await req.json();

    if (!code) return NextResponse.json({ valid: false, message: 'Coupon code required' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return NextResponse.json({ valid: false, message: 'Invalid coupon code' });

    const now = new Date();
    if (coupon.validFrom && coupon.validFrom > now) {
      return NextResponse.json({ valid: false, message: 'Coupon not yet active' });
    }
    const expiryDate = coupon.validTo || coupon.expiresAt;
    if (expiryDate && expiryDate < now) {
      return NextResponse.json({ valid: false, message: 'Coupon has expired' });
    }

    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value of ₹${coupon.minOrderValue} required`,
      });
    }

    if (coupon.usageLimitTotal && coupon.usedCount >= coupon.usageLimitTotal) {
      return NextResponse.json({ valid: false, message: 'Coupon usage limit exceeded' });
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = (cartTotal * coupon.discountValue) / 100;
      const cap = coupon.maxDiscount || coupon.maxDiscountCap;
      if (cap) discount = Math.min(discount, cap);
    } else {
      discount = coupon.discountValue;
    }

    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      message: `Coupon applied! You save ₹${Math.round(discount)}`,
    });
  } catch (error) {
    console.error('apply-coupon error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}

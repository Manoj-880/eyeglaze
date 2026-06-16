import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(auth.userId).select('-otp -otpExpiry');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || user.mobile,
        mobile: user.mobile,
        role: user.role,
        membershipActive: user.membershipActive,
        addresses: user.addresses,
        wishlist: user.wishlist,
      },
    });
  } catch (error) {
    console.error('me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

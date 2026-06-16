import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { verifyOTP, signJWT, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, mobile, email, otp } = body;

    const phoneNum = phone || mobile;

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    if (!phoneNum && !email) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
    }

    await connectDB();

    let user;
    if (phoneNum) {
      user = await User.findOne({ $or: [{ phone: phoneNum }, { mobile: phoneNum }] });
    } else {
      user = await User.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.otp || !user.otpExpiry) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 });
    }

    if (user.otpExpiry < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 401 });
    }

    const isValid = await verifyOTP(otp, user.otp);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect OTP' }, { status: 401 });
    }

    // Clear OTP and mark verified
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isVerified = true;
    if (!user.termsAcceptedAt) {
      user.termsAcceptedAt = new Date();
    }
    await user.save();

    const token = signJWT({ userId: user._id.toString(), role: user.role });
    const res = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || user.mobile,
        mobile: user.mobile,
        role: user.role,
      },
    });
    setAuthCookie(res, token);
    return res;
  } catch (error) {
    console.error('verify-otp error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

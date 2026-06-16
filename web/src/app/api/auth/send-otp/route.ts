import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { generateOTP, hashOTP } from '@/lib/auth';
import { sendSMSOTP, sendEmailOTP } from '@/lib/otp-sender';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, mobile, email, countryCode = '+91' } = body;

    const phoneNum = phone || mobile;

    if (!phoneNum && !email) {
      return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
    }

    await connectDB();

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let user;
    if (phoneNum) {
      user = await User.findOneAndUpdate(
        { $or: [{ phone: phoneNum }, { mobile: phoneNum }] },
        { phone: phoneNum, mobile: phoneNum, countryCode, otp: otpHash, otpExpiry },
        { upsert: true, new: true }
      );
      await sendSMSOTP(phoneNum, countryCode, otp);
    } else {
      user = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { email: email.toLowerCase(), otp: otpHash, otpExpiry },
        { upsert: true, new: true }
      );
      await sendEmailOTP(email, otp);
    }

    return NextResponse.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('send-otp error:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}

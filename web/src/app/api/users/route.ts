import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';

// GET /api/users - Admin: list all users
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !['admin', 'store_manager', 'support_agent'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({ role: { $in: ['user', 'customer'] } })
      .select('-otp -otpExpiry')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { LensOption } from '@/models/LensOption';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const kind = searchParams.get('kind');

    const query: Record<string, unknown> = { isActive: true };
    if (kind) query.kind = kind;

    const options = await LensOption.find(query).sort({ sortOrder: 1 });

    const lensTypes = options.filter((o) => o.kind === 'type');
    const lensQualities = options.filter((o) => o.kind === 'quality');

    return NextResponse.json({ lensTypes, lensQualities });
  } catch (error) {
    console.error('GET lens-options error:', error);
    return NextResponse.json({ error: 'Failed to fetch lens options' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth || !['admin', 'store_manager'].includes(auth.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const option = new LensOption(body);
    await option.save();
    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error('POST lens-option error:', error);
    return NextResponse.json({ error: 'Failed to create lens option' }, { status: 500 });
  }
}

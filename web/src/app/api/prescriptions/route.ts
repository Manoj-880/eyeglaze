import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Prescription } from '@/models/Prescription';
import { getAuthUser } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const RE = formData.get('RE') ? JSON.parse(formData.get('RE') as string) : undefined;
    const LE = formData.get('LE') ? JSON.parse(formData.get('LE') as string) : undefined;
    const pd = formData.get('pd') ? parseFloat(formData.get('pd') as string) : undefined;

    let uploadedFile: string | undefined;

    if (file) {
      // TODO: Replace with Cloudinary/S3 in production
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'prescriptions');
      await fs.mkdir(uploadDir, { recursive: true });
      const filename = `${auth.userId}_${Date.now()}_${file.name}`;
      const filepath = path.join(uploadDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filepath, buffer);
      uploadedFile = `/images/prescriptions/${filename}`;
    }

    const prescription = new Prescription({
      user: auth.userId,
      RE,
      LE,
      pd,
      uploadedFile,
      imageUrl: uploadedFile,
    });

    await prescription.save();
    return NextResponse.json({ prescription }, { status: 201 });
  } catch (error) {
    console.error('POST prescription error:', error);
    return NextResponse.json({ error: 'Failed to save prescription' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthUser(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const prescriptions = await Prescription.find({ user: auth.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ prescriptions });
  } catch (error) {
    console.error('GET prescriptions error:', error);
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

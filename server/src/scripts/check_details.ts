import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/mongodb';
import { Category } from '../models/Category';

async function run() {
  await connectDB();
  const categories = await Category.find({}).lean();
  console.log('CATEGORIES IN DB:');
  categories.forEach(c => {
    console.log(`- name: "${c.name}", slug: "${c.slug}", id: "${c._id}", parentId: "${c.parentId || ''}"`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);

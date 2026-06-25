import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/mongodb';
import { Category } from '../models/Category';
import { SubCategory } from '../models/SubCategory';

async function run() {
  await connectDB();
  console.log('--- Categories ---');
  const categories = await Category.find({}).lean();
  console.log(JSON.stringify(categories, null, 2));

  console.log('--- SubCategories ---');
  const subCategories = await SubCategory.find({}).lean();
  console.log(JSON.stringify(subCategories, null, 2));

  await mongoose.disconnect();
}

run().catch(console.error);

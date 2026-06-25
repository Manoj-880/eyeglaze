import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/mongodb';
import { Product } from '../models/Product';

async function run() {
  await connectDB();
  const res = await Product.updateMany({}, { $set: { brand: 'eyeglaze' } });
  console.log(`Updated ${res.modifiedCount} products to brand "eyeglaze".`);
  await mongoose.disconnect();
}

run().catch(console.error);

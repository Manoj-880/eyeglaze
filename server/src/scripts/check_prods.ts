import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/mongodb';
import { Product } from '../models/Product';

async function run() {
  await connectDB();
  const products = await Product.find({}).lean();
  console.log('PRODUCTS IN DB:');
  products.forEach(p => {
    console.log(`- name: "${p.name}", brand: "${p.brand}", category: "${p.category}", gender: "${JSON.stringify(p.gender)}", status: "${p.status}", id: "${p._id}"`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);

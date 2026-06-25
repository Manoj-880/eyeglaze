import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB } from '../config/mongodb';
import { Product } from '../models/Product';

async function run() {
  await connectDB();
  const products = await Product.find({});
  console.log(`Processing ${products.length} products...`);

  for (const p of products) {
    let originalGender = p.gender;
    let newGender: string[] = [];

    if (p._id.toString() === "6a3bf41b7c0b20d5543b6086") {
      // Charan product
      newGender = ["unisex", "men"];
    } else if (typeof originalGender === 'string') {
      newGender = [originalGender];
    } else if (Array.isArray(originalGender)) {
      // Check if it was split into characters
      const isCharSplit = originalGender.some(g => g.length === 1);
      if (isCharSplit) {
        // Reconstruct word(s)
        const str = originalGender.join('');
        if (str.includes('unisex')) {
          newGender.push('unisex');
        }
        if (str.includes('men')) {
          newGender.push('men');
        }
        if (str.includes('women')) {
          newGender.push('women');
        }
        if (str.includes('kids')) {
          newGender.push('kids');
        }
        if (newGender.length === 0) {
          newGender = ['unisex'];
        }
      } else {
        newGender = originalGender;
      }
    } else {
      newGender = ['unisex'];
    }

    // Clean and normalize
    newGender = Array.from(new Set(newGender.map(g => g.trim().toLowerCase())));
    p.gender = newGender;

    // Generate slug if missing to prevent validation errors
    if (!p.slug) {
      p.slug = p.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `product-${p._id}`;
      console.log(`Generated missing slug for "${p.name}": "${p.slug}"`);
    }

    try {
      await p.save();
      console.log(`Updated "${p.name}" gender: ${JSON.stringify(originalGender)} -> ${JSON.stringify(p.gender)}`);
    } catch (err: any) {
      console.error(`Failed to save "${p.name}":`, err.message);
    }
  }

  console.log('Gender normalization complete!');
  await mongoose.disconnect();
}

run().catch(console.error);

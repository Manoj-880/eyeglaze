import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from '../config/mongodb';
import { Brand } from '../models/Brand';
import { Category } from '../models/Category';
import { Warehouse } from '../models/Warehouse';

async function main() {
  console.log('Connecting to database...');
  await connectDB();
  console.log('Connected!');

  // 1. Seed Brands
  const brands = [
    { name: 'Vincent Chase', slug: 'vincent-chase', isActive: true },
    { name: 'John Jacobs', slug: 'john-jacobs', isActive: true },
    { name: 'Hustlr', slug: 'hustlr', isActive: true },
    { name: 'Lenskart Air', slug: 'lenskart-air', isActive: true },
    { name: 'Carrera', slug: 'carrera', isActive: true },
    { name: 'Ray-Ban', slug: 'ray-ban', isActive: true },
    { name: 'Oakley', slug: 'oakley', isActive: true },
  ];

  console.log('Seeding Brands...');
  for (const b of brands) {
    await Brand.findOneAndUpdate({ slug: b.slug }, b, { upsert: true, returnDocument: 'after' });
  }

  // 2. Seed Categories & Sub-Categories
  const categories = [
    // Parent Categories
    { name: 'Prescription Glasses', slug: 'prescription', isActive: true },
    { name: 'Sunglasses', slug: 'sunglasses', isActive: true },
    { name: 'Blue Light Glasses', slug: 'blue_light', isActive: true },
    { name: 'Contact Lenses', slug: 'contact_lenses', isActive: true },
    { name: 'Kids Eyewear', slug: 'kids', isActive: true },

    // Sub Categories under Prescription Glasses
    { name: 'Computer Glasses', slug: 'computer-glasses', parentCategory: 'prescription', isActive: true },
    { name: 'Reading Glasses', slug: 'reading-glasses', parentCategory: 'prescription', isActive: true },
    { name: 'Single Vision', slug: 'single-vision', parentCategory: 'prescription', isActive: true },
    { name: 'Progressive Glasses', slug: 'progressive-glasses', parentCategory: 'prescription', isActive: true },
    { name: 'Bifocal Glasses', slug: 'bifocal-glasses', parentCategory: 'prescription', isActive: true },

    // Sub Categories under Sunglasses
    { name: 'Polarized Sunglasses', slug: 'polarized-sunglasses', parentCategory: 'sunglasses', isActive: true },
    { name: 'Aviator Sunglasses', slug: 'aviator-sunglasses', parentCategory: 'sunglasses', isActive: true },
    { name: 'Wayfarer Sunglasses', slug: 'wayfarer-sunglasses', parentCategory: 'sunglasses', isActive: true },

    // Sub Categories under Kids Eyewear
    { name: 'Kids Prescription', slug: 'kids-prescription', parentCategory: 'kids', isActive: true },
    { name: 'Kids Sunglasses', slug: 'kids-sunglasses', parentCategory: 'kids', isActive: true },
  ];

  console.log('Seeding Categories...');
  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, returnDocument: 'after' });
  }

  // 3. Seed Warehouses
  const warehouses = [
    { name: 'Mumbai Main Warehouse', code: 'WH-MUM-01', location: 'Mumbai, Maharashtra', isActive: true },
    { name: 'Delhi Distribution Center', code: 'WH-DEL-01', location: 'Delhi, NCR', isActive: true },
    { name: 'Bangalore Hub', code: 'WH-BLR-01', location: 'Bangalore, Karnataka', isActive: true },
  ];

  console.log('Seeding Warehouses...');
  for (const w of warehouses) {
    await Warehouse.findOneAndUpdate({ code: w.code }, w, { upsert: true, returnDocument: 'after' });
  }

  console.log('Metadata seeding completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Metadata seed failed:', err);
  process.exit(1);
});

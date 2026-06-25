import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/mongodb';
import { Category } from '../models/Category';
import { SubCategory } from '../models/SubCategory';

async function main() {
  console.log('Connecting to database...');
  await connectDB();
  console.log('Connected!');

  // 1. Find Special Power category
  // slug in DB is 'power-sunglasses'
  const specialPowerCat = await Category.findOne({ slug: 'power-sunglasses' });
  if (specialPowerCat) {
    console.log(`Found Special Power category with ID: ${specialPowerCat._id}`);

    const specialPowerSubs = [
      { name: 'Progressive Lens', slug: 'progressive-lens', code: 'SUBCAT-POWER-PROGRESSIVE' },
      { name: 'Reading', slug: 'reading', code: 'SUBCAT-POWER-READING' },
    ];

    for (const sub of specialPowerSubs) {
      await SubCategory.findOneAndUpdate(
        { slug: sub.slug },
        {
          name: sub.name,
          slug: sub.slug,
          code: sub.code,
          categoryId: specialPowerCat._id,
          status: 'Active',
          isDeleted: false,
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded subcategory: ${sub.name}`);
    }
  } else {
    console.log('WARNING: Special Power category (slug: power-sunglasses) not found in database.');
  }

  // 2. Find Contact Lenses category
  // slug in DB is 'contact-lenses'
  const contactLensesCat = await Category.findOne({ slug: 'contact-lenses' });
  if (contactLensesCat) {
    console.log(`Found Contact Lenses category with ID: ${contactLensesCat._id}`);

    const contactSubs = [
      { name: 'Clear Contacts', slug: 'clear-contacts', code: 'SUBCAT-CONTACT-CLEAR' },
      { name: 'Color Contacts', slug: 'color-contacts', code: 'SUBCAT-CONTACT-COLOR' },
      { name: 'Solutions & Accessories', slug: 'solutions-accessories', code: 'SUBCAT-CONTACT-SOLUTIONS' },
    ];

    for (const sub of contactSubs) {
      await SubCategory.findOneAndUpdate(
        { slug: sub.slug },
        {
          name: sub.name,
          slug: sub.slug,
          code: sub.code,
          categoryId: contactLensesCat._id,
          status: 'Active',
          isDeleted: false,
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded subcategory: ${sub.name}`);
    }
  } else {
    console.log('WARNING: Contact Lenses category (slug: contact-lenses) not found in database.');
  }

  console.log('Seeding completed successfully!');
  await mongoose.disconnect();
  console.log('Disconnected!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});

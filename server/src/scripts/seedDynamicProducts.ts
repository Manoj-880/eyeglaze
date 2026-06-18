import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import { connectDB } from '../config/mongodb';
import { Product } from '../models/Product';
import { Brand } from '../models/Brand';
import { Category } from '../models/Category';
import { Warehouse } from '../models/Warehouse';
import { ProductVariant } from '../models/ProductVariant';
import { AuditLog } from '../models/AuditLog';

const ADMIN_USER_ID = '6a30f027dc02afc2e5588f6f';

async function main() {
  console.log('Connecting to database...');
  await connectDB();
  console.log('Connected!');

  // Clear previous dynamic products if any
  console.log('Clearing existing dynamic products...');
  const prevProds = await Product.find({ sku: { $regex: /^EG-DYN-/ } });
  for (const p of prevProds) {
    await ProductVariant.deleteMany({ productId: p._id });
    await AuditLog.deleteMany({ productId: p._id });
    await Product.findByIdAndDelete(p._id);
  }

  // Fetch reference metadata
  const brand = await Brand.findOne({ slug: 'vincent-chase' }) || { _id: new mongoose.Types.ObjectId() };
  const category = await Category.findOne({ slug: 'prescription' }) || { _id: new mongoose.Types.ObjectId() };
  const warehouse = await Warehouse.findOne({ code: 'WH-MUM-01' }) || { _id: new mongoose.Types.ObjectId(), name: 'Mumbai Main Warehouse' };

  console.log('Seeding Dynamic Eyewear Products...');

  const dynamicProducts = [
    {
      sku: 'EG-DYN-001',
      name: 'Vincent Chase Air Flex Dynamic Round',
      slug: 'vincent-chase-air-flex-dynamic-round',
      barcode: '890333200101',
      brand: 'Vincent Chase',
      brandId: brand._id,
      category: 'prescription',
      categoryId: category._id,
      subCategory: 'Computer Glasses',
      collectionName: 'Air Flex',
      gender: 'unisex',
      status: 'Active',
      launchDate: new Date('2026-06-01'),
      sortOrder: 1,
      shortDescription: 'Ultra-flexible TR90 round frame with blue light compatible lenses.',
      longDescription: 'Engineered with premium TR90 memory polymer, these round frames offer maximum flexibility and comfort for long work days. Zero pressure points behind ears, suitable for oval and square faces.',
      tags: ['flexible', 'lightweight', 'computer-glasses', 'round'],
      
      // Step 2: Pricing
      costPrice: 400,
      mrp: 1499,
      sellingPrice: 1199,
      gstPercent: 18,
      discountType: 'Percentage',
      discountValue: 20,
      profitMargin: 67,
      taxInclusive: true,
      currency: 'INR',

      // Step 3: Member Pricing
      enableMemberPricing: true,
      memberPrices: {
        regularPrice: 1199,
        goldMemberPrice: 999,
        platinumMemberPrice: 899,
        corporateMemberPrice: 950,
        studentMemberPrice: 890,
        employeePrice: 799,
        cashbackPercent: 5,
        rewardPoints: 100,
      },
      memberExclusiveProduct: false,

      // Step 4 & 5: Frame Specs & Measurements
      frameType: 'Full Rim',
      frameShape: 'Round',
      material: 'TR90',
      primaryColor: 'Matte Black',
      secondaryColor: 'Gold',
      frameWeight: '11g',
      countryOfOrigin: 'India',
      manufacturer: 'EyeGlaze Manufacturing Private Limited',
      warranty: '1 Year Warranty',
      
      lensWidth: 49,
      bridgeWidth: 19,
      templeLength: 142,
      frameWidth: 135,
      frameHeight: 42,
      pdCompatibility: '58-66mm',
      frameSize: 'Medium',
      faceShapeCompatibility: ['Oval', 'Square', 'Heart'],

      // Step 6: Compatible Lens Types & Dynamic pricing
      compatibleLensTypes: ['Zero Power', 'Single Vision', 'Progressive'],
      dynamicLensPricing: [
        { lensName: 'Anti-Glare Clear Lens', lensCategory: 'Single Vision', regularPrice: 1000, goldPrice: 800, platinumPrice: 700, priority: 1, status: 'Active' },
        { lensName: 'Screen-Shield Blue Cut', lensCategory: 'Computer', regularPrice: 1500, goldPrice: 1200, platinumPrice: 1000, priority: 2, status: 'Active' },
        { lensName: 'Active Transitions (Gray)', lensCategory: 'Transition', regularPrice: 3000, goldPrice: 2500, platinumPrice: 2200, priority: 3, status: 'Active' }
      ],

      // Step 7: Thickness Pricing surcharges
      thicknessPricing: [
        { thickness: '1.50', regularPrice: 0, goldPrice: 0, platinumPrice: 0 },
        { thickness: '1.56', regularPrice: 499, goldPrice: 399, platinumPrice: 299 },
        { thickness: '1.59', regularPrice: 999, goldPrice: 849, platinumPrice: 749 },
        { thickness: '1.67', regularPrice: 1999, goldPrice: 1699, platinumPrice: 1499 },
        { thickness: '1.74', regularPrice: 2999, goldPrice: 2499, platinumPrice: 2199 }
      ],

      // Step 8: Coating Options Surcharges
      coatingPricing: [
        { coatingName: 'Blue Cut', regularPrice: 799, memberPrice: 599, description: 'Digital screen blue-light filter block', isActive: true },
        { coatingName: 'Anti Glare', regularPrice: 499, memberPrice: 399, description: 'Reduces night driving lens reflections', isActive: true },
        { coatingName: 'UV Protection', regularPrice: 399, memberPrice: 299, description: 'Blocks outdoor UV rays', isActive: true }
      ],

      // Step 9: Membership & Offers
      eligibleForGold: true,
      eligibleForPlatinum: true,
      buy1Get1: true,
      oneRupeeFrameOffer: true,
      couponEligible: true,
      rewardEligible: true,
      familySharing: true,
      exclusiveProduct: false,
      oneRupeeOfferConditions: {
        membershipRequired: true,
        premiumLensRequired: true,
        minCartValue: 1200,
        campaignStartDate: new Date('2026-06-01'),
        campaignEndDate: new Date('2026-12-31'),
        maxUsage: 1
      },

      // Step 11: Inventory
      warehouseInventory: [
        {
          warehouseId: warehouse._id,
          warehouseName: warehouse.name,
          availableStock: 120,
          reservedStock: 15,
          safetyStock: 10,
          lowStockAlert: 20,
          reorderLevel: 40,
          barcode: '890333200101-WH01',
          qrCode: 'QR-DYN-001'
        }
      ],

      // Step 12: Shipping
      shippingWeight: 140,
      shippingLength: 16,
      shippingWidth: 8,
      shippingHeight: 5,
      packageType: 'Hardcase Box',
      fragile: true,
      estimatedDeliveryDays: 3,

      // Step 13: Media
      thumbnail: 'https://images.lenskart.com/media/catalog/product/placeholder-round-front.jpg',
      frontView: 'https://images.lenskart.com/media/catalog/product/placeholder-round-front.jpg',
      leftView: 'https://images.lenskart.com/media/catalog/product/placeholder-round-left.jpg',
      rightView: 'https://images.lenskart.com/media/catalog/product/placeholder-round-right.jpg',
      topView: 'https://images.lenskart.com/media/catalog/product/placeholder-round-top.jpg',
      threeSixtyImages: [],
      lifestyleImages: [],
      productVideo: '',

      // Step 14: SEO
      seoKeywords: 'round glasses, flexible frames, vincent chase air, computer eyewear',
      canonicalUrl: 'https://eyeglaze.in/products/vincent-chase-air-flex-dynamic-round',
      openGraphTitle: 'Vincent Chase Air Flex Round Eyeglasses - EyeGlaze',
      openGraphDescription: 'Premium flexible round glasses for digital screens. 1 year warranty.',
      imageAltText: 'Vincent Chase Matte Black Round Glasses'
    },
    {
      sku: 'EG-DYN-002',
      name: 'John Jacobs Clubmaster Elite',
      slug: 'john-jacobs-clubmaster-elite',
      barcode: '890333200102',
      brand: 'John Jacobs',
      brandId: brand._id,
      category: 'prescription',
      categoryId: category._id,
      subCategory: 'Reading Glasses',
      collectionName: 'Elite Clubmaster',
      gender: 'men',
      status: 'Active',
      launchDate: new Date('2026-06-15'),
      sortOrder: 2,
      shortDescription: 'Classic acetate clubmaster design with premium metal browline.',
      longDescription: 'A retro classic re-imagined with modern premium acetate temple tips and a corrosion-resistant steel framework. Ideal for corporate environments.',
      tags: ['classic', 'clubmaster', 'acetate', 'men'],
      
      // Step 2: Pricing
      costPrice: 800,
      mrp: 2999,
      sellingPrice: 2499,
      gstPercent: 18,
      discountType: 'Percentage',
      discountValue: 16,
      profitMargin: 68,
      taxInclusive: true,
      currency: 'INR',

      // Step 3: Member Pricing
      enableMemberPricing: true,
      memberPrices: {
        regularPrice: 2499,
        goldMemberPrice: 1999,
        platinumMemberPrice: 1799,
        corporateMemberPrice: 2100,
        studentMemberPrice: 1990,
        employeePrice: 1499,
        cashbackPercent: 10,
        rewardPoints: 200,
      },
      memberExclusiveProduct: true,

      // Step 4 & 5: Frame Specs & Measurements
      frameType: 'Half Rim',
      frameShape: 'Clubmaster',
      material: 'Acetate',
      primaryColor: 'Tortoise Shell',
      secondaryColor: 'Silver',
      frameWeight: '16g',
      countryOfOrigin: 'India',
      manufacturer: 'John Jacobs Optics Private Limited',
      warranty: '1 Year Warranty',
      
      lensWidth: 51,
      bridgeWidth: 20,
      templeLength: 145,
      frameWidth: 138,
      frameHeight: 44,
      pdCompatibility: '60-70mm',
      frameSize: 'Large',
      faceShapeCompatibility: ['Round', 'Oval', 'Square'],

      // Step 6: Compatible Lens Types & Dynamic pricing
      compatibleLensTypes: ['Single Vision', 'Progressive', 'Reading'],
      dynamicLensPricing: [
        { lensName: 'Elite Blue Cut Lens', lensCategory: 'Single Vision', regularPrice: 1800, goldPrice: 1500, platinumPrice: 1300, priority: 1, status: 'Active' },
        { lensName: 'Dual-Zone Progressive Lens', lensCategory: 'Progressive', regularPrice: 3999, goldPrice: 3299, platinumPrice: 2999, priority: 2, status: 'Active' }
      ],

      // Step 7: Thickness Pricing surcharges
      thicknessPricing: [
        { thickness: '1.50', regularPrice: 0, goldPrice: 0, platinumPrice: 0 },
        { thickness: '1.56', regularPrice: 599, goldPrice: 499, platinumPrice: 399 },
        { thickness: '1.59', regularPrice: 1099, goldPrice: 949, platinumPrice: 849 },
        { thickness: '1.67', regularPrice: 2199, goldPrice: 1899, platinumPrice: 1699 }
      ],

      // Step 8: Coating Options Surcharges
      coatingPricing: [
        { coatingName: 'Blue Cut', regularPrice: 899, memberPrice: 699, description: 'Anti blue-light protection', isActive: true },
        { coatingName: 'Anti Glare', regularPrice: 599, memberPrice: 499, description: 'Reduced glare', isActive: true }
      ],

      // Step 9: Membership & Offers
      eligibleForGold: true,
      eligibleForPlatinum: true,
      buy1Get1: false,
      oneRupeeFrameOffer: false,
      couponEligible: true,
      rewardEligible: true,
      familySharing: false,
      exclusiveProduct: true,

      // Step 11: Inventory
      warehouseInventory: [
        {
          warehouseId: warehouse._id,
          warehouseName: warehouse.name,
          availableStock: 80,
          reservedStock: 5,
          safetyStock: 8,
          lowStockAlert: 15,
          reorderLevel: 25,
          barcode: '890333200102-WH01',
          qrCode: 'QR-DYN-002'
        }
      ],

      // Step 12: Shipping
      shippingWeight: 170,
      shippingLength: 17,
      shippingWidth: 9,
      shippingHeight: 6,
      packageType: 'Premium Leather Case',
      fragile: true,
      estimatedDeliveryDays: 2,

      // Step 13: Media
      thumbnail: 'https://images.lenskart.com/media/catalog/product/placeholder-clubmaster-front.jpg',
      frontView: 'https://images.lenskart.com/media/catalog/product/placeholder-clubmaster-front.jpg',

      // Step 14: SEO
      seoKeywords: 'clubmaster glasses, john jacobs elite, retro browline eyeglasses',
      canonicalUrl: 'https://eyeglaze.in/products/john-jacobs-clubmaster-elite',
      openGraphTitle: 'John Jacobs Clubmaster Elite - EyeGlaze',
      openGraphDescription: 'Premium browline acetate glasses for men. Member-exclusive launch.',
      imageAltText: 'John Jacobs Classic Tortoise Browline Frame'
    }
  ];

  for (const p of dynamicProducts) {
    const product = new Product(p);
    await product.save();

    // Seed 2 variants for each product
    const colors = [
      { name: 'Matte Charcoal', color: 'Charcoal', hex: '#2A2A2A', stock: 40, priceOverride: 0 },
      { name: 'Polished Gold', color: 'Gold', hex: '#D4AF37', stock: 25, priceOverride: 200 }
    ];

    for (const c of colors) {
      const variant = new ProductVariant({
        productId: product._id,
        name: `${product.name} - ${c.name}`,
        color: c.color,
        sku: `${product.sku}-${c.color.toUpperCase()}`,
        stock: c.stock,
        priceOverride: c.priceOverride || undefined,
        status: 'Active',
        images: [product.thumbnail],
        priority: 1
      });
      await variant.save();
    }

    // Seed Audit Log
    const audit = new AuditLog({
      productId: product._id,
      action: 'create',
      performedBy: new mongoose.Types.ObjectId(ADMIN_USER_ID),
      performedByName: 'System Database Seeder',
      changes: p,
      version: 1
    });
    await audit.save();

    console.log(`   Seeded product SKU: ${product.sku} | Name: ${product.name}`);
  }

  console.log('Database populated with fully dynamic products successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

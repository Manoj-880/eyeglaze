import { Request, Response } from 'express';
import { connectDB } from '../config/mongodb';
import { Category } from '../models/Category';
import { SubCategory } from '../models/SubCategory';

export async function getPublicCategories(req: Request, res: Response) {
  try {
    await connectDB();
    const categories = await Category.find({ isDeleted: false, status: 'Active' })
      .sort({ displayOrder: 1, name: 1 })
      .lean();
    return res.status(200).json(categories);
  } catch (error: any) {
    console.error('getPublicCategories error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch categories' });
  }
}

export async function getPublicCategoryTree(req: Request, res: Response) {
  try {
    await connectDB();
    const query = { isDeleted: false, status: 'Active' };

    const [categories, subCategories] = await Promise.all([
      Category.find(query).sort({ displayOrder: 1, name: 1 }).lean(),
      SubCategory.find(query).sort({ displayOrder: 1, name: 1 }).lean(),
    ]);

    // Build hierarchy tree
    const tree = categories.map((cat: any) => {
      const catSubcats = subCategories
        .filter((sub: any) => String(sub.categoryId) === String(cat._id))
        .map((sub: any) => {
          return {
            id: sub._id,
            name: sub.name,
            code: sub.code,
            slug: sub.slug,
            type: 'SubCategory',
          };
        });

      return {
        id: cat._id,
        name: cat.name,
        code: cat.code,
        slug: cat.slug,
        icon: cat.icon,
        bannerImage: cat.bannerImage,
        description: cat.description,
        type: 'Category',
        children: catSubcats,
      };
    });

    return res.status(200).json({ tree });
  } catch (error: any) {
    console.error('getPublicCategoryTree error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch public category tree' });
  }
}


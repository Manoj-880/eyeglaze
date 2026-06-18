import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parentCategory?: string; // For Sub-Categories (e.g. computer glasses sub-category under prescription glasses)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    parentCategory: { type: String }, // optional slug or name of parent category
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound index to allow sub-categories under unique parent
CategorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

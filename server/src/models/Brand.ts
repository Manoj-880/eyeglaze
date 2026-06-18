import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Brand = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

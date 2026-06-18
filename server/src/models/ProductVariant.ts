import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant extends Document {
  productId: mongoose.Types.ObjectId;
  name: string;
  color: string;
  sku: string;
  stock: number;
  priceOverride?: number;
  status: 'Draft' | 'Active' | 'Inactive' | 'Scheduled';
  images: string[];
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0 },
    priceOverride: { type: Number },
    status: { type: String, enum: ['Draft', 'Active', 'Inactive', 'Scheduled'], default: 'Draft' },
    images: [{ type: String }],
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ProductVariant = mongoose.models.ProductVariant || mongoose.model<IProductVariant>('ProductVariant', ProductVariantSchema);

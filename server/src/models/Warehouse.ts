import mongoose, { Document, Schema } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  code: string; // Unique short code, e.g. WH-MUMBAI-01
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Warehouse = mongoose.models.Warehouse || mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);

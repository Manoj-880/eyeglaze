import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  productId: mongoose.Types.ObjectId;
  action: 'create' | 'update' | 'delete' | 'publish' | 'schedule';
  performedBy: mongoose.Types.ObjectId;
  performedByName: string;
  changes?: Record<string, any>;
  version: number;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    action: { type: String, enum: ['create', 'update', 'delete', 'publish', 'schedule'], required: true },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performedByName: { type: String, required: true },
    changes: { type: Schema.Types.Map, of: Schema.Types.Mixed },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

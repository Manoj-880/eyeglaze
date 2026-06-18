import mongoose, { Document, Schema } from 'mongoose';

export interface ITicket extends Document {
  ticketId: string;
  user: mongoose.Types.ObjectId;
  category: string;
  subject: string;
  orderNumber?: string;
  message: string;
  status: 'Open' | 'Resolved';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    subject: { type: String, required: true },
    orderNumber: { type: String },
    message: { type: String, required: true },
    status: { type: String, enum: ['Open', 'Resolved'], default: 'Open' },
    adminResponse: { type: String },
  },
  { timestamps: true }
);

export const Ticket = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

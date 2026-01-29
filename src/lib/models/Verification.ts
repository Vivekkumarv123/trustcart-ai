import mongoose from 'mongoose';

export interface IPromise {
  price: number;
  deliveryCharges: number;
  deliveryTime: string;
  returnPolicy: string;
  productDescription: string;
}

export interface IInvoice {
  price: number;
  deliveryCharges: number;
  deliveryTime: string;
  returnPolicy: string;
  productDescription: string;
  invoiceNumber?: string;
  invoiceDate?: Date;
}

export interface IMismatch {
  field: string;
  promised: string | number;
  actual: string | number;
  severity: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface IVerification {
  _id?: string;
  sellerId: string;
  buyerEmail: string;
  promise: IPromise;
  invoice: IInvoice;
  mismatches: IMismatch[];
  overallScore: number;
  status: 'pending' | 'verified' | 'disputed';
  aiAnalysis: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromiseSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  deliveryCharges: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  returnPolicy: { type: String, required: true },
  productDescription: { type: String, required: true },
});

const InvoiceSchema = new mongoose.Schema({
  price: { type: Number, required: true },
  deliveryCharges: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  returnPolicy: { type: String, required: true },
  productDescription: { type: String, required: true },
  invoiceNumber: { type: String },
  invoiceDate: { type: Date },
});

const MismatchSchema = new mongoose.Schema({
  field: { type: String, required: true },
  promised: { type: mongoose.Schema.Types.Mixed, required: true },
  actual: { type: mongoose.Schema.Types.Mixed, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
  explanation: { type: String, required: true },
});

const VerificationSchema = new mongoose.Schema<IVerification>({
  sellerId: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  promise: { type: PromiseSchema, required: true },
  invoice: { type: InvoiceSchema, required: true },
  mismatches: [MismatchSchema],
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['pending', 'verified', 'disputed'], default: 'pending' },
  aiAnalysis: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
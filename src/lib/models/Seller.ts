import mongoose from 'mongoose';

// Function to generate a unique seller ID
const generateSellerId = (): string => {
  const prefix = 'SELLER';
  const letters = Math.random().toString(36).substring(2, 5).toUpperCase();
  const numbers = Math.floor(Math.random() * 900) + 100; // 3-digit number
  return `${prefix}-${letters}-${numbers}`;
};

export interface ISeller {
  _id?: string;
  sellerId: string; // Public seller ID like "SELLER-ABC-123"
  name: string;
  email: string;
  phone?: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'other';
  trustScore: number | null; // null for new sellers, number after first verification
  totalVerifications: number;
  successfulVerifications: number;
  isNewSeller: boolean; // Flag to identify new sellers
  createdAt: Date;
  updatedAt: Date;
}

const SellerSchema = new mongoose.Schema<ISeller>({
  sellerId: { 
    type: String, 
    unique: true,
    default: generateSellerId
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  platform: { 
    type: String, 
    enum: ['whatsapp', 'instagram', 'facebook', 'other'],
    required: true 
  },
  trustScore: { type: Number, default: null, min: 0, max: 100 }, // null for new sellers
  totalVerifications: { type: Number, default: 0 },
  successfulVerifications: { type: Number, default: 0 },
  isNewSeller: { type: Boolean, default: true }, // New sellers start as true
}, {
  timestamps: true
});

// Ensure sellerId is generated before saving
SellerSchema.pre('save', async function() {
  if (!this.sellerId) {
    let isUnique = false;
    while (!isUnique) {
      const newSellerId = generateSellerId();
      // Use this.constructor to reference the model
      const existingSeller = await (this.constructor as any).findOne({ sellerId: newSellerId });
      if (!existingSeller) {
        this.sellerId = newSellerId;
        isUnique = true;
      }
    }
  }
});

export default mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);
import mongoose from 'mongoose';

export interface IUser {
  _id?: string;
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  sellerId?: string; // Reference to seller if user is a seller
  role: 'buyer' | 'seller' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  firebaseUid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true },
  photoURL: { type: String },
  sellerId: { type: String }, // Reference to seller document
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
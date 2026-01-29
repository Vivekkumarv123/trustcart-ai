import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import Seller from '../lib/models/Seller';
import Verification from '../lib/models/Verification';

export class TrustScoreService {
  static async updateSellerTrustScore(sellerId: string, verificationScore: number): Promise<number> {
    await dbConnect();
    
    // Handle both MongoDB ObjectId and public seller ID
    let seller;
    if (mongoose.Types.ObjectId.isValid(sellerId)) {
      // MongoDB ObjectId
      seller = await Seller.findById(sellerId);
    } else if (sellerId.startsWith('SELLER-')) {
      // Public seller ID
      seller = await Seller.findOne({ sellerId: sellerId });
    } else {
      // Try to find by email or name as fallback
      seller = await Seller.findOne({ 
        $or: [
          { email: sellerId },
          { name: sellerId },
          { sellerId: sellerId }
        ]
      });
    }
    
    if (!seller) {
      throw new Error('Seller not found');
    }

    // Update verification counts
    seller.totalVerifications += 1;
    if (verificationScore >= 70) {
      seller.successfulVerifications += 1;
    }

    // For first verification, set trust score directly
    if (seller.isNewSeller || seller.totalVerifications === 1) {
      seller.trustScore = verificationScore;
      seller.isNewSeller = false;
    } else {
      // Calculate new trust score using weighted average for existing sellers
      const successRate = seller.successfulVerifications / seller.totalVerifications;
      const recentVerifications = await Verification.find({ sellerId: seller._id })
        .sort({ createdAt: -1 })
        .limit(10);

      let recentAverageScore = 0;
      if (recentVerifications.length > 0) {
        recentAverageScore = recentVerifications.reduce((sum, v) => sum + v.overallScore, 0) / recentVerifications.length;
      }

      // Weighted calculation: 60% recent performance, 40% historical success rate
      const newTrustScore = Math.round(
        (recentAverageScore * 0.6) + (successRate * 100 * 0.4)
      );

      seller.trustScore = Math.max(0, Math.min(100, newTrustScore));
    }

    await seller.save();
    return seller.trustScore!;
  }

  static async getSellerTrustScore(sellerId: string): Promise<{
    trustScore: number | null;
    totalVerifications: number;
    successfulVerifications: number;
    successRate: number;
    isNewSeller: boolean;
  }> {
    await dbConnect();
    
    // Handle both MongoDB ObjectId and public seller ID
    let seller;
    if (mongoose.Types.ObjectId.isValid(sellerId)) {
      // MongoDB ObjectId
      seller = await Seller.findById(sellerId);
    } else if (sellerId.startsWith('SELLER-')) {
      // Public seller ID
      seller = await Seller.findOne({ sellerId: sellerId });
    } else {
      // Try to find by email or name as fallback
      seller = await Seller.findOne({ 
        $or: [
          { email: sellerId },
          { name: sellerId },
          { sellerId: sellerId }
        ]
      });
    }
    
    if (!seller) {
      throw new Error('Seller not found');
    }

    const successRate = seller.totalVerifications > 0 
      ? (seller.successfulVerifications / seller.totalVerifications) * 100 
      : 0;

    return {
      trustScore: seller.trustScore,
      totalVerifications: seller.totalVerifications,
      successfulVerifications: seller.successfulVerifications,
      successRate: Math.round(successRate),
      isNewSeller: seller.isNewSeller
    };
  }

  static getTrustScoreLabel(score: number | null): { label: string; color: string; emoji: string } {
    if (score === null) return { label: 'New Seller', color: 'text-blue-600', emoji: '🆕' };
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (score >= 80) return { label: 'Very Good', color: 'text-green-500', emoji: '✅' };
    if (score >= 70) return { label: 'Good', color: 'text-yellow-500', emoji: '👍' };
    if (score >= 60) return { label: 'Fair', color: 'text-orange-500', emoji: '⚠️' };
    return { label: 'Poor', color: 'text-red-500', emoji: '🚨' };
  }
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Seller from '../../../../../lib/models/Seller';
import Verification from '../../../../../lib/models/Verification';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    await dbConnect();
    
    const { sellerId } = await params;
    
    // Find seller by public seller ID
    const seller = await Seller.findOne({ sellerId });
    
    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Get recent verifications for this seller
    const recentVerifications = await Verification.find({ sellerId: seller._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('overallScore status createdAt mismatches');

    // Calculate additional metrics
    const verificationScores = recentVerifications.map(v => v.overallScore);
    const averageScore = verificationScores.length > 0 
      ? Math.round(verificationScores.reduce((a, b) => a + b, 0) / verificationScores.length)
      : seller.trustScore || 0;

    const scoreDistribution = {
      excellent: verificationScores.filter(s => s >= 90).length,
      good: verificationScores.filter(s => s >= 70 && s < 90).length,
      fair: verificationScores.filter(s => s >= 50 && s < 70).length,
      poor: verificationScores.filter(s => s < 50).length
    };

    // Calculate trend (last 5 vs previous 5)
    const recent5 = verificationScores.slice(0, 5);
    const previous5 = verificationScores.slice(5, 10);
    const recentAvg = recent5.length > 0 ? recent5.reduce((a, b) => a + b, 0) / recent5.length : 0;
    const previousAvg = previous5.length > 0 ? previous5.reduce((a, b) => a + b, 0) / previous5.length : 0;
    const trend = recentAvg > previousAvg ? 'improving' : recentAvg < previousAvg ? 'declining' : 'stable';

    return NextResponse.json({
      success: true,
      seller: {
        sellerId: seller.sellerId,
        name: seller.name,
        platform: seller.platform,
        trustScore: seller.trustScore,
        totalVerifications: seller.totalVerifications,
        successfulVerifications: seller.successfulVerifications,
        isNewSeller: seller.isNewSeller,
        memberSince: seller.createdAt
      },
      analytics: {
        averageScore,
        scoreDistribution,
        trend,
        recentVerifications: recentVerifications.map(v => ({
          score: v.overallScore,
          status: v.status,
          date: v.createdAt,
          mismatchCount: v.mismatches.length
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching trust score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trust score' },
      { status: 500 }
    );
  }
}
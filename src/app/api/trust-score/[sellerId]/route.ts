import { NextRequest, NextResponse } from 'next/server';
import { TrustScoreService } from '../../../../services/trustScoreService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sellerId: string }> }
) {
  try {
    const { sellerId } = await params;
    
    const trustData = await TrustScoreService.getSellerTrustScore(sellerId);
    const trustLabel = TrustScoreService.getTrustScoreLabel(trustData.trustScore);

    return NextResponse.json({
      success: true,
      trustData: {
        ...trustData,
        ...trustLabel
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
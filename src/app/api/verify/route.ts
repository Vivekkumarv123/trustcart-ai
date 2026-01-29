import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/mongodb';
import Verification from '../../../lib/models/Verification';
import Seller from '../../../lib/models/Seller';
import { VerificationEngine } from '../../../lib/ai/verificationEngine';
import { TrustScoreService } from '../../../services/trustScoreService';
import { AuditService } from '../../../services/auditService';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    await dbConnect();
    
    const body = await request.json();
    const { sellerId, buyerEmail, promise, invoice } = body;

    // Get user info from headers
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Validate seller exists - handle both ObjectId and email
    let seller;
    if (mongoose.Types.ObjectId.isValid(sellerId)) {
      seller = await Seller.findById(sellerId);
    } else {
      seller = await Seller.findOne({ 
        $or: [
          { email: sellerId },
          { name: sellerId }
        ]
      });
    }
    
    if (!seller) {
      // Log failed verification attempt
      await AuditService.log('system_error', {
        action: 'verification_failed',
        reason: 'seller_not_found',
        sellerId,
        buyerEmail
      }, {
        severity: 'warning',
        userAgent,
        ipAddress
      });
      
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    // Create verification record first
    const verification = new Verification({
      sellerId: seller._id,
      buyerEmail,
      promise,
      invoice,
      mismatches: [], // Will be updated after AI analysis
      overallScore: 0,
      aiAnalysis: 'Processing...',
      status: 'pending'
    });

    await verification.save();

    // Log verification start
    await AuditService.log('verification_started', {
      verificationId: verification._id.toString(),
      sellerId: seller._id.toString(),
      sellerName: seller.name,
      buyerEmail,
      promiseValue: promise.price,
      invoiceValue: invoice.price
    }, {
      userId: buyerEmail,
      sellerId: seller._id.toString(),
      verificationId: verification._id.toString(),
      severity: 'info',
      userAgent,
      ipAddress
    });

    // Perform AI verification with audit logging
    const verificationResult = await VerificationEngine.performAIVerification(
      promise, 
      invoice,
      {
        userId: buyerEmail,
        sellerId: seller._id.toString(),
        verificationId: verification._id.toString()
      }
    );

    // Update verification record
    verification.mismatches = verificationResult.mismatches;
    verification.overallScore = verificationResult.overallScore;
    verification.aiAnalysis = verificationResult.analysis;
    verification.status = 'verified';
    await verification.save();

    // Update seller trust score
    const newTrustScore = await TrustScoreService.updateSellerTrustScore(
      seller._id.toString(), 
      verificationResult.overallScore
    );

    const processingTime = Date.now() - startTime;

    // Log verification completion
    await AuditService.log('verification_completed', {
      verificationId: verification._id.toString(),
      sellerId: seller._id.toString(),
      sellerName: seller.name,
      buyerEmail,
      result: {
        overallScore: verificationResult.overallScore,
        mismatchCount: verificationResult.mismatches.length,
        newTrustScore,
        processingTime
      },
      mismatches: verificationResult.mismatches.map(m => ({
        field: m.field,
        severity: m.severity,
        explanation: m.explanation
      }))
    }, {
      userId: buyerEmail,
      sellerId: seller._id.toString(),
      verificationId: verification._id.toString(),
      severity: verificationResult.overallScore < 50 ? 'warning' : 'info',
      userAgent,
      ipAddress,
      processingTime
    });

    // Log trust score update
    await AuditService.log('trust_score_updated', {
      sellerId: seller._id.toString(),
      sellerName: seller.name,
      oldTrustScore: seller.trustScore,
      newTrustScore,
      verificationScore: verificationResult.overallScore,
      totalVerifications: seller.totalVerifications + 1
    }, {
      userId: buyerEmail,
      sellerId: seller._id.toString(),
      verificationId: verification._id.toString(),
      severity: 'info',
      userAgent,
      ipAddress
    });

    return NextResponse.json({
      success: true,
      verification: {
        id: verification._id,
        mismatches: verification.mismatches,
        overallScore: verification.overallScore,
        aiAnalysis: verification.aiAnalysis,
        status: verification.status
      },
      seller: {
        newTrustScore,
        name: seller.name
      },
      processingTime
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    // Log system error
    await AuditService.log('system_error', {
      action: 'verification_system_error',
      error: error.message,
      stack: error.stack?.substring(0, 500),
      processingTime
    }, {
      severity: 'error',
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      processingTime
    });
    
    console.error('Error performing verification:', error);
    return NextResponse.json(
      { error: 'Failed to perform verification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');
    const buyerEmail = searchParams.get('buyerEmail');

    let query: any = {};
    if (sellerId) query.sellerId = sellerId;
    if (buyerEmail) query.buyerEmail = buyerEmail;

    const verifications = await Verification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      verifications: verifications.map(v => ({
        id: v._id,
        sellerId: v.sellerId,
        buyerEmail: v.buyerEmail,
        overallScore: v.overallScore,
        status: v.status,
        mismatchCount: v.mismatches.length,
        createdAt: v.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    );
  }
}
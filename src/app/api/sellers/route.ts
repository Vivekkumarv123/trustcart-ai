import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Seller from '../../../lib/models/Seller';
import { AuditService } from '../../../services/auditService';
import { fallbackSellers } from '../../../utils/fallbackData';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, email, phone, platform } = body;

    // Get user info from headers
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Check if seller already exists
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      // Log failed registration attempt
      await AuditService.log('system_error', {
        action: 'seller_registration_failed',
        reason: 'email_already_exists',
        email,
        name
      }, {
        userId: email,
        severity: 'warning',
        userAgent,
        ipAddress
      });

      return NextResponse.json(
        { error: 'Seller with this email already exists' },
        { status: 400 }
      );
    }

    const seller = new Seller({
      name,
      email,
      phone,
      platform
    });

    await seller.save();

    // Log successful seller registration
    await AuditService.log('seller_registered', {
      sellerId: seller._id.toString(),
      sellerName: seller.name,
      email: seller.email,
      platform: seller.platform,
      phone: seller.phone
    }, {
      userId: email,
      sellerId: seller._id.toString(),
      severity: 'info',
      userAgent,
      ipAddress
    });

    return NextResponse.json({
      success: true,
      seller: {
        id: seller._id,
        sellerId: seller.sellerId, // Public ID
        name: seller.name,
        email: seller.email,
        platform: seller.platform,
        trustScore: seller.trustScore,
        isNewSeller: seller.isNewSeller
      }
    });
  } catch (error) {
    // Log system error
    await AuditService.log('system_error', {
      action: 'seller_registration_system_error',
      error: error.message,
      stack: error.stack?.substring(0, 500)
    }, {
      severity: 'error',
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
    });

    console.error('Error creating seller:', error);
    return NextResponse.json(
      { error: 'Failed to create seller' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Add timeout to database connection
    const connectPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 10000)
    );
    
    await Promise.race([connectPromise, timeoutPromise]);
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      const seller = await Seller.findOne({ email }).maxTimeMS(5000);
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        seller: {
          id: seller._id,
          sellerId: seller.sellerId, // Public ID
          name: seller.name,
          email: seller.email,
          platform: seller.platform,
          trustScore: seller.trustScore,
          totalVerifications: seller.totalVerifications,
          successfulVerifications: seller.successfulVerifications,
          isNewSeller: seller.isNewSeller
        }
      });
    }

    // Get all sellers with timeout
    const sellers = await Seller.find({})
      .sort({ trustScore: -1 })
      .maxTimeMS(5000)
      .lean();
    
    return NextResponse.json({
      success: true,
      sellers: sellers.map(seller => ({
        id: seller._id,
        sellerId: seller.sellerId, // Public ID
        name: seller.name,
        email: seller.email,
        platform: seller.platform,
        trustScore: seller.trustScore,
        totalVerifications: seller.totalVerifications,
        successfulVerifications: seller.successfulVerifications,
        isNewSeller: seller.isNewSeller
      }))
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    
    // Return fallback data instead of error for better UX
    return NextResponse.json({
      success: true,
      sellers: fallbackSellers,
      fallback: true,
      message: 'Using demo data - database temporarily unavailable'
    });
  }
}
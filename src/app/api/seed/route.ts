import { NextResponse } from 'next/server';
import { seedDemoData } from '../../../utils/seedData';

export async function POST() {
  try {
    const sellers = await seedDemoData();
    
    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
      sellers: sellers.map(seller => ({
        id: seller._id,
        name: seller.name,
        email: seller.email,
        platform: seller.platform,
        trustScore: seller.trustScore
      }))
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json(
      { error: 'Failed to seed demo data' },
      { status: 500 }
    );
  }
}
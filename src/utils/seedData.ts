import dbConnect from '../lib/mongodb';
import Seller from '../lib/models/Seller';

export async function seedDemoData() {
  await dbConnect();

  // Check if demo sellers already exist
  const existingSellers = await Seller.find({ email: { $in: ['demo1@example.com', 'demo2@example.com'] } });
  
  if (existingSellers.length > 0) {
    console.log('Demo data already exists');
    return existingSellers;
  }

  // Create demo sellers
  const demoSellers = [
    {
      name: 'Rajesh Electronics',
      email: 'demo1@example.com',
      phone: '+91-9876543210',
      platform: 'whatsapp',
      trustScore: 85,
      totalVerifications: 15,
      successfulVerifications: 13
    },
    {
      name: 'Priya Fashion Store',
      email: 'demo2@example.com',
      phone: '+91-9876543211',
      platform: 'instagram',
      trustScore: 92,
      totalVerifications: 25,
      successfulVerifications: 24
    },
    {
      name: 'Tech Gadgets Hub',
      email: 'demo3@example.com',
      phone: '+91-9876543212',
      platform: 'facebook',
      trustScore: 67,
      totalVerifications: 8,
      successfulVerifications: 5
    }
  ];

  const createdSellers = await Seller.insertMany(demoSellers);
  console.log('Demo data seeded successfully');
  return createdSellers;
}
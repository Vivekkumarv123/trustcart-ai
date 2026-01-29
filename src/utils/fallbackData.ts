// Fallback data when database is unavailable
export const fallbackSellers = [
  {
    id: 'fallback-1',
    sellerId: 'SELLER-ABC-123',
    name: 'Demo Electronics Store',
    email: 'demo1@example.com',
    platform: 'whatsapp',
    trustScore: 85,
    totalVerifications: 12,
    successfulVerifications: 10,
    isNewSeller: false
  },
  {
    id: 'fallback-2',
    sellerId: 'SELLER-XYZ-456',
    name: 'Fashion Hub',
    email: 'demo2@example.com',
    platform: 'instagram',
    trustScore: 92,
    totalVerifications: 8,
    successfulVerifications: 8,
    isNewSeller: false
  },
  {
    id: 'fallback-3',
    sellerId: 'SELLER-DEF-789',
    name: 'Home Essentials',
    email: 'demo3@example.com',
    platform: 'facebook',
    trustScore: null,
    totalVerifications: 0,
    successfulVerifications: 0,
    isNewSeller: true
  }
];

export const fallbackStats = {
  totalSellers: 3,
  totalVerifications: 35,
  averageTrustScore: 85
};
'use client';

import { useState, useEffect } from 'react';

interface TrustScoreDisplayProps {
  sellerId: string;
}

interface TrustData {
  trustScore: number | null;
  totalVerifications: number;
  successfulVerifications: number;
  successRate: number;
  label: string;
  color: string;
  emoji: string;
  isNewSeller?: boolean;
}

export default function TrustScoreDisplay({ sellerId }: TrustScoreDisplayProps) {
  const [trustData, setTrustData] = useState<TrustData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrustScore();
  }, [sellerId]);

  const fetchTrustScore = async () => {
    try {
      // Determine if this is a public seller ID or MongoDB ObjectId
      const isPublicId = sellerId.startsWith('SELLER-');
      const endpoint = isPublicId 
        ? `/api/trust-score/public/${sellerId}`
        : `/api/trust-score/${sellerId}`;
      
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        // Handle different response formats
        if (isPublicId) {
          // Public API returns seller data in different format
          const seller = data.seller;
          setTrustData({
            trustScore: seller.trustScore,
            totalVerifications: seller.totalVerifications,
            successfulVerifications: seller.successfulVerifications,
            successRate: seller.totalVerifications > 0 
              ? Math.round((seller.successfulVerifications / seller.totalVerifications) * 100)
              : 0,
            label: getTrustScoreLabel(seller.trustScore).label,
            color: getTrustScoreLabel(seller.trustScore).color,
            emoji: getTrustScoreLabel(seller.trustScore).emoji,
            isNewSeller: seller.isNewSeller
          });
        } else {
          // Regular API returns trustData directly
          setTrustData(data.trustData);
        }
      } else {
        setError(data.error || 'Failed to fetch trust score');
      }
    } catch (error) {
      setError('Failed to fetch trust score');
      console.error('Trust score fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreLabel = (score: number | null): { label: string; color: string; emoji: string } => {
    if (score === null) return { label: 'New Seller', color: 'text-blue-600', emoji: '🆕' };
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (score >= 80) return { label: 'Very Good', color: 'text-green-500', emoji: '✅' };
    if (score >= 70) return { label: 'Good', color: 'text-yellow-500', emoji: '👍' };
    if (score >= 60) return { label: 'Fair', color: 'text-orange-500', emoji: '⚠️' };
    return { label: 'Poor', color: 'text-red-500', emoji: '🚨' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!trustData) return null;

  const getScoreBarColor = (score: number | null) => {
    if (score === null) return 'bg-blue-500';
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Trust Score</h3>
      
      {/* Main Trust Score */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-2xl">{trustData.emoji}</span>
          <span className={`text-3xl font-bold ${trustData.color}`}>
            {trustData.trustScore === null ? 'NEW' : trustData.trustScore}
          </span>
          {trustData.trustScore !== null && <span className="text-gray-500 text-lg">/100</span>}
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${trustData.color} bg-opacity-10`}>
          {trustData.label}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getScoreBarColor(trustData.trustScore)}`}
            style={{ width: `${trustData.trustScore === null ? 0 : trustData.trustScore}%` }}
          ></div>
        </div>
        {trustData.trustScore === null && (
          <p className="text-center text-sm text-blue-600 mt-2">
            Trust score will be calculated after first verification
          </p>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-gray-900">
            {trustData.totalVerifications}
          </div>
          <div className="text-sm text-gray-600">Total Verifications</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {trustData.successfulVerifications}
          </div>
          <div className="text-sm text-gray-600">Successful</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">
            {trustData.successRate}%
          </div>
          <div className="text-sm text-gray-600">Success Rate</div>
        </div>
      </div>

      {/* Trust Score Explanation */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How Trust Score Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Based on promise vs proof verification accuracy</li>
          <li>• Updated with each new transaction verification</li>
          <li>• Considers both recent performance and historical data</li>
          <li>• Higher scores indicate more trustworthy sellers</li>
        </ul>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaStar, FaCheck } from 'react-icons/fa';
import QuickSetup from './QuickSetup';

interface Seller {
  id: string;
  name: string;
  email: string;
  platform: string;
  trustScore: number;
  totalVerifications: number;
}

interface SellerLookupProps {
  onSellerSelect: (seller: Seller) => void;
  selectedSeller?: Seller | null;
}

export default function SellerLookup({ onSellerSelect, selectedSeller }: SellerLookupProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = sellers.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.platform.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSellers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredSellers(sellers.slice(0, 5)); // Show top 5 sellers by default
      setShowDropdown(false);
    }
  }, [searchTerm, sellers]);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sellers');
      const data = await response.json();
      
      if (data.success) {
        setSellers(data.sellers);
        setFilteredSellers(data.sellers.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerSelect = (seller: Seller) => {
    onSellerSelect(seller);
    setSearchTerm(seller.name);
    setShowDropdown(false);
  };

  const getPlatformEmoji = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp': return '💬';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      default: return '🛍️';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-green-500 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-4">
      {/* Quick Setup - Show when no sellers exist */}
      {sellers.length === 0 && !loading && <QuickSetup />}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Find Seller
        </label>
        <div className="relative">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by name, email, or platform..."
            />
          </div>

          {/* Dropdown */}
          {(showDropdown || searchTerm.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm">Loading sellers...</p>
                </div>
              ) : filteredSellers.length > 0 ? (
                <div className="py-1">
                  {filteredSellers.map((seller) => (
                    <button
                      key={seller.id}
                      onClick={() => handleSellerSelect(seller)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUser className="text-blue-600 text-sm" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {seller.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {seller.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs">
                                {getPlatformEmoji(seller.platform)} {seller.platform}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {seller.totalVerifications} verifications
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrustScoreColor(seller.trustScore)}`}>
                            <FaStar className="mr-1 text-xs" />
                            {seller.trustScore}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No sellers found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Seller Display */}
      {selectedSeller && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaCheck className="text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-green-900">
                Selected Seller: {selectedSeller.name}
              </h4>
              <p className="text-xs text-green-700">
                {selectedSeller.email} • {getPlatformEmoji(selectedSeller.platform)} {selectedSeller.platform}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrustScoreColor(selectedSeller.trustScore)}`}>
                  <FaStar className="mr-1 text-xs" />
                  Trust Score: {selectedSeller.trustScore}
                </span>
                <span className="text-xs text-green-600">
                  {selectedSeller.totalVerifications} total verifications
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 How to Find Sellers</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Search by seller name (e.g., "Rajesh Electronics")</li>
          <li>• Search by email address</li>
          <li>• Search by platform (WhatsApp, Instagram, Facebook)</li>
          <li>• Browse the list of registered sellers</li>
        </ul>
      </div>
    </div>
  );
}
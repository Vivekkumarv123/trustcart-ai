'use client';

import { useState } from 'react';
import { FaEdit, FaSearch } from 'react-icons/fa';

interface ManualSellerInputProps {
  onSellerInfo: (info: { id: string; name: string }) => void;
}

export default function ManualSellerInput({ onSellerInfo }: ManualSellerInputProps) {
  const [sellerId, setSellerId] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [showManual, setShowManual] = useState(false);

  const handleSubmit = () => {
    if (sellerId.trim()) {
      onSellerInfo({
        id: sellerId.trim(),
        name: sellerName.trim() || 'Unknown Seller'
      });
    }
  };

  if (!showManual) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Can't find the seller in our directory?
          </p>
          <button
            onClick={() => setShowManual(true)}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <FaEdit className="text-xs" />
            <span>Enter Seller Details Manually</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <FaEdit className="text-yellow-600" />
        <h4 className="font-medium text-yellow-800">Manual Seller Entry</h4>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seller ID or Email *
          </label>
          <input
            type="text"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter seller email or ID"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seller Name (Optional)
          </label>
          <input
            type="text"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter seller name for reference"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowManual(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!sellerId.trim()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
          >
            Use This Seller
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-yellow-700">
        💡 Tip: Ask the seller to register on TrustCart AI for better verification experience
      </div>
    </div>
  );
}
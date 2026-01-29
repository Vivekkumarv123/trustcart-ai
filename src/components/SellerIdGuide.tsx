'use client';

import { FaSearch, FaUserPlus, FaQrcode, FaEnvelope, FaWhatsapp, FaInstagram } from 'react-icons/fa';

export default function SellerIdGuide() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaSearch className="text-blue-600 text-xl" />
        </div>
        <h3 className="text-xl font-bold text-blue-900 mb-2">How to Find Sellers</h3>
        <p className="text-blue-700 text-sm">
          Multiple ways to identify and verify sellers on TrustCart AI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Method 1: Search Directory */}
        <div className="bg-white rounded-xl p-4 border border-blue-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaSearch className="text-blue-600 text-sm" />
            </div>
            <h4 className="font-semibold text-gray-900">Browse Directory</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Use the Seller Directory tab to search by name, email, or platform.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Search by seller name</li>
            <li>• Filter by platform</li>
            <li>• Sort by trust score</li>
          </ul>
        </div>

        {/* Method 2: Direct Contact */}
        <div className="bg-white rounded-xl p-4 border border-green-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FaEnvelope className="text-green-600 text-sm" />
            </div>
            <h4 className="font-semibold text-gray-900">Ask the Seller</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Request the seller's TrustCart ID directly via chat or email.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• WhatsApp: "Share TrustCart ID"</li>
            <li>• Instagram: DM for verification</li>
            <li>• Email: Request seller profile</li>
          </ul>
        </div>

        {/* Method 3: Registration */}
        <div className="bg-white rounded-xl p-4 border border-purple-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaUserPlus className="text-purple-600 text-sm" />
            </div>
            <h4 className="font-semibold text-gray-900">New Seller?</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            If the seller isn't registered, they can create a profile first.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• Go to Register Seller tab</li>
            <li>• Complete profile setup</li>
            <li>• Get unique seller ID</li>
          </ul>
        </div>
      </div>

      {/* Common Seller ID Formats */}
      <div className="mt-6 bg-white rounded-xl p-4 border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
          <FaQrcode className="mr-2 text-gray-600" />
          Common ID Formats
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-2">Email-based lookup:</p>
            <ul className="text-gray-600 space-y-1 font-mono text-xs">
              <li>• seller@example.com</li>
              <li>• shop.owner@gmail.com</li>
              <li>• business@domain.com</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-2">Platform handles:</p>
            <ul className="text-gray-600 space-y-1 font-mono text-xs">
              <li>• @instagram_shop</li>
              <li>• WhatsApp Business Name</li>
              <li>• Facebook Page Name</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Use the search feature in verification form for instant lookup</li>
          <li>• Sellers with higher trust scores appear first in search results</li>
          <li>• You can verify using seller email instead of numeric ID</li>
        </ul>
      </div>
    </div>
  );
}
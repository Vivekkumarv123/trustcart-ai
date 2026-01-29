'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaMagic, FaRocket } from 'react-icons/fa';

export default function QuickSetup() {
  const [loading, setLoading] = useState(false);

  const setupDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Demo sellers created! You can now search for them.');
      } else {
        toast.error('Setup failed');
      }
    } catch (error) {
      toast.error('Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-8">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaRocket className="text-purple-600 text-xl" />
        </div>
        <h3 className="text-xl font-bold text-purple-900 mb-2">Quick Setup</h3>
        <p className="text-purple-700 text-sm mb-6">
          No sellers in the system yet? Create some demo sellers to get started with verification.
        </p>
        
        <button
          onClick={setupDemo}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          <FaMagic className="text-sm" />
          <span>{loading ? 'Setting up...' : 'Create Demo Sellers'}</span>
        </button>
        
        <div className="mt-4 text-xs text-purple-600">
          This will create 3 demo sellers: Rajesh Electronics, Priya Fashion Store, and Tech Gadgets Hub
        </div>
      </div>
    </div>
  );
}
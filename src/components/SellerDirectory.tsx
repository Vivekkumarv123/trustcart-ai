'use client';

import { useState, useEffect } from 'react';
import { FaUser, FaStar, FaSearch, FaChevronRight, FaGlobe } from 'react-icons/fa';
import { fallbackSellers } from '../utils/fallbackData';

interface Seller {
  id: string;
  sellerId: string;
  name: string;
  email: string;
  platform: string;
  trustScore: number | null;
  totalVerifications: number;
  successfulVerifications: number;
  isNewSeller?: boolean;
}

interface SellerDirectoryProps {
  onSellerSelect?: (seller: Seller) => void;
}

export default function SellerDirectory({ onSellerSelect }: SellerDirectoryProps) {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('trustScore');
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterAndSortSellers();
  }, [sellers, searchTerm, platformFilter, sortBy]);

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers');
      const data = await response.json();
      if (data.success) {
        setSellers(data.sellers);
        setUsingFallback(data.fallback || false);
      } else {
        console.error('Failed to fetch sellers:', data.error);
        // Use fallback data on error
        setSellers(fallbackSellers);
        setUsingFallback(true);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      // Use fallback data on error
      setSellers(fallbackSellers);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSellers = () => {
    let filtered = [...sellers];
    if (searchTerm) {
      filtered = filtered.filter(seller =>
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (platformFilter !== 'all') {
      filtered = filtered.filter(seller => seller.platform === platformFilter);
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'trustScore': return b.trustScore - a.trustScore;
        case 'verifications': return b.totalVerifications - a.totalVerifications;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    setFilteredSellers(filtered);
  };

  const getPlatformEmoji = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp': return '💬';
      case 'instagram': return '📸';
      case 'facebook': return '👥';
      default: return '🛍️';
    }
  };

  const getTrustScoreStyles = (score: number | null, isNewSeller?: boolean) => {
    if (score === null || isNewSeller) return 'text-blue-700 bg-blue-50 border-blue-100';
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
    if (score >= 80) return 'text-blue-700 bg-blue-50 border-blue-100';
    if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-rose-700 bg-rose-50 border-rose-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-100 rounded-full w-48"></div>
          <div className="grid grid-cols-3 gap-4">
             <div className="h-10 bg-slate-50 rounded-xl"></div>
             <div className="h-10 bg-slate-50 rounded-xl"></div>
             <div className="h-10 bg-slate-50 rounded-xl"></div>
          </div>
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-slate-50 rounded-3xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Controls */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Directory</h2>
                <p className="text-sm text-slate-500 mt-1">Global index of sellers with AI-validated trust scores.</p>
            </div>
            <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                <FaGlobe className="text-indigo-600 text-[10px]" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-none">Global Index</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative group">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
            />
          </div>
          
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="all">🌐 All Platforms</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="instagram">📸 Instagram</option>
            <option value="facebook">👥 Facebook</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="trustScore">💎 Sort by Trust Score</option>
            <option value="verifications">📊 Sort by Verifications</option>
            <option value="name">📝 Sort by Name</option>
          </select>
        </div>
      </div>

      {/* List Area */}
      <div className="p-4 md:p-8 min-h-[400px]">
        {filteredSellers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredSellers.map((seller) => (
              <div
                key={seller.id}
                className="group relative border border-slate-100 bg-white rounded-3xl p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                      <FaUser className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={20} />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">
                        {seller.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 mb-2">{seller.email}</p>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex items-center px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-100 uppercase tracking-tighter">
                          {getPlatformEmoji(seller.platform)} {seller.platform}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {seller.totalVerifications} Audits
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-tighter">
                          {Math.round((seller.successfulVerifications / seller.totalVerifications) * 100) || 0}% Accuracy
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-end md:space-x-8 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                    <div className="text-center">
                      <div className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-black border transition-all ${getTrustScoreStyles(seller.trustScore, seller.isNewSeller)}`}>
                        <FaStar className="mr-2 text-xs" />
                        {seller.trustScore === null || seller.isNewSeller ? 'New' : seller.trustScore}
                      </div>
                    </div>
                    
                    {onSellerSelect && (
                      <button
                        onClick={() => onSellerSelect(seller)}
                        className="group/btn relative px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl overflow-hidden hover:bg-indigo-600 active:scale-95 transition-all flex items-center"
                      >
                        <span className="relative z-10">Select Merchant</span>
                        <FaChevronRight className="ml-2 text-[10px] group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                <FaSearch className="text-slate-200 text-3xl" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No matches found</h3>
            <p className="text-slate-500 text-sm max-w-xs text-center mt-1">
              {searchTerm || platformFilter !== 'all' 
                ? 'Try adjusting your filters to find the right merchant.'
                : 'The directory is currently being indexed.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-slate-50/50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing {filteredSellers.length} Results</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total Index: {sellers.length}</span>
        </div>
        <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {usingFallback ? 'Demo Mode' : 'Live Sync Active'}
            </span>
        </div>
      </div>
    </div>
  );
}
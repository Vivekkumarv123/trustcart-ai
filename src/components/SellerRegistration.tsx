'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineDeviceMobile, HiOutlineBadgeCheck, HiOutlineClipboardCopy } from 'react-icons/hi';

interface SellerRegistrationProps {
  onSellerRegistered: (seller: any) => void;
}

export default function SellerRegistration({ onSellerRegistered }: SellerRegistrationProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    platform: 'whatsapp' as 'whatsapp' | 'instagram' | 'facebook' | 'other'
  });
  const [loading, setLoading] = useState(false);
  const [registeredSeller, setRegisteredSeller] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Seller registered successfully!');
        setRegisteredSeller(data.seller);
        onSellerRegistered(data.seller);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Failed to register seller');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Seller ID copied to clipboard!');
  };

  // Show success screen after registration
  if (registeredSeller) {
    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
          
          {/* Success Header */}
          <div className="p-8 sm:p-12 border-b border-slate-50 bg-gradient-to-r from-green-50 to-emerald-50 text-center">
            <div className="inline-flex p-4 rounded-3xl bg-white border border-green-100 shadow-sm mb-6">
              <HiOutlineBadgeCheck className="text-green-600 text-3xl" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
              Registration Complete!
            </h2>
            <p className="text-slate-500 text-sm mt-3 font-medium tracking-wide">
              Your seller profile has been created successfully.
            </p>
          </div>

          {/* Seller ID Display */}
          <div className="p-8 sm:p-12">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 mb-8">
              <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                <HiOutlineBadgeCheck className="mr-2" />
                Your Public Seller ID
              </h3>
              <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-indigo-200">
                <code className="text-2xl font-mono font-bold text-indigo-600">
                  {registeredSeller.sellerId}
                </code>
                <button
                  onClick={() => copyToClipboard(registeredSeller.sellerId)}
                  className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <HiOutlineClipboardCopy />
                  <span>Copy</span>
                </button>
              </div>
              <p className="text-sm text-indigo-700 mt-3">
                Share this ID with customers so they can verify your trust score and view your verification history.
              </p>
            </div>

            {/* Seller Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 mb-2">Business Name</h4>
                <p className="text-slate-600">{registeredSeller.name}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 mb-2">Platform</h4>
                <p className="text-slate-600 capitalize">{formData.platform}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 mb-2">Trust Score</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-bold">🆕 New Seller</span>
                  <span className="text-xs text-slate-500">(Pending first verification)</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 mb-2">Status</h4>
                <p className="text-green-600 font-bold">Active</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-3">Next Steps:</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Share your Seller ID with customers for trust verification</li>
                <li>• Start processing transactions to build your trust score</li>
                <li>• Monitor your verification history in the dashboard</li>
                <li>• Maintain high trust scores for better customer confidence</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setRegisteredSeller(null);
                setFormData({ name: '', email: '', phone: '', platform: 'whatsapp' });
              }}
              className="w-full mt-6 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Register Another Seller
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
        
        {/* Header Section */}
        <div className="p-8 sm:p-12 border-b border-slate-50 bg-slate-50/30 text-center">
          <div className="inline-flex p-4 rounded-3xl bg-white border border-slate-100 shadow-sm mb-6">
            <HiOutlineBadgeCheck className="text-indigo-600 text-3xl" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic leading-none">
            Merchant Onboarding
          </h2>
          <p className="text-slate-500 text-sm mt-3 font-medium tracking-wide">
            Register your business profile to begin generating neural trust metrics.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seller Name */}
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <HiOutlineUser className="mr-1" /> Business Identity *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                placeholder="e.g. Acme Threads"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <HiOutlineMail className="mr-1" /> Support Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                placeholder="business@example.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <HiOutlinePhone className="mr-1" /> Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-2">
              <label className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <HiOutlineDeviceMobile className="mr-1" /> Sales Platform *
              </label>
              <div className="relative group">
                <select
                  required
                  value={formData.platform}
                  onChange={(e) => handleChange('platform', e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="instagram">Instagram Direct</option>
                  <option value="facebook">Facebook Marketplace</option>
                  <option value="other">Other Digital Channel</option>
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative group overflow-hidden bg-slate-900 text-white py-5 rounded-[1.25rem] font-black uppercase tracking-[0.3em] text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 transition-all"
          >
            <span className={loading ? 'opacity-0' : 'opacity-100'}>Initialize Protocol</span>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              </div>
            )}
          </button>
        </form>

        {/* Benefits Footer */}
        <div className="p-8 sm:px-12 sm:pb-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Neural Scoring', desc: 'Real-time trust calculation' },
            { title: 'Audit Ledger', desc: 'Immutable transaction proof' },
            { title: 'SLA Tracking', desc: 'Promise vs Delivery metrics' },
            { title: 'Verified Status', desc: 'Build buyer confidence' },
          ].map((benefit, i) => (
            <div key={i} className="flex items-start space-x-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 animate-pulse" />
              <div>
                <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{benefit.title}</p>
                <p className="text-[10px] text-slate-500 font-medium">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
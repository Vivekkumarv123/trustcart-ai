'use client';

import { useAuth } from '../contexts/AuthContext';
import { FaFingerprint, FaGoogle, FaArrowRight, FaShieldAlt, FaChartBar, FaUserCircle } from 'react-icons/fa';

export default function AuthDemo() {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2rem] p-8 md:p-12 mb-12 shadow-sm">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60" />

      <div className="relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full mb-4">
            <FaShieldAlt className="text-indigo-600 text-xs" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-700">Platform Security</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
            The Trust Protocol
          </h3>
          <p className="text-slate-500 text-base leading-relaxed">
            Unlock the full potential of TrustCart AI. Secure your identity to begin 
            verifying global commerce transactions with our advanced neural engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Email Card */}
          <div className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-6 transition-all duration-300">
            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-600 group-hover:text-indigo-600 transition-colors">
              <FaFingerprint size={20} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Native Authentication</h4>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center">• Secure credentials management</li>
              <li className="flex items-center">• Multi-factor readiness</li>
              <li className="flex items-center">• Personalized environment sync</li>
            </ul>
          </div>

          {/* Google Card */}
          <div className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-6 transition-all duration-300">
            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-600 group-hover:text-rose-500 transition-colors">
              <FaGoogle size={18} />
            </div>
            <h4 className="font-bold text-slate-900 mb-2">Social Singularity</h4>
            <ul className="text-sm text-slate-500 space-y-2">
              <li className="flex items-center">• Instant OAuth 2.0 provisioning</li>
              <li className="flex items-center">• Automated profile hydration</li>
              <li className="flex items-center">• Passwordless security architecture</li>
            </ul>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-indigo-400 mb-6 flex items-center">
            <span className="w-8 h-[1px] bg-indigo-400 mr-3" />
            Member Privileges
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col">
              <FaChartBar className="text-indigo-400 mb-3" size={20} />
              <strong className="text-base font-bold mb-1">Advanced Analytics</strong>
              <p className="text-slate-400 text-xs leading-relaxed">Deep-dive into verification history and trust trends.</p>
            </div>
            <div className="flex flex-col">
              <FaShieldAlt className="text-indigo-400 mb-3" size={20} />
              <strong className="text-base font-bold mb-1">Protected Tools</strong>
              <p className="text-slate-400 text-xs leading-relaxed">Full access to seller registration and API verification.</p>
            </div>
            <div className="flex flex-col">
              <FaUserCircle className="text-indigo-400 mb-3" size={20} />
              <strong className="text-base font-bold mb-1">Identity Control</strong>
              <p className="text-slate-400 text-xs leading-relaxed">Manage your public trust presence across the marketplace.</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="inline-flex items-center text-sm font-semibold text-indigo-600 animate-bounce">
            Ready to start? Use the controls in the header <FaArrowRight className="ml-2 text-xs" />
          </p>
        </div>
      </div>
    </div>
  );
}
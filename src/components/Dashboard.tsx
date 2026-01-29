'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaShieldAlt, FaChartLine, FaClock, FaChevronRight } from 'react-icons/fa';

interface DashboardProps {
  onNavigateToVerify?: () => void;
  onNavigateToAudit?: () => void;
}

export default function Dashboard({ onNavigateToVerify, onNavigateToAudit }: DashboardProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recentVerifications, setRecentVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const profileResponse = await fetch(`/api/auth/profile?firebaseUid=${user?.uid}`);
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        setUserProfile(profileData.user);
        const verifyResponse = await fetch(`/api/verify?buyerEmail=${user?.email}`);
        const verifyData = await verifyResponse.json();
        if (verifyData.success) {
          setRecentVerifications(verifyData.verifications.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-[2rem] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-3xl" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- Elevated Welcome Header --- */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50" />
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 z-10">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-3xl" />
              ) : (
                user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full" />
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome, {user?.displayName || user?.email?.split('@')[0]}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200">
                {userProfile?.role || 'Buyer'} Account
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- Minimalist Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: 'Verifications', 
            val: recentVerifications.length, 
            icon: FaShieldAlt, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50',
            onClick: recentVerifications.length === 0 ? onNavigateToVerify : undefined
          },
          { 
            label: 'Trust Score', 
            val: userProfile?.sellerId ? 'View Score' : 'N/A', 
            icon: FaChartLine, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50',
            onClick: !userProfile?.sellerId ? onNavigateToVerify : undefined
          },
          { 
            label: 'System Access', 
            val: userProfile?.role || 'Buyer', 
            icon: FaUser, 
            color: 'text-violet-600', 
            bg: 'bg-violet-50'
          },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={`group bg-white border border-slate-200 rounded-3xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
              stat.onClick ? 'cursor-pointer hover:border-indigo-200' : ''
            }`}
            onClick={() => {
              console.log('Stat card clicked:', stat.label);
              stat.onClick?.();
            }}
            title={stat.onClick ? 'Click to start verification' : undefined}
          >
            <div className="flex items-center justify-between">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon size={20} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 capitalize">{stat.val}</p>
                {stat.onClick && (
                  <p className="text-[8px] text-indigo-500 uppercase tracking-widest mt-1">Click to start</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Modern Activity Feed --- */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 flex items-center">
            <FaClock className="mr-3 text-slate-300" />
            Recent Activity
          </h3>
          <button 
            onClick={() => {
              console.log('View All clicked');
              onNavigateToAudit?.();
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest flex items-center"
          >
            View All <FaChevronRight className="ml-2 text-[10px]" />
          </button>
        </div>

        <div className="p-4">
          {recentVerifications.length > 0 ? (
            <div className="space-y-2">
              {recentVerifications.map((verification, index) => (
                <div key={index} className="group flex items-center justify-between p-5 hover:bg-slate-50 rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all shadow-sm">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none">
                        Ref: #{verification.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1.5 flex items-center">
                        <span className="font-semibold text-indigo-600">{verification.overallScore}/100</span>
                        <span className="mx-2 opacity-20">|</span>
                        {verification.mismatchCount} Mismatches detected
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="hidden md:block text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified on</p>
                      <p className="text-xs font-medium text-slate-600">{new Date(verification.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      verification.overallScore >= 80 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : verification.overallScore >= 60
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {verification.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-slate-200 text-3xl" />
              </div>
              <h4 className="text-slate-900 font-bold mb-1">Silence is Trust</h4>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">No transaction data has been processed yet. Start verifying to populate your metrics.</p>
              <button 
                onClick={() => {
                  console.log('Run First Verification clicked');
                  onNavigateToVerify?.();
                }}
                className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-full hover:bg-slate-800 transition-all"
              >
                Run First Verification
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
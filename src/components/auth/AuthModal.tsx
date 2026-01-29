'use client';

import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Sync mode with initialMode when modal opens
  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Backdrop with premium blur */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white rounded-[28px] shadow-2xl shadow-indigo-500/10 max-w-md w-full mx-4 overflow-hidden border border-slate-200/60 transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Top Decorative Element (Subtle brand touch) */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

        {/* Header */}
        <div className="flex justify-between items-center px-8 pt-10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === 'login' 
                ? 'Sign in to access your trust dashboard.' 
                : 'Join TrustCart to verify your transactions.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mt-8 -mr-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            aria-label="Close modal"
          >
            <FaTimes size={18} />
          </button>
        </div>
        
        {/* Content Area */}
        <div className="px-8 pb-5">
          <div className="mt-4">
            {mode === 'login' ? (
              <LoginForm 
                onSwitchToSignup={() => setMode('signup')} 
                onClose={onClose}
              />
            ) : (
              <SignupForm 
                onSwitchToLogin={() => setMode('login')} 
                onClose={onClose}
              />
            )}
          </div>
        </div>

        {/* Security Footer (Optional visual aid) */}
        <div className="bg-slate-50 px-8  border-t border-slate-100 flex items-center justify-center space-x-2">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
            Secure Encrypted Authentication
          </span>
        </div>
      </div>
    </div>
  );
}
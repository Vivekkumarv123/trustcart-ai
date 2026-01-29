'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onClose: () => void;
}

export default function LoginForm({ onSwitchToSignup, onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Social Login Section - Elevated to the top for convenience */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGoogle className="text-rose-500 mr-3 text-base" />
        Continue with Google
      </button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
          <span className="px-4 bg-white text-slate-400">or use email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[13px] font-bold text-slate-700 ml-1 mb-2 uppercase tracking-wide">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
            placeholder="name@company.com"
          />
        </div>

        <div>
          <div className="flex justify-between items-center ml-1 mb-2">
            <label className="block text-[13px] font-bold text-slate-700 uppercase tracking-wide">
              Password
            </label>
            <button type="button" className="text-[12px] font-semibold text-indigo-600 hover:text-indigo-700">
              Forgot?
            </button>
          </div>
          <div className="relative group">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed group"
        >
          <span className={`transition-all duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
            Sign in to TrustCart
          </span>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-50 text-center">
        <p className="text-sm text-slate-500 font-medium">
          New to the platform?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-indigo-600 hover:text-indigo-700 font-bold underline-offset-4 hover:underline transition-all"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
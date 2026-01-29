'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onClose: () => void;
}

export default function SignupForm({ onSwitchToLogin, onClose }: SignupFormProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.displayName);
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
      {/* Social Registration */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full flex items-center justify-center px-4 py-3 border border-slate-200 rounded-2xl bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaGoogle className="text-rose-500 mr-3 text-base" />
        Sign up with Google
      </button>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
          <span className="px-4 bg-white text-slate-400 font-sans">or register with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label className="block text-[12px] font-bold text-slate-700 ml-1 mb-2 uppercase tracking-wide">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.displayName}
            onChange={(e) => handleChange('displayName', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
            placeholder="Vivek Kumar"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-[12px] font-bold text-slate-700 ml-1 mb-2 uppercase tracking-wide">
            Email Address
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
            placeholder="name@example.com"
          />
        </div>

        {/* Password Grid (Side by side on larger screens if needed, but stacked is cleaner for mobile/modals) */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-[12px] font-bold text-slate-700 ml-1 mb-2 uppercase tracking-wide">
              Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900"
                placeholder="••••••••"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-slate-700 ml-1 mb-2 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="relative group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-900"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full overflow-hidden bg-slate-900 text-white py-4 mt-2 rounded-2xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 active:scale-[0.99] transition-all disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <span className={loading ? 'opacity-0' : 'opacity-100'}>
            Create Free Account
          </span>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </button>
      </form>

      {/* Navigation & Terms */}
      <div className="mt-8 space-y-4 text-center">
        <p className="text-sm text-slate-500 font-medium">
          Already a member?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-600 hover:text-indigo-700 font-bold underline-offset-4 hover:underline transition-all"
          >
            Sign in
          </button>
        </p>
        
        <p className="text-[11px] leading-relaxed text-slate-400 max-w-[280px] mx-auto uppercase tracking-tighter">
          By joining, you agree to the{' '}
          <span className="text-slate-600 cursor-pointer hover:text-indigo-600">Terms</span> and{' '}
          <span className="text-slate-600 cursor-pointer hover:text-indigo-600">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
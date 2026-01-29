'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaChevronDown, FaShieldAlt } from 'react-icons/fa';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDisplayName = () => user.displayName || user.email?.split('@')[0] || 'User';

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2.5 p-1 pr-3 rounded-full border transition-all duration-200 active:scale-95 ${
          isOpen 
          ? 'bg-slate-100 border-slate-200 shadow-inner' 
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center ring-2 ring-white shadow-sm">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Show initials if image fails to load
                const target = e.currentTarget;
                const parent = target.parentElement;
                if (parent) {
                  target.style.display = 'none';
                  const initialsSpan = parent.querySelector('.initials-fallback') as HTMLElement;
                  if (initialsSpan) {
                    initialsSpan.style.display = 'flex';
                  }
                }
              }}
            />
          ) : null}
          <span 
            className={`initials-fallback text-[11px] font-bold text-white tracking-tighter ${user.photoURL ? 'hidden' : 'flex'}`}
          >
            {getInitials()}
          </span>
        </div>
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-xs font-bold text-slate-800 tracking-tight">{getDisplayName()}</span>
          <span className="text-[10px] text-indigo-600 font-semibold uppercase mt-0.5 tracking-wider">Account</span>
        </div>
        <FaChevronDown className={`text-[10px] text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 origin-top-right bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 z-50 border border-slate-200/60 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 mb-1">
            <div className="flex items-center space-x-3 mb-3">
               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <FaShieldAlt className="text-indigo-500" />
               </div>
               <div className="flex flex-col overflow-hidden">
                 <p className="text-sm font-bold text-slate-900 truncate">{getDisplayName()}</p>
                 <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
               </div>
            </div>
            <div className="bg-indigo-50 rounded-lg px-3 py-1.5 flex justify-between items-center">
               <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Trust Member</span>
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="px-2 space-y-0.5">
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                <FaUser className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              Profile Settings
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                <FaSignOutAlt className="text-slate-400 group-hover:text-rose-500 transition-colors" />
              </div>
              Sign Out
            </button>
          </div>

          {/* Footer Info */}
          <div className="mt-2 pt-2 border-t border-slate-50 px-5 pb-2">
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-slate-300">Verified Session</p>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  HiOutlineHome, 
  HiOutlineShieldCheck, 
  HiOutlineIdentification, 
  HiOutlineDatabase, 
  HiOutlineChartBar, 
  HiOutlineDocumentText,
  HiMenuAlt3,
  HiX
} from 'react-icons/hi';

// Component Imports
import VerificationForm from '../components/VerificationForm';
import VerificationResult from '../components/VerificationResult';
import SellerRegistration from '../components/SellerRegistration';
import TrustScoreDisplay from '../components/TrustScoreDisplay';
import DemoSection from '../components/DemoSection';
import SystemStats from '../components/SystemStats';
import AuthModal from '../components/auth/AuthModal';
import UserMenu from '../components/auth/UserMenu';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Dashboard from '../components/Dashboard';
import AuthDemo from '../components/AuthDemo';
import SellerDirectory from '../components/SellerDirectory';
import AuditLogViewer from '@/components/AuditLogViewer';
import SellerLookup from '../components/SellerLookup';

export default function Home() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'verify' | 'register' | 'directory' | 'trustscore' | 'audit'>('dashboard');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user && activeTab === 'dashboard') {
      setActiveTab('verify');
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: HiOutlineHome, auth: true },
    { id: 'verify', label: 'Verify', icon: HiOutlineShieldCheck, auth: false },
    { id: 'register', label: 'Register', icon: HiOutlineIdentification, auth: false },
    { id: 'directory', label: 'Market', icon: HiOutlineDatabase, auth: false },
    //{ id: 'trustscore', label: 'Trust', icon: HiOutlineChartBar, auth: false },
    { id: 'audit', label: 'Audit', icon: HiOutlineDocumentText, auth: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Initializing Trust Protocol...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* --- Sticky Header --- */}
      <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 h-16 sm:h-20 flex justify-between items-center">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center space-x-3 group cursor-pointer active:scale-95 transition-transform" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-3 transition-transform">
              <span className="text-white font-black text-xl tracking-tighter italic">T</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none uppercase">TrustCart</h1>
              <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase opacity-80">AI Protocol</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-6">
            <div className="hidden md:flex items-center space-x-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Live: V2.0.4</span>
            </div>

            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-full border border-slate-200/60">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all border border-slate-200/50"
                >
                  Join
                </button>
              </div>
            )}

            {/* Mobile Burger Menu */}
            <button 
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <HiX size={24}/> : <HiMenuAlt3 size={24}/>}
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Viewport Layout --- */}
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-[calc(100-80px)]">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block w-72 p-8 h-[calc(100vh-80px)] sticky top-20">
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-4 space-y-2">
            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Menu</p>
            {tabs.map((tab) => (
              (!tab.auth || user) && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <tab.icon size={20} className={activeTab === tab.id ? 'text-indigo-400' : ''} />
                  <span>{tab.label}</span>
                </button>
              )
            ))}
          </div>
          
          <div className="mt-8 px-4">
             <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="text-sm font-black italic">Go Pro</h4>
                 <p className="text-[10px] opacity-80 mt-1">Unlock AI-batch verification & API access.</p>
               </div>
               <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
             </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <span className="font-black italic text-xl">TrustCart</span>
                <button onClick={() => setIsMobileMenuOpen(false)}><HiX size={24}/></button>
              </div>
              <div className="space-y-4">
                {tabs.map(tab => (!tab.auth || user) && (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-2xl text-base font-bold transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <tab.icon size={24}/>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 px-4 sm:px-8 py-8 lg:py-12 pb-32 lg:pb-12">
          
          {/* Contextual Global Header */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight capitalize">
              {activeTab.replace('trustscore', 'Analytics')}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-2">
              Managing secure verification protocols across the {activeTab === 'directory' ? 'marketplace' : 'platform'}.
            </p>
          </div>

          <div className="w-full">
            {!user && <AuthDemo />}
            
            {/* Action Bar Container */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              <div className="xl:col-span-8 space-y-8 transition-all duration-500">
                {activeTab === 'dashboard' && (
                  <ProtectedRoute fallback={<AuthPrompt icon="🏠" title="Your Dashboard" description="Sign in to track your verification history and business metrics." openModal={openAuthModal} />}>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 sm:p-10 shadow-sm transition-all hover:shadow-md">
                      <Dashboard 
                        onNavigateToVerify={() => setActiveTab('verify')} 
                        onNavigateToAudit={() => setActiveTab('audit')}
                      />
                    </div>
                  </ProtectedRoute>
                )}

                {activeTab === 'verify' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!user && !verificationResult && <DemoSection onDemoComplete={setVerificationResult} />}
                    {!verificationResult ? (
                      <ProtectedRoute fallback={<AuthPrompt icon="🔒" title="Verification Locked" description="Please sign in to run our AI verification engine on your documents." openModal={openAuthModal} />}>
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 sm:p-10 shadow-sm">
                          <VerificationForm onVerificationComplete={setVerificationResult} />
                        </div>
                      </ProtectedRoute>
                    ) : (
                      <VerificationResult result={verificationResult} onNewVerification={() => setVerificationResult(null)} />
                    )}
                  </div>
                )}

                {activeTab === 'register' && (
                  <ProtectedRoute fallback={<AuthPrompt icon="👤" title="Seller Portal" description="Create a professional profile to begin building your public Trust Score." openModal={openAuthModal} />}>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
                      <SellerRegistration onSellerRegistered={(s: any) => { setSelectedSellerId(s.id); setActiveTab('trustscore'); }} />
                    </div>
                  </ProtectedRoute>
                )}

                {activeTab === 'directory' && (
                  <div className="animate-in fade-in duration-500">
                    <SellerDirectory />
                  </div>
                )}

                {activeTab === 'trustscore' && (
                  <div className="max-w-2xl mx-auto">
                    {selectedSellerId ? (
                      <div className="space-y-6">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 shadow-sm">
                          <button
                            onClick={() => setSelectedSellerId('')}
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-4 flex items-center space-x-2"
                          >
                            <span>←</span>
                            <span>Search Different Seller</span>
                          </button>
                        </div>
                        <TrustScoreDisplay sellerId={selectedSellerId} />
                      </div>
                    ) : (
                      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-12 shadow-sm">
                        <div className="text-center mb-8">
                          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">📊</div>
                          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Search Trust Metric</h3>
                          <p className="text-slate-500 mb-8">Find a seller to view their complete trust score and verification history.</p>
                        </div>

                        {/* Seller Search Options */}
                        <div className="space-y-6">
                          {/* Option 1: Search by Name/Email */}
                          <div className="border border-slate-200 rounded-2xl p-6">
                            <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                              <span>Search by Name or Email</span>
                            </h4>
                            <p className="text-slate-500 text-sm mb-4">Find sellers you've worked with before</p>
                            <SellerLookup 
                              onSellerSelect={(seller) => setSelectedSellerId(seller.id)} 
                              selectedSeller={null}
                            />
                          </div>

                          {/* Option 2: Public Seller ID */}
                          <div className="border border-slate-200 rounded-2xl p-6">
                            <h4 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                              <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                              <span>Enter Public Seller ID</span>
                            </h4>
                            <p className="text-slate-500 text-sm mb-4">If you have a seller's public ID (format: SELLER-ABC-123)</p>
                            <div className="flex space-x-3">
                              <input
                                type="text"
                                placeholder="SELLER-ABC-123"
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-mono text-center uppercase transition-all"
                                onChange={(e) => {
                                  const value = e.target.value.toUpperCase();
                                  if (value.startsWith('SELLER-') && value.length >= 10) {
                                    setSelectedSellerId(value);
                                  }
                                }}
                              />
                              <button
                                onClick={() => {
                                  const input = document.querySelector('input[placeholder="SELLER-ABC-123"]') as HTMLInputElement;
                                  if (input?.value) {
                                    setSelectedSellerId(input.value.toUpperCase());
                                  }
                                }}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                              >
                                Search
                              </button>
                            </div>
                          </div>

                          {/* Help Section */}
                          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                            <h4 className="font-bold text-blue-900 mb-3">💡 How to Find Sellers</h4>
                            <ul className="text-sm text-blue-800 space-y-2">
                              <li className="flex items-start space-x-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span><strong>Search by name:</strong> Type the seller's business name or personal name</span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span><strong>Search by email:</strong> Enter their email address</span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span><strong>Public ID:</strong> Sellers share their public ID (SELLER-ABC-123) for easy lookup</span>
                              </li>
                              <li className="flex items-start space-x-2">
                                <span className="text-blue-600 mt-0.5">•</span>
                                <span><strong>Browse directory:</strong> Check the "Directory" tab to see all registered sellers</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'audit' && (
                  <ProtectedRoute fallback={<AuthPrompt icon="📜" title="Audit Center" description="Sign in to view critical system logs and ledger history." openModal={openAuthModal} />}>
                    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
                      <AuditLogViewer />
                    </div>
                  </ProtectedRoute>
                )}
              </div>

              {/* Sidebar Widgets (Hidden on dashboard on mobile) */}
              <div className="xl:col-span-4 space-y-8 hidden xl:block sticky top-32">
                 <SystemStats />
                 <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <h4 className="font-black text-lg mb-4 italic">Security Status</h4>
                    <div className="space-y-4 relative z-10">
                       <div className="flex justify-between items-center text-xs">
                          <span className="opacity-60">LLM Verification</span>
                          <span className="text-emerald-400 font-bold">Encrypted</span>
                       </div>
                       <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-400 h-full w-[94%] rounded-full"></div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Mobile Bottom Tab Bar (App-like Feel) --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50">
         {tabs.slice(0, 4).map(tab => (
           <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`p-2 rounded-2xl flex flex-col items-center transition-all ${activeTab === tab.id ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
           >
             <tab.icon size={22}/>
             <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{tab.label}</span>
           </button>
         ))}
      </nav>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-200 pb-32 lg:pb-16 mt-20">
        <div className="max-w-[1600px] mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black italic">T</div>
                <span className="font-black text-xl tracking-tight">TrustCart AI</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                Next-generation integrity protocol for social commerce. We bridge the gap between promises and proof using decentralized AI verification logic.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Infrastructure</h4>
              <ul className="text-sm text-slate-500 space-y-3">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Neural Engine</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Audit Ledger</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Developer API</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Legal</h4>
              <ul className="text-sm text-slate-500 space-y-3">
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy Protocol</li>
                <li className="hover:text-indigo-600 cursor-pointer transition-colors">Terms of Trust</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authModalMode} />
    </div>
  );
}

function AuthPrompt({ icon, title, description, openModal }: any) {
  return (
    <div className="max-w-md mx-auto text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-6xl mb-8 filter grayscale opacity-20">{icon}</div>
      <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 mb-10 text-sm leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row justify-center gap-4 px-10">
        <button
          onClick={() => openModal('login')}
          className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          Sign In
        </button>
        <button
          onClick={() => openModal('signup')}
          className="flex-1 bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
        >
          Register
        </button>
      </div>
    </div>
  );
}
'use client';

import { HiOutlinePrinter, HiOutlineRefresh, HiOutlineShieldCheck, HiOutlineExclamationCircle } from 'react-icons/hi';

interface Mismatch { field: string; promised: string | number; actual: string | number; severity: 'low' | 'medium' | 'high'; explanation: string; }
interface VerificationResultProps {
  result: {
    verification: { mismatches: Mismatch[]; overallScore: number; aiAnalysis: string; };
    seller: { name: string; newTrustScore: number; };
  };
  onNewVerification: () => void;
}

export default function VerificationResult({ result, onNewVerification }: VerificationResultProps) {
  const { verification, seller } = result;
  
  const getScoreTheme = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' };
  };

  const theme = getScoreTheme(verification.overallScore);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-900/5" />
        
        <div className="mb-6 inline-flex p-4 rounded-3xl bg-slate-50 border border-slate-100">
          <HiOutlineShieldCheck className="text-slate-900 text-3xl" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic mb-2">Audit Verdict</h2>
        <p className="text-slate-500 text-sm mb-10 tracking-widest font-bold uppercase">Report Generated for {seller.name}</p>

        <div className="relative inline-block">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" 
              strokeDasharray={552.9} 
              strokeDashoffset={552.9 - (552.9 * verification.overallScore) / 100} 
              strokeLinecap="round" className={theme.text} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black tracking-tighter ${theme.text}`}>{verification.overallScore.toFixed(0)}</span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Trust Index</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-70">Impact Statement</h3>
          <p className="text-lg font-bold leading-relaxed italic">
            Merchant reputation recalculated to {seller.newTrustScore}/100 based on recent audit discrepancies.
          </p>
        </div>
        
        <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-50">AI Post-Analysis</h3>
          <p className="text-sm leading-relaxed text-slate-300 font-medium">
            {verification.aiAnalysis}
          </p>
        </div>
      </div>

      {verification.mismatches.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
             <div className="h-px bg-slate-200 flex-1" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anomaly Breakdown</span>
             <div className="h-px bg-slate-200 flex-1" />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {verification.mismatches.map((m, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-slate-300">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                   <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl bg-slate-50 text-slate-900`}>
                         <HiOutlineExclamationCircle size={20} />
                      </div>
                      <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{m.field.replace(/([A-Z])/g, ' $1')}</span>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${m.severity === 'high' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      {m.severity} RISK
                   </span>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-6 leading-relaxed">{m.explanation}</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Promised</p>
                      <p className="text-sm font-bold text-slate-900">{m.promised}</p>
                   </div>
                   <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <p className="text-[9px] font-black text-rose-400 uppercase mb-1">Actual</p>
                      <p className="text-sm font-bold text-rose-900">{m.actual}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-600 rounded-[2.5rem] p-12 text-center text-white shadow-xl shadow-emerald-100">
           <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineShieldCheck size={32} />
           </div>
           <h3 className="text-2xl font-black italic mb-2 tracking-tight">Zero Anomalies Detected</h3>
           <p className="text-emerald-50 text-sm max-w-sm mx-auto leading-relaxed">This transaction aligns perfectly with merchant claims. Trust Protocol suggests high integrity.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12">
        <button onClick={onNewVerification} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 flex items-center justify-center hover:scale-[1.02] transition-all"><HiOutlineRefresh className="mr-2" /> Start New Audit</button>
        <button onClick={() => window.print()} className="flex-1 bg-white border border-slate-200 text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center hover:bg-slate-50 transition-all"><HiOutlinePrinter className="mr-2" /> Export Report</button>
      </div>
    </div>
  );
}
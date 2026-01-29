'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { demoPromises, demoInvoices } from '../utils/demoData';
import { FaPlay, FaCheckCircle, FaExclamationTriangle, FaMagic, FaMicrochip } from 'react-icons/fa';

interface DemoSectionProps {
  onDemoComplete: (result: any) => void;
}

export default function DemoSection({ onDemoComplete }: DemoSectionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<'good' | 'bad'>('good');

  const runDemo = async () => {
    setLoading(true);
    try {
      // First, seed demo data
      await fetch('/api/seed', { method: 'POST' });
      
      // Use a known demo seller email instead of dynamic ID lookup
      const demoSellerEmail = 'demo1@example.com';
      const promise = demoPromises[selectedDemo === 'good' ? 0 : 1];
      const invoice = demoInvoices[selectedDemo === 'good' ? 0 : 1];

      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellerId: demoSellerEmail, // Use email instead of ID
          buyerEmail: 'demo.buyer@example.com',
          promise,
          invoice
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyData.success) {
        toast.success('Simulation complete');
        onDemoComplete(verifyData);
      } else {
        toast.error(verifyData.error || 'Simulation failed');
      }
    } catch (error) {
      toast.error('Internal processing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 mb-12 shadow-sm transition-all hover:shadow-md">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full mb-4">
              <FaMicrochip className="text-slate-500 text-[10px]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600">Sandboxed Environment</span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
              Neural Simulation
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Experience the TrustCart AI engine in action. Select a pre-configured 
              merchant scenario to observe how the verification logic detects transactional integrity.
            </p>
          </div>

          {/* Segmented Control Toggle */}
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center w-full md:w-auto self-start">
            <button
              onClick={() => setSelectedDemo('good')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                selectedDemo === 'good'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FaCheckCircle className={selectedDemo === 'good' ? 'text-emerald-500' : 'text-slate-300'} />
              <span>Compliant</span>
            </button>
            <button
              onClick={() => setSelectedDemo('bad')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                selectedDemo === 'bad'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FaExclamationTriangle className={selectedDemo === 'bad' ? 'text-rose-500' : 'text-slate-300'} />
              <span>Anomalous</span>
            </button>
          </div>
        </div>

        {/* Dynamic Context Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2 bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col justify-center">
            <div className="flex items-start space-x-4">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                 selectedDemo === 'good' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-rose-100 border-rose-200 text-rose-600'
               }`}>
                 {selectedDemo === 'good' ? <FaCheckCircle size={20} /> : <FaExclamationTriangle size={20} />}
               </div>
               <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">
                    {selectedDemo === 'good' ? 'Scenario: High Integrity Merchant' : 'Scenario: Policy Mismatch Detected'}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                    {selectedDemo === 'good'
                      ? 'In this simulation, the invoice data perfectly aligns with the social commerce promise, resulting in a high Trust Score.'
                      : 'This merchant displays hidden costs and modified return windows upon document generation, triggering a trust alert.'
                    }
                  </p>
               </div>
            </div>
          </div>

          <button
            onClick={runDemo}
            disabled={loading}
            className="relative group overflow-hidden bg-slate-900 rounded-3xl p-6 transition-all hover:bg-indigo-600 active:scale-[0.98] disabled:bg-slate-200 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-white rounded-full animate-spin" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Processing</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                   <FaPlay className="text-xs translate-x-0.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-center">Execute Simulation</span>
              </div>
            )}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-4 opacity-40">
           <div className="h-px bg-slate-300 w-full" />
           <div className="flex items-center shrink-0 space-x-2">
              <FaMagic className="text-[10px]" />
              <span className="text-[9px] font-bold uppercase tracking-tighter">Powered by Neural Verification v2</span>
           </div>
           <div className="h-px bg-slate-300 w-full" />
        </div>
      </div>
    </div>
  );
}
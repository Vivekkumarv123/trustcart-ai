'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HiOutlineChevronRight, HiOutlineChevronLeft, HiOutlineShieldCheck, HiOutlineDocumentText, HiOutlineUserCircle } from 'react-icons/hi';
import { demoPromises, demoInvoices } from '../utils/demoData';
import SellerLookup from './SellerLookup';
import SellerIdGuide from './SellerIdGuide';
import ManualSellerInput from './ManualSellerInput';

// Interfaces remain unchanged as per logic constraints
interface PromiseData { price: number; deliveryCharges: number; deliveryTime: string; returnPolicy: string; productDescription: string; }
interface InvoiceData extends PromiseData { invoiceNumber?: string; invoiceDate?: string; }
interface VerificationFormProps { onVerificationComplete: (result: any) => void; }
interface Seller { id: string; name: string; email: string; platform: string; trustScore: number; totalVerifications: number; }

export default function VerificationForm({ onVerificationComplete }: VerificationFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [manualSellerInfo, setManualSellerInfo] = useState<{id: string; name: string} | null>(null);
  const [buyerEmail, setBuyerEmail] = useState('');
  
  const [promise, setPromise] = useState<PromiseData>({ price: 0, deliveryCharges: 0, deliveryTime: '', returnPolicy: '', productDescription: '' });
  const [invoice, setInvoice] = useState<InvoiceData>({ price: 0, deliveryCharges: 0, deliveryTime: '', returnPolicy: '', productDescription: '', invoiceNumber: '', invoiceDate: '' });

  const handlePromiseChange = (field: keyof PromiseData, value: string | number) => setPromise(prev => ({ ...prev, [field]: value }));
  const handleInvoiceChange = (field: keyof InvoiceData, value: string | number) => setInvoice(prev => ({ ...prev, [field]: value }));

  const handleVerification = async () => {
    const sellerId = selectedSeller?.id || manualSellerInfo?.id;
    if (!sellerId || !buyerEmail) { toast.error('Selection incomplete'); return; }

    setLoading(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId, buyerEmail, promise, invoice })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Analysis Complete');
        onVerificationComplete(data);
      } else {
        toast.error(data.error || 'Verification failed');
      }
    } catch (error) {
      toast.error('Processing error');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { n: 1, label: 'Context', icon: HiOutlineUserCircle },
    { n: 2, label: 'The Promise', icon: HiOutlineShieldCheck },
    { n: 3, label: 'The Proof', icon: HiOutlineDocumentText }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      {step === 1 && !selectedSeller && !manualSellerInfo && <SellerIdGuide />}
      
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Step Header */}
        <div className="bg-slate-50/50 border-b border-slate-100 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Protocol Alpha</h2>
              <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-widest">Cross-Reference Verification</p>
            </div>
            
            <div className="flex items-center space-x-2">
              {steps.map((s) => (
                <div key={s.n} className="flex items-center">
                  <div className={`flex flex-col items-center transition-all ${step >= s.n ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step >= s.n ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                      <s.icon size={20} />
                    </div>
                  </div>
                  {s.n < 3 && <div className={`w-8 h-0.5 mx-2 rounded-full ${step > s.n ? 'bg-slate-900' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Merchant Selection</h3>
                  <SellerLookup onSellerSelect={setSelectedSeller} selectedSeller={selectedSeller} />
                  {!selectedSeller && <ManualSellerInput onSellerInfo={(info) => { setManualSellerInfo(info); setSelectedSeller(null); }} />}
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Recipient Data</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest ml-1">Buyer Email Identity</label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="identity@provider.com"
                    />
                  </div>
                  {manualSellerInfo && !selectedSeller && (
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center animate-in zoom-in-95">
                      <div>
                        <p className="text-xs font-bold text-indigo-900 italic">{manualSellerInfo.name}</p>
                        <p className="text-[10px] text-indigo-600 font-mono mt-0.5">{manualSellerInfo.id}</p>
                      </div>
                      <button onClick={() => setManualSellerInfo(null)} className="text-[10px] font-black uppercase text-indigo-600 hover:underline">Reset</button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={(!selectedSeller && !manualSellerInfo) || !buyerEmail}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-xl shadow-slate-200 flex items-center justify-center"
              >
                Proceed to Promise Phase <HiOutlineChevronRight className="ml-2" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">The Verbal Agreement</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Promised Price (₹)', field: 'price', type: 'number' },
                  { label: 'Delivery Fee (₹)', field: 'deliveryCharges', type: 'number' },
                  { label: 'SLA (Time)', field: 'deliveryTime', type: 'text', placeholder: 'e.g. 24 Hours' },
                  { label: 'Return Policy', field: 'returnPolicy', type: 'text', placeholder: 'e.g. 7 Days' },
                ].map((input) => (
                  <div key={input.field}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest ml-1">{input.label}</label>
                    <input
                      type={input.type}
                      value={(promise as any)[input.field]}
                      onChange={(e) => handlePromiseChange(input.field as any, input.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                      placeholder={input.placeholder}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                <textarea
                  value={promise.productDescription}
                  onChange={(e) => handlePromiseChange('productDescription', e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Paste chat message or social media caption details here..."
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 px-8 py-5 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center"><HiOutlineChevronLeft className="mr-2" /> Back</button>
                <button onClick={() => setStep(3)} className="flex-[2] bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all flex items-center justify-center">Evidence Phase <HiOutlineChevronRight className="ml-2" /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Final Document Verification</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Final Billing (₹)', field: 'price', type: 'number' },
                  { label: 'Actual Charges (₹)', field: 'deliveryCharges', type: 'number' },
                  { label: 'Actual Lead Time', field: 'deliveryTime', type: 'text' },
                  { label: 'Invoice Return Clause', field: 'returnPolicy', type: 'text' },
                  { label: 'Bill Serial No.', field: 'invoiceNumber', type: 'text' },
                  { label: 'Issue Date', field: 'invoiceDate', type: 'date' },
                ].map((input) => (
                  <div key={input.field}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest ml-1">{input.label}</label>
                    <input
                      type={input.type}
                      value={(invoice as any)[input.field]}
                      onChange={(e) => handleInvoiceChange(input.field as any, input.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Invoice Itemization</label>
                <textarea
                  value={invoice.productDescription}
                  onChange={(e) => handleInvoiceChange('productDescription', e.target.value)}
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all resize-none"
                  placeholder="Transcription of the physical or digital invoice..."
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 px-8 py-5 border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50 transition-all flex items-center justify-center"><HiOutlineChevronLeft className="mr-2" /> Back</button>
                <button 
                  onClick={handleVerification} 
                  disabled={loading}
                  className="flex-[2] bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 disabled:bg-slate-100 transition-all flex items-center justify-center shadow-xl shadow-indigo-100"
                >
                  {loading ? 'Analyzing Neural Data...' : 'Submit Audit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
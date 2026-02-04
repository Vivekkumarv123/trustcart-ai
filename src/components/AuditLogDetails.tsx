'use client';

import React from 'react';
import { 
  HiOutlineUser, 
  HiOutlineShoppingCart, 
  HiOutlineChartBar, 
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamation,
  HiOutlineDocumentText,
  HiOutlineShieldCheck
} from 'react-icons/hi';

interface AuditLogDetailsProps {
  log: {
    _id: string;
    action: string;
    userId?: string;
    sellerId?: string;
    verificationId?: string;
    details: any;
    metadata: {
      userAgent?: string;
      ipAddress?: string;
      timestamp: string;
      aiModel?: string;
      processingTime?: number;
    };
    severity: 'info' | 'warning' | 'error' | 'critical';
    createdAt: string;
  };
}

export default function AuditLogDetails({ log }: AuditLogDetailsProps) {
  const getActionTitle = () => {
    switch (log.action) {
      case 'verification_completed':
        return 'Verification Complete - User vs Seller Comparison';
      case 'seller_registered':
        return 'New Seller Joined Platform';
      default:
        return log.action.replace(/_/g, ' ').toUpperCase();
    }
  };

  const getActionIcon = () => {
    switch (log.action) {
      case 'verification_completed':
        return <HiOutlineShieldCheck className="w-5 h-5 text-green-600" />;
      case 'seller_registered':
        return <HiOutlineUser className="w-5 h-5 text-purple-600" />;
      default:
        return <HiOutlineClock className="w-5 h-5 text-slate-600" />;
    }
  };

  const renderUserPurchaseDetails = () => {
    if (log.action !== 'verification_completed') return null;

    const promise = log.details.promise || {};
    
    return (
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <HiOutlineUser className="w-5 h-5 text-blue-600" />
          <h4 className="text-lg font-bold text-blue-900">What User Expected</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Price Promised</div>
              <div className="text-2xl font-black text-blue-900">₹{promise.price || 0}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Delivery Charges</div>
              <div className="text-2xl font-black text-blue-900">₹{promise.deliveryCharges || 0}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Delivery Time</div>
              <div className="text-lg font-bold text-blue-900">{promise.deliveryTime || 'Not specified'}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Return Policy</div>
              <div className="text-lg font-bold text-blue-900">{promise.returnPolicy || 'Not specified'}</div>
            </div>
          </div>
        </div>
        
        {promise.productDescription && (
          <div className="mt-4 bg-white rounded-xl p-4 border border-blue-100">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">Product Description</div>
            <div className="text-sm text-blue-800 leading-relaxed">{promise.productDescription}</div>
          </div>
        )}
      </div>
    );
  };

  const renderSellerProof = () => {
    if (log.action !== 'verification_completed') return null;

    const invoice = log.details.invoice || {};
    
    // Don't render if no invoice data
    if (!invoice.price && !invoice.productDescription && !invoice.deliveryCharges) return null;
    
    return (
      <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <HiOutlineShoppingCart className="w-5 h-5 text-green-600" />
          <h4 className="text-lg font-bold text-green-900">What Seller Actually Delivered</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Final Price</div>
              <div className="text-2xl font-black text-green-900">₹{invoice.price || 0}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Actual Charges</div>
              <div className="text-2xl font-black text-green-900">₹{invoice.deliveryCharges || 0}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Actual Delivery</div>
              <div className="text-lg font-bold text-green-900">{invoice.deliveryTime || 'Not specified'}</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Actual Policy</div>
              <div className="text-lg font-bold text-green-900">{invoice.returnPolicy || 'Not specified'}</div>
            </div>
          </div>
        </div>
        
        {invoice.productDescription && (
          <div className="mt-4 bg-white rounded-xl p-4 border border-green-100">
            <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Invoice Description</div>
            <div className="text-sm text-green-800 leading-relaxed">{invoice.productDescription}</div>
          </div>
        )}
        
        {(invoice.invoiceNumber || invoice.invoiceDate) && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {invoice.invoiceNumber && (
              <div className="bg-white rounded-xl p-4 border border-green-100">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Invoice Number</div>
                <div className="text-sm font-bold text-green-900">{invoice.invoiceNumber}</div>
              </div>
            )}
            {invoice.invoiceDate && (
              <div className="bg-white rounded-xl p-4 border border-green-100">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Invoice Date</div>
                <div className="text-sm font-bold text-green-900">{invoice.invoiceDate}</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTrustScoreResult = () => {
    if (log.action !== 'verification_completed') return null;
    
    const result = log.details.result;
    const mismatches = log.details.criticalMismatches || [];
    
    if (!result) return null;

    const scoreColor = result.overallScore >= 80 ? 'text-green-600' : 
                      result.overallScore >= 60 ? 'text-amber-600' : 'text-red-600';
    
    const scoreBg = result.overallScore >= 80 ? 'bg-green-50 border-green-200' : 
                    result.overallScore >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
    
    const scoreIcon = result.overallScore >= 80 ? <HiOutlineCheckCircle /> :
                     result.overallScore >= 60 ? <HiOutlineExclamation /> : <HiOutlineXCircle />;

    return (
      <div className={`${scoreBg} rounded-2xl p-6 border`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={scoreColor}>{scoreIcon}</div>
          <h4 className="text-lg font-bold text-slate-900">Trust Score Analysis</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div className="bg-white rounded-xl p-4">
            <div className={`text-3xl font-black ${scoreColor}`}>
              {result.overallScore || 0}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Trust Score</div>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-black text-slate-900">
              {result.mismatchCount || 0}
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Issues Found</div>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <div className="text-3xl font-black text-slate-900">
              {result.processingTime || 0}<span className="text-sm">ms</span>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase mt-1">Analysis Time</div>
          </div>
        </div>
        
        {/* Show mismatches if any */}
        {mismatches && mismatches.length > 0 && (
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Issues Detected</div>
            <div className="space-y-2">
              {mismatches.map((mismatch, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    mismatch.severity === 'high' ? 'bg-red-500' : 
                    mismatch.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {mismatch.field.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-sm text-slate-800 mt-1">{mismatch.explanation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {result.newTrustScore && (
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Seller's New Trust Score</div>
            <div className="text-2xl font-black text-slate-900">{result.newTrustScore}</div>
          </div>
        )}
      </div>
    );
  };

  const renderSellerInfo = () => {
    if (log.action !== 'seller_registered') return null;

    return (
      <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <HiOutlineUser className="w-5 h-5 text-purple-600" />
          <h4 className="text-lg font-bold text-purple-900">New Seller Registration</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Seller Name</div>
            <div className="text-lg font-bold text-purple-900">{log.details.sellerName || 'Unknown'}</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-purple-100">
            <div className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Email</div>
            <div className="text-lg font-bold text-purple-900">{log.details.email || 'Not provided'}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        {getActionIcon()}
        <div>
          <h3 className="text-lg font-bold text-slate-900">{getActionTitle()}</h3>
          <p className="text-sm text-slate-600">
            {new Date(log.createdAt).toLocaleString()} • {log.details.buyerEmail || log.userId}
          </p>
        </div>
      </div>

      {/* Content based on action type */}
      {renderUserPurchaseDetails()}
      {renderSellerProof()}
      {renderTrustScoreResult()}
      {renderSellerInfo()}
    </div>
  );
}
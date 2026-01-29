'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaBug, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function VerificationTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      // Use the regular verification API with test data
      const testData = {
        sellerId: 'demo1@example.com', // Use demo seller
        buyerEmail: 'test@example.com',
        promise: {
          price: 10,
          deliveryCharges: 0,
          deliveryTime: "1",
          returnPolicy: "5",
          productDescription: "taken 20000 for 4 year replacement warranty of laptop"
        },
        invoice: {
          price: 10,
          deliveryCharges: 0,
          deliveryTime: "1",
          returnPolicy: "0",
          productDescription: "taken 20000 for 4 year repair warranty of laptop",
          invoiceNumber: "",
          invoiceDate: "2026-01-29"
        }
      };

      // First ensure demo sellers exist
      await fetch('/api/seed', { method: 'POST' });
      
      // Run verification
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestResult({
          testCase: "User reported bug case",
          promise: testData.promise,
          invoice: testData.invoice,
          result: {
            mismatches: data.verification.mismatches,
            overallScore: data.verification.overallScore,
            analysis: data.verification.aiAnalysis
          }
        });
        toast.success('Test completed!');
      } else {
        toast.error(data.error || 'Test failed');
      }
    } catch (error) {
      toast.error('Test failed');
      console.error('Test error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-4">
        <FaBug className="text-red-600 text-xl" />
        <h3 className="text-xl font-bold text-gray-900">Verification Engine Test</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Test the improved verification engine with the problematic case that was scoring 100/100 incorrectly.
      </p>

      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed mb-6"
      >
        {loading ? 'Testing...' : 'Run Verification Test'}
      </button>

      {testResult && (
        <div className="space-y-6">
          {/* Test Case */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Test Case: {testResult.testCase}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <h5 className="font-medium text-green-800 mb-2">Promise</h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Price: ₹{testResult.promise.price}</li>
                  <li>Delivery: {testResult.promise.deliveryTime} day(s)</li>
                  <li>Return Policy: {testResult.promise.returnPolicy} days</li>
                  <li>Description: {testResult.promise.productDescription}</li>
                </ul>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h5 className="font-medium text-red-800 mb-2">Invoice</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>Price: ₹{testResult.invoice.price}</li>
                  <li>Delivery: {testResult.invoice.deliveryTime} day(s)</li>
                  <li>Return Policy: {testResult.invoice.returnPolicy} days</li>
                  <li>Description: {testResult.invoice.productDescription}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                testResult.result.overallScore >= 80 ? 'bg-green-100 text-green-600' :
                testResult.result.overallScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {testResult.result.overallScore >= 80 ? <FaCheckCircle /> : <FaExclamationTriangle />}
              </div>
              <div>
                <h4 className="font-bold text-blue-900">
                  Trust Score: {testResult.result.overallScore}/100
                </h4>
                <p className="text-sm text-blue-700">
                  {testResult.result.mismatches.length} mismatch(es) detected
                </p>
              </div>
            </div>

            {/* Mismatches */}
            {testResult.result.mismatches.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-blue-900 mb-2">Detected Mismatches:</h5>
                <div className="space-y-2">
                  {testResult.result.mismatches.map((mismatch: any, index: number) => (
                    <div key={index} className="bg-white border border-blue-200 rounded p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          mismatch.severity === 'high' ? 'bg-red-100 text-red-800' :
                          mismatch.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {mismatch.severity.toUpperCase()}
                        </span>
                        <span className="font-medium text-gray-900 capitalize">
                          {mismatch.field.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{mismatch.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            <div className="bg-white border border-blue-200 rounded p-3">
              <h5 className="font-medium text-blue-900 mb-2">AI Analysis:</h5>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {testResult.result.analysis}
              </pre>
            </div>
          </div>

          {/* Expected vs Actual */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">🔍 What Should Be Detected:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• <strong>Return Policy:</strong> "5 days" vs "0 days" - CRITICAL difference</li>
              <li>• <strong>Product Description:</strong> "replacement" vs "repair" - MAJOR difference</li>
              <li>• <strong>Expected Score:</strong> Should be much lower than 100/100</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
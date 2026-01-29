'use client';

import { useState } from 'react';
import { FaWifi, FaDatabase, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

export default function ConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runConnectionTest = async () => {
    setTesting(true);
    setResults(null);

    const testResults = {
      database: { status: 'testing', message: 'Testing...', time: 0 },
      firebase: { status: 'testing', message: 'Testing...', time: 0 }
    };

    try {
      // Test database connection
      const dbStart = Date.now();
      const dbResponse = await fetch('/api/health');
      const dbData = await dbResponse.json();
      const dbTime = Date.now() - dbStart;

      testResults.database = {
        status: dbData.success ? 'success' : 'error',
        message: dbData.success 
          ? `Connected in ${dbData.database.connectionTime}` 
          : dbData.error || 'Connection failed',
        time: dbTime
      };

      // Test Firebase (simple check)
      const firebaseStart = Date.now();
      try {
        // Just check if Firebase is initialized
        const { auth } = await import('../lib/firebase');
        const firebaseTime = Date.now() - firebaseStart;
        
        testResults.firebase = {
          status: 'success',
          message: `Firebase initialized in ${firebaseTime}ms`,
          time: firebaseTime
        };
      } catch (firebaseError) {
        testResults.firebase = {
          status: 'error',
          message: 'Firebase initialization failed',
          time: Date.now() - firebaseStart
        };
      }

    } catch (error) {
      testResults.database = {
        status: 'error',
        message: 'Network error or timeout',
        time: 0
      };
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <FaCheckCircle className="text-green-500" />;
      case 'error': return <FaExclamationTriangle className="text-red-500" />;
      case 'testing': return <FaSpinner className="text-blue-500 animate-spin" />;
      default: return <FaWifi className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'testing': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FaWifi className="mr-2 text-blue-500" />
          Connection Diagnostics
        </h3>
        <button
          onClick={runConnectionTest}
          disabled={testing}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
        >
          {testing ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Testing...
            </>
          ) : (
            'Run Test'
          )}
        </button>
      </div>

      {results && (
        <div className="space-y-4">
          {/* Database Test */}
          <div className={`border rounded-lg p-4 ${getStatusColor(results.database.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaDatabase className="mr-3 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">MongoDB Database</h4>
                  <p className="text-sm text-gray-600">{results.database.message}</p>
                </div>
              </div>
              <div className="flex items-center">
                {getStatusIcon(results.database.status)}
                <span className="ml-2 text-sm text-gray-500">{results.database.time}ms</span>
              </div>
            </div>
          </div>

          {/* Firebase Test */}
          <div className={`border rounded-lg p-4 ${getStatusColor(results.firebase.status)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaWifi className="mr-3 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Firebase Authentication</h4>
                  <p className="text-sm text-gray-600">{results.firebase.message}</p>
                </div>
              </div>
              <div className="flex items-center">
                {getStatusIcon(results.firebase.status)}
                <span className="ml-2 text-sm text-gray-500">{results.firebase.time}ms</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {(results.database.status === 'error' || results.firebase.status === 'error') && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {results.database.status === 'error' && (
                  <>
                    <li>• Check your internet connection</li>
                    <li>• Verify MongoDB Atlas cluster is running</li>
                    <li>• Check if your IP address is whitelisted in MongoDB Atlas</li>
                    <li>• Verify MONGODB_URI in .env.local is correct</li>
                  </>
                )}
                {results.firebase.status === 'error' && (
                  <>
                    <li>• Check Firebase project configuration</li>
                    <li>• Verify all Firebase environment variables are set</li>
                    <li>• Check if domain is authorized in Firebase console</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {!results && !testing && (
        <div className="text-center py-8 text-gray-500">
          <FaWifi className="mx-auto text-4xl mb-4 text-gray-300" />
          <p>Click "Run Test" to check your database and authentication connections</p>
        </div>
      )}
    </div>
  );
}
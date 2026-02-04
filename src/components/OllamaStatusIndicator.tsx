'use client';

import { useState, useEffect } from 'react';
import { HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineRefresh, HiOutlineExclamation  } from 'react-icons/hi';

interface OllamaHealth {
  available: boolean;
  isRunning: boolean;
  hasModel: boolean;
  error?: string;
  suggestion?: string;
  setupInstructions?: string[];
}

export default function OllamaStatusIndicator() {
  const [status, setStatus] = useState<'checking' | 'loaded'>('checking');
  const [health, setHealth] = useState<OllamaHealth | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const checkStatus = async () => {
    setStatus('checking');
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data.ollama);
      setStatus('loaded');
    } catch (error) {
      setHealth({
        available: false,
        isRunning: false,
        hasModel: false,
        error: 'Health check failed',
        suggestion: 'Check server connection'
      });
      setStatus('loaded');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        <span>Checking AI...</span>
      </div>
    );
  }

  if (!health) return null;

  const getStatusIcon = () => {
    if (health.available) {
      return <HiOutlineCheckCircle className="w-4 h-4 text-green-600" />;
    } else if (health.isRunning && !health.hasModel) {
      return <HiOutlineExclamation  className="w-4 h-4 text-amber-600" />;
    } else {
      return <HiOutlineXCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    if (health.available) {
      return 'AI Verification Active';
    } else if (health.isRunning && !health.hasModel) {
      return 'Model Missing';
    } else {
      return 'Rule-based Mode';
    }
  };

  const getStatusColor = () => {
    if (health.available) return 'text-green-600';
    if (health.isRunning && !health.hasModel) return 'text-amber-600';
    return 'text-slate-400';
  };

  return (
    <div className="relative">
      <div 
        className={`flex items-center gap-2 text-xs cursor-pointer ${getStatusColor()}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon()}
        <span className="font-medium">{getStatusText()}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            checkStatus();
          }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          title="Refresh status"
        >
          <HiOutlineRefresh className="w-3 h-3" />
        </button>
      </div>

      {showDetails && health.error && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-lg z-50 min-w-80">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HiOutlineExclamation  className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-900">Ollama Issue Detected</span>
            </div>
            
            <div className="text-xs text-slate-600">
              <p className="font-medium text-red-600 mb-1">Error: {health.error}</p>
              {health.suggestion && (
                <p className="text-slate-700 mb-2">💡 {health.suggestion}</p>
              )}
            </div>

            {health.setupInstructions && (
              <div className="text-xs">
                <p className="font-medium text-slate-900 mb-2">Quick Setup:</p>
                <ol className="space-y-1 text-slate-600">
                  {health.setupInstructions.map((instruction, i) => (
                    <li key={i} className="font-mono text-[10px] bg-slate-50 px-2 py-1 rounded">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-500">
                System will automatically use rule-based verification as fallback.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
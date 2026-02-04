
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  HiOutlineSearch, 
  HiOutlineFilter, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineExclamation,
  HiOutlineInformationCircle,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineChip,
  HiOutlineUser
} from 'react-icons/hi';
import AuditLogDetails from './AuditLogDetails';

interface AuditLog {
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
}

interface LogStats {
  totalLogs: number;
  logsByAction: { [key: string]: number };
  logsBySeverity: { [key: string]: number };
  recentActivity: number;
}

export default function AuditLogViewer() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    sellerName: '',
    startDate: '',
    endDate: '',
    limit: 20
  });
  const [jumpToPage, setJumpToPage] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: user.email,
        page: currentPage.toString(),
        limit: filters.limit.toString(),
        ...(filters.action && { action: filters.action }),
        ...(filters.severity && { severity: filters.severity }),
        ...(filters.sellerName && { sellerName: filters.sellerName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await fetch(`/api/audit-logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setHasNext(data.hasNext);
        setHasPrev(data.hasPrev);
        setTotal(data.total);
      }
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`/api/audit-logs/stats?userId=${user.email}`);
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {}
  };

  // Helper for numbered pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(jumpToPage);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        setJumpToPage('');
      }
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return { icon: <HiOutlineExclamation />, color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 'error': return { icon: <HiOutlineExclamation />, color: 'text-orange-600 bg-orange-50 border-orange-100' };
      case 'warning': return { icon: <HiOutlineExclamation />, color: 'text-amber-600 bg-amber-50 border-amber-100' };
      default: return { icon: <HiOutlineInformationCircle />, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-700">
      {/* Header & Mini Stats */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">System Ledger</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Audit & Compliance History</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-px bg-slate-200 hidden md:block mx-2" />
            <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Events', val: stats.totalLogs, bg: 'bg-white', text: 'text-slate-900' },
              { label: 'Active (24h)', val: stats.recentActivity, bg: 'bg-white', text: 'text-indigo-600' },
              { label: 'Warnings', val: stats.logsBySeverity.warning || 0, bg: 'bg-white', text: 'text-amber-500' },
              { label: 'System Faults', val: (stats.logsBySeverity.error || 0) + (stats.logsBySeverity.critical || 0), bg: 'bg-slate-900', text: 'text-white' },
            ].map((s, i) => (
              <div key={i} className={`${s.bg} rounded-3xl p-5 border border-slate-100 shadow-sm`}>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className={`text-2xl font-black tracking-tighter ${s.text}`}>{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filter Bar */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <select
              value={filters.action}
              onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs font-bold text-slate-600 appearance-none"
            >
              <option value="">All Procedures</option>
              <option value="verification_completed">Verification Completed</option>
              <option value="seller_registered">Seller Registered</option>
              <option value="ai_analysis">AI Analysis</option>
              <option value="system_error">System Error</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs font-bold text-slate-600 appearance-none"
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>

            <input
              type="text"
              placeholder="Merchant Name..."
              value={filters.sellerName}
              onChange={(e) => setFilters(prev => ({ ...prev, sellerName: e.target.value }))}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs font-bold text-slate-600"
            />

            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs font-bold text-slate-600"
            />

            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs font-bold text-slate-600"
            />

            <select
              value={filters.limit}
              onChange={(e) => {
                setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }));
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 outline-none text-xs font-bold text-slate-600 appearance-none"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
          
          {/* Clear Filters Button */}
          {(filters.action || filters.severity || filters.sellerName || filters.startDate || filters.endDate) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setFilters({
                    action: '',
                    severity: '',
                    sellerName: '',
                    startDate: '',
                    endDate: '',
                    limit: filters.limit // Keep the page size
                  });
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto min-h-[400px]">
        {loading ? (
          <div className="p-20 text-center">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Ledger...</p>
          </div>
        ) : logs.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => {
                const style = getSeverityStyle(log.severity);
                return (
                  <React.Fragment key={log._id}>
                    <tr className={`group transition-colors hover:bg-slate-50/80 ${expandedLog === log._id ? 'bg-slate-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm border ${style.color}`}>
                             {style.icon}
                           </div>
                           <div className="flex flex-col leading-none">
                              <span className="text-xs font-bold text-slate-900">{log.userId?.split('@')[0] || 'System'}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{log.severity}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-[11px] leading-tight">
                          <span className="font-bold text-slate-900">{new Date(log.createdAt).toLocaleDateString()}</span>
                          <span className="font-medium text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                          className="p-2 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                        >
                          <HiOutlineEye size={16} />
                        </button>
                      </td>
                    </tr>
                    {expandedLog === log._id && (
                      <tr className="bg-slate-50 animate-in slide-in-from-top-2 duration-300">
                        <td colSpan={4} className="px-8 py-8">
                          <AuditLogDetails log={log} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center">
            <HiOutlineSearch size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-slate-900 font-bold">No Audit Matches</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">Adjust your filters to scan different protocol layers.</p>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              Displaying {((currentPage - 1) * filters.limit) + 1} - {Math.min(currentPage * filters.limit, total)} of {total}
            </p>
            
            {/* Jump to Page */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jump to:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={jumpToPage}
                onChange={(e) => setJumpToPage(e.target.value)}
                onKeyDown={handleJumpToPage}
                placeholder="Page"
                className="w-16 px-2 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <span className="text-[10px] font-black text-slate-400">of {totalPages}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            {/* First Page */}
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="w-10 h-10 rounded-xl text-xs font-black transition-all text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                >
                  1
                </button>
                {currentPage > 4 && (
                  <span className="px-2 text-slate-300 text-xs">...</span>
                )}
              </>
            )}
            
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={!hasPrev}
              className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
            >
              <HiOutlineChevronLeft size={16} />
            </button>
            
            {/* Page Numbers */}
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  currentPage === pageNum 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            {/* Next */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={!hasNext}
              className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-slate-600"
            >
              <HiOutlineChevronRight size={16} />
            </button>
            
            {/* Last Page */}
            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span className="px-2 text-slate-300 text-xs">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="w-10 h-10 rounded-xl text-xs font-black transition-all text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
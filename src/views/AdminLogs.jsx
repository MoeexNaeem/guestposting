'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Activity, User, ShieldAlert, CheckCircle2, Terminal, Loader2 } from 'lucide-react';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/logs'); 
        setLogs(data);
      } catch (err) { 
        console.error(err); 
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Design Helper: Dynamically assign colors and icons based on log action
  const getLogStyle = (action = '') => {
    const act = action.toUpperCase();
    if (act.includes('USER') || act.includes('LOGIN')) {
      return { icon: User, color: 'text-blue-600', bg: 'bg-blue-100/50', dot: 'bg-blue-500' };
    }
    if (act.includes('SECURITY') || act.includes('DELETE') || act.includes('FAIL')) {
      return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100/50', dot: 'bg-red-500' };
    }
    if (act.includes('APPROVE') || act.includes('VERIFY') || act.includes('SUCCESS')) {
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100/50', dot: 'bg-emerald-500' };
    }
    return { icon: Terminal, color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' };
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {/* Header - Modernized */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
            <Activity size={20} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">System Audit Trail</h1>
        </div>
        <p className="text-[14px] text-slate-500 mt-2">A chronological record of administrative actions and system events.</p>
      </div>

      {/* Timeline Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        
        {loading ? (
          /* Sleek Skeleton for Timeline */
          <div className="space-y-8 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 sm:gap-6">
                <div className="w-16 h-4 bg-slate-100 rounded mt-1 shrink-0"></div>
                <div className="w-8 h-8 bg-slate-100 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2 pt-1">
                  <div className="w-1/4 h-3 bg-slate-200 rounded"></div>
                  <div className="w-3/4 h-3 bg-slate-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Terminal size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm font-medium">No system events recorded.</p>
          </div>
        ) : (
          /* Actual Timeline */
          <div className="relative border-l border-slate-100 ml-3 sm:ml-[72px] space-y-8 pb-4">
            {logs.map((log) => {
              const style = getLogStyle(log.action);
              const Icon = style.icon;
              const dateObj = new Date(log.createdAt);
              
              return (
                <div key={log._id} className="relative flex items-start gap-4 sm:gap-6 group">
                  
                  {/* Timestamp (Desktop: Left of line, Mobile: Hidden) */}
                  <div className="hidden sm:block absolute -left-[88px] top-1.5 w-16 text-right">
                    <p className="text-[11px] font-mono font-medium text-slate-500">
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Timeline Node */}
                  <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full ${style.bg} border-4 border-white flex items-center justify-center shadow-sm transition-transform group-hover:scale-110`}>
                    <Icon size={14} className={style.color} strokeWidth={2.5} />
                  </div>

                  {/* Log Content */}
                  <div className="flex-1 pl-6 sm:pl-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${style.bg} ${style.color}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      {/* Mobile Timestamp */}
                      <span className="sm:hidden text-[11px] font-mono text-slate-400">
                        {dateObj.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className="text-[13px] text-slate-600 leading-relaxed">
                      {log.user?.name && (
                        <span className="font-semibold text-slate-900 mr-1">{log.user.name}</span>
                      )}
                      {log.details}
                    </p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs;
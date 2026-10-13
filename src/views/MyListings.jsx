'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  Plus, TrendingUp, Shield, Edit3, Trash2, ExternalLink, 
  Loader2, CheckCircle2, AlertCircle, X, Globe 
} from 'lucide-react';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // New state to control spinning
  
  const [processingId, setProcessingId] = useState(null);
  const [activeConfirmId, setActiveConfirmId] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  const router = useRouter();

  const showNotification = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const fetchMyInventory = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setIsRefreshing(true); // Only spin the icon for silent refreshes

    try {
      const { data } = await api.get('/listings/my-listings');
      setListings(data.listings);
      setStats(data.stats);
    } catch (err) { 
      showNotification('error', "Failed to load inventory."); 
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchMyInventory(); }, []);

  const handleDelete = async (id) => {
    setProcessingId(id);
    setActiveConfirmId(null);
    try {
      await api.delete(`/listings/${id}`);
      showNotification('success', "Website removed from inventory.");
      await fetchMyInventory(true); // Silent refresh
    } catch (err) { 
      showNotification('error', "Action failed. Please try again."); 
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 py-8 px-4 sm:px-6">
      
      {alert.show && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
          alert.type === 'success' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-red-50/50 border-red-200 text-red-800'
        } animate-in fade-in slide-in-from-top-2 duration-300`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" /> : <AlertCircle size={18} className="text-red-500 mt-0.5" />}
          <p className="text-[13px] font-medium leading-snug flex-1">{alert.message}</p>
          <button onClick={() => setAlert({ show: false, type: '', message: '' })} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My Inventory</h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">Manage your domains and track performance metrics.</p>
        </div>
        <button 
          onClick={() => router.push('/add-listing')}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-[14px] shadow-lg shadow-blue-500/20 flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} /> Add New Site
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Sites', val: stats.totalListings || 0, icon: <Globe size={18}/>, color: 'text-slate-600', bg: 'bg-slate-50' },
          { label: 'Live Inventory', val: stats.approvedListings || 0, icon: <CheckCircle2 size={18}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Review', val: stats.pendingListings || 0, icon: <Loader2 size={18}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between transition-colors">
            <div>
              <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold text-slate-900`}>{loading ? '...' : s.val}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center`}>
              {/* FIX: animate-spin only when isRefreshing is true */}
              {React.cloneElement(s.icon, { className: (s.label === 'Pending Review' && isRefreshing) ? 'animate-spin' : '' })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-visible"> {/* CHANGED TO overflow-visible */}
        <div className="overflow-x-auto overflow-y-visible"> {/* CHANGED TO overflow-y-visible */}
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Website Domain</th>
                <th className="p-4">Performance Metrics</th>
                <th className="p-4">Current Status</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6 pl-6"><div className="h-4 bg-slate-100 rounded w-40"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="p-6"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                    <td className="p-6"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="p-6 text-right pr-6"><div className="h-8 bg-slate-100 rounded-lg w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : listings.map((site, index) => (
                  <tr key={site._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-slate-900 text-[15px]">{site.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        <a href={site.url} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-600 transition-colors"><ExternalLink size={14} /></a>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-tight">{site.category}</span>
                    </td>
                    <td className="p-4 text-[13px]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-600"><TrendingUp size={14} className="text-emerald-500" /> {site.traffic.toLocaleString()}</div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-600"><Shield size={14} className="text-blue-500" /> DA {site.da}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${
                        site.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        site.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>{site.status}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900 text-[16px]">${site.price}</td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end items-center gap-2 relative">
                        
                        {activeConfirmId === site._id && (
                          <div className={`absolute right-0 z-50 w-64 p-4 bg-white border border-slate-200 shadow-2xl rounded-2xl animate-in fade-in zoom-in-95 duration-200 ${
                            index === 0 ? 'top-full mt-2' : 'bottom-full mb-3'
                          }`}> 
                            {/* FIX: index === 0 ? 'top-full' : 'bottom-full' ensures first row popup goes DOWN */}
                            <div className="flex flex-col gap-3 text-left">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0"><AlertCircle size={16} className="text-red-600" /></div>
                                <div>
                                  <p className="text-[13px] font-semibold text-slate-900 leading-none mb-1">Remove website?</p>
                                  <p className="text-[11px] text-slate-500 leading-tight">This will permanently delete this listing.</p>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end pt-1">
                                <button onClick={() => setActiveConfirmId(null)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-bold hover:bg-slate-200">Cancel</button>
                                <button onClick={() => handleDelete(site._id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-700 shadow-sm">Delete</button>
                              </div>
                            </div>
                            {/* Pointer Arrow Adjustment */}
                            <div className={`absolute right-4 w-3 h-3 bg-white border-slate-200 rotate-45 ${
                              index === 0 ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'
                            }`}></div>
                          </div>
                        )}

                        <button onClick={() => router.push(`/edit-listing/${site._id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18} /></button>
                        <button 
                          onClick={() => setActiveConfirmId(site._id)} 
                          disabled={processingId === site._id} 
                          className={`p-2 rounded-lg transition-all ${activeConfirmId === site._id ? 'text-red-600 bg-red-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        >
                          {processingId === site._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyListings;
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { ArrowLeft, Save, Globe, AlertCircle, Loader2, DollarSign, BarChart2, Activity, CheckCircle2, X } from 'lucide-react';

const EditListing = () => {
  const { id } = useParams();
  const router = useRouter();
  
  // App States
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  const [formData, setFormData] = useState({
    price: '', da: '', traffic: '', category: '', url: ''
  });

  const showNotification = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await api.get(`/listings/${id}`);
        setFormData({
          price: data.price,
          da: data.da,
          traffic: data.traffic,
          category: data.category,
          url: data.url 
        });
      } catch (err) { 
        router.push('/my-listings'); 
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await api.put(`/listings/${id}`, formData);
      showNotification('success', 'Listing updated successfully. Redirecting...');
      // Brief delay so user sees the success message before navigating
      setTimeout(() => router.push('/my-listings'), 1500);
    } catch (err) {
      showNotification('error', "Update failed. Please check your inputs and try again.");
      setUpdateLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 py-8 px-4 sm:px-6">
      
      {/* Back Button */}
      <button 
        onClick={() => router.push('/my-listings')} 
        className="inline-flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Inventory
      </button>

      {/* Notifications Banner */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
          alert.type === 'success' 
          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
          : 'bg-red-50/50 border-red-200 text-red-800'
        } animate-in fade-in slide-in-from-top-2 duration-300`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" /> : <AlertCircle size={18} className="text-red-500 mt-0.5" />}
          <p className="text-[13px] font-medium leading-snug flex-1">{alert.message}</p>
          <button onClick={() => setAlert({ show: false, type: '', message: '' })} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        
        {loading ? (
          /* SKELETON LOADER */
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2 mb-8"></div>
            <div className="h-16 bg-slate-100 rounded-xl mb-8"></div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
                  <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                </div>
                <div>
                  <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
                  <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
                </div>
              </div>
              <div>
                <div className="h-3 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-10 bg-slate-100 rounded-lg w-full"></div>
              </div>
              <div className="h-11 bg-slate-200 rounded-lg w-full mt-8"></div>
            </div>
          </div>
        ) : (
          /* ACTUAL FORM */
          <>
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Edit Listing</h1>
              <p className="text-[14px] text-slate-500 font-medium flex items-center gap-2 mt-2">
                <Globe size={16} className="text-blue-500" /> 
                {formData.url.replace(/^https?:\/\/(www\.)?/, '')}
              </p>
            </div>

            {/* Warning Callout */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-8">
              <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <p className="text-[13px] font-medium text-amber-800 leading-relaxed">
                Updating your metrics or price will set the listing status back to <span className="font-semibold text-amber-900">Pending Review</span>. An admin must verify the new data before it goes live.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Price Input */}
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 text-slate-900 text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* DA Input */}
                <div>
                  <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Domain Authority (DA)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BarChart2 size={16} className="text-slate-400" />
                    </div>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      max="100"
                      value={formData.da} 
                      onChange={e => setFormData({...formData, da: e.target.value})} 
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 text-slate-900 text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
                      placeholder="e.g. 45"
                    />
                  </div>
                </div>
              </div>

              {/* Traffic Input */}
              <div>
                <label className="text-[13px] font-medium text-slate-700 block mb-1.5">Monthly Organic Traffic</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={formData.traffic} 
                    onChange={e => setFormData({...formData, traffic: e.target.value})} 
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 text-slate-900 text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors" 
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={updateLoading} 
                  className="w-full bg-slate-900 text-white font-medium py-2.5 px-4 rounded-lg text-[14px] hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                >
                  {updateLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving Changes...</>
                  ) : (
                    <><Save size={18} /> Update Listing</>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EditListing;
'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { 
  UploadCloud, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X,
  FileSpreadsheet
} from 'lucide-react';

const AddListing = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Custom Alert State
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  // Manual Form States
  const [formData, setFormData] = useState({
    url: '', category: 'General', price: '', da: '', traffic: ''
  });

  const showNotification = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/listings', formData);
      showNotification('success', 'Listing submitted successfully. Awaiting admin approval.');
      setFormData({ url: '', category: 'General', price: '', da: '', traffic: '' });
    } catch (err) { 
      showNotification('error', err.response?.data?.message || 'Error adding listing. Please try again.'); 
    }
    setLoading(false);
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) return showNotification('error', "Please select a CSV file to upload.");
    
    const data = new FormData();
    data.append('file', file);
    
    setLoading(true);
    try {
      const res = await api.post('/listings/bulk', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('success', res.data.message || 'Bulk upload completed successfully.');
      setFile(null);
    } catch (err) { 
      showNotification('error', 'Bulk upload failed. Please ensure your CSV matches the required format.'); 
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      
      {/* Sleek Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Add Inventory</h1>
        <p className="text-[14px] text-slate-500 mt-1">Publish your domains to the marketplace to start receiving orders.</p>
      </div>

      {/* Custom Inline Alert */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 border ${
          alert.type === 'success' 
          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' 
          : 'bg-red-50/50 border-red-200 text-red-800'
        } animate-fade-in`} style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {alert.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" /> : <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />}
          <div className="flex-1">
            <p className="text-[13px] font-medium leading-snug">{alert.message}</p>
          </div>
          <button onClick={() => setAlert({ show: false, type: '', message: '' })} className="opacity-50 hover:opacity-100 transition-opacity">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Vercel-Style Segmented Control Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg w-fit mb-8 border border-slate-200/50">
        <button 
          onClick={() => setActiveTab('manual')}
          className={`px-5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${
            activeTab === 'manual' 
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/30'
          }`}
        >
          Manual Entry
        </button>
        <button 
          onClick={() => setActiveTab('bulk')}
          className={`px-5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 ${
            activeTab === 'bulk' 
            ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/30'
          }`}
        >
          Bulk CSV Upload
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8">
        
        {activeTab === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-700">Website URL</label>
              <input 
                type="url" 
                required 
                placeholder="https://example.com" 
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" 
                value={formData.url} 
                onChange={e => setFormData({...formData, url: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Niche / Category</label>
                <select 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>General</option>
                  <option>Technology</option>
                  <option>Health & Fitness</option>
                  <option>Business & Finance</option>
                  <option>Real Estate</option>
                  <option>Crypto</option>
                  <option>Lifestyle</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Placement Price (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-medium">$</span>
                  <input 
                    type="number" 
                    required 
                    placeholder="0.00" 
                    className="w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Domain Authority (DA)</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 45" 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" 
                  value={formData.da} 
                  onChange={e => setFormData({...formData, da: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-slate-700">Monthly Traffic</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 15000" 
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400" 
                  value={formData.traffic} 
                  onChange={e => setFormData({...formData, traffic: e.target.value})} 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={loading} 
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white font-medium text-[13px] rounded-lg shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit for Approval'}
              </button>
            </div>
          </form>
        ) : (
          
          <div className="space-y-6">
            {/* Drag & Drop Zone */}
            <div 
              className="border-2 border-dashed border-slate-200 rounded-xl p-10 hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer bg-slate-50/50 group flex flex-col items-center justify-center text-center" 
              onClick={() => document.getElementById('csvInput').click()}
            >
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                {file ? <FileSpreadsheet size={24} className="text-emerald-500" strokeWidth={1.5} /> : <UploadCloud size={24} className="text-blue-500" strokeWidth={1.5} />}
              </div>
              <p className="text-[14px] text-slate-900 font-medium mb-1">
                {file ? file.name : "Click to select or drag and drop your .CSV file"}
              </p>
              <p className="text-[12px] text-slate-500">Maximum file size 5MB</p>
              <input id="csvInput" type="file" accept=".csv" className="hidden" onChange={e => setFile(e.target.files[0])} />
            </div>
            
            {/* Requirement Box */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-[13px] font-semibold text-slate-700 mb-1">CSV Format Requirement</h4>
                <p className="text-[13px] text-slate-600">Your file must include the following headers in row 1: <br/>
                <code className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-medium text-[11px] mt-2 inline-block">url, category, price, da, traffic</code></p>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleBulkUpload} 
                disabled={loading || !file} 
                className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg shadow-sm hover:bg-slate-800 transition-all text-[13px] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Uploading Data...</> : 'Process Bulk Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AddListing;
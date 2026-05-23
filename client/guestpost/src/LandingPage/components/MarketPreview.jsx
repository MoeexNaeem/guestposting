import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, Lock, CheckCircle2, Globe, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const MarketPreview = () => {
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const { data } = await api.get('/listings?limit=5');
        // Safely extract array — handle plain array or wrapped { listings: [] }
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.listings)
          ? data.listings
          : [];
        setPreviewData(list.slice(0, 5));
      } catch (err) {
        console.error("Failed to load preview");
        setPreviewData([]); // ensure it stays an array on error
      } finally {
        setLoading(false);
      }
    };
    fetchPreview();
  }, []);

  const maskUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.replace(/^https?:\/\/(www\.)?/, '');
    const parts = cleanUrl.split('.');
    if (parts.length < 2) return cleanUrl;
    const ext = parts.pop();
    const name = parts.join('.');
    return `${name.substring(0, 3)}•••••.${ext}`;
  };

  return (
    <section id="marketplace" className="py-24 px-6 bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Marketplace Preview</h2>
            <p className="text-[15px] text-slate-500 font-medium max-w-lg">
              A verified glimpse into our high-authority inventory. <span className="text-blue-600">Register</span> to reveal full URLs and backlink data.
            </p>
          </div>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-all group"
          >
            Explore Full Catalog 
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="p-5 pl-8">Publisher</th>
                  <th className="p-5">Niche</th>
                  <th className="p-5">Authority Metrics</th>
                  <th className="p-5 text-right pr-8">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  /* SKELETON LOADER */
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-6 pl-8"><div className="h-5 bg-slate-100 rounded w-40"></div></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded w-24"></div></td>
                      <td className="p-6"><div className="h-5 bg-slate-100 rounded w-32"></div></td>
                      <td className="p-6 text-right pr-8"><div className="h-9 bg-slate-100 rounded-lg w-24 ml-auto"></div></td>
                    </tr>
                  ))
                ) : previewData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-slate-400 text-sm">
                      No listings available at the moment.
                    </td>
                  </tr>
                ) : (
                  previewData.map((site, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-5 pl-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-blue-600 border border-slate-100 group-hover:bg-white transition-colors">
                            <Globe size={16} />
                          </div>
                          <span className="font-semibold text-slate-800 text-[15px]">{maskUrl(site.url)}</span>
                          {site.isVerified && (
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-100">
                              <CheckCircle2 size={10} /> Verified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/50">
                          {site.category}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-600 text-[13px]">
                            <TrendingUp size={14} className="text-emerald-500" /> 
                            {site.traffic?.toLocaleString?.() ?? site.traffic}
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-slate-600 text-[13px]">
                            <ShieldCheck size={14} className="text-blue-500" /> 
                            DA {site.da}
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-right pr-8">
                        <div className="flex items-center justify-end gap-6">
                          <span className="text-xl font-bold text-slate-900">${site.price}</span>
                          <button 
                            onClick={() => navigate('/login')}
                            className="bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold text-[12px] uppercase tracking-wide hover:bg-black transition-all shadow-md shadow-slate-200 flex items-center gap-2 active:scale-95"
                          >
                            <Lock size={12} className="opacity-70" /> Buy Placement
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer CTA */}
          {!loading && (
            <div className="p-5 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-t border-slate-100 text-center">
              <Link 
                to="/register" 
                className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Lock size={14} className="mb-0.5" /> 
                Unlock access to {previewData.length > 0 ? "5,400+" : ""} premium verified publishers
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MarketPreview;
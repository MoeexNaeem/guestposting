'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  Star, 
  Globe, 
  ShieldCheck, 
  TrendingUp, 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle2,
  Loader2,
  Package,
  MessageSquareQuote
} from 'lucide-react';

const SellerProfile = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const { data } = await api.get(`/users/seller/${id}`);
        setData(data);
      } catch (err) {
        console.error("Error loading seller profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
      <Loader2 size={32} className="animate-spin text-blue-500" />
      <p className="text-[13px] font-medium uppercase tracking-widest">Loading Portfolio...</p>
    </div>
  );

  if (!data) return (
    <div className="p-20 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-3xl max-w-2xl mx-auto mt-20">
      Seller profile not found or no longer active.
    </div>
  );

  const { seller, listings, reviews, avgRating } = data;

  return (
    <div className="max-w-6xl mx-auto pb-20 py-8 px-4 sm:px-6">
      
      {/* Navigation */}
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center text-slate-500 hover:text-blue-600 font-medium text-sm mb-8 transition-colors group"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
        Back to Marketplace
      </button>

      {/* Seller Identity Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 mb-10 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-4xl font-bold shadow-xl border-4 border-white shrink-0">
          {seller.name.charAt(0).toUpperCase()}
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">{seller.name}</h1>
            <div className="inline-flex items-center self-center md:self-auto gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
               <CheckCircle2 size={14} />
               <span className="text-[10px] font-bold uppercase tracking-wider">Verified Publisher</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 text-amber-500">
                <Star size={18} fill="currentColor" />
              </div>
              <span className="text-lg font-bold text-slate-900">{avgRating || '0.0'}</span>
              <span className="text-slate-400 font-medium text-sm">({reviews.length} reviews)</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-slate-200 rounded-full"></div>
            <div className="flex items-center gap-2 text-slate-500 font-medium text-sm uppercase tracking-wide">
              <Package size={16} className="text-blue-500" />
              {listings.length} Active Listings
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Inventory Section */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <Globe size={16} className="text-blue-500" /> Publisher Inventory
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {listings.map(site => (
              <div key={site._id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all group">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 text-[17px] tracking-tight group-hover:text-blue-600 transition-colors">
                      {site.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </p>
                    <ExternalLink size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase">
                      <TrendingUp size={14} className="text-emerald-500" /> {site.traffic.toLocaleString()} Traffic
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase">
                      <ShieldCheck size={14} className="text-blue-500" /> DA {site.da}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {site.category}
                    </span>
                  </div>
                </div>
                
                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <p className="text-2xl font-bold text-slate-900 tracking-tight">${site.price}</p>
                  
                  {/* UPDATED: Changed Link to an anchor tag for external opening */}
                  <a 
                    href={site.url.startsWith('http') ? site.url : `https://${site.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold bg-slate-900 text-white px-4 py-1.5 rounded-lg uppercase tracking-wider hover:bg-blue-600 transition-colors shadow-sm shadow-slate-200"
                  >
                    View Site
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
            <MessageSquareQuote size={16} className="text-amber-500" /> Client Testimonials
          </h3>
          
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-slate-50 p-10 rounded-2xl border border-slate-100 text-center">
                <p className="text-sm font-medium text-slate-400">No reviews yet for this vendor.</p>
              </div>
            ) : (
              reviews.map(rev => (
                <div key={rev._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                  <div className="flex gap-0.5 text-amber-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < rev.rating ? "currentColor" : "none"} 
                        className={i >= rev.rating ? "text-slate-200" : ""} 
                      />
                    ))}
                  </div>
                  <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center gap-3">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center text-[11px] font-bold shadow-sm">
                      {rev.buyer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{rev.buyer.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SellerProfile;
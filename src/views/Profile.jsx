'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  User, 
  Mail, 
  Shield, 
  Wallet, 
  CheckCircle2, 
  Package, 
  Calendar,
  ArrowRight,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfileData(data);
      } catch (err) {
        console.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="max-w-6xl mx-auto pb-20 py-8 px-4 sm:px-6 animate-pulse">
      {/* Skeleton Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-3">
          <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
          <div className="h-4 bg-slate-100 rounded-lg w-64"></div>
        </div>
        <div className="h-8 bg-slate-100 rounded-lg w-32"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Skeleton Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            <div className="h-20 bg-slate-100"></div>
            <div className="px-6 pb-8 -mt-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl border-4 border-white mb-4"></div>
              <div className="h-6 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-20 mb-8"></div>
              <div className="w-full space-y-4 pt-6 border-t border-slate-50">
                <div className="h-10 bg-slate-50 rounded-xl"></div>
                <div className="h-10 bg-slate-50 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
            <div className="h-32 bg-white rounded-2xl border border-slate-200"></div>
          </div>
          <div className="h-64 bg-white rounded-2xl border border-slate-200"></div>
        </div>
      </div>
    </div>
  );

  if (!profileData) return (
    <div className="p-20 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-3xl max-w-2xl mx-auto mt-20">
      Failed to load profile data. Please refresh.
    </div>
  );

  const { user, stats } = profileData;

  return (
    <div className="max-w-6xl mx-auto pb-20 py-8 px-4 sm:px-6">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Account Overview</h1>
          <p className="text-[14px] text-slate-500 font-medium mt-1">Review your performance and account settings.</p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Profile Identity Card */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
            <div className="h-20 bg-slate-900 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            </div>
            <div className="px-6 pb-8 -mt-10 text-center relative z-10">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-md">
                <div className="w-full h-full bg-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{user.name}</h2>
              <div className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                user.role === 'seller' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {user.role} Verified
              </div>

              <div className="mt-8 space-y-3 text-left border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Email</p>
                    <p className="text-[13px] font-medium text-slate-700 truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-500">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Access Level</p>
                    <p className="text-[13px] font-medium text-slate-700 capitalize">{user.role} Dashboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Metrics & History */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stats Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-12 h-12 bg-blue-50 rounded-xl text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                    {user.role === 'seller' ? 'Revenue Generated' : 'Total Spent'}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">${stats.totalVolume.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all">
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Fulfillment Rate</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.completedOrders} Orders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Placeholder / Summary Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" /> Platform Activity
              </h3>
              <Link href="/orders" className="text-[11px] font-bold text-blue-600 uppercase hover:text-blue-700 transition-colors">Manage All History</Link>
            </div>
            
            <div className="p-6">
              {stats.totalOrders === 0 ? (
                <div className="py-10 text-center opacity-40">
                  <Package size={40} className="mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-[13px] font-medium text-slate-500">No recent transactions recorded.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-100 group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 group-hover:text-blue-600 transition-colors">
                          <Package size={20} />
                       </div>
                       <div>
                          <p className="text-[14px] font-semibold text-slate-900">LetRank Marketplace Summary</p>
                          <div className="flex items-center gap-3 mt-0.5 text-slate-500 text-[11px] font-medium">
                            <span className="flex items-center gap-1"><Clock size={12}/> Updated Real-time</span>
                            <span>•</span>
                            <span className="uppercase tracking-tight">{user.role} stats</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-bold text-slate-900">{stats.totalOrders}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => router.push('/orders')}
                    className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 active:scale-[0.98]"
                  >
                    Manage Work Orders <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
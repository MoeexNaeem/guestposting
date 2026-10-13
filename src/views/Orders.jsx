'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  ShoppingBag, ArrowLeft, Clock, Activity, CheckCircle2, 
  XCircle, Loader2, ChevronRight, Search 
} from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const role = userInfo?.role;

  // Keyed on the role string: userInfo is a fresh object every render, and
  // depending on it re-ran this effect after every fetch (an endless request loop).
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const endpoint = role === 'seller' ? '/orders/mysales' : '/orders/myorders';
        const { data } = await api.get(endpoint);
        setOrders(data);
      } catch (err) {
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchOrders();
    } else {
      router.push('/login');
    }
  }, [role, router]);

  const renderStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full font-semibold uppercase tracking-wide border";
    
    switch (status) {
      case 'awaiting_content':
        return <span className={`${baseClasses} bg-amber-50 text-amber-700 border-amber-100`}><Clock size={12}/> Awaiting Brief</span>;
      case 'in_progress':
        return <span className={`${baseClasses} bg-blue-50 text-blue-700 border-blue-100`}><Activity size={12}/> Processing</span>;
      case 'published':
        return <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border-emerald-100`}><CheckCircle2 size={12}/> Delivered</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-50 text-red-700 border-red-100`}><XCircle size={12}/> Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-slate-50 text-slate-700 border-slate-100`}>{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 py-8 px-4 sm:px-6">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
        <div>
          <Link href="/" className="inline-flex items-center text-[13px] font-medium text-slate-500 hover:text-blue-600 mb-3 transition-colors">
            <ArrowLeft size={16} className="mr-1.5" /> Back to Marketplace
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-blue-600" size={24} /> 
            {userInfo?.role === 'seller' ? 'Order Management' : 'Purchase History'}
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 font-medium">
            {userInfo?.role === 'seller' 
              ? 'Track and fulfill incoming guest post requests.' 
              : 'Monitor the status of your active SEO placements.'}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Purchase Date</th>
                <th className="p-4">Target Listing</th>
                <th className="p-4">{userInfo?.role === 'seller' ? 'Client' : 'Publisher'}</th>
                <th className="p-4">Price</th>
                <th className="p-4">Workflow Status</th>
                <th className="p-4 text-right pr-6">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                /* SKELETON TABLE LOADER */
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-40 mb-1.5"></div><div className="h-3 bg-slate-50 rounded w-20"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="p-4"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-6 bg-slate-100 rounded-full w-24"></div></td>
                    <td className="p-4 text-right pr-6"><div className="h-8 bg-slate-100 rounded-lg w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="inline-flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100 font-medium text-sm">
                      <XCircle size={16} /> {error}
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-40">
                      <Search size={48} strokeWidth={1} className="text-slate-400" />
                      <p className="font-semibold text-slate-500">No transactions found.</p>
                      {userInfo?.role !== 'seller' && (
                        <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                          Browse available domains
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <span className="text-slate-600 font-medium text-[13px]">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 text-[14px]">{order.listing?.url}</div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{order.listing?.category}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-600 text-[13px] font-medium flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                          {(userInfo?.role === 'seller' ? order.buyer?.email : order.seller?.email).charAt(0).toUpperCase()}
                        </div>
                        {userInfo?.role === 'seller' ? order.buyer?.email : order.seller?.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 text-[15px]">
                        ${order.price.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      {renderStatusBadge(order.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => router.push(`/orders/${order._id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-blue-600 hover:bg-blue-50 transition-all group-hover:translate-x-[-4px]"
                      >
                        Details
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
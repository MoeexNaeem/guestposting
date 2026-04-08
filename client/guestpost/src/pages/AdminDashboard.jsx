import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, Layers, DollarSign, ShoppingCart, 
  CheckCircle, Star, ShieldCheck, CheckCircle2, AlertCircle, X, Loader2
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'active'
  
  // Custom Alert State
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const showNotification = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, listingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/listings/admin')
      ]);
      setData(statsRes.data);
      setAllListings(listingsRes.data);
      setLoading(false);
    } catch (err) {
      showNotification('error', "Failed to fetch admin data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Action Handlers
  const handleApprove = async (id) => {
    try {
      await api.put(`/listings/${id}/approve`);
      showNotification('success', 'Listing approved successfully.');
      fetchAdminData();
    } catch (err) { showNotification('error', "Approval failed."); }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/listings/${id}/verify`);
      showNotification('success', 'Listing metrics verified.');
      fetchAdminData();
    } catch (err) { showNotification('error', "Verification failed."); }
  };

  const handleToggleFeature = async (id) => {
    try {
      await api.put(`/admin/listings/${id}/feature`);
      showNotification('success', 'Feature status updated.');
      fetchAdminData();
    } catch (err) { showNotification('error', "Action failed."); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
      <Loader2 size={32} className="animate-spin text-blue-500" />
      <p className="text-[13px] font-medium uppercase tracking-widest">Loading Command Center...</p>
    </div>
  );

  const { stats, recentOrders } = data;
  const displayListings = allListings.filter(site => site.status === (activeTab === 'pending' ? 'pending' : 'approved'));

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* Custom Inline Alert */}
      {alert.show && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border shadow-sm ${
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Platform Overview</h1>
        <p className="text-[14px] text-slate-500 mt-1">Manage growth, verify inventory, and oversee platform activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', val: `$${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign size={20} strokeWidth={2}/>, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100/60' },
          { label: 'Registered Users', val: stats.totalUsers, icon: <Users size={20} strokeWidth={2}/>, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100/60' },
          { label: 'Live Inventory', val: stats.totalListings, icon: <Layers size={20} strokeWidth={2}/>, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100/60' },
          { label: 'Total Orders', val: stats.totalOrders, icon: <ShoppingCart size={20} strokeWidth={2}/>, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100/60' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-slate-500 mb-1">{s.label}</p>
              <p className="text-[24px] font-bold text-slate-900 tracking-tight">{s.val}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} border flex items-center justify-center`}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Listing Management Center */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
          
          {/* Tabs Header */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'pending' 
                ? 'bg-slate-100 text-slate-900' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Pending Review
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'pending' ? 'bg-white shadow-sm text-slate-700' : 'bg-slate-100 text-slate-400'}`}>
                {allListings.filter(l => l.status === 'pending').length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'active' 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Live Inventory
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'active' ? 'bg-white shadow-sm text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                {allListings.filter(l => l.status === 'approved').length}
              </span>
            </button>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/30">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-slate-100">
                {displayListings.length === 0 ? (
                  <tr>
                    <td className="p-16 text-center text-slate-400">
                      <Layers size={32} className="mx-auto mb-3 text-slate-300 opacity-50" strokeWidth={1.5} />
                      <p className="text-[14px] font-medium">No listings in this queue.</p>
                    </td>
                  </tr>
                ) : (
                  displayListings.map(site => (
                    <tr key={site._id} className="hover:bg-slate-50 transition-colors group bg-white">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900 text-[14px]">{site.url.replace(/^https?:\/\/(www\.)?/, '')}</p>
                          {site.isFeatured && <span className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded font-medium">Featured</span>}
                          {site.isVerified && <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-medium">Verified</span>}
                        </div>
                        <p className="text-[12px] font-medium text-slate-500 capitalize">
                          {site.category} • DA {site.da} • Vendor: <span className="text-slate-700">{site.seller?.name || 'Unknown'}</span>
                        </p>
                      </td>
                      <td className="p-4 pr-6 text-right whitespace-nowrap">
                        
                        {/* PENDING ACTIONS */}
                        {activeTab === 'pending' && (
                          <button 
                            onClick={() => handleApprove(site._id)} 
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all shadow-sm"
                          >
                            Approve
                          </button>
                        )}

                        {/* ACTIVE ACTIONS */}
                        {activeTab === 'active' && (
                          <div className="flex items-center justify-end gap-2">
                            {!site.isVerified && (
                              <button 
                                onClick={() => handleVerify(site._id)} 
                                className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5"
                              >
                                <ShieldCheck size={14} /> Verify Data
                              </button>
                            )}
                            <button 
                              onClick={() => handleToggleFeature(site._id)} 
                              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                                site.isFeatured 
                                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                : 'bg-white border border-amber-200 text-amber-600 hover:bg-amber-50'
                              }`}
                            >
                              <Star size={14} fill={site.isFeatured ? "currentColor" : "none"} /> 
                              {site.isFeatured ? 'Unfeature' : 'Feature Site'}
                            </button>
                          </div>
                        )}

                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Platform Activity Sidebar */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px] flex flex-col">
          <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500" strokeWidth={2}/>
            <h3 className="text-[13px] font-semibold text-slate-900">Recent Sales</h3>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/30">
            {recentOrders.length === 0 ? (
               <p className="text-center text-slate-400 font-medium text-[13px] mt-10">No sales recorded yet.</p>
            ) : (
               recentOrders.map(order => (
                 <div key={order._id} className="flex items-start gap-3 pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                   <div className="bg-white border border-slate-200 p-2 rounded-lg text-slate-400 shrink-0 shadow-sm mt-0.5">
                     <ShoppingCart size={14} strokeWidth={2}/>
                   </div>
                   <div className="overflow-hidden">
                     <p className="text-[13px] font-medium text-slate-900 truncate">
                       <span className="font-semibold">{order.buyer?.name}</span> bought a post
                     </p>
                     <p className="text-[12px] font-medium text-blue-600 truncate mb-1">
                       {order.listing?.url.replace(/^https?:\/\/(www\.)?/, '')}
                     </p>
                     <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                       <span className="text-slate-700 font-semibold">${order.price}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                       <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                     </div>
                   </div>
                 </div>
               ))
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
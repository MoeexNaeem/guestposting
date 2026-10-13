'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Mail, ShieldCheck, Ban, Shield, User as UserIcon, Store, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  
  // App States
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState({ id: null, type: null });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  
  // NEW: Tracks which specific user row has the confirmation popover open
  const [activeConfirmId, setActiveConfirmId] = useState(null);

  const showNotification = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) { 
      showNotification('error', "Failed to fetch user database."); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Fires the API call when the inline confirm button is clicked
  const executeSuspensionToggle = async (user) => {
    const action = user.isSuspended ? 'unsuspend' : 'suspend';
    
    // Close inline popover immediately
    setActiveConfirmId(null);
    
    // Start loader on the button
    setProcessingAction({ id: user._id, type: 'suspension' });
    
    try {
      await api.put(`/admin/users/${user._id}`, { isSuspended: !user.isSuspended });
      showNotification('success', `User successfully ${action}ed.`);
      await fetchUsers();
    } catch (err) { 
      showNotification('error', "Failed to update account status."); 
    } finally {
      setProcessingAction({ id: null, type: null });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setProcessingAction({ id: userId, type: 'role' });
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      showNotification('success', "User role updated.");
      await fetchUsers();
    } catch (err) { 
      showNotification('error', "Failed to update role."); 
    } finally {
      setProcessingAction({ id: null, type: null });
    }
  };

  const getRoleDisplay = (role) => {
    switch(role) {
      case 'admin': return { icon: <Shield size={14}/>, color: 'text-indigo-700', bg: 'bg-indigo-50' };
      case 'seller': return { icon: <Store size={14}/>, color: 'text-amber-700', bg: 'bg-amber-50' };
      default: return { icon: <UserIcon size={14}/>, color: 'text-slate-600', bg: 'bg-slate-100' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 py-8 px-4 sm:px-6 lg:px-8">
      
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

      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-[14px] text-slate-500 mt-1">Monitor account activity, assign roles, and enforce platform policies.</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[12px] font-medium text-slate-500">
                <th className="p-4 pl-6">Account Details</th>
                <th className="p-4">Role & Access</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right pr-6">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                /* SKELETON LOADER */
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-200 rounded-full shrink-0"></div>
                      <div className="space-y-2 w-full">
                        <div className="h-3.5 bg-slate-200 rounded w-32"></div>
                        <div className="h-2.5 bg-slate-100 rounded w-48"></div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-8 bg-slate-100 rounded-lg w-28"></div></td>
                    <td className="p-4"><div className="h-5 bg-slate-100 rounded-full w-20"></div></td>
                    <td className="p-4 pr-6 flex justify-end"><div className="h-8 bg-slate-100 rounded-lg w-24"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                /* EMPTY STATE */
                <tr>
                  <td colSpan="4" className="p-16 text-center text-slate-400">
                    <UserIcon size={32} className="mx-auto mb-3 opacity-50" strokeWidth={1.5} />
                    <p className="text-[14px] font-medium">No users found in the database.</p>
                  </td>
                </tr>
              ) : (
                /* ACTUAL DATA */
                users.map((u) => {
                  const roleStyle = getRoleDisplay(u.role);
                  const isProcessingRole = processingAction.id === u._id && processingAction.type === 'role';
                  const isProcessingSuspension = processingAction.id === u._id && processingAction.type === 'suspension';
                  const showConfirm = activeConfirmId === u._id;

                  return (
                    <tr key={u._id} className={`hover:bg-slate-50/50 transition-colors group ${u.isSuspended ? 'bg-slate-50/30' : 'bg-white'}`}>
                      
                      {/* User Info Col */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold shrink-0 ${u.isSuspended ? 'bg-slate-200 text-slate-400' : 'bg-blue-600 text-white'}`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className={`font-semibold text-[14px] ${u.isSuspended ? 'text-slate-500' : 'text-slate-900'}`}>{u.name}</span>
                            <div className="flex items-center gap-1.5 text-slate-500 text-[12px] mt-0.5">
                              <Mail size={12} /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Select Col */}
                      <td className="p-4">
                        <div className="relative inline-block w-[130px]">
                          <select 
                            value={u.role} 
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={isProcessingRole}
                            className={`w-full appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-[12px] font-medium rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {isProcessingRole ? <Loader2 size={14} className="animate-spin text-slate-400" /> : roleStyle.icon}
                          </div>
                        </div>
                      </td>

                      {/* Status Badge Col */}
                      <td className="p-4">
                        {u.isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-100">
                            <Ban size={12} /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <ShieldCheck size={12} /> Active
                          </span>
                        )}
                      </td>

                      {/* Quick Actions Col with Inline Popover */}
                      <td className="p-4 pr-6 text-right relative">
                        <div className="flex items-center justify-end relative">
                          
                          {/* INLINE CONFIRMATION POPOVER */}
                          {showConfirm && (
                            <div className="absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 bg-white border border-slate-200 shadow-xl rounded-xl p-2.5 flex items-center gap-3 w-max z-10 animate-in slide-in-from-right-4 fade-in duration-200">
                              <span className="text-[12px] font-medium text-slate-700 pl-1">
                                Are you sure?
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button 
                                  onClick={() => setActiveConfirmId(null)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium hover:bg-slate-200 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => executeSuspensionToggle(u)}
                                  className={`px-2.5 py-1.5 rounded-lg text-white text-[11px] font-medium transition-colors shadow-sm ${
                                    u.isSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                                  }`}
                                >
                                  Yes, {u.isSuspended ? 'Activate' : 'Suspend'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* MAIN ACTION BUTTON */}
                          <button 
                            onClick={() => setActiveConfirmId(u._id)}
                            disabled={isProcessingSuspension || showConfirm}
                            className={`inline-flex items-center justify-center min-w-[90px] gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              u.isSuspended 
                              ? 'bg-slate-900 hover:bg-slate-800 text-white' 
                              : 'bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200'
                            }`}
                          >
                            {isProcessingSuspension ? (
                              <><Loader2 size={14} className="animate-spin" /> Wait...</>
                            ) : (
                              u.isSuspended ? 'Activate' : 'Suspend'
                            )}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
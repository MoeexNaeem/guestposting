'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  ArrowLeft, FileText, Send, Clock, CheckCircle2, Star,
  XCircle, ExternalLink, Link as LinkIcon, AlignLeft, Loader2, AlertCircle, X
} from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams(); 
  const router = useRouter();
  const scrollRef = useRef();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [contentData, setContentData] = useState({ 
    targetUrl: '', anchorText: '', articleLink: '', contentNotes: ''
  });
  
  const [liveLink, setLiveLink] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const showNotification = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const { data: o } = await api.get(`/orders/${id}`);
        setOrder(o);
        const { data: m } = await api.get(`/messages/${id}`);
        setMessages(m);
        
        if (o.status === 'published') {
          try {
            const { data: reviews } = await api.get(`/reviews/seller/${o.seller._id}`);
            if (reviews.find(r => r.order === id)) setHasReviewed(true);
          } catch (err) { console.log("No previous reviews"); }
        }
        setLoading(false);
      } catch (err) { router.push('/orders'); }
    };
    init();
  }, [id, router]);

  // The other party's new messages are picked up every few seconds while the
  // tab is visible. Only unseen messages are merged in, so an unchanged list
  // never re-renders (and never moves the chat scroll).
  useEffect(() => {
    if (loading) return;
    let stopped = false;

    const pollMessages = async () => {
      if (document.hidden) return;
      try {
        const { data } = await api.get(`/messages/${id}`);
        if (stopped) return;
        setMessages((prev) => {
          const have = new Set(prev.map((m) => m._id));
          if (data.every((m) => have.has(m._id))) return prev;
          const ids = new Set(data.map((m) => m._id));
          // keep messages still being sent (or just sent) that this response predates
          return [...data, ...prev.filter((m) => !ids.has(m._id))];
        });
      } catch (err) { /* keep the current list; try again on the next tick */ }
    };

    const timer = setInterval(pollMessages, 3000);
    const onVisible = () => { if (!document.hidden) pollMessages(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [id, loading]);

  // FIX: Stable scroll logic (prevents the whole screen from jumping)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const textToSend = newMessage;
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      text: textToSend,
      sender: { _id: userInfo._id, name: userInfo.name },
      isSending: true
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    try {
      const { data } = await api.post('/messages', { orderId: id, text: textToSend });
      // If a refresh already brought the saved message in, just drop the placeholder.
      setMessages((prev) => prev.some(msg => msg._id === data._id)
        ? prev.filter(msg => msg._id !== tempId)
        : prev.map(msg => msg._id === tempId ? data : msg));
    } catch (err) { 
      setMessages((prev) => prev.filter(msg => msg._id !== tempId));
      setNewMessage(textToSend);
      showNotification('error', 'Failed to send message.');
    }
  };

  const handleContentSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/orders/${id}/content`, contentData);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
      showNotification('success', 'Requirements submitted successfully.');
    } catch (err) { showNotification('error', 'Error submitting brief.'); }
    finally { setActionLoading(false); }
  };

  const handleMarkPublished = async (e) => {
    e.preventDefault();
    if (!liveLink) return showNotification('error', "Enter the live URL.");
    setActionLoading(true);
    try {
      await api.put(`/orders/${id}/publish`, { liveLink });
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
      showNotification('success', 'Order marked as published!');
    } catch (err) { showNotification('error', 'Update failed.'); }
    finally { setActionLoading(false); }
  };

  const handleRejectOrder = async () => {
    if (!window.confirm("Reject this order?")) return;
    setActionLoading(true);
    try {
      await api.put(`/orders/${id}/reject`);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) { showNotification('error', 'Action failed.'); }
    finally { setActionLoading(false); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post('/reviews', { orderId: id, rating, comment });
      setHasReviewed(true);
      showNotification('success', 'Review submitted.');
    } catch (err) { showNotification('error', 'Failed to submit review.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 space-y-4">
      <Loader2 size={32} className="animate-spin text-blue-500" />
      <p className="text-[13px] font-medium uppercase tracking-widest italic">Preparing Workspace...</p>
    </div>
  );

  const isBuyer = userInfo?._id === order.buyer._id;
  const isSeller = userInfo?._id === order.seller._id;

  return (
    <div className="max-w-7xl mx-auto pb-20 py-8 px-4 sm:px-6">
      
      <style>{`
        .chat-scrollbar::-webkit-scrollbar { width: 5px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .chat-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
      `}</style>

      {alert.show && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 rounded-xl flex items-start gap-3 border shadow-2xl ${
          alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        } animate-in fade-in slide-in-from-top-4 duration-300`}>
          {alert.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" /> : <AlertCircle size={18} className="text-red-500 mt-0.5" />}
          <p className="text-[13px] font-medium flex-1">{alert.message}</p>
          <button onClick={() => setAlert({ show: false, type: '', message: '' })} className="opacity-50 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => router.push('/orders')} className="flex items-center text-slate-500 hover:text-slate-900 font-medium text-sm transition-colors">
              <ArrowLeft size={18} className="mr-2" /> Back to Orders
            </button>
            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide border ${
              order.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
              order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">{order.listing?.url}</h1>
              <p className="text-[12px] font-medium text-slate-400 font-mono tracking-wider uppercase">ID: {order._id}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
               <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 transition-colors hover:border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Contract Total</p>
                  <p className="text-2xl font-bold text-slate-900">${order.price}</p>
               </div>
               <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 transition-colors hover:border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Niche Category</p>
                  <p className="text-2xl font-bold text-slate-900 truncate">{order.listing?.category}</p>
               </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
                <h3 className="text-[14px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <FileText size={18} className="text-blue-500" /> Project Briefing
                </h3>

                {order.status === 'awaiting_content' && isBuyer ? (
                   <form onSubmit={handleContentSubmit} className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700 block ml-1">Target Link *</label>
                          <input type="url" required placeholder="https://yoursite.com" className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={e => setContentData({...contentData, targetUrl: e.target.value})} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[13px] font-medium text-slate-700 block ml-1">Anchor Text *</label>
                          <input type="text" required placeholder="e.g. SEO Company" className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={e => setContentData({...contentData, anchorText: e.target.value})} />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-200 space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 block ml-1 flex items-center gap-1.5"><LinkIcon size={14}/> Google Docs / Article URL</label>
                            <input type="url" placeholder="https://docs.google.com/..." className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" onChange={e => setContentData({...contentData, articleLink: e.target.value})} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-medium text-slate-700 block ml-1 flex items-center gap-1.5"><AlignLeft size={14}/> Instructions</label>
                            <textarea placeholder="Provide extra details for the publisher..." className="w-full p-3 bg-white rounded-xl border border-slate-200 outline-none text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 min-h-[140px] resize-none" onChange={e => setContentData({...contentData, contentNotes: e.target.value})} />
                          </div>
                      </div>
                      <button disabled={actionLoading} className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2">
                        {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Brief'}
                      </button>
                   </form>
                ) : order.targetUrl ? (
                   <div className={`p-6 rounded-2xl border ${order.status === 'cancelled' ? 'bg-red-50 border-red-100' : 'bg-blue-50/20 border-blue-100'}`}>
                      <div className="flex items-center gap-2 mb-6 text-blue-700 font-semibold text-[13px]">
                        <CheckCircle2 size={16} /> Data Provided
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
                          <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Target</p>
                              <a href={order.targetUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold text-sm hover:underline break-all inline-flex items-center gap-1">
                                {order.targetUrl} <ExternalLink size={12}/>
                              </a>
                          </div>
                          <div>
                              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Anchor</p>
                              <p className="font-semibold text-slate-800 text-sm italic">"{order.anchorText}"</p>
                          </div>
                        </div>

                        {/* Extra requirements display */}
                        {(order.articleLink || order.contentNotes) && (
                          <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
                            {order.articleLink && (
                              <div>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1.5"><LinkIcon size={12}/> Article Link</p>
                                <a href={order.articleLink} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold text-sm hover:underline break-all">{order.articleLink}</a>
                              </div>
                            )}
                            {order.contentNotes && (
                              <div className={order.articleLink ? "pt-4 border-t border-slate-100" : ""}>
                                <p className="text-[11px] font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1.5"><AlignLeft size={12}/> Content Notes</p>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-h-64 overflow-y-auto whitespace-pre-wrap text-[13px] font-medium text-slate-600">{order.contentNotes}</div>
                              </div>
                            )}
                          </div>
                        )}

                        {isSeller && order.status === 'in_progress' && (
                        <form onSubmit={handleMarkPublished} className="mt-8 pt-6 border-t border-blue-100 space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-blue-700 block ml-1">Live URL Delivery</label>
                            <input type="url" required placeholder="Paste the published URL..." value={liveLink} onChange={(e) => setLiveLink(e.target.value)} className="w-full p-3 bg-white rounded-xl border border-blue-200 outline-none text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" />
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" disabled={actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                              {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Delivery'}
                            </button>
                            <button type="button" onClick={handleRejectOrder} disabled={actionLoading} className="px-6 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors">Reject</button>
                          </div>
                        </form>
                      )}
                      </div>

                      {order.status === 'published' && order.liveLink && (
                         <div className="mt-8 pt-6 border-t border-emerald-100 bg-emerald-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                           <p className="text-[11px] font-semibold text-emerald-600 uppercase mb-2">Live Placement</p>
                           <a href={order.liveLink} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline break-all inline-flex items-center gap-2 text-lg">
                             {order.liveLink} <ExternalLink size={20} />
                           </a>
                         </div>
                      )}
                   </div>
                ) : (
                   <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-100">
                      <Clock className="mx-auto text-slate-300 mb-3" size={32} />
                      <p className="text-slate-500 font-medium text-sm">Awaiting project requirements.</p>
                   </div>
                )}
            </div>
          </div>

          {/* Review Section */}
          {order.status === 'published' && isBuyer && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <h3 className="text-[14px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Star size={18} className="text-amber-500" /> Leave Feedback
              </h3>
              {hasReviewed ? (
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-100 font-semibold text-[13px]">
                  <CheckCircle2 size={18} /> Review submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button key={num} type="button" onClick={() => setRating(num)} className={`p-1 transition-transform active:scale-90 ${rating >= num ? 'text-amber-500' : 'text-slate-200'}`}>
                        <Star size={32} fill={rating >= num ? "currentColor" : "none"} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  <textarea required placeholder="How was the vendor's service?" className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none font-medium text-sm h-32 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500" value={comment} onChange={(e) => setComment(e.target.value)} />
                  <button disabled={actionLoading} className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Messaging */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 h-[calc(100vh-64px)] flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h3 className="font-semibold text-slate-800 text-[13px] uppercase tracking-wider">Messaging</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-emerald-600">LIVE</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 chat-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-30">
                <AlertCircle size={32} strokeWidth={1} />
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest">No messages yet</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg._id} className={`flex flex-col ${msg.sender._id === userInfo._id ? 'items-end' : 'items-start'} ${msg.isSending ? 'opacity-60' : ''}`}>
                  <div className={`max-w-[90%] px-4 py-2 rounded-2xl text-[13px] font-medium shadow-sm leading-relaxed ${
                    msg.sender._id === userInfo._id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                  }`}>{msg.text}</div>
                  <span className="text-[10px] font-medium text-slate-400 mt-1.5 px-1">
                    {msg.isSending ? 'Sending...' : (msg.sender._id === userInfo._id ? 'You' : msg.sender.name)}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2 shrink-0">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Send a message..." className="flex-1 bg-slate-50 p-2.5 rounded-xl text-[13px] font-medium outline-none border border-slate-200 focus:border-blue-300 transition-colors" />
            <button className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all active:scale-90"><Send size={18} /></button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
import React, { useState } from 'react';
import { Mail, MessageSquare, Send, ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api'; 

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/contact', formData); 
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="relative py-24 px-6 bg-[#0F172A] overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Column */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
              Let’s scale your <br /> 
              <span className="text-blue-500">search authority.</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
              Have questions about enterprise white-label solutions or joining as a premium publisher? Our team is ready to assist.
            </p>
          </div>

          <div className="space-y-5">
            <div className="flex items-center gap-4 group cursor-pointer w-fit">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email Us</p>
                <p className="text-slate-200 font-semibold group-hover:text-white transition-colors">support@letrank.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="bg-white rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-blue-900/20">
          {status === 'success' ? (
            <div className="py-12 text-center animate-in fade-in zoom-in">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Message Sent!</h3>
              <p className="text-slate-500 mt-2">Thanks for reaching out. We'll be in touch soon.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">Send a Message</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Expected response time: Under 12 hours.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 ml-1">Your Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 ml-1">Work Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@company.com" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[13px] font-semibold text-slate-700 ml-1">Message</label>
                  <textarea 
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How can we help you?" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none" 
                  />
                </div>

                <button 
                  disabled={status === 'loading'}
                  className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl hover:bg-black transition-all text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] group mt-2 disabled:opacity-70"
                >
                  {status === 'loading' ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>Send Message <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </button>
                {status === 'error' && <p className="text-red-500 text-xs text-center">Failed to send message. Try again.</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
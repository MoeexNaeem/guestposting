'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Mail, Lock, ArrowLeft, ShieldCheck, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      router.push('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans selection:bg-blue-100">
      
      {/* Left Panel - Brand Identity */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] text-white flex-col justify-between p-20 relative overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]"></div>

        <Link href="/" className="flex items-center gap-3 relative z-10 transition-transform hover:scale-105 origin-left">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-xl shadow-blue-500/20">
            L
          </div>
          <span className="text-2xl font-semibold tracking-tight">LetRank</span>
        </Link>

        <div className="max-w-md relative z-10">
          <h2 className="text-4xl font-semibold tracking-tight leading-tight mb-6">
            Your SEO command center, simplified.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Access your secure escrow, collaborate with publishers, and scale your guest post placements from a single dashboard.
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
              <ShieldCheck className="text-emerald-400" size={18} /> Verified Domain Analytics
            </div>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-300 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
              <TrendingUp className="text-blue-400" size={18} /> High-Traffic Premium Publishers
            </div>
          </div>
        </div>

        <p className="text-slate-500 text-sm font-medium relative z-10">
          © {new Date().getFullYear()} LetRank Marketplace
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative">
        
        <Link 
          href="/" 
          className="absolute top-8 left-8 sm:left-12 lg:left-24 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="max-w-[400px] w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">Welcome Back</h1>
            <p className="text-slate-500">Enter your credentials to access your workspace.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-slate-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" title="Recover account" className="text-[12px] font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying Account...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[14px] font-medium text-slate-500">
            New to LetRank?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
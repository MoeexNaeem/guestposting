'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Mail, Lock, ArrowLeft, ShieldCheck, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState('');
  const [otpValues, setOtpValues] = useState(new Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // --- OTP INPUT HANDLERS ---
  const handleOtpChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpValues[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, 6).replace(/\D/g, '');
    if (pasteData) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pasteData.length; i++) {
        newOtpValues[i] = pasteData[i];
      }
      setOtpValues(newOtpValues);
      const nextIndex = Math.min(pasteData.length, 5);
      document.getElementById(`otp-${nextIndex}`)?.focus();
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending recovery code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const finalOtp = otpValues.join('');
    if (finalOtp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true); setError(''); setMessage('');
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp: finalOtp, newPassword });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
      setOtpValues(new Array(6).fill(''));
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white font-sans selection:bg-blue-100">
      
      {/* Left Panel - Modern Minimalist */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] text-white flex-col justify-between p-20 relative overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px]"></div>

        <Link href="/" className="flex items-center gap-3 relative z-10 transition-transform hover:scale-105 origin-left">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-xl shadow-blue-500/20">L</div>
          <span className="text-2xl font-semibold tracking-tight">LetRank</span>
        </Link>

        <div className="max-w-md relative z-10">
          <h2 className="text-4xl font-semibold tracking-tight leading-tight mb-6">Restoring access to your inventory.</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            We prioritize the security of your marketplace assets. Use the secure code sent to your email to verify your identity and reset your password.
          </p>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-300 bg-white/5 w-fit px-4 py-2 rounded-full border border-white/10">
            <ShieldCheck className="text-emerald-400" size={18} /> End-to-End Encrypted Recovery
          </div>
        </div>

        <p className="text-slate-500 text-sm tracking-wide relative z-10 font-medium">
          &copy; {new Date().getFullYear()} LetRank Workspace
        </p>
      </div>

      {/* Right Panel - Focused Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-24 relative">
        <Link href="/login" className="absolute top-8 left-8 sm:left-12 lg:left-24 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="max-w-[400px] w-full mx-auto">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">
              {step === 1 ? 'Recovery' : step === 4 ? 'Secure Again' : 'Verification'}
            </h1>
            <p className="text-slate-500">
              {step === 1 ? "Enter your email to receive a secure code." : step === 4 ? "Your password has been successfully updated." : "Check your inbox for the 6-digit verification code."}
            </p>
          </div>

          {/* Alert Handling */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          {message && step !== 4 && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 size={18} className="shrink-0" /> {message}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 ml-1">Account Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                    placeholder="e.g. mace@example.com" 
                  />
                </div>
              </div>
              <button disabled={loading} className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Code'}
              </button>
            </form>
          )}

          {/* STEP 2 & 3: CODE + NEW PASS */}
          {(step === 2 || step === 3) && (
            <form onSubmit={handleResetPassword} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[13px] font-semibold text-slate-700 ml-1">Verification Code</label>
                <div className="flex justify-between gap-2 sm:gap-3">
                  {otpValues.map((data, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      className="w-full h-14 bg-white border border-slate-200 rounded-xl text-center text-xl font-semibold text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onKeyDown={e => handleOtpKeyDown(e, index)}
                      onFocus={e => e.target.select()}
                      onPaste={handleOtpPaste}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" 
                    placeholder="Min. 8 characters" 
                    minLength="8" 
                  />
                </div>
              </div>

              <button disabled={loading} className="w-full bg-blue-600 text-white font-medium py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Reset Password'}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                <CheckCircle2 size={40} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Password Updated</h3>
              <p className="text-slate-500 mb-8">You can now use your new password to sign in to your workspace.</p>
              <button 
                onClick={() => router.push('/login')} 
                className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
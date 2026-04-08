import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, BarChart3, CheckCircle2  } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-white">
      {/* 1. TEXTURED BACKGROUND ELEMENTS */}
      {/* SVG Grid Pattern */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v2h-2v-2h2zm0 4v2h-2v-2h2zm-4 0v2h-2v-2h2zm4-4h2v2h-2v-2zm0-4V24h2v2h-2v-2zM24 24v2h-2v-2h2zm0 4v2h-2v-2h2zm-4 0v2h-2v-2h2zm4-4h2v2h-2v-2zm0-4V12h2v2h-2v-2zM12 12v2H10v-2h2zm0 4v2H10v-2h2zm-4 0v2H8v-2h2zm4-4h2v2h-2v-2zm0-4V0h2v2h-2v-2zM0 0v2h2V0H0zm0 4v2h2V4H0zm4 0v2h2V4H4zM0 4h2v2H0V4zm0-4V0h2v2H0V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      
      {/* Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-1/4 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/60 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            Premium SEO Marketplace 2.0
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
            Build Authority. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Own the Search Results.
            </span>
          </h1>
          
          {/* Subtext */}
          <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Skip the manual outreach. Access a curated catalog of high-DR publishers with 
            <span className="text-slate-900 font-semibold"> verified traffic data </span> 
            and transparent pricing.
          </p>
          
          {/* CTA Buttons */}
          <div className="pt-6 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-semibold text-[15px] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group active:scale-[0.98]">
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#how" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center active:scale-[0.98]">
              View Inventory
            </a>
          </div>

          {/* 2. FLOATING SOCIAL PROOF / STATS */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { icon: <ShieldCheck size={18} />, label: 'Verified Sites', val: '5k+' },
              { icon: <Zap size={18} />, label: 'Avg. Delivery', val: '48h' },
              { icon: <BarChart3 size={18} />, label: 'Min. DR', val: '30+' },
              { icon: <CheckCircle2 size={18} />, label: 'Success Rate', val: '99%' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-2">{stat.icon}</div>
                <span className="text-xl font-bold text-slate-900">{stat.val}</span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* 3. DECORATIVE SIDE ELEMENTS (Visual Polish) */}
      <div className="hidden xl:block absolute top-1/2 left-10 -translate-y-1/2 opacity-20 rotate-12 pointer-events-none">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xl">
             <div className="w-32 h-2 bg-slate-100 rounded-full mb-2"></div>
             <div className="w-24 h-2 bg-slate-50 rounded-full"></div>
          </div>
      </div>
      <div className="hidden xl:block absolute top-1/3 right-10 opacity-20 -rotate-12 pointer-events-none">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xl">
             <div className="flex gap-2 mb-2">
                <div className="w-4 h-4 bg-emerald-50 rounded"></div>
                <div className="w-20 h-4 bg-slate-50 rounded"></div>
             </div>
             <div className="w-24 h-2 bg-slate-100 rounded-full"></div>
          </div>
      </div>

    </section>
  );
};

export default Hero;
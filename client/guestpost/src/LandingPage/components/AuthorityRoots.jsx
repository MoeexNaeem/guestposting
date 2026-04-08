import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, MessageSquare, Zap, Globe, ShieldCheck, TrendingUp, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthorityRoots = () => {
  const steps = [
    {
      id: "01",
      icon: <Globe size={20} />,
      title: "Global Inventory Access",
      desc: "5k+ high-authority domains, instantly filterable."
    },
    {
      id: "02",
      icon: <TrendingUp size={20} />,
      title: "Verified Real-Time Traffic",
      desc: "We fetch real metrics, not estimated data."
    },
    {
      id: "03",
      icon: <MessageSquare size={20} />,
      title: "Workspace Collaboration",
      desc: "Chat directly with webmasters to refine strategy."
    },
    {
      id: "04",
      icon: <ShieldCheck size={20} />,
      title: "Secure Escrow",
      desc: "Funds released only after link is confirmed live."
    }
  ];

  const cardVariants = {
    offscreen: { opacity: 0, y: 30 },
    onscreen: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="relative py-28 bg-[#fafafa] overflow-hidden">
      {/* Subtle Background Shape */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v2h-2v-2h2zm0 4v2h-2v-2h2zm-4 0v2h-2v-2h2zm4-4h2v2h-2v-2zm0-4V24h2v2h-2v-2zM24 24v2h-2v-2h2zm0 4v2h-2v-2h2zm-4 0v2h-2v-2h2zm4-4h2v2h-2v-2zm0-4V12h2v2h-2v-2zM12 12v2H10v-2h2zm0 4v2H10v-2h2zm-4 0v2H8v-2h2zm4-4h2v2h-2v-2zm0-4V0h2v2h-2v-2zM0 0v2h2V0H0zm0 4v2h2V4H0zm4 0v2h2V4H4zM0 4h2v2H0V4zm0-4V0h2v2H0V0z'/%3E%3C/g%3E%3C/svg%3E")` }}></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-6">
            Everything you need to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">scale your authority.</span>
          </h2>
          <p className="text-[17px] text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
            Skip the manual outreach. Access a curated catalog of high-DR publishers with 
            <span className="text-slate-900 font-semibold"> verified traffic data </span> 
            and transparent pricing.
          </p>
        </div>

        {/* NESTED GRID DESIGN */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT Feature Root (Steps 01-02) */}
          <motion.div 
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ onscreen: { transition: { staggerChildren: 0.15 } }}}
            className="md:col-span-3 grid grid-rows-2 gap-8"
          >
            {[steps[0], steps[1]].map((step) => (
              <motion.div key={step.id} variants={cardVariants} className="bg-white p-7 rounded-[1.5rem] border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 leading-tight pt-1">{step.title}</h3>
                </div>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* MAIN TRUNK CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="md:col-span-6 bg-slate-950 p-10 md:p-14 rounded-[2rem] text-center text-white flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px]"></div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-6 relative z-10"
            >
              <Zap size={14} className="animate-pulse" /> The LetRank Advantage
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight mb-6 relative z-10">
              Authority, Simplified. <br/> Access Verified Inventory.
            </h1>
            
            <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed mb-10 max-w-sm relative z-10">
              Skip the manual outreach. View thousands of premium publishers with real Google Analytics traffic.
            </p>

            <Link 
              to="/marketplace" 
              className="relative z-10 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-medium text-[15px] flex items-center gap-2 group shadow-xl shadow-blue-500/20 active:scale-95"
            >
              Explore Catalog 
              <motion.span initial={{ x: 0 }} whileHover={{ x: 4 }}>
                <Search size={16} />
              </motion.span>
            </Link>
          </motion.div>

          {/* RIGHT Feature Root (Steps 03-04) */}
          <motion.div 
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ onscreen: { transition: { staggerChildren: 0.15 } }}}
            className="md:col-span-3 grid grid-rows-2 gap-8"
          >
            {[steps[2], steps[3]].map((step) => (
              <motion.div key={step.id} variants={cardVariants} className="bg-white p-7 rounded-[1.5rem] border border-slate-200 shadow-sm hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 leading-tight pt-1">{step.title}</h3>
                </div>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Closing Shard */}
        <div className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-center gap-6">
           <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Mainnet Active
           </div>
           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
           <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest">
              Secured Escrow Payments
           </div>
        </div>
      </div>
    </section>
  );
};

export default AuthorityRoots;
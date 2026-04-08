import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, ShieldCheck, Zap, Globe, 
  ArrowRight, CheckCircle, BarChart3
} from 'lucide-react';

const LandingPage = () => {
  // Animation Variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-200">
      
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-100">
              LR
            </div>
            <span className="text-2xl font-black tracking-tighter italic">LetRank</span>
          </div>
          <div className="flex items-center gap-6 font-bold text-sm">
            <a href="#features" className="text-slate-500 hover:text-blue-600 transition-colors">Features</a>
            <Link to="/login" className="text-slate-900 hover:text-blue-600 transition-colors">Log In</Link>
            <Link to="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-black transition-all shadow-lg shadow-slate-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Premium SEO Marketplace
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1]">
              Rank Higher With <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 italic">
                Authority Links.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
              Skip the outreach. Buy verified guest posts from high-traffic, high-DA websites. Everything you need to scale your SEO, all in one dashboard.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-200 flex items-center gap-2 group">
                Explore Inventory <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register?role=seller" className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all">
                Become a Vendor
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Abstract UI Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative h-[500px] hidden lg:block"
          >
            {/* Main Mockup Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute top-10 right-10 w-80 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-xl tracking-tight">techcrunch.com</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase">Tech Niche</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle size={12} /> Verified
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Traffic</span>
                  <span className="font-black text-slate-800 flex items-center gap-1"><TrendingUp size={14} className="text-emerald-500"/> 1.2M+</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">DA Score</span>
                  <span className="font-black text-slate-800 flex items-center gap-1"><ShieldCheck size={14} className="text-blue-500"/> 92</span>
                </div>
              </div>
            </motion.div>

            {/* Smaller Floating Card */}
            <motion.div 
              animate={{ y: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-20 left-10 w-64 bg-slate-900 text-white p-5 rounded-3xl shadow-2xl border border-slate-700"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400"><BarChart3 size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Balance</p>
                  <p className="text-xl font-black tracking-tighter">$4,250.00</p>
                </div>
              </div>
              <button className="w-full py-2 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest">Withdraw Funds</button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black tracking-tighter mb-4 italic">Built for Serious SEOs.</h2>
            <p className="text-slate-500 font-bold">We handle the verification, escrow, and communication so you can focus on ranking.</p>
          </div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: <ShieldCheck size={28} />, title: 'Verified Metrics', desc: 'Every domain is manually checked for real traffic and DA. No PBNs allowed.', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: <Zap size={28} />, title: 'Instant Workspace', desc: 'Communicate with vendors and submit your articles directly in our smooth dashboard.', color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: <Globe size={28} />, title: 'Secure Escrow', desc: 'Your funds are held safely until the vendor publishes your link exactly as requested.', color: 'text-emerald-500', bg: 'bg-emerald-50' }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp} className="p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl transition-all group">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white border-t-8 border-blue-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-black tracking-tighter mb-6 italic">Ready to dominate the SERPs?</h2>
          <p className="text-slate-400 font-bold mb-10 text-lg">Join hundreds of SEOs and site owners upgrading their backlink profiles today.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-2xl shadow-blue-900">
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
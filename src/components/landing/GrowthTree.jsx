'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, MessageSquare, Zap, BarChart3, ShieldCheck, Globe } from 'lucide-react';

const GrowthTree = () => {
  const steps = [
    {
      icon: <Globe className="text-blue-600" size={24} />,
      title: "Inventory Discovery",
      desc: "Browse through 5,000+ verified publishers categorized by niche, DA, and real organic traffic data.",
      side: "left"
    },
    {
      icon: <MousePointer2 className="text-indigo-600" size={24} />,
      title: "One-Click Selection",
      desc: "Pick your target URL and anchor text. Our system automatically validates the requirements against publisher guidelines.",
      side: "right"
    },
    {
      icon: <MessageSquare className="text-blue-600" size={24} />,
      title: "Direct Collaboration",
      desc: "Chat directly with webmasters to discuss content angles or custom placement requirements in real-time.",
      side: "left"
    },
    {
      icon: <Zap className="text-amber-500" size={24} />,
      title: "Rapid Fulfillment",
      desc: "Most orders are live within 48 hours. You get a notification the second your link is indexed.",
      side: "right"
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Your Path to <span className="text-blue-600">Search Dominance</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mx-auto">
            From initial discovery to live placement, our streamlined workflow handles the heavy lifting.
          </p>
        </div>

        <div className="relative">
          {/* THE TRUNK (Central Line) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-slate-100 z-0 hidden md:block">
            <motion.div 
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full bg-gradient-to-b from-blue-500 to-indigo-600"
            />
          </div>

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, i) => (
              <div key={i} className={`relative flex items-center justify-between w-full mb-8 md:mb-24 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Space filler for the other side */}
                <div className="hidden md:block w-[45%]" />

                {/* THE BRANCH DOT */}
                <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-10 h-10 bg-white border-4 border-slate-50 rounded-full z-10 flex items-center justify-center shadow-sm">
                   <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                </div>

                {/* CONTENT CARD */}
                <motion.div 
                  initial={{ opacity: 0, x: step.side === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="w-full md:w-[45%] ml-12 md:ml-0"
                >
                  <div className="p-8 bg-slate-50/50 border border-slate-200 rounded-[2rem] hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          {/* FINAL ROOT ICON */}
          <div className="flex justify-center mt-12 md:mt-0">
             <motion.div 
               initial={{ scale: 0 }}
               whileInView={{ scale: 1 }}
               viewport={{ once: true }}
               className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl z-10 relative"
             >
                <ShieldCheck size={28} />
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GrowthTree;
import React from 'react';
import { ShieldCheck, BarChart3, Users2, ArrowRight } from 'lucide-react';

const Services = () => {
  const features = [
    { 
      icon: <ShieldCheck size={24}/>, 
      title: 'Secure Escrow', 
      desc: 'Transactions are protected by our automated escrow. Funds are only released to the publisher once the placement is verified live.',
      color: 'blue'
    },
    { 
      icon: <BarChart3 size={24}/>, 
      title: 'Verified Insights', 
      desc: 'No more estimated traffic. We fetch real-time metrics directly from site analytics to ensure 100% data integrity.',
      color: 'indigo'
    },
    { 
      icon: <Users2 size={24}/>, 
      title: 'Direct Negotiation', 
      desc: 'Our real-time workspace allows you to chat directly with webmasters, negotiate bulk deals, and request specific edits.',
      color: 'emerald'
    }
  ];

  return (
    <section id="services" className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Subtle Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/30 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
            Engineered for Digital Authority.
          </h2>
          <p className="text-[16px] text-slate-500 font-medium max-w-xl mx-auto">
            We’ve removed the friction from link building so you can scale your SEO strategy with confidence.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="group relative p-8 bg-white border border-slate-200 rounded-3xl transition-all duration-300 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              {/* Card Hover Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-[0.03] transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  {f.icon}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  {f.title}
                </h3>
                
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-6">
                  {f.desc}
                </p>

                <div className="flex items-center gap-2 text-[13px] font-semibold text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                  Learn more <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
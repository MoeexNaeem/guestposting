'use client';

import React from 'react';
import Link from 'next/link';

// --- NAVBAR COMPONENT ---
export const Navbar = () => {
  const navLinks = [
    { name: 'Services', href: '#services', isExternal: false },
    { name: 'Catalog', href: '/marketplace', isExternal: true },
    { name: 'Contact', href: '#contact', isExternal: false }
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 group-hover:rotate-6 transition-transform">
            L
          </div>
          <span className="text-xl font-semibold tracking-tight text-slate-900">
            LetRank
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((item) => (
            item.isExternal ? (
              // Use Link for different pages
              <Link 
                key={item.name}
                href={item.href} 
                className="text-[13px] font-semibold text-slate-500 hover:text-blue-600 transition-colors tracking-tight"
              >
                {item.name}
              </Link>
            ) : (
              // Use standard anchor for # ID scrolling
              <a 
                key={item.name}
                href={item.href} 
                className="text-[13px] font-semibold text-slate-500 hover:text-blue-600 transition-colors tracking-tight"
              >
                {item.name}
              </a>
            )
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-6">
          <Link 
            href="/login" 
            className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};
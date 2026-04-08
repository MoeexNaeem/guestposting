import React from 'react';
import {Navbar} from './components/Navbar'; 
import Hero from './components/Hero';
import MarketPreview from './components/MarketPreview';
import Services from './components/Services';
import Contact from './components/Contact';
import GrowthTree from './components/GrowthTree';
import { Footer } from './components/Footer';
import AuthorityRoots from './components/AuthorityRoots';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-200">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <AuthorityRoots />
        <MarketPreview />
        <GrowthTree />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
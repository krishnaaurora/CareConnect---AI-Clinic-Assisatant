import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import TrustPrivacy from './components/TrustPrivacy';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import PhoneDialerModal from './components/PhoneDialerModal';

export default function App() {
  const [dialerOpen, setDialerOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] text-[#0A2520] selection:bg-[#DCFAF3] selection:text-[#0F5B4C] overflow-x-hidden">
      {/* Refined Light-Theme Ambient Background Gradient Canvas */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(1100px circle at 85% -5%, rgba(0, 201, 167, 0.055), transparent 60%),
            radial-gradient(900px circle at 10% 28%, rgba(15, 91, 76, 0.04), transparent 55%),
            radial-gradient(950px circle at 92% 58%, rgba(0, 201, 167, 0.045), transparent 60%),
            radial-gradient(800px circle at 12% 88%, rgba(15, 91, 76, 0.035), transparent 55%)
          `
        }}
      />

      {/* Top Navbar */}
      <Navbar onOpenDialer={() => setDialerOpen(true)} />

      {/* Main Sections: Hero → About → Features → How It Works → Trust & Privacy → FAQs */}
      <main>
        <Hero onOpenDialer={() => setDialerOpen(true)} />
        <About />
        <Features />
        <HowItWorks />
        <TrustPrivacy />
        <FAQ />
      </main>

      {/* Footer & Emergency Disclaimer */}
      <Footer />

      {/* Interactive 3D Phone Dialer Simulator */}
      <PhoneDialerModal 
        isOpen={dialerOpen} 
        onClose={() => setDialerOpen(false)} 
      />
    </div>
  );
}

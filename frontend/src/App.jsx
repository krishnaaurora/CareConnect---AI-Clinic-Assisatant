import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PartnerClinics from './components/PartnerClinics';
import About from './components/About';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import TrustPrivacy from './components/TrustPrivacy';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import PhoneDialerModal from './components/PhoneDialerModal';
import AdminPage from './components/AdminPage';

export default function App() {
  const [dialerOpen, setDialerOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || hash.includes('admin')) {
        return 'admin';
      }
    }
    return 'landing';
  });

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(window.scrollY / totalHeight);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin') || hash.includes('admin')) {
        setView('admin');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = (newView) => {
    setView(newView);
    if (newView === 'admin') {
      window.history.pushState({}, '', '/admin');
    } else {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (view === 'admin') {
    return <AdminPage onNavigateHome={() => navigateTo('landing')} />;
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#0A2520] selection:bg-[#DCFAF3] selection:text-[#0F5B4C] overflow-x-hidden">
      {/* ── Precision Scroll Reading Progress Bar (Top of Viewport) ── */}
      <div 
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          zIndex: 9999,
          pointerEvents: 'none',
          backgroundColor: 'transparent',
        }}
      >
        <div 
          style={{
            height: '100%',
            width: '100%',
            background: 'linear-gradient(90deg, #00876C 0%, #00C9A7 60%, #38BDF8 100%)',
            transformOrigin: '0% 50%',
            transform: `scaleX(${scrollProgress})`,
            transition: 'transform 0.06s linear',
            boxShadow: '0 0 8px rgba(0, 201, 167, 0.6)',
          }}
        />
      </div>

      {/* Clean Hospital Architectural Micro-Grid Canvas */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed inset-0 z-0 opacity-35"
        style={{
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Top Navbar */}
      <Navbar 
        onOpenDialer={() => setDialerOpen(true)} 
        onNavigateAdmin={() => navigateTo('admin')} 
      />

      {/* Main Sections: Hero → Partners → About → Features → How It Works → Trust & Privacy → FAQs */}
      <main>
        <Hero onOpenDialer={() => setDialerOpen(true)} />
        <PartnerClinics />
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

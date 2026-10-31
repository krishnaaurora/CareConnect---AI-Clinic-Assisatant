import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VoiceInfraPartners from './components/VoiceInfraPartners';
import PartnerClinics from './components/PartnerClinics';
import About from './components/About';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import TrustPrivacy from './components/TrustPrivacy';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import PhoneDialerModal from './components/PhoneDialerModal';
import RealtimeVoiceModal from './components/RealtimeVoiceModal';
import AdminPage from './components/AdminPage';
import PageLoader from './components/PageLoader';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [dialerOpen, setDialerOpen] = useState(false);
  const [realtimeVoiceOpen, setRealtimeVoiceOpen] = useState(false);
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

  // ── Lenis Smooth Momentum Scrolling ──
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      infinite: false,
    });

    window.lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Sync scroll progress indicator smoothly with Lenis
    const handleScroll = (e) => {
      const scroll = e.scroll !== undefined ? e.scroll : window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, scroll / totalHeight)));
      }
    };

    lenis.on('scroll', handleScroll);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete window.lenis;
    };
  }, []);

  // ── Smooth Anchor Link Scrolling ──
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const hash = anchor.getAttribute('href');
      if (hash && hash !== '#' && hash.length > 1) {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          e.preventDefault();
          if (window.lenis) {
            window.lenis.scrollTo(targetElement, { offset: -70, duration: 1.1 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // ── Route & Hash Handling ──
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
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: false, duration: 0.6 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (view === 'admin') {
    return <AdminPage onNavigateHome={() => navigateTo('landing')} />;
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#0A2520] selection:bg-[#DCFAF3] selection:text-[#0F5B4C] overflow-x-hidden">
      {/* ── Initial Splash Preloader: Logo Sign Draw Animation ── */}
      {isLoading && <PageLoader onComplete={() => setIsLoading(false)} />}

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
            transition: 'transform 0.08s cubic-bezier(0.16, 1, 0.3, 1)',
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
        onOpenDialer={() => setRealtimeVoiceOpen(true)} 
        onNavigateAdmin={() => navigateTo('admin')} 
      />

      {/* Main Sections: Hero → Voice Infra Partners → Partner Clinics → About → Features → How It Works → Trust & Privacy → FAQs */}
      <main>
        <Hero 
          onOpenDialer={() => setDialerOpen(true)} 
          onOpenRealtimeVoice={() => setRealtimeVoiceOpen(true)}
        />
        <VoiceInfraPartners />
        <PartnerClinics />
        <About />
        <Features />
        <HowItWorks />
        <TrustPrivacy />
        <FAQ />
      </main>

      {/* Footer & Emergency Disclaimer */}
      <Footer />

      {/* Real-Time Sarvam AI Voice Receptionist Modal */}
      <RealtimeVoiceModal
        isOpen={realtimeVoiceOpen}
        onClose={() => setRealtimeVoiceOpen(false)}
      />

      {/* Interactive 3D Phone Dialer Simulator */}
      <PhoneDialerModal 
        isOpen={dialerOpen} 
        onClose={() => setDialerOpen(false)} 
      />
    </div>
  );
}

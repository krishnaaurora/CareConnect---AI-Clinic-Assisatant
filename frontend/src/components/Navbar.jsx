import React, { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import careconnectLogo from '../assets/careconnect-logo-transparent.png';

export default function Navbar({ onOpenDialer, onNavigateAdmin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Detect phone mockup position
      const mockupEl = document.getElementById('hero-phone-mockup');
      if (mockupEl) {
        const rect = mockupEl.getBoundingClientRect();
        // Hide navbar while user has scrolled into the phone mockup focus area
        const inMockupArea = rect.top < 220 && rect.bottom > 100;
        setHideNav(inMockupArea);
        if (inMockupArea && mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
      } else {
        setHideNav(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Product', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'For Hospitals', href: '#about' },
    { label: 'Pricing', href: '#faqs' },
    { label: 'Resources', href: '#trust' },
  ];

  return (
    <header style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      transform: hideNav ? 'translateY(-110%)' : 'translateY(0)',
      opacity: hideNav ? 0 : 1,
      pointerEvents: hideNav ? 'none' : 'auto',
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease, background-color 0.3s ease, box-shadow 0.3s ease',
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: isScrolled ? '1px solid #E2E8F0' : '1px solid rgba(226, 232, 240, 0.6)',
      boxShadow: isScrolled ? '0 4px 20px rgba(15, 23, 42, 0.04)' : 'none',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px',
      }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }} aria-label="CareConnect AI Home">
          <img 
            src={careconnectLogo} 
            alt="CareConnect AI" 
            style={{ 
              height: '36px', 
              width: 'auto', 
              display: 'block', 
              objectFit: 'contain' 
            }} 
          />
        </a>

        {/* Desktop Nav Links with Animated Yellow Underline on Hover */}
        <nav aria-label="Main navigation" style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="nav-link-item"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions: Admin Portal & Mobile Menu Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onNavigateAdmin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '999px',
              backgroundColor: '#EDFDF9',
              color: '#0F5B4C',
              border: '1px solid rgba(0, 201, 167, 0.4)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0F5B4C'; e.currentTarget.style.color = '#FFFFFF'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#EDFDF9'; e.currentTarget.style.color = '#0F5B4C'; }}
          >
            <ShieldCheck size={15} color="#00C9A7" />
            <span>Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: 'none', border: 'none', color: '#0F5B4C', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'none' }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 24px 20px',
          backgroundColor: '#fff',
          borderTop: '1px solid rgba(15, 91, 76, 0.08)',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-nav-link-item"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => { setMobileMenuOpen(false); onNavigateAdmin(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: '#0F5B4C',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '6px'
            }}
          >
            <ShieldCheck size={16} />
            <span>Open Demo</span>
          </button>
        </div>
      )}

      <style>{`
        /* Desktop Navigation Links with Smooth Yellow Underline */
        .nav-link-item {
          position: relative;
          color: #475569;
          text-decoration: none;
          fontSize: 14.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          padding: 6px 0;
          display: inline-block;
          transition: color 0.2s ease;
        }

        .nav-link-item::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0px;
          width: 0%;
          height: 2.5px;
          background-color: #FACC15; /* Crisp, vibrant yellow */
          border-radius: 2px;
          transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-link-item:hover {
          color: #0A2520;
        }

        .nav-link-item:hover::after {
          width: 100%;
        }

        /* Mobile Navigation Links */
        .mobile-nav-link-item {
          position: relative;
          color: #0F5B4C;
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          padding: 6px 0;
          display: inline-block;
          align-self: flex-start;
          transition: color 0.2s ease;
        }

        .mobile-nav-link-item::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0px;
          width: 0%;
          height: 2.5px;
          background-color: #FACC15;
          border-radius: 2px;
          transition: width 0.25s ease;
        }

        .mobile-nav-link-item:hover {
          color: #0A2520;
        }

        .mobile-nav-link-item:hover::after {
          width: 100%;
        }

        @media (min-width: 820px) { .desktop-nav { display: flex !important; } }
        @media (max-width: 819px) { .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </header>
  );
}

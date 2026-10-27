import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar({ onOpenDialer }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      transition: 'all 0.3s ease',
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(253, 252, 250, 0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: isScrolled ? '1px solid rgba(15, 91, 76, 0.08)' : '1px solid transparent',
      boxShadow: isScrolled ? '0 2px 18px rgba(15, 91, 76, 0.04)' : 'none',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px',
      }}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }} aria-label="CareConnect AI Home">
          <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
            <path d="M14 6C14 4.89543 14.8954 4 16 4H20C21.1046 4 22 4.89543 22 6V14H30C31.1046 14 32 14.8954 32 16V20C32 21.1046 31.1046 22 30 22H22V30C22 31.1046 21.1046 32 20 32H16C14.8954 32 14 31.1046 14 30V22H6C4.89543 22 4 21.1046 4 20V16C4 14.8954 4.89543 14 6 14H14V6Z" fill="url(#navCrossGrad)" />
            <circle cx="10" cy="10" r="4.5" fill="#38BDF8" opacity="0.9" />
            <circle cx="26" cy="10" r="4.5" fill="#00C9A7" opacity="0.9" />
            <circle cx="10" cy="26" r="4.5" fill="#0F5B4C" opacity="0.9" />
            <circle cx="26" cy="26" r="4.5" fill="#10B981" opacity="0.9" />
            <defs>
              <linearGradient id="navCrossGrad" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00C9A7" />
                <stop offset="0.5" stopColor="#0F5B4C" />
                <stop offset="1" stopColor="#0A2520" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>
              CareConnect
            </span>
            <span style={{ fontSize: '20px', fontWeight: 900, color: '#00C9A7', fontFamily: 'Manrope, sans-serif' }}>
              AI
            </span>
          </div>
        </a>

        {/* Desktop Nav Links */}
        <nav aria-label="Main navigation" style={{ display: 'none', alignItems: 'center', gap: '32px' }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                color: '#475569',
                textDecoration: 'none',
                fontSize: '14.5px',
                fontWeight: 600,
                transition: 'color 0.2s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#0F5B4C'}
              onMouseLeave={e => e.currentTarget.style.color = '#475569'}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Button: Request a Demo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={onOpenDialer}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0F5B4C',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              padding: '10px 22px',
              borderRadius: '999px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)',
              transition: 'all 0.2s ease',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#083F34'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0F5B4C'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span>Request a Demo</span>
            <ArrowRight size={14} strokeWidth={2.5} />
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
              style={{ color: '#0F5B4C', textDecoration: 'none', fontSize: '15px', fontWeight: 600, padding: '6px 0' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 820px) { .desktop-nav { display: flex !important; } }
        @media (max-width: 819px) { .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </header>
  );
}

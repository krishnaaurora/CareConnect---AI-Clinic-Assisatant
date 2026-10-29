import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Plus 
} from 'lucide-react';
import careconnectFooterLogo from '../assets/careconnect-logo-white-text.png';

/* ── Social Vector Icons ── */

const FacebookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <footer style={{
      backgroundColor: '#0A231C',
      color: '#FFFFFF',
      paddingTop: '60px',
      paddingBottom: '36px',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
      borderTop: '1px solid rgba(0, 201, 167, 0.15)'
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* 4-Column Footer Grid matching Reference */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          
          {/* Column 1: Brand Info & Contact */}
          <div>
            {/* CareConnect AI Official Logo */}
            <div style={{ marginBottom: '18px' }}>
              <img
                src={careconnectFooterLogo}
                alt="CareConnect AI"
                style={{
                  height: '36px',
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
            </div>

            <p style={{
              fontSize: '13.5px',
              color: '#B0C4BF',
              lineHeight: 1.6,
              marginBottom: '22px'
            }}>
              Compassionate, modern healthcare communication for every patient — backed by experienced specialists and round-the-clock support.
            </p>

            {/* Contact Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13px', color: '#B0C4BF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={16} color="#00C9A7" style={{ flexShrink: 0 }} />
                <span>100ft Road, Indiranagar, Bengaluru, KA 560038</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone size={16} color="#00C9A7" style={{ flexShrink: 0 }} />
                <span>+91 80 4125 7800</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={16} color="#00C9A7" style={{ flexShrink: 0 }} />
                <span>care@careconnect.ai</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '18px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <a href="#" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Home
              </a>
              <a href="#features" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Services
              </a>
              <a href="#how-it-works" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Doctors
              </a>
              <a href="#about" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                About
              </a>
              <a href="#contact" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Contact
              </a>
            </div>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '18px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Services
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
              <a href="#features" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Emergency Care
              </a>
              <a href="#features" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Cardiology
              </a>
              <a href="#features" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Pediatrics
              </a>
              <a href="#features" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Laboratory
              </a>
              <a href="#features" style={{ color: '#B0C4BF', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'} onMouseLeave={e => e.currentTarget.style.color = '#B0C4BF'}>
                Surgery
              </a>
            </div>
          </div>

          {/* Column 4: Stay Informed & Emergency Hotline */}
          <div>
            <h4 style={{
              fontSize: '15px',
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: '8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Stay informed
            </h4>
            <p style={{ fontSize: '13px', color: '#B0C4BF', marginBottom: '16px', lineHeight: 1.5 }}>
              Subscribe for wellness tips, hospital news, and seasonal health guidance.
            </p>

            {/* Newsletter Pill Input */}
            {subscribed ? (
              <div style={{
                padding: '10px 14px',
                borderRadius: '999px',
                backgroundColor: 'rgba(0, 201, 167, 0.15)',
                border: '1px solid #00C9A7',
                color: '#00C9A7',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600
              }}>
                <CheckCircle2 size={15} />
                <span>Subscribed! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                padding: '4px 5px 4px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    width: '100%',
                    fontFamily: 'Inter, sans-serif'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#00C9A7',
                    color: '#0A231C',
                    border: 'none',
                    borderRadius: '999px',
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Send size={12} />
                  <span>Subscribe</span>
                </button>
              </form>
            )}

            {/* Emergency Hotline Card */}
            <div style={{
              marginTop: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 201, 167, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Phone size={17} color="#00C9A7" />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#8DA39D', fontWeight: 600 }}>
                  Emergency hotline
                </div>
                <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  +1 (800) 911-0000
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '12.5px',
          color: '#8DA39D'
        }}>
          <div>
            © 2026 CareConnect AI. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="Facebook"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#B0C4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#00C9A7';
                e.currentTarget.style.color = '#0A231C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#B0C4BF';
              }}
            >
              <FacebookIcon />
            </a>

            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="Instagram"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#B0C4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#00C9A7';
                e.currentTarget.style.color = '#0A231C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#B0C4BF';
              }}
            >
              <InstagramIcon />
            </a>

            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              aria-label="LinkedIn"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#B0C4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#00C9A7';
                e.currentTarget.style.color = '#0A231C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#B0C4BF';
              }}
            >
              <LinkedinIcon />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

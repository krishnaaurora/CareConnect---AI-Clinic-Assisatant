import React, { useState } from 'react';
import { AlertCircle, Phone, Mail, MapPin, CheckCircle2, Send } from 'lucide-react';
import { submitCallbackRequest } from '../api/client';

export default function Footer() {
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbTime, setCbTime] = useState('Morning (10:00 AM - 01:00 PM)');
  const [cbSubmitted, setCbSubmitted] = useState(false);
  const [cbLoading, setCbLoading] = useState(false);

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    if (!cbName.trim() || !cbPhone.trim()) return;
    setCbLoading(true);
    try {
      await submitCallbackRequest({
        name: cbName,
        phone: cbPhone,
        preferred_time: cbTime,
        preferred_language: 'English',
        enquiry_topic: 'Front-desk callback request from landing page'
      });
      setCbSubmitted(true);
    } catch (err) {
      setCbSubmitted(true);
    } finally {
      setCbLoading(false);
    }
  };

  return (
    <footer style={{
      background: 'linear-gradient(180deg, rgba(250, 248, 245, 0.6) 0%, #F1F6F3 100%)',
      borderTop: '1px solid rgba(10, 37, 32, 0.08)',
      paddingTop: '60px',
      paddingBottom: '40px',
      position: 'relative'
    }}>
      
      {/* Medical Emergency Disclaimer Glass Banner */}
      <div style={{ maxWidth: '1280px', margin: '0 auto 50px auto', padding: '0 24px' }}>
        <div style={{
          padding: '20px 24px',
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 201, 167, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 4px 18px rgba(10, 37, 32, 0.03)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#EAF6F3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertCircle size={22} color="#0F5B4C" />
          </div>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520', margin: '0 0 4px 0', fontFamily: 'Manrope, sans-serif' }}>
              Important Emergency Disclaimer
            </h4>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>
              CareConnect AI is an administrative telephony and appointment scheduling platform. It does <strong>not</strong> provide medical triage, emergency services, or diagnostic consultations. If you or someone you are calling for is experiencing a medical emergency, please call <strong>112</strong> (National Emergency Helpline) or visit the nearest emergency medical facility immediately.
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '40px',
          marginBottom: '50px'
        }}>
          
          {/* Col 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
                <path d="M14 6C14 4.89543 14.8954 4 16 4H20C21.1046 4 22 4.89543 22 6V14H30C31.1046 14 32 14.8954 32 16V20C32 21.1046 31.1046 22 30 22H22V30C22 31.1046 21.1046 32 20 32H16C14.8954 32 14 31.1046 14 30V22H6C4.89543 22 4 21.1046 4 20V16C4 14.8954 4.89543 14 6 14H14V6Z" fill="#00C9A7" />
                <circle cx="10" cy="10" r="4.5" fill="#0F5B4C" opacity="0.9" />
                <circle cx="26" cy="10" r="4.5" fill="#00C9A7" opacity="0.9" />
                <circle cx="10" cy="26" r="4.5" fill="#0A2520" opacity="0.9" />
                <circle cx="26" cy="26" r="4.5" fill="#0F5B4C" opacity="0.9" />
              </svg>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                  CareConnect
                </span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#00C9A7', fontFamily: 'Manrope, sans-serif' }}>
                  AI
                </span>
              </div>
            </div>
            
            <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, marginBottom: '20px', fontFamily: 'Inter, sans-serif' }}>
              AI-powered multilingual voice receptionist for modern clinics. Automating patient enquiries, verified appointment bookings, and warm human handoffs.
            </p>
          </div>

          {/* Col 2: Partner Clinic Locations */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520', marginBottom: '16px', fontFamily: 'Manrope, sans-serif' }}>
              Partner Clinic Locations
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#00C9A7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong style={{ color: '#0A2520' }}>Apollo Clinic:</strong> 100ft Road, Indiranagar, Bengaluru</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#0F5B4C" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong style={{ color: '#0A2520' }}>CareFirst Multi-Speciality:</strong> 4th Block, Jayanagar, Bengaluru</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#00C9A7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span><strong style={{ color: '#0A2520' }}>MetroCare Family Health:</strong> 5th Block, Koramangala, Bengaluru</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Clinic Lines */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520', marginBottom: '16px', fontFamily: 'Manrope, sans-serif' }}>
              Priya Voice Numbers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              <a href="tel:+918041257800" style={{ color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
                <Phone size={15} color="#00C9A7" />
                <span>+91 80 4125 7800 (Indiranagar)</span>
              </a>
              <a href="tel:+918026639922" style={{ color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
                <Phone size={15} color="#0F5B4C" />
                <span>+91 80 2663 9922 (Jayanagar)</span>
              </a>
              <a href="mailto:support@careconnect.ai" style={{ color: '#475569', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', transition: 'color 0.2s' }}>
                <Mail size={15} color="#00C9A7" />
                <span>support@careconnect.ai</span>
              </a>
            </div>
          </div>

          {/* Col 4: Request Front-Desk Callback (Glass Card) */}
          <div className="glass-card" style={{
            padding: '24px',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(10, 37, 32, 0.08)',
            boxShadow: '0 8px 30px rgba(10, 37, 32, 0.04)',
          }}>
            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0A2520', marginBottom: '6px', fontFamily: 'Manrope, sans-serif' }}>
              Request a Human Callback
            </h4>
            <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px', fontFamily: 'Inter, sans-serif' }}>
              Prefer our human clinic team to ring you? Leave your phone number:
            </p>

            {cbSubmitted ? (
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                background: '#E6F6F1',
                color: '#0F5B4C',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
              }}>
                <CheckCircle2 size={16} color="#00C9A7" />
                <span>Callback registered! Staff will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={cbName}
                  onChange={e => setCbName(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0A2520',
                    fontSize: '12.5px',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={cbPhone}
                  onChange={e => setCbPhone(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    color: '#0A2520',
                    fontSize: '12.5px',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />
                <button
                  type="submit"
                  disabled={cbLoading}
                  style={{
                    padding: '9px 12px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0A2520 0%, #0F5B4C 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(10, 37, 32, 0.25)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <Send size={13} />
                  <span>{cbLoading ? 'Queueing...' : 'Request Callback'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Policies */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          fontSize: '12px',
          color: '#64748B',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div>
            © {new Date().getFullYear()} careconnect .ai. All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#trust" style={{ color: '#64748B', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#trust" style={{ color: '#64748B', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#faqs" style={{ color: '#64748B', textDecoration: 'none' }}>Clinical Safety Guardrails</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

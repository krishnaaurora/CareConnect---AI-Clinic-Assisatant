import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Stethoscope, User, Lock, Calendar } from 'lucide-react';

export default function TrustPrivacy() {
  const cards = [
    {
      icon: <Stethoscope size={22} color="#00A389" strokeWidth={2.2} />,
      title: "No Medical Advice",
      desc: "Priya does not diagnose conditions or recommend treatments. Medical questions are escalated to qualified clinic staff."
    },
    {
      icon: <User size={22} color="#00A389" strokeWidth={2.2} />,
      title: "Instant Staff Handoff",
      desc: "Requests that need human attention are routed to clinic staff, with the relevant conversation context."
    },
    {
      icon: <Lock size={22} color="#00A389" strokeWidth={2.2} />,
      title: "Strict Patient Privacy",
      desc: "Protect patient information through access controls, secure data handling and appropriate retention policies."
    },
    {
      icon: <Calendar size={22} color="#00A389" strokeWidth={2.2} />,
      title: "Accurate Appointments",
      desc: "Check live appointment availability before confirming bookings and prevent conflicting reservations."
    }
  ];

  return (
    <section id="trust" style={{
      padding: '90px 0 100px',
      position: 'relative',
      backgroundColor: '#0C1E34',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden'
    }}>
      <style>{`
        @media (max-width: 900px) {
          .trust-grid-container {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .trust-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 28px' }}>
        
        {/* 2-Column Layout matching Reference Image */}
        <div 
          className="trust-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.35fr',
            gap: '56px',
            alignItems: 'center'
          }}
        >
          
          {/* Left Column: Eyebrow + Big Heading + Paragraph */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 201, 167, 0.12)',
              border: '1px solid rgba(0, 201, 167, 0.3)',
              color: '#00C9A7',
              fontSize: '12.5px',
              fontWeight: 700,
              marginBottom: '20px',
              fontFamily: 'Inter, sans-serif'
            }}>
              <Shield size={14} color="#00C9A7" strokeWidth={2.2} />
              <span>Trust & Safety</span>
            </div>

            <h2 style={{
              fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.12,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.03em',
              margin: '0 0 20px'
            }}>
              Trust, Privacy & <br />
              <span style={{ color: '#00C9A7' }}>Clinical Guardrails</span>
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#94A3B8',
              lineHeight: 1.65,
              margin: 0,
              fontFamily: 'Inter, sans-serif',
              maxWidth: '460px'
            }}>
              Designed to keep patient conversations private, appointments accurate, and clinical decisions in the hands of qualified professionals.
            </p>
          </motion.div>

          {/* Right Column: 2x2 Grid of 4 Crisp White Cards */}
          <div 
            className="trust-cards-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px'
            }}
          >
            {cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '32px 28px',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFAF3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  flexShrink: 0
                }}>
                  {card.icon}
                </div>

                <h3 style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#0A2520',
                  margin: '0 0 10px',
                  fontFamily: 'Plus Jakarta Sans, sans-serif'
                }}>
                  {card.title}
                </h3>

                <p style={{
                  fontSize: '13.5px',
                  color: '#475569',
                  lineHeight: 1.55,
                  margin: 0,
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

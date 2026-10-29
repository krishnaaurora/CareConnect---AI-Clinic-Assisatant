import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import careconnectLogo from '../assets/careconnect-logo-transparent.png';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How can I get started with CareConnect AI?",
      steps: [
        { label: "1. Connect Your Clinic Calendar:", text: "Sync your existing appointments, consultation durations, and doctor roster in just a few clicks." },
        { label: "2. Configure AI Persona & Languages:", text: "Select Priya's voice greeting, speech speed, and enable English, Hindi, or Telugu for patient interactions." },
        { label: "3. Forward Clinic Telephone Lines:", text: "Route your incoming clinic calls to Priya for automatic 24/7 answering, verified bookings, and warm staff handoffs." }
      ]
    },
    {
      q: "What are the benefits of CareConnect AI over traditional reception?",
      text: "CareConnect AI answers patient calls instantly 24/7 without hold music, communicates fluently across multiple regional languages, eliminates manual double-booking mistakes, and frees front-desk staff to focus entirely on patients present in the clinic lobby."
    },
    {
      q: "Does Priya give medical advice or diagnose symptoms?",
      text: "Never. Priya operates with strict healthcare safety boundaries. She handles front-desk tasks (clinic hours, fees, doctor availability, appointment bookings) and immediately escalates all clinical questions or symptom descriptions to your medical team."
    },
    {
      q: "What happens if a patient calls with a medical emergency?",
      text: "Priya continuously scans for emergency keywords (chest pain, acute trauma, severe bleeding) in all supported languages. When detected, she delivers an immediate emergency priority disclaimer advising the caller to dial 112 or visit the nearest emergency room immediately."
    },
    {
      q: "Can the AI accidentally double-book an appointment slot?",
      text: "No. CareConnect AI performs live database slot validation before giving any confirmation code. If a physician slot is booked or blocked, Priya detects the conflict immediately and offers the patient the next closest available consultation time."
    },
    {
      q: "How is patient data protected and secured?",
      text: "All telephony audio and patient appointment records are encrypted in transit and at rest using healthcare-grade TLS and AES-256 protocols. Your clinic's patient data is completely private and is never sold, shared, or reused."
    }
  ];

  return (
    <section id="faqs" style={{
      padding: '96px 0 108px',
      position: 'relative',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E8F0',
      fontFamily: 'Inter, sans-serif'
    }}>
      <style>{`
        @keyframes floatSoftLogo {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes faqAudioWave {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* 2-Column Layout matching Reference Image */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '56px',
          alignItems: 'start'
        }}>
          
          {/* Left Column: Heading + Subtitle + Priya AI Persona Image */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              borderRadius: '999px',
              backgroundColor: '#DCFAF3',
              color: '#007A65',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px',
              border: '1px solid rgba(0, 135, 108, 0.15)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#007A65', display: 'inline-block' }} />
              FREQUENTLY ASKED QUESTIONS
            </div>

            <h2 style={{
              fontSize: 'clamp(2.3rem, 3.8vw, 3.3rem)',
              fontWeight: 900,
              color: '#0A2520',
              lineHeight: 1.15,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.03em',
              margin: '0 0 16px'
            }}>
              Frequently <span style={{ color: '#00876C' }}>Asked!</span>
            </h2>

            <p style={{
              fontSize: '15px',
              color: '#64748B',
              lineHeight: 1.6,
              margin: '0 0 24px',
              fontFamily: 'Inter, sans-serif'
            }}>
              List of Commonly Asked Questions on CareConnect AI
            </p>

            {/* CareConnect AI Official Brand Logo Card */}
            <div style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              animation: 'floatSoftLogo 4s ease-in-out infinite',
              marginTop: '4px'
            }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '28px 32px',
                border: '1.5px solid rgba(0, 201, 167, 0.28)',
                boxShadow: '0 18px 44px rgba(10, 37, 32, 0.08), 0 2px 8px rgba(0, 201, 167, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                maxWidth: '380px',
                width: '100%'
              }}>
                <img
                  src={careconnectLogo}
                  alt="CareConnect AI Logo"
                  style={{
                    width: '100%',
                    maxWidth: '310px',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'contain'
                  }}
                />

                {/* Status Pill with Animated Voice Wave */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#F0FDF9',
                  border: '1px solid rgba(0, 201, 167, 0.25)',
                  borderRadius: '999px',
                  padding: '6px 14px',
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#00C9A7',
                    boxShadow: '0 0 8px #00C9A7'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0A2520',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Autonomous AI Telephony Platform
                  </span>
                  
                  {/* Subtle Voice Activity Wave */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px', marginLeft: '4px' }}>
                    {[0.1, 0.35, 0.15, 0.45, 0.25].map((delay, i) => (
                      <span
                        key={i}
                        style={{
                          width: '2px',
                          backgroundColor: '#00C9A7',
                          borderRadius: '1px',
                          animation: `faqAudioWave 1.1s ease-in-out infinite ${delay}s`,
                          height: '6px'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Clean Border-Separated Accordion */}
          <motion.div 
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {faqs.map((f, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    borderBottom: '1px solid #E2E8F0',
                    paddingBottom: isOpen ? '20px' : '0'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                    style={{
                      width: '100%',
                      padding: '20px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#0A2520',
                      fontSize: '16px',
                      fontWeight: 700,
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#007A65'}
                    onMouseLeave={e => e.currentTarget.style.color = '#0A2520'}
                  >
                    <span>{f.q}</span>
                    <ChevronDown
                      size={19}
                      color="#0A2520"
                      strokeWidth={2.4}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        flexShrink: 0
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div style={{
                      fontSize: '14px',
                      color: '#475569',
                      lineHeight: 1.7,
                      fontFamily: 'Inter, sans-serif',
                      paddingTop: '2px'
                    }}>
                      {f.steps ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {f.steps.map((st, sIdx) => (
                            <div key={sIdx}>
                              <strong style={{ color: '#0A2520' }}>{st.label} </strong>
                              <span>{st.text}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0 }}>
                          {f.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
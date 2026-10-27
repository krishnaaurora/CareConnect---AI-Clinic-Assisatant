import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: "How does CareConnect AI handle multilingual patient calls?",
      a: "CareConnect AI features real-time speech and language understanding for English, Hindi, and Telugu. The system detects the patient's preferred language on the first turn of conversation and adapts its tone, speed, and vocabulary to ensure comfortable communication."
    },
    {
      q: "Can the AI accidentally double-book an appointment slot?",
      a: "No. Unlike generic AI chatbots, CareConnect AI communicates with the clinic's schedule database before giving any confirmation code. If a physician slot is unavailable or at capacity, the AI informs the patient and suggests the next closest available consultation window."
    },
    {
      q: "Does Priya give medical advice or diagnose symptoms?",
      a: "Never. Priya is configured with strict healthcare safety boundaries. She does not prescribe medications, recommend treatments, or diagnose symptoms. When patients describe complex medical situations, Priya immediately routes the call to clinical front-desk staff."
    },
    {
      q: "What happens if a patient calls with a medical emergency?",
      a: "Priya recognizes emergency keywords (e.g., chest pain, severe bleeding, unconsciousness) in all supported languages and immediately delivers an urgent emergency disclaimer advising the caller to dial 112 / 911 or proceed to the nearest emergency room. CareConnect AI is not an emergency triage tool."
    },
    {
      q: "How does human receptionist handoff work?",
      a: "If a patient prefers speaking with a human receptionist, or has an inquiry that falls outside standard clinic protocols, Priya initiates a warm handoff. She logs the caller's phone number, name, and intent into the clinic dashboard, alerting front-desk staff to connect with the patient."
    },
    {
      q: "How is patient data protected?",
      a: "All voice data is encrypted in transit using industry-standard TLS protocols. Appointment records are protected with strict access control and are accessible only by verified clinic administration."
    }
  ];

  return (
    <section id="faqs" style={{
      padding: '90px 0',
      position: 'relative',
      background: 'transparent',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '999px',
            background: 'rgba(230, 246, 241, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(0, 201, 167, 0.25)',
            marginBottom: '16px',
            boxShadow: '0 2px 10px rgba(0, 201, 167, 0.08)'
          }}>
            <HelpCircle size={15} color="#00C9A7" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}>
              Frequently Asked Questions
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem, 3.4vw, 2.9rem)', fontWeight: 900, color: '#0A2520', marginBottom: '16px', fontFamily: 'Manrope, sans-serif' }}>
            Everything You Need to Know About <br />
            <span style={{ color: '#00C9A7' }}>CareConnect AI</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
            Transparency around voice AI, booking confirmations, and patient privacy.
          </p>
        </div>

        {/* Accordion List with Glassmorphism */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {faqs.map((f, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="glass-card"
                style={{
                  borderRadius: '18px',
                  background: isOpen ? 'rgba(244, 250, 247, 0.95)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isOpen ? '1px solid rgba(0, 201, 167, 0.4)' : '1px solid rgba(10, 37, 32, 0.06)',
                  overflow: 'hidden',
                  boxShadow: isOpen ? '0 10px 30px rgba(10, 37, 32, 0.05)' : '0 4px 16px rgba(10, 37, 32, 0.02)',
                  transition: 'all 0.25s ease',
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#0A2520',
                    fontSize: '16px',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  <span>{f.q}</span>
                  <ChevronDown
                    size={20}
                    color={isOpen ? '#00C9A7' : '#64748B'}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{
                    padding: '0 24px 22px 24px',
                    fontSize: '14px',
                    color: '#475569',
                    lineHeight: 1.65,
                    borderTop: '1px solid rgba(10, 37, 32, 0.06)',
                    paddingTop: '14px',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

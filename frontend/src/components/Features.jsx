import React, { useState, useEffect } from 'react';
import { 
  Mic2, 
  CalendarCheck, 
  Languages, 
  PhoneForwarded, 
  ShieldCheck, 
  Database,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import voiceFeatureImg from '../assets/feature_voice_receptionist.jpg';
import appointmentFeatureImg from '../assets/feature_appointment_booking.jpg';
import multilingualFeatureImg from '../assets/feature_multilingual_support.jpg';
import handoffFeatureImg from '../assets/feature_human_handoff.jpg';

const TABS = [
  {
    id: 'voice',
    label: 'AI Voice Receptionist',
    icon: Mic2,
    tag: '24/7 Voice Telephony',
    title: 'Instant Patient Call Answering Without Hold Music',
    shortDesc: 'Priya answers patient inquiries instantly with warm, empathetic speech and natural latency—resolving routine questions and scheduling consultations 24/7.',
    image: voiceFeatureImg,
    imageAlt: 'AI Voice Receptionist Dashboard',
    bullets: [
      'Sub-second voice response time with natural conversational flow',
      'Accurately answers clinic timings, consultation fees, and doctor availability',
      'Eliminates missed calls and hold queues during peak clinic hours'
    ],
    pillBadge: 'Zero Dropped Calls'
  },
  {
    id: 'appointment',
    label: 'Appointment Coordination',
    icon: CalendarCheck,
    tag: 'Real-Time Schedule Sync',
    title: 'Automated Calendar Scheduling & Slot Verification',
    shortDesc: 'Collects caller preferences, checks verified doctor calendars in real time, and logs scheduled bookings without clinic staff overhead.',
    image: appointmentFeatureImg,
    imageAlt: 'Doctor Appointment Dashboard',
    bullets: [
      'Live database validation against doctor consultation limits',
      'Prevents double-booking and schedule overlaps automatically',
      'Generates instant reference tickets and booking details for staff'
    ],
    pillBadge: 'Verified Slots'
  },
  {
    id: 'multilingual',
    label: 'Multilingual Support',
    icon: Languages,
    tag: 'Trilingual Engine',
    title: 'Natural Fluency Across Multiple Languages',
    shortDesc: 'Converses fluently in English, Hindi (हिन्दी), and Telugu (తెలుగు)—detecting caller language automatically to deliver accessible healthcare communication.',
    image: multilingualFeatureImg,
    imageAlt: 'Multilingual Speech Translation Interface',
    bullets: [
      'Instant language detection and seamless mid-call switching',
      'Accurate understanding of regional medical terminology and accents',
      'Bridges communication gaps for elderly and regional patients'
    ],
    pillBadge: 'English • हिन्दी • తెలుగు'
  },
  {
    id: 'handoff',
    label: 'Human Handoff & Safety',
    icon: PhoneForwarded,
    tag: 'Zero Patient Abandonment',
    title: 'Seamless Clinic Front-Desk Escalation',
    shortDesc: 'When complex cases or emergency inquiries occur, Priya immediately packages the caller summary and initiates a warm handoff to clinic staff.',
    image: handoffFeatureImg,
    imageAlt: 'Patient Call Summary Ticket and Staff Handoff',
    bullets: [
      'Pre-populated patient summary ticket with caller reason and priority',
      'Strict clinical guardrails: never prescribes or diagnoses symptoms',
      'Escalates urgent medical queries directly to designated clinic staff'
    ],
    pillBadge: 'Clinical Safety First'
  }
];

export default function Features() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /* Automatically advance to the next feature every 2.8 seconds */
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveTabIdx(prev => (prev + 1) % TABS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const activeTab = TABS[activeTabIdx];

  return (
    <section id="features" style={{
      padding: '90px 0 100px',
      position: 'relative',
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(10, 37, 32, 0.05)',
      borderBottom: '1px solid rgba(10, 37, 32, 0.05)',
    }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 42px auto' }}>
          <h2 style={{
            fontSize: 'clamp(2.1rem, 3.4vw, 2.9rem)',
            fontWeight: 900,
            color: '#0A2520',
            marginBottom: '14px',
            lineHeight: 1.15,
            fontFamily: 'Manrope, sans-serif',
            letterSpacing: '-0.025em',
          }}>
            Purpose-Built Features for <br />
            <span style={{ color: '#00C9A7' }}>Seamless Clinic Operations</span>
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#64748B',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.6,
            fontFamily: 'Inter, sans-serif',
          }}>
            Explore how Priya coordinates patient voice calls, validates appointments, and empowers your front desk with verified clinic automation.
          </p>
        </div>

        {/* ── Interactive Tabs Navigation Bar with Auto-Cycle ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '36px',
        }}>
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeTabIdx === idx;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTabIdx(idx);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '11px 22px',
                  borderRadius: '999px',
                  border: isActive ? '1.5px solid #0A2520' : '1px solid rgba(15, 91, 76, 0.12)',
                  backgroundColor: isActive ? '#0A2520' : 'rgba(255, 255, 255, 0.85)',
                  color: isActive ? '#FFFFFF' : '#334155',
                  boxShadow: isActive 
                    ? '0 6px 20px -2px rgba(10, 37, 32, 0.25)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.02)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <Icon size={16} color={isActive ? '#00C9A7' : '#0F5B4C'} strokeWidth={2.2} />
                <span>{tab.label}</span>
                {isActive && (
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#00C9A7',
                    display: 'inline-block',
                    marginLeft: '2px',
                    boxShadow: '0 0 8px #00C9A7',
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Active Tab Content & Image Showcase ── */}
        <div 
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            borderRadius: '28px',
            border: '1.5px solid rgba(255, 255, 255, 0.95)',
            boxShadow: '0 16px 45px -8px rgba(10, 37, 32, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
            padding: '36px',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'center',
          }}>
            
            {/* Left Column: Short Explanation & Key Points */}
            <div style={{ padding: '8px 12px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: '#DCFAF3',
                color: '#007A65',
                fontSize: '11.5px',
                fontWeight: 800,
                marginBottom: '16px',
                fontFamily: 'Inter, sans-serif',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00C9A7' }} />
                {activeTab.tag}
              </div>

              <h3 style={{
                fontSize: 'clamp(1.5rem, 2.4vw, 1.95rem)',
                fontWeight: 800,
                color: '#0A2520',
                margin: '0 0 16px',
                lineHeight: 1.22,
                fontFamily: 'Manrope, sans-serif',
                letterSpacing: '-0.02em',
              }}>
                {activeTab.title}
              </h3>

              <p style={{
                fontSize: '14.5px',
                color: '#475569',
                lineHeight: 1.65,
                margin: '0 0 26px',
                fontFamily: 'Inter, sans-serif',
              }}>
                {activeTab.shortDesc}
              </p>

              {/* Key Feature Bullets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                {activeTab.bullets.map((bullet, bIdx) => (
                  <div key={bIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#DCFAF3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}>
                      <CheckCircle2 size={13} color="#00C9A7" strokeWidth={2.4} />
                    </div>
                    <span style={{
                      fontSize: '13.5px',
                      color: '#1E293B',
                      fontWeight: 600,
                      lineHeight: 1.45,
                      fontFamily: 'Inter, sans-serif',
                    }}>
                      {bullet}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '7px 16px',
                borderRadius: '999px',
                backgroundColor: '#FAF8F5',
                border: '1px solid rgba(15, 91, 76, 0.14)',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0F5B4C',
                fontFamily: 'Inter, sans-serif',
              }}>
                <Sparkles size={13} color="#00C9A7" />
                <span>{activeTab.pillBadge}</span>
              </div>
            </div>

            {/* Right Column: High-Res Feature UI Dashboard Mockup */}
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 48px -10px rgba(10, 37, 32, 0.16), 0 0 0 1px rgba(10, 37, 32, 0.08)',
              backgroundColor: '#FAF8F5',
              position: 'relative',
              aspectRatio: '16 / 9',
            }}>
              <img
                src={activeTab.image}
                alt={activeTab.imageAlt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

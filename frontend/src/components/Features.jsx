import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedGridPattern from './AnimatedGridPattern';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Check, 
  Mic, 
  Calendar as CalendarIcon, 
  Shield, 
  Lock, 
  FileText, 
  Database,
  TrendingUp,
  Activity,
  PhoneCall
} from 'lucide-react';

export default function Features() {
  const [activeDoctorToggles, setActiveDoctorToggles] = useState({
    mehta: true,
    rao: false,
    sharma: true
  });

  const [activeChartBar, setActiveChartBar] = useState(4); // Friday default

  const toggleDoctor = (key) => {
    setActiveDoctorToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section 
      id="features" 
      style={{
        padding: '96px 0 108px',
        position: 'relative',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden'
      }}
    >
      {/* ── Interactive Animated Grid Pattern (Shadcn UI & SeraUI inspired) ── */}
      <AnimatedGridPattern 
        patternType="grid"
        width={38}
        height={38}
        numSquares={36}
        strokeColor="rgba(203, 213, 225, 0.45)"
        cellFill="rgba(0, 201, 167, 0.20)"
        cellStroke="rgba(0, 135, 108, 0.35)"
        maxCellOpacity={0.65}
        spotlight={true}
        withScanLine={true}
      />

      {/* ── Soft Ambient Clinical Glow (Non-dominating, subtle depth) ── */}
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '420px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(0, 135, 108, 0.04) 0%, rgba(220, 250, 243, 0.07) 45%, transparent 75%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes radarPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.08); opacity: 1; }
        }
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes liveWave {
          0%, 100% { height: 4px; }
          50%      { height: 16px; }
        }
        @media (max-width: 960px) {
          .bento-top-row {
            grid-template-columns: 1fr !important;
          }
          .bento-bottom-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Section Header matching Reference Image */}
        <motion.div 
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 54px auto' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 16px',
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
            KEY FEATURES
          </div>

          <h2 style={{
            fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
            fontWeight: 900,
            color: '#0A2520',
            lineHeight: 1.15,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            letterSpacing: '-0.03em',
            margin: '0 0 14px'
          }}>
            Built for <span style={{ color: '#00876C' }}>Modern Clinics</span>
          </h2>

          <p style={{
            fontSize: '15px',
            color: '#64748B',
            lineHeight: 1.6,
            margin: 0,
            fontFamily: 'Inter, sans-serif'
          }}>
            Everything you need to manage appointments, patient conversations and clinic operations with the power of AI.
          </p>
        </motion.div>

        {/* ── Bento Grid: Row 1 (2 Columns: Appointment Management & AI Voice Receptionist) ── */}
        <div 
          className="bento-top-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px'
          }}
        >

          {/* Card 1: Appointment Management */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '36px 36px 32px',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(0, 135, 108, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(0, 135, 108, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <h3 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0A2520',
              margin: '0 0 8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Appointment Management
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.55,
              margin: '0 0 24px',
              maxWidth: '440px'
            }}>
              Manage bookings, reschedules and cancellations in real time with a clear, simple dashboard.
            </p>

            {/* Calendar UI Mockup with Real EHR Details */}
            <div style={{
              position: 'relative',
              backgroundColor: '#F1F5F9',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '18px 20px',
              minHeight: '230px',
              overflow: 'hidden'
            }}>
              {/* Calendar Header with Live EHR Sync Status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                borderBottom: '1px solid #E5E7EB',
                paddingBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    October 2026
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#007A65',
                    backgroundColor: '#DCFAF3',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00C9A7' }} />
                    Live EHR Sync
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{
                    width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <ChevronLeft size={13} color="#64748B" />
                  </button>
                  <button style={{
                    width: '24px', height: '24px', borderRadius: '6px', border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <ChevronRight size={13} color="#64748B" />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px repeat(7, 1fr)',
                fontSize: '11px',
                color: '#94A3B8',
                fontWeight: 600,
                textAlign: 'center',
                marginBottom: '10px'
              }}>
                <span />
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span style={{ color: '#007A65', fontWeight: 800 }}>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {/* Schedule Time Rows with Realistic Booking Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* 9 AM */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>9 AM</span>
                  <div />
                  <div style={{ height: '20px', backgroundColor: '#DCFAF3', borderRadius: '4px', border: '1px solid rgba(0, 201, 167, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#007A65', fontWeight: 700 }}>
                    Dr. Rao
                  </div>
                  <div />
                  <div />
                  <div style={{ height: '20px', backgroundColor: '#DCFAF3', borderRadius: '4px', border: '1px solid rgba(0, 201, 167, 0.3)' }} />
                  <div />
                  <div />
                </div>

                {/* 10 AM with Confirmed 10:30 AM Slot */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>10 AM</span>
                  <div style={{ height: '20px', backgroundColor: '#DCFAF3', borderRadius: '4px', border: '1px solid rgba(0, 201, 167, 0.3)' }} />
                  <div />
                  <div />
                  <div style={{
                    height: '24px',
                    backgroundColor: '#007A65',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0, 122, 101, 0.35)',
                    gridColumn: 'span 2'
                  }}>
                    <span>10:30 AM</span>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#00C9A7' }} />
                    <span style={{ fontSize: '9px', opacity: 0.9 }}>Dr. Mehta</span>
                  </div>
                  <div />
                  <div style={{ height: '20px', backgroundColor: '#DCFAF3', borderRadius: '4px', border: '1px solid rgba(0, 201, 167, 0.3)' }} />
                </div>

                {/* 11 AM */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>11 AM</span>
                  <div />
                  <div />
                  <div style={{ height: '20px', backgroundColor: '#DCFAF3', borderRadius: '4px', border: '1px solid rgba(0, 201, 167, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#007A65', fontWeight: 700 }}>
                    Dr. Sharma
                  </div>
                  <div />
                  <div />
                  <div />
                  <div />
                </div>

                {/* 12 PM */}
                <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600 }}>12 PM</span>
                  <div />
                  <div style={{ height: '20px', backgroundColor: '#DCFAF3', borderRadius: '4px', border: '1px solid rgba(0, 201, 167, 0.3)' }} />
                  <div />
                  <div />
                  <div style={{ height: '20px', backgroundColor: '#DCFAF3', borderRadius: '4px', border: '1px solid rgba(0, 201, 167, 0.3)' }} />
                  <div />
                  <div />
                </div>
              </div>

            </div>
          </motion.div>

          {/* Card 2: AI Voice Receptionist */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '36px 36px 32px',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(0, 135, 108, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(0, 135, 108, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <h3 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0A2520',
              margin: '0 0 8px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              AI Voice Receptionist
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              lineHeight: 1.55,
              margin: '0 0 24px',
              maxWidth: '440px'
            }}>
              Handles patient calls, answers queries, books appointments and supports multiple languages, 24/7.
            </p>

            {/* Radar Visual with Radiating Multilingual Speech Bubbles & Live Call Badge */}
            <div style={{
              position: 'relative',
              backgroundColor: '#F1F5F9',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '24px 20px',
              minHeight: '230px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {/* VoIP Telecom Stream Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                backgroundColor: '#E0F2FE',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                borderRadius: '999px',
                padding: '2px 9px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                zIndex: 10
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#0369A1' }}>VoIP Audio: Active (280ms)</span>
              </div>

              {/* Concentric Radar Rings in Clinical Telephony Blue & Emerald */}
              <div style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                backgroundColor: 'rgba(2, 132, 199, 0.05)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'radarPulse 3.5s ease-in-out infinite'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 18px rgba(2, 132, 199, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mic size={26} color="#0284C7" strokeWidth={2.4} />
                  </div>
                </div>
              </div>

              {/* Speech Bubble 1: Top-Left (English) */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '8px 14px',
                boxShadow: '0 4px 14px rgba(10, 37, 32, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'floatGentle 4s ease-in-out infinite'
              }}>
                <span style={{ fontSize: '15px' }}>🇺🇸</span>
                <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
                  <strong style={{ color: '#0A2520', display: 'block' }}>Hello!</strong>
                  <span style={{ color: '#64748B' }}>How can I help you?</span>
                </div>
              </div>

              {/* Speech Bubble 2: Top-Right (Telugu) */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '8px 14px',
                boxShadow: '0 4px 14px rgba(10, 37, 32, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'floatGentle 4.2s ease-in-out infinite 0.5s'
              }}>
                <span style={{ fontSize: '15px' }}>🇮🇳</span>
                <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
                  <strong style={{ color: '#0A2520', display: 'block' }}>నమస్కారం!</strong>
                  <span style={{ color: '#64748B' }}>నేను ఎలా సహాయపడగలను?</span>
                </div>
              </div>

              {/* Speech Bubble 3: Bottom-Left (Hindi) */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '8px 14px',
                boxShadow: '0 4px 14px rgba(10, 37, 32, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'floatGentle 3.8s ease-in-out infinite 0.2s'
              }}>
                <span style={{ fontSize: '15px' }}>🇮🇳</span>
                <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
                  <strong style={{ color: '#0A2520', display: 'block' }}>नमस्ते!</strong>
                  <span style={{ color: '#64748B' }}>मैं आपकी कैसे मदद कर सकता हूँ?</span>
                </div>
              </div>

              {/* Speech Bubble 4: Bottom-Right (Spanish/Regional) */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '8px 14px',
                boxShadow: '0 4px 14px rgba(10, 37, 32, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'floatGentle 4.4s ease-in-out infinite 0.7s'
              }}>
                <span style={{ fontSize: '15px' }}>🇪🇸</span>
                <div style={{ fontSize: '11px', lineHeight: 1.3 }}>
                  <strong style={{ color: '#0A2520', display: 'block' }}>¡Hola!</strong>
                  <span style={{ color: '#64748B' }}>¿Cómo puedo ayudarle?</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

        {/* ── Bento Grid: Row 2 (3 Columns: Doctor Management, Clinic Analytics, Secure & Private) ── */}
        <div 
          className="bento-bottom-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px'
          }}
        >

          {/* Card 3: Doctor Management */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.10, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '30px 26px',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(0, 135, 108, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(0, 135, 108, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0A2520',
              margin: '0 0 6px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Doctor Management
            </h3>
            <p style={{
              fontSize: '13.5px',
              color: '#64748B',
              lineHeight: 1.5,
              margin: '0 0 20px',
              minHeight: '40px'
            }}>
              Add doctors, set availability, manage schedules and consultation details effortlessly.
            </p>

            {/* Doctor Management List & Realistic Clinic Details */}
            <div style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Doctor Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                
                {/* Dr. Mehta */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      backgroundColor: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#0284C7', fontWeight: 800, fontSize: '11px'
                    }}>
                      M
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0A2520' }}>Dr. Mehta</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: activeDoctorToggles.mehta ? '#007A65' : '#64748B', backgroundColor: activeDoctorToggles.mehta ? '#DCFAF3' : '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                          {activeDoctorToggles.mehta ? 'On Duty' : 'Off'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>General • 9:00 AM - 1:00 PM</div>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div 
                    onClick={() => toggleDoctor('mehta')}
                    style={{
                      width: '34px', height: '19px', borderRadius: '10px',
                      backgroundColor: activeDoctorToggles.mehta ? '#00C9A7' : '#CBD5E1',
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.25s'
                    }}
                  >
                    <div style={{
                      width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#FFFFFF',
                      position: 'absolute', top: '2px', left: activeDoctorToggles.mehta ? '17px' : '2px',
                      transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

                {/* Dr. Rao */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#64748B', fontWeight: 800, fontSize: '11px'
                    }}>
                      R
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0A2520' }}>Dr. Rao</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: activeDoctorToggles.rao ? '#007A65' : '#64748B', backgroundColor: activeDoctorToggles.rao ? '#DCFAF3' : '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                          {activeDoctorToggles.rao ? 'On Duty' : 'Away'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>Pediatrician • Next: 4:00 PM</div>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div 
                    onClick={() => toggleDoctor('rao')}
                    style={{
                      width: '34px', height: '19px', borderRadius: '10px',
                      backgroundColor: activeDoctorToggles.rao ? '#00C9A7' : '#CBD5E1',
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.25s'
                    }}
                  >
                    <div style={{
                      width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#FFFFFF',
                      position: 'absolute', top: '2px', left: activeDoctorToggles.rao ? '17px' : '2px',
                      transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

                {/* Dr. Sharma */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '9px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      backgroundColor: '#DCFAF3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#007A65', fontWeight: 800, fontSize: '11px'
                    }}>
                      S
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0A2520' }}>Dr. Sharma</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: activeDoctorToggles.sharma ? '#007A65' : '#64748B', backgroundColor: activeDoctorToggles.sharma ? '#DCFAF3' : '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                          {activeDoctorToggles.sharma ? 'On Duty' : 'Off'}
                        </span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>Dermatologist • 2:00 - 6:00 PM</div>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <div 
                    onClick={() => toggleDoctor('sharma')}
                    style={{
                      width: '34px', height: '19px', borderRadius: '10px',
                      backgroundColor: activeDoctorToggles.sharma ? '#00C9A7' : '#CBD5E1',
                      position: 'relative', cursor: 'pointer', transition: 'background-color 0.25s'
                    }}
                  >
                    <div style={{
                      width: '15px', height: '15px', borderRadius: '50%', backgroundColor: '#FFFFFF',
                      position: 'absolute', top: '2px', left: activeDoctorToggles.sharma ? '17px' : '2px',
                      transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Card 4: Clinic Analytics (Hyper-Realistic Clinic KPI Dashboard) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '30px 26px',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(0, 135, 108, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(0, 135, 108, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0A2520',
              margin: '0 0 6px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Clinic Analytics
            </h3>
            <p style={{
              fontSize: '13.5px',
              color: '#64748B',
              lineHeight: 1.5,
              margin: '0 0 20px',
              minHeight: '40px'
            }}>
              Get insights on bookings, call activity and clinic performance at a glance.
            </p>

            {/* Analytics Dashboard Visual: Real KPI Bar Chart + Multi-Segment Donut Chart */}
            <div style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '190px',
              position: 'relative'
            }}>
              {/* Top KPI Telemetry Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '10px',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Inbound Calls
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      1,284
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#007A65' }}>
                      ↑ 18.4%
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Resolution
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#00876C' }}>
                    94.2%
                  </span>
                </div>
              </div>

              {/* Chart Body: 7-Day Histogram + SVG Donut */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '14px' }}>
                
                {/* Left: 7-Day Weekly Histogram */}
                <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '78px', paddingBottom: '2px' }}>
                    {[
                      { day: 'M', height: '42%', val: '142' },
                      { day: 'T', height: '60%', val: '188' },
                      { day: 'W', height: '50%', val: '160' },
                      { day: 'T', height: '74%', val: '220' },
                      { day: 'F', height: '96%', val: '284' },
                      { day: 'S', height: '65%', val: '195' },
                      { day: 'S', height: '35%', val: '95' },
                    ].map((item, idx) => {
                      const isSelected = activeChartBar === idx;
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setActiveChartBar(idx)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                          title={`${item.day}: ${item.val} calls`}
                        >
                          <div 
                            style={{ 
                              width: '12px', 
                              height: item.height, 
                              backgroundColor: isSelected ? '#007A65' : '#00876C',
                              borderRadius: '4px 4px 2px 2px',
                              boxShadow: isSelected ? '0 2px 8px rgba(0, 122, 101, 0.4)' : 'none',
                              transition: 'all 0.2s ease',
                              opacity: isSelected ? 1 : 0.8
                            }} 
                          />
                          <span style={{ 
                            fontSize: '9px', 
                            fontWeight: isSelected ? 800 : 600, 
                            color: isSelected ? '#007A65' : '#94A3B8' 
                          }}>
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: SVG Donut Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                    <svg width="64" height="64" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#E2E8F0" strokeWidth="4.2" />
                      <circle 
                        cx="18" cy="18" r="15.915" fill="none" stroke="#0284C7" strokeWidth="4.2" 
                        strokeDasharray="22 78" strokeDashoffset="-72" 
                      />
                      <circle 
                        cx="18" cy="18" r="15.915" fill="none" stroke="#00876C" strokeWidth="4.2" 
                        strokeDasharray="72 28" strokeDashoffset="0" strokeLinecap="round" 
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#0A2520' }}>72%</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#64748B', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00876C' }} />
                      Booked
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
                      Queries
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* Card 5: Secure & Private */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.65, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              padding: '30px 26px',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 48px -8px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(0, 135, 108, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = 'rgba(0, 135, 108, 0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04), 0 0 0 1px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            <h3 style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#0A2520',
              margin: '0 0 6px',
              fontFamily: 'Plus Jakarta Sans, sans-serif'
            }}>
              Secure & Private
            </h3>
            <p style={{
              fontSize: '13.5px',
              color: '#64748B',
              lineHeight: 1.5,
              margin: '0 0 20px',
              minHeight: '40px'
            }}>
              Your patient data is handled securely with role-based access and audit logs.
            </p>

            {/* Shield and Orbiting Security Badges */}
            <div style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '190px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top Security Status Pill */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '14px',
                backgroundColor: '#DCFAF3',
                color: '#007A65',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00C9A7' }} />
                HIPAA Ready • AES-256
              </div>

              {/* Elliptical orbit rings */}
              <div style={{
                position: 'absolute',
                width: '180px',
                height: '110px',
                borderRadius: '50%',
                border: '1px dashed rgba(0, 201, 167, 0.3)',
                transform: 'rotate(-15deg)'
              }} />

              {/* Center Shield with Lock */}
              <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="68" height="78" viewBox="0 0 72 82" fill="none">
                  <path 
                    d="M36 2L6 14V36C6 58 19 74 36 80C53 74 66 58 66 36V14L36 2Z" 
                    fill="#DCFAF3" 
                    stroke="#00C9A7" 
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <rect x="26" y="38" width="20" height="18" rx="4" fill="#007A65" />
                  <path d="M30 38V32C30 28.6863 32.6863 26 36 26C39.3137 26 42 28.6863 42 32V38" stroke="#007A65" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="36" cy="46" r="2.5" fill="#FFFFFF" />
                </svg>
              </div>

              {/* Orbiting Badge 1: Audit Log (Left) */}
              <div style={{
                position: 'absolute',
                left: '16px',
                bottom: '18px',
                padding: '4px 8px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#007A65',
                fontSize: '9.5px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                animation: 'floatGentle 3.6s ease-in-out infinite'
              }}>
                <FileText size={12} />
                <span>Audit Logs</span>
              </div>

              {/* Orbiting Badge 2: RBAC (Top Right) */}
              <div style={{
                position: 'absolute',
                right: '18px',
                top: '16px',
                padding: '4px 8px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#007A65',
                fontSize: '9.5px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                animation: 'floatGentle 4.2s ease-in-out infinite 0.4s'
              }}>
                <User size={12} />
                <span>RBAC Access</span>
              </div>

              {/* Orbiting Badge 3: Encrypted DB (Bottom Right) */}
              <div style={{
                position: 'absolute',
                right: '18px',
                bottom: '16px',
                padding: '4px 8px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: '#007A65',
                fontSize: '9.5px',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                animation: 'floatGentle 3.8s ease-in-out infinite 0.8s'
              }}>
                <Database size={12} />
                <span>Encrypted DB</span>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

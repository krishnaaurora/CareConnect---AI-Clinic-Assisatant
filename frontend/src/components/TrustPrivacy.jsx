import React from 'react';
import { Lock, UserCheck, Stethoscope, FileLock2, Award } from 'lucide-react';

export default function TrustPrivacy() {
  const pillars = [
    {
      icon: <Stethoscope size={24} color="#0F5B4C" />,
      iconBg: '#EAF6F3',
      title: "No Medical Advice",
      desc: "Priya only handles reception tasks. She never gives medical diagnoses or treatment advice, and always directs medical questions to your doctors."
    },
    {
      icon: <UserCheck size={24} color="#00C9A7" />,
      iconBg: '#DCFAF3',
      title: "Instant Staff Handoff",
      desc: "If a patient has an urgent issue, complex needs, or simply wants to talk to a person, Priya immediately alerts your front desk team."
    },
    {
      icon: <Lock size={24} color="#0A2520" />,
      iconBg: '#EBF4F1',
      title: "Strict Patient Privacy",
      desc: "All calls and patient details are kept completely private and protected. Your clinic data is never shared or sold."
    },
    {
      icon: <FileLock2 size={24} color="#00C9A7" />,
      iconBg: '#DCFAF3',
      title: "Accurate Appointments",
      desc: "Bookings sync directly with your live clinic schedule, ensuring there are no double bookings or scheduling mistakes."
    }
  ];

  return (
    <section id="trust" style={{
      padding: '90px 0',
      position: 'relative',
      background: 'rgba(255, 255, 255, 0.45)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(10, 37, 32, 0.05)',
      borderBottom: '1px solid rgba(10, 37, 32, 0.05)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 60px auto' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 3.4vw, 2.9rem)', fontWeight: 900, color: '#0A2520', marginBottom: '16px', lineHeight: 1.15, fontFamily: 'Manrope, sans-serif' }}>
            Trust, Privacy & <br />
            <span style={{ color: '#00C9A7' }}>Clinical Guardrails</span>
          </h2>
        </div>

        {/* 4 Pillars Grid in Glassmorphism */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {pillars.map((pil, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                padding: '32px',
                borderRadius: '22px',
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(10, 37, 32, 0.08)',
                boxShadow: '0 8px 30px rgba(10, 37, 32, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: pil.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                {pil.icon}
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0A2520', marginBottom: '10px', fontFamily: 'Manrope, sans-serif' }}>
                {pil.title}
              </h3>

              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0, fontFamily: 'Inter, sans-serif' }}>
                {pil.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Human Takeover Workflow Glass Banner */}
        <div className="glass-card" style={{
          padding: '32px',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 201, 167, 0.22)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          alignItems: 'center',
          boxShadow: '0 10px 32px rgba(10, 37, 32, 0.04)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Award size={22} color="#00C9A7" />
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0A2520', margin: 0, fontFamily: 'Manrope, sans-serif' }}>
                When Does a Human Take Over?
              </h4>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0, fontFamily: 'Inter, sans-serif' }}>
              Priya immediately notifies your staff and hands over the conversation when:
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00C9A7' }}></span>
              <span>The caller reports urgent pain, severe symptoms, or an emergency.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0F5B4C' }}></span>
              <span>A requested appointment time is full and needs manual staff review.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#0A2520' }}></span>
              <span>The patient asks directly to speak with a human receptionist.</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

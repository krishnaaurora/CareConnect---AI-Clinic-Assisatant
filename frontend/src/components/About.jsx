import React, { useEffect, useRef, useState } from 'react';
import { PhoneCall, Clock, Users, Zap, MessageSquare, CalendarCheck } from 'lucide-react';

const KEYFRAMES = `
@keyframes aboutFadeUp {
  from { opacity:0; transform:translateY(24px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes aboutSlideLeft {
  from { opacity:0; transform:translateX(-20px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes aboutSlideRight {
  from { opacity:0; transform:translateX(20px); }
  to   { opacity:1; transform:translateX(0); }
}
@keyframes aboutRotateSlow {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}
`;

const CHALLENGES = [
  {
    icon: PhoneCall,
    defaultColor: '#0091FF',
    defaultBg: '#E0F2FE',
    title: 'Missed calls',
    desc: 'Many patient calls go unanswered during peak hours.',
  },
  {
    icon: Clock,
    defaultColor: '#00C9A7',
    defaultBg: '#DCFAF3',
    title: 'Repetitive enquiries',
    desc: 'Staff spend hours answering the same questions.',
  },
  {
    icon: Users,
    defaultColor: '#0F5B4C',
    defaultBg: '#EAF6F3',
    title: 'Language barriers',
    desc: 'Patients struggle to communicate in their preferred language.',
  },
];

const ADVANTAGES = [
  {
    icon: Zap,
    defaultColor: '#00C9A7',
    defaultBg: '#DCFAF3',
    title: 'Instant AI call handling',
    desc: 'Answers 24/7 and captures appointment requests.',
  },
  {
    icon: CalendarCheck,
    defaultColor: '#0F5B4C',
    defaultBg: '#EAF6F3',
    title: 'Automated enquiry resolution',
    desc: 'Provides instant verified clinic info, fees, and timings.',
  },
  {
    icon: MessageSquare,
    defaultColor: '#00C9A7',
    defaultBg: '#DCFAF3',
    title: 'Multilingual support',
    desc: 'Communicates naturally in multiple languages.',
  },
];

export default function About() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [activePairIdx, setActivePairIdx] = useState(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setVisible(true);
    }, { threshold: 0.15 });

    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  const anim = (name, delay, dur = 0.65) =>
    visible ? { animation: `${name} ${dur}s cubic-bezier(0.16,1,0.3,1) ${delay}s both` } : { opacity: 0 };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <section
        id="about"
        ref={sectionRef}
        style={{
          background: 'transparent',
          borderTop: '1px solid rgba(10, 37, 32, 0.05)',
          padding: '80px 0 90px',
          position: 'relative',
          overflow: 'hidden',
        }}
        aria-labelledby="about-heading"
      >
        {/* Decorative background phone icon — top left (Soft Green Glass) */}
        <div style={{
          position: 'absolute', top: '8%', left: '3%',
          width: '76px', height: '76px', borderRadius: '50%',
          backgroundColor: '#EAF6F3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.65,
          animation: 'aboutRotateSlow 22s linear infinite',
          pointerEvents: 'none',
        }}>
          <PhoneCall size={32} color="#0F5B4C" strokeWidth={1.6}/>
        </div>

        {/* Decorative calendar icon — top right (Light Green Glass) */}
        <div style={{
          position: 'absolute', top: '8%', right: '4%',
          width: '64px', height: '64px', borderRadius: '20px',
          backgroundColor: '#DCFAF3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0.7,
          pointerEvents: 'none',
        }}>
          <CalendarCheck size={28} color="#00C9A7" strokeWidth={1.6}/>
        </div>

        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 28px' }}>

          {/* ── Top badge (Glass Pill) ── */}
          <div style={{ textAlign: 'center', marginBottom: '36px', ...anim('aboutFadeUp', 0.05) }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              border: '1px solid rgba(10, 37, 32, 0.22)',
              borderRadius: '999px', padding: '6px 16px',
              backgroundColor: 'rgba(245, 248, 246, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            }}>
              <PhoneCall size={13} color="#0A2520" strokeWidth={2}/>
              <span style={{
                fontSize: '11px', fontWeight: 800,
                color: '#0A2520', letterSpacing: '0.08em',
                textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
              }}>
                The Problem We Solve
              </span>
            </div>
          </div>

          {/* ── Two Cards Container with Glass Effect ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            alignItems: 'stretch',
          }}>

            {/* Left card — The Challenge (Glassmorphic) */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.78)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              padding: '36px 32px',
              boxShadow: '0 12px 36px rgba(10, 37, 32, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              ...anim('aboutSlideLeft', 0.18),
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 800, color: '#0F5B4C',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                margin: '0 0 12px', fontFamily: 'Inter, sans-serif',
              }}>
                The Challenge
              </p>
              <h3 style={{
                fontSize: '1.45rem', fontWeight: 800, color: '#0B132B',
                margin: '0 0 28px', lineHeight: 1.2,
                fontFamily: 'Manrope, sans-serif',
              }}>
                Too many calls,<br/>not enough time.
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {CHALLENGES.map((item, i) => {
                  const Icon = item.icon;
                  const isHighlighted = activePairIdx === i;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setActivePairIdx(i)}
                      onMouseLeave={() => setActivePairIdx(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '16px 18px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        border: isHighlighted ? '1.5px solid #0A2520' : '1.5px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: isHighlighted ? '0 4px 16px -2px rgba(10, 37, 32, 0.16)' : 'none',
                        transform: isHighlighted ? 'translateY(-2px)' : 'translateY(0)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        backgroundColor: item.defaultBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon
                          size={20}
                          color={item.defaultColor}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: '#0B132B',
                          margin: '0 0 3px',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {item.title}
                        </p>
                        <p style={{
                          fontSize: '13px',
                          color: '#64748B',
                          margin: 0,
                          lineHeight: 1.5,
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right card — The CareConnect AI Advantage (Glassmorphic) */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.78)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.95)',
              padding: '36px 32px',
              boxShadow: '0 12px 36px rgba(10, 37, 32, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
              ...anim('aboutSlideRight', 0.24),
            }}>
              <p style={{
                fontSize: '11px', fontWeight: 800, color: '#0F5B4C',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                margin: '0 0 12px', fontFamily: 'Inter, sans-serif',
              }}>
                The CareConnect AI Advantage
              </p>
              <h3 style={{
                fontSize: '1.45rem', fontWeight: 800, color: '#0B132B',
                margin: '0 0 28px', lineHeight: 1.2,
                fontFamily: 'Manrope, sans-serif',
              }}>
                Automated. Intelligent.<br/>Always on.
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {ADVANTAGES.map((item, i) => {
                  const Icon = item.icon;
                  const isHighlighted = activePairIdx === i;

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setActivePairIdx(i)}
                      onMouseLeave={() => setActivePairIdx(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        padding: '16px 18px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.92)',
                        border: isHighlighted ? '1.5px solid #0A2520' : '1.5px solid rgba(0, 0, 0, 0.06)',
                        boxShadow: isHighlighted ? '0 4px 16px -2px rgba(10, 37, 32, 0.16)' : 'none',
                        transform: isHighlighted ? 'translateY(-2px)' : 'translateY(0)',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '12px',
                        backgroundColor: item.defaultBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon
                          size={20}
                          color={item.defaultColor}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: '#0B132B',
                          margin: '0 0 3px',
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {item.title}
                        </p>
                        <p style={{
                          fontSize: '13px',
                          color: '#64748B',
                          margin: 0,
                          lineHeight: 1.5,
                          fontFamily: 'Inter, sans-serif',
                        }}>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}

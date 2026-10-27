import React, { useEffect, useRef, useState } from 'react';
import { Phone, CalendarCheck, CheckSquare, ChevronRight } from 'lucide-react';

const KEYFRAMES = `
@keyframes wfFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes wfPulseRing {
  0%   { box-shadow: 0 0 0 0 rgba(0, 201, 167, 0.5); }
  70%  { box-shadow: 0 0 0 14px rgba(0, 201, 167, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 201, 167, 0); }
}
@keyframes phoneWiggle {
  0%, 100% { transform: rotate(-10deg) scale(1); }
  12%, 36% { transform: rotate(-22deg) scale(1.1); }
  24%, 48% { transform: rotate(-2deg) scale(1.1); }
  60%      { transform: rotate(-10deg) scale(1); }
}
@keyframes waveBar1 { 0%, 100% { height: 5px; } 50% { height: 16px; } }
@keyframes waveBar2 { 0%, 100% { height: 11px; } 50% { height: 21px; } }
@keyframes waveBar3 { 0%, 100% { height: 19px; } 50% { height: 8px; } }
@keyframes waveBar4 { 0%, 100% { height: 9px; } 50% { height: 19px; } }
@keyframes waveBar5 { 0%, 100% { height: 5px; } 50% { height: 13px; } }
@keyframes signalTravel {
  0%   { left: 0%; opacity: 0; transform: translateY(-50%) scale(0.6); }
  20%  { opacity: 1; transform: translateY(-50%) scale(1); }
  80%  { opacity: 1; transform: translateY(-50%) scale(1); }
  100% { left: 100%; opacity: 0; transform: translateY(-50%) scale(0.6); }
}
@keyframes chevronPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%      { transform: translate(-50%, -50%) scale(1.22); }
}
@media (max-width: 860px) {
  .wf-steps-container {
    flex-direction: column !important;
    align-items: center !important;
    gap: 36px !important;
  }
  .wf-connector {
    width: 2px !important;
    height: 44px !important;
    flex-direction: column !important;
    margin: 8px 0 !important;
  }
  .wf-connector-line {
    width: 2px !important;
    height: 100% !important;
  }
  .wf-node {
    max-width: 320px !important;
  }
}
`;

const STEPS = [
  {
    num: 1,
    title: 'Patient Calls',
    desc: 'A patient calls your clinic with a question or appointment request.',
    iconColor: '#0F5B4C',
    bgColor: '#EAF6F3',
    glowColor: 'rgba(15, 91, 76, 0.22)',
  },
  {
    num: 2,
    title: 'AI Understands',
    desc: 'Understands intent, detects language, and responds naturally.',
    iconColor: '#00C9A7',
    bgColor: '#EDFDF9',
    glowColor: 'rgba(0, 201, 167, 0.25)',
  },
  {
    num: 3,
    title: 'Request Processed',
    desc: 'Validates calendar schedules or retrieves verified clinic info.',
    iconColor: '#0A2520',
    bgColor: '#EBF4F1',
    glowColor: 'rgba(10, 37, 32, 0.22)',
  },
  {
    num: 4,
    title: 'Instant Resolution',
    desc: 'Confirms booking or initiates a warm handoff to your team.',
    iconColor: '#00C9A7',
    bgColor: '#DCFAF3',
    glowColor: 'rgba(0, 201, 167, 0.3)',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold: 0.15 });

    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  /* Sequential auto-advancing step animation */
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % STEPS.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isPaused]);

  const anim = (delay = 0) =>
    visible ? { animation: `wfFadeUp 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}s both` } : { opacity: 0 };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <section
        id="how-it-works"
        ref={sectionRef}
        style={{
          padding: '90px 0 100px',
          background: 'transparent',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
        aria-labelledby="wf-heading"
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>

          {/* ── Main Heading ── */}
          <h2
            id="wf-heading"
            style={{
              fontSize: 'clamp(2.2rem, 3.8vw, 3.2rem)',
              fontWeight: 900,
              color: '#0A2520',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '14px',
              fontFamily: 'Manrope, sans-serif',
              ...anim(0.05),
            }}
          >
            From patient call to <span style={{ color: '#00C9A7' }}>clear next step</span>
          </h2>

          {/* ── Subtitle ── */}
          <p style={{
            fontSize: '16.5px',
            color: '#64748B',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 64px',
            fontFamily: 'Inter, sans-serif',
            ...anim(0.12),
          }}>
            CareConnect AI handles the entire flow, from answering the call to taking the right action.
          </p>

          {/* ── 4-Step Interactive Workflow Row ── */}
          <div
            className="wf-steps-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              position: 'relative',
              ...anim(0.2),
            }}
          >
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              const hasConnector = idx < STEPS.length - 1;

              const renderStepIcon = () => {
                if (step.num === 1) {
                  return (
                    <Phone 
                      size={25} 
                      color={step.iconColor} 
                      strokeWidth={2.2} 
                      style={{ 
                        animation: isActive ? 'phoneWiggle 1.8s infinite ease-in-out' : 'none',
                        transform: isActive ? 'none' : 'rotate(-10deg)',
                        transition: 'all 0.3s ease',
                      }} 
                    />
                  );
                }
                if (step.num === 2) {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3.5px', height: '22px' }}>
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <span
                          key={bar}
                          style={{
                            width: '3.5px',
                            backgroundColor: step.iconColor,
                            borderRadius: '2px',
                            animation: isActive ? `waveBar${bar} 1.1s infinite ease-in-out` : 'none',
                            height: isActive ? undefined : (bar === 3 ? '18px' : bar === 2 || bar === 4 ? '12px' : '6px'),
                            transition: 'height 0.2s ease',
                          }}
                        />
                      ))}
                    </div>
                  );
                }
                if (step.num === 3) {
                  return (
                    <CalendarCheck 
                      size={25} 
                      color={step.iconColor} 
                      strokeWidth={2.2} 
                      style={{
                        transform: isActive ? 'scale(1.14)' : 'scale(1)',
                        transition: 'transform 0.3s ease',
                      }}
                    />
                  );
                }
                return (
                  <CheckSquare 
                    size={25} 
                    color={step.iconColor} 
                    strokeWidth={2.2} 
                    style={{
                      transform: isActive ? 'scale(1.14)' : 'scale(1)',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                );
              };

              return (
                <React.Fragment key={step.num}>
                  {/* Step Node */}
                  <div
                    className="wf-node"
                    onClick={() => setActiveStep(idx)}
                    style={{
                      flex: '1 1 0',
                      maxWidth: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Circle Icon Container with Number Badge */}
                    <div style={{ position: 'relative', marginBottom: '22px' }}>
                      {/* Pastel Glow Circle with Glass border */}
                      <div
                        style={{
                          width: '78px',
                          height: '78px',
                          borderRadius: '50%',
                          backgroundColor: step.bgColor,
                          boxShadow: isActive 
                            ? `0 12px 32px ${step.glowColor}, 0 0 0 3px #00C9A7` 
                            : `0 8px 24px ${step.glowColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: isActive ? '2px solid #00C9A7' : '1px solid rgba(255, 255, 255, 0.9)',
                          transform: isActive ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                          animation: isActive ? 'wfPulseRing 2s infinite' : 'none',
                          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {renderStepIcon()}
                      </div>

                      {/* Number Badge at bottom of circle */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-8px',
                          left: '50%',
                          transform: isActive ? 'translateX(-50%) scale(1.12)' : 'translateX(-50%) scale(1)',
                          width: '23px',
                          height: '23px',
                          borderRadius: '50%',
                          backgroundColor: isActive ? '#0A2520' : '#00C9A7',
                          color: '#FFFFFF',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #FFFFFF',
                          boxShadow: isActive ? '0 2px 10px rgba(10, 37, 32, 0.45)' : '0 2px 6px rgba(0, 201, 167, 0.35)',
                          fontFamily: 'Inter, sans-serif',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {step.num}
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: isActive ? 900 : 800,
                        color: isActive ? '#0A2520' : '#334155',
                        margin: '0 0 6px',
                        fontFamily: 'Manrope, sans-serif',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {step.title}
                    </h3>

                    {/* Step Description */}
                    <p
                      style={{
                        fontSize: '13.5px',
                        color: '#64748B',
                        lineHeight: 1.5,
                        margin: 0,
                        maxWidth: '200px',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>

                  {/* Horizontal Connector Line between Nodes */}
                  {hasConnector && (
                    <div
                      className="wf-connector"
                      style={{
                        flex: '0 1 80px',
                        minWidth: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        marginTop: '38px',
                      }}
                    >
                      {/* Connecting line */}
                      <div
                        className="wf-connector-line"
                        style={{
                          width: '100%',
                          height: '2px',
                          background: idx < activeStep 
                            ? 'linear-gradient(90deg, #00C9A7 0%, #059669 100%)' 
                            : 'repeating-linear-gradient(90deg, #00C9A7 0, #00C9A7 5px, transparent 5px, transparent 9px)',
                          opacity: idx <= activeStep ? 1 : 0.4,
                          transition: 'all 0.4s ease',
                        }}
                      />

                      {/* Flowing animated light beam signal */}
                      {idx === activeStep && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          width: '16px',
                          height: '4px',
                          borderRadius: '3px',
                          backgroundColor: '#00C9A7',
                          boxShadow: '0 0 10px #00C9A7, 0 0 18px rgba(0, 201, 167, 0.9)',
                          animation: 'signalTravel 1.4s infinite linear',
                          zIndex: 2,
                        }} />
                      )}

                      {/* Small badge in center of line with subtle chevron */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: idx <= activeStep ? '#00C9A7' : '#E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: idx <= activeStep ? '0 2px 8px rgba(0, 201, 167, 0.45)' : 'none',
                          animation: idx === activeStep ? 'chevronPulse 1.4s infinite ease-in-out' : 'none',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <ChevronRight size={12} color={idx <= activeStep ? '#FFFFFF' : '#64748B'} strokeWidth={3} style={{ marginLeft: '1px' }} />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
}

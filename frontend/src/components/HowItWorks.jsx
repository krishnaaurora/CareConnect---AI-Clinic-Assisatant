import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, CalendarCheck, CheckSquare, ChevronRight, Check } from 'lucide-react';

const KEYFRAMES = `
@keyframes acousticRing {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.55); opacity: 0; }
}

@keyframes pulseGlowRing {
  0%   { box-shadow: 0 0 0 0 rgba(0, 201, 167, 0.45); }
  70%  { box-shadow: 0 0 0 16px rgba(0, 201, 167, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 201, 167, 0); }
}

@keyframes signalBeam {
  0%   { left: 0%; opacity: 0; transform: translateY(-50%) scale(0.6); }
  15%  { opacity: 1; transform: translateY(-50%) scale(1); }
  85%  { opacity: 1; transform: translateY(-50%) scale(1); }
  100% { left: 100%; opacity: 0; transform: translateY(-50%) scale(0.6); }
}

@keyframes waveOscillate1 { 0%, 100% { height: 6px; } 50% { height: 20px; } }
@keyframes waveOscillate2 { 0%, 100% { height: 14px; } 50% { height: 26px; } }
@keyframes waveOscillate3 { 0%, 100% { height: 22px; } 50% { height: 12px; } }
@keyframes waveOscillate4 { 0%, 100% { height: 12px; } 50% { height: 24px; } }
@keyframes waveOscillate5 { 0%, 100% { height: 6px; } 50% { height: 18px; } }

@media (max-width: 860px) {
  .wf-steps-container {
    flex-direction: column !important;
    align-items: center !important;
    gap: 16px !important;
  }
  .wf-connector {
    width: 2px !important;
    height: 48px !important;
    flex-direction: column !important;
    margin: 8px 0 !important;
  }
  .wf-connector-line {
    width: 2px !important;
    height: 100% !important;
  }
  .wf-node {
    max-width: 320px !important;
    width: 100% !important;
  }
  .wf-chevron-pill {
    transform: translate(-50%, -50%) rotate(90deg) !important;
  }
}
`;

const STEPS = [
  {
    num: 1,
    title: 'Patient Calls',
    desc: 'Patient calls your clinic with question or appointment request.',
    iconColor: '#0F5B4C',
    bgColor: '#EAF6F3',
    glowColor: 'rgba(15, 91, 76, 0.25)',
  },
  {
    num: 2,
    title: 'AI Understands',
    desc: 'Understands intent, detects language, and responds naturally.',
    iconColor: '#00C9A7',
    bgColor: '#EDFDF9',
    glowColor: 'rgba(0, 201, 167, 0.3)',
  },
  {
    num: 3,
    title: 'Request Processed',
    desc: 'Validates calendar schedules or retrieves verified clinic info.',
    iconColor: '#0A2520',
    bgColor: '#EBF4F1',
    glowColor: 'rgba(10, 37, 32, 0.25)',
  },
  {
    num: 4,
    title: 'Instant Resolution',
    desc: 'Confirms booking or initiates a warm handoff to your team.',
    iconColor: '#00C9A7',
    bgColor: '#DCFAF3',
    glowColor: 'rgba(0, 201, 167, 0.35)',
  },
];

const STEP_DURATION = 1300; // Fast and dynamic 1.3s step flow animation

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stepProgress, setStepProgress] = useState(0);

  // Auto-advance loop with smooth progress tracking
  useEffect(() => {
    if (isPaused) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / STEP_DURATION) * 100, 100);
      setStepProgress(progress);

      if (elapsed >= STEP_DURATION) {
        setActiveStep((prev) => (prev + 1) % STEPS.length);
        setStepProgress(0);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [activeStep, isPaused]);

  const handleStepClick = (idx) => {
    setActiveStep(idx);
    setStepProgress(0);
  };

  return (
    <>
      <style>{KEYFRAMES}</style>

      <section
        id="how-it-works"
        style={{
          padding: '96px 0 108px',
          background: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
        }}
        aria-labelledby="wf-heading"
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '0 24px' }}>

          {/* ── Scroll-Triggered Header Block ── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
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
              HOW IT WORKS
            </div>

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
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}
            >
              From patient call to <span style={{ color: '#00876C' }}>clear next step</span>
            </h2>

            {/* ── Subtitle ── */}
            <p
              style={{
                fontSize: '16.5px',
                color: '#64748B',
                lineHeight: 1.6,
                maxWidth: '680px',
                margin: '0 auto 64px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              CareConnect AI handles the entire flow, from answering the call to taking the right action.
            </p>
          </motion.div>

          {/* ── 4-Step Interactive Workflow Pipeline Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="wf-steps-container"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {STEPS.map((step, idx) => {
              const isActive = activeStep === idx;
              const isPast = idx < activeStep;
              const hasConnector = idx < STEPS.length - 1;

              // Render Icons matching the reference image precisely
              const renderStepIcon = () => {
                if (step.num === 1) {
                  return (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Acoustic radiating ring ripples when active */}
                      {isActive && (
                        <>
                          <span
                            style={{
                              position: 'absolute',
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              border: '2px solid rgba(0, 201, 167, 0.6)',
                              animation: 'acousticRing 1.4s infinite cubic-bezier(0.2, 0.8, 0.4, 1)',
                              pointerEvents: 'none',
                            }}
                          />
                          <span
                            style={{
                              position: 'absolute',
                              width: '74px',
                              height: '74px',
                              borderRadius: '50%',
                              border: '1.5px solid rgba(0, 201, 167, 0.35)',
                              animation: 'acousticRing 1.4s infinite cubic-bezier(0.2, 0.8, 0.4, 1) 0.4s',
                              pointerEvents: 'none',
                            }}
                          />
                        </>
                      )}
                      <Phone
                        size={25}
                        color={step.iconColor}
                        strokeWidth={2.3}
                        style={{
                          transform: isActive ? 'rotate(-6deg) scale(1.08)' : 'rotate(-10deg)',
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      />
                    </div>
                  );
                }

                if (step.num === 2) {
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3.5px', height: '24px' }}>
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <span
                          key={bar}
                          style={{
                            width: '3.5px',
                            backgroundColor: step.iconColor,
                            borderRadius: '3px',
                            animation: isActive ? `waveOscillate${bar} 0.75s infinite ease-in-out` : 'none',
                            height: isActive
                              ? undefined
                              : bar === 3
                              ? '20px'
                              : bar === 2 || bar === 4
                              ? '13px'
                              : '7px',
                            transition: 'height 0.25s ease',
                          }}
                        />
                      ))}
                    </div>
                  );
                }

                if (step.num === 3) {
                  return (
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CalendarCheck
                        size={25}
                        color={step.iconColor}
                        strokeWidth={2.3}
                        style={{
                          transform: isActive ? 'scale(1.12)' : 'scale(1)',
                          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      />
                    </div>
                  );
                }

                // Step 4: CheckSquare / Checkbox with checkmark
                return (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckSquare
                      size={25}
                      color={step.iconColor}
                      strokeWidth={2.4}
                      style={{
                        transform: isActive ? 'scale(1.14)' : 'scale(1)',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      }}
                    />
                  </div>
                );
              };

              // Step 4 in the image has an iconic outer concentric ring
              const isStep4 = step.num === 4;

              return (
                <React.Fragment key={step.num}>
                  {/* Step Interactive Node */}
                  <div
                    className="wf-node"
                    onClick={() => handleStepClick(idx)}
                    style={{
                      flex: '1 1 0',
                      maxWidth: '220px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {/* Circle Icon Container with Number Badge */}
                    <div style={{ position: 'relative', marginBottom: '22px' }}>
                      {isStep4 ? (
                        // Step 4: Double Concentric Ring (outer ring + inner circle)
                        <div
                          style={{
                            width: '92px',
                            height: '92px',
                            borderRadius: '50%',
                            border: isActive ? '2.5px solid #00C9A7' : '2px solid rgba(0, 201, 167, 0.85)',
                            backgroundColor: isActive ? 'rgba(0, 201, 167, 0.08)' : 'rgba(0, 201, 167, 0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isActive
                              ? '0 12px 36px rgba(0, 201, 167, 0.32), 0 0 0 4px rgba(0, 201, 167, 0.15)'
                              : '0 6px 20px rgba(0, 201, 167, 0.12)',
                            transform: isActive ? 'scale(1.08) translateY(-4px)' : 'scale(1)',
                            animation: isActive ? 'pulseGlowRing 1.8s infinite' : 'none',
                            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {/* Inner Circle */}
                          <div
                            style={{
                              width: '70px',
                              height: '70px',
                              borderRadius: '50%',
                              backgroundColor: step.bgColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1.5px solid rgba(255, 255, 255, 0.9)',
                            }}
                          >
                            {renderStepIcon()}
                          </div>
                        </div>
                      ) : (
                        // Step 1, 2, 3: Single Rounded Pastel Card
                        <div
                          style={{
                            width: '78px',
                            height: '78px',
                            borderRadius: '50%',
                            backgroundColor: step.bgColor,
                            boxShadow: isActive
                              ? `0 12px 32px ${step.glowColor}, 0 0 0 3px #00C9A7`
                              : isPast
                              ? '0 6px 18px rgba(0, 201, 167, 0.16)'
                              : `0 6px 18px ${step.glowColor}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isActive ? '2px solid #00C9A7' : '1.5px solid rgba(255, 255, 255, 0.95)',
                            transform: isActive ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                            animation: isActive ? 'pulseGlowRing 1.8s infinite' : 'none',
                            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                        >
                          {renderStepIcon()}
                        </div>
                      )}

                      {/* Number Badge at bottom of circle */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: isStep4 ? '-6px' : '-8px',
                          left: '50%',
                          transform: isActive ? 'translateX(-50%) scale(1.15)' : 'translateX(-50%) scale(1)',
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
                          boxShadow: isActive
                            ? '0 2px 10px rgba(10, 37, 32, 0.45)'
                            : '0 2px 6px rgba(0, 201, 167, 0.35)',
                          fontFamily: 'Inter, sans-serif',
                          transition: 'all 0.3s ease',
                          zIndex: 3,
                        }}
                      >
                        {isPast ? <Check size={12} strokeWidth={3} /> : step.num}
                      </div>
                    </div>

                    {/* Step Title */}
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: isActive ? 900 : 800,
                        color: isActive ? '#0A2520' : '#334155',
                        margin: '0 0 6px',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
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
                      {/* Background Track Line */}
                      <div
                        className="wf-connector-line"
                        style={{
                          width: '100%',
                          height: '2px',
                          backgroundColor: '#CCF2E9',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Progress line filling up */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: idx < activeStep ? '100%' : idx === activeStep ? `${stepProgress}%` : '0%',
                            backgroundColor: '#00C9A7',
                            boxShadow: '0 0 8px #00C9A7',
                            transition: idx === activeStep ? 'none' : 'width 0.4s ease',
                          }}
                        />
                      </div>

                      {/* Traveling Luminous Signal Beam */}
                      {idx === activeStep && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            width: '18px',
                            height: '4px',
                            borderRadius: '3px',
                            backgroundColor: '#00C9A7',
                            boxShadow: '0 0 12px #00C9A7, 0 0 20px rgba(0, 201, 167, 0.9)',
                            animation: 'signalBeam 0.65s infinite ease-in-out',
                            zIndex: 2,
                          }}
                        />
                      )}

                      {/* Small Circular Badge in center of line with chevron '>' */}
                      <div
                        className="wf-chevron-pill"
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: idx <= activeStep ? '#00C9A7' : '#CCF2E9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: idx <= activeStep ? '0 2px 8px rgba(0, 201, 167, 0.45)' : 'none',
                          transformOrigin: 'center center',
                          transition: 'all 0.3s ease',
                          zIndex: 2,
                        }}
                      >
                        <ChevronRight
                          size={12}
                          color={idx <= activeStep ? '#FFFFFF' : '#0F5B4C'}
                          strokeWidth={3}
                          style={{ marginLeft: '1px' }}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>

        </div>
      </section>
    </>
  );
}

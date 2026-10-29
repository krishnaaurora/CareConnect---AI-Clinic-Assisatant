import React, { useState, useEffect, useRef } from 'react';
import AnimatedGridPattern from './AnimatedGridPattern';
import { ScaleInText } from './ScaleInText';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  Phone, 
  Calendar, 
  Globe, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  Mic, 
  PhoneOff, 
  MoreHorizontal,
  Volume2,
  VolumeX
} from 'lucide-react';
import priyaCharacter from '../assets/priya-avatar.png';

const HERO_FLIP_WORDS = [
  "gets an answer.",
  "books an appointment.",
  "speaks their language.",
  "never waits on hold."
];

const KEYFRAMES = `
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes heroFloat {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes heroWaveBar {
  0%, 100% { height: 4px; }
  50%      { height: 22px; }
}
@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%      { transform: scale(1.3); opacity: 1; }
}
@keyframes cardPulseRing {
  0%   { box-shadow: 0 0 0 0 rgba(0, 145, 255, 0.45); }
  70%  { box-shadow: 0 0 0 10px rgba(0, 145, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 145, 255, 0); }
}
@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1); opacity: 1; }
}
@keyframes auraMorphBlue {
  0%, 100% {
    transform: translate(-18px, 14px) scale(1) rotate(0deg);
    opacity: 0.48;
  }
  33% {
    transform: translate(22px, -18px) scale(1.12) rotate(8deg);
    opacity: 0.62;
  }
  66% {
    transform: translate(-14px, -22px) scale(0.94) rotate(-6deg);
    opacity: 0.42;
  }
}
@keyframes auraMorphPink {
  0%, 100% {
    transform: translate(18px, -14px) scale(1) rotate(0deg);
    opacity: 0.45;
  }
  33% {
    transform: translate(-20px, 18px) scale(1.10) rotate(-8deg);
    opacity: 0.58;
  }
  66% {
    transform: translate(14px, 22px) scale(0.92) rotate(6deg);
    opacity: 0.38;
  }
}
@keyframes auraPulseCenter {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.35;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.12);
    opacity: 0.52;
  }
}
`;

const CONVERSATION_STATES = [
  {
    id: 1,
    featureKey: 'answers_calls',
    featureTitle: 'Answers Patient Calls',
    callStatus: 'Incoming patient call',
    speaking: false,
    lang: 'English',
    patient: 'Hello, I need some help.',
    priya: null,
    typing: true,
  },
  {
    id: 2,
    featureKey: 'call_handling',
    featureTitle: '24/7 Call Handling',
    callStatus: 'AI Receptionist answering',
    speaking: true,
    lang: 'English',
    patient: 'Hello, I need some help.',
    priya: 'Hello! Thank you for calling CareConnect. How may I help you today?',
    typing: false,
  },
  {
    id: 3,
    featureKey: 'appointment_requests',
    featureTitle: 'Appointment Requests',
    callStatus: 'Slot check in progress',
    speaking: true,
    lang: 'English',
    patient: 'I’d like to book an appointment with a doctor.',
    priya: 'Of course! Which specialty or doctor would you prefer to visit?',
    typing: false,
  },
  {
    id: 4,
    featureKey: 'multiple_languages',
    featureTitle: 'Multiple Languages',
    callStatus: 'Hindi language auto-switched',
    speaking: true,
    lang: 'हिंदी',
    patient: 'क्या आप हिंदी में बात कर सकती हैं?',
    priya: 'जी बिल्कुल! मैं हिंदी में आपकी पूरी मदद कर सकती हूँ।',
    typing: false,
  },
  {
    id: 5,
    featureKey: 'clinic_enquiry',
    featureTitle: 'Clinic Information & Enquiries',
    callStatus: 'Verified clinic hours',
    speaking: true,
    lang: 'English',
    patient: 'Could you tell me about the clinic timings?',
    priya: 'Our clinic is open Mon–Sat from 9:00 AM to 7:00 PM for consultations.',
    typing: false,
  },
  {
    id: 6,
    featureKey: 'human_handoff',
    featureTitle: 'Human Handoff When Needed',
    callStatus: 'Follow-up required — demo',
    speaking: true,
    lang: 'English',
    patient: 'Can someone from the clinic confirm my request?',
    priya: 'I can mark this request for our front-desk clinic team to follow up immediately.',
    typing: false,
  },
];

export default function Hero({ onOpenDialer }) {
  const [currentStateIdx, setCurrentStateIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [tick, setTick] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const phoneRef = useRef(null);
  const state = CONVERSATION_STATES[currentStateIdx];

  /* Smooth Parallax Scroll Listener */
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY <= 1200) {
            setScrollY(window.scrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* Check mobile viewport */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 990);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* Check user reduced motion preference */
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener?.('change', handler);
    return () => mediaQuery.removeEventListener?.('change', handler);
  }, []);

  /* Waveform clock */
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 90);
    return () => clearInterval(id);
  }, []);

  /* State machine automatic progression */
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(() => {
      setCurrentStateIdx(prev => (prev + 1) % CONVERSATION_STATES.length);
    }, 4600);
    return () => clearTimeout(timer);
  }, [currentStateIdx, isPlaying]);

  /* Optional Speech Synthesis when voice enabled */
  useEffect(() => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (state.priya) {
      const utterance = new SpeechSynthesisUtterance(state.priya);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      if (state.lang === 'हिंदी') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      window.speechSynthesis.speak(utterance);
    }
  }, [currentStateIdx, soundEnabled, state]);

  const scrollToPhone = () => {
    phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  /* Parallax scroll factor clamped */
  const pScroll = prefersReducedMotion ? 0 : Math.min(scrollY, 850);

  /* 6 Feature Bubbles Data */
  const leftCards = [
    {
      key: 'appointment_requests',
      title: 'Appointment Requests',
      icon: <Calendar size={18} color="#00C9A7" strokeWidth={2} />,
      stateIdx: 2,
    },
    {
      key: 'answers_calls',
      title: 'Answers Patient Calls',
      icon: <Phone size={18} color="#0F5B4C" strokeWidth={2} />,
      stateIdx: 0,
    },
    {
      key: 'multiple_languages',
      title: 'Multiple Languages',
      icon: <Globe size={18} color="#0091FF" strokeWidth={2} />,
      stateIdx: 3,
    },
  ];

  const rightCards = [
    {
      key: 'call_handling',
      title: '24/7 Call Handling',
      icon: <Clock size={18} color="#00C9A7" strokeWidth={2} />,
      stateIdx: 1,
    },
    {
      key: 'clinic_enquiry',
      title: 'Clinic Information & Enquiries',
      icon: <MessageSquare size={18} color="#0F5B4C" strokeWidth={2} />,
      stateIdx: 4,
    },
    {
      key: 'human_handoff',
      title: 'Human Handoff When Needed',
      icon: <ShieldCheck size={18} color="#10B981" strokeWidth={2} />,
      stateIdx: 5,
    },
  ];

  return (
    <>
      <style>{KEYFRAMES}</style>

      <section
        id="hero"
        style={{
          position: 'relative',
          paddingTop: '136px',
          paddingBottom: '40px',
          background: 'radial-gradient(ellipse 90% 60% at 50% 20%, #F0FDF4 0%, #F8FAFC 50%, #FFFFFF 100%)',
          overflow: 'hidden',
          textAlign: 'center',
        }}
        aria-label="CareConnect AI Hero"
      >
        {/* ── Subtle Hero Animated Grid Pattern (Shadcn / SeraUI) ── */}
        <AnimatedGridPattern 
          patternType="grid"
          width={44}
          height={44}
          numSquares={20}
          strokeColor="rgba(203, 213, 225, 0.35)"
          cellFill="rgba(99, 102, 241, 0.12)"
          cellStroke="rgba(99, 102, 241, 0.25)"
          maxCellOpacity={0.45}
          spotlight={true}
          withScanLine={false}
          style={{ zIndex: 0 }}
        />

        {/* Soft decorative background ambient glow with parallax echoing Indigo & Rose-Pink aura */}
        <div style={{
          position: 'absolute', top: '16%', left: '4%',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.14) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 75%)',
          filter: 'blur(60px)', pointerEvents: 'none',
          transform: `translate3d(0, ${pScroll * 0.22}px, 0)`,
          willChange: 'transform',
        }} />
        <div style={{
          position: 'absolute', top: '18%', right: '4%',
          width: '440px', height: '440px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.14) 0%, rgba(232, 121, 249, 0.07) 50%, transparent 75%)',
          filter: 'blur(65px)', pointerEvents: 'none',
          transform: `translate3d(0, ${pScroll * 0.16}px, 0)`,
          willChange: 'transform',
        }} />

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>

          {/* ── Parallax Header Content Block ── */}
          <div style={{
            transform: `translate3d(0, -${pScroll * 0.35}px, 0)`,
            opacity: Math.max(0, 1 - pScroll / 380),
            willChange: 'transform, opacity',
            transition: 'transform 0.05s linear, opacity 0.05s linear',
          }}>
            {/* ── Headline ── */}
          <h1 style={{
            fontSize: 'clamp(2.6rem, 5.2vw, 4.4rem)',
            fontWeight: 900,
            color: '#0A2520',
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            margin: '0 auto 18px',
            maxWidth: '860px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            animation: 'heroFadeUp 0.65s cubic-bezier(0.16,1,0.3,1) 0.12s both',
          }}>
            Every patient call<br />
            <ScaleInText
              text="gets an answer."
              words={HERO_FLIP_WORDS}
              duration={3400}
            />
          </h1>

          {/* ── Description ── */}
          <p style={{
            fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
            color: '#475569',
            lineHeight: 1.62,
            maxWidth: '680px',
            margin: '0 auto 34px',
            fontFamily: 'Inter, sans-serif',
            animation: 'heroFadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.18s both',
          }}>
            AI-powered voice assistants that handle patient calls, answer enquiries, assist with appointments, and support multiple languages — 24/7.
          </p>

          {/* ── Action Buttons ── */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '46px',
            animation: 'heroFadeUp 0.75s cubic-bezier(0.16,1,0.3,1) 0.24s both',
          }}>
            {/* Primary: See it in action */}
            <button
              type="button"
              onClick={scrollToPhone}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: '#0F5B4C',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px -2px rgba(15, 91, 76, 0.35)',
                transition: 'all 0.25s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#083F34';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#0F5B4C';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Play size={11} color="#0F5B4C" fill="#0F5B4C" style={{ marginLeft: '2px' }} />
              </div>
              <span>See it in action</span>
            </button>

            {/* Secondary: Request a Demo */}
            <button
              type="button"
              onClick={onOpenDialer}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid rgba(15, 91, 76, 0.22)',
                color: '#0F5B4C',
                fontSize: '15px',
                fontWeight: 700,
                padding: '12px 26px',
                borderRadius: '999px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                transition: 'all 0.25s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#F5FAF8';
                e.currentTarget.style.borderColor = '#0F5B4C';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = 'rgba(15, 91, 76, 0.22)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Request a Demo</span>
              <ArrowRight size={15} strokeWidth={2.4} />
            </button>
          </div>
          </div>

          {/* ── Central Smartphone with Floating Feature Bubbles ── */}
          <div
            ref={phoneRef}
            id="hero-phone-mockup"
            style={{
              position: 'relative',
              maxWidth: '1040px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '620px',
            }}
          >
            {/* ── Dreamy Living Mesh Aura (Deep Cobalt/Indigo & Rose-Pink from Reference) ── */}
            <div 
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: '960px',
                height: '580px',
                pointerEvents: 'none',
                zIndex: 0,
                overflow: 'visible',
              }}
            >
              {/* Soft Periwinkle / Royal Indigo Wave (Lower-Left to Center) */}
              <div 
                style={{
                  position: 'absolute',
                  left: '6%',
                  bottom: '4%',
                  width: '480px',
                  height: '380px',
                  borderRadius: '40% 60% 65% 35% / 45% 40% 60% 55%',
                  background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.45) 0%, rgba(129, 140, 248, 0.30) 40%, rgba(147, 197, 253, 0.16) 65%, transparent 80%)',
                  filter: 'blur(95px)',
                  animation: 'auraMorphBlue 11s ease-in-out infinite',
                  mixBlendMode: 'normal',
                  willChange: 'transform, opacity',
                }}
              />

              {/* Luminous Pastel Rose / Lavender Mist Cloud (Top-Right) */}
              <div 
                style={{
                  position: 'absolute',
                  right: '4%',
                  top: '0%',
                  width: '520px',
                  height: '400px',
                  borderRadius: '60% 40% 50% 50% / 50% 60% 40% 50%',
                  background: 'radial-gradient(ellipse at center, rgba(244, 114, 182, 0.42) 0%, rgba(249, 168, 212, 0.28) 40%, rgba(233, 213, 255, 0.15) 65%, transparent 80%)',
                  filter: 'blur(100px)',
                  animation: 'auraMorphPink 13s ease-in-out infinite',
                  mixBlendMode: 'normal',
                  willChange: 'transform, opacity',
                }}
              />

              {/* Central Soft Violet Atmosphere Transition */}
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '640px',
                  height: '440px',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at center, rgba(192, 132, 252, 0.22) 0%, rgba(167, 139, 250, 0.12) 50%, transparent 75%)',
                  filter: 'blur(100px)',
                  animation: 'auraPulseCenter 9s ease-in-out infinite',
                  willChange: 'transform, opacity',
                }}
              />
            </div>
            {/* Ambient Elliptical Orbit Track with Parallax */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, calc(-50% + ${pScroll * 0.08}px)) scale(${1 + pScroll * 0.0003})`,
              opacity: Math.max(0.12, 1 - pScroll / 650),
              width: '880px',
              height: '480px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(0, 201, 167, 0.25)',
              pointerEvents: 'none',
              zIndex: 1,
              willChange: 'transform, opacity',
            }} />

            {/* ── Left 3 Feature Cards ── */}
            <div style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '36px',
              zIndex: 10,
              width: '240px',
            }} className="hero-left-cards">
              {leftCards.map((card, idx) => {
                const isActive = state.featureKey === card.key;
                const cardY = isMobile ? 0 : pScroll * (0.07 + idx * 0.07);
                const cardX = isMobile ? 0 : -pScroll * (idx === 1 ? 0.12 : 0.06);
                const activeTransform = isActive ? 'scale(1.05) translateX(6px)' : 'scale(1)';
                return (
                  <div
                    key={card.key}
                    onClick={() => {
                      setCurrentStateIdx(card.stateIdx);
                      setIsPlaying(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      backgroundColor: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: isActive ? '2px solid #0091FF' : '1px solid rgba(255, 255, 255, 0.95)',
                      boxShadow: isActive 
                        ? '0 12px 32px rgba(0, 145, 255, 0.22)' 
                        : '0 8px 24px rgba(0, 0, 0, 0.05)',
                      transform: isMobile 
                        ? (isActive ? 'scale(1.04)' : 'scale(1)') 
                        : `translate3d(${cardX}px, ${cardY}px, 0) ${activeTransform}`,
                      willChange: 'transform',
                      transition: isMobile ? 'all 0.3s ease' : 'transform 0.05s linear, border 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      animation: isActive ? 'cardPulseRing 2s infinite' : 'none',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: isActive ? '#EFF6FF' : '#F5FBF8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {card.icon}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? 800 : 700,
                        color: isActive ? '#0A2520' : '#334155',
                        margin: 0,
                        lineHeight: 1.3,
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {card.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Central Smartphone UI with 3D Parallax ── */}
            <div
              style={{
                width: '340px',
                height: '590px',
                borderRadius: '48px',
                backgroundColor: '#0F172A',
                padding: '12px',
                boxShadow: `0 ${25 + pScroll * 0.05}px ${60 + pScroll * 0.08}px -10px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(255, 255, 255, 0.1)`,
                position: 'relative',
                zIndex: 5,
                border: '4px solid #1E293B',
                transform: isMobile 
                  ? 'none' 
                  : `translate3d(0, ${pScroll * 0.14}px, 0) perspective(1000px) rotateX(${Math.min(pScroll * 0.014, 5.5)}deg) scale(${Math.max(0.92, 1 - pScroll * 0.00025)})`,
                willChange: 'transform, box-shadow',
                transition: isMobile ? 'none' : 'transform 0.05s linear',
              }}
            >
              {/* Phone Inner Screen */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '38px',
                  backgroundColor: '#FFFFFF',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: '1px solid #E2E8F0',
                }}
              >
                {/* Top Notch bar */}
                <div style={{
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0F172A',
                }}>
                  <span>9:41</span>
                  {/* Dynamic Island Pill */}
                  <div style={{
                    width: '74px',
                    height: '18px',
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                  }} />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>5G</span>
                </div>

                {/* Priya Header Bar */}
                <div style={{
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #F1F5F9',
                  backgroundColor: '#FAFCFB',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1.5px solid #00C9A7',
                    }}>
                      <img
                        src={priyaCharacter}
                        alt="Priya - AI Receptionist"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520', margin: 0 }}>Priya</p>
                      <p style={{ fontSize: '10px', color: '#64748B', margin: 0 }}>AI Receptionist</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: '#DCFAF3',
                      color: '#007A65',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00C9A7' }} />
                      Online
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: '#E2F1FF',
                      color: '#0070F3',
                      padding: '2px 7px',
                      borderRadius: '999px',
                    }}>
                      {state.lang}
                    </span>
                  </div>
                </div>

                {/* Priya Photo Avatar Hero Center */}
                <div style={{
                  padding: '14px 16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  backgroundColor: '#F8FBFA',
                }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '3px solid #FFFFFF',
                    boxShadow: '0 8px 24px rgba(0, 201, 167, 0.25)',
                    marginBottom: '8px',
                  }}>
                    <img
                      src={priyaCharacter}
                      alt="Priya AI Receptionist"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Call Status Pill */}
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#0F5B4C',
                    backgroundColor: '#E8F7F2',
                    padding: '3px 12px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00C9A7', animation: 'pulseDot 1.5s infinite' }} />
                    {state.callStatus}
                  </div>
                </div>

                {/* Conversation Bubbles Container */}
                <div style={{
                  flex: 1,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  overflowY: 'auto',
                  textAlign: 'left',
                }}>
                  {/* Patient Message */}
                  {state.patient && (
                    <div style={{
                      alignSelf: 'flex-start',
                      maxWidth: '85%',
                      backgroundColor: '#F1F5F9',
                      padding: '8px 12px',
                      borderRadius: '14px 14px 14px 4px',
                      fontSize: '12px',
                      color: '#1E293B',
                      lineHeight: 1.4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '2px' }}>
                        PATIENT
                      </span>
                      {state.patient}
                    </div>
                  )}

                  {/* Priya Response Message */}
                  {state.priya && (
                    <div style={{
                      alignSelf: 'flex-end',
                      maxWidth: '90%',
                      backgroundColor: '#DCFAF3',
                      border: '1px solid rgba(0, 201, 167, 0.2)',
                      padding: '8px 12px',
                      borderRadius: '14px 14px 4px 14px',
                      fontSize: '12px',
                      color: '#0A2520',
                      lineHeight: 1.4,
                      boxShadow: '0 2px 8px rgba(0, 201, 167, 0.1)',
                    }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#007A65', display: 'block', marginBottom: '2px' }}>
                        PRIYA (AI RECEPTIONIST)
                      </span>
                      {state.priya}
                    </div>
                  )}

                  {/* Typing Indicator */}
                  {state.typing && (
                    <div style={{
                      alignSelf: 'flex-end',
                      backgroundColor: '#DCFAF3',
                      padding: '8px 14px',
                      borderRadius: '14px 14px 4px 14px',
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00C9A7', animation: 'typingBounce 1.2s infinite' }} />
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00C9A7', animation: 'typingBounce 1.2s infinite 0.2s' }} />
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#00C9A7', animation: 'typingBounce 1.2s infinite 0.4s' }} />
                    </div>
                  )}
                </div>

                {/* Live Audio Waveform (During speaking) */}
                <div style={{
                  padding: '6px 16px',
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  height: '36px',
                }}>
                  {[12, 18, 8, 24, 16, 26, 10, 20, 14, 22, 10, 16, 20, 8, 14, 24].map((h, i) => {
                    const dynamicHeight = state.speaking 
                      ? Math.max(4, h + Math.sin(tick * 0.3 + i * 0.8) * 8)
                      : 4;
                    return (
                      <div
                        key={i}
                        style={{
                          width: '3px',
                          height: `${dynamicHeight}px`,
                          backgroundColor: state.speaking ? '#00C9A7' : '#CBD5E1',
                          borderRadius: '2px',
                          transition: 'height 0.1s ease',
                        }}
                      />
                    );
                  })}
                  <span style={{ fontSize: '10px', color: '#64748B', marginLeft: '8px', fontWeight: 600 }}>
                    {state.speaking ? 'Speaking...' : 'Listening...'}
                  </span>
                </div>

                {/* Bottom Call Controls & Simulation Bar */}
                <div style={{
                  padding: '10px 18px 14px',
                  backgroundColor: '#FAFCFB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #F1F5F9',
                }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }} title="Mute Microphone">
                    <Mic size={15} color="#475569" />
                  </div>

                  <div 
                    onClick={onOpenDialer}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
                    }} 
                    title="End Call / Test Live Dialer"
                  >
                    <PhoneOff size={18} color="#FFFFFF" />
                  </div>

                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }} title="More Options">
                    <MoreHorizontal size={16} color="#475569" />
                  </div>
                </div>

              </div>
            </div>

            {/* ── Right 3 Feature Cards ── */}
            <div style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '36px',
              zIndex: 10,
              width: '240px',
            }} className="hero-right-cards">
              {rightCards.map((card, idx) => {
                const isActive = state.featureKey === card.key;
                const cardY = isMobile ? 0 : pScroll * (0.07 + idx * 0.07);
                const cardX = isMobile ? 0 : pScroll * (idx === 1 ? 0.12 : 0.06);
                const activeTransform = isActive ? 'scale(1.05) translateX(-6px)' : 'scale(1)';
                return (
                  <div
                    key={card.key}
                    onClick={() => {
                      setCurrentStateIdx(card.stateIdx);
                      setIsPlaying(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      borderRadius: '18px',
                      backgroundColor: 'rgba(255, 255, 255, 0.88)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: isActive ? '2px solid #0091FF' : '1px solid rgba(255, 255, 255, 0.95)',
                      boxShadow: isActive 
                        ? '0 12px 32px rgba(0, 145, 255, 0.22)' 
                        : '0 8px 24px rgba(0, 0, 0, 0.05)',
                      transform: isMobile 
                        ? (isActive ? 'scale(1.04)' : 'scale(1)') 
                        : `translate3d(${cardX}px, ${cardY}px, 0) ${activeTransform}`,
                      willChange: 'transform',
                      transition: isMobile ? 'all 0.3s ease' : 'transform 0.05s linear, border 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'pointer',
                      animation: isActive ? 'cardPulseRing 2s infinite' : 'none',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: isActive ? '#EFF6FF' : '#F5FBF8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {card.icon}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '13.5px',
                        fontWeight: isActive ? 800 : 700,
                        color: isActive ? '#0A2520' : '#334155',
                        margin: 0,
                        lineHeight: 1.3,
                        fontFamily: 'Inter, sans-serif',
                      }}>
                        {card.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ── Demo Playback Controls Pill ── */}
          <div style={{
            marginTop: '28px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(15, 91, 76, 0.1)',
            padding: '6px 18px',
            borderRadius: '999px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
            transform: `translate3d(0, ${pScroll * 0.08}px, 0)`,
            opacity: Math.max(0, 1 - pScroll / 520),
            willChange: 'transform, opacity',
            transition: 'transform 0.05s linear, opacity 0.05s linear',
          }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0F5B4C',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {isPlaying ? <Pause size={13} fill="#0F5B4C" /> : <Play size={13} fill="#0F5B4C" />}
              <span>{isPlaying ? 'Pause Demo' : 'Resume Demo'}</span>
            </button>

            <span style={{ width: '1px', height: '14px', backgroundColor: '#CBD5E1' }} />

            <button
              onClick={() => {
                setCurrentStateIdx(0);
                setIsPlaying(true);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <RotateCcw size={12} />
              <span>Restart Flow</span>
            </button>

            <span style={{ width: '1px', height: '14px', backgroundColor: '#CBD5E1' }} />

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                background: 'none',
                border: 'none',
                color: soundEnabled ? '#00C9A7' : '#64748B',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
              title="Toggle Browser Voice Readout"
            >
              {soundEnabled ? <Volume2 size={13} color="#00C9A7" /> : <VolumeX size={13} color="#64748B" />}
              <span>{soundEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
          </div>

          {/* ── Scroll To Explore Indicator ── */}
          <div style={{
            marginTop: '34px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            color: '#64748B',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            transform: `translate3d(0, -${pScroll * 0.15}px, 0)`,
            opacity: Math.max(0, 1 - pScroll / 90),
            pointerEvents: pScroll > 50 ? 'none' : 'auto',
            willChange: 'transform, opacity',
            transition: 'transform 0.05s linear, opacity 0.05s linear',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: '999px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            }}>
              {/* Mouse scroll icon */}
              <div style={{
                width: '12px',
                height: '18px',
                borderRadius: '6px',
                border: '1.5px solid #00C9A7',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '2px',
              }}>
                <div style={{ width: '2px', height: '4px', backgroundColor: '#00C9A7', borderRadius: '1px' }} />
              </div>
              <span>Scroll to explore</span>
            </div>
          </div>

        </div>
      </section>

      {/* Responsive adjustments for mobile/tablet */}
      <style>{`
        @media (max-width: 990px) {
          .hero-left-cards, .hero-right-cards {
            position: static !important;
            transform: none !important;
            width: 100% !important;
            max-width: 480px !important;
            margin: 20px auto !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </>
  );
}

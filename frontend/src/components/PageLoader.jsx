import React, { useState, useEffect } from 'react';
import careconnectLogoWhite from '../assets/careconnect-logo-white-text.png';

export default function PageLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Priya Voice AI...');
  const [isExiting, setIsExiting] = useState(false);
  const [logoRevealed, setLogoRevealed] = useState(false);

  useEffect(() => {
    // Reveal full logo shine slightly after stroke draw starts
    const logoTimer = setTimeout(() => {
      setLogoRevealed(true);
    }, 700);

    // Progress counter animation
    const startTime = performance.now();
    const duration = 1800; // 1.8s snappy intro

    const updateProgress = (now) => {
      const elapsed = now - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 35) {
        setStatusText('Initializing Priya Voice AI Infrastructure...');
      } else if (pct < 70) {
        setStatusText('Connecting Clinical Roster & Doctor Directory...');
      } else if (pct < 95) {
        setStatusText('Activating Real-Time Voice Receptionist...');
      } else {
        setStatusText('Welcome to CareConnect AI');
      }

      if (elapsed < duration) {
        requestAnimationFrame(updateProgress);
      } else {
        // Trigger smooth fade-out exit
        setIsExiting(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 500);
      }
    };

    const rafId = requestAnimationFrame(updateProgress);

    return () => {
      clearTimeout(logoTimer);
      cancelAnimationFrame(rafId);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: '#030D0B',
        background: 'radial-gradient(circle at 50% 45%, #082823 0%, #041411 55%, #020806 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.04)' : 'scale(1)',
        filter: isExiting ? 'blur(10px)' : 'none',
        transition: 'opacity 0.48s cubic-bezier(0.16, 1, 0.3, 1), transform 0.48s cubic-bezier(0.16, 1, 0.3, 1), filter 0.48s ease',
        pointerEvents: isExiting ? 'none' : 'auto',
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* ── Keyframe Animations Scoped ── */}
      <style>{`
        @keyframes drawStroke {
          0% {
            stroke-dashoffset: 1200;
            opacity: 0.1;
          }
          30% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes soundWavePulse {
          0%, 100% {
            transform: scaleY(0.3);
            opacity: 0.4;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes auraGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.1);
          }
        }

        @keyframes logoShine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes rippleRing {
          0% {
            transform: scale(0.8);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }

        .loader-draw-path {
          stroke-dasharray: 1200;
          stroke-dashoffset: 1200;
          animation: drawStroke 1.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .loader-bar-1 { animation: soundWavePulse 0.8s ease-in-out infinite 0.1s; }
        .loader-bar-2 { animation: soundWavePulse 0.9s ease-in-out infinite 0.25s; }
        .loader-bar-3 { animation: soundWavePulse 0.75s ease-in-out infinite 0.15s; }
        .loader-bar-4 { animation: soundWavePulse 1.05s ease-in-out infinite 0.35s; }
        .loader-bar-5 { animation: soundWavePulse 0.85s ease-in-out infinite 0.05s; }
        .loader-bar-6 { animation: soundWavePulse 0.95s ease-in-out infinite 0.2s; }
      `}</style>

      {/* Subtle Ambient Background Mesh */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(#00C9A7 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.09,
          pointerEvents: 'none'
        }}
      />

      {/* Soft Radial Ambient Aura Glow */}
      <div
        style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 201, 167, 0.25) 0%, rgba(15, 91, 76, 0.12) 40%, transparent 70%)',
          animation: 'auraGlow 3s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(30px)'
        }}
      />

      {/* Ripple Wave Ring */}
      <div
        style={{
          position: 'absolute',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          border: '1.5px solid rgba(0, 201, 167, 0.3)',
          animation: 'rippleRing 2.2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
          pointerEvents: 'none'
        }}
      />

      {/* ── Center Stage: Logo SVG Draw + Typography Reveal ── */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* SVG Drawing Logo Emblem */}
        <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '22px' }}>
          <svg
            viewBox="0 0 271 271"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: '100%',
              height: '100%',
              filter: 'drop-shadow(0 0 16px rgba(0, 201, 167, 0.45))'
            }}
          >
            <defs>
              <linearGradient id="loaderCrossGrad" x1="21" y1="36" x2="181" y2="234" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00C9A7" />
                <stop offset="50%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>

              <linearGradient id="loaderHeartGrad" x1="93" y1="92" x2="249" y2="221" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="50%" stopColor="#00C9A7" />
                <stop offset="100%" stopColor="#00A389" />
              </linearGradient>

              <linearGradient id="loaderWaveGrad" x1="156" y1="122" x2="218" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#00E5BD" />
              </linearGradient>
            </defs>

            {/* Path 1: Medical Cross Outline (Drawn by Stroke) */}
            <path
              className="loader-draw-path"
              d="M 100,37 L 92,41 L 84,53 L 84,87 L 80,93 L 41,93 L 31,97 L 24,104 L 21,113 L 22,162 L 29,172 L 37,176 L 80,177 L 84,184 L 84,219 L 88,226 L 94,231 L 103,234 L 159,233 L 163,231 L 154,222 L 104,222 L 100,220 L 95,214 L 95,177 L 89,168 L 82,165 L 41,165 L 37,163 L 33,157 L 34,111 L 41,105 L 81,105 L 89,102 L 95,93 L 95,57 L 97,53 L 104,48 L 160,48 L 164,50 L 169,57 L 169,90 L 172,92 L 180,87 L 181,54 L 177,45 L 170,39 L 161,36 Z"
              stroke="url(#loaderCrossGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(0, 201, 167, 0.08)"
            />

            {/* Path 2: Heart Top Arc Outline */}
            <path
              className="loader-draw-path"
              d="M 93,128 L 93,134 L 99,123 L 115,106 L 128,100 L 143,99 L 151,101 L 161,107 L 170,118 L 178,109 L 191,101 L 210,99 L 224,104 L 236,115 L 241,128 L 241,142 L 248,142 L 249,137 L 247,121 L 240,108 L 225,96 L 212,92 L 197,92 L 187,95 L 178,100 L 172,106 L 153,94 L 145,92 L 126,93 L 114,98 L 102,108 L 96,118 Z"
              stroke="url(#loaderHeartGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(34, 211, 238, 0.06)"
              style={{ animationDelay: '0.15s' }}
            />

            {/* Path 3: Heart & Woman Voice Profile Base */}
            <path
              className="loader-draw-path"
              d="M 98,156 L 112,175 L 127,191 L 155,208 L 169,221 L 172,221 L 214,188 L 234,168 L 245,151 L 244,148 L 230,146 L 230,142 L 226,140 L 224,142 L 225,155 L 229,155 L 231,153 L 234,154 L 230,162 L 210,182 L 171,212 L 166,208 L 161,192 L 155,187 L 141,182 L 135,176 L 135,165 L 137,163 L 147,162 L 149,151 L 147,152 L 149,155 L 148,160 L 145,163 L 136,163 L 133,172 L 129,166 L 129,158 L 131,153 L 140,143 L 141,131 L 144,124 L 146,128 L 146,122 L 142,117 L 135,114 L 124,114 L 115,118 L 106,129 Z"
              stroke="url(#loaderHeartGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(0, 201, 167, 0.12)"
              style={{ animationDelay: '0.25s' }}
            />

            {/* Path 4 - 9: Animated Voice Soundwave Equalizer Bars */}
            <g style={{ transformOrigin: '185px 150px' }}>
              <rect x="156" y="142" width="6" height="18" rx="3" fill="url(#loaderWaveGrad)" className="loader-bar-1" style={{ transformOrigin: '159px 151px' }} />
              <rect x="163" y="137" width="6" height="28" rx="3" fill="url(#loaderWaveGrad)" className="loader-bar-2" style={{ transformOrigin: '166px 151px' }} />
              <rect x="175" y="142" width="6" height="14" rx="3" fill="url(#loaderWaveGrad)" className="loader-bar-3" style={{ transformOrigin: '178px 149px' }} />
              <rect x="187" y="135" width="6" height="28" rx="3" fill="url(#loaderWaveGrad)" className="loader-bar-4" style={{ transformOrigin: '190px 149px' }} />
              <rect x="200" y="122" width="6" height="52" rx="3" fill="url(#loaderWaveGrad)" className="loader-bar-5" style={{ transformOrigin: '203px 148px' }} />
              <rect x="213" y="132" width="6" height="34" rx="3" fill="url(#loaderWaveGrad)" className="loader-bar-6" style={{ transformOrigin: '216px 149px' }} />
            </g>
          </svg>
        </div>

        {/* Full Official Logo Fade-In Reveal with Shimmer */}
        <div
          style={{
            opacity: logoRevealed ? 1 : 0,
            transform: logoRevealed ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            marginBottom: '18px'
          }}
        >
          <img
            src={careconnectLogoWhite}
            alt="CareConnect AI"
            style={{
              height: '38px',
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(0, 201, 167, 0.35))'
            }}
          />
        </div>

        {/* Real-time Voice Audio Equalizer Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '18px', marginBottom: '16px' }}>
          {[12, 18, 10, 22, 14, 26, 16, 20, 11].map((h, i) => (
            <div
              key={i}
              style={{
                width: '3px',
                height: `${h}px`,
                borderRadius: '999px',
                backgroundColor: '#00C9A7',
                boxShadow: '0 0 6px #00C9A7',
                animation: `soundWavePulse ${0.5 + (i % 4) * 0.15}s ease-in-out infinite ${(i * 0.08).toFixed(2)}s`
              }}
            />
          ))}
        </div>

        {/* Status Micro-Copy */}
        <p
          style={{
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#A7F3D0',
            letterSpacing: '0.03em',
            margin: '0 0 16px',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(0, 201, 167, 0.3)',
            minHeight: '18px'
          }}
        >
          {statusText}
        </p>

        {/* Precision Progress Bar */}
        <div
          style={{
            width: '240px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(0, 201, 167, 0.2)'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #0284C7 0%, #00C9A7 60%, #38BDF8 100%)',
              borderRadius: '999px',
              boxShadow: '0 0 10px #00C9A7',
              transition: 'width 0.08s ease-out'
            }}
          />
        </div>

        {/* Progress Percentage */}
        <div
          style={{
            marginTop: '8px',
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748B',
            fontFamily: 'monospace',
            letterSpacing: '0.08em'
          }}
        >
          {progress}%
        </div>
      </div>

      {/* Skip Button Top Right */}
      <button
        onClick={handleSkip}
        type="button"
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'none',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '6px 14px',
          color: '#94A3B8',
          fontSize: '11px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.04em',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = '#FFFFFF';
          e.currentTarget.style.borderColor = 'rgba(0, 201, 167, 0.5)';
          e.currentTarget.style.backgroundColor = 'rgba(0, 201, 167, 0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = '#94A3B8';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        Skip Intro ✕
      </button>
    </div>
  );
}

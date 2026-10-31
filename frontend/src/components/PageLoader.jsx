import React, { useState, useEffect } from 'react';
import careconnectLogo from '../assets/careconnect-logo-transparent.png';

export default function PageLoader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);
  const [phase, setPhase] = useState('draw'); // 'draw' -> 'reveal' -> 'exit'

  useEffect(() => {
    // Phase 1: Draw emblem (0 - 650ms)
    // Phase 2: Reveal full brand logo with Sera gradient shimmer (650ms - 1300ms)
    const revealTimer = setTimeout(() => {
      setPhase('reveal');
    }, 650);

    // Phase 3: Smooth exit to landing page (1350ms)
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 420);
    }, 1350);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 250);
  };

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.025)' : 'scale(1)',
        filter: isExiting ? 'blur(6px)' : 'none',
        transition: 'opacity 0.42s cubic-bezier(0.16, 1, 0.3, 1), transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), filter 0.42s ease',
        pointerEvents: isExiting ? 'none' : 'auto',
        cursor: 'default',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* ── Keyframe Animations Scoped ── */}
      <style>{`
        @keyframes strokeDraw {
          0% {
            stroke-dashoffset: 800;
            opacity: 0.15;
          }
          40% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes emblemPop {
          0% {
            transform: scale(0.92);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shimmerSweep {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          100% {
            transform: translateX(250%) skewX(-20deg);
          }
        }

        @keyframes ambientAura {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.85;
          }
        }

        .sera-stroke-draw {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: strokeDraw 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .sera-shimmer-sheen {
          animation: shimmerSweep 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s forwards;
        }
      `}</style>

      {/* ── Sera UI Architectural Dot Pattern ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          opacity: 0.45,
          pointerEvents: 'none'
        }}
      />

      {/* ── Sera UI Ambient Radial Gradient Glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '520px',
          height: '520px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 201, 167, 0.12) 0%, rgba(224, 242, 254, 0.30) 45%, transparent 70%)',
          animation: 'ambientAura 3s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(35px)'
        }}
      />

      {/* ── Center Stage: Logo Animation Container ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '340px',
          width: '90%'
        }}
      >
        {/* Animated Emblem Drawing (Phase 1) transitioning to full logo (Phase 2) */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'emblemPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* Layer 1: SVG Path Stroke Draw of the Logo Mark */}
          <div
            style={{
              position: phase === 'reveal' ? 'absolute' : 'relative',
              opacity: phase === 'reveal' ? 0 : 1,
              transform: phase === 'reveal' ? 'scale(1.04)' : 'scale(1)',
              transition: 'opacity 0.4s ease, transform 0.4s ease',
              width: '96px',
              height: '96px'
            }}
          >
            <svg
              viewBox="0 0 271 271"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: '100%',
                height: '100%',
                filter: 'drop-shadow(0 4px 14px rgba(0, 201, 167, 0.28))'
              }}
            >
              <defs>
                {/* Signature Sera UI Gradient: Deep Teal -> Emerald Mint -> Telecom Blue */}
                <linearGradient id="seraLogoGradient" x1="21" y1="36" x2="249" y2="234" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0F5B4C" />
                  <stop offset="35%" stopColor="#00876C" />
                  <stop offset="70%" stopColor="#00C9A7" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>

                <linearGradient id="seraHeartGrad" x1="93" y1="92" x2="249" y2="221" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00C9A7" />
                  <stop offset="60%" stopColor="#00A389" />
                  <stop offset="100%" stopColor="#0284C7" />
                </linearGradient>
              </defs>

              {/* Medical Cross Path: Drawn with Sera Gradient */}
              <path
                className="sera-stroke-draw"
                d="M 100,37 L 92,41 L 84,53 L 84,87 L 80,93 L 41,93 L 31,97 L 24,104 L 21,113 L 22,162 L 29,172 L 37,176 L 80,177 L 84,184 L 84,219 L 88,226 L 94,231 L 103,234 L 159,233 L 163,231 L 154,222 L 104,222 L 100,220 L 95,214 L 95,177 L 89,168 L 82,165 L 41,165 L 37,163 L 33,157 L 34,111 L 41,105 L 81,105 L 89,102 L 95,93 L 95,57 L 97,53 L 104,48 L 160,48 L 164,50 L 169,57 L 169,90 L 172,92 L 180,87 L 181,54 L 177,45 L 170,39 L 161,36 Z"
                stroke="url(#seraLogoGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Heart Arc Path */}
              <path
                className="sera-stroke-draw"
                d="M 93,128 L 93,134 L 99,123 L 115,106 L 128,100 L 143,99 L 151,101 L 161,107 L 170,118 L 178,109 L 191,101 L 210,99 L 224,104 L 236,115 L 241,128 L 241,142 L 248,142 L 249,137 L 247,121 L 240,108 L 225,96 L 212,92 L 197,92 L 187,95 L 178,100 L 172,106 L 153,94 L 145,92 L 126,93 L 114,98 L 102,108 L 96,118 Z"
                stroke="url(#seraHeartGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ animationDelay: '0.1s' }}
              />

              {/* Heart & Voice Profile Base */}
              <path
                className="sera-stroke-draw"
                d="M 98,156 L 112,175 L 127,191 L 155,208 L 169,221 L 172,221 L 214,188 L 234,168 L 245,151 L 244,148 L 230,146 L 230,142 L 226,140 L 224,142 L 225,155 L 229,155 L 231,153 L 234,154 L 230,162 L 210,182 L 171,212 L 166,208 L 161,192 L 155,187 L 141,182 L 135,176 L 135,165 L 137,163 L 147,162 L 149,151 L 147,152 L 149,155 L 148,160 L 145,163 L 136,163 L 133,172 L 129,166 L 129,158 L 131,153 L 140,143 L 141,131 L 144,124 L 146,128 L 146,122 L 142,117 L 135,114 L 124,114 L 115,118 L 106,129 Z"
                stroke="url(#seraHeartGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ animationDelay: '0.18s' }}
              />

              {/* Voice Soundwaves */}
              <g fill="url(#seraLogoGradient)">
                <rect x="156" y="142" width="6" height="18" rx="3" />
                <rect x="163" y="137" width="6" height="28" rx="3" />
                <rect x="175" y="142" width="6" height="14" rx="3" />
                <rect x="187" y="135" width="6" height="28" rx="3" />
                <rect x="200" y="122" width="6" height="52" rx="3" />
                <rect x="213" y="132" width="6" height="34" rx="3" />
              </g>
            </svg>
          </div>

          {/* Layer 2: Official Full Brand Logo Reveal with Luxury Shimmer */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '8px 12px',
              opacity: phase === 'reveal' ? 1 : 0,
              transform: phase === 'reveal' ? 'scale(1)' : 'scale(0.94)',
              transition: 'opacity 0.42s cubic-bezier(0.16, 1, 0.3, 1), transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src={careconnectLogo}
              alt="CareConnect AI"
              style={{
                height: '46px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(15, 91, 76, 0.08))'
              }}
            />

            {/* Subtle diagonal light shimmer reflection passing across the logo */}
            <div
              className="sera-shimmer-sheen"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '60px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)',
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

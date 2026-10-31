import React, { useState, useEffect } from 'react';

export default function PageLoader({ onComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Half-second page loading timer (500ms)
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 350);
    }, 500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
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
        transform: isExiting ? 'scale(1.03)' : 'scale(1)',
        filter: isExiting ? 'blur(6px)' : 'none',
        transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease',
        pointerEvents: isExiting ? 'none' : 'auto',
        cursor: 'default',
        userSelect: 'none',
        overflow: 'hidden'
      }}
    >
      {/* ── Keyframe Animations Scoped ── */}
      <style>{`
        @keyframes strokeDrawSlow {
          0% {
            stroke-dashoffset: 900;
            opacity: 0.2;
          }
          40% {
            opacity: 1;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }

        @keyframes wavePulseSlow {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.45;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes ambientAuraSlow {
          0%, 100% {
            transform: scale(0.92);
            opacity: 0.45;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.75;
          }
        }

        .sera-stroke-draw-slow {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: strokeDrawSlow 1.1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .sera-wave-1 { animation: wavePulseSlow 1.1s ease-in-out infinite 0.1s; }
        .sera-wave-2 { animation: wavePulseSlow 1.25s ease-in-out infinite 0.25s; }
        .sera-wave-3 { animation: wavePulseSlow 1.05s ease-in-out infinite 0.15s; }
        .sera-wave-4 { animation: wavePulseSlow 1.35s ease-in-out infinite 0.35s; }
        .sera-wave-5 { animation: wavePulseSlow 1.15s ease-in-out infinite 0.05s; }
        .sera-wave-6 { animation: wavePulseSlow 1.25s ease-in-out infinite 0.2s; }
      `}</style>

      {/* ── Sera UI Architectural Micro-Grid Background ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
          opacity: 0.4,
          pointerEvents: 'none'
        }}
      />

      {/* ── Sera UI Ambient Radial Gradient Glow ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 201, 167, 0.14) 0%, rgba(224, 242, 254, 0.32) 45%, transparent 70%)',
          animation: 'ambientAuraSlow 3s ease-in-out infinite',
          pointerEvents: 'none',
          filter: 'blur(36px)'
        }}
      />

      {/* ── Center Stage: BIG Logo Sign / Emblem Only (No Image, Slow Vector Draw) ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '210px',
          height: '210px'
        }}
      >
        <svg
          viewBox="0 0 271 271"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 10px 28px rgba(0, 201, 167, 0.28))'
          }}
        >
          <defs>
            {/* Signature Sera UI Clinical Gradient: Deep Forest Teal -> Emerald Mint -> Telecom Blue */}
            <linearGradient id="seraMainGradient" x1="21" y1="36" x2="249" y2="234" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0F5B4C" />
              <stop offset="35%" stopColor="#00876C" />
              <stop offset="70%" stopColor="#00C9A7" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="seraHeartGradient" x1="93" y1="92" x2="249" y2="221" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00C9A7" />
              <stop offset="60%" stopColor="#00A389" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id="seraSoundGradient" x1="156" y1="122" x2="218" y2="175" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00C9A7" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Medical Cross Path: Slow Smooth Stroke Draw */}
          <path
            className="sera-stroke-draw-slow"
            d="M 100,37 L 92,41 L 84,53 L 84,87 L 80,93 L 41,93 L 31,97 L 24,104 L 21,113 L 22,162 L 29,172 L 37,176 L 80,177 L 84,184 L 84,219 L 88,226 L 94,231 L 103,234 L 159,233 L 163,231 L 154,222 L 104,222 L 100,220 L 95,214 L 95,177 L 89,168 L 82,165 L 41,165 L 37,163 L 33,157 L 34,111 L 41,105 L 81,105 L 89,102 L 95,93 L 95,57 L 97,53 L 104,48 L 160,48 L 164,50 L 169,57 L 169,90 L 172,92 L 180,87 L 181,54 L 177,45 L 170,39 L 161,36 Z"
            stroke="url(#seraMainGradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Heart Arc Path */}
          <path
            className="sera-stroke-draw-slow"
            d="M 93,128 L 93,134 L 99,123 L 115,106 L 128,100 L 143,99 L 151,101 L 161,107 L 170,118 L 178,109 L 191,101 L 210,99 L 224,104 L 236,115 L 241,128 L 241,142 L 248,142 L 249,137 L 247,121 L 240,108 L 225,96 L 212,92 L 197,92 L 187,95 L 178,100 L 172,106 L 153,94 L 145,92 L 126,93 L 114,98 L 102,108 L 96,118 Z"
            stroke="url(#seraHeartGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ animationDelay: '0.08s' }}
          />

          {/* Heart & Voice Profile Base */}
          <path
            className="sera-stroke-draw-slow"
            d="M 98,156 L 112,175 L 127,191 L 155,208 L 169,221 L 172,221 L 214,188 L 234,168 L 245,151 L 244,148 L 230,146 L 230,142 L 226,140 L 224,142 L 225,155 L 229,155 L 231,153 L 234,154 L 230,162 L 210,182 L 171,212 L 166,208 L 161,192 L 155,187 L 141,182 L 135,176 L 135,165 L 137,163 L 147,162 L 149,151 L 147,152 L 149,155 L 148,160 L 145,163 L 136,163 L 133,172 L 129,166 L 129,158 L 131,153 L 140,143 L 141,131 L 144,124 L 146,128 L 146,122 L 142,117 L 135,114 L 124,114 L 115,118 L 106,129 Z"
            stroke="url(#seraHeartGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ animationDelay: '0.15s' }}
          />

          {/* Voice Soundwave Equalizer Bars */}
          <g fill="url(#seraSoundGradient)">
            <rect x="156" y="142" width="6" height="18" rx="3" className="sera-wave-1" style={{ transformOrigin: '159px 151px' }} />
            <rect x="163" y="137" width="6" height="28" rx="3" className="sera-wave-2" style={{ transformOrigin: '166px 151px' }} />
            <rect x="175" y="142" width="6" height="14" rx="3" className="sera-wave-3" style={{ transformOrigin: '178px 149px' }} />
            <rect x="187" y="135" width="6" height="28" rx="3" className="sera-wave-4" style={{ transformOrigin: '190px 149px' }} />
            <rect x="200" y="122" width="6" height="52" rx="3" className="sera-wave-5" style={{ transformOrigin: '203px 148px' }} />
            <rect x="213" y="132" width="6" height="34" rx="3" className="sera-wave-6" style={{ transformOrigin: '216px 149px' }} />
          </g>
        </svg>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';

export default function VoiceInfraPartners() {
  // Soundwave bar heights for the central equalizer
  const bars = [8, 14, 20, 32, 44, 58, 72, 86, 96, 86, 72, 58, 44, 32, 20, 14, 8];

  return (
    <section
      aria-label="Our Voice Infrastructure Partners"
      style={{
        position: 'relative',
        backgroundColor: '#FFFFFF',
        padding: '56px 24px 64px',
        overflow: 'hidden',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <style>{`
        @keyframes pulseEqualizer {
          0%, 100% { transform: scaleY(0.65); opacity: 0.75; }
          50% { transform: scaleY(1.18); opacity: 1; }
        }
        .equalizer-bar {
          transform-origin: center;
          transition: transform 0.2s ease;
        }
      `}</style>

      {/* Subtle Pastel Ambient Wave Glows (matching image) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '10%',
          width: '420px',
          height: '240px',
          background: 'radial-gradient(ellipse, rgba(0, 201, 167, 0.08) 0%, transparent 70%)',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          filter: 'blur(32px)',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: '420px',
          height: '240px',
          background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          filter: 'blur(32px)',
        }}
      />

      <div style={{ maxWidth: '1040px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        
        {/* Section Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: '#64748B',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '28px',
            fontFamily: 'Inter, sans-serif',
          }}>
            Our Voice Infra Partners
          </span>
        </motion.div>

        {/* ── Partner Logos Row: Bolna ✕ Sarvam AI ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '36px',
            flexWrap: 'wrap',
            marginBottom: '40px',
          }}
        >
          {/* 1. Bolna Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left' }}>
            {/* Bolna Rounded Squircle Icon */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4361EE 0%, #3A0CA3 100%)',
              boxShadow: '0 8px 20px rgba(67, 97, 238, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
                {/* Speech silhouette */}
                <path
                  d="M10 24C10.5 20.5 12.5 18 16 18C18.5 18 20.5 16.5 20.5 14C20.5 11.5 18.5 10 16 10C13.5 10 11.5 11.5 11.5 14H8C8 9.5 11.5 6 16 6C20.5 6 24 9.5 24 14C24 18 21.5 20.5 18.5 21C16.5 21.3 15 22.5 14.5 24H10Z"
                  fill="white"
                />
                <circle cx="11" cy="24" r="2.5" fill="white" />
              </svg>
            </div>

            <div>
              <div style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#0A1128',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                fontFamily: 'Plus Jakarta Sans, sans-serif',
              }}>
                Bolna
              </div>
              <div style={{
                fontSize: '11.5px',
                color: '#64748B',
                fontWeight: 600,
                marginTop: '2px',
                letterSpacing: '0.02em',
              }}>
                Voice AI Platform
              </div>
            </div>
          </div>

          {/* Cross Divider ✕ */}
          <div style={{
            fontSize: '22px',
            fontWeight: 300,
            color: '#94A3B8',
            userSelect: 'none',
            lineHeight: 1,
          }}>
            ✕
          </div>

          {/* 2. Sarvam AI Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0A1128',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              display: 'flex',
              alignItems: 'baseline',
            }}>
              <span>sarvam a</span>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                {/* Custom 'i' with orange dot */}
                <span style={{ color: '#0A1128' }}>ı</span>
                <span style={{
                  position: 'absolute',
                  top: '1px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '5.5px',
                  height: '5.5px',
                  borderRadius: '50%',
                  backgroundColor: '#EA580C',
                }} />
              </span>
            </div>
            <div style={{
              fontSize: '9.5px',
              fontWeight: 800,
              color: '#64748B',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              marginTop: '4px',
            }}>
              Bharat's AI
            </div>
          </div>
        </motion.div>

        {/* ── Center Soundwave Audio Equalizer Visualization ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80px',
            maxWidth: '780px',
            margin: '0 auto',
          }}
        >
          {/* Flowing Sine Wave Curve Background Line */}
          <svg
            width="100%"
            height="80"
            viewBox="0 0 780 80"
            fill="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <defs>
              <linearGradient id="waveLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00C9A7" stopOpacity="0" />
                <stop offset="25%" stopColor="#00C9A7" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="75%" stopColor="#8B5CF6" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Smooth gentle continuous audio sine curve */}
            <path
              d="M 0 40 Q 120 25, 240 40 T 480 40 T 720 40 T 780 40"
              stroke="url(#waveLineGradient)"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {/* Equalizer Vertical Pill Bars in Gradient */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            height: '60px',
            position: 'relative',
            zIndex: 2,
          }}>
            {bars.map((height, i) => {
              // Interpolate colors across the bars: cyan/mint -> blue -> violet
              const ratio = i / (bars.length - 1);
              let barColor = '#00C9A7';
              if (ratio > 0.65) barColor = '#8B5CF6';
              else if (ratio > 0.35) barColor = '#3B82F6';

              // Alternate pulse delay
              const delay = (Math.abs(i - Math.floor(bars.length / 2)) * 0.08).toFixed(2);

              return (
                <div
                  key={i}
                  className="equalizer-bar"
                  style={{
                    width: '4px',
                    height: `${height * 0.55}px`,
                    borderRadius: '999px',
                    backgroundColor: barColor,
                    animation: `pulseEqualizer 1.6s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                    boxShadow: `0 0 6px ${barColor}40`,
                  }}
                />
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}


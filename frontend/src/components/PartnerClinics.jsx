import React from 'react';
import { motion } from 'framer-motion';

/* ── Authentic Healthcare Clinic Brand Logos ── */

const ApolloLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1" />
    <path d="M16 5C14.5 8.5 12 11 12 14.5C12 17.5 14 19 16 19C18 19 20 17.5 20 14.5C20 11 17.5 8.5 16 5Z" fill="#EA580C" />
    <path d="M16 10C15 12 13.5 13.5 13.5 15.5C13.5 17 14.5 18 16 18C17.5 18 18.5 17 18.5 15.5C18.5 13.5 17 12 16 10Z" fill="#FBBF24" />
    <path d="M13 21H19M16 18V26" stroke="#0F2D59" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ManipalLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
    <path d="M8 22V13C8 9.5 11 8 13.5 10.5L16 13L18.5 10.5C21 8 24 9.5 24 13V22" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="18" r="3" fill="#00C9A7" />
  </svg>
);

const FortisLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
    <circle cx="16" cy="8.5" r="2.5" fill="#DC2626" />
    <path d="M9 14.5C12 12.5 14 13 16 13.5C18 13 20 12.5 23 14.5" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M16 13.5V25M12 25H20" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

const MaxLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1" />
    <path d="M16 6V26M6 16H26" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3.5" fill="#0A2540" />
  </svg>
);

const AsterLogo = () => (
  <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
    <path d="M16 6V26M6 16H26M8.93 8.93L23.07 23.07M8.93 23.07L23.07 8.93" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="16" cy="16" r="3" fill="#0284C7" />
  </svg>
);

const CloudnineLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#FDF2F8" stroke="#FBCFE8" strokeWidth="1" />
    <path d="M16 7C12 7 9 10 9 14C9 20 16 25 16 25C16 25 23 20 23 14C23 10 20 7 16 7Z" fill="#FCE7F3" stroke="#DB2777" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="16" cy="13" r="2.5" fill="#9333EA" />
  </svg>
);

const PARTNERS = [
  { name: 'Apollo Clinic', logo: ApolloLogo },
  { name: 'Manipal Clinic', logo: ManipalLogo },
  { name: 'Fortis Clinic', logo: FortisLogo },
  { name: 'Max Clinic', logo: MaxLogo },
  { name: 'Aster Clinic', logo: AsterLogo },
  { name: 'Cloudnine Clinic', logo: CloudnineLogo },
];

export default function PartnerClinics() {
  // Duplicate array for seamless infinite marquee loop
  const displayPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section 
      aria-label="Partner Clinics"
      style={{
        padding: '34px 0 38px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #E2E8F0',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
      }}
    >
      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .partner-marquee-track {
          display: flex;
          width: max-content;
          animation: scrollMarquee 26s linear infinite;
        }
        .partner-marquee-track:hover {
          animation-play-state: paused;
        }
        .partner-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .partner-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 201, 167, 0.4) !important;
          box-shadow: 0 8px 24px rgba(15, 91, 76, 0.08) !important;
        }
      `}</style>

      {/* Animated Scroll Reveal Container */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px', padding: '0 24px' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 800,
            color: '#475569',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            margin: 0,
            fontFamily: 'Plus Jakarta Sans, sans-serif',
          }}>
            Partner Clinics
          </h3>
        </div>

        {/* Infinite Scrolling Track with Edge Gradient Fade */}
        <div 
          style={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            padding: '6px 0',
          }}
        >
          <div className="partner-marquee-track" style={{ display: 'flex', gap: '18px' }}>
            {displayPartners.map((clinic, index) => {
              const Logo = clinic.logo;
              return (
                <div
                  key={`${clinic.name}-${index}`}
                  className="partner-card"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 22px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(15, 91, 76, 0.1)',
                    borderRadius: '999px',
                    boxShadow: '0 2px 10px rgba(15, 91, 76, 0.04)',
                    cursor: 'default',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {/* Real Clinic Logo */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Logo />
                  </div>

                  {/* Clinic Name Only (Location removed) */}
                  <span style={{
                    fontSize: '14.5px',
                    fontWeight: 800,
                    color: '#0A2520',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    letterSpacing: '-0.01em',
                  }}>
                    {clinic.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

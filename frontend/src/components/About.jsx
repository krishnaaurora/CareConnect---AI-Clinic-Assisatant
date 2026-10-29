import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, Clock, Users, Zap, CalendarCheck, MessageSquare } from 'lucide-react';

export default function About() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const challenges = [
    {
      icon: PhoneCall,
      iconColor: '#0284C7',
      iconBg: '#E0F2FE',
      title: 'Missed calls',
      desc: 'Many patient calls go unanswered during peak hours.'
    },
    {
      icon: Clock,
      iconColor: '#00A389',
      iconBg: '#DCFAF3',
      title: 'Repetitive enquiries',
      desc: 'Staff spend hours answering the same questions.'
    },
    {
      icon: Users,
      iconColor: '#00A389',
      iconBg: '#DCFAF3',
      title: 'Language barriers',
      desc: 'Patients struggle to communicate in their preferred language.'
    }
  ];

  const solutions = [
    {
      icon: Zap,
      iconColor: '#00A389',
      iconBg: '#DCFAF3',
      title: 'Instant AI call handling',
      desc: 'Answers 24/7 and captures appointment requests.'
    },
    {
      icon: CalendarCheck,
      iconColor: '#00A389',
      iconBg: '#DCFAF3',
      title: 'Automated enquiry resolution',
      desc: 'Provides instant verified clinic info, fees, and timings.'
    },
    {
      icon: MessageSquare,
      iconColor: '#00A389',
      iconBg: '#DCFAF3',
      title: 'Multilingual support',
      desc: 'Communicates naturally in multiple languages.'
    }
  ];

  return (
    <section
      id="about"
      style={{
        padding: '76px 0 92px',
        position: 'relative',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid #E2E8F0',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden'
      }}
      aria-labelledby="about-heading"
    >
      {/* ── Background Floating Accent Icons matching Screenshot ── */}
      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '36px',
          left: '3.5%',
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          backgroundColor: '#DCFAF3',
          border: '1px solid rgba(0, 201, 167, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#007A65',
          pointerEvents: 'none',
          boxShadow: '0 4px 14px rgba(0, 201, 167, 0.1)',
        }}
      >
        <PhoneCall size={21} strokeWidth={2.2} />
      </div>

      <div 
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '36px',
          right: '3.5%',
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          backgroundColor: '#DCFAF3',
          border: '1px solid rgba(0, 201, 167, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#007A65',
          pointerEvents: 'none',
          boxShadow: '0 4px 14px rgba(0, 201, 167, 0.1)',
        }}
      >
        <CalendarCheck size={21} strokeWidth={2.2} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* ── Section Pill matching Reference Image ── */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '38px' }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 20px',
            borderRadius: '999px',
            backgroundColor: '#FFFFFF',
            color: '#0A2520',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(10, 37, 32, 0.04)'
          }}>
            <PhoneCall size={13} color="#007A65" strokeWidth={2.4} />
            <span>THE PROBLEM WE SOLVE</span>
          </div>
        </motion.div>

        {/* ── 2 Parent Cards (Side-by-Side) matching Screenshot ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '28px',
          maxWidth: '1140px',
          margin: '0 auto',
          alignItems: 'stretch'
        }}>

          {/* Left Parent Card: THE CHALLENGE */}
          <motion.div 
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '28px',
              border: '1px solid #E2E8F0',
              padding: '38px 34px',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Tag */}
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#007A65',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: 'Inter, sans-serif'
            }}>
              THE CHALLENGE
            </div>

            {/* Heading */}
            <h3 style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#0A2520',
              lineHeight: 1.25,
              letterSpacing: '-0.025em',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              margin: '0 0 24px'
            }}>
              Too many calls,<br />
              not enough time.
            </h3>

            {/* 3 Inner Challenge Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {challenges.map((item, i) => {
                const Icon = item.icon;
                const isHovered = hoveredIndex === i;

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '16px 18px',
                      borderRadius: '16px',
                      backgroundColor: '#FFFFFF',
                      border: isHovered ? '2px solid #0A2520' : '1px solid #E2E8F0',
                      boxShadow: isHovered 
                        ? '0 10px 26px rgba(10, 37, 32, 0.10)' 
                        : '0 2px 6px rgba(10, 37, 32, 0.02)',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Icon container */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: item.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      transition: 'all 0.2s ease'
                    }}>
                      <Icon size={18} color={item.iconColor} strokeWidth={2.2} />
                    </div>

                    {/* Content */}
                    <div>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#0A2520',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        margin: '0 0 3px',
                        letterSpacing: '-0.01em'
                      }}>
                        {item.title}
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748B',
                        lineHeight: 1.45,
                        margin: 0,
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Parent Card: THE CARECONNECT AI ADVANTAGE */}
          <motion.div 
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '28px',
              border: '1px solid #E2E8F0',
              padding: '38px 34px',
              boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Tag */}
            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#007A65',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px',
              fontFamily: 'Inter, sans-serif'
            }}>
              THE CARECONNECT AI ADVANTAGE
            </div>

            {/* Heading */}
            <h3 style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#0A2520',
              lineHeight: 1.25,
              letterSpacing: '-0.025em',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              margin: '0 0 24px'
            }}>
              Automated. Intelligent.<br />
              Always on.
            </h3>

            {/* 3 Inner Solution Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {solutions.map((item, i) => {
                const Icon = item.icon;
                const isHovered = hoveredIndex === i;

                return (
                  <div
                    key={i}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      padding: '16px 18px',
                      borderRadius: '16px',
                      backgroundColor: '#FFFFFF',
                      border: isHovered ? '2px solid #0A2520' : '1px solid #E2E8F0',
                      boxShadow: isHovered 
                        ? '0 10px 26px rgba(10, 37, 32, 0.10)' 
                        : '0 2px 6px rgba(10, 37, 32, 0.02)',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Icon container */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      backgroundColor: item.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                      transition: 'all 0.2s ease'
                    }}>
                      <Icon size={18} color={item.iconColor} strokeWidth={2.2} />
                    </div>

                    {/* Content */}
                    <div>
                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#0A2520',
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        margin: '0 0 3px',
                        letterSpacing: '-0.01em'
                      }}>
                        {item.title}
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#64748B',
                        lineHeight: 1.45,
                        margin: 0,
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

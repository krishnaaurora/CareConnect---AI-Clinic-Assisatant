import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneCall, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  FileText, 
  Activity,
  Mic,
  Maximize2
} from 'lucide-react';

export default function DemoVideoSection({ onOpenRealtimeVoice }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);

  const CHAPTERS = [
    { time: 0, label: "00:00 - System Architecture Overview", desc: "Introduction to CareConnect AI & Priya voice infrastructure" },
    { time: 75, label: "01:15 - Live PSTN Call to +918064269783", desc: "Dialing the carrier line & real-time Hindi/English greeting" },
    { time: 160, label: "02:40 - Real-Time Doctor Availability", desc: "Dr. Samir Verma schedule check with anti-substitution verification" },
    { time: 250, label: "04:10 - Appointment Confirmation in MongoDB", desc: "Booking reference APT-7829104 created and synced live" },
    { time: 385, label: "06:25 - Diagnostic Report & DOB Security", desc: "Identity check via date of birth (14-08-1994) & CBC test readiness" },
    { time: 510, label: "08:30 - Automated Cancellation & Slot Release", desc: "Cancelling appointment reference & releasing doctor consultation slot" },
    { time: 605, label: "10:05 - Admin Console Telemetry & Audio Playback", desc: "Reviewing Sarvam Indus CDN recording & bilingual transcript ledger" },
  ];

  const handleCopy = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNumber(label);
      setTimeout(() => setCopiedNumber(null), 3000);
    }
  };

  const handleSeek = (seconds, idx) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
      setIsPlaying(true);
      setActiveChapter(idx);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  return (
    <section 
      id="demo-video-section" 
      style={{
        position: 'relative',
        padding: '90px 24px 100px',
        maxWidth: '1240px',
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* ── Background Subtle Ambient Glow ── */}
      <div 
        aria-hidden="true" 
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(0, 201, 167, 0.12) 0%, rgba(2, 132, 199, 0.06) 50%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* ── Section Header ── */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#EDFDF9',
            border: '1px solid rgba(0, 201, 167, 0.3)',
            borderRadius: '999px',
            padding: '6px 18px',
            fontSize: '13px',
            fontWeight: 800,
            color: '#0F5B4C',
            marginBottom: '16px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <Play size={13} fill="#00C9A7" color="#00C9A7" />
            <span>Full End-to-End Walkthrough & Live Call Recording</span>
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 900,
            color: '#0A2520',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            margin: '0 0 16px',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}>
            Experience CareConnect AI & Priya in Action
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#475569',
            lineHeight: 1.6,
            margin: 0
          }}>
            Watch a complete 11-minute demonstration of CareConnect AI in action: real carrier telephone calls over PSTN,
            natural Hindi/English conversations with Priya, instant doctor schedule validation, appointment cancellations,
            and confidential Date of Birth diagnostic report status lookups.
          </p>
        </div>

        {/* ── PROMINENT LIVE TELEPHONY TEST BANNER (Highlighted Inbound Numbers) ── */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #00C9A7',
          boxShadow: '0 16px 36px -6px rgba(15, 91, 76, 0.12), 0 4px 16px rgba(0, 201, 167, 0.08)',
          padding: '24px 28px',
          marginBottom: '42px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Live Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '18px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#DCFAF3',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#0F5B4C'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 10px #10B981',
                  display: 'inline-block'
                }} />
                <span>PSTN CARRIER LINE LIVE · 24/7 AUTONOMOUS RECEPTIONIST</span>
              </div>
              <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                Powered by Sarvam AI Conversational Engine (v11)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onOpenRealtimeVoice}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <Mic size={14} color="#00C9A7" />
                <span>Test in Browser Mic</span>
              </button>
            </div>
          </div>

          {/* Main Number Row & Instructions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}>
            {/* Left: Phone Numbers Display */}
            <div>
              <p style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                margin: '0 0 8px'
              }}>
                Call Priya Directly From Any Mobile or Landline Phone:
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {/* Number 1: +918064269783 */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '8px 14px'
                }}>
                  <PhoneCall size={18} color="#0F5B4C" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, lineHeight: 1 }}>INTERNATIONAL FORMAT</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0A2520', letterSpacing: '0.02em' }}>+91 80642 69783</div>
                  </div>
                  <button
                    onClick={() => handleCopy('+918064269783', '+918064269783')}
                    title="Copy number"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: copiedNumber === '+918064269783' ? '#10B981' : '#64748B'
                    }}
                  >
                    {copiedNumber === '+918064269783' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <a
                    href="tel:+918064269783"
                    style={{
                      backgroundColor: '#0F5B4C',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    Call
                  </a>
                </div>

                {/* Number 2: 08064269783 */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#F8FAFC',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '8px 14px'
                }}>
                  <Phone size={18} color="#00876C" />
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, lineHeight: 1 }}>INDIAN STD DIAL</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#0A2520', letterSpacing: '0.02em' }}>08064269783</div>
                  </div>
                  <button
                    onClick={() => handleCopy('08064269783', '08064269783')}
                    title="Copy number"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: copiedNumber === '08064269783' ? '#10B981' : '#64748B'
                    }}
                  >
                    {copiedNumber === '08064269783' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <a
                    href="tel:08064269783"
                    style={{
                      backgroundColor: '#00876C',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    Call
                  </a>
                </div>
              </div>

              {copiedNumber && (
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 700, marginTop: '6px' }}>
                  ✓ Copied {copiedNumber} to clipboard! Dial from your phone to test.
                </div>
              )}
            </div>

            {/* Right: Suggested Prompts to Try on the Call */}
            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '14px',
              padding: '14px 18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Suggested Real Scenarios To Test With Priya:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#334155', lineHeight: 1.5 }}>
                <li><b>Hindi Doctor Availability:</b> <i>"क्या डॉक्टर समीर वर्मा कल सुबह 10:00 AM पर उपलब्ध हैं?"</i></li>
                <li><b>English Slot Booking:</b> <i>"I want to book an appointment with Dr. Rajesh Sharma for tomorrow."</i></li>
                <li><b>DOB Report Verification:</b> <i>"मेरी ब्लड टेस्ट रिपोर्ट तैयार है क्या? मेरी जन्मतिथि 14-08-1994 है।"</i></li>
                <li><b>Cancellation:</b> <i>"Please cancel my appointment reference APT-7829104."</i></li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── MAIN VIDEO PLAYER CONTAINER ── */}
        <div style={{
          backgroundColor: '#0A2520',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px -12px rgba(10, 37, 32, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          position: 'relative'
        }}>
          {/* Top Bar of Video Player */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 22px',
            backgroundColor: '#061A16',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.01em' }}>
                CareConnect AI · Live Telephony Demonstration & Walkthrough (11m 15s)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href="https://drive.google.com/drive/folders/1Q2FIMVB2w_kHdnEigipUoN4bHjX2k2IW"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#00C9A7',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Google Drive Mirror</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* HTML5 Video Element */}
          <div style={{ position: 'relative', width: '100%', backgroundColor: '#000000', aspectRatio: '16 / 9' }}>
            <video
              ref={videoRef}
              controls
              playsInline
              preload="metadata"
              poster="/priya-avatar.png"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="/demo-call-walkthrough.mp4" type="video/mp4" />
              <source src="/Recording 2026-10-31 225332.mp4" type="video/mp4" />
              Your browser does not support the video tag. You can watch the recording on{' '}
              <a href="https://drive.google.com/drive/folders/1Q2FIMVB2w_kHdnEigipUoN4bHjX2k2IW" style={{ color: '#00C9A7' }}>
                Google Drive
              </a>.
            </video>
          </div>

          {/* Video Footer Actions & Chapters */}
          <div style={{
            padding: '20px 24px',
            backgroundColor: '#08201B',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                  Walkthrough Chapters & Key Milestones
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Click any chapter to jump directly to that point in the demonstration
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="/demo-call-walkthrough.mp4"
                  download="CareConnect-AI-Demo.mp4"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#E2E8F0',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}
                >
                  <span>Download MP4</span>
                </a>
              </div>
            </div>

            {/* Chapters Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '10px'
            }}>
              {CHAPTERS.map((ch, idx) => {
                const isSelected = activeChapter === idx;
                return (
                  <button
                    key={ch.time}
                    onClick={() => handleSeek(ch.time, idx)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(0, 201, 167, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid #00C9A7' : '1px solid rgba(255, 255, 255, 0.07)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: isSelected ? '#00C9A7' : '#F1F5F9' }}>
                      {ch.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', lineHeight: 1.3 }}>
                      {ch.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

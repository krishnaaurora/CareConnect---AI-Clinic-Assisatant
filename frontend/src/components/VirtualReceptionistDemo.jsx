import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Mic, CheckCircle2, 
  Calendar, Clock, Phone, AlertCircle, Sparkles, User, Globe2, 
  ArrowRight, ShieldCheck, Stethoscope, ChevronRight, MessageSquare
} from 'lucide-react';
import priyaImg from '../assets/priya-avatar.png';

export default function VirtualReceptionistDemo() {
  // Scenarios definition
  const scenarios = [
    {
      id: 'appointment',
      title: 'Book an Appointment',
      tag: 'Scenario 1',
      icon: <Calendar size={18} />,
      description: 'Patient requests doctor consultation; Priya captures specialty, preferred slot, and logs for verification.',
      messages: [
        { speaker: 'Patient', text: 'Hello, I would like to book an appointment with a doctor.', time: '10:24 AM' },
        { speaker: 'Priya', text: 'Of course. Which specialty would you like to consult?', time: '10:24 AM' },
        { speaker: 'Patient', text: 'General Medicine.', time: '10:25 AM' },
        { speaker: 'Priya', text: 'What date and time would you prefer?', time: '10:25 AM' },
        { speaker: 'Patient', text: 'October 28th, around 11:30 AM.', time: '10:25 AM' },
        { speaker: 'Priya', text: 'Thank you. I have captured your appointment request for the clinic team to review.', time: '10:26 AM' }
      ],
      activity: {
        enquiry: 'Appointment Request',
        specialty: 'General Medicine',
        preferredDate: '28 October 2026',
        preferredTime: '11:30 AM',
        patientName: 'Ananya Sharma (Sample Patient)',
        status: 'Demo request captured — not booked',
        humanFollowup: 'Required for confirmation',
        language: 'English (Indian)',
        callStatus: 'Completed in Demo'
      }
    },
    {
      id: 'enquiry',
      title: 'Clinic Enquiry',
      tag: 'Scenario 2',
      icon: <Clock size={18} />,
      description: 'Patient asks about operating hours; Priya answers with configured sample schedule.',
      messages: [
        { speaker: 'Patient', text: 'Hi, could you tell me about your clinic hours?', time: '11:02 AM' },
        { speaker: 'Priya', text: 'I can help with clinic information. Which service or opening hours would you like to know about?', time: '11:02 AM' },
        { speaker: 'Patient', text: 'I want to know when the clinic opens.', time: '11:03 AM' },
        { speaker: 'Priya', text: "I can show you the clinic's configured opening hours. For this demo, the information displayed is sample content.", time: '11:03 AM' }
      ],
      activity: {
        enquiry: 'Clinic Information',
        specialty: 'OPD Schedule & Timings',
        preferredDate: 'Monday - Saturday',
        preferredTime: '08:00 AM - 08:30 PM (Sample Data)',
        patientName: 'Caller (Anonymous Enquiry)',
        status: 'Enquiry handled in demo',
        humanFollowup: 'Not required for this simulated interaction',
        language: 'English',
        callStatus: 'Completed in Demo'
      }
    },
    {
      id: 'callback',
      title: 'Request a Callback',
      tag: 'Scenario 3',
      icon: <Phone size={18} />,
      description: 'Patient requests human staff contact; Priya initiates front-desk handoff ticket.',
      messages: [
        { speaker: 'Patient', text: 'Could someone from the clinic call me back?', time: '02:15 PM' },
        { speaker: 'Priya', text: 'Certainly. I can record a callback request for the clinic team.', time: '02:15 PM' },
        { speaker: 'Patient', text: 'Please ask them to contact me when possible.', time: '02:16 PM' },
        { speaker: 'Priya', text: "Your callback request has been captured in this demonstration. A real callback would require the clinic's connected system.", time: '02:16 PM' }
      ],
      activity: {
        enquiry: 'Callback Request',
        specialty: 'Front-Desk Coordination',
        preferredDate: 'Immediate Priority Queue',
        preferredTime: 'Within 15 Mins (Simulated)',
        patientName: 'Rohan Mehta (Sample Caller)',
        status: 'Pending staff follow-up — simulated',
        humanFollowup: 'Required',
        language: 'English',
        callStatus: 'Queued for Front Desk'
      }
    }
  ];

  // Component state
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(0); // number of visible messages
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);

  const activeScenario = scenarios[activeScenarioIdx];
  const totalMessages = activeScenario.messages.length;
  const isDemoFinished = currentStep >= totalMessages;

  // Timers and progression ref
  const timerRef = useRef(null);
  const chatScrollRef = useRef(null);

  // Web Speech API Voice synthesis helper
  const speakText = (text) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    u.pitch = 1.05;

    u.onstart = () => setIsSpeakingAudio(true);
    u.onend = () => setIsSpeakingAudio(false);
    u.onerror = () => setIsSpeakingAudio(false);

    window.speechSynthesis.speak(u);
  };

  // Scroll to bottom of chat when new message appears
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [currentStep, isProcessing]);

  // Handle automated progression when isPlaying is true
  useEffect(() => {
    if (isPlaying && currentStep < totalMessages) {
      const nextMessage = activeScenario.messages[currentStep];
      const isPriya = nextMessage.speaker === 'Priya';

      if (isPriya) {
        setIsProcessing(true);
        timerRef.current = setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep(prev => prev + 1);
          speakText(nextMessage.text);
        }, 1200);
      } else {
        timerRef.current = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, 1500);
      }
    } else if (currentStep >= totalMessages) {
      setIsPlaying(false);
      setIsProcessing(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, activeScenarioIdx, totalMessages]);

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Control Handlers
  const handleSelectScenario = (idx) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsProcessing(false);
    setIsSpeakingAudio(false);
    setActiveScenarioIdx(idx);
    setCurrentStep(1); // show first message
  };

  const handleStartResume = () => {
    if (isDemoFinished) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsProcessing(false);
    setIsSpeakingAudio(false);
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsProcessing(false);
    setIsSpeakingAudio(false);
    setCurrentStep(1);
  };

  const handleReplay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsProcessing(false);
    setIsSpeakingAudio(false);
    setCurrentStep(0);
    setTimeout(() => {
      setIsPlaying(true);
    }, 200);
  };

  const handleReplayLastPriyaVoice = () => {
    const shownMessages = activeScenario.messages.slice(0, currentStep);
    const lastPriyaMsg = [...shownMessages].reverse().find(m => m.speaker === 'Priya');
    if (lastPriyaMsg) {
      speakText(lastPriyaMsg.text);
    }
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeakingAudio(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  return (
    <section id="interactive-demo" style={{
      padding: '85px 0 100px 0',
      background: 'linear-gradient(180deg, #F8FAF9 0%, #F1F6F4 50%, #FFFFFF 100%)',
      position: 'relative',
      borderTop: '1px solid rgba(13, 62, 51, 0.08)',
      borderBottom: '1px solid rgba(13, 62, 51, 0.08)'
    }}>
      
      {/* Decorative ambient subtle backdrop shapes */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '420px',
        height: '420px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        top: '25%',
        right: '5%',
        width: '480px',
        height: '480px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2, 132, 199, 0.08) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
        
        {/* Section Introduction */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 40px auto' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#E8F7EC',
            border: '1px solid rgba(11, 66, 54, 0.15)',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} color="#0B4236" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0B4236', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              INTERACTIVE PRODUCT DEMO
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(2.3rem, 3.8vw, 3.2rem)',
            fontWeight: 900,
            color: '#0A382E',
            marginBottom: '16px',
            letterSpacing: '-0.03em',
            lineHeight: 1.15
          }}>
            Meet Priya, your virtual clinic receptionist.
          </h2>

          <p style={{
            fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
            color: '#3E544F',
            lineHeight: 1.65,
            marginBottom: '16px'
          }}>
            “See how CareConnect AI answers patient enquiries, assists with appointment requests, and connects patients with your clinic team when human support is needed.”
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#059669',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '4px 12px',
            borderRadius: '6px',
            letterSpacing: '0.04em'
          }}>
            <ShieldCheck size={14} />
            <span>SIMULATED DEMO · NO REAL CALLS OR APPOINTMENTS</span>
          </div>

        </div>

        {/* Interactive Scenario Selection Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {scenarios.map((sc, idx) => {
            const isSelected = activeScenarioIdx === idx;
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                style={{
                  padding: '18px 22px',
                  borderRadius: '18px',
                  background: isSelected ? '#FFFFFF' : '#F4F7F5',
                  border: isSelected ? '2px solid #0B4236' : '1px solid rgba(11, 66, 54, 0.1)',
                  boxShadow: isSelected ? '0 12px 28px -6px rgba(11, 66, 54, 0.12)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isSelected ? '#E8F7EC' : '#E2E8F0',
                      color: isSelected ? '#0B4236' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {sc.icon}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: isSelected ? '#0B4236' : '#64748B', textTransform: 'uppercase' }}>
                      {sc.tag}
                    </span>
                  </div>

                  {isSelected && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#059669',
                      background: '#DCF2E3',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      Active
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0A382E', margin: '0 0 4px 0' }}>
                  {sc.title}
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.45 }}>
                  {sc.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Main Application Container with Browser Header Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '26px',
          border: '1px solid rgba(11, 66, 54, 0.12)',
          boxShadow: '0 24px 60px -15px rgba(11, 66, 54, 0.1)',
          overflow: 'hidden'
        }}>
          
          {/* Top Browser Window Header */}
          <div style={{
            padding: '12px 22px',
            background: '#F8FAF9',
            borderBottom: '1px solid rgba(11, 66, 54, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            
            {/* Traffic Lights + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></span>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></span>
              </div>
              
              <div style={{
                background: '#FFFFFF',
                padding: '4px 14px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                color: '#64748B',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ color: '#0B4236', fontWeight: 700 }}>🔒 careconnect.ai</span>
                <span>/demo/virtual-receptionist-priya</span>
              </div>
            </div>

            {/* Functional Controls Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              
              {!isPlaying ? (
                <button
                  onClick={handleStartResume}
                  style={{
                    background: '#0B4236',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(11, 66, 54, 0.2)'
                  }}
                  title="Play simulated conversation"
                >
                  <Play size={13} fill="#FFFFFF" />
                  <span>{currentStep === 0 ? 'Start Demo' : isDemoFinished ? 'Restart Demo' : 'Resume Demo'}</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  style={{
                    background: '#F59E0B',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Pause simulation"
                >
                  <Pause size={13} fill="#FFFFFF" />
                  <span>Pause Demo</span>
                </button>
              )}

              <button
                onClick={handleReplay}
                style={{
                  background: '#FFFFFF',
                  color: '#0B4236',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Replay from beginning"
              >
                <RotateCcw size={13} />
                <span>Replay</span>
              </button>

              <button
                onClick={handleReplayLastPriyaVoice}
                disabled={currentStep === 0}
                style={{
                  background: '#FFFFFF',
                  color: currentStep === 0 ? '#94A3B8' : '#0B4236',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Speak last Priya response via browser voice"
              >
                <Volume2 size={13} />
                <span>Replay Voice</span>
              </button>

              <button
                onClick={toggleAudio}
                style={{
                  background: audioEnabled ? '#DCF2E3' : '#F1F5F9',
                  color: audioEnabled ? '#0B4236' : '#64748B',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={audioEnabled ? 'Browser Voice Enabled' : 'Browser Voice Muted'}
              >
                {audioEnabled ? <Volume2 size={13} color="#0B4236" /> : <VolumeX size={13} />}
                <span>{audioEnabled ? 'Audio On' : 'Muted'}</span>
              </button>

              <button
                onClick={handleReset}
                style={{
                  background: '#FFFFFF',
                  color: '#64748B',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
                title="Reset scenario"
              >
                Reset
              </button>
            </div>

          </div>

          {/* Three Coordinated Areas Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 0,
            minHeight: '520px'
          }}>
            
            {/* AREA A: Virtual Receptionist (Columns 1 to 4) */}
            <div style={{
              gridColumn: 'span 4',
              padding: '24px',
              borderRight: '1px solid rgba(11, 66, 54, 0.08)',
              background: 'linear-gradient(180deg, #FAFDFB 0%, #FFFFFF 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              
              <div style={{ width: '100%' }}>
                
                {/* Receptionist Status Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="pulse-green"></span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0B4236' }}>
                      PRIYA AI RECEPTIONIST
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isSpeakingAudio ? '#059669' : isProcessing ? '#0284C7' : '#64748B',
                    background: isSpeakingAudio ? '#DCF2E3' : '#F1F5F9',
                    padding: '3px 8px',
                    borderRadius: '999px'
                  }}>
                    {isSpeakingAudio ? 'Speaking' : isProcessing ? 'Processing Intent' : isPlaying ? 'Listening' : 'Ready'}
                  </span>
                </div>

                {/* Priya Static Avatar in Polished Frame */}
                <div style={{
                  position: 'relative',
                  width: '210px',
                  height: '240px',
                  margin: '0 auto 16px auto',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  background: 'radial-gradient(circle, #D1FAE5 0%, #E0F2FE 100%)',
                  boxShadow: '0 12px 30px -8px rgba(11, 66, 54, 0.15)',
                  border: '3px solid #FFFFFF'
                }}>
                  <img
                    src={priyaImg}
                    alt="Priya Virtual Clinic Receptionist"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />

                  {/* Restrained Speaking/Listening Aura Overlay */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '50px',
                    background: 'linear-gradient(to top, rgba(11, 66, 54, 0.45) 0%, transparent 100%)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '8px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(255, 255, 255, 0.92)',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: '#0B4236'
                    }}>
                      <Mic size={12} color="#0B4236" />
                      <span>{isSpeakingAudio ? 'Voice Active' : isPlaying ? 'Active Session' : 'Standby'}</span>
                    </div>
                  </div>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0A382E', margin: '0 0 2px 0' }}>
                  Priya (AI Voice Receptionist)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 14px 0' }}>
                  Front-Desk Voice Coordination
                </p>

                {/* Specs Pill List */}
                <div style={{
                  background: '#F1F5F3',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  fontSize: '11px',
                  color: '#3E544F',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Architecture:</span>
                    <strong style={{ color: '#0B4236' }}>CareConnect Clinical Telephony</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Languages:</span>
                    <strong style={{ color: '#0B4236' }}>English, Hindi, Telugu</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Telemetry:</span>
                    <strong style={{ color: '#059669' }}>Real-Time Intent Parsing</strong>
                  </div>
                </div>

              </div>

              {/* Bottom Browser Voice Disclaimer */}
              <div style={{
                marginTop: '16px',
                fontSize: '10px',
                color: '#64748B',
                lineHeight: 1.4,
                padding: '8px',
                background: '#F8FAF9',
                borderRadius: '8px',
                border: '1px solid #E2E8F0'
              }}>
                ℹ️ <strong>Voice Preview:</strong> Audio playback utilizes your browser's speech synthesis engine for interactive demo playback.
              </div>

            </div>

            {/* AREA B: Live Conversation Panel (Columns 5 to 8) */}
            <div style={{
              gridColumn: 'span 5',
              padding: '24px',
              borderRight: '1px solid rgba(11, 66, 54, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: '#FFFFFF'
            }}>
              
              <div>
                
                {/* Header of Conversation Panel */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={17} color="#0B4236" />
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0A382E', margin: 0 }}>
                      Live Conversation Transcript
                    </h4>
                  </div>
                  
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#059669',
                    background: '#DCF2E3',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    Step {Math.min(currentStep, totalMessages)} of {totalMessages}
                  </span>
                </div>

                {/* Chat Scroll Container */}
                <div 
                  ref={chatScrollRef}
                  style={{
                    height: '320px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    paddingRight: '6px'
                  }}
                >
                  {currentStep === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#94A3B8',
                      fontSize: '13px'
                    }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#F1F5F3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px auto'
                      }}>
                        <Play size={20} color="#0B4236" />
                      </div>
                      Click <strong>"Start Demo"</strong> above to begin simulated caller interaction.
                    </div>
                  )}

                  {activeScenario.messages.slice(0, currentStep).map((msg, mIdx) => {
                    const isPriya = msg.speaker === 'Priya';
                    return (
                      <div
                        key={mIdx}
                        style={{
                          alignSelf: isPriya ? 'flex-start' : 'flex-end',
                          maxWidth: '85%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isPriya ? 'flex-start' : 'flex-end',
                          animation: 'popInBubble 0.3s ease-out'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '3px',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: isPriya ? '#0B4236' : '#0369A1'
                        }}>
                          <span>{msg.speaker}</span>
                          <span style={{ color: '#94A3B8', fontWeight: 500 }}>{msg.time}</span>
                        </div>

                        <div style={{
                          padding: '11px 15px',
                          borderRadius: isPriya ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                          background: isPriya ? '#F3F4F6' : '#DCF2E3',
                          color: isPriya ? '#1F2937' : '#0B4236',
                          fontSize: '13px',
                          lineHeight: 1.45,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}

                  {/* Processing / Typing Indicator */}
                  {isProcessing && (
                    <div style={{
                      alignSelf: 'flex-start',
                      padding: '8px 14px',
                      borderRadius: '14px 14px 14px 4px',
                      background: '#F1F5F3',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#0B4236'
                    }}>
                      <span className="pulse-green"></span>
                      <span>Priya is processing intent...</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Equalizer Waveform & Live State Bar */}
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '14px',
                background: '#FAFDFB',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={handleReplayLastPriyaVoice}
                    disabled={currentStep === 0}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#E8F7EC',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#0B4236'
                    }}
                    title="Click to replay voice"
                  >
                    <Mic size={16} />
                  </button>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0B4236' }}>
                    {isSpeakingAudio ? 'Speaking Voice Output' : isPlaying ? 'Simulating Interaction' : 'Interaction Paused'}
                  </span>
                </div>

                {/* CSS Animated Audio Waveform */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '20px' }}>
                  {[6, 14, 20, 10, 18, 22, 14, 8, 18, 12, 16, 6].map((h, i) => (
                    <div
                      key={i}
                      className="waveform-bar-light"
                      style={{
                        height: isSpeakingAudio ? `${h}px` : '4px',
                        background: '#0B4236',
                        animationDelay: `${i * 0.08}s`
                      }}
                    />
                  ))}
                </div>
              </div>

            </div>

            {/* AREA C: Call Activity & Telephony Metadata Panel (Columns 9 to 12) */}
            <div style={{
              gridColumn: 'span 3',
              padding: '24px',
              background: '#F8FAF9',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              
              <div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0A382E', margin: 0 }}>
                    Operational Summary
                  </h4>
                  <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                    Telemetry
                  </span>
                </div>

                {/* Status Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  
                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Enquiry Category
                    </span>
                    <strong style={{ fontSize: '12px', color: '#0B4236' }}>
                      {activeScenario.activity.enquiry}
                    </strong>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Language Detected
                    </span>
                    <strong style={{ fontSize: '12px', color: '#0B4236' }}>
                      {activeScenario.activity.language}
                    </strong>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '10px', color: '#64748B', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                      Staff Follow-Up
                    </span>
                    <strong style={{
                      fontSize: '12px',
                      color: activeScenario.activity.humanFollowup.includes('Required') ? '#D97706' : '#059669'
                    }}>
                      {activeScenario.activity.humanFollowup}
                    </strong>
                  </div>

                  {/* Captured Info Preview Card */}
                  <div style={{
                    background: '#FFFFFF',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '11px',
                    color: '#334155'
                  }}>
                    <div style={{ fontWeight: 800, color: '#0A382E', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} color="#059669" />
                      <span>Captured Request Data</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div><span style={{ color: '#64748B' }}>Patient:</span> <strong>{activeScenario.activity.patientName}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Service:</span> <strong>{activeScenario.activity.specialty}</strong></div>
                      <div><span style={{ color: '#64748B' }}>Slot:</span> <strong>{activeScenario.activity.preferredDate} · {activeScenario.activity.preferredTime}</strong></div>
                      <div style={{
                        marginTop: '4px',
                        padding: '4px 6px',
                        borderRadius: '6px',
                        background: '#DCF2E3',
                        color: '#0B4236',
                        fontWeight: 700,
                        fontSize: '10px'
                      }}>
                        {activeScenario.activity.status}
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Strict Simulation Disclaimer */}
              <div style={{
                padding: '10px',
                borderRadius: '8px',
                background: '#FEF3C7',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                fontSize: '10px',
                color: '#92400E',
                lineHeight: 1.4
              }}>
                ⚠️ <strong>Simulated Demo Data:</strong> No real clinic records were modified and no actual appointment was booked. Real confirmation requires clinical backend integration.
              </div>

            </div>

          </div>

        </div>

        {/* Call-to-Action Bar below the demo */}
        <div style={{
          marginTop: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          padding: '20px 28px',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid rgba(11, 66, 54, 0.1)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)'
        }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0A382E', margin: '0 0 2px 0' }}>
              Ready to automate your clinic reception?
            </h4>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Connect Priya to your clinic line and capture 100% of patient calls with zero wait times.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                handleSelectScenario((activeScenarioIdx + 1) % 3);
                handleStartResume();
              }}
              style={{
                background: '#F1F5F3',
                color: '#0B4236',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>Next Demo Scenario</span>
              <ChevronRight size={15} />
            </button>

            <a
              href="#book-appointment"
              style={{
                background: '#0B4236',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(11, 66, 54, 0.2)'
              }}
            >
              <span>Request a Clinic Demo</span>
              <ArrowRight size={15} />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

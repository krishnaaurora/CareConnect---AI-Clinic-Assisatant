import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Mic, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Phone, 
  Sparkles, 
  User, 
  Globe2, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  ChevronRight, 
  MessageSquare,
  Bot,
  Activity,
  FileText,
  Copy,
  Check,
  PhoneIncoming,
  PhoneOutgoing,
  Radio,
  Sliders
} from 'lucide-react';
import priyaImg from '../assets/priya-avatar.png';
import BackgroundPattern from './common/BackgroundPattern';

export default function LiveCallTranscript({ historicalCalls = [], initialCallId = null }) {
  // Built-in live simulation scenarios powered by Priya Voice AI
  const scenarios = [
    {
      id: 'appointment',
      title: 'Appointment Booking',
      tag: 'Inbound Call #1',
      icon: Calendar,
      phone: '+91 98765 43210',
      caller: 'Ananya Sharma',
      language: 'English (Indian)',
      direction: 'INBOUND',
      sentiment: 'Positive',
      description: 'Patient requests doctor consultation; Priya verifies doctor schedule, slot availability, and locks appointment.',
      messages: [
        { speaker: 'Patient', text: 'Hello, I would like to book an appointment with a doctor.', time: '10:24 AM' },
        { speaker: 'Priya', text: 'Namaste! Welcome to Apex Care Clinic. I am Priya, your voice assistant. Which specialty would you like to consult?', time: '10:24 AM' },
        { speaker: 'Patient', text: 'General Medicine or Cardiology if available.', time: '10:25 AM' },
        { speaker: 'Priya', text: 'Dr. Ramesh Kumar in General Medicine and Dr. Sneha Rao in Cardiology are both on duty today. Which date and time would you prefer?', time: '10:25 AM' },
        { speaker: 'Patient', text: 'Tomorrow morning around 11:30 AM please.', time: '10:25 AM' },
        { speaker: 'Priya', text: 'I have verified that 11:30 AM is open with Dr. Ramesh Kumar. I have reserved your slot and sent the booking confirmation via SMS. Is there anything else I can help with?', time: '10:26 AM' },
        { speaker: 'Patient', text: 'No, that is all. Thank you Priya!', time: '10:26 AM' },
        { speaker: 'Priya', text: 'You are welcome! Have a healthy and wonderful day ahead.', time: '10:26 AM' }
      ],
      activity: {
        enquiry: 'Appointment Booking',
        specialty: 'General Medicine',
        doctor: 'Dr. Ramesh Kumar, MD',
        preferredDate: 'Tomorrow (Verified Slot)',
        preferredTime: '11:30 AM - 11:45 AM',
        patientName: 'Ananya Sharma',
        status: 'Slot Verified & Confirmed',
        humanFollowup: 'Not Required (Automated)',
        callStatus: 'Completed via Sarvam Voice AI'
      }
    },
    {
      id: 'enquiry',
      title: 'Clinic Schedule Enquiry',
      tag: 'Inbound Call #2',
      icon: Clock,
      phone: '+91 98451 22334',
      caller: 'Rajesh Nair',
      language: 'English / Hindi',
      direction: 'INBOUND',
      sentiment: 'Inquiring',
      description: 'Patient inquires about clinic working hours, diagnostic lab timings, and doctor consultation shifts.',
      messages: [
        { speaker: 'Patient', text: 'Hello, could you tell me your clinic opening hours and if the lab is open on Sundays?', time: '02:15 PM' },
        { speaker: 'Priya', text: 'Hello Mr. Nair! Apex Care Clinic is open Monday to Saturday from 08:00 AM to 08:30 PM, and on Sundays from 09:00 AM to 02:00 PM.', time: '02:15 PM' },
        { speaker: 'Patient', text: 'And what about blood sample collection for fasting tests?', time: '02:16 PM' },
        { speaker: 'Priya', text: 'Our NABL-accredited diagnostic lab starts fasting sample collections at 07:30 AM every morning. No prior appointment is needed for routine blood tests.', time: '02:16 PM' },
        { speaker: 'Patient', text: 'Great, thanks for the clear information.', time: '02:17 PM' },
        { speaker: 'Priya', text: 'My pleasure! Please reach out if you have any questions.', time: '02:17 PM' }
      ],
      activity: {
        enquiry: 'Operating Hours & Lab Schedule',
        specialty: 'Diagnostic Laboratory & OPD',
        doctor: 'Pathology Center',
        preferredDate: 'Monday - Sunday Schedule',
        preferredTime: '08:00 AM - 08:30 PM',
        patientName: 'Rajesh Nair',
        status: 'Self-Service Information Handled',
        humanFollowup: 'None Required',
        callStatus: 'Resolved Successfully'
      }
    },
    {
      id: 'diagnostic_report',
      title: 'Diagnostic Report Delivery',
      tag: 'Outbound Alert',
      icon: FileText,
      phone: '+91 97412 88990',
      caller: 'Kavita Sundaram',
      language: 'English',
      direction: 'OUTBOUND',
      sentiment: 'Positive',
      description: 'Outbound automated alert notifying patient that pathology test results are signed and ready for WhatsApp/portal download.',
      messages: [
        { speaker: 'Priya', text: 'Hello Ms. Kavita! This is Priya calling from Apex Care Clinic regarding your recent diagnostic tests.', time: '04:10 PM' },
        { speaker: 'Patient', text: 'Oh hello Priya! Are my thyroid and lipid panel results ready?', time: '04:10 PM' },
        { speaker: 'Priya', text: 'Yes, both reports have been verified and signed off by Dr. Ramesh Kumar. We have dispatched a secure download link directly to your WhatsApp and SMS.', time: '04:11 PM' },
        { speaker: 'Patient', text: 'Wonderful! Did the doctor add any notes regarding medication changes?', time: '04:11 PM' },
        { speaker: 'Priya', text: 'Dr. Ramesh noted all values are within healthy limits and recommended continuing your current regimen. Would you like me to book a follow-up consultation?', time: '04:12 PM' },
        { speaker: 'Patient', text: 'No follow-up needed right now, thank you so much!', time: '04:12 PM' },
        { speaker: 'Priya', text: 'You are very welcome! Take care and stay well.', time: '04:12 PM' }
      ],
      activity: {
        enquiry: 'Diagnostic Lab Report Notification',
        specialty: 'Pathology & Endocrinology',
        doctor: 'Dr. Ramesh Kumar (Reviewing Physician)',
        preferredDate: 'Report Dispatched Today',
        preferredTime: 'Instant Digital Delivery',
        patientName: 'Kavita Sundaram',
        status: 'Delivered via WhatsApp & Portal',
        humanFollowup: 'No Escalation Required',
        callStatus: 'Outbound Notification Completed'
      }
    },
    {
      id: 'callback',
      title: 'Emergency Front-Desk Triage',
      tag: 'Inbound Handoff',
      icon: Phone,
      phone: '+91 99001 55667',
      caller: 'Vikram Patel',
      language: 'English',
      direction: 'INBOUND',
      sentiment: 'Urgent',
      description: 'Patient has post-procedure questions; Priya captures clinical urgency and routes immediate callback ticket to reception desk.',
      messages: [
        { speaker: 'Patient', text: 'Hi, I had a tooth extraction this morning and the bleeding has not completely stopped. Can I talk to the doctor?', time: '05:30 PM' },
        { speaker: 'Priya', text: 'I understand this is concerning, Mr. Patel. Please apply firm pressure with clean sterile gauze for 20 minutes without rinsing.', time: '05:30 PM' },
        { speaker: 'Patient', text: 'Okay, but I really need the doctor to confirm if I should come back.', time: '05:31 PM' },
        { speaker: 'Priya', text: 'I am alerting Dr. Pooja and our clinical team immediately with high priority. Our duty nurse will call you on this number within 5 minutes. If bleeding is heavy, please proceed to our emergency triage.', time: '05:31 PM' },
        { speaker: 'Patient', text: 'Thank you, I will wait by my phone.', time: '05:32 PM' }
      ],
      activity: {
        enquiry: 'Post-Op Complication Handoff',
        specialty: 'Dental Surgery Triage',
        doctor: 'Dr. Pooja Hegde (Duty Dentist)',
        preferredDate: 'Immediate Urgent Ticket',
        preferredTime: '< 5 Minutes Priority Queue',
        patientName: 'Vikram Patel',
        status: 'Escalated to Clinical Staff',
        humanFollowup: 'Immediate Action Required',
        callStatus: 'Queued for Front Desk Handoff'
      }
    }
  ];

  // State management
  const [selectedCallSource, setSelectedCallSource] = useState('live_stream'); // 'live_stream' | 'historical'
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedHistoricalCall, setSelectedHistoricalCall] = useState(null);
  
  // Playback state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1 or 1.25
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const transcriptScrollRef = useRef(null);
  const timerRef = useRef(null);

  // Active call representation
  const activeScenario = scenarios[activeScenarioIdx];

  // If a historical call was selected or passed
  useEffect(() => {
    if (initialCallId && historicalCalls.length > 0) {
      const match = historicalCalls.find(c => c.call_id === initialCallId);
      if (match) {
        setSelectedHistoricalCall(match);
        setSelectedCallSource('historical');
      }
    }
  }, [initialCallId, historicalCalls]);

  // Determine current conversation items
  const currentMessages = selectedCallSource === 'live_stream' 
    ? activeScenario.messages 
    : (selectedHistoricalCall?.transcript_dialogue || [
        { speaker: 'Patient', text: selectedHistoricalCall?.summary || 'Patient called clinic.', time: '09:00 AM' },
        { speaker: 'Priya', text: `Apex Care Clinic Priya AI assisted. Call status: ${selectedHistoricalCall?.status || 'Resolved'}.`, time: '09:01 AM' }
      ]);

  const visibleMessages = currentMessages.slice(0, currentStep);
  const isFinished = currentStep >= currentMessages.length;

  // Speech synthesis
  const speakText = (text, speaker) => {
    if (!audioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = speaker === 'Priya' ? 1.05 * playbackSpeed : 1.0 * playbackSpeed;
      utterance.pitch = speaker === 'Priya' ? 1.15 : 0.95;
      
      const voices = window.speechSynthesis.getVoices();
      if (speaker === 'Priya') {
        const femaleVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google UK English Female') || v.name.includes('Zira') || v.lang.includes('en-IN')));
        if (femaleVoice) utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  // Stream progression logic
  useEffect(() => {
    if (isPlaying && currentStep < currentMessages.length) {
      setIsProcessing(true);
      const nextMsg = currentMessages[currentStep];
      const delay = currentStep === 0 ? 500 : 2200 / playbackSpeed;

      timerRef.current = setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(prev => prev + 1);
        speakText(nextMsg.text, nextMsg.speaker);
      }, delay);
    } else if (currentStep >= currentMessages.length) {
      setIsPlaying(false);
      setIsProcessing(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, currentMessages.length, playbackSpeed]);

  // Auto-scroll transcript container
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [currentStep, isProcessing]);

  // Handlers
  const handlePlay = () => {
    if (currentStep >= currentMessages.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleReset = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setCurrentStep(0);
  };

  const handleToggleAudio = () => {
    if (audioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleCopyTranscript = () => {
    const text = currentMessages.map(m => `[${m.time}] ${m.speaker}: ${m.text}`).join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleSelectScenario = (idx) => {
    handleReset();
    setActiveScenarioIdx(idx);
    setSelectedCallSource('live_stream');
    setTimeout(() => {
      setIsPlaying(true);
    }, 250);
  };

  const handleSelectHistorical = (call) => {
    handleReset();
    setSelectedHistoricalCall(call);
    setSelectedCallSource('historical');
    // Pre-load all messages or start playback
    setCurrentStep(call.transcript_dialogue ? call.transcript_dialogue.length : 2);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── Top Control Bar: Source Switcher & Live Indicators ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px 24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#EDFDF9',
            border: '1px solid rgba(0, 201, 167, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00C9A7'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0A2520', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Live Call Transcript & Voice Audio Stream
              </h2>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                fontSize: '11px',
                fontWeight: 900,
                letterSpacing: '0.04em'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                  animation: 'pulseDot 1.5s infinite'
                }} />
                LIVE AUDIO
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
              Turn-by-turn conversational streaming between Priya (Sarvam Multilingual Voice AI) and clinic patients.
            </p>
          </div>
        </div>

        {/* Source Toggle: Live Simulation vs Saved Records */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedCallSource('live_stream');
              handleReset();
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              border: selectedCallSource === 'live_stream' ? '1px solid #00C9A7' : '1px solid #CBD5E1',
              backgroundColor: selectedCallSource === 'live_stream' ? '#EDFDF9' : '#FFFFFF',
              color: selectedCallSource === 'live_stream' ? '#0F5B4C' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Radio size={14} color={selectedCallSource === 'live_stream' ? '#00C9A7' : '#94A3B8'} />
            <span>Interactive Live Stream</span>
          </button>

          {historicalCalls.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedCallSource === 'historical' ? (selectedHistoricalCall?.call_id || '') : ''}
                onChange={(e) => {
                  const call = historicalCalls.find(c => c.call_id === e.target.value);
                  if (call) handleSelectHistorical(call);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  border: selectedCallSource === 'historical' ? '1px solid #00C9A7' : '1px solid #CBD5E1',
                  backgroundColor: selectedCallSource === 'historical' ? '#EDFDF9' : '#FFFFFF',
                  color: selectedCallSource === 'historical' ? '#0F5B4C' : '#64748B',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Inspect Saved Call ({historicalCalls.length} logs)...</option>
                {historicalCalls.map(c => (
                  <option key={c.call_id} value={c.call_id}>
                    {c.call_id} – {c.caller_name || 'Caller'} ({c.call_purpose || 'General'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Scenario Selection Chips (When in Live Stream mode) ── */}
      {selectedCallSource === 'live_stream' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px'
        }}>
          {scenarios.map((sc, idx) => {
            const isSelected = activeScenarioIdx === idx;
            const IconComp = sc.icon;
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(idx)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  backgroundColor: isSelected ? '#EDFDF9' : '#FFFFFF',
                  border: isSelected ? '2px solid #00C9A7' : '1px solid #E2E8F0',
                  boxShadow: isSelected ? '0 4px 12px rgba(0, 201, 167, 0.12)' : '0 1px 4px rgba(0, 0, 0, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: isSelected ? '#0F5B4C' : '#64748B',
                    textTransform: 'uppercase'
                  }}>
                    <IconComp size={14} color={isSelected ? '#00C9A7' : '#94A3B8'} />
                    <span>{sc.tag}</span>
                  </div>
                  {isSelected && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#00C9A7',
                      boxShadow: '0 0 8px #00C9A7'
                    }} />
                  )}
                </div>
                <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14px', marginBottom: '3px' }}>
                  {sc.title}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.3 }}>
                  Caller: <strong>{sc.caller}</strong> ({sc.sentiment})
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Main Dual-Panel: Left = Live Audio & Transcript, Right = Real-time Intent & Clinical Extraction ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 360px',
        gap: '20px',
        alignItems: 'start'
      }}>
        
        {/* Left Panel: Stream Player & Dialogue */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* Stream Header & Active Call Metadata */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#0A2520',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #00C9A7',
                backgroundColor: '#0F5B4C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={priyaImg} alt="Priya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px' }}>
                    {selectedCallSource === 'live_stream' ? activeScenario.title : (selectedHistoricalCall?.call_purpose || 'Historical Call Transcript')}
                  </span>
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 201, 167, 0.2)',
                    color: '#00C9A7',
                    fontSize: '11px',
                    fontWeight: 800,
                    fontFamily: 'monospace'
                  }}>
                    {selectedCallSource === 'live_stream' ? `SESSION-${activeScenario.id.toUpperCase()}` : selectedHistoricalCall?.call_id}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <span>Caller: <strong style={{ color: '#E2E8F0' }}>{selectedCallSource === 'live_stream' ? activeScenario.caller : (selectedHistoricalCall?.caller_name || 'Patient')}</strong></span>
                  <span>·</span>
                  <span>{selectedCallSource === 'live_stream' ? activeScenario.phone : selectedHistoricalCall?.caller_phone}</span>
                  <span>·</span>
                  <span style={{ color: '#00C9A7' }}>Sarvam AI Engine</span>
                </div>
              </div>
            </div>

            {/* Audio Waveform Equalizer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px', padding: '0 8px' }}>
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.85, 0.5, 0.95, 0.4].map((scale, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: isSpeaking ? `${Math.max(4, scale * 22)}px` : '4px',
                    backgroundColor: isSpeaking ? '#00C9A7' : '#334155',
                    borderRadius: '2px',
                    transition: 'height 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Audio Controls Bar */}
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={handlePlay}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Play size={14} fill="#FFFFFF" />
                  <span>{currentStep === 0 ? 'Start Voice Stream' : isFinished ? 'Replay Stream' : 'Resume'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#B45309',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Pause size={14} fill="#FFFFFF" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                title="Reset Transcript"
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleToggleAudio}
                title={audioEnabled ? 'Mute Speech Synthesizer' : 'Enable Voice Audio'}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  backgroundColor: audioEnabled ? '#EDFDF9' : '#FFFFFF',
                  color: audioEnabled ? '#0F5B4C' : '#94A3B8',
                  border: audioEnabled ? '1px solid #00C9A7' : '1px solid #CBD5E1',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {audioEnabled ? <Volume2 size={13} color="#00C9A7" /> : <VolumeX size={13} />}
                <span>{audioEnabled ? 'Audio On' : 'Muted'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 1.25 : 1)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  border: '1px solid #CBD5E1',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {playbackSpeed}x Speed
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                Turns: <strong>{currentStep}</strong> / {currentMessages.length}
              </span>
              <button
                type="button"
                onClick={handleCopyTranscript}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #CBD5E1',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {copiedText ? <Check size={12} color="#00C9A7" /> : <Copy size={12} />}
                <span>{copiedText ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Turn-by-Turn Transcript Messages Container */}
          <div
            ref={transcriptScrollRef}
            style={{
              padding: '24px',
              minHeight: '380px',
              maxHeight: '480px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#FAFAF9'
            }}
          >
            {visibleMessages.length === 0 && !isProcessing && (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#64748B'
              }}>
                <Bot size={36} color="#00C9A7" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '15px' }}>
                  Voice Stream Ready
                </div>
                <div style={{ fontSize: '13px', marginTop: '4px', maxWidth: '360px', margin: '4px auto 0' }}>
                  Click <strong>Start Voice Stream</strong> above to begin Priya's live turn-by-turn conversational speech transcription.
                </div>
              </div>
            )}

            {visibleMessages.map((msg, index) => {
              const isPriya = msg.speaker === 'Priya' || msg.speaker === 'Assistant';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    flexDirection: isPriya ? 'row' : 'row-reverse',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  {/* Speaker Avatar */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: isPriya ? '#0F5B4C' : '#E2E8F0',
                    color: isPriya ? '#00C9A7' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {isPriya ? (
                      <img src={priyaImg} alt="Priya" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={16} />
                    )}
                  </div>

                  {/* Speech Bubble */}
                  <div style={{
                    maxWidth: '75%',
                    backgroundColor: isPriya ? '#FFFFFF' : '#0F5B4C',
                    color: isPriya ? '#0A2520' : '#FFFFFF',
                    padding: '12px 16px',
                    borderRadius: isPriya ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                    border: isPriya ? '1px solid #E2E8F0' : 'none',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      marginBottom: '4px',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: isPriya ? '#00C9A7' : '#A7F3D0'
                    }}>
                      <span>{isPriya ? 'Priya (Sarvam Voice AI)' : (selectedCallSource === 'live_stream' ? activeScenario.caller : 'Patient')}</span>
                      <span style={{ fontWeight: 600, color: isPriya ? '#94A3B8' : 'rgba(255, 255, 255, 0.7)' }}>
                        {msg.time}
                      </span>
                    </div>

                    <div style={{ fontSize: '13.5px', lineHeight: 1.5 }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Typing / Speech Indicator */}
            {isProcessing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', color: '#007A65', fontSize: '12px', fontWeight: 700 }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#00C9A7',
                  animation: 'pulseDot 1s infinite'
                }} />
                <span>Transcribing incoming speech packet...</span>
              </div>
            )}
          </div>

          {/* Transcript Footer */}
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            fontSize: '12px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#00C9A7" />
              <span>Full compliance: Telephony audio encrypted with HIPAA & NABH standards</span>
            </div>
            {isFinished && (
              <span style={{ color: '#0F5B4C', fontWeight: 800 }}>
                ✓ Conversation Ended
              </span>
            )}
          </div>
        </div>

        {/* Right Panel: Real-Time Intent & Clinical Entity Extraction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '12px',
              borderBottom: '1px solid #F1F5F9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#00C9A7" />
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0A2520', margin: 0 }}>
                  Real-Time AI Extraction
                </h3>
              </div>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#EDFDF9',
                color: '#007A65'
              }}>
                LIVE SYNC
              </span>
            </div>

            {selectedCallSource === 'live_stream' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Detected Intent
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                    {activeScenario.activity.enquiry}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Target Department / Service
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F5B4C', marginTop: '2px' }}>
                    {activeScenario.activity.specialty}
                  </div>
                </div>

                {activeScenario.activity.doctor && (
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                      Assigned Physician
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2520', marginTop: '2px' }}>
                      {activeScenario.activity.doctor}
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px'
                }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700 }}>DATE</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                      {activeScenario.activity.preferredDate}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700 }}>SLOT</div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F5B4C', marginTop: '2px' }}>
                      {activeScenario.activity.preferredTime}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Caller Sentiment
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: activeScenario.sentiment === 'Urgent' ? '#FEE2E2' : '#EDFDF9',
                      color: activeScenario.sentiment === 'Urgent' ? '#DC2626' : '#007A65'
                    }}>
                      {activeScenario.sentiment}
                    </span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Resolution Outcome
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginTop: '2px' }}>
                    {activeScenario.activity.status}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Handoff: <strong>{activeScenario.activity.humanFollowup}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Call Purpose
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                    {selectedHistoricalCall?.call_purpose || 'General OPD Inquiry'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Duration & Direction
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F5B4C', marginTop: '2px' }}>
                    {selectedHistoricalCall?.duration || '1m 30s'} · {selectedHistoricalCall?.call_type || 'INBOUND'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    AI Summary
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4, marginTop: '2px' }}>
                    {selectedHistoricalCall?.summary || 'Dialogue processed by Priya Voice AI.'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Outcome Status
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 800,
                      backgroundColor: selectedHistoricalCall?.outcome === 'FAILED' ? '#FEE2E2' : '#EDFDF9',
                      color: selectedHistoricalCall?.outcome === 'FAILED' ? '#DC2626' : '#007A65'
                    }}>
                      {selectedHistoricalCall?.outcome || 'COMPLETED'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Voice AI Capabilities Banner */}
          <div style={{
            backgroundColor: '#0F5B4C',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            boxShadow: '0 2px 10px rgba(15, 91, 76, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Bot size={16} color="#00C9A7" />
              <div style={{ fontWeight: 800, fontSize: '13.5px' }}>Priya Speech Architecture</div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#A7F3D0', lineHeight: 1.6 }}>
              <li>Multilingual Hindi, English, Kannada, Tamil support</li>
              <li>Real-time MongoDB doctor availability verification</li>
              <li>Instant slot locking without double-booking</li>
              <li>Automated front-desk handoff on urgent triage</li>
            </ul>
          </div>

        </div>

      </div>

      {/* End Z-Index Wrapper */}
      </div>
    </div>
  );
}


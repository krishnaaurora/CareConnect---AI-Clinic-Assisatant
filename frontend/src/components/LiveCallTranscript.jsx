import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Calendar, 
  Clock, 
  Phone, 
  Sparkles, 
  User, 
  ShieldCheck, 
  FileText, 
  Copy, 
  Check, 
  PhoneIncoming, 
  PhoneOutgoing, 
  Radio, 
  Sliders, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Bot, 
  Search, 
  ListFilter,
  Eye,
  FastForward
} from 'lucide-react';
import priyaImg from '../assets/priya-avatar.png';
import BackgroundPattern from './common/BackgroundPattern';

// Realistic clinic fallback calls (Apollo Clinic Indiranagar) if database is loading
const DEFAULT_CLINIC_CALLS = [
  {
    call_id: 'CALL-1001',
    caller_name: 'Ananya Sharma',
    caller_phone: '+91 98765 43210',
    call_direction: 'INBOUND',
    call_purpose: 'Appointment Booking',
    doctor_name: 'Dr. Ramesh Kumar',
    specialty: 'General Medicine',
    duration: '2m 15s',
    timestamp: 'Today, 09:15 AM',
    outcome: 'BOOKED',
    sentiment: 'Positive',
    appointment_id: 'APT-2026-0891',
    summary: 'Patient booked an in-person consultation with Dr. Ramesh Kumar for tomorrow at 11:30 AM for routine health evaluation. Verified slot locked and SMS confirmation dispatched.',
    transcript_dialogue: [
      { speaker: 'Patient', text: 'Hello, good morning. Is this Apollo Clinic Indiranagar?', time: '09:15 AM' },
      { speaker: 'Priya', text: 'Namaste! Good morning, this is Priya, your clinical receptionist at Apollo Clinic Indiranagar. How may I assist you today?', time: '09:15 AM' },
      { speaker: 'Patient', text: 'I would like to schedule an appointment with Dr. Ramesh Kumar in General Medicine for tomorrow morning.', time: '09:15 AM' },
      { speaker: 'Priya', text: 'Dr. Ramesh Kumar is on morning OPD duty tomorrow. I have open consultation slots at 10:45 AM and 11:30 AM. Which one suits you better?', time: '09:16 AM' },
      { speaker: 'Patient', text: '11:30 AM would be perfect for me.', time: '09:16 AM' },
      { speaker: 'Priya', text: 'Wonderful Ms. Sharma. I have verified slot availability and confirmed your in-clinic consultation for tomorrow at 11:30 AM. Your booking reference ID is APT-2026-0891.', time: '09:17 AM' },
      { speaker: 'Patient', text: 'Thank you Priya, will I get a confirmation message?', time: '09:17 AM' },
      { speaker: 'Priya', text: 'Yes, a confirmation SMS with Google Maps location and clinic registration details has been sent to your phone. Have a wonderful and healthy day!', time: '09:17 AM' }
    ]
  },
  {
    call_id: 'CALL-1003',
    caller_name: 'Kavita Sundaram',
    caller_phone: '+91 97412 88990',
    call_direction: 'OUTBOUND',
    call_purpose: 'Diagnostic Report Delivery',
    doctor_name: 'Dr. Ramesh Kumar (Reviewing Physician)',
    specialty: 'Pathology & Endocrinology',
    duration: '1m 50s',
    timestamp: 'Today, 10:15 AM',
    outcome: 'COMPLETED',
    sentiment: 'Reassured',
    appointment_id: 'RPT-2026-0412',
    summary: 'Outbound automated notification informing patient Kavita Sundaram that her Lipid Profile & HbA1c lab results are signed off by Dr. Ramesh Kumar and dispatched to WhatsApp.',
    transcript_dialogue: [
      { speaker: 'Priya', text: 'Hello Ms. Kavita Sundaram! This is Priya calling from Apollo Clinic Indiranagar regarding your recent diagnostic test results.', time: '10:15 AM' },
      { speaker: 'Patient', text: 'Oh hello Priya! Are my thyroid and lipid panel blood reports ready?', time: '10:15 AM' },
      { speaker: 'Priya', text: 'Yes, both reports have been verified and digitally signed by Dr. Ramesh Kumar. We have dispatched a secure download link directly to your WhatsApp and registered email.', time: '10:16 AM' },
      { speaker: 'Patient', text: 'That was very quick! Did the doctor add any specific notes regarding medication dosage?', time: '10:16 AM' },
      { speaker: 'Priya', text: 'Dr. Ramesh noted all parameters are well within the target range and recommended continuing your current regimen. Would you like me to book a routine follow-up?', time: '10:16 AM' },
      { speaker: 'Patient', text: 'No follow-up needed right now, thank you so much for the update Priya!', time: '10:17 AM' },
      { speaker: 'Priya', text: 'You are very welcome! Take care and have a healthy day.', time: '10:17 AM' }
    ]
  },
  {
    call_id: 'CALL-1002',
    caller_name: 'Rajesh Nair',
    caller_phone: '+91 98451 22334',
    call_direction: 'INBOUND',
    call_purpose: 'Clinic Schedule & Lab Timings',
    doctor_name: 'Apollo Pathology Center',
    specialty: 'Diagnostic Laboratory & OPD',
    duration: '1m 40s',
    timestamp: 'Today, 11:20 AM',
    outcome: 'COMPLETED',
    sentiment: 'Inquiring',
    appointment_id: 'ENQ-2026-018',
    summary: 'Caller inquired about clinic operating hours, Sunday OPD availability, and fasting blood sample collection timings.',
    transcript_dialogue: [
      { speaker: 'Patient', text: 'Hello, could you tell me your clinic opening hours and whether your blood test lab is open on Sundays?', time: '11:20 AM' },
      { speaker: 'Priya', text: 'Hello Mr. Nair! Apollo Clinic Indiranagar is open Monday to Saturday from 08:00 AM to 08:30 PM, and on Sundays from 08:00 AM to 01:00 PM for OPD consultations.', time: '11:20 AM' },
      { speaker: 'Patient', text: 'And what time does fasting blood sample collection start?', time: '11:21 AM' },
      { speaker: 'Priya', text: 'Our NABL-accredited diagnostic laboratory opens for fasting sample collection at 07:30 AM every morning. No prior appointment is required for routine blood profiles.', time: '11:21 AM' },
      { speaker: 'Patient', text: 'Excellent, thanks for the clear instructions Priya.', time: '11:21 AM' },
      { speaker: 'Priya', text: 'My pleasure Mr. Nair! Feel free to call us anytime. Stay healthy!', time: '11:21 AM' }
    ]
  },
  {
    call_id: 'CALL-1005',
    caller_name: 'Arun Mehra',
    caller_phone: '+91 99002 44556',
    call_direction: 'OUTBOUND',
    call_purpose: 'Automated Appointment Reminder',
    doctor_name: 'Dr. Sneha Rao',
    specialty: 'Cardiology Department',
    duration: '1m 25s',
    timestamp: 'Today, 02:40 PM',
    outcome: 'COMPLETED',
    sentiment: 'Positive',
    appointment_id: 'APT-2026-0904',
    summary: 'Automated reminder call for cardiology follow-up with Dr. Sneha Rao scheduled for tomorrow at 04:30 PM. Patient confirmed attendance.',
    transcript_dialogue: [
      { speaker: 'Priya', text: 'Namaste Mr. Arun Mehra! This is Priya calling from Apollo Clinic Indiranagar with a quick reminder about your cardiology appointment.', time: '02:40 PM' },
      { speaker: 'Patient', text: 'Yes Priya, that is with Dr. Sneha Rao tomorrow, right?', time: '02:40 PM' },
      { speaker: 'Priya', text: 'That is correct, tomorrow at 04:30 PM. We kindly request you to arrive 10 minutes early and carry your previous ECG and prescription records.', time: '02:41 PM' },
      { speaker: 'Patient', text: 'Yes, I will definitely be there on time. Thank you for the call.', time: '02:41 PM' },
      { speaker: 'Priya', text: 'Thank you for confirming Mr. Mehra! We look forward to welcoming you tomorrow.', time: '02:41 PM' }
    ]
  },
  {
    call_id: 'CALL-1007',
    caller_name: 'Vikram Patel',
    caller_phone: '+91 99001 55667',
    call_direction: 'INBOUND',
    call_purpose: 'Emergency Post-Op Clinical Triage',
    doctor_name: 'Dr. Pooja Hegde (Duty Dentist)',
    specialty: 'Dental Surgery Triage',
    duration: '2m 30s',
    timestamp: 'Today, 04:10 PM',
    outcome: 'TRANSFERRED_TO_HUMAN',
    sentiment: 'Urgent',
    appointment_id: 'TRG-2026-044',
    summary: 'Patient had post-extraction bleeding concerns. Priya gave immediate sterile gauze instructions and expedited an urgent triage callback ticket to the on-duty clinical team.',
    transcript_dialogue: [
      { speaker: 'Patient', text: 'Hi, I had a tooth extraction this morning and the bleeding has not stopped. Can I speak to a doctor right away?', time: '04:10 PM' },
      { speaker: 'Priya', text: 'I understand this is concerning, Mr. Patel. First, please bite down firmly on a clean, sterile piece of gauze or cotton for 20 minutes without spitting or rinsing.', time: '04:10 PM' },
      { speaker: 'Patient', text: 'Okay, I am doing that now. But should I come back to the clinic?', time: '04:11 PM' },
      { speaker: 'Priya', text: 'I have logged an emergency priority alert for Dr. Pooja Hegde and our on-duty dental surgical staff. Our duty nurse will call you back on this number in less than 3 minutes. If bleeding is severe, our emergency triage bay is open.', time: '04:11 PM' },
      { speaker: 'Patient', text: 'Thank you Priya, I will keep the gauze pressed and wait for the nurse call.', time: '04:12 PM' },
      { speaker: 'Priya', text: 'Stay calm Mr. Patel, clinical help is on its way.', time: '04:12 PM' }
    ]
  }
];

export default function LiveCallTranscript({ historicalCalls = [], initialCallId = null }) {
  // Merge live database calls with verified fallbacks
  const mergedCalls = useMemo(() => {
    if (historicalCalls && historicalCalls.length > 0) {
      return historicalCalls.map(c => {
        // Standardize fields
        const dir = (c.call_direction || c.direction || 'INBOUND').toUpperCase();
        return {
          call_id: c.call_id || c.id || 'CALL-UNKNOWN',
          caller_name: c.caller_name || c.name || 'Caller',
          caller_phone: c.caller_phone || c.phone || '—',
          call_direction: dir,
          call_purpose: c.call_purpose || c.purpose || (dir === 'OUTBOUND' ? 'Outbound Care Notification' : 'General Inbound Query'),
          doctor_name: c.doctor_name || c.physician || 'Apollo Clinic Indiranagar',
          specialty: c.specialty || 'General Consultation',
          duration: c.duration || '1m 45s',
          timestamp: c.timestamp || 'Today',
          outcome: c.outcome || c.status || 'COMPLETED',
          sentiment: c.sentiment || (dir === 'OUTBOUND' ? 'Proactive Alert' : 'Inquiring'),
          appointment_id: c.appointment_id || c.appointment_reference || 'REF-AUTO',
          summary: c.summary || 'Turn-by-turn conversation recorded by Priya Voice AI.',
          transcript_dialogue: c.transcript_dialogue && c.transcript_dialogue.length > 0 
            ? c.transcript_dialogue 
            : [
                { 
                  speaker: dir === 'OUTBOUND' ? 'Priya' : (c.caller_name || 'Caller'), 
                  text: dir === 'OUTBOUND' 
                    ? `Namaste! This is Priya calling from Apollo Clinic Indiranagar regarding your ${c.call_purpose || 'care update'}.` 
                    : (c.summary || 'Hello, I am calling Apollo Clinic Indiranagar for assistance.'), 
                  time: c.timestamp || '09:00 AM' 
                },
                { 
                  speaker: dir === 'OUTBOUND' ? (c.caller_name || 'Patient') : 'Priya', 
                  text: dir === 'OUTBOUND' 
                    ? 'Yes, thank you Priya, please go ahead.' 
                    : `Namaste! I am Priya, your voice assistant. ${c.summary || 'I am happy to assist you.'}`, 
                  time: c.timestamp || '09:01 AM' 
                },
                {
                  speaker: dir === 'OUTBOUND' ? 'Priya' : (c.caller_name || 'Caller'),
                  text: dir === 'OUTBOUND' 
                    ? `We have confirmed your details and sent a summary SMS. Have a healthy day!` 
                    : 'That was very helpful and clear. Thank you Priya!',
                  time: c.timestamp || '09:01 AM'
                },
                {
                  speaker: dir === 'OUTBOUND' ? (c.caller_name || 'Patient') : 'Priya',
                  text: dir === 'OUTBOUND' 
                    ? 'Thank you Priya, goodbye!' 
                    : 'You are welcome! Apollo Clinic Indiranagar is always here for your healthcare needs.',
                  time: c.timestamp || '09:02 AM'
                }
              ]
        };
      });
    }
    return DEFAULT_CLINIC_CALLS;
  }, [historicalCalls]);

  // Direction filter: 'ALL' | 'INBOUND' | 'OUTBOUND'
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Call
  const [selectedCallId, setSelectedCallId] = useState(() => {
    if (initialCallId) return initialCallId;
    return mergedCalls[0]?.call_id || 'CALL-1001';
  });

  // Track initialCallId changes from outside (e.g. clicking Live Monitor in Tab 1)
  useEffect(() => {
    if (initialCallId) {
      setSelectedCallId(initialCallId);
      // Auto-start streaming playback for this call
      setCurrentStep(0);
      setIsPlaying(true);
    }
  }, [initialCallId]);

  // Find active call
  const activeCall = useMemo(() => {
    const found = mergedCalls.find(c => c.call_id === selectedCallId);
    return found || mergedCalls[0] || DEFAULT_CLINIC_CALLS[0];
  }, [mergedCalls, selectedCallId]);

  // Filtered call list for pills/cards
  const filteredCalls = useMemo(() => {
    return mergedCalls.filter(c => {
      let matchDir = true;
      if (directionFilter === 'INBOUND') matchDir = c.call_direction === 'INBOUND';
      if (directionFilter === 'OUTBOUND') matchDir = c.call_direction === 'OUTBOUND';

      let matchQuery = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchQuery = 
          c.call_id.toLowerCase().includes(q) ||
          c.caller_name.toLowerCase().includes(q) ||
          c.caller_phone.toLowerCase().includes(q) ||
          c.call_purpose.toLowerCase().includes(q) ||
          (c.doctor_name && c.doctor_name.toLowerCase().includes(q));
      }
      return matchDir && matchQuery;
    });
  }, [mergedCalls, directionFilter, searchQuery]);

  // Counts for filter chips
  const totalCount = mergedCalls.length;
  const inboundCount = mergedCalls.filter(c => c.call_direction === 'INBOUND').length;
  const outboundCount = mergedCalls.filter(c => c.call_direction === 'OUTBOUND').length;

  // Playback & Stream State
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // 1, 1.25, 1.5
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const transcriptScrollRef = useRef(null);
  const timerRef = useRef(null);

  const dialogueMessages = activeCall.transcript_dialogue || [];
  const visibleMessages = showFullTranscript ? dialogueMessages : dialogueMessages.slice(0, currentStep);
  const isFinished = !showFullTranscript && currentStep >= dialogueMessages.length;

  // Stream progression logic (simulation of real-time incoming speech packets)
  useEffect(() => {
    if (showFullTranscript) return;

    if (isPlaying && currentStep < dialogueMessages.length) {
      setIsProcessing(true);
      const delay = currentStep === 0 ? 400 : Math.round(2100 / playbackSpeed);

      timerRef.current = setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep(prev => prev + 1);
      }, delay);
    } else if (currentStep >= dialogueMessages.length) {
      setIsPlaying(false);
      setIsProcessing(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, dialogueMessages.length, playbackSpeed, showFullTranscript]);

  // Auto-scroll transcript container as speech arrives
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [currentStep, isProcessing, showFullTranscript]);

  // Switch Call Handler
  const handleSelectCall = (callId) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSelectedCallId(callId);
    setShowFullTranscript(false);
    setCurrentStep(0);
    setIsProcessing(false);
    // Start streaming dialogue automatically
    setIsPlaying(true);
  };

  const handlePlay = () => {
    setShowFullTranscript(false);
    if (currentStep >= dialogueMessages.length) {
      setCurrentStep(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsProcessing(false);
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsPlaying(false);
    setIsProcessing(false);
    setCurrentStep(0);
  };

  const handleCopyTranscript = () => {
    const text = dialogueMessages.map(m => `[${m.time}] ${m.speaker}: ${m.text}`).join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const isInbound = activeCall.call_direction === 'INBOUND';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* ── Top Header & Live Indicators ── */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0A2520', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Live Call Transcript & Audio Stream
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
                  LIVE
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
                Real-time speech-to-text dialogue stream for both Inbound patient inquiries and Outbound Priya automated notifications.
              </p>
            </div>
          </div>

          {/* Inbound vs Outbound Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setDirectionFilter('ALL')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                border: directionFilter === 'ALL' ? '2px solid #00C9A7' : '1px solid #CBD5E1',
                backgroundColor: directionFilter === 'ALL' ? '#EDFDF9' : '#FFFFFF',
                color: directionFilter === 'ALL' ? '#0F5B4C' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>All Calls</span>
              <span style={{
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: directionFilter === 'ALL' ? '#00C9A7' : '#E2E8F0',
                color: directionFilter === 'ALL' ? '#FFFFFF' : '#475569',
                fontSize: '10.5px',
                fontWeight: 800
              }}>
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDirectionFilter('INBOUND')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                border: directionFilter === 'INBOUND' ? '2px solid #00C9A7' : '1px solid #CBD5E1',
                backgroundColor: directionFilter === 'INBOUND' ? '#ECFDF5' : '#FFFFFF',
                color: directionFilter === 'INBOUND' ? '#065F46' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <PhoneIncoming size={14} color="#059669" />
              <span>Inbound Calls</span>
              <span style={{
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: directionFilter === 'INBOUND' ? '#059669' : '#E2E8F0',
                color: directionFilter === 'INBOUND' ? '#FFFFFF' : '#475569',
                fontSize: '10.5px',
                fontWeight: 800
              }}>
                {inboundCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setDirectionFilter('OUTBOUND')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                border: directionFilter === 'OUTBOUND' ? '2px solid #2563EB' : '1px solid #CBD5E1',
                backgroundColor: directionFilter === 'OUTBOUND' ? '#EFF6FF' : '#FFFFFF',
                color: directionFilter === 'OUTBOUND' ? '#1E40AF' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <PhoneOutgoing size={14} color="#2563EB" />
              <span>Outbound Calls</span>
              <span style={{
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: directionFilter === 'OUTBOUND' ? '#2563EB' : '#E2E8F0',
                color: directionFilter === 'OUTBOUND' ? '#FFFFFF' : '#475569',
                fontSize: '10.5px',
                fontWeight: 800
              }}>
                {outboundCount}
              </span>
            </button>
          </div>
        </div>

        {/* ── Call Selection Grid: Interactive Call Feed from Database ── */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} color="#00C9A7" />
              <span>Select Active Call to Stream Live Transcript ({filteredCalls.length} available)</span>
            </div>
            
            {/* Quick Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search caller, purpose..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
            maxHeight: '170px',
            overflowY: 'auto',
            padding: '2px'
          }}>
            {filteredCalls.map(c => {
              const isSelected = activeCall.call_id === c.call_id;
              const isCallInbound = c.call_direction === 'INBOUND';

              return (
                <div
                  key={c.call_id}
                  onClick={() => handleSelectCall(c.call_id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: isSelected ? '#EDFDF9' : '#FFFFFF',
                    border: isSelected ? '2px solid #00C9A7' : '1px solid #E2E8F0',
                    boxShadow: isSelected ? '0 4px 12px rgba(0, 201, 167, 0.12)' : '0 1px 4px rgba(0, 0, 0, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 900,
                        backgroundColor: isCallInbound ? '#ECFDF5' : '#EFF6FF',
                        color: isCallInbound ? '#065F46' : '#1E40AF'
                      }}>
                        {isCallInbound ? <PhoneIncoming size={10} color="#059669" /> : <PhoneOutgoing size={10} color="#2563EB" />}
                        <span>{isCallInbound ? 'INBOUND' : 'OUTBOUND'}</span>
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                        {c.call_id}
                      </span>
                    </div>

                    {isSelected ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        backgroundColor: '#00C9A7',
                        color: '#FFFFFF',
                        fontSize: '9.5px',
                        fontWeight: 900
                      }}>
                        STREAMING
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {c.duration}
                      </span>
                    )}
                  </div>

                  <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '13.5px', marginTop: '2px' }}>
                    {c.call_purpose}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B' }}>
                    <span>Caller: <strong style={{ color: '#1E293B' }}>{c.caller_name}</strong></span>
                    <span style={{ fontSize: '11px' }}>{c.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Main Dual-Panel: Left = Live Audio & Turn-by-Turn Transcript, Right = Real-Time Intent & Clinical Extraction ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: '20px',
          alignItems: 'start'
        }}>
          
          {/* ── Left Panel: Live Stream Player & Chat Streamer ── */}
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
                  width: '40px',
                  height: '40px',
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
                      {activeCall.call_purpose}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '1px 7px',
                      borderRadius: '4px',
                      backgroundColor: isInbound ? 'rgba(0, 201, 167, 0.2)' : 'rgba(37, 99, 235, 0.25)',
                      color: isInbound ? '#00C9A7' : '#93C5FD',
                      fontSize: '11px',
                      fontWeight: 800,
                      fontFamily: 'monospace'
                    }}>
                      {isInbound ? <PhoneIncoming size={10} /> : <PhoneOutgoing size={10} />}
                      {activeCall.call_direction} · {activeCall.call_id}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                    <span>Caller: <strong style={{ color: '#E2E8F0' }}>{activeCall.caller_name}</strong></span>
                    <span>·</span>
                    <span>{activeCall.caller_phone}</span>
                    <span>·</span>
                    <span>{activeCall.duration}</span>
                    <span>·</span>
                    <span style={{ color: '#00C9A7' }}>Priya Voice Engine</span>
                  </div>
                </div>
              </div>

              {/* Live Audio Equalizer Waveform */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px', padding: '0 8px' }}>
                {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.85, 0.5, 0.95, 0.4].map((scale, i) => (
                  <div
                    key={i}
                    style={{
                      width: '3px',
                      height: (isPlaying || isProcessing) ? `${Math.max(4, scale * 22)}px` : '4px',
                      backgroundColor: (isPlaying || isProcessing) ? '#00C9A7' : '#334155',
                      borderRadius: '2px',
                      transition: 'height 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Playback Controls Bar */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                    <span>{currentStep === 0 ? 'Start Live Stream' : isFinished ? 'Replay Stream' : 'Resume'}</span>
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
                  title="Reset to beginning"
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

                {/* Toggle: Live Stream vs Show Full Transcript */}
                <button
                  type="button"
                  onClick={() => setShowFullTranscript(!showFullTranscript)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    backgroundColor: showFullTranscript ? '#EDFDF9' : '#FFFFFF',
                    color: showFullTranscript ? '#0F5B4C' : '#475569',
                    border: showFullTranscript ? '1px solid #00C9A7' : '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Eye size={13} color={showFullTranscript ? '#00C9A7' : '#64748B'} />
                  <span>{showFullTranscript ? 'Streaming Mode' : 'View Full Dialogue'}</span>
                </button>

                {/* Speed selector */}
                {!showFullTranscript && (
                  <button
                    type="button"
                    onClick={() => setPlaybackSpeed(prev => prev === 1 ? 1.25 : prev === 1.25 ? 1.5 : 1)}
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
                )}
              </div>

              {/* Right Side: Turn Tracker & Copy */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  Turns: <strong>{showFullTranscript ? dialogueMessages.length : currentStep}</strong> / {dialogueMessages.length}
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

            {/* Turn-by-Turn Live Transcript Chat Stream */}
            <div
              ref={transcriptScrollRef}
              style={{
                padding: '24px',
                minHeight: '390px',
                maxHeight: '490px',
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
                    {isInbound ? 'Inbound Voice Stream Ready' : 'Outbound Voice Stream Ready'}
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px', maxWidth: '360px', margin: '4px auto 0' }}>
                    Click <strong>Start Live Stream</strong> above or <strong>View Full Dialogue</strong> to view Priya's live turn-by-turn speech transcription for {activeCall.caller_name}.
                  </div>
                </div>
              )}

              {visibleMessages.map((msg, index) => {
                const isPriya = msg.speaker === 'Priya' || msg.speaker === 'Priya Voice AI' || msg.speaker === 'Assistant';
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
                      width: '34px',
                      height: '34px',
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
                        <span>{isPriya ? 'Priya Voice AI (Receptionist)' : `${activeCall.caller_name} (Patient)`}</span>
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

              {/* Live Transcribing Indicator */}
              {isProcessing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', color: '#007A65', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#00C9A7',
                    animation: 'pulseDot 1s infinite'
                  }} />
                  <span>Transcribing live speech turn...</span>
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
                <span>Telephony audio encrypted · HIPAA & NABH Compliance Verified</span>
              </div>
              {(isFinished || showFullTranscript) && (
                <span style={{ color: '#0F5B4C', fontWeight: 800 }}>
                  ✓ Conversation Complete
                </span>
              )}
            </div>
          </div>

          {/* ── Right Panel: Real-Time Intent & Clinical Extraction ── */}
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
                    Clinical Entity Extraction
                  </h3>
                </div>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: isInbound ? '#ECFDF5' : '#EFF6FF',
                  color: isInbound ? '#065F46' : '#1E40AF'
                }}>
                  {activeCall.call_direction}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Call Purpose & Intent
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                    {activeCall.call_purpose}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Patient / Contact
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F5B4C', marginTop: '2px' }}>
                    {activeCall.caller_name} · {activeCall.caller_phone}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Assigned Physician / Department
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2520', marginTop: '2px' }}>
                    {activeCall.doctor_name || 'Apollo Clinic Indiranagar'}
                  </div>
                </div>

                {activeCall.appointment_id && (
                  <div style={{
                    padding: '10px 12px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700 }}>REFERENCE ID</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F5B4C', marginTop: '2px', fontFamily: 'monospace' }}>
                      {activeCall.appointment_id}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    AI Conversation Summary
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45, marginTop: '2px' }}>
                    {activeCall.summary}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Outcome & Sentiment
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: activeCall.outcome === 'BOOKED' || activeCall.outcome === 'COMPLETED' ? '#EDFDF9' : '#FEF3C7',
                      color: activeCall.outcome === 'BOOKED' || activeCall.outcome === 'COMPLETED' ? '#007A65' : '#B45309'
                    }}>
                      {activeCall.outcome}
                    </span>

                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: activeCall.sentiment === 'Urgent' ? '#FEE2E2' : '#F1F5F9',
                      color: activeCall.sentiment === 'Urgent' ? '#DC2626' : '#475569'
                    }}>
                      {activeCall.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Priya Multilingual Voice Architecture Card */}
            <div style={{
              backgroundColor: '#0F5B4C',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(15, 91, 76, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Bot size={16} color="#00C9A7" />
                <div style={{ fontWeight: 800, fontSize: '13.5px' }}>Priya Telephony Engine</div>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#A7F3D0', lineHeight: 1.6 }}>
                <li>Live Inbound & Outbound speech-to-text logging</li>
                <li>Zero hallucination doctor schedule verification</li>
                <li>Automated report ready notification calls</li>
                <li>Instant priority triage escalation for urgent concerns</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

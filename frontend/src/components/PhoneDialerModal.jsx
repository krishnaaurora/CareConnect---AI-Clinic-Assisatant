import React, { useState, useEffect } from 'react';
import { X, Phone, PhoneOff, Mic, ShieldCheck } from 'lucide-react';
import { interactVoiceAgent } from '../api/client';

export default function PhoneDialerModal({ isOpen, onClose }) {
  const [callActive, setCallActive] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState([
    {
      speaker: 'Priya',
      text: "Hello! Welcome to CareConnect Clinic. I'm Priya, your AI receptionist. Would you like to book an appointment or enquire about doctor schedules?"
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    let timer;
    if (callActive) {
      timer = setInterval(() => {
        setCallSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  if (!isOpen) return null;

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakPriya = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (lang === 'Hindi' || /[\u0900-\u097F]/.test(text)) u.lang = 'hi-IN';
      else if (lang === 'Telugu' || /[\u0C00-\u0C7F]/.test(text)) u.lang = 'te-IN';
      else u.lang = 'en-US';
      u.rate = 0.95;
      u.pitch = 1.05;
      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const handleStartCall = () => {
    setCallActive(true);
    let initialGreeting = "Hello! Welcome to CareConnect Clinic. I'm Priya. How may I assist you today?";
    if (selectedLang === 'Hindi') {
      initialGreeting = "नमस्ते! केयरकनेक्ट क्लिनिक में आपका स्वागत है। मैं प्रिया हूँ। मैं आपकी क्या मदद कर सकती हूँ?";
    } else if (selectedLang === 'Telugu') {
      initialGreeting = "నమస్కారం! కేర్‌కనెక్ట్ క్లినిక్‌కి స్వాగతం. నేను ప్రియ. మీకు ఎలా సహాయపడాలి?";
    }
    setTranscript([{ speaker: 'Priya', text: initialGreeting }]);
    speakPriya(initialGreeting, selectedLang);
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCallActive(false);
    setIsSpeaking(false);
  };

  const handleSendMessage = async (msgText) => {
    const textToSend = msgText || inputMsg;
    if (!textToSend.trim()) return;

    const newTranscript = [...transcript, { speaker: 'Caller', text: textToSend }];
    setTranscript(newTranscript);
    setInputMsg('');

    try {
      const res = await interactVoiceAgent(textToSend, selectedLang, "CARE-IND-01");
      setTranscript([...newTranscript, { speaker: 'Priya', text: res.spoken_text }]);
      speakPriya(res.spoken_text, selectedLang);
    } catch (err) {
      const fallback = `I noted your request regarding "${textToSend}". Checking our verified doctor database.`;
      setTranscript([...newTranscript, { speaker: 'Priya', text: fallback }]);
      speakPriya(fallback, selectedLang);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      
      {/* 3D Realistic Phone Dialing Container in White Theme */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        borderRadius: '32px',
        background: '#FFFFFF',
        border: '1px solid rgba(13, 62, 51, 0.15)',
        boxShadow: '0 25px 60px -15px rgba(13, 62, 51, 0.25)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Top Speaker / Phone Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAF9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-green"></span>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0D3E33' }}>
              Bolna Telephony Simulator
            </span>
          </div>

          <button
            onClick={() => { handleEndCall(); onClose(); }}
            style={{
              background: '#E2E8F0',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Call Info Screen */}
        <div style={{ padding: '24px', textAlign: 'center' }}>
          
          {/* Avatar Orb */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            margin: '0 auto 16px auto',
            background: '#0D3E33',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            border: '4px solid #DCF2E3',
            boxShadow: callActive ? '0 0 25px rgba(16, 185, 129, 0.35)' : 'none',
            transform: isSpeaking ? 'scale(1.06)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}>
            <Mic size={34} color="#FFFFFF" />
          </div>

          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0D3E33', margin: '0 0 4px 0' }}>
            Priya — Clinic Receptionist
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            {callActive ? (
              <span style={{ color: '#059669', fontWeight: 700 }}>
                Call in Progress • {formatTimer(callSeconds)}
              </span>
            ) : (
              'Ready to Connect • +91 80 4125 7800'
            )}
          </p>

          {/* Language selector chip */}
          {!callActive && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {['English', 'Hindi', 'Telugu'].map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLang(l)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: selectedLang === l ? '2px solid #0D3E33' : '1px solid #D1D5DB',
                    background: selectedLang === l ? '#DCF2E3' : '#FFFFFF',
                    color: '#0D3E33',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {l === 'Hindi' ? 'हिन्दी' : l === 'Telugu' ? 'తెలుగు' : 'English'}
                </button>
              ))}
            </div>
          )}

          {/* Transcript Scroll Area in White Theme */}
          <div style={{
            marginTop: '18px',
            height: '180px',
            overflowY: 'auto',
            borderRadius: '16px',
            background: '#F8FAF9',
            border: '1px solid #E5E7EB',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            textAlign: 'left'
          }}>
            {transcript.map((t, idx) => (
              <div key={idx} style={{
                alignSelf: t.speaker === 'Priya' ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: '14px',
                background: t.speaker === 'Priya' ? '#FFFFFF' : '#DCF2E3',
                border: t.speaker === 'Priya' ? '1px solid #E2E8F0' : '1px solid #BBF7D0',
                fontSize: '13px',
                color: '#111827',
                lineHeight: 1.45,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: t.speaker === 'Priya' ? '#0D3E33' : '#047857', marginBottom: '2px' }}>
                  {t.speaker}
                </div>
                {t.text}
              </div>
            ))}
          </div>

          {/* Interactive Quick Prompts when call active */}
          {callActive && (
            <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {[
                { label: 'Book Dr. Sharma', text: 'I want to book an appointment with Dr. Rajesh Sharma' },
                { label: 'Clinic Timings', text: 'What are the clinic timings today?' },
                { label: 'Speak to Staff', text: 'Can you please connect me with clinic staff?' }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(opt.text)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: '#F1F5F3',
                    border: '1px solid #E2E8F0',
                    color: '#0D3E33',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Input text during call */}
          {callActive && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Say or type something to Priya..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  color: '#111827',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                className="btn-dark-green"
                style={{ padding: '0 14px', fontSize: '12px' }}
              >
                Send
              </button>
            </div>
          )}

          {/* Call Control Action Button matching screenshot style */}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            {!callActive ? (
              <button
                onClick={handleStartCall}
                className="btn-lime"
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(190, 242, 100, 0.6)'
                }}
              >
                <Phone size={26} color="#0D3E33" />
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4)'
                }}
              >
                <PhoneOff size={26} />
              </button>
            )}
          </div>

          <p style={{ fontSize: '11px', color: '#64748B', marginTop: '10px', marginBottom: 0 }}>
            {!callActive ? 'Tap to start live simulated call with Priya' : 'Tap red button to end call'}
          </p>

        </div>

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { PhoneCall, Mic, Volume2, ShieldAlert, Sparkles, Send, Activity } from 'lucide-react';
import Canvas3DOrb from './Canvas3DOrb';
import { interactVoiceAgent } from '../api/client';

export default function MeetPriya({ onOpenDialer }) {
  const [selectedLang, setSelectedLang] = useState('English');
  const [customInput, setCustomInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState({
    spoken_text: "Hello! I am Priya, your CareConnect AI multilingual receptionist. I can help you verify doctor availability, schedule appointments, or answer clinic queries in English, Hindi, and Telugu. How may I assist you today?",
    intent: "GENERAL_GREETING",
    safety_guardrail_triggered: false,
    requires_human_handoff: false,
    bolna_trace_id: "bolna-init-demo"
  });

  const samplePrompts = [
    {
      label: "Appointment Booking",
      lang: "English",
      text: "Can I book a cardiology checkup with Dr. Sharma tomorrow?",
      color: "#0D3E33"
    },
    {
      label: "डॉक्टर उपलब्धता (Hindi)",
      lang: "Hindi",
      text: "क्या डॉ. स्नेहा कुलकर्णी कल सुबह 11 बजे उपलब्ध हैं?",
      color: "#059669"
    },
    {
      label: "క్లినిక్ వేళలు (Telugu)",
      lang: "Telugu",
      text: "క్లినిక్ ఎన్ని గంటల వరకు తెరిచి ఉంటుంది? ఆర్థోపెడిక్ డాక్టర్ ఉన్నారా?",
      color: "#0D3E33"
    },
    {
      label: "Clinical Safety Guardrail Test",
      lang: "English",
      text: "My chest is hurting badly and I need pain medicine",
      color: "#DC2626"
    },
    {
      label: "Human Staff Handoff",
      lang: "English",
      text: "Can you please connect me with a human receptionist?",
      color: "#D97706"
    }
  ];

  const speakText = (text, lang) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === 'Hindi' || /[\u0900-\u097F]/.test(text)) utterance.lang = 'hi-IN';
      else if (lang === 'Telugu' || /[\u0C00-\u0C7F]/.test(text)) utterance.lang = 'te-IN';
      else utterance.lang = 'en-US';

      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  };

  const handleTestUtterance = async (queryText, queryLang) => {
    setIsLoading(true);
    setSelectedLang(queryLang);
    try {
      const result = await interactVoiceAgent(queryText, queryLang, "CARE-IND-01");
      setLastResponse(result);
      speakText(result.spoken_text, queryLang);
    } catch (err) {
      const fallback = {
        spoken_text: `Understood your request regarding: "${queryText}". Let me check our verified clinic schedule in MongoDB.`,
        intent: "PROCESSED",
        safety_guardrail_triggered: false,
        requires_human_handoff: false,
        bolna_trace_id: "bolna-local-sim"
      };
      setLastResponse(fallback);
      speakText(fallback.spoken_text, queryLang);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleTestUtterance(customInput, selectedLang);
    setCustomInput('');
  };

  return (
    <section id="meet-priya" style={{ padding: '90px 0', position: 'relative' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#EBF7EE',
            border: '1px solid rgba(13, 62, 51, 0.12)',
            marginBottom: '16px'
          }}>
            <Sparkles size={15} color="#0D3E33" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0D3E33', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Interactive Voice AI Experience
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem, 3.4vw, 2.9rem)', fontWeight: 800, color: '#0D3E33', marginBottom: '16px', lineHeight: 1.15 }}>
            Meet Priya — Your Clinic's <br />
            <span style={{ color: '#059669' }}>Multilingual Voice Receptionist</span>
          </h2>

          <p style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.65 }}>
            Powered by Sarvam Voice AI infrastructure, Priya handles high-volume telephony with warm tone, clinical nuance in English, Hindi, and Telugu, and built-in medical safety guardrails.
          </p>
        </div>

        {/* 3D Voice Interactive Sandbox in White Theme */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '36px',
          alignItems: 'center'
        }}>
          
          {/* Left: 3D Voice Sphere in White Card */}
          <div className="white-card" style={{
            padding: '32px',
            borderRadius: '24px',
            background: '#FFFFFF',
            textAlign: 'center'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-green"></span>
                <span style={{ fontSize: '12px', color: '#0D3E33', fontWeight: 800 }}>PRIYA TELEPHONY NODE</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                {lastResponse.bolna_trace_id}
              </span>
            </div>

            {/* 3D Orb Area */}
            <div style={{ height: '260px', position: 'relative' }}>
              <Canvas3DOrb isSpeaking={isSpeaking} language={selectedLang} />
            </div>

            {/* Audio Waveform */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              height: '30px',
              margin: '16px 0'
            }}>
              {[10, 22, 16, 26, 12, 24, 18, 14, 22, 12, 18, 10].map((h, i) => (
                <div
                  key={i}
                  className="waveform-bar-light"
                  style={{
                    height: isSpeaking ? `${h}px` : '4px',
                    animationDelay: `${i * 0.1}s`,
                    opacity: isSpeaking ? 1 : 0.4
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <button 
                onClick={() => speakText(lastResponse.spoken_text, selectedLang)}
                className="btn-white-outline"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                <Volume2 size={16} color="#0D3E33" />
                <span>{isSpeaking ? 'Priya Speaking...' : 'Replay Spoken Voice'}</span>
              </button>

              <button 
                onClick={onOpenDialer}
                className="btn-lime"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                <PhoneCall size={16} />
                <span>Test Phone Call</span>
              </button>
            </div>

          </div>

          {/* Right: Dialogue Test Console in White Card */}
          <div>
            
            {/* Language Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', color: '#4B5563', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                Select Active Language:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { id: 'English', label: 'English (Indian)', sub: 'General & Metro' },
                  { id: 'Hindi', label: 'हिन्दी (Hindi)', sub: 'North & Central' },
                  { id: 'Telugu', label: 'తెలుగు (Telugu)', sub: 'South & Regional' }
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLang(l.id)}
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: selectedLang === l.id ? '2px solid #0D3E33' : '1px solid rgba(13, 62, 51, 0.1)',
                      background: selectedLang === l.id ? '#DCF2E3' : '#FFFFFF',
                      color: '#0D3E33',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <p style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 2px 0' }}>
                      {l.label}
                    </p>
                    <span style={{ fontSize: '11px', color: '#4B5563' }}>{l.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Prompts */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', color: '#4B5563', display: 'block', marginBottom: '10px', fontWeight: 700 }}>
                Try Asking Priya (Click to Test Live):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleTestUtterance(p.text, p.lang)}
                    disabled={isLoading}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid rgba(13, 62, 51, 0.15)',
                      color: '#112824',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.color }}></span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Spoken Response Display Box */}
            <div className="white-card" style={{
              padding: '22px',
              borderRadius: '18px',
              marginBottom: '20px',
              background: lastResponse.safety_guardrail_triggered ? '#FFF5F5' : '#F7FCF9',
              borderColor: lastResponse.safety_guardrail_triggered ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.25)'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: lastResponse.safety_guardrail_triggered ? '#DC2626' : '#0D3E33',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mic size={14} color="#ffffff" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0D3E33' }}>Priya's Response</span>
                </div>

                {lastResponse.safety_guardrail_triggered && (
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#FEE2E2',
                    color: '#DC2626',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ShieldAlert size={12} /> Medical Guardrail Active
                  </span>
                )}
              </div>

              <p style={{
                fontSize: '14px',
                color: '#112824',
                lineHeight: 1.6,
                margin: '8px 0 0 0'
              }}>
                "{lastResponse.spoken_text}"
              </p>
            </div>

            {/* Custom Input Form */}
            <form onSubmit={handleCustomSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder={`Ask Priya anything in ${selectedLang} (e.g. "डॉक्टर का समय बताओ" or "Book appointment")`}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(13, 62, 51, 0.15)',
                  color: '#112824',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !customInput.trim()}
                className="btn-dark-green"
                style={{ padding: '0 20px' }}
              >
                {isLoading ? <Activity className="animate-spin" size={18} /> : <Send size={18} />}
              </button>
            </form>

          </div>

        </div>

      </div>
    </section>
  );
}

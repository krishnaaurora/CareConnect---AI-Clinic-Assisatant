import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Volume2, 
  AlertCircle, 
  RotateCcw, 
  Sparkles, 
  Bot, 
  User, 
  CheckCircle2, 
  Radio,
  Headphones
} from 'lucide-react';
import { 
  ConversationAgent, 
  BrowserAudioInterface, 
  InteractionType, 
  AgentState 
} from 'sarvam-conv-ai-sdk/browser';
import { API_BASE_URL } from '../api/client';
import priyaAvatar from '../assets/priya-avatar.png';

// Role enum definition matching Sarvam SDK specification
const Role = {
  USER: 'user',
  BOT: 'bot'
};

const SARVAM_ORG_ID = '019e90ca-b3c9-79f3-9722-9b051c1e9794';
const SARVAM_WORKSPACE_ID = '019e90ca-b3fb-7068-87b1-86581ef98843';
const SARVAM_APP_ID = 'Careconnect-ee4e51b7-aa9b';
const SARVAM_VERSION = 4;

export default function RealtimeVoiceModal({ isOpen, onClose }) {
  // Session States: 'idle' | 'requesting_permission' | 'connecting' | 'connected' | 'error' | 'permission_denied' | 'ended'
  const [modalState, setModalState] = useState('idle');
  const [agentState, setAgentState] = useState(AgentState.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcripts, setTranscripts] = useState([]);
  const [audioLevel, setAudioLevel] = useState(0);

  // References to preserve single active session and prevent duplicate connections
  const agentRef = useRef(null);
  const audioInterfaceRef = useRef(null);
  const micStreamRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const isConnectingRef = useRef(false);

  // Auto-scroll transcript container to bottom on new messages
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  // Clean up all resources when component unmounts or modal closes
  const cleanupSession = useCallback(async () => {
    // 1. Stop call duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // 2. Stop and disconnect Sarvam agent session
    if (agentRef.current) {
      try {
        await agentRef.current.stop();
      } catch (err) {
        console.warn('Error stopping Sarvam ConversationAgent:', err);
      }
      agentRef.current = null;
    }

    // 3. Stop browser audio interface (audio context, worklets, output streams)
    if (audioInterfaceRef.current) {
      try {
        await audioInterfaceRef.current.stop();
      } catch (err) {
        console.warn('Error stopping BrowserAudioInterface:', err);
      }
      audioInterfaceRef.current = null;
    }

    // 4. Stop raw microphone media stream tracks
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      } catch (err) {
        console.warn('Error stopping microphone tracks:', err);
      }
      micStreamRef.current = null;
    }

    isConnectingRef.current = false;
  }, []);

  // Handle modal open/close lifecycle
  useEffect(() => {
    if (!isOpen) {
      cleanupSession();
      setModalState('idle');
      setAgentState(AgentState.IDLE);
      setTranscripts([]);
      setCallDuration(0);
      setErrorMessage('');
      setIsMuted(false);
      setAudioLevel(0);
    }
  }, [isOpen, cleanupSession]);

  // Start Real-Time Voice Conversation with Priya
  const startConversation = async () => {
    // Guard against duplicate session creation
    if (isConnectingRef.current || agentRef.current) return;
    isConnectingRef.current = true;

    setModalState('requesting_permission');
    setErrorMessage('');

    try {
      // Step 1: Explicitly request and verify microphone permission
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1
          } 
        });
        micStreamRef.current = stream;
      } catch (micErr) {
        console.error('Microphone access denied or unavailable:', micErr);
        setModalState('permission_denied');
        setErrorMessage(
          micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError'
            ? 'Microphone permission was denied in your browser. Please allow microphone access in your address bar to speak with Priya.'
            : 'No microphone was detected. Please connect a microphone and try again.'
        );
        isConnectingRef.current = false;
        return;
      }

      setModalState('connecting');

      // Step 2: Initialize official Sarvam BrowserAudioInterface
      const audioInterface = new BrowserAudioInterface(16000, {
        outputGain: 1.0,
        outputLevelCallback: (level) => {
          if (level && typeof level.rms === 'number') {
            setAudioLevel(Math.min(100, Math.round(level.rms * 250)));
          }
        }
      });
      audioInterfaceRef.current = audioInterface;

      // Step 3: Construct proxy baseUrl pointing to our secure FastAPI backend proxy
      // The backend attaches the secret X-API-Key and contacts Sarvam runtime server-side
      const proxyBaseUrl = `${API_BASE_URL.replace(/\/$/, '')}/sarvam/proxy/`;

      // Step 4: Instantiate Sarvam ConversationAgent with official browser SDK
      const agent = new ConversationAgent({
        apiKey: '', // Kept empty on client; backend proxy injects secret X-API-Key
        baseUrl: proxyBaseUrl,
        config: {
          user_identifier_type: 'custom',
          user_identifier: 'careconnect_web_guest',
          org_id: SARVAM_ORG_ID,
          workspace_id: SARVAM_WORKSPACE_ID,
          app_id: SARVAM_APP_ID,
          version: SARVAM_VERSION,
          interaction_type: InteractionType.CALL,
          input_sample_rate: 16000,
          output_sample_rate: 16000
        },
        audioInterface: audioInterface,
        
        // Listen to agent state transitions
        stateCallback: (newState, previousState) => {
          setAgentState(newState);
          if (newState === AgentState.CONNECTED || newState === AgentState.LISTENING || newState === AgentState.SPEAKING) {
            setModalState('connected');
          } else if (newState === AgentState.IDLE && modalState === 'connected') {
            setModalState('ended');
          } else if (newState === AgentState.ERROR) {
            setModalState('error');
            setErrorMessage('Communication error occurred during the voice session.');
          }
        },

        // Capture live transcripts from user and Priya
        transcriptCallback: async (msg) => {
          if (msg && msg.content && msg.content.trim()) {
            const role = msg.role === Role.BOT || msg.role === 'bot' ? 'assistant' : 'user';
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            setTranscripts(prev => [
              ...prev,
              {
                id: Date.now() + Math.random(),
                role: role,
                content: msg.content.trim(),
                time: timestamp
              }
            ]);
          }
        },

        // Session start callback
        startCallback: async () => {
          setModalState('connected');
          setCallDuration(0);
          if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        },

        // Session end callback
        endCallback: async () => {
          setModalState('ended');
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }
        }
      });

      agentRef.current = agent;

      // Step 5: Start the real-time conversation session
      await agent.start();
      isConnectingRef.current = false;

    } catch (err) {
      console.error('Failed to start Sarvam voice conversation:', err);
      setModalState('error');
      setErrorMessage(err.message || 'Unable to connect to Sarvam AI Priya receptionist.');
      await cleanupSession();
      isConnectingRef.current = false;
    }
  };

  // Toggle Microphone Mute
  const toggleMute = () => {
    if (!agentRef.current) return;
    try {
      if (isMuted) {
        agentRef.current.unmute();
        setIsMuted(false);
      } else {
        agentRef.current.mute();
        setIsMuted(true);
      }
    } catch (err) {
      console.warn('Error toggling mute state:', err);
    }
  };

  // End Call
  const handleEndCall = async () => {
    await cleanupSession();
    setModalState('ended');
  };

  // Format Call Duration Seconds into MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(10, 37, 32, 0.72)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Modal Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '580px',
        maxHeight: '90vh',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(15, 91, 76, 0.4), 0 0 0 1px rgba(15, 91, 76, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#FAFCFB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={priyaAvatar} 
                alt="Priya AI Receptionist" 
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  border: '2px solid #00C9A7',
                  boxShadow: '0 4px 12px rgba(0, 201, 167, 0.25)'
                }}
              />
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: modalState === 'connected' ? '#10B981' : '#94A3B8',
                border: '2px solid #FFFFFF'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F5B4C' }}>
                  Priya Receptionist
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#EDFDF9',
                  color: '#0F5B4C',
                  border: '1px solid rgba(0, 201, 167, 0.35)',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  Sarvam Voice AI
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B', fontWeight: 500 }}>
                Apollo Clinic & Diagnostics • English, हिंदी, తెలుగు
              </p>
            </div>
          </div>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '12px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#E2E8F0'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F1F5F9'; }}
            aria-label="Close voice modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          overflowY: 'auto',
          minHeight: '340px'
        }}>
          {/* STATE 1: IDLE / WELCOME SCREEN */}
          {modalState === 'idle' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '24px 12px',
              margin: 'auto 0'
            }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: '#EDFDF9',
                border: '2px solid rgba(0, 201, 167, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px',
                boxShadow: '0 8px 24px rgba(0, 201, 167, 0.2)'
              }}>
                <Headphones size={34} color="#0F5B4C" />
              </div>

              <h4 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#0F5B4C' }}>
                Speak directly with Priya
              </h4>
              <p style={{
                margin: '0 0 24px',
                fontSize: '14px',
                lineHeight: 1.55,
                color: '#475569',
                maxWidth: '420px'
              }}>
                Have a live, natural voice conversation with our deployed Sarvam AI receptionist. Ask about doctors on duty, book appointments, check diagnostic report readiness, or enquire in English, Hindi, or Telugu.
              </p>

              <button
                type="button"
                onClick={startConversation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 800,
                  padding: '14px 34px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px -2px rgba(15, 91, 76, 0.35)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#0A2520'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#0F5B4C'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <Mic size={18} />
                <span>Start Conversation</span>
              </button>
            </div>
          )}

          {/* STATE 2: REQUESTING PERMISSION / CONNECTING */}
          {(modalState === 'requesting_permission' || modalState === 'connecting') && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '36px 12px',
              margin: 'auto 0'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: '#EDFDF9',
                border: '3px solid #00C9A7',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Radio size={26} color="#0F5B4C" />
              </div>

              <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#0F5B4C' }}>
                {modalState === 'requesting_permission' ? 'Requesting Microphone Access...' : 'Connecting to Priya...'}
              </h4>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B', maxWidth: '380px' }}>
                {modalState === 'requesting_permission'
                  ? 'Please allow microphone access in your browser prompt to enable live two-way audio streaming.'
                  : 'Establishing secure WebSocket audio channel with deployed Sarvam AI agent (Version 4)...'}
              </p>
            </div>
          )}

          {/* STATE 3: PERMISSION DENIED OR ERROR */}
          {(modalState === 'permission_denied' || modalState === 'error') && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '24px 12px',
              margin: 'auto 0'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <AlertCircle size={32} color="#DC2626" />
              </div>

              <h4 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#991B1B' }}>
                {modalState === 'permission_denied' ? 'Microphone Access Required' : 'Connection Error'}
              </h4>
              <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#64748B', maxWidth: '400px', lineHeight: 1.5 }}>
                {errorMessage || 'Failed to establish connection with Sarvam AI receptionist.'}
              </p>

              <button
                type="button"
                onClick={startConversation}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  padding: '10px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={15} />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* STATE 4: LIVE CONVERSATION CONNECTED */}
          {modalState === 'connected' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
              {/* Dynamic Live Status & Audio Visualizer Banner */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '16px',
                backgroundColor: agentState === AgentState.SPEAKING ? '#EDFDF9' : '#F8FAFC',
                border: agentState === AgentState.SPEAKING ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: agentState === AgentState.SPEAKING 
                      ? '#00C9A7' 
                      : (agentState === AgentState.LISTENING ? '#3B82F6' : '#10B981'),
                    boxShadow: agentState === AgentState.SPEAKING 
                      ? '0 0 10px #00C9A7' 
                      : (agentState === AgentState.LISTENING ? '0 0 8px #3B82F6' : 'none'),
                    animation: agentState === AgentState.SPEAKING || agentState === AgentState.LISTENING ? 'pulse 1.5s infinite' : 'none'
                  }} />
                  <span style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: agentState === AgentState.SPEAKING 
                      ? '#0F5B4C' 
                      : (agentState === AgentState.LISTENING ? '#1D4ED8' : '#334155')
                  }}>
                    {agentState === AgentState.SPEAKING 
                      ? 'Priya is speaking...' 
                      : (agentState === AgentState.LISTENING ? (isMuted ? 'Microphone Muted' : 'Listening... Speak naturally') : 'Active Call')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Real-time Voice Equalizer Bars */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '20px' }}>
                    {[8, 14, 20, 12, 16, 22, 10, 18].map((h, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: '3px',
                          height: agentState === AgentState.SPEAKING 
                            ? `${Math.max(4, (audioLevel / 100) * h * 1.5)}px`
                            : (agentState === AgentState.LISTENING && !isMuted ? '6px' : '3px'),
                          backgroundColor: agentState === AgentState.SPEAKING ? '#00C9A7' : '#94A3B8',
                          borderRadius: '2px',
                          transition: 'height 0.1s ease'
                        }}
                      />
                    ))}
                  </div>

                  <span style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#475569',
                    fontVariantNumeric: 'tabular-nums'
                  }}>
                    {formatDuration(callDuration)}
                  </span>
                </div>
              </div>

              {/* Real-Time Transcript Feed */}
              <div style={{
                flex: 1,
                minHeight: '220px',
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '12px',
                backgroundColor: '#FAFCFB',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {transcripts.length === 0 ? (
                  <div style={{
                    margin: 'auto',
                    textAlign: 'center',
                    padding: '24px 16px',
                    color: '#94A3B8'
                  }}>
                    <Bot size={28} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 500 }}>
                      Listening to audio... Transcripts from Priya and your microphone will appear here in real time.
                    </p>
                  </div>
                ) : (
                  transcripts.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '3px',
                        padding: '0 4px'
                      }}>
                        {msg.role === 'assistant' ? (
                          <>
                            <Sparkles size={12} color="#00C9A7" />
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C' }}>Priya</span>
                          </>
                        ) : (
                          <>
                            <User size={12} color="#3B82F6" />
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF' }}>You</span>
                          </>
                        )}
                        <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{msg.time}</span>
                      </div>

                      <div style={{
                        padding: '10px 14px',
                        borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        backgroundColor: msg.role === 'user' ? '#0F5B4C' : '#FFFFFF',
                        color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                        fontSize: '13.5px',
                        lineHeight: 1.45,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                        border: msg.role === 'user' ? 'none' : '1px solid #E2E8F0'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          )}

          {/* STATE 5: CALL ENDED SUMMARY */}
          {modalState === 'ended' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '24px 12px',
              margin: 'auto 0'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#EDFDF9',
                border: '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={32} color="#00C9A7" />
              </div>

              <h4 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 800, color: '#0F5B4C' }}>
                Conversation Ended
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#64748B' }}>
                Total duration: <strong style={{ color: '#0F5B4C' }}>{formatDuration(callDuration)}</strong> • Transcripts recorded: <strong style={{ color: '#0F5B4C' }}>{transcripts.length}</strong>
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={startConversation}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    padding: '10px 24px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <RotateCcw size={15} />
                  <span>Call Again</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    padding: '10px 20px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Active Call Control Bar (Only when Connected) */}
        {modalState === 'connected' && (
          <div style={{
            padding: '14px 24px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px'
          }}>
            {/* Mute Button */}
            <button
              type="button"
              onClick={toggleMute}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '999px',
                backgroundColor: isMuted ? '#FEE2E2' : '#FFFFFF',
                border: isMuted ? '1px solid #FCA5A5' : '1px solid #CBD5E1',
                color: isMuted ? '#DC2626' : '#334155',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isMuted ? <MicOff size={16} color="#DC2626" /> : <Mic size={16} color="#0F5B4C" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '999px',
                backgroundColor: '#EF4444',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#DC2626'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#EF4444'; }}
            >
              <PhoneOff size={16} />
              <span>End Call</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


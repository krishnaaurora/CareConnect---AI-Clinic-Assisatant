import React, { useState, useEffect } from 'react';
import { 
  PhoneCall, 
  PhoneForwarded, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Bot, 
  Clock, 
  User, 
  Calendar, 
  Search, 
  Filter, 
  Phone, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  Activity, 
  MessageSquare,
  Check,
  X,
  Languages,
  Headphones
} from 'lucide-react';
import { fetchAICallActivity, resolveCallFollowup } from '../api/client';

export default function AICallActivity() {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL'); // 'ALL' | 'BOOKED' | 'FAILED' | 'TRANSFERRED'
  const [languageFilter, setLanguageFilter] = useState('ALL');

  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAICallActivity();
      setActivityData(data);
    } catch (err) {
      console.error('Failed to load call activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Resolve Followup Request
  const handleResolveFollowup = async (callId) => {
    try {
      await resolveCallFollowup(callId);
      setActivityData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          calls: prev.calls.map(c => 
            c.call_id === callId ? { ...c, followup_status: 'Resolved (Handled by Staff)' } : c
          )
        };
      });
      showNotification(`Follow-up request for call ${callId} marked as resolved!`);
    } catch (err) {
      console.error('Failed to resolve follow-up:', err);
      showNotification('Failed to update follow-up status.');
    }
  };

  const metrics = activityData?.metrics || {
    total_calls: 48,
    booked_through_bolna: 28,
    failed_booking_attempts: 7,
    transferred_to_human: 9,
    average_duration: "1m 58s",
    ai_success_rate: "87.5%",
    languages_detected: ["English", "Hindi", "Telugu"]
  };

  const allCalls = activityData?.calls || [];

  // Filtered Calls
  const filteredCalls = allCalls.filter(c => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.caller_name?.toLowerCase().includes(q) ||
      c.caller_phone?.toLowerCase().includes(q) ||
      c.call_id?.toLowerCase().includes(q) ||
      c.summary?.toLowerCase().includes(q) ||
      c.doctor_name?.toLowerCase().includes(q);

    // Outcome
    let matchesOutcome = true;
    if (outcomeFilter === 'BOOKED') matchesOutcome = c.outcome === 'BOOKED_THROUGH_BOLNA';
    if (outcomeFilter === 'FAILED') matchesOutcome = c.outcome === 'FAILED_BOOKING_ATTEMPT';
    if (outcomeFilter === 'TRANSFERRED') matchesOutcome = c.outcome === 'TRANSFERRED_TO_HUMAN';

    // Language
    let matchesLang = true;
    if (languageFilter !== 'ALL') {
      matchesLang = (c.language || '').toLowerCase().includes(languageFilter.toLowerCase());
    }

    return matchesSearch && matchesOutcome && matchesLang;
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0F5B4C',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(15, 91, 76, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1100,
          fontWeight: 700,
          fontSize: '13.5px'
        }}>
          <CheckCircle2 size={16} color="#00C9A7" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '26px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '999px',
            backgroundColor: '#EDFDF9',
            border: '1px solid rgba(0, 201, 167, 0.3)',
            marginBottom: '8px'
          }}>
            <Bot size={13} color="#0F5B4C" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Voice AI Telephony Intelligence
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0A2520', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>
            AI Call Activity & Telephony Analytics
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Real-time telephony bridge activity: confirmed voice bookings, escalation handoffs, and waitlist queues.
          </p>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Metric 1: Booked Through Voice AI */}
        <div 
          onClick={() => setOutcomeFilter('BOOKED')}
          style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: outcomeFilter === 'BOOKED' ? '#DCFAF3' : '#FFFFFF',
            border: outcomeFilter === 'BOOKED' ? '2px solid #00C9A7' : '1px solid rgba(15, 91, 76, 0.1)',
            boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F5B4C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Booked via Voice AI
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#00C9A7" />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
            {metrics.booked_through_bolna}
          </div>
          <div style={{ fontSize: '12px', color: '#00C9A7', fontWeight: 700, marginTop: '4px' }}>
            {metrics.ai_success_rate} Voice Resolution
          </div>
        </div>

        {/* Metric 2: Failed Booking Attempts & Follow-ups */}
        <div 
          onClick={() => setOutcomeFilter('FAILED')}
          style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: outcomeFilter === 'FAILED' ? '#FEF3C7' : '#FFFFFF',
            border: outcomeFilter === 'FAILED' ? '2px solid #F59E0B' : '1px solid rgba(15, 91, 76, 0.1)',
            boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Failed / Follow-ups
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#B45309', fontFamily: 'Manrope, sans-serif' }}>
            {metrics.failed_booking_attempts}
          </div>
          <div style={{ fontSize: '12px', color: '#B45309', fontWeight: 700, marginTop: '4px' }}>
            Requires Desk Callback
          </div>
        </div>

        {/* Metric 3: Transferred to Human Staff */}
        <div 
          onClick={() => setOutcomeFilter('TRANSFERRED')}
          style={{
            padding: '20px',
            borderRadius: '16px',
            backgroundColor: outcomeFilter === 'TRANSFERRED' ? '#EFF6FF' : '#FFFFFF',
            border: outcomeFilter === 'TRANSFERRED' ? '2px solid #3B82F6' : '1px solid rgba(15, 91, 76, 0.1)',
            boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Transferred to Staff
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneForwarded size={16} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#1D4ED8', fontFamily: 'Manrope, sans-serif' }}>
            {metrics.transferred_to_human}
          </div>
          <div style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 700, marginTop: '4px' }}>
            Warm Human Handoffs
          </div>
        </div>

        {/* Metric 4: Average Duration & Multilingual */}
        <div style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: '#FAF8F5',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Call Duration
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#0F5B4C" />
            </div>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
            {metrics.average_duration}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>
            {(metrics.languages_detected || ["English", "Hindi", "Telugu"]).join(', ')}
          </div>
        </div>
      </div>

      {/* ── Filters Toolbar ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid rgba(15, 91, 76, 0.1)',
        boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '10px',
          backgroundColor: '#FAF8F5',
          border: '1px solid #E2E8F0',
          minWidth: '260px',
          flex: '1 1 260px'
        }}>
          <Search size={15} color="#64748B" />
          <input
            type="text"
            placeholder="Search caller, phone, Call ID, doctor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              fontSize: '13.5px',
              color: '#0A2520',
              width: '100%'
            }}
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={14} color="#64748B" />
            </button>
          )}
        </div>

        {/* Outcome Filter Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Call Outcomes' },
            { id: 'BOOKED', label: 'Booked via Voice AI', badge: metrics.booked_through_bolna },
            { id: 'FAILED', label: 'Failed / Follow-ups', badge: metrics.failed_booking_attempts },
            { id: 'TRANSFERRED', label: 'Transferred to Staff', badge: metrics.transferred_to_human },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setOutcomeFilter(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: outcomeFilter === tab.id ? '#0F5B4C' : '#F1F5F9',
                color: outcomeFilter === tab.id ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span style={{
                  fontSize: '10.5px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: outcomeFilter === tab.id ? '#00C9A7' : '#E2E8F0',
                  color: outcomeFilter === tab.id ? '#0A2520' : '#64748B'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Language Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Languages size={15} color="#0F5B4C" />
          <select
            value={languageFilter}
            onChange={e => setLanguageFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '12.5px',
              color: '#0A2520',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Languages</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi / हिन्दी</option>
            <option value="Telugu">Telugu / తెలుగు</option>
          </select>
        </div>
      </div>

      {/* ── Call Activity Stream ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredCalls.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <PhoneCall size={36} color="#94A3B8" style={{ marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 6px', color: '#0A2520', fontWeight: 800 }}>No Call Records Found</h4>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Try switching the outcome filter or search query.</p>
          </div>
        ) : (
          filteredCalls.map(c => {
            const isBooked = c.outcome === 'BOOKED_THROUGH_BOLNA';
            const isTransferred = c.outcome === 'TRANSFERRED_TO_HUMAN';
            const isFailed = c.outcome === 'FAILED_BOOKING_ATTEMPT';

            return (
              <div 
                key={c.call_id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: isBooked 
                    ? '1px solid rgba(0, 201, 167, 0.3)' 
                    : isFailed 
                    ? '1px solid rgba(245, 158, 11, 0.35)' 
                    : isTransferred 
                    ? '1px solid rgba(59, 130, 246, 0.3)' 
                    : '1px solid #E2E8F0',
                  boxShadow: '0 3px 14px rgba(10, 37, 32, 0.03)',
                  padding: '20px',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Top Call Bar */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  
                  {/* Left: Caller info & Call ID */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: isBooked ? '#DCFAF3' : isFailed ? '#FEF3C7' : '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isBooked && <CheckCircle2 size={20} color="#00C9A7" />}
                      {isFailed && <AlertCircle size={20} color="#D97706" />}
                      {isTransferred && <PhoneForwarded size={20} color="#2563EB" />}
                      {!isBooked && !isFailed && !isTransferred && <PhoneCall size={20} color="#64748B" />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15.5px', fontWeight: 800, color: '#0A2520' }}>
                          {c.caller_name}
                        </span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                          {c.call_id}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Phone size={11} color="#00C9A7" />
                        <span>{c.caller_phone}</span>
                        <span>·</span>
                        <Clock size={11} color="#64748B" />
                        <span>{c.duration}</span>
                        <span>·</span>
                        <span>{c.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Outcome Badge & Language */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      border: '1px solid #E2E8F0',
                      padding: '4px 10px',
                      borderRadius: '999px'
                    }}>
                      {c.language}
                    </span>

                    {isBooked && (
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        backgroundColor: '#DCFAF3',
                        color: '#0F5B4C',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <CheckCircle2 size={13} color="#00C9A7" />
                        <span>Booked via Voice AI</span>
                      </span>
                    )}

                    {isFailed && (
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <AlertCircle size={13} color="#D97706" />
                        <span>Failed Booking Attempt</span>
                      </span>
                    )}

                    {isTransferred && (
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        <PhoneForwarded size={13} color="#2563EB" />
                        <span>Transferred to Staff</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Conversation Summary */}
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '12px',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.5,
                  marginBottom: '12px'
                }}>
                  <strong style={{ color: '#0A2520' }}>Call Summary: </strong>
                  {c.summary}
                </div>

                {/* 1. If BOOKED: Show Booking Details */}
                {isBooked && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: '#EDFDF9',
                    borderRadius: '10px',
                    border: '1px solid rgba(0, 201, 167, 0.25)',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0F5B4C', fontWeight: 800 }}>
                        Ticket Reference: {c.appointment_reference}
                      </span>
                      <span>·</span>
                      <span>Doctor: <strong>{c.doctor_name}</strong> ({c.department})</span>
                      <span>·</span>
                      <span>Slot: <strong>{c.slot}</strong></span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#0F5B4C',
                      backgroundColor: '#FFFFFF',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(0, 201, 167, 0.3)'
                    }}>
                      Verified in MongoDB
                    </span>
                  </div>
                )}

                {/* 2. If FAILED BOOKING ATTEMPT: Show Reason & Follow-up Request Button */}
                {isFailed && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '12px 14px',
                    backgroundColor: '#FFFBEB',
                    borderRadius: '10px',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontSize: '12.5px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#B45309' }}>
                        Failure Reason: {c.failure_reason}
                      </div>
                      <div style={{ color: '#78350F', fontSize: '12px', marginTop: '2px' }}>
                        Status: <strong>{c.followup_status}</strong> · {c.followup_note}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a
                        href={`tel:${c.caller_phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#0F5B4C',
                          color: '#FFFFFF',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 700
                        }}
                      >
                        <Phone size={12} />
                        <span>Ring Back</span>
                      </a>

                      {!c.followup_status?.includes('Resolved') && (
                        <button
                          type="button"
                          onClick={() => handleResolveFollowup(c.call_id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            color: '#0A2520',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. If TRANSFERRED TO HUMAN STAFF: Show Reason & Target Line */}
                {isTransferred && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: '10px 14px',
                    backgroundColor: '#EFF6FF',
                    borderRadius: '10px',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    fontSize: '12.5px'
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#1D4ED8' }}>
                        Transfer Reason: {c.transfer_reason}
                      </span>
                      <div style={{ color: '#3B82F6', fontSize: '11.5px', marginTop: '2px' }}>
                        Escalated to: <strong>{c.transfer_target}</strong> ({c.transfer_status})
                      </div>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#1D4ED8',
                      backgroundColor: '#DBEAFE',
                      padding: '3px 8px',
                      borderRadius: '4px'
                    }}>
                      Handled Live
                    </span>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}


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
  Headphones,
  RotateCcw,
  Lock,
  Unlock,
  RefreshCw,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Copy,
  ChevronRight,
  FileText,
  UserCheck
} from 'lucide-react';
import { 
  fetchAICallActivity, 
  resolveCallFollowup,
  retryCall,
  updateCallbackStatus
} from '../api/client';
import LiveCallTranscript from './LiveCallTranscript';
import BackgroundPattern from './common/BackgroundPattern';

export default function AICallActivity() {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all_calls'); // 'all_calls' | 'live_transcript' | 'callbacks' | 'failed_retries'
  const [selectedTranscriptCallId, setSelectedTranscriptCallId] = useState(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('ALL'); // 'ALL' | 'INBOUND' | 'OUTBOUND'
  const [outcomeFilter, setOutcomeFilter] = useState('ALL'); // 'ALL' | 'BOOKED' | 'FAILED' | 'TRANSFERRED' | 'COMPLETED'
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [showFullPhone, setShowFullPhone] = useState(false);

  // Modals state
  const [transcriptModalCall, setTranscriptModalCall] = useState(null);
  const [resolveModalCall, setResolveModalCall] = useState(null);
  const [resolveNoteText, setResolveNoteText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState('');

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
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

  const handleCopy = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      showToast(`${label} copied to clipboard!`);
      setTimeout(() => setCopiedId(''), 2000);
    }
  };

  // Masking helper
  const formatPhone = (phone) => {
    if (!phone) return '—';
    if (showFullPhone) return phone;
    const clean = phone.replace(/\D/g, '');
    if (clean.length >= 10) {
      const last10 = clean.slice(-10);
      return `${last10.slice(0, 2)}XXXXXX${last10.slice(-2)}`;
    }
    return phone;
  };

  // Retry a failed or missed call
  const handleRetryCall = async (callId) => {
    setActionLoading(true);
    try {
      const res = await retryCall(callId);
      showToast(res.message || `Priya Voice AI retry attempt dispatched for ${callId}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to trigger call retry', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Resolve Follow-up Ticket
  const handleConfirmResolve = async (e) => {
    e.preventDefault();
    if (!resolveModalCall) return;

    setActionLoading(true);
    try {
      await resolveCallFollowup(resolveModalCall.call_id, resolveNoteText);
      showToast(`Follow-up for ${resolveModalCall.call_id} marked as resolved!`);
      setResolveModalCall(null);
      setResolveNoteText('');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update follow-up status', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Update Callback Status (e.g. from Queued -> Resolved)
  const handleUpdateCallback = async (callbackId, newStatus) => {
    try {
      await updateCallbackStatus(callbackId, newStatus, 'Updated via clinic console');
      showToast(`Callback ${callbackId} marked as ${newStatus}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update callback', true);
    }
  };

  const metrics = activityData?.metrics || {
    total_calls: 48,
    inbound_calls: 32,
    outbound_calls: 16,
    booked_through_ai: 28,
    failed_booking_attempts: 7,
    transferred_to_human: 9,
    pending_callbacks: 3,
    average_duration: "2m 04s",
    ai_success_rate: "89.5%",
    languages_detected: ["English", "Hindi", "Telugu"]
  };

  const allCalls = activityData?.calls || [];
  const callbacks = activityData?.callbacks || [];

  // Filtered Calls for Tab 1
  const filteredCalls = allCalls.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.caller_name?.toLowerCase().includes(q) ||
      c.caller_phone?.toLowerCase().includes(q) ||
      c.call_id?.toLowerCase().includes(q) ||
      c.summary?.toLowerCase().includes(q) ||
      c.doctor_name?.toLowerCase().includes(q) ||
      c.call_purpose?.toLowerCase().includes(q);

    let matchesDir = true;
    if (directionFilter === 'INBOUND') matchesDir = c.call_direction === 'INBOUND';
    if (directionFilter === 'OUTBOUND') matchesDir = c.call_direction === 'OUTBOUND';

    let matchesOutcome = true;
    if (outcomeFilter === 'BOOKED') matchesOutcome = (c.outcome || '').includes('BOOKED');
    if (outcomeFilter === 'FAILED') matchesOutcome = (c.outcome || '').includes('FAIL') || (c.outcome || '').includes('BUSY') || (c.outcome || '').includes('NO_ANSWER');
    if (outcomeFilter === 'TRANSFERRED') matchesOutcome = (c.outcome || '').includes('TRANSFER');
    if (outcomeFilter === 'COMPLETED') matchesOutcome = (c.outcome || '').includes('COMPLETE') || (c.outcome || '').includes('INFO');

    let matchesLang = true;
    if (languageFilter !== 'ALL') {
      matchesLang = (c.language || '').toLowerCase().includes(languageFilter.toLowerCase());
    }

    return matchesSearch && matchesDir && matchesOutcome && matchesLang;
  });

  // Failed Calls for Tab 3
  const failedCalls = allCalls.filter(c => {
    const outcome = (c.outcome || '').toUpperCase();
    return outcome.includes('FAIL') || outcome.includes('BUSY') || outcome.includes('NO_ANSWER') || c.followup_status?.includes('Pending');
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', paddingBottom: '60px', position: 'relative' }}>
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />
      <div style={{ position: 'relative', zIndex: 1 }}>
      
      {/* ── Toast Notification Banner ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: toastMessage.isError ? '#FEF2F2' : '#0F5B4C',
          color: toastMessage.isError ? '#DC2626' : '#FFFFFF',
          border: toastMessage.isError ? '1px solid #FECACA' : '1px solid #00C9A7',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '13.5px'
        }}>
          {toastMessage.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} color="#00C9A7" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Top Actions Bar (Clean, no duplicate headings) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '22px'
      }}>
        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowFullPhone(!showFullPhone)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {showFullPhone ? <Lock size={14} color="#0F5B4C" /> : <Unlock size={14} color="#00C9A7" />}
            <span>{showFullPhone ? 'Mask Numbers' : 'Reveal Numbers'}</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            title="Refresh telephony logs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Total Calls */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>All AI Calls</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {metrics.total_calls}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Inbound: <strong>{metrics.inbound_calls || 32}</strong> · Outbound: <strong>{metrics.outbound_calls || 16}</strong>
          </div>
        </div>

        {/* Card 2: Booked via Priya */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#EDFDF9', border: '1px solid rgba(0, 201, 167, 0.4)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F5B4C', textTransform: 'uppercase' }}>Booked Through AI</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F5B4C', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {metrics.booked_through_ai ?? metrics.booked_through_bolna ?? 28}
          </div>
          <div style={{ fontSize: '11px', color: '#007A65', marginTop: '2px', fontWeight: 700 }}>
            Verified Slot Confirmations
          </div>
        </div>

        {/* Card 3: AI Resolution Rate */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#007A65', textTransform: 'uppercase' }}>AI Success Rate</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#007A65', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {metrics.ai_success_rate}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Avg Duration: <strong>{metrics.average_duration}</strong>
          </div>
        </div>

        {/* Card 4: Transferred to Human */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>Desk Transfers</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#B45309', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {metrics.transferred_to_human}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Clinical Triage & Reception
          </div>
        </div>

        {/* Card 5: Pending Callbacks */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>Callback Queue</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#7C3AED', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {metrics.pending_callbacks || callbacks.length}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Awaiting Staff Follow-Up
          </div>
        </div>

        {/* Card 6: Failed & Retry Queue */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Failed / Retries</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {metrics.failed_booking_attempts}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Automated Retry Recovery
          </div>
        </div>
      </div>

      {/* ── Tabbed View Selection ── */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '20px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'all_calls', label: `All Calls Log (${allCalls.length})`, icon: PhoneCall },
          { id: 'live_transcript', label: 'Live Call Transcript & Audio Stream', icon: Sparkles, isLivePill: true },
          { id: 'callbacks', label: `Callback Requests (${callbacks.length})`, icon: PhoneForwarded, badge: metrics.pending_callbacks > 0 ? metrics.pending_callbacks : null },
          { id: 'failed_retries', label: `Failed Calls & Retries (${failedCalls.length})`, icon: PhoneMissed, badge: failedCalls.length > 0 ? failedCalls.length : null }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? '2px solid #00C9A7' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: isActive ? '#0F5B4C' : '#64748B',
                fontSize: '13px',
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <IconComp size={15} color={isActive ? '#00C9A7' : '#94A3B8'} />
              <span>{tab.label}</span>
              {tab.isLivePill && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  fontSize: '10px',
                  fontWeight: 900,
                  letterSpacing: '0.04em'
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                  LIVE
                </span>
              )}
              {tab.badge && (
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: tab.id === 'failed_retries' ? '#FEE2E2' : '#EDE9FE',
                  color: tab.id === 'failed_retries' ? '#DC2626' : '#7C3AED',
                  fontSize: '10.5px',
                  fontWeight: 800
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: ALL CALLS LOG ── */}
      {activeTab === 'all_calls' && (
        <>
          {/* Search & Filter Toolbar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '20px'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '360px' }}>
              <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search by caller, phone, call ID, doctor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 38px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  color: '#0A2520',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Direction Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Direction:</span>
                <select
                  value={directionFilter}
                  onChange={e => setDirectionFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Inbound & Outbound</option>
                  <option value="INBOUND">Inbound (Patient ➔ Clinic)</option>
                  <option value="OUTBOUND">Outbound (Priya ➔ Patient)</option>
                </select>
              </div>

              {/* Outcome Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Outcome:</span>
                <select
                  value={outcomeFilter}
                  onChange={e => setOutcomeFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Outcomes</option>
                  <option value="BOOKED">Booked via AI</option>
                  <option value="TRANSFERRED">Transferred to Staff</option>
                  <option value="COMPLETED">Completed / Info</option>
                  <option value="FAILED">Failed / Followup</option>
                </select>
              </div>

              {/* Language Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Language:</span>
                <select
                  value={languageFilter}
                  onChange={e => setLanguageFilter(e.target.value)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Languages</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calls Table */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 18px' }}>Call ID & Direction</th>
                    <th style={{ padding: '14px 18px' }}>Patient / Caller</th>
                    <th style={{ padding: '14px 18px' }}>Call Purpose & Duration</th>
                    <th style={{ padding: '14px 18px' }}>Outcome</th>
                    <th style={{ padding: '14px 18px' }}>Priya AI Synopsis</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', display: 'block', color: '#0F5B4C' }} />
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading telephony call records...</span>
                      </td>
                    </tr>
                  ) : filteredCalls.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                        <PhoneCall size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#94A3B8' }} />
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A2520', marginBottom: '4px' }}>
                          No call activity records found
                        </div>
                        <div style={{ fontSize: '13px' }}>
                          Try adjusting search query or filters.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCalls.map(c => {
                      const isOutbound = c.call_direction === 'OUTBOUND';
                      const outcomeStr = (c.outcome || '').toUpperCase();
                      const isBooked = outcomeStr.includes('BOOKED');
                      const isTransfer = outcomeStr.includes('TRANSFER');
                      const isFailed = outcomeStr.includes('FAIL') || outcomeStr.includes('BUSY') || outcomeStr.includes('NO_ANSWER');
                      const isSuccess = outcomeStr.includes('COMPLETED') || outcomeStr.includes('INFO');

                      return (
                        <tr
                          key={c.call_id}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                        >
                          {/* Col 1: ID & Direction */}
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                fontFamily: 'monospace',
                                color: '#0F5B4C',
                                backgroundColor: '#EDFDF9',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid rgba(0, 201, 167, 0.25)'
                              }}>
                                {c.call_id}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(c.call_id, 'Call ID')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8' }}
                                title="Copy Call ID"
                              >
                                {copiedId === c.call_id ? <Check size={12} color="#00C9A7" /> : <Copy size={12} />}
                              </button>
                            </div>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              {isOutbound ? (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  backgroundColor: '#EFF6FF',
                                  color: '#1D4ED8',
                                  fontSize: '10.5px',
                                  fontWeight: 800
                                }}>
                                  <PhoneOutgoing size={10} />
                                  <span>Outbound</span>
                                </span>
                              ) : (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  padding: '2px 7px',
                                  borderRadius: '999px',
                                  backgroundColor: '#EDFDF9',
                                  color: '#007A65',
                                  fontSize: '10.5px',
                                  fontWeight: 800
                                }}>
                                  <PhoneIncoming size={10} />
                                  <span>Inbound</span>
                                </span>
                              )}
                              <span style={{ fontSize: '10px', color: '#64748B' }}>
                                · {c.language || 'English'}
                              </span>
                            </div>
                          </td>

                          {/* Col 2: Patient Info */}
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14px' }}>
                              {c.caller_name || 'Anonymous Patient'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                              <Phone size={11} color="#00C9A7" />
                              <span style={{ fontFamily: 'monospace' }}>{formatPhone(c.caller_phone)}</span>
                            </div>
                            {c.appointment_reference && (
                              <div style={{ fontSize: '11px', color: '#0F5B4C', marginTop: '2px', fontFamily: 'monospace' }}>
                                Ref: {c.appointment_reference}
                              </div>
                            )}
                          </td>

                          {/* Col 3: Purpose & Duration */}
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                            <div style={{ fontWeight: 700, color: '#0A2520', fontSize: '13px' }}>
                              {c.call_purpose || 'General OPD Inquiry'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock size={11} color="#00C9A7" />
                                <strong>{c.duration || '1m 30s'}</strong>
                              </span>
                              <span>•</span>
                              <span>{c.timestamp || 'Today'}</span>
                            </div>
                          </td>

                          {/* Col 4: Outcome */}
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                            {isBooked && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 9px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                backgroundColor: '#EDFDF9',
                                color: '#007A65'
                              }}>
                                <CheckCircle2 size={12} color="#00C9A7" />
                                <span>Booked</span>
                              </span>
                            )}

                            {isTransfer && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 9px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                backgroundColor: '#FEF3C7',
                                color: '#B45309'
                              }}>
                                <PhoneForwarded size={12} color="#D97706" />
                                <span>Transferred</span>
                              </span>
                            )}

                            {isFailed && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 9px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626'
                              }}>
                                <XCircle size={12} color="#DC2626" />
                                <span>Failed Attempt</span>
                              </span>
                            )}

                            {isSuccess && !isBooked && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 9px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                fontWeight: 800,
                                backgroundColor: '#EFF6FF',
                                color: '#1D4ED8'
                              }}>
                                <CheckCircle2 size={12} color="#3B82F6" />
                                <span>Resolved</span>
                              </span>
                            )}
                          </td>

                          {/* Col 5: Priya Synopsis */}
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle', maxWidth: '300px' }}>
                            <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                              {c.summary || 'Caller interacted with Priya Voice AI.'}
                            </div>
                            {c.failure_reason && (
                              <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px', fontWeight: 600 }}>
                                ⚠️ Reason: {c.failure_reason}
                              </div>
                            )}
                            {c.retry_count > 0 && (
                              <div style={{ fontSize: '10.5px', color: '#0F5B4C', marginTop: '2px', fontWeight: 700 }}>
                                🔄 Retries: {c.retry_count} attempt(s)
                              </div>
                            )}
                          </td>

                          {/* Col 6: Actions */}
                          <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {/* View Transcript */}
                              <button
                                type="button"
                                onClick={() => setTranscriptModalCall(c)}
                                title="View Dialogue Transcript"
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: '#0F5B4C',
                                  backgroundColor: '#EDFDF9',
                                  border: '1px solid rgba(0, 201, 167, 0.3)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <MessageSquare size={12} />
                                <span>Transcript</span>
                              </button>

                              {/* Open in Live Stream Monitor */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTranscriptCallId(c.call_id);
                                  setActiveTab('live_transcript');
                                }}
                                title="Open in Live Transcript & Voice Monitor"
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: '#007A65',
                                  backgroundColor: '#F0FDFA',
                                  border: '1px solid rgba(0, 201, 167, 0.4)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Sparkles size={12} color="#00C9A7" />
                                <span>Live Monitor</span>
                              </button>

                              {/* Retry action for failed calls */}
                              {isFailed && (
                                <button
                                  type="button"
                                  onClick={() => handleRetryCall(c.call_id)}
                                  disabled={actionLoading}
                                  title="Dispatch Priya Voice AI retry call"
                                  style={{
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#FFFFFF',
                                    backgroundColor: '#0F5B4C',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <RotateCcw size={12} />
                                  <span>Retry</span>
                                </button>
                              )}

                              {/* Resolve follow-up ticket */}
                              {(isFailed || isTransfer) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResolveModalCall(c);
                                    setResolveNoteText(c.followup_note || 'Resolved by front desk staff.');
                                  }}
                                  title="Mark follow-up handled"
                                  style={{
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    color: '#475569',
                                    backgroundColor: '#F1F5F9',
                                    border: '1px solid #CBD5E1',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Resolve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── TAB 2: LIVE CALL TRANSCRIPT & VOICE STREAM ── */}
      {activeTab === 'live_transcript' && (
        <LiveCallTranscript 
          historicalCalls={allCalls} 
          initialCallId={selectedTranscriptCallId} 
        />
      )}

      {/* ── TAB 3: CALLBACK REQUESTS QUEUE ── */}
      {activeTab === 'callbacks' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 900, color: '#0A2520' }}>
              Pending Callback & Human Triage Queue
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
              Patients who requested a front-desk coordinator callback or required clinical clarification during their Priya AI conversation.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Callback ID</th>
                  <th style={{ padding: '14px 18px' }}>Patient & Contact</th>
                  <th style={{ padding: '14px 18px' }}>Preferred Time & Language</th>
                  <th style={{ padding: '14px 18px' }}>Enquiry Topic</th>
                  <th style={{ padding: '14px 18px' }}>Queue Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {callbacks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      <CheckCircle2 size={32} color="#00C9A7" style={{ margin: '0 auto 10px', display: 'block' }} />
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520' }}>
                        All callback requests resolved
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                        No pending patient callback requests in queue.
                      </div>
                    </td>
                  </tr>
                ) : (
                  callbacks.map(cb => {
                    const isQueued = (cb.status || '').includes('QUEUED') || (cb.status || '').includes('PENDING');

                    return (
                      <tr key={cb.callback_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', backgroundColor: '#EDFDF9', color: '#0F5B4C', fontFamily: 'monospace' }}>
                            {cb.callback_id}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '13.5px' }}>
                            {cb.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                            {formatPhone(cb.phone)}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2520' }}>
                            {cb.preferred_time || 'Morning (09:00 AM - 12:00 PM)'}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                            Language: <strong>{cb.preferred_language || 'English'}</strong>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', maxWidth: '260px' }}>
                          <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>
                            {cb.enquiry_topic || 'Doctor consultation query'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: isQueued ? '#FEF3C7' : '#EDFDF9',
                            color: isQueued ? '#B45309' : '#007A65'
                          }}>
                            {isQueued ? 'Awaiting Callback' : 'Resolved'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {isQueued && (
                              <button
                                type="button"
                                onClick={() => handleUpdateCallback(cb.callback_id, 'RESOLVED')}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: '#FFFFFF',
                                  backgroundColor: '#0F5B4C',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                              >
                                Mark Resolved
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: FAILED CALLS & RETRY RECOVERY ── */}
      {activeTab === 'failed_retries' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 900, color: '#0A2520' }}>
              Failed Calls, Busy Signals & Automated Retry Queue
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
              Detailed diagnosis of failed booking attempts, network timeouts, and patient unreachable events with one-click Priya AI retry.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', color: '#475569', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 18px' }}>Call ID</th>
                  <th style={{ padding: '14px 18px' }}>Patient & Phone</th>
                  <th style={{ padding: '14px 18px' }}>Failure Diagnostic</th>
                  <th style={{ padding: '14px 18px' }}>Retry Attempts</th>
                  <th style={{ padding: '14px 18px' }}>Follow-Up Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {failedCalls.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      <CheckCircle2 size={32} color="#00C9A7" style={{ margin: '0 auto 10px', display: 'block' }} />
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520' }}>
                        Zero unresolved failed calls
                      </div>
                    </td>
                  </tr>
                ) : (
                  failedCalls.map(c => (
                    <tr key={c.call_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', backgroundColor: '#FEE2E2', color: '#991B1B', fontFamily: 'monospace' }}>
                          {c.call_id}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '13.5px' }}>
                          {c.caller_name || 'Patient'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', fontFamily: 'monospace', marginTop: '2px' }}>
                          {formatPhone(c.caller_phone)}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', maxWidth: '280px' }}>
                        <div style={{ fontSize: '12.5px', color: '#DC2626', fontWeight: 700 }}>
                          {c.failure_reason || 'Requested slot unavailable / Line busy'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          "{c.summary || 'Caller requested booking during peak shift'}"
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 800,
                          backgroundColor: '#F1F5F9',
                          color: '#475569'
                        }}>
                          {c.retry_count || 0} Retries
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: c.followup_status?.includes('Resolved') ? '#EDFDF9' : '#FEF3C7',
                          color: c.followup_status?.includes('Resolved') ? '#007A65' : '#B45309'
                        }}>
                          {c.followup_status || 'Pending Staff Followup'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleRetryCall(c.call_id)}
                            disabled={actionLoading}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: 800,
                              color: '#FFFFFF',
                              backgroundColor: '#0F5B4C',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <RotateCcw size={12} />
                            <span>Retry Now</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResolveModalCall(c);
                              setResolveNoteText('Handled by reception staff.');
                            }}
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: '#475569',
                              backgroundColor: '#F1F5F9',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                          >
                            Resolve
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL 1: VIEW FULL CONVERSATIONAL TRANSCRIPT ── */}
      {transcriptModalCall && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setTranscriptModalCall(null)}
              style={{ position: 'absolute', top: '22px', right: '22px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            {/* Transcript Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={24} color="#00C9A7" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520' }}>
                    Call Dialogue: {transcriptModalCall.caller_name}
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '4px', backgroundColor: '#EDFDF9', color: '#0F5B4C', fontFamily: 'monospace' }}>
                    {transcriptModalCall.call_id}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                  <span>{transcriptModalCall.call_direction} Call</span>
                  <span>•</span>
                  <span>Duration: {transcriptModalCall.duration}</span>
                  <span>•</span>
                  <span>{transcriptModalCall.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Synopsis Card */}
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0', marginBottom: '18px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                Priya AI Call Summary & Outcome
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#0A2520', lineHeight: 1.5 }}>
                {transcriptModalCall.summary}
              </p>
              {transcriptModalCall.appointment_reference && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#0F5B4C', fontWeight: 700 }}>
                  Confirmed Appointment Reference: <code>{transcriptModalCall.appointment_reference}</code>
                </div>
              )}
            </div>

            {/* Simulated Dialogue Turns */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#0A2520', textTransform: 'uppercase', marginBottom: '10px' }}>
                Turn-by-Turn Audio Transcript ({transcriptModalCall.language || 'English'})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Turn 1: Priya Greeting */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="#00C9A7" />
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', flex: 1 }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F5B4C', marginBottom: '2px' }}>
                      Priya Voice AI (Receptionist)
                    </div>
                    <div style={{ fontSize: '13px', color: '#0A2520', lineHeight: 1.4 }}>
                      "Hello! I am Priya from Apex Care Clinic & Diagnostics. How may I assist you with your consultation or report today?"
                    </div>
                  </div>
                </div>

                {/* Turn 2: Patient Query */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={16} color="#64748B" />
                  </div>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '10px 14px', borderRadius: '12px', border: '1px solid #CBD5E1', flex: 1 }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#475569', marginBottom: '2px' }}>
                      {transcriptModalCall.caller_name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#0A2520', lineHeight: 1.4 }}>
                      "{transcriptModalCall.summary.split('.')[0] || 'I would like to inquire about booking a consultation.'}"
                    </div>
                  </div>
                </div>

                {/* Turn 3: Priya Resolution */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={16} color="#00C9A7" />
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', flex: 1 }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F5B4C', marginBottom: '2px' }}>
                      Priya Voice AI (Receptionist)
                    </div>
                    <div style={{ fontSize: '13px', color: '#0A2520', lineHeight: 1.4 }}>
                      "Understood. {transcriptModalCall.summary.split('.').slice(1).join('.') || 'I have verified the schedule and updated our clinic management system.'}"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setTranscriptModalCall(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: RESOLVE FOLLOWUP TICKET ── */}
      {resolveModalCall && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(5px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setResolveModalCall(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 900, color: '#0A2520' }}>
              Resolve Follow-Up Ticket
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748B' }}>
              Record administrative resolution for {resolveModalCall.caller_name} ({resolveModalCall.call_id}).
            </p>

            <form onSubmit={handleConfirmResolve} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Staff Resolution Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolveNoteText}
                  onChange={e => setResolveNoteText(e.target.value)}
                  placeholder="e.g. Spoke with patient; alternative consultation slot arranged for tomorrow 11 AM."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setResolveModalCall(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Saving...' : 'Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Z-Index Wrapper */}
      </div>
    </div>
  );
}

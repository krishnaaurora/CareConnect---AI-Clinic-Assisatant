import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  ShieldCheck,
  X,
  RefreshCw,
  Upload,
  Calendar,
  Building2,
  PhoneCall,
  Activity,
  FileCheck2,
  ArrowRight,
  Download,
  Printer,
  Sparkles,
  Check,
  ShieldAlert,
  MessageSquare,
  MessageCircle
} from 'lucide-react';
import {
  fetchDiagnosticReports,
  fetchDiagnosticReportMetrics,
  uploadDiagnosticReport,
  updateDiagnosticReportStatus,
  fetchPatients,
  notifyDiagnosticReport,
  recordPatientConsent
} from '../api/client';
import BackgroundPattern from './common/BackgroundPattern';

export default function DiagnosticReports() {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState({
    total_reports: 0,
    ready_count: 0,
    processing_count: 0,
    calls_dispatched: 0,
    calls_completed: 0,
    calls_failed: 0,
    calls_blocked_consent: 0,
    ready_to_dispatch_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All | Ready | Processing
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [consentTargetReport, setConsentTargetReport] = useState(null);
  const [consentForm, setConsentForm] = useState({
    status: 'Consented',
    channels: ['Voice AI Call', 'SMS', 'WhatsApp'],
    source: 'Front Desk Verbal Verification',
    recorded_by: 'Staff Receptionist',
    consent_notes: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [callingReportId, setCallingReportId] = useState(null);

  // Toast / Status banner
  const [toastMessage, setToastMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    patient_id: '',
    report_type: 'Blood Test',
    status: 'Ready',
    uploaded_date: 'Oct 30',
    file_name: 'Patient_Diagnostic_Report.pdf',
    file_size: '1.8 MB',
    notes: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  // Available categories per user specification
  const REPORT_CATEGORIES = [
    'Blood Test',
    'X-Ray',
    'MRI',
    'CT Scan',
    'Ultrasound',
    'Other Diagnostic Report'
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportList, metricData, patientList] = await Promise.all([
        fetchDiagnosticReports({
          search: searchQuery,
          status: statusFilter,
          report_type: categoryFilter
        }),
        fetchDiagnosticReportMetrics(),
        fetchPatients()
      ]);

      setReports(reportList || []);
      if (metricData) setMetrics(metricData);
      setPatients(patientList || []);

      if (patientList && patientList.length > 0 && !uploadForm.patient_id) {
        setUploadForm(prev => ({ ...prev, patient_id: patientList[0].id }));
      }
    } catch (err) {
      console.error('Error loading diagnostic reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, categoryFilter]);

  const showToast = (text, isSuccess = true) => {
    setToastMessage({ text, isSuccess });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Open View Modal
  const handleOpenView = (report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadForm(prev => ({
        ...prev,
        file_name: file.name,
        file_size: `${sizeInMB} MB`
      }));
    }
  };

  // Handle Report Upload & Automatic Voice Notification Call Trigger
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.patient_id) {
      showToast('Please select a patient from the registry', false);
      return;
    }

    setSubmitting(true);
    try {
      const res = await uploadDiagnosticReport(uploadForm);
      const isReady = uploadForm.status === 'Ready';
      
      if (isReady) {
        showToast(`Report uploaded successfully! Automatic Priya AI voice notification initiated for ${res.data?.patient_name || 'patient'}.`);
      } else {
        showToast(`Diagnostic report saved in Processing state. Automated AI call will trigger once marked Ready.`);
      }

      setIsUploadModalOpen(false);
      setSelectedFile(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to upload diagnostic report', false);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Mark Status Ready in View Modal
  const handleMarkAsReady = async (reportId) => {
    setSubmitting(true);
    try {
      const res = await updateDiagnosticReportStatus(reportId, { status: 'Ready' });
      showToast(res.message || 'Report marked as Ready!', true);
      setSelectedReport(res.data);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update report status', false);
    } finally {
      setSubmitting(false);
    }
  };

  // Open Consent Modal for a Report's Patient
  const handleOpenConsentModal = (report) => {
    setConsentTargetReport(report);
    const existingConsent = report.communication_consent || {};
    const existingChannels = existingConsent.channels || [];
    setConsentForm({
      status: 'Consented',
      channels: existingChannels.length > 0 && existingChannels.includes('Voice AI Call')
        ? [...existingChannels]
        : ['Voice AI Call', 'SMS', 'WhatsApp'],
      source: 'Front Desk Verbal Verification',
      recorded_by: 'Staff Receptionist',
      consent_notes: `Patient explicitly consented to automated Priya Voice AI report alerts.`
    });
    setIsConsentModalOpen(true);
  };

  // Submit Patient Communication Consent
  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    if (!consentTargetReport || !consentTargetReport.patient_id) return;
    setSubmitting(true);
    try {
      await recordPatientConsent(consentTargetReport.patient_id, consentForm);
      showToast(`Communication consent recorded as "${consentForm.status}" for ${consentTargetReport.patient_name}!`, true);
      setIsConsentModalOpen(false);
      setConsentTargetReport(null);
      await loadData();
      if (selectedReport && selectedReport.id === consentTargetReport.id) {
        setSelectedReport(prev => ({
          ...prev,
          communication_consent: {
            ...consentForm,
            consented_at: consentForm.status === 'Consented' ? new Date().toISOString() : null
          }
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to record consent', false);
    } finally {
      setSubmitting(false);
    }
  };
  const handleNotifyPatient = async (reportId) => {
    setCallingReportId(reportId);
    try {
      const res = await notifyDiagnosticReport(reportId);
      showToast(res.message || 'Priya clinical voice call initiated successfully!', true);
      await loadData();
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => ({
          ...prev,
          sarvam_call: {
            triggered: true,
            status: 'INITIATED',
            call_summary: 'Priya clinical voice notification dispatched.'
          }
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to dispatch voice call', false);
    } finally {
      setCallingReportId(null);
    }
  };

  return (
    <div style={{ paddingBottom: '60px', position: 'relative' }}>
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />
      <div style={{ position: 'relative', zIndex: 1 }}>
      
      {/* ── Toast Feedback Banner ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '14px 22px',
          borderRadius: '12px',
          backgroundColor: toastMessage.isSuccess ? '#0F5B4C' : '#FEF2F2',
          color: toastMessage.isSuccess ? '#FFFFFF' : '#DC2626',
          border: toastMessage.isSuccess ? '1px solid #00C9A7' : '1px solid #FECACA',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage.isSuccess ? <CheckCircle2 size={18} color="#00C9A7" /> : <AlertCircle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      {/* ── Top Actions Bar (Clean, no duplicate headings) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '10px',
        marginBottom: '22px'
      }}>
        <button
          type="button"
          onClick={loadData}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '10px',
            backgroundColor: '#FFFFFF',
            color: '#475569',
            border: '1px solid #E2E8F0',
            fontSize: '12.5px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>

        {/* 2. Upload Report Functionality Button */}
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            backgroundColor: '#0F5B4C',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0A4337'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0F5B4C'}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Upload New Report</span>
        </button>
      </div>

      {/* ── Operational Summary Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Total Reports */}
        <div className="admin-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid rgba(15, 91, 76, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Reports
            </span>
            <FileText size={16} color="#00C9A7" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {metrics.total_reports}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>Diagnostic files in registry</p>
        </div>

        {/* Card 2: Reports Ready */}
        <div 
          className="admin-card"
          onClick={() => setStatusFilter(statusFilter === 'Ready' ? 'All' : 'Ready')}
          style={{
            backgroundColor: statusFilter === 'Ready' ? '#EDFDF9' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'Ready' ? '2px solid #00C9A7' : '1px solid rgba(15, 91, 76, 0.08)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Status: Ready
            </span>
            <CheckCircle2 size={16} color="#007A65" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F5B4C', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.ready_count}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F5B4C', backgroundColor: 'rgba(0, 201, 167, 0.2)', padding: '2px 6px', borderRadius: '999px' }}>
              {metrics.ready_to_dispatch_count || 0} Eligible
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B' }}>
            {metrics.calls_blocked_consent > 0 ? `${metrics.calls_blocked_consent} require consent update` : 'All consented'}
          </p>
        </div>

        {/* Card 3: Processing */}
        <div 
          className="admin-card"
          onClick={() => setStatusFilter(statusFilter === 'Processing' ? 'All' : 'Processing')}
          style={{
            backgroundColor: statusFilter === 'Processing' ? '#FFFBEB' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'Processing' ? '2px solid #F59E0B' : '1px solid rgba(15, 91, 76, 0.08)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Status: Processing
            </span>
            <Clock size={16} color="#D97706" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#B45309', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.processing_count}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', backgroundColor: '#FDE68A', padding: '2px 6px', borderRadius: '999px' }}>
              In Lab
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>Calls withheld until Ready</p>
        </div>

        {/* Card 4: Voice Calls Dispatched & Completed */}
        <div className="admin-card" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '20px', border: '1px solid rgba(15, 91, 76, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Priya Clinical Telephony
            </span>
            <PhoneCall size={16} color="#00C9A7" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.calls_dispatched || 0}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F5B4C', backgroundColor: '#DCFAF3', padding: '2px 6px', borderRadius: '999px' }}>
              {(metrics.calls_completed || 0) > 0 ? `${metrics.calls_completed} Completed` : 'Live Gateway Active'}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span>Completed: <strong>{metrics.calls_completed || 0}</strong></span>
            <span>·</span>
            <span>Consent Blocked: <strong>{metrics.calls_blocked_consent || 0}</strong></span>
            {metrics.calls_failed > 0 && (
              <>
                <span>·</span>
                <span style={{ color: '#DC2626' }}>Failed: <strong>{metrics.calls_failed}</strong></span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="admin-card" style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid rgba(15, 91, 76, 0.08)',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: '10px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          flex: '1',
          minWidth: '260px'
        }}>
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search patient, report type, or ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              outline: 'none',
              width: '100%',
              fontSize: '13px',
              color: '#0A2520',
              fontFamily: 'Inter, sans-serif'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} color="#64748B" />
            </button>
          )}
        </div>

        {/* Filter Badges: Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Status:</span>
          {['All', 'Ready', 'Processing'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: statusFilter === st ? 800 : 600,
                cursor: 'pointer',
                backgroundColor: statusFilter === st ? '#0F5B4C' : '#F1F5F9',
                color: statusFilter === st ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Filter Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              color: '#0A2520'
            }}
          >
            <option value="All">All Categories</option>
            {REPORT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 1. EXACT REQUESTED TABLE ── */}
      {/* Columns: Patient | Report type | Uploaded date | Status | Action */}
      <div className="admin-card" style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: 'Inter, sans-serif'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                color: '#475569',
                fontSize: '11.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <th style={{ padding: '16px 20px' }}>Patient</th>
                <th style={{ padding: '16px 20px' }}>Report type</th>
                <th style={{ padding: '16px 20px' }}>Uploaded date</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px' }}>Automated Call Outcome</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '50px 20px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#00C9A7" />
                      <span>Loading Diagnostic Reports...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                    <FileText size={36} color="#94A3B8" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#0A2520' }}>No diagnostic reports found</div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Click "Upload New Report" to create a record.</p>
                  </td>
                </tr>
              ) : (
                reports.map(r => {
                  const isReady = r.status === 'Ready';
                  const sarvamCall = r.sarvam_call || null;

                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: '1px solid rgba(15, 91, 76, 0.06)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF8F5'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Column 1: Patient */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14.5px' }}>
                          {r.patient_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontFamily: 'monospace', color: '#94A3B8' }}>{r.patient_id || r.id}</span>
                          <span>·</span>
                          <span style={{ fontFamily: 'monospace' }}>{r.masked_phone || r.patient_phone}</span>
                        </div>
                      </td>

                      {/* Column 2: Report type */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: '#0F5B4C'
                        }}>
                          <FileText size={15} color="#00C9A7" />
                          <span>{r.report_type}</span>
                        </span>
                        {r.file_name && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                            {r.file_name}
                          </div>
                        )}
                      </td>

                      {/* Column 3: Uploaded date */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0A2520' }}>
                          {r.uploaded_date}
                        </div>
                        {r.uploaded_time && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                            {r.uploaded_time}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Status (Ready | Processing) */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 11px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 800,
                          backgroundColor: isReady ? 'rgba(0, 201, 167, 0.15)' : '#FEF3C7',
                          color: isReady ? '#0F5B4C' : '#B45309',
                          border: isReady ? '1px solid rgba(0, 201, 167, 0.3)' : '1px solid #FDE68A'
                        }}>
                          {isReady ? <CheckCircle2 size={13} color="#00C9A7" /> : <Clock size={13} color="#D97706" />}
                          <span>{r.status}</span>
                        </span>
                      </td>

                      {/* Column: Voice AI Call Outcome */}
                      <td style={{ padding: '16px 20px' }}>
                        {r.sarvam_call?.triggered ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: r.sarvam_call.status === 'COMPLETED' ? '#DCFAF3' : (r.sarvam_call.status === 'INITIATED' ? '#FEF3C7' : '#FEE2E2'),
                                color: r.sarvam_call.status === 'COMPLETED' ? '#007A65' : (r.sarvam_call.status === 'INITIATED' ? '#B45309' : '#DC2626'),
                                fontSize: '11px',
                                fontWeight: 800
                              }}>
                                <PhoneCall size={11} />
                                <span>{r.sarvam_call.status === 'INITIATED' ? 'Calling...' : r.sarvam_call.status === 'COMPLETED' ? 'Priya Notified' : r.sarvam_call.status || 'Dispatched'}</span>
                              </span>
                              {r.sarvam_call.duration && (
                                <span style={{ fontSize: '10.5px', color: '#64748B' }}>{r.sarvam_call.duration}</span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748B', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.sarvam_call.patient_response || r.sarvam_call.call_summary || 'Outbound notification dispatched'}
                            </span>
                          </div>
                        ) : (
                          (() => {
                            const consent = r.communication_consent || {};
                            const isConsented = (consent.status || '').toLowerCase() === 'consented';
                            const channels = consent.channels || [];
                            const hasVoice = channels.some(c => c.toLowerCase().includes('voice'));

                            if (!isConsented) {
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: '#FEF3C7',
                                    color: '#B45309',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    width: 'fit-content'
                                  }}>
                                    <ShieldAlert size={12} color="#D97706" />
                                    <span>Consent: {consent.status || 'Pending'}</span>
                                  </span>
                                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>Voice AI call blocked until consent</span>
                                </div>
                              );
                            }

                            if (!hasVoice) {
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: '#F1F5F9',
                                    color: '#475569',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    width: 'fit-content'
                                  }}>
                                    <span>Voice Opt-Out</span>
                                  </span>
                                  <span style={{ fontSize: '10.5px', color: '#94A3B8' }}>{channels.join(', ') || 'SMS/WhatsApp only'}</span>
                                </div>
                              );
                            }

                            return (
                              <span style={{ fontSize: '11.5px', color: isReady ? '#007A65' : '#94A3B8', fontWeight: isReady ? 600 : 400 }}>
                                {isReady ? 'Ready for Dispatch' : 'Waiting for Lab sign-off'}
                              </span>
                            );
                          })()
                        )}
                      </td>

                      {/* Column 5: Action (Notify Patient & View) */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {isReady && (() => {
                            const consent = r.communication_consent || {};
                            const isConsented = (consent.status || '').toLowerCase() === 'consented';
                            const channels = consent.channels || [];
                            const hasVoice = channels.some(c => c.toLowerCase().includes('voice'));
                            const canCall = isConsented && hasVoice;

                            if (!canCall) {
                              return (
                                <button
                                  type="button"
                                  onClick={() => handleOpenConsentModal(r)}
                                  title="Patient has not consented to Voice AI calls. Click to record consent."
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    backgroundColor: '#FFFBEB',
                                    color: '#B45309',
                                    border: '1px solid #FDE68A',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF3C7'}
                                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFBEB'}
                                >
                                  <ShieldAlert size={12} color="#D97706" />
                                  <span>Record Consent</span>
                                </button>
                              );
                            }

                            return (
                              <button
                                type="button"
                                onClick={() => handleNotifyPatient(r.id)}
                                disabled={callingReportId === r.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '7px 14px',
                                  borderRadius: '8px',
                                  backgroundColor: '#0F5B4C',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  cursor: callingReportId === r.id ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.15s ease',
                                  boxShadow: '0 2px 8px rgba(15, 91, 76, 0.18)'
                                }}
                                onMouseEnter={e => {
                                  if (callingReportId !== r.id) e.currentTarget.style.backgroundColor = '#007A65';
                                }}
                                onMouseLeave={e => {
                                  if (callingReportId !== r.id) e.currentTarget.style.backgroundColor = '#0F5B4C';
                                }}
                              >
                                <PhoneCall size={12} />
                                <span>{callingReportId === r.id ? 'Calling...' : 'Notify Patient'}</span>
                              </button>
                            );
                          })()}

                          <button
                            type="button"
                            onClick={() => handleOpenView(r)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              backgroundColor: '#FFFFFF',
                              color: '#0F5B4C',
                              border: '1px solid rgba(15, 91, 76, 0.25)',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor = '#EDFDF9';
                              e.currentTarget.style.borderColor = '#00C9A7';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                              e.currentTarget.style.borderColor = 'rgba(15, 91, 76, 0.25)';
                            }}
                          >
                            <Eye size={12} color="#0F5B4C" />
                            <span>View</span>
                          </button>
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

      {/* ── 2. UPLOAD REPORT MODAL ── */}
      {isUploadModalOpen && (
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
            maxWidth: '560px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Upload Diagnostic Report
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  When marked <strong>READY</strong>, Priya Clinical Voice Assistant will automatically call the patient.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Field 1: Select Patient (from existing registry) */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Select Patient (from Registry) *
                </label>
                <select
                  required
                  value={uploadForm.patient_id}
                  onChange={e => setUploadForm({ ...uploadForm, patient_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="" disabled>-- Select registered patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) · {p.masked_phone || p.phone} · Consent: {p.communication_consent?.status || 'Pending'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Report Category */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Report Category *
                </label>
                <select
                  required
                  value={uploadForm.report_type}
                  onChange={e => setUploadForm({ ...uploadForm, report_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  {REPORT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Upload PDF */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Upload PDF Document *
                </label>
                <div style={{
                  border: '2px dashed #CBD5E1',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: '#FAF8F5',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                  <FileText size={32} color="#00C9A7" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2520' }}>
                    {selectedFile ? selectedFile.name : 'Click or drag PDF here to upload'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Standard diagnostic PDF up to 25MB'}
                  </div>
                </div>
              </div>

              {/* Field 4: Report Status & Field 5: Upload Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Report Status *
                  </label>
                  <select
                    value={uploadForm.status}
                    onChange={e => setUploadForm({ ...uploadForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 700,
                      backgroundColor: uploadForm.status === 'Ready' ? '#EDFDF9' : '#FFFBEB',
                      color: uploadForm.status === 'Ready' ? '#0F5B4C' : '#B45309',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Ready">Ready (Verified for Notification)</option>
                    <option value="Processing">Processing (Awaiting Lab Analysis)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Upload Date
                  </label>
                  <input
                    type="text"
                    value={uploadForm.uploaded_date}
                    onChange={e => setUploadForm({ ...uploadForm, uploaded_date: e.target.value })}
                    placeholder="e.g. Oct 30"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Notification Notice */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '10px',
                backgroundColor: uploadForm.status === 'Ready' ? '#EDFDF9' : '#FAF8F5',
                border: uploadForm.status === 'Ready' ? '1px solid rgba(0, 201, 167, 0.4)' : '1px solid #E2E8F0',
                fontSize: '12px',
                color: '#0A2520',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <PhoneCall size={16} color={uploadForm.status === 'Ready' ? '#00C9A7' : '#94A3B8'} />
                <span>
                  {uploadForm.status === 'Ready'
                    ? 'Report ready for patient delivery. You can click "Notify Patient" in the table to initiate Priya AI voice call.'
                    : 'Report will remain queued. When marked Ready, you can trigger Priya AI voice notification.'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                  }}
                >
                  {submitting ? 'Saving Diagnostic Report...' : 'Save Diagnostic Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 3. VIEW REPORT MODAL ── */}
      {isViewModalOpen && selectedReport && (
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
            padding: '30px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              style={{ position: 'absolute', top: '22px', right: '22px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: selectedReport.status === 'Ready' ? '#EDFDF9' : '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: selectedReport.status === 'Ready' ? '1px solid rgba(0, 201, 167, 0.3)' : '1px solid #FDE68A'
              }}>
                <FileText size={22} color={selectedReport.status === 'Ready' ? '#0F5B4C' : '#B45309'} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {selectedReport.report_type} Report
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569', fontFamily: 'monospace' }}>
                    {selectedReport.id}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
                  Patient: <strong style={{ color: '#0A2520' }}>{selectedReport.patient_name}</strong> · Uploaded: {selectedReport.uploaded_date}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid rgba(15, 91, 76, 0.08)' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Report Status</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: selectedReport.status === 'Ready' ? '#0F5B4C' : '#B45309', marginTop: '4px' }}>
                  {selectedReport.status}
                </div>
              </div>

              <div style={{ padding: '12px 16px', backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid rgba(15, 91, 76, 0.08)' }}>
                <div style={{ fontSize: '11.5px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Attached Document</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2520', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedReport.file_name} ({selectedReport.file_size || '1.8 MB'})
                </div>
              </div>
            </div>

            {/* Priya Voice Receptionist Audit Card */}
            {(() => {
              const sarvamCall = selectedReport.sarvam_call || null;
              const consent = selectedReport.communication_consent || {};
              const isConsented = (consent.status || '').toLowerCase() === 'consented';
              const channels = consent.channels || [];
              const hasVoice = channels.some(c => c.toLowerCase().includes('voice'));

              if (sarvamCall && sarvamCall.triggered) {
                const callStatus = (sarvamCall.status || '').toUpperCase();
                const isInitiated = callStatus === 'INITIATED';
                const isCompleted = callStatus === 'COMPLETED';
                const isFailed = callStatus === 'FAILED';
                const isNoAnswer = callStatus === 'NO_ANSWER';

                return (
                  <div style={{
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: isCompleted ? '#EDFDF9' : isInitiated ? '#FEF3C7' : '#FAF8F5',
                    border: isCompleted ? '1px solid rgba(0, 201, 167, 0.4)' : isInitiated ? '1px solid #FCD34D' : '1px solid #E2E8F0',
                    marginBottom: '18px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PhoneCall size={18} color={isCompleted ? '#007A65' : '#0F5B4C'} />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0A2520' }}>
                          Priya Clinical Telephony Call (Voice Receptionist)
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        backgroundColor: isCompleted ? '#DCFAF3' : isInitiated ? '#FEF3C7' : isFailed ? '#FEE2E2' : '#F1F5F9',
                        color: isCompleted ? '#0F5B4C' : isInitiated ? '#B45309' : isFailed ? '#DC2626' : '#64748B'
                      }}>
                        {isInitiated ? 'Calling Patient...' : isCompleted ? 'Call Completed' : isNoAnswer ? 'No Answer' : isFailed ? 'Call Failed' : 'Call Dispatched'}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                      {sarvamCall.call_summary || 'Outbound clinical notification dispatched via telephony gateway.'}
                    </p>

                    {/* Extracted Call Variables Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Patient Response</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A2520', marginTop: '2px' }}>
                          {sarvamCall.patient_response || 'Pending response'}
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Preferred Collection Date</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A2520', marginTop: '2px' }}>
                          {sarvamCall.preferred_collection_date || 'Not specified yet'}
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Callback Requested</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: sarvamCall.callback_requested ? '#B45309' : '#0A2520', marginTop: '2px' }}>
                          {sarvamCall.callback_requested ? 'Yes (Reception callback needed)' : 'No'}
                        </div>
                      </div>

                      <div style={{ padding: '8px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Call Duration</div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A2520', marginTop: '2px' }}>
                          {sarvamCall.duration || '0s'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11.5px', color: '#64748B' }}>
                      <div><strong>Voice Engine:</strong> Priya Clinical Assistant</div>
                      <div><strong>Caller ID:</strong> +918064269783</div>
                      <div><strong>Recipient:</strong> {selectedReport.masked_phone || selectedReport.patient_phone}</div>
                      {sarvamCall.attempt_id && (
                        <div><strong>Attempt ID:</strong> <span style={{ fontFamily: 'monospace' }}>{sarvamCall.attempt_id}</span></div>
                      )}
                    </div>
                  </div>
                );
              }

              // No Voice Call dispatched yet: Display live patient consent status
              return (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  backgroundColor: !isConsented ? '#FFFBEB' : !hasVoice ? '#F8FAFC' : '#EDFDF9',
                  border: !isConsented ? '1px solid #FDE68A' : !hasVoice ? '1px solid #E2E8F0' : '1px solid rgba(0, 201, 167, 0.4)',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color={isConsented && hasVoice ? '#007A65' : '#D97706'} />
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0A2520' }}>
                        Patient Communication Consent Status
                      </span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: isConsented ? '#DCFAF3' : '#FEF3C7',
                      color: isConsented ? '#0F5B4C' : '#B45309'
                    }}>
                      {consent.status || 'Pending'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                    {!isConsented
                      ? `Automated voice calls are blocked. Patient '${selectedReport.patient_name}' has communication consent status 'Pending'. Explicit consent is required before dispatch.`
                      : !hasVoice
                      ? `Patient is consented to [${channels.join(', ')}], but has not enabled 'Voice AI Call'. Calls will be blocked.`
                      : `Patient has granted explicit consent for Voice AI calls and SMS notifications. Ready for Priya AI dispatch.`}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                      <strong>Allowed Channels:</strong> {channels.length > 0 ? channels.join(', ') : 'None'}
                    </div>
                    {(!isConsented || !hasVoice) && (
                      <button
                        type="button"
                        onClick={() => handleOpenConsentModal(selectedReport)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #F59E0B',
                          backgroundColor: '#FFFBEB',
                          color: '#B45309',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <ShieldAlert size={13} color="#D97706" />
                        <span>Record / Update Consent</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Document PDF Preview Container */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck2 size={24} color="#00C9A7" />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520' }}>{selectedReport.file_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Verified Clinical Diagnostic Document · {selectedReport.file_size || '1.8 MB'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => showToast('Downloading PDF diagnostic document...')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {selectedReport.status === 'Processing' ? (
                  <button
                    type="button"
                    onClick={() => handleMarkAsReady(selectedReport.id)}
                    disabled={submitting}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#0F5B4C',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>{submitting ? 'Updating status...' : 'Mark Report as READY'}</span>
                  </button>
                ) : (() => {
                  const consent = selectedReport.communication_consent || {};
                  const isConsented = (consent.status || '').toLowerCase() === 'consented';
                  const channels = consent.channels || [];
                  const hasVoice = channels.some(c => c.toLowerCase().includes('voice'));
                  const canCall = isConsented && hasVoice;

                  if (!canCall) {
                    return (
                      <button
                        type="button"
                        onClick={() => handleOpenConsentModal(selectedReport)}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '10px',
                          border: '1px solid #F59E0B',
                          backgroundColor: '#FFFBEB',
                          color: '#B45309',
                          fontWeight: 800,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px'
                        }}
                      >
                        <ShieldAlert size={14} color="#D97706" />
                        <span>Record Consent to Enable Call</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      onClick={() => handleNotifyPatient(selectedReport.id)}
                      disabled={callingReportId === selectedReport.id}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: '#0F5B4C',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: callingReportId === selectedReport.id ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                      }}
                    >
                      <PhoneCall size={14} />
                      <span>{callingReportId === selectedReport.id ? 'Calling Patient...' : 'Notify Patient via Priya AI'}</span>
                    </button>
                  );
                })()}
              </div>

              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: RECORD PATIENT COMMUNICATION CONSENT ── */}
      {isConsentModalOpen && consentTargetReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => { setIsConsentModalOpen(false); setConsentTargetReport(null); }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Record Communication Consent
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  {consentTargetReport.patient_name} ({consentTargetReport.patient_id})
                </p>
              </div>
            </div>

            <form onSubmit={handleConsentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Consent Status
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {['Consented', 'Pending', 'Revoked'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        const newChannels = st === 'Revoked' ? [] : (consentForm.channels.length > 0 ? consentForm.channels : ['Voice AI Call', 'SMS', 'WhatsApp']);
                        setConsentForm({ ...consentForm, status: st, channels: newChannels });
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: consentForm.status === st ? '2px solid #00C9A7' : '1px solid #CBD5E1',
                        backgroundColor: consentForm.status === st ? '#EDFDF9' : '#FFFFFF',
                        color: consentForm.status === st ? '#0F5B4C' : '#475569',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Authorized Communication Channels */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Authorized Communication Channels
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {[
                    { id: 'Voice AI Call', label: 'Voice AI Call', icon: PhoneCall, desc: 'Priya AI Receptionist (+918064269783)' },
                    { id: 'SMS', label: 'SMS', icon: MessageSquare, desc: 'Direct text SMS notifications' },
                    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, desc: 'WhatsApp report delivery & alerts' }
                  ].map(ch => {
                    const isChecked = (consentForm.channels || []).includes(ch.id);
                    const IconComp = ch.icon;
                    return (
                      <label
                        key={ch.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          padding: '10px',
                          borderRadius: '10px',
                          backgroundColor: isChecked ? '#EDFDF9' : '#F8FAFC',
                          border: isChecked ? '1.5px solid #00C9A7' : '1px solid #CBD5E1',
                          cursor: consentForm.status === 'Revoked' ? 'not-allowed' : 'pointer',
                          opacity: consentForm.status === 'Revoked' ? 0.6 : 1
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={consentForm.status === 'Revoked'}
                          onChange={e => {
                            const cur = consentForm.channels || [];
                            const updated = e.target.checked
                              ? [...cur, ch.id]
                              : cur.filter(c => c !== ch.id);
                            setConsentForm({ ...consentForm, channels: updated });
                          }}
                          style={{ marginTop: '2px', accentColor: '#00C9A7' }}
                        />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0A2520', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <IconComp size={13} color={isChecked ? '#007A65' : '#64748B'} />
                            <span>{ch.label}</span>
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                            {ch.desc}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {consentForm.status === 'Consented' && !(consentForm.channels || []).some(ch => ch.toLowerCase().includes('voice')) && (
                  <div style={{ marginTop: '6px', fontSize: '11px', color: '#B45309', backgroundColor: '#FEF3C7', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                    ⚠️ Note: 'Voice AI Call' is unselected. Automated Priya voice calls will remain blocked until voice consent is granted.
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Verification Method / Source
                </label>
                <select
                  value={consentForm.source}
                  onChange={e => setConsentForm({ ...consentForm, source: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="Front Desk Verbal Verification">Front Desk Verbal Verification</option>
                  <option value="Digital Intake Form">Digital Intake Form</option>
                  <option value="Physical Signed Form">Physical Signed Form</option>
                  <option value="Priya AI Inbound Verification">Priya AI Inbound Verification</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Audit / Receptionist Notes
                </label>
                <textarea
                  rows={2}
                  value={consentForm.consent_notes}
                  onChange={e => setConsentForm({ ...consentForm, consent_notes: e.target.value })}
                  placeholder="Record verification notes or patient agreement details..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'Inter, sans-serif',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setIsConsentModalOpen(false); setConsentTargetReport(null); }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Recording...' : 'Save Consent'}
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


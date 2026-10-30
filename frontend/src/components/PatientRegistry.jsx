import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  X,
  Check,
  Filter,
  RefreshCw,
  FileText,
  Calendar,
  Lock,
  Unlock,
  Building2,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import {
  fetchPatients,
  fetchPatientMetrics,
  createPatient,
  updatePatient,
  recordPatientConsent,
  notifyPatient
} from '../api/client';

export default function PatientRegistry() {
  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState({
    total_patients: 0,
    reports_ready: 0,
    reports_processing: 0,
    consented_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All | Ready | Processing
  const [consentFilter, setConsentFilter] = useState('All'); // All | Consented | Pending | Revoked
  const [showFullPhone, setShowFullPhone] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  
  // Selected Patient for actions
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Notification Toast / Feedback Banner
  const [toastMessage, setToastMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states: Add Patient
  const [addForm, setAddForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    report_status: 'Processing',
    report_type: 'Comprehensive Metabolic Panel',
    consent_status: 'Consented',
    consent_channels: ['Voice AI Call', 'SMS'],
    consent_notes: 'Explicit verbal and digital consent captured during front-desk intake.',
    clinical_notes: ''
  });

  // Form states: Edit Patient
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    report_status: 'Processing',
    report_type: '',
    clinical_notes: ''
  });

  // Form states: Record Consent
  const [consentForm, setConsentForm] = useState({
    status: 'Consented',
    channels: ['Voice AI Call', 'SMS'],
    source: 'Front Desk Verbal Verification',
    recorded_by: 'Staff Receptionist',
    consent_notes: ''
  });

  // Load Patients and Metrics from Backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [patientList, metricData] = await Promise.all([
        fetchPatients({
          search: searchQuery,
          report_status: statusFilter,
          consent_status: consentFilter
        }),
        fetchPatientMetrics()
      ]);
      setPatients(patientList || []);
      if (metricData) setMetrics(metricData);
    } catch (err) {
      console.error('Error loading patient registry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter, consentFilter]);

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Open Edit Modal with selected patient
  const handleOpenEdit = (patient) => {
    setSelectedPatient(patient);
    setEditForm({
      name: patient.name || '',
      phone: patient.phone || '',
      email: patient.email || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      report_status: patient.report_status || 'Processing',
      report_type: patient.report_type || '',
      clinical_notes: patient.clinical_notes || ''
    });
    setIsEditModalOpen(true);
  };

  // Open Consent Modal
  const handleOpenConsent = (patient) => {
    setSelectedPatient(patient);
    setConsentForm({
      status: patient.communication_consent?.status || 'Consented',
      channels: patient.communication_consent?.channels || ['Voice AI Call', 'SMS'],
      source: patient.communication_consent?.source || 'Front Desk Verbal Verification',
      recorded_by: 'Staff Receptionist',
      consent_notes: patient.communication_consent?.consent_notes || 'Patient verified preference for automated voice & SMS reminders.'
    });
    setIsConsentModalOpen(true);
  };

  // Open Details Modal
  const handleOpenDetails = (patient) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };

  // Open Notify Modal
  const handleOpenNotify = (patient) => {
    setSelectedPatient(patient);
    setIsNotifyModalOpen(true);
  };

  // Submit Add Patient
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      showToast('Patient name and phone number are required', true);
      return;
    }
    setActionLoading(true);
    try {
      await createPatient({
        ...addForm,
        age: addForm.age ? parseInt(addForm.age, 10) : undefined
      });
      showToast(`Patient "${addForm.name}" registered successfully!`);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        phone: '',
        email: '',
        age: '',
        gender: 'Male',
        report_status: 'Processing',
        report_type: 'Comprehensive Metabolic Panel',
        consent_status: 'Consented',
        consent_channels: ['Voice AI Call', 'SMS'],
        consent_notes: 'Explicit verbal and digital consent captured during front-desk intake.',
        clinical_notes: ''
      });
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to add patient', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit Patient
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setActionLoading(true);
    try {
      await updatePatient(selectedPatient.id, {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age, 10) : undefined
      });
      showToast(`Patient "${editForm.name}" updated successfully!`);
      setIsEditModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update patient', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Record Consent
  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setActionLoading(true);
    try {
      await recordPatientConsent(selectedPatient.id, consentForm);
      showToast(`Communication consent updated for ${selectedPatient.name} to "${consentForm.status}"!`);
      setIsConsentModalOpen(false);
      loadData();
      if (isDetailsModalOpen && selectedPatient) {
        setSelectedPatient(prev => ({
          ...prev,
          communication_consent: {
            ...prev.communication_consent,
            ...consentForm,
            consented_at: consentForm.status === 'Consented' ? new Date().toISOString() : null
          }
        }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to record consent', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Notify Patient
  const handleNotifySubmit = async () => {
    if (!selectedPatient) return;
    setActionLoading(true);
    try {
      await notifyPatient(selectedPatient.id, {
        channel: 'Voice AI Call & SMS',
        custom_message: `CareConnect AI: Dear ${selectedPatient.name}, your diagnostic report (${selectedPatient.report_type || 'Lab Results'}) is ready for review.`
      });
      showToast(`Notification queued via Priya Voice AI & SMS to ${selectedPatient.name} (${selectedPatient.masked_phone || selectedPatient.phone})!`);
      setIsNotifyModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to notify patient', true);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      
      {/* ── Toast Feedback Banner ── */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          padding: '14px 22px',
          borderRadius: '12px',
          backgroundColor: toastMessage.isError ? '#FEF2F2' : '#0F5B4C',
          color: toastMessage.isError ? '#DC2626' : '#FFFFFF',
          border: toastMessage.isError ? '1px solid #FECACA' : '1px solid #00C9A7',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toastMessage.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} color="#00C9A7" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Section Header & Title ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '28px'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: '#EDFDF9',
            border: '1px solid rgba(0, 201, 167, 0.3)',
            marginBottom: '10px'
          }}>
            <Users size={13} color="#0F5B4C" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Patient Management Directory
            </span>
          </div>

          <h1 style={{
            margin: '0 0 6px',
            fontSize: '28px',
            fontWeight: 900,
            color: '#0A2520',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            letterSpacing: '-0.02em'
          }}>
            Patient Registry
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
            Central patient database with real-time test report tracking, DPDP/HIPAA communication consent records, and automated Priya voice dispatch.
          </p>
        </div>

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
              border: '1px solid #E2E8F0',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {showFullPhone ? <Lock size={14} color="#0F5B4C" /> : <Unlock size={14} color="#00C9A7" />}
            <span>{showFullPhone ? 'Mask Numbers' : 'Reveal Numbers'}</span>
          </button>

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

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#0F5B4C',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0A4337'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0F5B4C'}
          >
            <Plus size={15} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* ── Summary Operational Metric Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Total Patients */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(15, 91, 76, 0.08)',
          boxShadow: '0 4px 16px rgba(10, 37, 32, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Registered
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#00C9A7" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {metrics.total_patients}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>Verified patient profiles</p>
        </div>

        {/* Card 2: Reports Ready */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Ready' ? 'All' : 'Ready')}
          style={{
            backgroundColor: statusFilter === 'Ready' ? '#EDFDF9' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'Ready' ? '2px solid #00C9A7' : '1px solid rgba(15, 91, 76, 0.08)',
            boxShadow: '0 4px 16px rgba(10, 37, 32, 0.02)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reports Ready
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFAF3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#007A65" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0F5B4C', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.reports_ready}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F5B4C', backgroundColor: 'rgba(0, 201, 167, 0.2)', padding: '2px 6px', borderRadius: '999px' }}>
              Notify Active
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>Ready for automated notification</p>
        </div>

        {/* Card 3: Reports Processing */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'Processing' ? 'All' : 'Processing')}
          style={{
            backgroundColor: statusFilter === 'Processing' ? '#FFFBEB' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: statusFilter === 'Processing' ? '2px solid #F59E0B' : '1px solid rgba(15, 91, 76, 0.08)',
            boxShadow: '0 4px 16px rgba(10, 37, 32, 0.02)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reports Processing
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#B45309', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.reports_processing}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', backgroundColor: '#FDE68A', padding: '2px 6px', borderRadius: '999px' }}>
              In Lab
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>Action disabled until verified</p>
        </div>

        {/* Card 4: Consent Compliance */}
        <div 
          onClick={() => setConsentFilter(consentFilter === 'Consented' ? 'All' : 'Consented')}
          style={{
            backgroundColor: consentFilter === 'Consented' ? '#EDFDF9' : '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: consentFilter === 'Consented' ? '2px solid #00C9A7' : '1px solid rgba(15, 91, 76, 0.08)',
            boxShadow: '0 4px 16px rgba(10, 37, 32, 0.02)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Communication Consent
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#DCFAF3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={16} color="#007A65" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.consented_count}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0F5B4C', backgroundColor: '#DCFAF3', padding: '2px 6px', borderRadius: '999px' }}>
              Compliant
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#94A3B8' }}>Explicit audit records logged</p>
        </div>
      </div>

      {/* ── Search Bar & Filter Controls ── */}
      <div style={{
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
            placeholder="Search patient name, phone (e.g. 88XXXXXX42), or ID..."
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

        {/* Filter Badges: Report Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Report:</span>
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

        {/* Filter Badges: Consent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Consent:</span>
          {['All', 'Consented', 'Pending'].map(cs => (
            <button
              key={cs}
              type="button"
              onClick={() => setConsentFilter(cs)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: consentFilter === cs ? 800 : 600,
                cursor: 'pointer',
                backgroundColor: consentFilter === cs ? '#00C9A7' : '#F1F5F9',
                color: consentFilter === cs ? '#0A2520' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {cs}
            </button>
          ))}
        </div>
      </div>

      {/* ── EXACT REQUESTED PATIENT TABLE ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid rgba(15, 91, 76, 0.08)',
        boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
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
                backgroundColor: '#FAF8F5',
                borderBottom: '1px solid rgba(15, 91, 76, 0.1)',
                color: '#0F5B4C',
                fontSize: '12.5px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <th style={{ padding: '16px 20px' }}>Patient</th>
                <th style={{ padding: '16px 20px' }}>Phone</th>
                <th style={{ padding: '16px 20px' }}>Report status</th>
                <th style={{ padding: '16px 20px' }}>Communication Consent</th>
                <th style={{ padding: '16px 20px', textAlign: 'center' }}>Action</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Manage</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '50px 20px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={18} className="animate-spin" color="#00C9A7" />
                      <span>Loading Patient Registry...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748B' }}>
                    <Users size={36} color="#94A3B8" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#0A2520' }}>No patients found</div>
                    <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Try resetting your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                patients.map(p => {
                  const isReady = p.report_status === 'Ready';
                  const isConsented = p.communication_consent?.status === 'Consented';

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid rgba(15, 91, 76, 0.06)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF8F5'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Column 1: Patient */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: isReady ? '#EDFDF9' : '#F1F5F9',
                            color: isReady ? '#0F5B4C' : '#475569',
                            fontWeight: 800,
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div 
                              onClick={() => handleOpenDetails(p)}
                              style={{ 
                                fontWeight: 800, 
                                color: '#0A2520', 
                                fontSize: '14px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#00C9A7'}
                              onMouseLeave={e => e.currentTarget.style.color = '#0A2520'}
                            >
                              <span>{p.name}</span>
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span style={{ fontFamily: 'monospace', color: '#94A3B8' }}>{p.id}</span>
                              {p.age && <span>· {p.age} yrs</span>}
                              {p.gender && <span>· {p.gender}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Phone */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 600, color: '#0A2520' }}>
                          <Phone size={13} color="#00C9A7" />
                          <span style={{ fontFamily: 'monospace' }}>
                            {showFullPhone ? p.phone : (p.masked_phone || p.phone)}
                          </span>
                        </div>
                        {p.email && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                            {p.email}
                          </div>
                        )}
                      </td>

                      {/* Column 3: Report status */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '12px',
                          fontWeight: 800,
                          backgroundColor: isReady ? 'rgba(0, 201, 167, 0.15)' : '#FEF3C7',
                          color: isReady ? '#0F5B4C' : '#B45309',
                          border: isReady ? '1px solid rgba(0, 201, 167, 0.3)' : '1px solid #FDE68A'
                        }}>
                          {isReady ? <CheckCircle2 size={13} color="#00C9A7" /> : <Clock size={13} color="#D97706" />}
                          <span>{p.report_status}</span>
                        </span>
                        {p.report_type && (
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                            {p.report_type}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Communication Consent */}
                      <td style={{ padding: '16px 20px' }}>
                        <div 
                          onClick={() => handleOpenConsent(p)}
                          style={{ cursor: 'pointer', display: 'inline-block' }}
                          title="Click to update or review communication consent"
                        >
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 9px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            backgroundColor: isConsented ? '#DCFAF3' : '#F1F5F9',
                            color: isConsented ? '#007A65' : '#64748B',
                            border: isConsented ? '1px solid #A7F3D0' : '1px solid #E2E8F0'
                          }}>
                            <ShieldCheck size={13} color={isConsented ? '#007A65' : '#94A3B8'} />
                            <span>{p.communication_consent?.status || 'Pending'}</span>
                          </span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '3px' }}>
                          {isConsented ? (p.communication_consent?.channels || []).join(', ') : 'Verification Required'}
                        </div>
                      </td>

                      {/* Column 5: EXACT Action requested (Notify for Ready, '—' for Processing) */}
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        {isReady ? (
                          <button
                            type="button"
                            onClick={() => handleOpenNotify(p)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '7px 16px',
                              borderRadius: '8px',
                              backgroundColor: '#0F5B4C',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '12.5px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(15, 91, 76, 0.2)',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00C9A7'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0F5B4C'}
                          >
                            <Send size={13} />
                            <span>Notify</span>
                          </button>
                        ) : (
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 800,
                            color: '#94A3B8',
                            display: 'inline-block',
                            padding: '4px 10px'
                          }}>
                            —
                          </span>
                        )}
                      </td>

                      {/* Column 6: Manage Quick Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(p)}
                            title="View Patient Details"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              color: '#0F5B4C',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EDFDF9'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Patient"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenConsent(p)}
                            title="Record Consent"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              color: '#007A65',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DCFAF3'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          >
                            <ShieldCheck size={14} />
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

      {/* ── MODAL 1: ADD PATIENT ── */}
      {isAddModalOpen && (
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
            borderRadius: '20px',
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
              onClick={() => setIsAddModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Register New Patient
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>Add patient to directory with report tracking & communication consent.</p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 8897371942"
                    value={addForm.phone}
                    onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={addForm.email}
                    onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 38"
                    value={addForm.age}
                    onChange={e => setAddForm({ ...addForm, age: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Gender
                  </label>
                  <select
                    value={addForm.gender}
                    onChange={e => setAddForm({ ...addForm, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Diagnostic Test Info */}
              <div style={{ padding: '14px', backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid rgba(15, 91, 76, 0.08)' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F5B4C', marginBottom: '8px' }}>
                  Diagnostic Report Status
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                      Status
                    </label>
                    <select
                      value={addForm.report_status}
                      onChange={e => setAddForm({ ...addForm, report_status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <option value="Processing">Processing (Lab Testing)</option>
                      <option value="Ready">Ready (Ready to Notify)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                      Report Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lipid Profile"
                      value={addForm.report_type}
                      onChange={e => setAddForm({ ...addForm, report_type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Communication Consent Section */}
              <div style={{ padding: '14px', backgroundColor: '#EDFDF9', borderRadius: '12px', border: '1px solid rgba(0, 201, 167, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 800, color: '#0F5B4C', marginBottom: '6px' }}>
                  <ShieldCheck size={16} color="#00C9A7" />
                  <span>Communication Consent (DPDP / HIPAA Compliance)</span>
                </div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#0A2520', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    checked={addForm.consent_status === 'Consented'}
                    onChange={e => setAddForm({ ...addForm, consent_status: e.target.checked ? 'Consented' : 'Pending' })}
                    style={{ marginTop: '2px', accentColor: '#00C9A7' }}
                  />
                  <span>
                    Patient gives explicit consent for CareConnect AI and clinic reception to deliver automated test report updates, follow-ups, and reminders via Priya Voice AI and SMS.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                  }}
                >
                  {actionLoading ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT PATIENT ── */}
      {isEditModalOpen && selectedPatient && (
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
            borderRadius: '20px',
            maxWidth: '540px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit2 size={18} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Edit Patient Details
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>Updating record for {selectedPatient.name} ({selectedPatient.id})</p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Report Status
                  </label>
                  <select
                    value={editForm.report_status}
                    onChange={e => setEditForm({ ...editForm, report_status: e.target.value })}
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
                    <option value="Processing">Processing (Lab Assay Active)</option>
                    <option value="Ready">Ready (Notify Available)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Report Type
                  </label>
                  <input
                    type="text"
                    value={editForm.report_type}
                    onChange={e => setEditForm({ ...editForm, report_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Clinical Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.clinical_notes}
                  onChange={e => setEditForm({ ...editForm, clinical_notes: e.target.value })}
                  placeholder="Internal notes for physicians & reception..."
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
                  onClick={() => setIsEditModalOpen(false)}
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
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: RECORD COMMUNICATION CONSENT ── */}
      {isConsentModalOpen && selectedPatient && (
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
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsConsentModalOpen(false)}
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
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>Audit trail for {selectedPatient.name} ({selectedPatient.id})</p>
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
                      onClick={() => setConsentForm({ ...consentForm, status: st })}
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

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Consent Source / Verification Method
                </label>
                <select
                  value={consentForm.source}
                  onChange={e => setConsentForm({ ...consentForm, source: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="Front Desk Verbal Verification">Front Desk Verbal Verification</option>
                  <option value="Digital Intake Form">Digital Intake Form</option>
                  <option value="Priya AI Inbound Call Verification">Priya AI Inbound Call Verification</option>
                  <option value="Physical Signed Form">Physical Signed Form</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Auditor / Receptionist Notes
                </label>
                <textarea
                  rows={2}
                  value={consentForm.consent_notes}
                  onChange={e => setConsentForm({ ...consentForm, consent_notes: e.target.value })}
                  placeholder="Record verification context or explicit patient wishes..."
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
                  onClick={() => setIsConsentModalOpen(false)}
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
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Recording...' : 'Record Consent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: VIEW PATIENT DETAILS DRAWER / MODAL ── */}
      {isDetailsModalOpen && selectedPatient && (
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
            maxWidth: '640px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsDetailsModalOpen(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                backgroundColor: selectedPatient.report_status === 'Ready' ? '#EDFDF9' : '#FAF8F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 900,
                color: '#0F5B4C',
                border: '2px solid rgba(0, 201, 167, 0.3)'
              }}>
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {selectedPatient.name}
                  </h3>
                  <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569', fontFamily: 'monospace' }}>
                    {selectedPatient.id}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <Phone size={13} color="#00C9A7" />
                  <span style={{ fontFamily: 'monospace' }}>{selectedPatient.phone}</span>
                  {selectedPatient.email && (
                    <>
                      <span>·</span>
                      <Mail size={13} color="#00C9A7" />
                      <span>{selectedPatient.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Section 1: Diagnostic Report Card */}
            <div style={{
              padding: '18px',
              borderRadius: '14px',
              backgroundColor: '#FAF8F5',
              border: '1px solid rgba(15, 91, 76, 0.08)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Diagnostic Report
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  backgroundColor: selectedPatient.report_status === 'Ready' ? '#EDFDF9' : '#FEF3C7',
                  color: selectedPatient.report_status === 'Ready' ? '#0F5B4C' : '#B45309'
                }}>
                  {selectedPatient.report_status === 'Ready' ? <CheckCircle2 size={13} color="#00C9A7" /> : <Clock size={13} color="#D97706" />}
                  <span>{selectedPatient.report_status}</span>
                </span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520', marginBottom: '4px' }}>
                {selectedPatient.report_type || 'Comprehensive Lab Test'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Reference ID: <strong style={{ color: '#0A2520', fontFamily: 'monospace' }}>{selectedPatient.report_id || 'RPT-1001'}</strong>
              </div>
            </div>

            {/* Section 2: Communication Consent Audit */}
            <div style={{
              padding: '18px',
              borderRadius: '14px',
              backgroundColor: selectedPatient.communication_consent?.status === 'Consented' ? '#EDFDF9' : '#F8FAFC',
              border: '1px solid rgba(0, 201, 167, 0.25)',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 800, color: '#0F5B4C' }}>
                  <ShieldCheck size={16} color="#00C9A7" />
                  <span>Communication Consent Audit</span>
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: selectedPatient.communication_consent?.status === 'Consented' ? '#DCFAF3' : '#F1F5F9',
                  color: selectedPatient.communication_consent?.status === 'Consented' ? '#007A65' : '#64748B'
                }}>
                  {selectedPatient.communication_consent?.status || 'Pending'}
                </span>
              </div>

              <p style={{ margin: '0 0 8px', fontSize: '12.5px', color: '#0A2520', lineHeight: 1.5 }}>
                {selectedPatient.communication_consent?.consent_notes || 'Explicit consent recorded for automated voice notifications.'}
              </p>

              <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <div><strong>Source:</strong> {selectedPatient.communication_consent?.source || 'Front Desk'}</div>
                <div><strong>Channels:</strong> {(selectedPatient.communication_consent?.channels || []).join(', ') || 'Voice Call, SMS'}</div>
              </div>
            </div>

            {/* Clinical Notes */}
            {selectedPatient.clinical_notes && (
              <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Clinical Notes
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                  {selectedPatient.clinical_notes}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenEdit(selectedPatient);
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0A2520',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Edit Patient
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenConsent(selectedPatient);
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: '10px',
                  border: '1px solid #00C9A7',
                  backgroundColor: '#EDFDF9',
                  color: '#0F5B4C',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Update Consent
              </button>

              {selectedPatient.report_status === 'Ready' && (
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    handleOpenNotify(selectedPatient);
                  }}
                  style={{
                    flex: 1.5,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={14} />
                  <span>Notify Patient</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: NOTIFY PATIENT CONFIRMATION ── */}
      {isNotifyModalOpen && selectedPatient && (
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
            borderRadius: '20px',
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsNotifyModalOpen(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Send size={22} color="#0F5B4C" />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Dispatch Patient Notification?
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '13.5px', color: '#64748B', lineHeight: 1.5 }}>
              Trigger automated notification to <strong>{selectedPatient.name}</strong> regarding ready report (<strong style={{ color: '#0A2520' }}>{selectedPatient.report_type || 'Diagnostic Report'}</strong>).
            </p>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FAF8F5', border: '1px solid rgba(15, 91, 76, 0.08)', marginBottom: '20px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Primary Channel:</span>
                <strong style={{ color: '#0F5B4C' }}>Priya AI Voice Call & SMS</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Recipient Number:</span>
                <strong style={{ fontFamily: 'monospace' }}>{selectedPatient.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Consent Status:</span>
                <strong style={{ color: '#007A65' }}>{selectedPatient.communication_consent?.status || 'Consented'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsNotifyModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '11px',
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
                type="button"
                onClick={handleNotifySubmit}
                disabled={actionLoading}
                style={{
                  flex: 2,
                  padding: '11px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                }}
              >
                <Send size={14} />
                <span>{actionLoading ? 'Dispatching...' : 'Dispatch Notification'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


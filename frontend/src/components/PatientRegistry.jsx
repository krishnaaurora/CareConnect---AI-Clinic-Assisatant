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
  PhoneCall,
  MessageSquare,
  MessageCircle,
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
  ArrowRight,
  Heart,
  MapPin,
  UserCheck,
  Download,
  AlertTriangle,
  Stethoscope,
  Activity,
  Copy
} from 'lucide-react';
import {
  fetchPatients,
  fetchPatientMetrics,
  fetchPatientAppointments,
  fetchPatientReports,
  createPatient,
  updatePatient,
  recordPatientConsent,
  notifyPatient,
  checkPhoneRegistered
} from '../api/client';
import BackgroundPattern from './common/BackgroundPattern';

export default function PatientRegistry() {
  const [patients, setPatients] = useState([]);
  const [metrics, setMetrics] = useState({
    total_patients: 0,
    reports_ready: 0,
    reports_processing: 0,
    consented_count: 0,
    pending_consent_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All | Ready | Processing
  const [consentFilter, setConsentFilter] = useState('All'); // All | Consented | Pending | Revoked
  const [genderFilter, setGenderFilter] = useState('All'); // All | Male | Female | Other
  const [bloodGroupFilter, setBloodGroupFilter] = useState('All'); // All | O+ | A+ | B+ | AB+ etc.
  const [showFullPhone, setShowFullPhone] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  
  // Selected Patient for actions & profile drawer
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeDetailsTab, setActiveDetailsTab] = useState('demographics'); // 'demographics' | 'appointments' | 'reports' | 'consent'
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientReports, setPatientReports] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
    blood_group: 'O+',
    address: '',
    city: 'Bengaluru',
    pincode: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: 'Spouse',
    report_status: 'Processing',
    report_type: 'Comprehensive Metabolic Panel',
    consent_status: 'Pending',
    consent_channels: [],
    consent_source: 'Clinical Intake Form',
    consent_notes: 'Awaiting patient communication agreement.',
    clinical_notes: ''
  });
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Form states: Edit Patient
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    blood_group: 'O+',
    address: '',
    city: 'Bengaluru',
    pincode: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: 'Family',
    report_status: 'Processing',
    report_type: '',
    clinical_notes: '',
    consent_status: 'Pending',
    consent_channels: [],
    consent_source: 'Front Desk Verbal Verification',
    consent_notes: ''
  });

  // Form states: Record Consent
  const [consentForm, setConsentForm] = useState({
    status: 'Consented',
    channels: ['Voice AI Call', 'SMS', 'WhatsApp'],
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
          consent_status: consentFilter,
          gender: genderFilter,
          blood_group: bloodGroupFilter
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
  }, [searchQuery, statusFilter, consentFilter, genderFilter, bloodGroupFilter]);

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Check duplicate phone on blur in Add Modal
  const handleCheckPhone = async (phone) => {
    const clean = (phone || '').replace(/\D/g, '');
    if (clean.length >= 10) {
      try {
        const res = await checkPhoneRegistered(phone);
        if (res.registered && res.patient) {
          setDuplicateWarning(`A patient with phone ${phone} is already registered as ${res.patient.name} (${res.patient.id}).`);
        } else {
          setDuplicateWarning(null);
        }
      } catch {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  // Load appointment history and diagnostic reports for a patient
  const loadPatientHistory = async (patient) => {
    if (!patient || !patient.id) return;
    setHistoryLoading(true);
    try {
      const [appts, rpts] = await Promise.all([
        fetchPatientAppointments(patient.id),
        fetchPatientReports(patient.id)
      ]);
      setPatientAppointments(appts || []);
      setPatientReports(rpts || []);
    } catch (err) {
      console.warn('Failed to load patient history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Open Details Modal / Drawer
  const handleOpenDetails = (patient, initialTab = 'demographics') => {
    setSelectedPatient(patient);
    setActiveDetailsTab(initialTab);
    setIsDetailsModalOpen(true);
    loadPatientHistory(patient);
  };

  // Open Edit Modal with selected patient
  const handleOpenEdit = (patient) => {
    setSelectedPatient(patient);
    const consent = patient.communication_consent || {};
    setEditForm({
      name: patient.name || '',
      phone: patient.phone || '',
      email: patient.email || '',
      age: patient.age || '',
      gender: patient.gender || 'Male',
      blood_group: patient.blood_group || 'O+',
      address: patient.address || '',
      city: patient.city || 'Bengaluru',
      pincode: patient.pincode || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      emergency_contact_relation: patient.emergency_contact_relation || 'Family',
      report_status: patient.report_status || 'Processing',
      report_type: patient.report_type || '',
      clinical_notes: patient.clinical_notes || '',
      consent_status: consent.status || 'Pending',
      consent_channels: consent.channels || [],
      consent_source: consent.source || 'Front Desk Verbal Verification',
      consent_notes: consent.consent_notes || ''
    });
    setIsEditModalOpen(true);
  };

  // Open Consent Modal
  const handleOpenConsent = (patient) => {
    setSelectedPatient(patient);
    const existingChannels = patient.communication_consent?.channels;
    setConsentForm({
      status: patient.communication_consent?.status || 'Consented',
      channels: Array.isArray(existingChannels) && existingChannels.length > 0
        ? [...existingChannels]
        : ['Voice AI Call', 'SMS', 'WhatsApp'],
      source: patient.communication_consent?.source || 'Front Desk Verbal Verification',
      recorded_by: 'Staff Receptionist',
      consent_notes: patient.communication_consent?.consent_notes || 'Patient verified preference for automated voice, SMS & WhatsApp communications.'
    });
    setIsConsentModalOpen(true);
  };

  // Open Notify Modal
  const handleOpenNotify = (patient) => {
    setSelectedPatient(patient);
    setIsNotifyModalOpen(true);
  };

  // Copy helper
  const handleCopy = (text, label) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    }
  };

  // Submit Add Patient
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.phone.trim()) {
      showToast('Patient name and phone number are required', true);
      return;
    }
    const cleanDigits = addForm.phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      showToast('Please enter a valid 10-digit mobile number', true);
      return;
    }

    setActionLoading(true);
    try {
      const res = await createPatient({
        ...addForm,
        age: addForm.age ? parseInt(addForm.age, 10) : undefined
      });
      showToast(res.message || `Patient "${addForm.name}" registered successfully!`);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        phone: '',
        email: '',
        age: '',
        gender: 'Male',
        blood_group: 'O+',
        address: '',
        city: 'Bengaluru',
        pincode: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: 'Spouse',
        report_status: 'Processing',
        report_type: 'Comprehensive Metabolic Panel',
        consent_status: 'Pending',
        consent_channels: [],
        consent_source: 'Clinical Intake Form',
        consent_notes: 'Awaiting patient communication agreement.',
        clinical_notes: ''
      });
      setDuplicateWarning(null);
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
      const res = await updatePatient(selectedPatient.id, {
        ...editForm,
        age: editForm.age ? parseInt(editForm.age, 10) : undefined
      });
      showToast(`Patient "${editForm.name}" updated successfully!`);
      setIsEditModalOpen(false);
      loadData();
      if (isDetailsModalOpen) {
        setSelectedPatient(res.data || { ...selectedPatient, ...editForm });
      }
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
      if (isDetailsModalOpen) {
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
    const consent = selectedPatient.communication_consent || {};
    const isConsented = (consent.status || '').toLowerCase() === 'consented';
    const channels = consent.channels || [];
    const hasVoice = channels.some(c => c.toLowerCase().includes('voice'));

    if (!isConsented) {
      showToast(`Automated voice call blocked: Patient communication consent is '${consent.status || 'Pending'}'. Explicit consent is required.`, true);
      return;
    }
    if (!hasVoice) {
      showToast(`Automated voice call blocked: Patient has not consented to 'Voice AI Call'. Consented channels: ${channels.join(', ') || 'None'}.`, true);
      return;
    }

    setActionLoading(true);
    try {
      await notifyPatient(selectedPatient.id, {
        channel: 'Voice AI Call & SMS',
        custom_message: `CareConnect AI: Dear ${selectedPatient.name}, your diagnostic report (${selectedPatient.report_type || 'Lab Results'}) is ready for review.`
      });
      showToast(`Notification queued via Priya Voice AI & SMS to ${selectedPatient.name}!`);
      setIsNotifyModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to notify patient', true);
    } finally {
      setActionLoading(false);
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
          backgroundColor: toastMessage.isError ? '#FEF2F2' : '#0F5B4C',
          color: toastMessage.isError ? '#DC2626' : '#FFFFFF',
          border: toastMessage.isError ? '1px solid #FECACA' : '1px solid #00C9A7',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.16)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: 700,
          fontFamily: 'Inter, sans-serif'
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
            title="Refresh patient records"
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
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDuplicateWarning(null);
              setIsAddModalOpen(true);
            }}
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
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>Register Patient</span>
          </button>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '26px'
      }}>
        {/* Card 1: Total Patients */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#EDFDF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={22} color="#0F5B4C" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Patients
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.total_patients || patients.length || 0}
            </div>
          </div>
        </div>

        {/* Card 2: Reports Ready */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#EDFDF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle2 size={22} color="#00C9A7" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Reports Ready
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#007A65', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.reports_ready ?? 0}
            </div>
          </div>
        </div>

        {/* Card 3: Processing Reports */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={22} color="#D97706" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In-Lab Processing
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#B45309', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.reports_processing ?? 0}
            </div>
          </div>
        </div>

        {/* Card 4: Communication Consented */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#EDFDF9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={22} color="#0F5B4C" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Voice & SMS Consent
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F5B4C', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.consented_count ?? 0}
            </div>
          </div>
        </div>

        {/* Card 5: Pending Verification */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '18px 20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={22} color="#64748B" />
          </div>
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Consent
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#475569', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {metrics.pending_consent_count ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Multi-Filters Toolbar ── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '16px 20px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginBottom: '20px'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, phone, patient ID (e.g. PAT-1001), email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Report Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Report:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0A2520',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Reports</option>
              <option value="Ready">Ready</option>
              <option value="Processing">Processing</option>
            </select>
          </div>

          {/* Consent Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Consent:</span>
            <select
              value={consentFilter}
              onChange={e => setConsentFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0A2520',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Consent</option>
              <option value="Consented">Consented</option>
              <option value="Pending">Pending</option>
              <option value="Revoked">Revoked</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Gender:</span>
            <select
              value={genderFilter}
              onChange={e => setGenderFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0A2520',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer'
              }}
            >
              <option value="All">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>Blood:</span>
            <select
              value={bloodGroupFilter}
              onChange={e => setBloodGroupFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#0A2520',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Patient Directory Table ── */}
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
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Patient ID
                </th>
                <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Patient Demographics
                </th>
                <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Contact Information
                </th>
                <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Diagnostic Report
                </th>
                <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Call & SMS Consent
                </th>
                <th style={{ padding: '14px 18px', fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', display: 'block', color: '#0F5B4C' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading patient records...</span>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <Users size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#94A3B8' }} />
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A2520', marginBottom: '4px' }}>
                      No patients found
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      Try adjusting your search query or filters, or register a new patient.
                    </div>
                  </td>
                </tr>
              ) : (
                patients.map(p => {
                  const consent = p.communication_consent || {};
                  const isConsented = (consent.status || '').toLowerCase() === 'consented';
                  const isPending = (consent.status || '').toLowerCase() === 'pending';
                  const isRevoked = (consent.status || '').toLowerCase() === 'revoked';
                  const channels = consent.channels || [];
                  const hasVoice = channels.some(c => c.toLowerCase().includes('voice'));

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {/* Column 1: Patient ID */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#EDFDF9',
                            color: '#0F5B4C',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            fontWeight: 800,
                            border: '1px solid rgba(0, 201, 167, 0.25)'
                          }}>
                            {p.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(p.id, 'Patient ID')}
                            title="Copy Patient ID"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Column 2: Demographics */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: p.report_status === 'Ready' ? '#EDFDF9' : '#F1F5F9',
                            color: p.report_status === 'Ready' ? '#0F5B4C' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            fontWeight: 900
                          }}>
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0A2520' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span>{p.gender || 'Unspecified'}</span>
                              {p.age && <span>• {p.age} yrs</span>}
                              {p.blood_group && (
                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: 800,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  backgroundColor: '#FEE2E2',
                                  color: '#991B1B'
                                }}>
                                  {p.blood_group}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Contact Info */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0A2520', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={12} color="#00C9A7" />
                            <span>{showFullPhone ? p.phone : (p.masked_phone || p.phone)}</span>
                          </div>
                          {p.email ? (
                            <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Mail size={11} color="#94A3B8" />
                              <span>{p.email}</span>
                            </div>
                          ) : p.city ? (
                            <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <MapPin size={11} color="#94A3B8" />
                              <span>{p.city}</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Column 4: Diagnostic Report */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: p.report_status === 'Ready' ? '#EDFDF9' : '#FEF3C7',
                              color: p.report_status === 'Ready' ? '#007A65' : '#B45309'
                            }}>
                              {p.report_status === 'Ready' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                              <span>{p.report_status}</span>
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                            {p.report_type || 'General Lab Report'}
                          </div>
                        </div>
                      </td>

                      {/* Column 5: Communication Consent */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: isConsented ? '#EDFDF9' : (isRevoked ? '#FEE2E2' : '#F1F5F9'),
                              color: isConsented ? '#007A65' : (isRevoked ? '#991B1B' : '#475569')
                            }}>
                              <ShieldCheck size={11} />
                              <span>{consent.status || 'Pending'}</span>
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            {channels.map(ch => (
                              <span
                                key={ch}
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  backgroundColor: ch.toLowerCase().includes('voice') ? '#E6FFFA' : '#F1F5F9',
                                  color: ch.toLowerCase().includes('voice') ? '#047481' : '#64748B'
                                }}
                              >
                                {ch.includes('Voice') ? 'Voice AI' : ch}
                              </span>
                            ))}
                            {isConsented && !hasVoice && (
                              <span style={{ fontSize: '10px', fontWeight: 700, color: '#D97706' }}>
                                (No Voice)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Actions */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* View Full Profile & History */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(p, 'demographics')}
                            title="View Patient Record & History"
                            style={{
                              padding: '7px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#0F5B4C',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Edit Patient */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            title="Edit Patient Details"
                            style={{
                              padding: '7px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Manage Consent */}
                          <button
                            type="button"
                            onClick={() => handleOpenConsent(p)}
                            title="Update Call & Communication Consent"
                            style={{
                              padding: '7px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: isConsented ? '#007A65' : '#D97706',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ShieldCheck size={14} />
                          </button>

                          {/* Dispatch Notification (Priya Voice AI) */}
                          <button
                            type="button"
                            onClick={() => handleOpenNotify(p)}
                            title={p.report_status === 'Ready' ? 'Dispatch Voice AI Notification' : 'Report is still processing'}
                            disabled={p.report_status !== 'Ready'}
                            style={{
                              padding: '7px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: p.report_status === 'Ready' ? '#0F5B4C' : '#E2E8F0',
                              color: p.report_status === 'Ready' ? '#FFFFFF' : '#94A3B8',
                              cursor: p.report_status === 'Ready' ? 'pointer' : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Send size={14} />
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

      {/* ── MODAL 1: REGISTER NEW PATIENT ── */}
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
            maxWidth: '650px',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Register New Patient
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  System will automatically generate unique ID (<code style={{ color: '#0F5B4C', fontWeight: 700 }}>PAT-XXXX</code>) and store encrypted record.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Demographics Row 1: Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
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
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Phone Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={addForm.phone}
                    onChange={e => {
                      setAddForm({ ...addForm, phone: e.target.value });
                      handleCheckPhone(e.target.value);
                    }}
                    onBlur={() => handleCheckPhone(addForm.phone)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: duplicateWarning ? '1px solid #DC2626' : '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Duplicate Phone Warning */}
              {duplicateWarning && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              {/* Demographics Row 2: Age, Gender, Blood Group */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="125"
                    placeholder="e.g. 35"
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
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Blood Group
                  </label>
                  <select
                    value={addForm.blood_group}
                    onChange={e => setAddForm({ ...addForm, blood_group: e.target.value })}
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
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* Contact Row 3: Email & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
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
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    City / Locality
                  </label>
                  <input
                    type="text"
                    placeholder="Bengaluru"
                    value={addForm.city}
                    onChange={e => setAddForm({ ...addForm, city: e.target.value })}
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

              {/* Address & Emergency Contact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Residential Address
                  </label>
                  <input
                    type="text"
                    placeholder="Street, Apartment or Area"
                    value={addForm.address}
                    onChange={e => setAddForm({ ...addForm, address: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Emergency Contact Name & Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Anita (9876543210)"
                    value={addForm.emergency_contact_name}
                    onChange={e => setAddForm({ ...addForm, emergency_contact_name: e.target.value })}
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

              {/* Initial Diagnostic Test */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Initial Diagnostic Report Status
                  </label>
                  <select
                    value={addForm.report_status}
                    onChange={e => setAddForm({ ...addForm, report_status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Processing">Processing (In Lab)</option>
                    <option value="Ready">Ready (Verified)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Initial Test Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={addForm.report_type}
                    onChange={e => setAddForm({ ...addForm, report_type: e.target.value })}
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

              {/* Communication Consent Section */}
              <div style={{ padding: '16px', backgroundColor: '#EDFDF9', borderRadius: '12px', border: '1px solid rgba(0, 201, 167, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#0F5B4C' }}>
                    <ShieldCheck size={16} color="#00C9A7" />
                    <span>Call & SMS Consent (DPDP / HIPAA Compliant)</span>
                  </div>
                  <select
                    value={addForm.consent_status}
                    onChange={e => {
                      const newStatus = e.target.value;
                      const newChannels = newStatus === 'Revoked' ? [] : (newStatus === 'Consented' && (!addForm.consent_channels || addForm.consent_channels.length === 0) ? ['Voice AI Call', 'SMS', 'WhatsApp'] : addForm.consent_channels);
                      setAddForm({ ...addForm, consent_status: newStatus, consent_channels: newChannels });
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      color: addForm.consent_status === 'Consented' ? '#007A65' : (addForm.consent_status === 'Revoked' ? '#B91C1C' : '#B45309')
                    }}
                  >
                    <option value="Pending">Pending Verification</option>
                    <option value="Consented">Consented (Agreed)</option>
                    <option value="Revoked">Revoked / Opted-Out</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {[
                    { id: 'Voice AI Call', label: 'Voice AI Call', icon: PhoneCall },
                    { id: 'SMS', label: 'SMS Alerts', icon: MessageSquare },
                    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle }
                  ].map(ch => {
                    const isChecked = (addForm.consent_channels || []).includes(ch.id);
                    const IconComp = ch.icon;
                    return (
                      <label
                        key={ch.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: isChecked ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                          border: isChecked ? '1.5px solid #00C9A7' : '1px solid #CBD5E1',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#0A2520'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            const cur = addForm.consent_channels || [];
                            const updated = e.target.checked
                              ? [...cur, ch.id]
                              : cur.filter(c => c !== ch.id);
                            setAddForm({
                              ...addForm,
                              consent_channels: updated,
                              consent_status: updated.length > 0 ? 'Consented' : 'Pending'
                            });
                          }}
                          style={{ accentColor: '#00C9A7' }}
                        />
                        <IconComp size={13} color={isChecked ? '#007A65' : '#64748B'} />
                        <span>{ch.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Clinical / Medical Intake Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Known allergies, referring doctor, or intake notes..."
                  value={addForm.clinical_notes}
                  onChange={e => setAddForm({ ...addForm, clinical_notes: e.target.value })}
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

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
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
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT PATIENT DEMOGRAPHICS ── */}
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
            maxWidth: '650px',
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
                <Edit2 size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Edit Patient Profile: {selectedPatient.name}
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  Update demographics, contact information, blood group and preferences for {selectedPatient.id}.
                </p>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Patient Full Name *
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
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Phone Number *
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={e => setEditForm({ ...editForm, age: e.target.value })}
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
                    value={editForm.gender}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Blood Group
                  </label>
                  <select
                    value={editForm.blood_group}
                    onChange={e => setEditForm({ ...editForm, blood_group: e.target.value })}
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
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Email
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
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={e => setEditForm({ ...editForm, city: e.target.value })}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
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
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={editForm.emergency_contact_name}
                    onChange={e => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
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

              {/* Clinical Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#0A2520', marginBottom: '6px' }}>
                  Clinical Notes
                </label>
                <textarea
                  rows={2}
                  value={editForm.clinical_notes}
                  onChange={e => setEditForm({ ...editForm, clinical_notes: e.target.value })}
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
                  Manage Communication Consent
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
                    ⚠️ Note: 'Voice AI Call' is unselected. Automated Priya voice calls will be blocked until voice consent is granted.
                  </div>
                )}
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

      {/* ── MODAL 4: COMPREHENSIVE PATIENT HEALTH RECORD & HISTORY MODAL ── */}
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
            maxWidth: '780px',
            width: '100%',
            padding: '30px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: selectedPatient.report_status === 'Ready' ? '#EDFDF9' : '#FAF8F5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 900,
                color: '#0F5B4C',
                border: '2px solid rgba(0, 201, 167, 0.3)'
              }}>
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {selectedPatient.name}
                  </h3>
                  <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EDFDF9', color: '#0F5B4C', fontFamily: 'monospace', border: '1px solid rgba(0, 201, 167, 0.25)' }}>
                    {selectedPatient.id}
                  </span>
                  {selectedPatient.blood_group && (
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      Blood: {selectedPatient.blood_group}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} color="#00C9A7" />
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedPatient.phone}</span>
                  </span>
                  {selectedPatient.email && (
                    <>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={13} color="#00C9A7" />
                        <span>{selectedPatient.email}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              gap: '6px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              {[
                { id: 'demographics', label: 'Demographics & Overview', icon: Users },
                { id: 'appointments', label: `Appointment History (${patientAppointments.length})`, icon: Calendar },
                { id: 'reports', label: `Diagnostic Reports (${patientReports.length || (selectedPatient.report_status ? 1 : 0)})`, icon: FileText },
                { id: 'consent', label: 'Call Consent & Channels', icon: ShieldCheck }
              ].map(tab => {
                const isActive = activeDetailsTab === tab.id;
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveDetailsTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
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
                  </button>
                );
              })}
            </div>

            {/* TAB 1: DEMOGRAPHICS & OVERVIEW */}
            {activeDetailsTab === 'demographics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Personal Demographics */}
                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Basic Demographics
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Age:</span>
                        <strong style={{ color: '#0A2520' }}>{selectedPatient.age ? `${selectedPatient.age} Years` : 'Not recorded'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Gender:</span>
                        <strong style={{ color: '#0A2520' }}>{selectedPatient.gender || 'Unspecified'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Blood Group:</span>
                        <strong style={{ color: '#991B1B' }}>{selectedPatient.blood_group || 'O+'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Registered Since:</span>
                        <strong style={{ color: '#0A2520' }}>{selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString() : 'Active'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Emergency Contact
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Contact Person:</span>
                        <strong style={{ color: '#0A2520' }}>{selectedPatient.emergency_contact_name || 'Family / Relative'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Relationship:</span>
                        <strong style={{ color: '#0A2520' }}>{selectedPatient.emergency_contact_relation || 'Family'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>Emergency Phone:</span>
                        <strong style={{ fontFamily: 'monospace', color: '#0F5B4C' }}>
                          {selectedPatient.emergency_contact_phone || selectedPatient.phone}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Residential Address */}
                <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Residential Address & Locality
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#0A2520', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#00C9A7" />
                    <span>{selectedPatient.address ? `${selectedPatient.address}, ${selectedPatient.city || 'Bengaluru'}` : `Bengaluru Urban, Karnataka`}</span>
                  </div>
                </div>

                {/* Clinical Notes */}
                {selectedPatient.clinical_notes && (
                  <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Clinical Intake Notes
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                      {selectedPatient.clinical_notes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: APPOINTMENT HISTORY */}
            {activeDetailsTab === 'appointments' && (
              <div>
                {historyLoading ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block', color: '#0F5B4C' }} />
                    <span>Loading appointment history...</span>
                  </div>
                ) : patientAppointments.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '14px' }}>
                    <Calendar size={32} color="#94A3B8" style={{ margin: '0 auto 10px', display: 'block' }} />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520', marginBottom: '4px' }}>
                      No prior appointments recorded
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                      No past or upcoming appointments found matching phone <strong style={{ fontFamily: 'monospace' }}>{selectedPatient.phone}</strong> or name <strong>{selectedPatient.name}</strong>.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {patientAppointments.map(appt => (
                      <div
                        key={appt.reference_id || Math.random()}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: '#FAF8F5',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#EDFDF9', color: '#0F5B4C', fontFamily: 'monospace' }}>
                              {appt.reference_id}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '999px',
                              backgroundColor: appt.status === 'VERIFIED_CONFIRMED' ? '#EDFDF9' : (appt.status === 'CANCELLED' ? '#FEE2E2' : '#FEF3C7'),
                              color: appt.status === 'VERIFIED_CONFIRMED' ? '#007A65' : (appt.status === 'CANCELLED' ? '#991B1B' : '#B45309')
                            }}>
                              {appt.status}
                            </span>
                            <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                              via {appt.source || 'CareConnect'}
                            </span>
                          </div>
                          <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0A2520' }}>
                            {appt.doctor_name || 'Attending Physician'}
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                            <span>{appt.specialty || 'General OPD'}</span>
                            <span>•</span>
                            <span>{appt.visit_type || 'In-Person Consultation'}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F5B4C', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                            <Calendar size={13} />
                            <span>{appt.preferred_date}</span>
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginTop: '2px' }}>
                            {appt.preferred_time || '10:00 AM'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DIAGNOSTIC REPORTS HISTORY */}
            {activeDetailsTab === 'reports' && (
              <div>
                {historyLoading ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px', display: 'block', color: '#0F5B4C' }} />
                    <span>Loading diagnostic reports...</span>
                  </div>
                ) : (patientReports.length === 0 && !selectedPatient.report_type) ? (
                  <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '14px' }}>
                    <FileText size={32} color="#94A3B8" style={{ margin: '0 auto 10px', display: 'block' }} />
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520', marginBottom: '4px' }}>
                      No diagnostic reports on file
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Render from collection or fallback to primary patient test */}
                    {(patientReports.length > 0 ? patientReports : [
                      {
                        id: selectedPatient.report_id || 'RPT-1001',
                        report_type: selectedPatient.report_type || 'Comprehensive Lab Test',
                        uploaded_date: 'Oct 30',
                        uploaded_time: '09:30 AM',
                        status: selectedPatient.report_status || 'Ready',
                        file_name: `${selectedPatient.name.replace(' ', '_')}_Diagnostic_Report.pdf`,
                        file_size: '1.4 MB',
                        notes: selectedPatient.clinical_notes || 'Verified by clinic pathologist.'
                      }
                    ]).map(rpt => (
                      <div
                        key={rpt.id}
                        style={{
                          padding: '16px',
                          borderRadius: '14px',
                          backgroundColor: '#FAF8F5',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#EDFDF9', color: '#0F5B4C', fontFamily: 'monospace' }}>
                              {rpt.id}
                            </span>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: rpt.status === 'Ready' ? '#EDFDF9' : '#FEF3C7',
                              color: rpt.status === 'Ready' ? '#007A65' : '#B45309'
                            }}>
                              {rpt.status === 'Ready' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                              <span>{rpt.status}</span>
                            </span>
                          </div>
                          <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0A2520' }}>
                            {rpt.report_type}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span>Uploaded: {rpt.uploaded_date || 'Recent'} {rpt.uploaded_time || ''}</span>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace' }}>{rpt.file_name || 'report.pdf'} ({rpt.file_size || '1.2 MB'})</span>
                          </div>
                          {rpt.notes && (
                            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '4px' }}>
                              <em>Notes: {rpt.notes}</em>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => showToast(`Opening PDF download for ${rpt.id}...`)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#0F5B4C',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <Download size={13} />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMMUNICATION CONSENT AUDIT */}
            {activeDetailsTab === 'consent' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '18px',
                  borderRadius: '14px',
                  backgroundColor: selectedPatient.communication_consent?.status === 'Consented' ? '#EDFDF9' : '#FAF8F5',
                  border: '1px solid rgba(0, 201, 167, 0.3)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#0F5B4C' }}>
                      <ShieldCheck size={18} color="#00C9A7" />
                      <span>DPDP Act / HIPAA Call Consent Status</span>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '6px',
                      backgroundColor: selectedPatient.communication_consent?.status === 'Consented' ? '#DCFAF3' : '#F1F5F9',
                      color: selectedPatient.communication_consent?.status === 'Consented' ? '#007A65' : '#64748B'
                    }}>
                      {selectedPatient.communication_consent?.status || 'Pending'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#0A2520', lineHeight: 1.5 }}>
                    {selectedPatient.communication_consent?.consent_notes || 'Patient explicit consent recorded for automated Priya Voice AI and SMS communications.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Verification Source:</span>
                      <strong style={{ color: '#0A2520' }}>{selectedPatient.communication_consent?.source || 'Front Desk'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Recorded By:</span>
                      <strong style={{ color: '#0A2520' }}>{selectedPatient.communication_consent?.recorded_by || 'Front Desk Reception'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Consent Timestamp:</span>
                      <strong style={{ color: '#0A2520' }}>{selectedPatient.communication_consent?.consented_at ? new Date(selectedPatient.communication_consent.consented_at).toLocaleString() : 'Pending agreement'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748B' }}>Authorized Notification Channels:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(selectedPatient.communication_consent?.channels || []).map(ch => (
                          <span
                            key={ch}
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: ch.includes('Voice') ? '#E6FFFA' : '#F1F5F9',
                              color: ch.includes('Voice') ? '#047481' : '#475569'
                            }}
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenConsent(selectedPatient);
                    }}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      backgroundColor: '#0F5B4C',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <ShieldCheck size={15} />
                    <span>Update Communication Consent</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Bottom Action Controls */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
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
                Edit Demographics
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
                Manage Consent
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
                  <span>Notify via Priya Voice AI</span>
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

            {(() => {
              const consent = selectedPatient.communication_consent || {};
              const isConsented = (consent.status || '').toLowerCase() === 'consented';
              const channels = consent.channels || [];
              const hasVoice = channels.some(c => c.toLowerCase().includes('voice'));
              const isBlocked = !isConsented || !hasVoice;

              return (
                <>
                  <div style={{
                    padding: '14px',
                    borderRadius: '12px',
                    backgroundColor: isBlocked ? '#FFFBEB' : '#FAF8F5',
                    border: isBlocked ? '1px solid #FDE68A' : '1px solid rgba(15, 91, 76, 0.08)',
                    marginBottom: '20px',
                    fontSize: '12.5px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748B' }}>Primary Channel:</span>
                      <strong style={{ color: '#0F5B4C' }}>Priya AI Voice Call & SMS</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748B' }}>Recipient Number:</span>
                      <strong style={{ fontFamily: 'monospace' }}>{selectedPatient.phone}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#64748B' }}>Consent Status:</span>
                      <strong style={{ color: isConsented ? '#007A65' : '#B45309' }}>{consent.status || 'Pending'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Allowed Channels:</span>
                      <strong style={{ color: '#0A2520' }}>{channels.length > 0 ? channels.join(', ') : 'None'}</strong>
                    </div>
                    {isBlocked && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #FCD34D', color: '#B45309', fontSize: '11.5px', lineHeight: 1.4 }}>
                        ⚠️ <strong>Action Required:</strong> {!isConsented ? `Patient communication consent is currently '${consent.status || 'Pending'}'. Explicit agreement is required before voice dispatch.` : `Patient has opted out of 'Voice AI Call'. Update channels to enable calling.`}
                      </div>
                    )}
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
                    {isBlocked ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotifyModalOpen(false);
                          handleOpenConsent(selectedPatient);
                        }}
                        style={{
                          flex: 2,
                          padding: '11px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: '#B45309',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <ShieldAlert size={14} />
                        <span>Record Consent First</span>
                      </button>
                    ) : (
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
                          cursor: actionLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {actionLoading ? 'Dispatching...' : 'Dispatch Notification'}
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* End Z-Index Wrapper */}
      </div>
    </div>
  );
}

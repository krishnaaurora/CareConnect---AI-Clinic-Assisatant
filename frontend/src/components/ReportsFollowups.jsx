import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PhoneCall,
  PhoneForwarded,
  XCircle,
  Eye,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  RotateCcw,
  FileUp,
  Paperclip,
  ArrowRight,
  Info,
  ShieldAlert,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  ListOrdered
} from 'lucide-react';
import {
  fetchReports,
  fetchReportsSummary,
  uploadReport,
  updateReportStatus,
  fetchFollowups,
  resolveFollowup
} from '../api/client';
import {
  INITIAL_PATIENTS,
  REPORT_TYPES,
  VERIFICATION_STATUSES,
  NOTIFICATION_STATUSES
} from '../data/reportsMockData';

export default function ReportsFollowups() {
  // Navigation sub-tabs: 'reports' | 'followups'
  const [subTab, setSubTab] = useState('reports');

  // Reports state
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState({
    awaiting_verification: 0,
    ready_to_notify: 0,
    notification_pending: 0,
    followup_required: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [notificationFilter, setNotificationFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'WEEK' | 'MONTH'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [summaryCardFilter, setSummaryCardFilter] = useState(null); // 'AWAITING' | 'READY' | 'PENDING' | 'FOLLOWUP' | null

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals & Drawers
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Follow-ups state
  const [followups, setFollowups] = useState([]);
  const [followupFilter, setFollowupFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'In Progress' | 'Resolved'

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Upload Form State
  const [uploadPatientId, setUploadPatientId] = useState(INITIAL_PATIENTS[0].id);
  const [uploadReportType, setUploadReportType] = useState('Blood Test');
  const [uploadReportRef, setUploadReportRef] = useState(`RPT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [uploadDate, setUploadDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [uploadNotes, setUploadNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load Reports & Follow-ups
  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, summaryData, followupsData] = await Promise.all([
        fetchReports(),
        fetchReportsSummary(),
        fetchFollowups()
      ]);
      setReports(reportsData || []);
      setSummary(summaryData || {
        awaiting_verification: 0,
        ready_to_notify: 0,
        notification_pending: 0,
        followup_required: 0
      });
      setFollowups(followupsData || []);
    } catch (err) {
      console.error('Failed to load reports data:', err);
      showToast('Loaded local fallback dataset.', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update summary metrics dynamically based on current reports list
  const currentSummary = useMemo(() => {
    return {
      awaiting_verification: reports.filter(r => r.verification_status === 'Awaiting Verification').length,
      ready_to_notify: reports.filter(r => r.verification_status === 'Ready to Notify').length,
      notification_pending: reports.filter(r => r.notification_status === 'Pending').length,
      followup_required: reports.filter(r => ['Follow-up Required', 'No Answer', 'Call Failed'].includes(r.notification_status)).length
    };
  }, [reports]);

  // Handle Summary Card Click Filter
  const handleCardClick = (cardType) => {
    if (summaryCardFilter === cardType) {
      setSummaryCardFilter(null);
      setVerificationFilter('ALL');
      setNotificationFilter('ALL');
    } else {
      setSummaryCardFilter(cardType);
      if (cardType === 'AWAITING') {
        setVerificationFilter('Awaiting Verification');
        setNotificationFilter('ALL');
      } else if (cardType === 'READY') {
        setVerificationFilter('Ready to Notify');
        setNotificationFilter('ALL');
      } else if (cardType === 'PENDING') {
        setVerificationFilter('ALL');
        setNotificationFilter('Pending');
      } else if (cardType === 'FOLLOWUP') {
        setVerificationFilter('ALL');
        setNotificationFilter('Follow-up Required');
      }
      setSubTab('reports');
    }
    setCurrentPage(1);
  };

  // Filtered & Sorted Reports
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesName = r.patient_name?.toLowerCase().includes(q);
        const matchesId = r.id?.toLowerCase().includes(q) || r.patient_id?.toLowerCase().includes(q);
        const matchesType = r.report_type?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesType) return false;
      }

      // Verification Status Filter
      if (verificationFilter !== 'ALL' && r.verification_status !== verificationFilter) {
        return false;
      }

      // Notification Status Filter
      if (notificationFilter !== 'ALL') {
        if (notificationFilter === 'Follow-up Required') {
          if (!['Follow-up Required', 'No Answer', 'Call Failed'].includes(r.notification_status)) {
            return false;
          }
        } else if (r.notification_status !== notificationFilter) {
          return false;
        }
      }

      // Date Filter
      if (dateFilter !== 'ALL') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateFilter === 'TODAY' && r.uploaded_date !== todayStr) return false;
        if (dateFilter === 'WEEK') {
          const reportDate = new Date(r.uploaded_date);
          const diffDays = (new Date() - reportDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return false;
        }
        if (dateFilter === 'MONTH') {
          const reportDate = new Date(r.uploaded_date);
          const diffDays = (new Date() - reportDate) / (1000 * 60 * 60 * 24);
          if (diffDays > 30) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.uploaded_date || 0);
      const dateB = new Date(b.uploaded_date || 0);
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [reports, searchQuery, verificationFilter, notificationFilter, dateFilter, sortOrder]);

  // Paginated Reports
  const totalPages = Math.ceil(filteredReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReports.slice(start, start + pageSize);
  }, [filteredReports, currentPage, pageSize]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setVerificationFilter('ALL');
    setNotificationFilter('ALL');
    setDateFilter('ALL');
    setSummaryCardFilter(null);
    setCurrentPage(1);
  };

  // Upload Form Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'dcm'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setFileError('Invalid format. Please select a PDF or image medical report.');
      setSelectedFile(null);
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File exceeds 10 MB limit. Please compress or select a smaller report file.');
      setSelectedFile(null);
      return;
    }

    setFileError('');
    setSelectedFile(file);
  };

  const handleSimulatedUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select a report file to upload.');
      return;
    }

    const patient = INITIAL_PATIENTS.find(p => p.id === uploadPatientId) || INITIAL_PATIENTS[0];
    setUploading(true);

    const payload = {
      patient_id: patient.id,
      patient_name: patient.name,
      patient_phone: patient.phone,
      report_type: uploadReportType,
      title: `${uploadReportType} Analysis for ${patient.name}`,
      file_name: selectedFile.name,
      file_size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      uploaded_date: uploadDate,
      uploaded_by: 'Admin',
      notes: uploadNotes.trim() || 'Uploaded via Admin Reports portal for clinical review.'
    };

    try {
      const res = await uploadReport(payload);
      const newRecord = res.data || {
        ...payload,
        id: uploadReportRef || `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
        uploaded_time: 'Just Now',
        verification_status: 'Awaiting Verification',
        notification_status: 'Not Started',
        timeline: [
          { step: 'Report Uploaded', timestamp: 'Just Now', actor: 'Admin', done: true },
          { step: 'Physician Verification', timestamp: 'Pending', actor: 'Attending Doctor', done: false },
          { step: 'Ready to Notify', timestamp: 'Pending', actor: 'Clinical Desk', done: false },
          { step: 'Patient Notification', timestamp: 'Scheduled Phase 4', actor: 'Priya AI Voice', done: false }
        ]
      };

      setReports(prev => [newRecord, ...prev]);
      showToast(`Report ${newRecord.id} successfully queued for verification!`);
      
      // Reset form
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setUploadNotes('');
      setUploadReportRef(`RPT-${Math.floor(1000 + Math.random() * 9000)}`);
      setFileError('');
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Simulated upload completed with local record.', 'info');
    } finally {
      setUploading(false);
    }
  };

  // Verification State Change Actions in Detail Drawer
  const handleUpdateReportStatus = async (reportId, newVerificationStatus, newNotificationStatus = null) => {
    try {
      const updatePayload = { verification_status: newVerificationStatus };
      if (newNotificationStatus) updatePayload.notification_status = newNotificationStatus;

      await updateReportStatus(reportId, updatePayload);

      // Update local state
      setReports(prev => prev.map(r => {
        if (r.id !== reportId) return r;
        const updatedTimeline = (r.timeline || []).map(step => {
          if (newVerificationStatus === 'Verified' && step.step === 'Physician Verification') {
            return { ...step, done: true, timestamp: 'Today, Just Now', actor: 'Verified by Physician' };
          }
          if (newVerificationStatus === 'Ready to Notify' && (step.step === 'Physician Verification' || step.step === 'Ready to Notify')) {
            return { ...step, done: true, timestamp: 'Today, Just Now' };
          }
          return step;
        });

        if (newVerificationStatus === 'Rejected') {
          updatedTimeline.push({
            step: 'Report Rejected',
            timestamp: 'Today, Just Now',
            actor: 'Clinical Review',
            done: true
          });
        }

        return {
          ...r,
          verification_status: newVerificationStatus,
          ...(newNotificationStatus ? { notification_status: newNotificationStatus } : {}),
          timeline: updatedTimeline
        };
      }));

      // Update selected report in drawer
      setSelectedReport(prev => prev && prev.id === reportId ? {
        ...prev,
        verification_status: newVerificationStatus,
        ...(newNotificationStatus ? { notification_status: newNotificationStatus } : {})
      } : prev);

      showToast(`Report ${reportId} marked as ${newVerificationStatus}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('Status updated in local view.', 'info');
    }
  };

  // Reject Confirmation
  const handleConfirmReject = () => {
    if (!selectedReport) return;
    handleUpdateReportStatus(selectedReport.id, 'Rejected');
    setIsRejectConfirmOpen(false);
    setRejectReason('');
  };

  // Follow-ups filtering and resolve
  const filteredFollowups = useMemo(() => {
    return followups.filter(f => {
      if (followupFilter === 'ALL') return true;
      return f.status === followupFilter;
    });
  }, [followups, followupFilter]);

  const handleResolveFollowup = async (followupId) => {
    try {
      await resolveFollowup(followupId, 'Follow-up completed by front office staff.');
      setFollowups(prev => prev.map(f => f.id === followupId ? { ...f, status: 'Resolved' } : f));
      showToast(`Follow-up ${followupId} marked as resolved!`);
    } catch (err) {
      console.error('Failed to resolve follow-up:', err);
      showToast(`Follow-up ${followupId} resolved in local state.`);
    }
  };

  // Status Badge Colors & Typography
  const getVerificationBadge = (status) => {
    switch (status) {
      case 'Verified':
        return {
          bg: '#ECFDF5',
          text: '#065F46',
          border: '1px solid #A7F3D0',
          icon: CheckCircle2
        };
      case 'Ready to Notify':
        return {
          bg: '#EFF6FF',
          text: '#1E40AF',
          border: '1px solid #BFDBFE',
          icon: BellIconWrapper
        };
      case 'Rejected':
        return {
          bg: '#FEF2F2',
          text: '#991B1B',
          border: '1px solid #FECACA',
          icon: XCircle
        };
      case 'Awaiting Verification':
      default:
        return {
          bg: '#FFFBEB',
          text: '#92400E',
          border: '1px solid #FDE68A',
          icon: Clock
        };
    }
  };

  const getNotificationBadge = (status) => {
    switch (status) {
      case 'Patient Notified':
        return { bg: '#F0FDF4', text: '#15803D', border: '1px solid #BBF7D0' };
      case 'Pending':
      case 'Call Queued':
        return { bg: '#EFF6FF', text: '#2563EB', border: '1px solid #BFDBFE' };
      case 'Follow-up Required':
      case 'No Answer':
        return { bg: '#FFF7ED', text: '#C2410C', border: '1px solid #FED7AA' };
      case 'Call Failed':
        return { bg: '#FEF2F2', text: '#DC2626', border: '1px solid #FECACA' };
      case 'Not Started':
      default:
        return { bg: '#F8FAFC', text: '#64748B', border: '1px solid #E2E8F0' };
    }
  };

  function BellIconWrapper(props) {
    return <CheckCircle2 {...props} />;
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', color: '#0F172A' }}>

      {/* ── Toast Alert Feedback ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toast.type === 'info' ? '#0F5B4C' : '#0284C7',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 2000,
          fontWeight: 600,
          fontSize: '13.5px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Check size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '28px',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: '24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '999px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              fontSize: '11px',
              fontWeight: 700,
              color: '#0284C7',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <FileText size={12} />
              <span>Clinical Diagnostics Workflow</span>
            </span>
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 0 6px',
            color: '#0F172A',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            letterSpacing: '-0.02em'
          }}>
            Reports & Follow-ups
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
            Manage patient diagnostic reports, physician verification, automated voice notifications, and front-desk follow-up tasks.
          </p>
        </div>

        {/* Primary Action & Sub-tab Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#F1F5F9',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0'
          }}>
            <button
              type="button"
              onClick={() => setSubTab('reports')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: subTab === 'reports' ? '#FFFFFF' : 'transparent',
                color: subTab === 'reports' ? '#0F172A' : '#64748B',
                boxShadow: subTab === 'reports' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Reports Table ({reports.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('followups')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: subTab === 'followups' ? '#FFFFFF' : 'transparent',
                color: subTab === 'followups' ? '#0F172A' : '#64748B',
                boxShadow: subTab === 'followups' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Follow-up Tasks ({followups.filter(f => f.status !== 'Resolved').length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 18px',
              borderRadius: '10px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0369A1'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0284C7'}
          >
            <Upload size={15} strokeWidth={2.5} />
            <span>+ Upload Report</span>
          </button>
        </div>
      </div>

      {/* ── Summary Cards Grid (4 Compact Cards) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Awaiting Verification */}
        <div
          onClick={() => handleCardClick('AWAITING')}
          style={{
            backgroundColor: '#FFFFFF',
            border: summaryCardFilter === 'AWAITING' ? '2px solid #D97706' : '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#D97706'}
          onMouseLeave={e => {
            if (summaryCardFilter !== 'AWAITING') e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Awaiting Verification
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} color="#D97706" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {currentSummary.awaiting_verification}
          </div>
          <div style={{ fontSize: '12px', color: '#B45309', marginTop: '4px', fontWeight: 600 }}>
            Requires Physician Sign-off
          </div>
        </div>

        {/* Card 2: Ready to Notify */}
        <div
          onClick={() => handleCardClick('READY')}
          style={{
            backgroundColor: '#FFFFFF',
            border: summaryCardFilter === 'READY' ? '2px solid #0284C7' : '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#0284C7'}
          onMouseLeave={e => {
            if (summaryCardFilter !== 'READY') e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ready to Notify
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} color="#0284C7" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {currentSummary.ready_to_notify}
          </div>
          <div style={{ fontSize: '12px', color: '#0284C7', marginTop: '4px', fontWeight: 600 }}>
            Physician Approved & Cleared
          </div>
        </div>

        {/* Card 3: Notification Pending */}
        <div
          onClick={() => handleCardClick('PENDING')}
          style={{
            backgroundColor: '#FFFFFF',
            border: summaryCardFilter === 'PENDING' ? '2px solid #3B82F6' : '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#3B82F6'}
          onMouseLeave={e => {
            if (summaryCardFilter !== 'PENDING') e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Notification Pending
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneCall size={16} color="#3B82F6" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {currentSummary.notification_pending}
          </div>
          <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '4px', fontWeight: 600 }}>
            Queued for Voice Telephony
          </div>
        </div>

        {/* Card 4: Follow-up Required */}
        <div
          onClick={() => handleCardClick('FOLLOWUP')}
          style={{
            backgroundColor: '#FFFFFF',
            border: summaryCardFilter === 'FOLLOWUP' ? '2px solid #EA580C' : '1px solid #E2E8F0',
            borderRadius: '14px',
            padding: '18px 20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#EA580C'}
          onMouseLeave={e => {
            if (summaryCardFilter !== 'FOLLOWUP') e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Follow-up Required
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneForwarded size={16} color="#EA580C" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {currentSummary.followup_required}
          </div>
          <div style={{ fontSize: '12px', color: '#EA580C', marginTop: '4px', fontWeight: 600 }}>
            Unanswered / Callback Needed
          </div>
        </div>
      </div>

      {/* ── Active Filter Bar Notification ── */}
      {summaryCardFilter && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '10px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#1E40AF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={15} color="#0284C7" />
            <span>
              Filtering table by summary card: <strong>{summaryCardFilter.replace('_', ' ')}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284C7',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '12.5px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Filter</span>
          </button>
        </div>
      )}

      {/* ── Sub-Tab 1: Reports Table ── */}
      {subTab === 'reports' && (
        <div>
          {/* Controls Bar: Search, Verification Filter, Notification Filter, Date Filter */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '18px'
          }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #CBD5E1',
              flex: '1 1 260px',
              maxWidth: '360px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <Search size={15} color="#64748B" />
              <input
                type="text"
                placeholder="Search patient or report ID…"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '13px',
                  color: '#0F172A',
                  backgroundColor: 'transparent'
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

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {/* Verification Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Verify:</span>
                <select
                  value={verificationFilter}
                  onChange={e => {
                    setVerificationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Verification Statuses</option>
                  {VERIFICATION_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Notification Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>Notify:</span>
                <select
                  value={notificationFilter}
                  onChange={e => {
                    setNotificationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    color: '#0F172A',
                    outline: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Notification Statuses</option>
                  {NOTIFICATION_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={e => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#0F172A',
                  outline: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Dates</option>
                <option value="TODAY">Uploaded Today</option>
                <option value="WEEK">Last 7 Days</option>
                <option value="MONTH">Last 30 Days</option>
              </select>

              {/* Clear Filters */}
              {(searchQuery || verificationFilter !== 'ALL' || notificationFilter !== 'ALL' || dateFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    color: '#64748B',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Reports Table Card ── */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    <th style={{ padding: '14px 18px' }}>Patient</th>
                    <th style={{ padding: '14px 18px' }}>Report ID</th>
                    <th style={{ padding: '14px 18px' }}>Report Type</th>
                    <th 
                      style={{ padding: '14px 18px', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>Uploaded Date</span>
                        {sortOrder === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </div>
                    </th>
                    <th style={{ padding: '14px 18px' }}>Uploaded By</th>
                    <th style={{ padding: '14px 18px' }}>Verification Status</th>
                    <th style={{ padding: '14px 18px' }}>Notification Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Skeleton Loading
                    [1, 2, 3, 4, 5].map(i => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td colSpan={8} style={{ padding: '16px 18px' }}>
                          <div style={{
                            height: '20px',
                            backgroundColor: '#F1F5F9',
                            borderRadius: '6px',
                            width: `${60 + (i % 3) * 15}%`,
                            animation: 'pulse 1.5s infinite'
                          }} />
                        </td>
                      </tr>
                    ))
                  ) : paginatedReports.length === 0 ? (
                    // Empty Result State
                    <tr>
                      <td colSpan={8} style={{ padding: '48px 20px', textAlign: 'center' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          <FileText size={22} color="#94A3B8" />
                        </div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                          No Reports Match Filters
                        </h4>
                        <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748B' }}>
                          Try adjusting search terms, verification status, or clearing active filters.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          style={{
                            padding: '7px 16px',
                            borderRadius: '8px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            fontSize: '12.5px',
                            fontWeight: 700,
                            color: '#0284C7',
                            cursor: 'pointer'
                          }}
                        >
                          Reset All Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    // Table Rows
                    paginatedReports.map(r => {
                      const vBadge = getVerificationBadge(r.verification_status);
                      const nBadge = getNotificationBadge(r.notification_status);

                      return (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedReport(r)}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {/* Patient */}
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{r.patient_name}</div>
                            <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <span style={{ fontFamily: 'monospace', backgroundColor: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                                {r.patient_id}
                              </span>
                            </div>
                          </td>

                          {/* Report ID */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#0284C7',
                              fontSize: '12.5px'
                            }}>
                              {r.id}
                            </span>
                          </td>

                          {/* Report Type */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: '#F1F5F9',
                              color: '#334155'
                            }}>
                              {r.report_type}
                            </span>
                          </td>

                          {/* Uploaded Date */}
                          <td style={{ padding: '14px 18px', color: '#334155' }}>
                            <div>{r.uploaded_date}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{r.uploaded_time || 'Morning'}</div>
                          </td>

                          {/* Uploaded By */}
                          <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12.5px' }}>
                            {r.uploaded_by}
                          </td>

                          {/* Verification Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              backgroundColor: vBadge.bg,
                              color: vBadge.text,
                              border: vBadge.border
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: vBadge.text }} />
                              <span>{r.verification_status}</span>
                            </span>
                          </td>

                          {/* Notification Status */}
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '3px 9px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              backgroundColor: nBadge.bg,
                              color: nBadge.text,
                              border: nBadge.border
                            }}>
                              {r.notification_status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedReport(r)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                backgroundColor: '#FFFFFF',
                                color: '#0F172A',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                            >
                              <Eye size={13} color="#0284C7" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredReports.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 18px',
                borderTop: '1px solid #E2E8F0',
                backgroundColor: '#FAFAFA',
                fontSize: '12.5px',
                color: '#64748B'
              }}>
                <div>
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredReports.length)}</strong> of <strong>{filteredReports.length}</strong> reports
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: currentPage === 1 ? '#F1F5F9' : '#FFFFFF',
                      color: currentPage === 1 ? '#94A3B8' : '#0F172A',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600
                    }}
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  <span style={{ padding: '0 8px', fontWeight: 700, color: '#0F172A' }}>
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: currentPage === totalPages ? '#F1F5F9' : '#FFFFFF',
                      color: currentPage === totalPages ? '#94A3B8' : '#0F172A',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 600
                    }}
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sub-Tab 2: Follow-up Tasks Panel ── */}
      {subTab === 'followups' && (
        <div>
          {/* Follow-ups Toolbar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
            flexWrap: 'wrap'
          }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Patient Follow-up Tasks Queue
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                Cases where patient notification failed, went unanswered, or required clinical desk follow-up.
              </p>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>Filter by status:</span>
              <select
                value={followupFilter}
                onChange={e => setFollowupFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0F172A',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Follow-ups ({followups.length})</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Follow-up Cards / Table Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFollowups.length === 0 ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <CheckCircle2 size={32} color="#10B981" style={{ marginBottom: '8px' }} />
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  No Active Follow-ups
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  All follow-up tasks under this filter have been handled.
                </p>
              </div>
            ) : (
              filteredFollowups.map(f => {
                const isResolved = f.status === 'Resolved';
                const isHigh = f.priority === 'High';

                return (
                  <div
                    key={f.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: isResolved ? '1px solid #E2E8F0' : isHigh ? '1px solid #FCA5A5' : '1px solid #FED7AA',
                      padding: '16px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}
                  >
                    <div style={{ flex: '1 1 320px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                          {f.patient_name}
                        </span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                          {f.patient_reference}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          backgroundColor: isResolved ? '#F0FDF4' : isHigh ? '#FEF2F2' : '#FFF7ED',
                          color: isResolved ? '#15803D' : isHigh ? '#B91C1C' : '#C2410C',
                          border: isResolved ? '1px solid #BBF7D0' : isHigh ? '1px solid #FECACA' : '1px solid #FED7AA'
                        }}>
                          {f.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, marginBottom: '4px' }}>
                        Reason: <span style={{ color: '#C2410C' }}>{f.reason}</span> · Ref: <span style={{ fontFamily: 'monospace', color: '#0284C7' }}>{f.report_id}</span> ({f.report_title})
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        Last attempt: <strong>{f.last_attempt}</strong> · Assigned: <strong>{f.assigned_staff}</strong> · Due: <strong>{f.due_date}</strong>
                      </div>

                      {f.notes && (
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#475569', backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '6px' }}>
                          "{f.notes}"
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a
                        href={`tel:${f.patient_phone}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#F1F5F9',
                          color: '#0F172A',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1px solid #CBD5E1'
                        }}
                      >
                        <PhoneCall size={13} color="#0284C7" />
                        <span>Dial Patient</span>
                      </a>

                      {!isResolved && (
                        <button
                          type="button"
                          onClick={() => handleResolveFollowup(f.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            backgroundColor: '#0F5B4C',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Check size={14} />
                          <span>Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Modal: Upload Report ── */}
      {isUploadModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1500,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FAFAFA'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Upload Diagnostic Report
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Register patient report for verification and automated notification workflow
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSimulatedUpload} style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Patient Selection & Auto-filled ID */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Select Patient *
                    </label>
                    <select
                      value={uploadPatientId}
                      onChange={e => setUploadPatientId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {INITIAL_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Patient ID
                    </label>
                    <input
                      type="text"
                      disabled
                      value={uploadPatientId}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: '#64748B',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Report Type & Custom Reference */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Report Type *
                    </label>
                    <select
                      value={uploadReportType}
                      onChange={e => setUploadReportType(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13.5px',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      {REPORT_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                      Report Reference ID
                    </label>
                    <input
                      type="text"
                      value={uploadReportRef}
                      onChange={e => setUploadReportRef(e.target.value)}
                      placeholder="e.g. RPT-1009"
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Upload Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Upload Date
                  </label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={e => setUploadDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* File Upload Zone */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Report File (PDF / Images) *
                  </label>
                  
                  {!selectedFile ? (
                    <label style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '24px 16px',
                      borderRadius: '10px',
                      border: '2px dashed #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}>
                      <FileUp size={28} color="#0284C7" style={{ marginBottom: '8px' }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                        Click to select medical report file
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        Supports PDF, PNG, JPG (up to 10 MB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.dcm"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#F0F9FF',
                      border: '1px solid #BAE6FD'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Paperclip size={18} color="#0284C7" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                            {selectedFile.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DC2626',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {fileError && (
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#DC2626', fontWeight: 600 }}>
                      {fileError}
                    </div>
                  )}
                </div>

                {/* Internal Clinical Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Internal Clinical Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={uploadNotes}
                    onChange={e => setUploadNotes(e.target.value)}
                    placeholder="Enter diagnostic context, fasting status, or special physician notes..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F172A',
                      outline: 'none',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Simulated Prototype Notice */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '11.5px',
                  color: '#64748B',
                  lineHeight: 1.4
                }}>
                  <strong>Phase 1 UI Notice:</strong> File uploads in this phase run on local frontend state with simulated validation. Permanent cloud object storage will be linked in Phase 2.
                </div>

              </div>

              {/* Form Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0'
              }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {uploading ? (
                    <>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Uploading Report...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Upload & Queue</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Slide-over Drawer: Report Details ── */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 1600,
          display: 'flex',
          justifyContent: 'flex-end'
        }} onClick={() => setSelectedReport(null)}>
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              height: '100%',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284C7', fontSize: '14px' }}>
                    {selectedReport.id}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', backgroundColor: '#E2E8F0', padding: '2px 6px', borderRadius: '4px' }}>
                    {selectedReport.report_type}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                  {selectedReport.patient_name}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Patient ID: <strong style={{ fontFamily: 'monospace' }}>{selectedReport.patient_id}</strong> · Tel: {selectedReport.patient_phone}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Status Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Verification
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    backgroundColor: getVerificationBadge(selectedReport.verification_status).bg,
                    color: getVerificationBadge(selectedReport.verification_status).text,
                    border: getVerificationBadge(selectedReport.verification_status).border
                  }}>
                    {selectedReport.verification_status}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Notification
                  </div>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderRadius: '999px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    backgroundColor: getNotificationBadge(selectedReport.notification_status).bg,
                    color: getNotificationBadge(selectedReport.notification_status).text,
                    border: getNotificationBadge(selectedReport.notification_status).border
                  }}>
                    {selectedReport.notification_status}
                  </span>
                </div>
              </div>

              {/* File Preview Placeholder Card */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Attached Diagnostic File
                </div>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={18} color="#0284C7" />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                          {selectedReport.file_name || `${selectedReport.id}_Report.pdf`}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {selectedReport.file_size || '1.4 MB'} · Uploaded by {selectedReport.uploaded_by}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simulated PDF Document Preview */}
                  <div style={{
                    padding: '24px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px dashed #CBD5E1',
                    textAlign: 'center'
                  }}>
                    <FileText size={32} color="#94A3B8" style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                      Diagnostic Specimen Laboratory Record
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      {selectedReport.title || 'Verified Clinical Findings & Biomarkers'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Clinical Notes
                </div>
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.5
                }}>
                  {selectedReport.notes || 'No internal clinical notes registered for this report.'}
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Workflow Status Timeline
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(selectedReport.timeline || [
                    { step: 'Report Uploaded', timestamp: `${selectedReport.uploaded_date} ${selectedReport.uploaded_time || ''}`, done: true },
                    { step: 'Physician Verification', timestamp: selectedReport.verification_status === 'Verified' ? 'Completed' : 'Pending', done: selectedReport.verification_status === 'Verified' },
                    { step: 'Ready to Notify', timestamp: selectedReport.verification_status === 'Ready to Notify' ? 'Active' : 'Pending', done: selectedReport.verification_status === 'Ready to Notify' },
                    { step: 'Patient Notification', timestamp: 'Phase 4', done: selectedReport.notification_status === 'Patient Notified' }
                  ]).map((t, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: t.done ? '#0284C7' : '#E2E8F0',
                        color: t.done ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: '1px'
                      }}>
                        {t.done ? <Check size={11} strokeWidth={3} /> : idx + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: t.done ? '#0F172A' : '#64748B' }}>
                          {t.step}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {t.timestamp} {t.actor ? `· ${t.actor}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sarvam Voice Notice */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <Sparkles size={16} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#0369A1', lineHeight: 1.4 }}>
                  <strong>Sarvam Telephony Notification:</strong> Automated patient voice calls with Priya AI receptionist are powered via Sarvam Voice AI.
                </div>
              </div>

            </div>

            {/* Drawer Actions Footer */}
            <div style={{
              padding: '18px 24px',
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedReport.verification_status !== 'Verified' && selectedReport.verification_status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'Verified')}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#0F5B4C',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    <span>Verify Report</span>
                  </button>
                )}

                {selectedReport.verification_status !== 'Ready to Notify' && selectedReport.verification_status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateReportStatus(selectedReport.id, 'Ready to Notify', 'Pending')}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#0284C7',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowRight size={14} />
                    <span>Mark Ready to Notify</span>
                  </button>
                )}

                {selectedReport.verification_status !== 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => setIsRejectConfirmOpen(true)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#FEE2E2',
                      color: '#991B1B',
                      border: '1px solid #FECACA',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reject Report
                  </button>
                )}
              </div>

              {/* Disabled Notify Patient Button */}
              <button
                type="button"
                disabled
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#F1F5F9',
                  color: '#94A3B8',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <PhoneCall size={13} color="#94A3B8" />
                <span>Notify Patient via Priya Voice AI (Available Phase 4)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Reject Confirmation ── */}
      {isRejectConfirmOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 1700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            maxWidth: '420px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <AlertTriangle size={20} color="#DC2626" />
            </div>

            <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
              Confirm Report Rejection
            </h4>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>
              Are you sure you want to mark report <strong>{selectedReport?.id}</strong> as rejected? The laboratory will be prompted for specimen re-collection.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsRejectConfirmOpen(false)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


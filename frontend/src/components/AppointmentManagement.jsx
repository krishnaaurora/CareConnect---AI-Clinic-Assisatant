import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  RotateCcw, 
  Search, 
  Filter, 
  Bot, 
  UserCheck, 
  Copy, 
  Check, 
  X, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { 
  fetchAllAppointments, 
  updateAppointmentStatus, 
  rescheduleAppointment,
  fetchDoctorsOnDuty
} from '../api/client';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
];

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'VERIFIED_CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL' | 'AI' | 'STAFF'

  // Reschedule Modal
  const [rescheduleModalItem, setRescheduleModalItem] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Cancel Modal
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [cancelReason, setCancelReason] = useState('Patient requested cancellation');

  // Copy Feedback
  const [copiedRef, setCopiedRef] = useState('');
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, docs] = await Promise.all([
        fetchAllAppointments(),
        fetchDoctorsOnDuty()
      ]);
      setAppointments(appts || []);
      setDoctors(docs || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (refId) => {
    navigator.clipboard.writeText(refId);
    setCopiedRef(refId);
    showNotification(`Copied ticket reference: ${refId}`);
    setTimeout(() => setCopiedRef(''), 2000);
  };

  // Status mapping
  const normalizeStatus = (status) => {
    if (!status) return 'CONFIRMED';
    const s = status.toUpperCase();
    if (s.includes('CONFIRM')) return 'CONFIRMED';
    if (s.includes('PENDING') || s.includes('HUMAN_DESK')) return 'PENDING';
    if (s.includes('COMPLETE')) return 'COMPLETED';
    if (s.includes('CANCEL')) return 'CANCELLED';
    return s;
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (appt) => {
    setRescheduleModalItem(appt);
    setRescheduleDate(appt.preferred_date || new Date().toISOString().split('T')[0]);
    setRescheduleTime(appt.preferred_time || '11:00 AM');
    setRescheduleDoctor(appt.doctor_name || doctors[0]?.name || '');
    setRescheduleError('');
  };

  // Execute Reschedule
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModalItem || !rescheduleDate || !rescheduleTime) return;

    setRescheduling(true);
    setRescheduleError('');

    try {
      await rescheduleAppointment(
        rescheduleModalItem.reference_id,
        rescheduleDate,
        rescheduleTime,
        rescheduleDoctor
      );

      setAppointments(prev => prev.map(a => {
        if (a.reference_id === rescheduleModalItem.reference_id) {
          return {
            ...a,
            preferred_date: rescheduleDate,
            preferred_time: rescheduleTime,
            doctor_name: rescheduleDoctor,
            status: 'VERIFIED_CONFIRMED'
          };
        }
        return a;
      }));

      showNotification(`Appointment ${rescheduleModalItem.reference_id} rescheduled to ${rescheduleDate} at ${rescheduleTime}!`);
      setRescheduleModalItem(null);
    } catch (err) {
      setRescheduleError(err.message || 'Failed to reschedule. Possible slot conflict.');
    } finally {
      setRescheduling(false);
    }
  };

  // Execute Cancel
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalItem) return;

    try {
      await updateAppointmentStatus(cancelModalItem.reference_id, 'CANCELLED', cancelReason);
      setAppointments(prev => prev.map(a => {
        if (a.reference_id === cancelModalItem.reference_id) {
          return {
            ...a,
            status: 'CANCELLED',
            notes: cancelReason
          };
        }
        return a;
      }));
      showNotification(`Appointment ${cancelModalItem.reference_id} cancelled. Slot freed.`);
      setCancelModalItem(null);
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  // Quick Status Transition (e.g. Mark Completed or Confirm Pending)
  const handleQuickStatus = async (referenceId, nextStatus) => {
    try {
      await updateAppointmentStatus(referenceId, nextStatus);
      setAppointments(prev => prev.map(a => {
        if (a.reference_id === referenceId) {
          return { ...a, status: nextStatus };
        }
        return a;
      }));
      showNotification(`Appointment marked as ${nextStatus === 'COMPLETED' ? 'Completed' : 'Confirmed'}.`);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Counts
  const counts = {
    total: appointments.length,
    confirmed: appointments.filter(a => normalizeStatus(a.status) === 'CONFIRMED').length,
    pending: appointments.filter(a => normalizeStatus(a.status) === 'PENDING').length,
    completed: appointments.filter(a => normalizeStatus(a.status) === 'COMPLETED').length,
    cancelled: appointments.filter(a => normalizeStatus(a.status) === 'CANCELLED').length,
    ai: appointments.filter(a => (a.source || '').toLowerCase().includes('ai') || (a.source || '').toLowerCase().includes('priya')).length,
    staff: appointments.filter(a => !(a.source || '').toLowerCase().includes('ai') && !(a.source || '').toLowerCase().includes('priya')).length,
  };

  // Filter Appointments
  const filteredAppointments = appointments.filter(appt => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      appt.patient_name?.toLowerCase().includes(q) ||
      appt.phone?.toLowerCase().includes(q) ||
      appt.reference_id?.toLowerCase().includes(q) ||
      appt.doctor_name?.toLowerCase().includes(q) ||
      appt.specialty?.toLowerCase().includes(q);

    // Status
    const norm = normalizeStatus(appt.status);
    let matchesStatus = true;
    if (statusFilter === 'CONFIRMED') matchesStatus = norm === 'CONFIRMED';
    if (statusFilter === 'PENDING') matchesStatus = norm === 'PENDING';
    if (statusFilter === 'COMPLETED') matchesStatus = norm === 'COMPLETED';
    if (statusFilter === 'CANCELLED') matchesStatus = norm === 'CANCELLED';

    // Source
    let matchesSource = true;
    const isAi = (appt.source || '').toLowerCase().includes('ai') || (appt.source || '').toLowerCase().includes('priya');
    if (sourceFilter === 'AI') matchesSource = isAi;
    if (sourceFilter === 'STAFF') matchesSource = !isAi;

    return matchesSearch && matchesStatus && matchesSource;
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
            <Layers size={13} color="#0F5B4C" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Patient Booking Management
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0A2520', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>
            Appointments Directory & Status Control
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Unified patient log: verify booking references, review booking channels (AI vs Staff), execute reschedules, and monitor lifecycle.
          </p>
        </div>
      </div>

      {/* Stat Counter Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>All Bookings</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>
            {counts.total}
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 201, 167, 0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F5B4C', textTransform: 'uppercase' }}>Confirmed</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F5B4C', fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>
            {counts.confirmed}
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid rgba(245, 158, 11, 0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>Pending Review</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#B45309', fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>
            {counts.pending}
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>Completed</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#1D4ED8', fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>
            {counts.completed}
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase' }}>Cancelled</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626', fontFamily: 'Manrope, sans-serif', marginTop: '4px' }}>
            {counts.cancelled}
          </div>
        </div>

        <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Channel Distribution</div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0A2520', marginTop: '4px' }}>
            <span style={{ color: '#0F5B4C' }}>AI Voice: {counts.ai}</span> · <span>Staff: {counts.staff}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
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
        {/* Search */}
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
            placeholder="Search by patient, phone, doctor or Ref ID..."
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

        {/* Status Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Status' },
            { id: 'CONFIRMED', label: 'Confirmed' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'COMPLETED', label: 'Completed' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: statusFilter === tab.id ? '#0F5B4C' : '#F1F5F9',
                color: statusFilter === tab.id ? '#FFFFFF' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Channel / Source Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bot size={15} color="#0F5B4C" />
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
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
            <option value="ALL">All Booking Sources</option>
            <option value="AI">AI Receptionist (Priya Voice)</option>
            <option value="STAFF">Staff / Clinic Desk</option>
          </select>
        </div>
      </div>

      {/* Appointments List / Table */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid rgba(15, 91, 76, 0.1)',
        boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#EAF6F3', borderBottom: '1px solid rgba(15, 91, 76, 0.1)', color: '#0F5B4C', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '16px 20px' }}>Reference & Patient</th>
                <th style={{ padding: '16px 20px' }}>Doctor & Specialty</th>
                <th style={{ padding: '16px 20px' }}>Date & Time Slot</th>
                <th style={{ padding: '16px 20px' }}>Status</th>
                <th style={{ padding: '16px 20px' }}>Booking Source</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '50px 20px', textAlign: 'center', color: '#64748B' }}>
                    No appointments matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(appt => {
                  const norm = normalizeStatus(appt.status);
                  const isAi = (appt.source || '').toLowerCase().includes('ai') || (appt.source || '').toLowerCase().includes('priya');

                  return (
                    <tr 
                      key={appt.reference_id} 
                      style={{ borderBottom: '1px solid rgba(15, 91, 76, 0.06)', transition: 'background-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAF8F5'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Patient & Reference ID */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            color: '#0F5B4C',
                            backgroundColor: '#EAF6F3',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {appt.reference_id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(appt.reference_id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8' }}
                            title="Copy ticket reference"
                          >
                            {copiedRef === appt.reference_id ? <Check size={12} color="#00C9A7" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14.5px' }}>
                          {appt.patient_name}
                        </div>

                        {/* Contact details only as needed */}
                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Phone size={11} color="#00C9A7" />
                          <span>{appt.phone}</span>
                        </div>

                        {appt.notes && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{appt.notes}"
                          </div>
                        )}
                      </td>

                      {/* Doctor & Clinic */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0A2520', fontSize: '13.5px' }}>
                          {appt.doctor_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#00C9A7', fontWeight: 600 }}>
                          {appt.specialty}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {appt.clinic_name || "CareConnect Partner Clinic"}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 700, color: '#0A2520', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#0F5B4C" />
                          <span>{appt.preferred_date}</span>
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#00C9A7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={12} />
                          <span>{appt.preferred_time}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {appt.visit_type || 'In-Person Consultation'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {norm === 'CONFIRMED' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            backgroundColor: '#DCFAF3',
                            color: '#0F5B4C'
                          }}>
                            <CheckCircle2 size={13} color="#00C9A7" />
                            <span>Confirmed</span>
                          </span>
                        )}

                        {norm === 'PENDING' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            backgroundColor: '#FEF3C7',
                            color: '#B45309'
                          }}>
                            <AlertCircle size={13} color="#F59E0B" />
                            <span>Pending</span>
                          </span>
                        )}

                        {norm === 'COMPLETED' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            backgroundColor: '#EFF6FF',
                            color: '#1D4ED8'
                          }}>
                            <CheckCheck size={13} color="#3B82F6" />
                            <span>Completed</span>
                          </span>
                        )}

                        {norm === 'CANCELLED' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626'
                          }}>
                            <XCircle size={13} color="#DC2626" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>

                      {/* Booking Source (AI receptionist or staff) */}
                      <td style={{ padding: '16px 20px' }}>
                        {isAi ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            backgroundColor: '#EAF6F3',
                            color: '#0F5B4C',
                            border: '1px solid rgba(0, 201, 167, 0.3)'
                          }}>
                            <Bot size={13} color="#00C9A7" />
                            <span>AI Receptionist</span>
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            border: '1px solid #E2E8F0'
                          }}>
                            <UserCheck size={13} color="#64748B" />
                            <span>Staff Desk</span>
                          </span>
                        )}
                      </td>

                      {/* Actions: Reschedule & Cancel */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          
                          {norm !== 'CANCELLED' && norm !== 'COMPLETED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReschedule(appt)}
                                style={{
                                  padding: '6px 12px',
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
                                title="Reschedule to new date or time"
                              >
                                <RotateCcw size={12} />
                                <span>Reschedule</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setCancelModalItem(appt)}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  color: '#DC2626',
                                  backgroundColor: '#FEE2E2',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                title="Cancel appointment"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {norm === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(appt.reference_id, 'VERIFIED_CONFIRMED')}
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                backgroundColor: '#0F5B4C',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              Confirm
                            </button>
                          )}

                          {norm === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(appt.reference_id, 'COMPLETED')}
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#1D4ED8',
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Mark consultation completed"
                            >
                              Complete
                            </button>
                          )}

                          {norm === 'CANCELLED' && (
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                              Slot Released
                            </span>
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

      {/* ── MODAL 1: RESCHEDULE APPOINTMENT ── */}
      {rescheduleModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '500px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setRescheduleModalItem(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                  Reschedule Appointment
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  Patient: {rescheduleModalItem.patient_name} · Ref: {rescheduleModalItem.reference_id}
                </p>
              </div>
            </div>

            {rescheduleError && (
              <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12.5px', marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={16} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Assigned Physician
                </label>
                <select
                  value={rescheduleDoctor}
                  onChange={e => setRescheduleDoctor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  {doctors.map(d => (
                    <option key={d.id || d.name} value={d.name}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    New Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={e => setRescheduleDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    New Time Slot *
                  </label>
                  <select
                    value={rescheduleTime}
                    onChange={e => setRescheduleTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ backgroundColor: '#FAF8F5', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', color: '#64748B' }}>
                The previous slot will be automatically freed and reassigned to waitlisted patients.
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setRescheduleModalItem(null)}
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
                  type="submit"
                  disabled={rescheduling}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: rescheduling ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                  }}
                >
                  {rescheduling ? 'Verifying Slot...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: CANCEL APPOINTMENT ── */}
      {cancelModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setCancelModalItem(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={20} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0A2520' }}>
                  Cancel Appointment
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  {cancelModalItem.patient_name} · {cancelModalItem.reference_id}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmCancel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Cancellation Reason
                </label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13.5px',
                    backgroundColor: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Patient requested cancellation">Patient requested cancellation</option>
                  <option value="Patient rescheduled via external channel">Patient rescheduled via external channel</option>
                  <option value="Doctor emergency procedure">Doctor emergency procedure</option>
                  <option value="Patient no-show">Patient no-show</option>
                  <option value="Duplicate booking entry">Duplicate booking entry</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setCancelModalItem(null)}
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
                  Keep Booking
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

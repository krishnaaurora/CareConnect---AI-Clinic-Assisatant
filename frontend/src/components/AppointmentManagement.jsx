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
  CheckCheck,
  Plus,
  Send,
  PhoneCall,
  RefreshCw,
  Activity,
  AlertTriangle,
  FileText,
  CalendarCheck2
} from 'lucide-react';
import { 
  fetchAllAppointments, 
  fetchAppointmentsOverview,
  updateAppointmentStatus, 
  rescheduleAppointment,
  cancelAppointment,
  fetchDoctorsOnDuty,
  fetchPatients,
  createAppointment,
  fetchSlotGrid,
  sendAppointmentReminder,
  batchSendReminders
} from '../api/client';
import BackgroundPattern from './common/BackgroundPattern';

const STANDARD_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
];

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'IN_CONSULTATION' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
  const [sourceFilter, setSourceFilter] = useState('ALL'); // 'ALL' | 'AI' | 'STAFF'
  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'UPCOMING'

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [rescheduleModalItem, setRescheduleModalItem] = useState(null);
  const [cancelModalItem, setCancelModalItem] = useState(null);
  const [reminderModalItem, setReminderModalItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Book Appointment Form State
  const [patientMode, setPatientMode] = useState('existing'); // 'existing' | 'new'
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [bookForm, setBookForm] = useState({
    patient_name: '',
    phone: '',
    email: '',
    age: '',
    gender: 'Male',
    clinic_code: 'CARE-IND-01',
    doctor_name: '',
    preferred_date: new Date().toISOString().split('T')[0],
    preferred_time: '10:00 AM',
    visit_type: 'In-Person Consultation',
    notes: '',
    booking_source: 'Clinic Console / Staff'
  });
  const [availableSlotsGrid, setAvailableSlotsGrid] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [doctorAvailabilityReason, setDoctorAvailabilityReason] = useState(null);

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('11:00 AM');
  const [rescheduleDoctor, setRescheduleDoctor] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('Patient request');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSlotsGrid, setRescheduleSlotsGrid] = useState([]);

  // Cancel Form State
  const [cancelReasonText, setCancelReasonText] = useState('Patient requested cancellation');

  // Copy Feedback & Notification Banner
  const [copiedRef, setCopiedRef] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, isError = false) => {
    setToastMessage({ text, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, docs, pts] = await Promise.all([
        fetchAllAppointments(),
        fetchDoctorsOnDuty(),
        fetchPatients()
      ]);
      setAppointments(appts || []);
      setDoctors(docs || []);
      setPatients(pts || []);

      if (docs && docs.length > 0 && !bookForm.doctor_name) {
        setBookForm(prev => ({ ...prev, doctor_name: docs[0].name }));
      }
    } catch (err) {
      console.error('Failed to load appointments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Live polling: auto-refresh appointments every 10 seconds so voice calls appear live
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Status mapping
  const normalizeStatus = (status) => {
    if (!status) return 'CONFIRMED';
    const s = status.toUpperCase();
    if (s.includes('CONFIRM')) return 'CONFIRMED';
    if (s.includes('IN_CONSULTATION') || s.includes('CONSULTING')) return 'IN_CONSULTATION';
    if (s.includes('PENDING') || s.includes('HUMAN_DESK')) return 'PENDING';
    if (s.includes('COMPLETE')) return 'COMPLETED';
    if (s.includes('CANCEL')) return 'CANCELLED';
    if (s.includes('NO_SHOW')) return 'NO_SHOW';
    return s;
  };

  // Fetch slot availability grid for Book Modal
  const loadSlotsForDoctorDate = async (doctorName, date) => {
    if (!doctorName || !date) return;
    setSlotsLoading(true);
    setDoctorAvailabilityReason(null);
    try {
      const gridData = await fetchSlotGrid(doctorName, date);
      if (gridData && gridData.slots) {
        setAvailableSlotsGrid(gridData.slots);
        if (!gridData.is_day_available) {
          setDoctorAvailabilityReason(`${doctorName} is not available on this date (${gridData.day_of_week || ''}).`);
        }
      } else {
        // Fallback default grid
        setAvailableSlotsGrid(STANDARD_SLOTS.map(t => ({ time: t, available: true, label: 'Available' })));
      }
    } catch {
      setAvailableSlotsGrid(STANDARD_SLOTS.map(t => ({ time: t, available: true, label: 'Available' })));
    } finally {
      setSlotsLoading(false);
    }
  };

  // Fetch slot availability grid for Reschedule Modal
  const loadRescheduleSlots = async (doctorName, date) => {
    if (!doctorName || !date) return;
    try {
      const gridData = await fetchSlotGrid(doctorName, date);
      if (gridData && gridData.slots) {
        setRescheduleSlotsGrid(gridData.slots);
      }
    } catch {
      setRescheduleSlotsGrid(STANDARD_SLOTS.map(t => ({ time: t, available: true, label: 'Available' })));
    }
  };

  // When patient selection changes in Book Modal
  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    const p = patients.find(item => item.id === patientId);
    if (p) {
      setBookForm(prev => ({
        ...prev,
        patient_name: p.name || '',
        phone: p.phone || '',
        email: p.email || '',
        age: p.age || '',
        gender: p.gender || 'Male',
        patient_id: p.id
      }));
    }
  };

  // Open Book Modal
  const handleOpenBookModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const initialDoctor = doctors[0]?.name || '';
    setBookForm({
      patient_name: '',
      phone: '',
      email: '',
      age: '',
      gender: 'Male',
      clinic_code: 'CARE-IND-01',
      doctor_name: initialDoctor,
      preferred_date: today,
      preferred_time: '10:00 AM',
      visit_type: 'In-Person Consultation',
      notes: '',
      booking_source: 'Clinic Console / Staff'
    });
    setSelectedPatientId('');
    setPatientMode('existing');
    setIsBookModalOpen(true);
    if (initialDoctor) {
      loadSlotsForDoctorDate(initialDoctor, today);
    }
  };

  // Open Reschedule Modal
  const handleOpenReschedule = (appt) => {
    setRescheduleModalItem(appt);
    const date = appt.preferred_date || new Date().toISOString().split('T')[0];
    const doc = appt.doctor_name || doctors[0]?.name || '';
    setRescheduleDate(date);
    setRescheduleTime(appt.preferred_time || '11:00 AM');
    setRescheduleDoctor(doc);
    setRescheduleReason('Patient requested change of appointment time');
    setRescheduleError('');
    loadRescheduleSlots(doc, date);
  };

  // Submit Book Appointment
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!bookForm.patient_name.trim() || !bookForm.phone.trim()) {
      showToast('Patient name and contact phone are required.', true);
      return;
    }
    if (!bookForm.doctor_name) {
      showToast('Please select an attending physician.', true);
      return;
    }

    setActionLoading(true);
    try {
      const res = await createAppointment({
        ...bookForm,
        age: bookForm.age ? parseInt(bookForm.age, 10) : undefined
      });
      showToast(res.message || `Appointment ${res.data?.reference_id} confirmed successfully!`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('appointment-booked', {
          detail: {
            patient_name: bookForm.patient_name,
            doctor_name: bookForm.doctor_name,
            reference_id: res.data?.reference_id || ''
          }
        }));
      }
      setIsBookModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to book appointment', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Reschedule
  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModalItem || !rescheduleDate || !rescheduleTime) return;

    setActionLoading(true);
    setRescheduleError('');

    try {
      await rescheduleAppointment(
        rescheduleModalItem.reference_id,
        rescheduleDate,
        rescheduleTime,
        rescheduleDoctor,
        rescheduleReason
      );

      setAppointments(prev => prev.map(a => {
        if (a.reference_id === rescheduleModalItem.reference_id) {
          return {
            ...a,
            preferred_date: rescheduleDate,
            preferred_time: rescheduleTime,
            doctor_name: rescheduleDoctor,
            status: 'VERIFIED_CONFIRMED',
            notes: rescheduleReason
          };
        }
        return a;
      }));

      showToast(`Appointment ${rescheduleModalItem.reference_id} rescheduled to ${rescheduleDate} at ${rescheduleTime}!`);
      setRescheduleModalItem(null);
    } catch (err) {
      setRescheduleError(err.message || 'Failed to reschedule. Possible slot conflict.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Cancel
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelModalItem) return;

    setActionLoading(true);
    try {
      await cancelAppointment(cancelModalItem.reference_id, cancelReasonText);
      setAppointments(prev => prev.map(a => {
        if (a.reference_id === cancelModalItem.reference_id) {
          return {
            ...a,
            status: 'CANCELLED',
            notes: cancelReasonText
          };
        }
        return a;
      }));
      showToast(`Appointment ${cancelModalItem.reference_id} cancelled. Doctor slot released.`);
      setCancelModalItem(null);
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Priya Voice AI Reminder
  const handleSendReminder = async () => {
    if (!reminderModalItem) return;
    setActionLoading(true);
    try {
      const res = await sendAppointmentReminder(reminderModalItem.reference_id);
      showToast(res.message || `Priya Voice AI reminder dispatched to ${reminderModalItem.patient_name}!`);
      setAppointments(prev => prev.map(a => {
        if (a.reference_id === reminderModalItem.reference_id) {
          return {
            ...a,
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString()
          };
        }
        return a;
      }));
      setReminderModalItem(null);
    } catch (err) {
      showToast(err.message || 'Failed to send reminder', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Batch Reminder trigger
  const handleBatchReminders = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (!window.confirm(`Dispatch automated Priya Voice AI reminders to all confirmed patients for today (${today})?`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await batchSendReminders(today);
      showToast(res.message || `Reminders batch complete: ${res.data?.dispatched_count} calls dispatched.`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Batch reminder failed', true);
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Status Transition
  const handleQuickStatus = async (referenceId, nextStatus) => {
    try {
      await updateAppointmentStatus(referenceId, nextStatus);
      setAppointments(prev => prev.map(a => {
        if (a.reference_id === referenceId) {
          return { ...a, status: nextStatus };
        }
        return a;
      }));
      showToast(`Status updated to ${nextStatus}.`);
    } catch (err) {
      showToast(err.message || 'Status update failed', true);
    }
  };

  const handleCopy = (refId) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(refId);
      setCopiedRef(refId);
      showToast(`Copied booking reference: ${refId}`);
      setTimeout(() => setCopiedRef(''), 2000);
    }
  };

  // Counts for KPI Cards
  const todayStr = new Date().toISOString().split('T')[0];
  const counts = {
    total: appointments.length,
    today: appointments.filter(a => a.preferred_date === todayStr && normalizeStatus(a.status) !== 'CANCELLED').length,
    confirmed: appointments.filter(a => normalizeStatus(a.status) === 'CONFIRMED').length,
    inConsult: appointments.filter(a => normalizeStatus(a.status) === 'IN_CONSULTATION').length,
    pending: appointments.filter(a => normalizeStatus(a.status) === 'PENDING').length,
    completed: appointments.filter(a => normalizeStatus(a.status) === 'COMPLETED').length,
    cancelled: appointments.filter(a => normalizeStatus(a.status) === 'CANCELLED').length,
  };

  // Filter Appointments
  const filteredAppointments = appointments.filter(appt => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      appt.patient_name?.toLowerCase().includes(q) ||
      appt.phone?.toLowerCase().includes(q) ||
      appt.reference_id?.toLowerCase().includes(q) ||
      appt.doctor_name?.toLowerCase().includes(q) ||
      appt.specialty?.toLowerCase().includes(q);

    const norm = normalizeStatus(appt.status);
    let matchesStatus = true;
    if (statusFilter === 'CONFIRMED') matchesStatus = norm === 'CONFIRMED';
    if (statusFilter === 'IN_CONSULTATION') matchesStatus = norm === 'IN_CONSULTATION';
    if (statusFilter === 'PENDING') matchesStatus = norm === 'PENDING';
    if (statusFilter === 'COMPLETED') matchesStatus = norm === 'COMPLETED';
    if (statusFilter === 'CANCELLED') matchesStatus = norm === 'CANCELLED';

    let matchesDate = true;
    if (dateFilter === 'TODAY') matchesDate = appt.preferred_date === todayStr;
    if (dateFilter === 'UPCOMING') matchesDate = (appt.preferred_date || '') >= todayStr;

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', paddingBottom: '60px', position: 'relative' }}>
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />
      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── Toast Notification ── */}
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
        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleBatchReminders}
            disabled={actionLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#0F5B4C',
              border: '1.5px solid #00C9A7',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: actionLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <Bot size={15} color="#00C9A7" />
            <span>Send Today's Priya Reminders</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            title="Refresh appointments"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
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

          <button
            type="button"
            onClick={handleOpenBookModal}
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
              boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Total Bookings */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>All Bookings</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {counts.total}
          </div>
        </div>

        {/* Card 2: Today's OPD */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#EDFDF9', border: '1px solid rgba(0, 201, 167, 0.4)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F5B4C', textTransform: 'uppercase' }}>Today's OPD</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#0F5B4C', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {counts.today}
          </div>
        </div>

        {/* Card 3: Confirmed */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#007A65', textTransform: 'uppercase' }}>Confirmed</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#007A65', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {counts.confirmed}
          </div>
        </div>

        {/* Card 4: In Consultation */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>In OPD Doctor</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#7C3AED', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {counts.inConsult}
          </div>
        </div>

        {/* Card 5: Completed */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>Completed</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#1D4ED8', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {counts.completed}
          </div>
        </div>

        {/* Card 6: Cancelled / Released */}
        <div style={{ padding: '16px 18px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Cancelled</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: '#DC2626', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '4px' }}>
            {counts.cancelled}
          </div>
        </div>
      </div>

      {/* ── Search & Filter Toolbar ── */}
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
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
          <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by patient, phone, doctor or Ref ID..."
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

        {/* Filter Controls: Status, Date & Source Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Status Selector Dropdown */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: statusFilter !== 'ALL' ? '1.5px solid #EA580C' : '1px solid #CBD5E1',
              backgroundColor: statusFilter !== 'ALL' ? '#FFF7ED' : '#FFFFFF',
              fontSize: '12.5px',
              color: statusFilter !== 'ALL' ? '#EA580C' : '#0A2520',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              height: '38px',
              boxSizing: 'border-box'
            }}
          >
            <option value="ALL">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_CONSULTATION">In OPD</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Date Selector */}
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: dateFilter !== 'ALL' ? '1.5px solid #EA580C' : '1px solid #CBD5E1',
              backgroundColor: dateFilter !== 'ALL' ? '#FFF7ED' : '#FFFFFF',
              fontSize: '12.5px',
              color: dateFilter !== 'ALL' ? '#EA580C' : '#0A2520',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              height: '38px',
              boxSizing: 'border-box'
            }}
          >
            <option value="ALL">All Dates</option>
            <option value="TODAY">Today Only</option>
            <option value="UPCOMING">Upcoming & Today</option>
          </select>
        </div>
      </div>

      {/* ── Appointments Directory Table ── */}
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
                <th style={{ padding: '14px 18px' }}>Reference & Patient</th>
                <th style={{ padding: '14px 18px' }}>Physician & Department</th>
                <th style={{ padding: '14px 18px' }}>Date & Time Slot</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Priya Reminder</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px', display: 'block', color: '#0F5B4C' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Loading clinic appointments...</span>
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                    <Calendar size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#94A3B8' }} />
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0A2520', marginBottom: '4px' }}>
                      No appointments matching criteria
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      Try adjusting your search query, status tabs, or click "Book Appointment" to add one.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(appt => {
                  const norm = normalizeStatus(appt.status);
                  const isAi = (appt.source || '').toLowerCase().includes('ai') || (appt.source || '').toLowerCase().includes('priya');

                  return (
                    <tr
                      key={appt.reference_id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                    >
                      {/* Patient & Ref ID */}
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

                        <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14px' }}>
                          {appt.patient_name}
                        </div>

                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                          <Phone size={11} color="#00C9A7" />
                          <span style={{ fontFamily: 'monospace' }}>{appt.phone}</span>
                        </div>

                        {appt.notes && (
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px', fontStyle: 'italic', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{appt.notes}"
                          </div>
                        )}
                      </td>

                      {/* Doctor & Specialty */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: '#0A2520', fontSize: '13.5px' }}>
                          {appt.doctor_name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0F5B4C', fontWeight: 600 }}>
                          {appt.specialty || 'General OPD'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {appt.clinic_name || 'Apex Care Clinic & Diagnostics'}
                        </div>
                      </td>

                      {/* Date & Time Slot */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: '#0A2520', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#0F5B4C" />
                          <span>{appt.preferred_date}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#00C9A7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Clock size={12} />
                          <span>{appt.preferred_time}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {appt.visit_type || 'In-Person Consultation'}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        {norm === 'CONFIRMED' && (
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
                            <span>Confirmed</span>
                          </span>
                        )}

                        {norm === 'IN_CONSULTATION' && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            backgroundColor: '#F5F3FF',
                            color: '#7C3AED'
                          }}>
                            <Activity size={12} color="#8B5CF6" />
                            <span>In Consultation</span>
                          </span>
                        )}

                        {norm === 'PENDING' && (
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
                            <AlertCircle size={12} color="#D97706" />
                            <span>Pending</span>
                          </span>
                        )}

                        {norm === 'COMPLETED' && (
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
                            <CheckCheck size={12} color="#3B82F6" />
                            <span>Completed</span>
                          </span>
                        )}

                        {norm === 'CANCELLED' && (
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
                            <span>Cancelled</span>
                          </span>
                        )}
                      </td>

                      {/* Priya Reminder Status */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                        {appt.reminder_sent ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#EDFDF9', color: '#0F5B4C', fontSize: '11px', fontWeight: 800, border: '1px solid rgba(0, 201, 167, 0.3)' }}>
                            <Bot size={12} color="#00C9A7" />
                            <span>Priya Reminder Sent</span>
                          </div>
                        ) : norm === 'CONFIRMED' ? (
                          <button
                            type="button"
                            onClick={() => setReminderModalItem(appt)}
                            style={{
                              padding: '5px 9px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#0F5B4C',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Send size={11} color="#00C9A7" />
                            <span>Send Reminder</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {norm !== 'CANCELLED' && norm !== 'COMPLETED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenReschedule(appt)}
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
                                title="Reschedule to new date or slot"
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
                                title="Cancel booking"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {norm === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(appt.reference_id, 'IN_CONSULTATION')}
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#7C3AED',
                                backgroundColor: '#F5F3FF',
                                border: '1px solid #DDD6FE',
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="Patient arrived and in consultation"
                            >
                              In OPD
                            </button>
                          )}

                          {(norm === 'CONFIRMED' || norm === 'IN_CONSULTATION') && (
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

                          {norm === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => handleQuickStatus(appt.reference_id, 'VERIFIED_CONFIRMED')}
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                fontWeight: 800,
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

      {/* ── MODAL 1: BOOK NEW APPOINTMENT ── */}
      {isBookModalOpen && (
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
            maxHeight: '92vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsBookModalOpen(false)}
              style={{ position: 'absolute', top: '22px', right: '22px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={22} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Book Clinical Appointment
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  Select patient, physician, date, and verified real-time available time slot.
                </p>
              </div>
            </div>

            <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Patient Selection Mode Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0A2520', marginBottom: '6px' }}>
                  Patient Selection
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setPatientMode('existing')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: patientMode === 'existing' ? '2px solid #00C9A7' : '1px solid #CBD5E1',
                      backgroundColor: patientMode === 'existing' ? '#EDFDF9' : '#FFFFFF',
                      color: patientMode === 'existing' ? '#0F5B4C' : '#64748B',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Existing Registered Patient ({patients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPatientMode('new');
                      setSelectedPatientId('');
                      setBookForm(prev => ({ ...prev, patient_name: '', phone: '', email: '', patient_id: null }));
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: patientMode === 'new' ? '2px solid #00C9A7' : '1px solid #CBD5E1',
                      backgroundColor: patientMode === 'new' ? '#EDFDF9' : '#FFFFFF',
                      color: patientMode === 'new' ? '#0F5B4C' : '#64748B',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + New Patient Entry
                  </button>
                </div>
              </div>

              {patientMode === 'existing' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Select Patient from Directory *
                  </label>
                  <select
                    required
                    value={selectedPatientId}
                    onChange={e => handleSelectPatient(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) · {p.phone} · {p.gender || 'Patient'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sumanth Varma"
                      value={bookForm.patient_name}
                      onChange={e => setBookForm({ ...bookForm, patient_name: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Phone (10 digits) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={bookForm.phone}
                      onChange={e => setBookForm({ ...bookForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {/* Doctor & Date Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Attending Physician *
                  </label>
                  <select
                    required
                    value={bookForm.doctor_name}
                    onChange={e => {
                      const doc = e.target.value;
                      setBookForm({ ...bookForm, doctor_name: doc });
                      loadSlotsForDoctorDate(doc, bookForm.preferred_date);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    {doctors.map(d => (
                      <option key={d.id || d.name} value={d.name}>
                        {d.name} ({d.specialty}) · ₹{d.consultation_fee || 800}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookForm.preferred_date}
                    onChange={e => {
                      const d = e.target.value;
                      setBookForm({ ...bookForm, preferred_date: d });
                      loadSlotsForDoctorDate(bookForm.doctor_name, d);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Doctor Unavailable Alert */}
              {doctorAvailabilityReason && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#B45309',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertTriangle size={16} />
                  <span>{doctorAvailabilityReason}</span>
                </div>
              )}

              {/* Real-Time Interactive Slot Grid */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#0A2520' }}>
                    Select Consultation Slot *
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Selected: <strong style={{ color: '#0F5B4C' }}>{bookForm.preferred_time}</strong>
                  </span>
                </div>

                {slotsLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
                    <RefreshCw size={16} className="animate-spin" style={{ margin: '0 auto 6px', display: 'block', color: '#00C9A7' }} />
                    Checking physician schedule...
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))',
                    gap: '6px',
                    maxHeight: '140px',
                    overflowY: 'auto',
                    padding: '4px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0'
                  }}>
                    {availableSlotsGrid.map(slot => {
                      const isSelected = bookForm.preferred_time === slot.time;
                      const isAvail = slot.available !== false;

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!isAvail}
                          onClick={() => setBookForm({ ...bookForm, preferred_time: slot.time })}
                          style={{
                            padding: '7px 4px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #00C9A7' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? '#EDFDF9' : (isAvail ? '#FFFFFF' : '#F1F5F9'),
                            color: isSelected ? '#0F5B4C' : (isAvail ? '#0A2520' : '#94A3B8'),
                            fontSize: '11.5px',
                            fontWeight: isSelected ? 800 : 600,
                            cursor: isAvail ? 'pointer' : 'not-allowed',
                            textDecoration: isAvail ? 'none' : 'line-through'
                          }}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Visit Type & Reason */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Visit Type
                  </label>
                  <select
                    value={bookForm.visit_type}
                    onChange={e => setBookForm({ ...bookForm, visit_type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="In-Person Consultation">In-Person Consultation</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Follow-Up Review">Follow-Up Review</option>
                    <option value="Diagnostic Review">Diagnostic Review</option>
                    <option value="Second Opinion">Second Opinion</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Clinical Complaint / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="Chief symptoms or reason for visit"
                    value={bookForm.notes}
                    onChange={e => setBookForm({ ...bookForm, notes: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
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
                    boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                  }}
                >
                  {actionLoading ? 'Verifying & Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: RESCHEDULE APPOINTMENT ── */}
      {rescheduleModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '540px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setRescheduleModalItem(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RotateCcw size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520' }}>
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Assigned Physician
                </label>
                <select
                  value={rescheduleDoctor}
                  onChange={e => {
                    setRescheduleDoctor(e.target.value);
                    loadRescheduleSlots(e.target.value, rescheduleDate);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    New Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleDate}
                    onChange={e => {
                      setRescheduleDate(e.target.value);
                      loadRescheduleSlots(rescheduleDoctor, e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
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
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    {STANDARD_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Reschedule Reason / Audit Note
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={e => setRescheduleReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ backgroundColor: '#FAF8F5', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', color: '#64748B' }}>
                The prior time slot will be automatically released back to the clinic's availability matrix.
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
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Verifying Slot...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CANCEL APPOINTMENT ── */}
      {cancelModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 2000,
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
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
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
                  value={cancelReasonText}
                  onChange={e => setCancelReasonText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
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
                  disabled={actionLoading}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: actionLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 4: DISPATCH PRIYA VOICE REMINDER ── */}
      {reminderModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 2000,
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
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setReminderModalItem(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>

            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Bot size={24} color="#00C9A7" />
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: 900, color: '#0A2520' }}>
              Dispatch Priya Voice AI Reminder?
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Trigger automated multilingual outbound reminder call to <strong>{reminderModalItem.patient_name}</strong> for their upcoming appointment with <strong>{reminderModalItem.doctor_name}</strong>.
            </p>

            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FAF8F5', border: '1px solid #E2E8F0', marginBottom: '18px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Recipient Number:</span>
                <strong style={{ fontFamily: 'monospace' }}>{reminderModalItem.phone}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#64748B' }}>Consultation Date & Slot:</span>
                <strong style={{ color: '#0F5B4C' }}>{reminderModalItem.preferred_date} at {reminderModalItem.preferred_time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Channel:</span>
                <strong>Priya Voice AI & SMS</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setReminderModalItem(null)}
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
                onClick={handleSendReminder}
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
                  gap: '6px'
                }}
              >
                <PhoneCall size={15} />
                <span>{actionLoading ? 'Dispatching...' : 'Dispatch Priya Call'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Z-Index Wrapper */}
      </div>
    </div>
  );
}

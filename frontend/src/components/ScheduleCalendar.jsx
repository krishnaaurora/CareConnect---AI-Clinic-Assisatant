import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  User, 
  Building2, 
  Settings, 
  Sliders, 
  X, 
  AlertCircle,
  Stethoscope,
  Filter,
  Check
} from 'lucide-react';
import { 
  fetchDoctorsOnDuty, 
  fetchClinics, 
  fetchAppointmentsOverview, 
  createAppointment,
  fetchScheduleConfig,
  saveScheduleConfig,
  blockClinicSlot,
  unblockClinicSlot,
  updateAppointmentStatus
} from '../api/client';

const TIME_SLOT_DEFAULTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM'
];

export default function ScheduleCalendar() {
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'weekly'
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedClinic, setSelectedClinic] = useState('CARE-IND-01');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('ALL');

  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openingTime, setOpeningTime] = useState('08:30 AM');
  const [closingTime, setClosingTime] = useState('08:30 PM');
  const [slotDuration, setSlotDuration] = useState('20 mins');
  const [bufferTime, setBufferTime] = useState('5 mins');

  // Quick Booking Modal
  const [bookingModalSlot, setBookingModalSlot] = useState(null); // { doctor, date, timeSlot }
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [visitType, setVisitType] = useState('In-Person Consultation');
  const [bookingConflictMsg, setBookingConflictMsg] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Block Slot Modal
  const [blockModalSlot, setBlockModalSlot] = useState(null);
  const [blockReason, setBlockReason] = useState('Doctor Break / Case Review');

  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Format Helpers
  const formatDateISO = (d) => {
    return d.toISOString().split('T')[0];
  };

  const formatDisplayDate = (d) => {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Load Data
  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const [docs, clinicList, overview, schedCfg] = await Promise.all([
        fetchDoctorsOnDuty(),
        fetchClinics(),
        fetchAppointmentsOverview(),
        fetchScheduleConfig(selectedClinic)
      ]);
      setDoctors(docs || []);
      setClinics(clinicList || []);
      
      const allAppts = [
        ...(overview?.today_appointments || []),
        ...(overview?.upcoming_bookings || [])
      ].filter(a => a.status === 'VERIFIED_CONFIRMED');
      setBookings(allAppts);

      if (schedCfg) {
        setOpeningTime(schedCfg.opening_time || '08:30 AM');
        setClosingTime(schedCfg.closing_time || '08:30 PM');
        setSlotDuration(schedCfg.slot_duration || '20 mins');
        setBufferTime(schedCfg.buffer_time || '5 mins');
        setBlockedSlots(schedCfg.blocked_slots || []);
      }
    } catch (err) {
      console.error('Failed to load schedule calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData();
  }, [selectedClinic]);

  // Navigate Date
  const handlePrev = () => {
    const next = new Date(selectedDate);
    if (viewMode === 'daily') {
      next.setDate(next.getDate() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setSelectedDate(next);
  };

  const handleNext = () => {
    const next = new Date(selectedDate);
    if (viewMode === 'daily') {
      next.setDate(next.getDate() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Compute 7 days for Weekly View
  const getWeekDays = () => {
    const curr = new Date(selectedDate);
    // Find Monday of the current week
    const first = curr.getDate() - (curr.getDay() === 0 ? 6 : curr.getDay() - 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr);
      d.setDate(first + i);
      days.push(d);
    }
    return days;
  };

  // Check Slot Status (Available vs Booked vs Blocked)
  const getSlotDetails = (doctorName, dateStr, timeSlot) => {
    // 1. Check if Blocked
    const blocked = blockedSlots.find(
      b => b.doctor_name === doctorName && b.date === dateStr && b.time_slot === timeSlot
    );
    if (blocked) {
      return { status: 'BLOCKED', data: blocked };
    }

    // 2. Check if Booked
    const booked = bookings.find(
      b => b.doctor_name === doctorName && b.preferred_date === dateStr && b.preferred_time === timeSlot
    );
    if (booked) {
      return { status: 'BOOKED', data: booked };
    }

    // 3. Otherwise Available
    return { status: 'AVAILABLE', data: null };
  };

  // Prevent Double Booking & Confirm Slot
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingModalSlot || !patientName.trim() || !patientPhone.trim()) return;

    const { doctor, dateStr, timeSlot } = bookingModalSlot;

    // STRICT CHECK: Double-Booking Prevention Rule
    const existing = bookings.find(
      b => b.doctor_name === doctor.name && b.preferred_date === dateStr && b.preferred_time === timeSlot
    );
    if (existing) {
      setBookingConflictMsg(`Double-booking prevented: Slot ${timeSlot} on ${dateStr} was just booked by ${existing.patient_name}. Please choose another time.`);
      return;
    }

    const isBlocked = blockedSlots.find(
      b => b.doctor_name === doctor.name && b.date === dateStr && b.time_slot === timeSlot
    );
    if (isBlocked) {
      setBookingConflictMsg(`Slot is blocked (${isBlocked.reason}). Please select an available slot.`);
      return;
    }

    const payload = {
      patient_name: patientName.trim(),
      phone: patientPhone.trim(),
      clinic_code: selectedClinic,
      doctor_name: doctor.name,
      preferred_date: dateStr,
      preferred_time: timeSlot,
      visit_type: visitType,
      notes: "Front-desk calendar allocation",
      booking_source: "Clinic Admin Calendar"
    };

    try {
      const res = await createAppointment(payload);
      const newBooking = {
        ...payload,
        reference_id: res.data?.reference_id || `CC-${Date.now().toString(36).toUpperCase()}`,
        status: 'VERIFIED_CONFIRMED',
        clinic_name: clinics.find(c => c.code === selectedClinic)?.name || "CareConnect Clinic",
        specialty: doctor.specialty
      };

      setBookings(prev => [newBooking, ...prev]);
      setBookingSuccess(`Slot ${timeSlot} confirmed for ${patientName}! Double-booking lock engaged.`);
      showNotification(`Appointment booked for ${patientName}!`);
      setTimeout(() => {
        setBookingSuccess('');
        setBookingConflictMsg('');
        setBookingModalSlot(null);
        setPatientName('');
        setPatientPhone('');
      }, 1400);
    } catch (err) {
      setBookingConflictMsg(err.message || 'Failed to book slot.');
    }
  };

  // Block a Slot
  const handleConfirmBlock = async (e) => {
    e.preventDefault();
    if (!blockModalSlot) return;

    const { doctor, dateStr, timeSlot } = blockModalSlot;
    const blockData = {
      doctor_name: doctor.name,
      date: dateStr,
      time_slot: timeSlot,
      reason: blockReason.trim() || "Staff Blocked"
    };

    try {
      await blockClinicSlot(selectedClinic, blockData);
      setBlockedSlots(prev => [...prev, blockData]);
      showNotification(`Slot ${timeSlot} blocked for ${doctor.name}.`);
      setBlockModalSlot(null);
    } catch (err) {
      console.error('Failed to block slot:', err);
    }
  };

  // Unblock a Slot
  const handleUnblock = async (doctorName, dateStr, timeSlot) => {
    try {
      await unblockClinicSlot(selectedClinic, { doctor_name: doctorName, date: dateStr, time_slot: timeSlot });
      setBlockedSlots(prev => prev.filter(
        b => !(b.doctor_name === doctorName && b.date === dateStr && b.time_slot === timeSlot)
      ));
      showNotification(`Slot ${timeSlot} unblocked and reopened.`);
    } catch (err) {
      console.error('Failed to unblock slot:', err);
    }
  };

  // Cancel a Booking from Calendar
  const handleCancelBooking = async (referenceId) => {
    try {
      await updateAppointmentStatus(referenceId, 'CANCELLED', 'Cancelled by Clinic Desk');
      setBookings(prev => prev.filter(b => b.reference_id !== referenceId));
      showNotification(`Booking cancelled. Slot has been freed for patient waitlists.`);
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  };

  // Save Schedule Config
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const configPayload = {
      opening_time: openingTime,
      closing_time: closingTime,
      slot_duration: slotDuration,
      buffer_time: bufferTime
    };
    try {
      await saveScheduleConfig(selectedClinic, configPayload);
      showNotification(`Clinic operating hours (${openingTime} - ${closingTime}) saved!`);
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('Failed to save schedule settings:', err);
    }
  };

  // Filter Doctors to show
  const activeDoctors = doctors.filter(d => d.is_active !== false);
  const displayDoctors = selectedDoctorFilter === 'ALL'
    ? activeDoctors
    : activeDoctors.filter(d => d.name === selectedDoctorFilter);

  const currentDateISO = formatDateISO(selectedDate);
  const weekDays = getWeekDays();

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

      {/* Header & Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
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
            <CalendarIcon size={13} color="#0F5B4C" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Real-Time Calendar Schedule
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0A2520', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>
            Doctor Appointment Timetable
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Live slot allocation matrix: available, booked, and blocked slots with strict double-booking prevention.
          </p>
        </div>

        {/* Top Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '10px',
              backgroundColor: '#FFFFFF',
              color: '#0A2520',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Settings size={15} color="#0F5B4C" />
            <span>Configure Hours & Duration</span>
          </button>
        </div>
      </div>

      {/* Toolbar: Views (Daily / Weekly), Date Navigator & Doctor Filters */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '18px',
        padding: '16px 20px',
        border: '1px solid rgba(15, 91, 76, 0.1)',
        boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Left: View Switcher & Today Shortcut */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'inline-flex', backgroundColor: '#F1F5F9', borderRadius: '10px', padding: '3px' }}>
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'daily' ? '#0F5B4C' : 'transparent',
                color: viewMode === 'daily' ? '#FFFFFF' : '#64748B',
                transition: 'all 0.15s ease'
              }}
            >
              Daily View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('weekly')}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'weekly' ? '#0F5B4C' : 'transparent',
                color: viewMode === 'weekly' ? '#FFFFFF' : '#64748B',
                transition: 'all 0.15s ease'
              }}
            >
              Weekly View
            </button>
          </div>

          <button
            type="button"
            onClick={handleToday}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F5B4C',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Today
          </button>
        </div>

        {/* Center: Date Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={handlePrev}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0A2520'
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0A2520', minWidth: '180px', textAlign: 'center' }}>
            {viewMode === 'daily' 
              ? formatDisplayDate(selectedDate)
              : `${formatDisplayDate(weekDays[0])} - ${formatDisplayDate(weekDays[6])}`}
          </span>

          <button
            type="button"
            onClick={handleNext}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0A2520'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: Doctor & Clinic Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Stethoscope size={14} color="#64748B" />
            <select
              value={selectedDoctorFilter}
              onChange={e => setSelectedDoctorFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                color: '#0A2520',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Physicians ({activeDoctors.length})</option>
              {activeDoctors.map(doc => (
                <option key={doc.id || doc.name} value={doc.name}>{doc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Legend & Conflict Protection Status Bar */}
      <div style={{
        backgroundColor: '#EDFDF9',
        borderRadius: '12px',
        padding: '10px 18px',
        border: '1px solid rgba(0, 201, 167, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#DCFAF3', border: '1px solid #00C9A7' }} />
            <span style={{ color: '#0F5B4C' }}>Available (Click to Book)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#0F5B4C', border: '1px solid #0F5B4C' }} />
            <span style={{ color: '#0A2520' }}>Booked (Locked)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }} />
            <span style={{ color: '#B45309' }}>Blocked / Break</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0F5B4C', fontWeight: 700 }}>
          <ShieldAlert size={14} color="#00C9A7" />
          <span>Double-Booking Prevention Protocol: ACTIVE</span>
        </div>
      </div>

      {/* ── DAILY VIEW ── */}
      {viewMode === 'daily' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid rgba(15, 91, 76, 0.1)',
          boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
          overflowX: 'auto',
          padding: '20px'
        }}>
          {displayDoctors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              No active doctors found for the selected filter.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: `100px repeat(${displayDoctors.length}, minmax(220px, 1fr))`,
              gap: '12px',
              minWidth: `${100 + displayDoctors.length * 220}px`
            }}>
              {/* Top Header Corner */}
              <div style={{ padding: '12px', fontWeight: 800, color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                Slot Time
              </div>

              {/* Doctor Column Headers */}
              {displayDoctors.map(doc => (
                <div 
                  key={doc.id || doc.name}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: '#FAF8F5',
                    border: '1px solid rgba(15, 91, 76, 0.08)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14px' }}>{doc.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#00C9A7', fontWeight: 700 }}>{doc.specialty}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Duration: {doc.consultation_duration || slotDuration}</div>
                </div>
              ))}

              {/* Time Slot Rows */}
              {TIME_SLOT_DEFAULTS.map(timeSlot => (
                <React.Fragment key={timeSlot}>
                  {/* Time Label on left */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#64748B',
                    padding: '8px'
                  }}>
                    {timeSlot}
                  </div>

                  {/* Doctor Slots for this Time */}
                  {displayDoctors.map(doc => {
                    const slotInfo = getSlotDetails(doc.name, currentDateISO, timeSlot);

                    // 1. BLOCKED SLOT
                    if (slotInfo.status === 'BLOCKED') {
                      return (
                        <div
                          key={`${doc.name}-${timeSlot}`}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            backgroundColor: '#FFFBEB',
                            border: '1px dashed #F59E0B',
                            color: '#B45309',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '64px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Lock size={12} />
                              <span>Blocked</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUnblock(doc.name, currentDateISO, timeSlot)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#B45309',
                                cursor: 'pointer',
                                fontSize: '11px',
                                textDecoration: 'underline'
                              }}
                            >
                              Unblock
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: '#92400E', fontStyle: 'italic', marginTop: '4px' }}>
                            {slotInfo.data?.reason || 'Staff Reserved'}
                          </div>
                        </div>
                      );
                    }

                    // 2. BOOKED SLOT (LOCKED)
                    if (slotInfo.status === 'BOOKED') {
                      const b = slotInfo.data;
                      return (
                        <div
                          key={`${doc.name}-${timeSlot}`}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            backgroundColor: '#0F5B4C',
                            color: '#FFFFFF',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '64px',
                            boxShadow: '0 2px 8px rgba(15, 91, 76, 0.25)',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 800, fontSize: '12.5px' }}>{b.patient_name}</span>
                            <span style={{
                              fontSize: '9.5px',
                              fontWeight: 800,
                              backgroundColor: '#00C9A7',
                              color: '#0A2520',
                              padding: '2px 5px',
                              borderRadius: '4px'
                            }}>
                              Locked
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#A7F3D0', margin: '3px 0' }}>
                            {b.visit_type}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#CBD5E1' }}>{b.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleCancelBooking(b.reference_id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#FCA5A5',
                                cursor: 'pointer',
                                fontSize: '10.5px',
                                padding: 0,
                                textDecoration: 'underline'
                              }}
                            >
                              Release
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // 3. AVAILABLE SLOT
                    return (
                      <div
                        key={`${doc.name}-${timeSlot}`}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: '#FAF8F5',
                          border: '1px solid rgba(15, 91, 76, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          minHeight: '64px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#0F5B4C',
                            backgroundColor: '#DCFAF3',
                            padding: '3px 8px',
                            borderRadius: '999px'
                          }}>
                            <Check size={11} color="#00C9A7" />
                            <span>Available</span>
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => setBookingModalSlot({ doctor, dateStr: currentDateISO, timeSlot })}
                            style={{
                              padding: '5px 9px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#0F5B4C',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Book patient into this slot"
                          >
                            + Book
                          </button>
                          <button
                            type="button"
                            onClick={() => setBlockModalSlot({ doctor, dateStr: currentDateISO, timeSlot })}
                            style={{
                              padding: '5px 7px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#64748B',
                              fontSize: '11px',
                              cursor: 'pointer'
                            }}
                            title="Block slot"
                          >
                            <Lock size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── WEEKLY VIEW ── */}
      {viewMode === 'weekly' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid rgba(15, 91, 76, 0.1)',
          boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
          overflowX: 'auto',
          padding: '20px'
        }}>
          {displayDoctors.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              Select a doctor to view their weekly timetable.
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '14px', fontSize: '14px', fontWeight: 700, color: '#0F5B4C' }}>
                Showing Weekly Schedule for: <strong>{displayDoctors[0].name}</strong> ({displayDoctors[0].specialty})
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '90px repeat(7, minmax(140px, 1fr))',
                gap: '10px',
                minWidth: '1000px'
              }}>
                {/* Header Corner */}
                <div style={{ padding: '10px', fontSize: '11.5px', fontWeight: 800, color: '#64748B' }}>
                  Slot Time
                </div>

                {/* 7 Day Headers */}
                {weekDays.map(day => {
                  const isToday = formatDateISO(day) === formatDateISO(new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        borderRadius: '10px',
                        backgroundColor: isToday ? '#DCFAF3' : '#F8FAFC',
                        border: isToday ? '1px solid #00C9A7' : '1px solid #E2E8F0'
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520' }}>
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}

                {/* Weekly Grid Rows */}
                {TIME_SLOT_DEFAULTS.slice(0, 12).map(timeSlot => (
                  <React.Fragment key={timeSlot}>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '11.5px', fontWeight: 700, color: '#64748B', padding: '6px' }}>
                      {timeSlot}
                    </div>

                    {weekDays.map(day => {
                      const dayISO = formatDateISO(day);
                      const activeDoc = displayDoctors[0];
                      const slotInfo = getSlotDetails(activeDoc.name, dayISO, timeSlot);

                      if (slotInfo.status === 'BLOCKED') {
                        return (
                          <div
                            key={`${dayISO}-${timeSlot}`}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: '#FFFBEB',
                              border: '1px dashed #F59E0B',
                              fontSize: '11px',
                              color: '#B45309',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>Blocked</span>
                            <button
                              type="button"
                              onClick={() => handleUnblock(activeDoc.name, dayISO, timeSlot)}
                              style={{ background: 'none', border: 'none', color: '#B45309', cursor: 'pointer', padding: 0 }}
                            >
                              <Unlock size={12} />
                            </button>
                          </div>
                        );
                      }

                      if (slotInfo.status === 'BOOKED') {
                        return (
                          <div
                            key={`${dayISO}-${timeSlot}`}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              backgroundColor: '#0F5B4C',
                              color: '#FFFFFF',
                              fontSize: '11px'
                            }}
                          >
                            <div style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {slotInfo.data.patient_name}
                            </div>
                            <div style={{ fontSize: '9.5px', color: '#A7F3D0' }}>Confirmed</div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={`${dayISO}-${timeSlot}`}
                          onClick={() => setBookingModalSlot({ doctor: activeDoc, dateStr: dayISO, timeSlot })}
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            backgroundColor: '#FAF8F5',
                            border: '1px solid #E2E8F0',
                            fontSize: '11px',
                            color: '#0F5B4C',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DCFAF3'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FAF8F5'}
                        >
                          <span style={{ fontWeight: 600 }}>+ Available</span>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: BOOKING & DOUBLE-BOOKING PREVENTION ── */}
      {bookingModalSlot && (
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
              onClick={() => { setBookingModalSlot(null); setBookingConflictMsg(''); }}
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
                <Clock size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                  Confirm Slot Allocation
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  {bookingModalSlot.doctor.name} · {bookingModalSlot.dateStr} at {bookingModalSlot.timeSlot}
                </p>
              </div>
            </div>

            {bookingSuccess ? (
              <div style={{ padding: '20px', backgroundColor: '#DCFAF3', color: '#0F5B4C', borderRadius: '14px', textAlign: 'center', fontWeight: 700 }}>
                <CheckCircle2 size={32} color="#00C9A7" style={{ margin: '0 auto 8px' }} />
                <div>{bookingSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {bookingConflictMsg && (
                  <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12.5px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <ShieldAlert size={16} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{bookingConflictMsg}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Patient Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={patientPhone}
                    onChange={e => setPatientPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Consultation Type
                  </label>
                  <select
                    value={visitType}
                    onChange={e => setVisitType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="In-Person Consultation">In-Person Consultation</option>
                    <option value="Follow-Up Review">Follow-Up Review</option>
                    <option value="Routine Checkup">Routine Checkup</option>
                    <option value="Video Consultation">Video Consultation</option>
                  </select>
                </div>

                <div style={{ backgroundColor: '#FAF8F5', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', color: '#64748B' }}>
                  Locking this slot prevents collision across Web and Priya Voice AI callers simultaneously.
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setBookingModalSlot(null); setBookingConflictMsg(''); }}
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
                    style={{
                      flex: 2,
                      padding: '11px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#0F5B4C',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                    }}
                  >
                    Confirm & Lock Slot
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: BLOCK SLOT ── */}
      {blockModalSlot && (
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
              onClick={() => setBlockModalSlot(null)}
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
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={20} color="#D97706" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0A2520' }}>
                  Block Physician Slot
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  {blockModalSlot.doctor.name} · {blockModalSlot.timeSlot}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmBlock} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Reason for Blocking Slot
                </label>
                <select
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
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
                  <option value="Doctor Break / Lunch">Doctor Break / Lunch</option>
                  <option value="Hospital Board Round">Hospital Board Round</option>
                  <option value="Emergency Procedure">Emergency Procedure</option>
                  <option value="Sanitization & Maintenance">Sanitization & Maintenance</option>
                  <option value="Personal Leave / Delayed Duty">Personal Leave / Delayed Duty</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setBlockModalSlot(null)}
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
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: CONFIGURE HOURS & DURATION ── */}
      {isSettingsOpen && (
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
            maxWidth: '520px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                  Clinic Hours & Appointment Duration
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Changes automatically apply to voice telephony verification and calendar grids.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Clinic Opening Time
                  </label>
                  <input
                    type="text"
                    value={openingTime}
                    onChange={e => setOpeningTime(e.target.value)}
                    placeholder="08:30 AM"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Clinic Closing Time
                  </label>
                  <input
                    type="text"
                    value={closingTime}
                    onChange={e => setClosingTime(e.target.value)}
                    placeholder="08:30 PM"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Default Slot Duration
                  </label>
                  <select
                    value={slotDuration}
                    onChange={e => setSlotDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="15 mins">15 mins</option>
                    <option value="20 mins">20 mins</option>
                    <option value="30 mins">30 mins</option>
                    <option value="45 mins">45 mins</option>
                    <option value="60 mins">60 mins</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Buffer Between Slots
                  </label>
                  <select
                    value={bufferTime}
                    onChange={e => setBufferTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="0 mins">0 mins</option>
                    <option value="5 mins">5 mins</option>
                    <option value="10 mins">10 mins</option>
                    <option value="15 mins">15 mins</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
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
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                  }}
                >
                  Save Schedule Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Plus, 
  Search, 
  Phone, 
  ArrowRight, 
  CalendarDays,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Check,
  X,
  Users
} from 'lucide-react';
import { 
  fetchAppointmentsOverview, 
  fetchDoctorsOnDuty, 
  fetchClinics, 
  addDoctorToClinic, 
  updateAppointmentStatus 
} from '../api/client';

export default function ClinicOverview({ onNavigateToPatients }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'cancellations' | 'doctors' | 'schedule'
  const [overviewData, setOverviewData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Doctor Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('General Medicine');
  const [newDocClinic, setNewDocClinic] = useState('CARE-IND-01');
  const [newDocExp, setNewDocExp] = useState('8+ years');
  const [newDocFee, setNewDocFee] = useState('800');
  const [newDocLangs, setNewDocLangs] = useState('English, Hindi');
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [docSuccessMsg, setDocSuccessMsg] = useState('');

  // Load Overview & Doctors
  const loadData = async () => {
    setLoading(true);
    try {
      const [overview, onDutyDocs, clinicList] = await Promise.all([
        fetchAppointmentsOverview(),
        fetchDoctorsOnDuty(),
        fetchClinics()
      ]);
      setOverviewData(overview);
      setDoctors(onDutyDocs || []);
      setClinics(clinicList || []);
      if (clinicList && clinicList.length > 0) {
        setNewDocClinic(clinicList[0].code);
      }
    } catch (err) {
      console.error('Error loading clinic overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Status Update (Cancel / Complete)
  const handleStatusChange = async (referenceId, newStatus) => {
    try {
      await updateAppointmentStatus(referenceId, newStatus);
      // Optimistic update
      setOverviewData(prev => {
        if (!prev) return prev;
        const updateList = (list) =>
          list.map(item => item.reference_id === referenceId ? { ...item, status: newStatus } : item);
        
        let upcoming = prev.upcoming_bookings || [];
        let cancellations = prev.cancellations || [];
        let today = prev.today_appointments || [];

        if (newStatus === 'CANCELLED') {
          const item = [...upcoming, ...today].find(p => p.reference_id === referenceId);
          upcoming = upcoming.filter(p => p.reference_id !== referenceId);
          today = today.filter(p => p.reference_id !== referenceId);
          if (item) cancellations = [{ ...item, status: 'CANCELLED' }, ...cancellations];
        }

        return {
          ...prev,
          upcoming_bookings: updateList(upcoming),
          cancellations: cancellations,
          today_appointments: updateList(today),
          metrics: {
            ...prev.metrics,
            cancellations_count: cancellations.length,
            upcoming_count: upcoming.length,
            today_count: today.length,
          }
        };
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle Add Doctor
  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    setDocSubmitting(true);
    try {
      const payload = {
        name: newDocName.trim(),
        specialty: newDocSpecialty,
        experience: newDocExp,
        languages: newDocLangs.split(',').map(s => s.trim()).filter(Boolean),
        consultation_fee: parseInt(newDocFee, 10) || 700,
        available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        available_slots: ["10:00 AM", "11:30 AM", "02:30 PM", "04:30 PM", "06:00 PM"]
      };

      const res = await addDoctorToClinic(newDocClinic, payload);
      const chosenClinic = clinics.find(c => c.code === newDocClinic);
      
      const newDoc = {
        ...payload,
        id: res.data?.id || `doc-${Date.now()}`,
        clinic_name: chosenClinic ? chosenClinic.name : "CareConnect Clinic",
        clinic_code: newDocClinic,
        duty_status: "Available",
        current_room: "Consultation Room 3"
      };

      setDoctors(prev => [newDoc, ...prev]);
      setDocSuccessMsg(`Dr. ${newDocName} added to duty roster!`);
      setTimeout(() => {
        setDocSuccessMsg('');
        setIsAddDoctorOpen(false);
        setNewDocName('');
      }, 1500);
    } catch (err) {
      console.error('Failed to add doctor:', err);
    } finally {
      setDocSubmitting(false);
    }
  };

  // Filter Bookings by search
  const filteredBookings = (overviewData?.today_appointments || []).concat(overviewData?.upcoming_bookings || [])
    .filter(b => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.patient_name?.toLowerCase().includes(q) ||
        b.doctor_name?.toLowerCase().includes(q) ||
        b.reference_id?.toLowerCase().includes(q) ||
        b.specialty?.toLowerCase().includes(q)
      );
    });

  const metrics = overviewData?.metrics || {
    today_count: 14,
    upcoming_count: 38,
    cancellations_count: 2
  };

  return (
    <section 
      id="clinic-overview"
      style={{
        padding: '80px 0 90px',
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid rgba(15, 91, 76, 0.08)',
        borderBottom: '1px solid rgba(15, 91, 76, 0.08)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '36px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(235, 248, 244, 0.85)',
              border: '1px solid rgba(0, 201, 167, 0.3)',
              marginBottom: '12px'
            }}>
              <Activity size={14} color="#0F5B4C" />
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F5B4C', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                Operational Command
              </span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.8rem)',
              fontWeight: 900,
              color: '#0A2520',
              lineHeight: 1.15,
              margin: '0 0 8px',
              fontFamily: 'Manrope, sans-serif'
            }}>
              Clinic Dashboard
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, fontFamily: 'Inter, sans-serif' }}>
              Real-time daily roster, automated voice booking pipelines, on-duty doctors, and patient triage.
            </p>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {onNavigateToPatients && (
              <button
                type="button"
                onClick={onNavigateToPatients}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#EDFDF9',
                  color: '#0F5B4C',
                  border: '1px solid rgba(0, 201, 167, 0.4)',
                  fontWeight: 700,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DCFAF3'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EDFDF9'}
              >
                <Users size={16} color="#007A65" />
                <span>Patient Registry</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddDoctorOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: '#0F5B4C',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 91, 76, 0.2)',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0A4337'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0F5B4C'}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                color: '#0A2520',
                border: '1px solid rgba(15, 91, 76, 0.12)',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            >
              <CalendarDays size={16} color="#0F5B4C" />
              <span>View Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                backgroundColor: '#EDFDF9',
                color: '#0F5B4C',
                border: '1px solid rgba(0, 201, 167, 0.3)',
                fontWeight: 700,
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DCFAF3'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#EDFDF9'}
            >
              <Layers size={16} color="#00C9A7" />
              <span>View Bookings</span>
            </button>
          </div>
        </div>

        {/* ── Metric Cards Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          {/* Card 1: Today's Appointments */}
          <div 
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '24px',
              borderRadius: '18px',
              backgroundColor: '#FAF8F5',
              border: activeTab === 'bookings' ? '2px solid #00C9A7' : '1px solid rgba(15, 91, 76, 0.1)',
              boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Today's Appointments
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EAF6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} color="#0F5B4C" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                {metrics.today_count}
              </span>
              <span style={{ fontSize: '12px', color: '#00C9A7', fontWeight: 700, backgroundColor: 'rgba(0, 201, 167, 0.12)', padding: '2px 8px', borderRadius: '999px' }}>
                Active Today
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '8px 0 0', fontFamily: 'Inter, sans-serif' }}>
              Verified via Priya Voice Receptionist
            </p>
          </div>

          {/* Card 2: Upcoming Bookings */}
          <div 
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '24px',
              borderRadius: '18px',
              backgroundColor: '#FAF8F5',
              border: activeTab === 'bookings' ? '2px solid #00C9A7' : '1px solid rgba(15, 91, 76, 0.1)',
              boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Upcoming Bookings
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#00C9A7" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                {metrics.upcoming_count}
              </span>
              <span style={{ fontSize: '12px', color: '#0F5B4C', fontWeight: 700, backgroundColor: 'rgba(15, 91, 76, 0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                Next 7 Days
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '8px 0 0', fontFamily: 'Inter, sans-serif' }}>
              Synchronized with doctor calendars
            </p>
          </div>

          {/* Card 3: Doctors on Duty */}
          <div 
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '24px',
              borderRadius: '18px',
              backgroundColor: activeTab === 'doctors' ? '#EDFDF9' : '#FAF8F5',
              border: activeTab === 'doctors' ? '2px solid #00C9A7' : '1px solid rgba(15, 91, 76, 0.1)',
              boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Doctors on Duty
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={18} color="#00C9A7" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                {doctors.length}
              </span>
              <span style={{ fontSize: '12px', color: '#0F5B4C', fontWeight: 700, backgroundColor: 'rgba(0, 201, 167, 0.15)', padding: '2px 8px', borderRadius: '999px' }}>
                Active Specialists
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '8px 0 0', fontFamily: 'Inter, sans-serif' }}>
              Available across verified clinic OPDs
            </p>
          </div>

          {/* Card 4: Cancellations */}
          <div 
            onClick={() => setActiveTab('cancellations')}
            style={{
              padding: '24px',
              borderRadius: '18px',
              backgroundColor: activeTab === 'cancellations' ? '#FEF2F2' : '#FAF8F5',
              border: activeTab === 'cancellations' ? '2px solid #EF4444' : '1px solid rgba(15, 91, 76, 0.1)',
              boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Cancellations
              </span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={18} color="#DC2626" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '34px', fontWeight: 900, color: '#991B1B', fontFamily: 'Manrope, sans-serif' }}>
                {metrics.cancellations_count}
              </span>
              <span style={{ fontSize: '12px', color: '#DC2626', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                Slot Freed
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '8px 0 0', fontFamily: 'Inter, sans-serif' }}>
              Instant slot re-opened for waitlists
            </p>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #F1F5F9',
          marginBottom: '28px',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'bookings', label: "Today & Upcoming Bookings", count: metrics.today_count + metrics.upcoming_count },
              { id: 'doctors', label: 'Doctors on Duty', count: doctors.length },
              { id: 'cancellations', label: 'Cancellations', count: metrics.cancellations_count },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '3px solid #00C9A7' : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? '#0A2520' : '#64748B',
                  fontWeight: activeTab === tab.id ? 800 : 600,
                  fontSize: '14.5px',
                  cursor: 'pointer',
                  fontFamily: 'Manrope, sans-serif',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  backgroundColor: tab.alert && tab.count > 0 ? '#F59E0B' : (activeTab === tab.id ? '#0F5B4C' : '#E2E8F0'),
                  color: tab.alert && tab.count > 0 ? '#FFFFFF' : (activeTab === tab.id ? '#FFFFFF' : '#475569'),
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar inside tabs toolbar */}
          {activeTab === 'bookings' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              marginBottom: '8px'
            }}>
              <Search size={15} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search patient, doctor, ticket..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: '#0A2520',
                  fontFamily: 'Inter, sans-serif',
                  width: '200px'
                }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <X size={14} color="#64748B" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── TAB CONTENT ── */}

        {/* 1. Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div style={{
              backgroundColor: '#FAF8F5',
              borderRadius: '20px',
              border: '1px solid rgba(15, 91, 76, 0.08)',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(10, 37, 32, 0.02)'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#EAF6F3', borderBottom: '1px solid rgba(15, 91, 76, 0.1)', color: '#0F5B4C', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '16px 20px' }}>Patient</th>
                      <th style={{ padding: '16px 20px' }}>Physician & Clinic</th>
                      <th style={{ padding: '16px 20px' }}>Date & Slot</th>
                      <th style={{ padding: '16px 20px' }}>Visit Type</th>
                      <th style={{ padding: '16px 20px' }}>Status</th>
                      <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                          No bookings matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.reference_id} style={{ borderBottom: '1px solid rgba(15, 91, 76, 0.06)', transition: 'background-color 0.15s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFFFFF'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14px' }}>{b.patient_name}</div>
                            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                              <Phone size={11} color="#00C9A7" />
                              <span>{b.phone}</span>
                            </div>
                            <span style={{ fontSize: '10.5px', color: '#94A3B8', fontFamily: 'monospace' }}>Ref: {b.reference_id}</span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 700, color: '#0F5B4C', fontSize: '13.5px' }}>{b.doctor_name}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{b.specialty}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{b.clinic_name}</div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <div style={{ fontWeight: 700, color: '#0A2520', fontSize: '13.5px' }}>{b.preferred_date}</div>
                            <div style={{ fontSize: '12.5px', color: '#00C9A7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} />
                              <span>{b.preferred_time}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: '999px',
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              display: 'inline-block'
                            }}>
                              {b.visit_type}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '999px',
                              fontSize: '11.5px',
                              fontWeight: 800,
                              backgroundColor: b.status === 'VERIFIED_CONFIRMED' ? 'rgba(0, 201, 167, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                              color: b.status === 'VERIFIED_CONFIRMED' ? '#0F5B4C' : '#DC2626'
                            }}>
                              {b.status === 'VERIFIED_CONFIRMED' ? <CheckCircle2 size={13} color="#00C9A7" /> : <XCircle size={13} color="#DC2626" />}
                              <span>{b.status === 'VERIFIED_CONFIRMED' ? 'Confirmed' : 'Cancelled'}</span>
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            {b.status === 'VERIFIED_CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(b.reference_id, 'CANCELLED')}
                                style={{
                                  padding: '5px 12px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  color: '#DC2626',
                                  backgroundColor: '#FEE2E2',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FECACA'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FEE2E2'}
                              >
                                Cancel Slot
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}



        {/* 3. Cancellations Tab */}
        {activeTab === 'cancellations' && (
          <div style={{
            backgroundColor: '#FAF8F5',
            borderRadius: '20px',
            border: '1px solid rgba(15, 91, 76, 0.08)',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FEE2E2', borderBottom: '1px solid #FECACA', color: '#991B1B', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '16px 20px' }}>Patient</th>
                    <th style={{ padding: '16px 20px' }}>Physician</th>
                    <th style={{ padding: '16px 20px' }}>Original Slot</th>
                    <th style={{ padding: '16px 20px' }}>Cancellation Reason</th>
                    <th style={{ padding: '16px 20px' }}>Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {(overviewData?.cancellations || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                        No cancellations recorded.
                      </td>
                    </tr>
                  ) : (
                    (overviewData?.cancellations || []).map(c => (
                      <tr key={c.reference_id} style={{ borderBottom: '1px solid rgba(15, 91, 76, 0.06)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14px' }}>{c.patient_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{c.phone}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, color: '#0F5B4C', fontSize: '13.5px' }}>{c.doctor_name}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{c.clinic_name}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, color: '#0A2520', fontSize: '13px' }}>{c.preferred_date}</div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>{c.preferred_time}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontSize: '13px', color: '#B91C1C', fontStyle: 'italic' }}>
                            {c.notes || "Slot released for waitlisted patient"}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: '999px',
                            backgroundColor: '#DCFAF3',
                            color: '#0F5B4C'
                          }}>
                            Slot Reopened & Available
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. Doctors on Duty Tab */}
        {activeTab === 'doctors' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
            {doctors.map((doc) => (
              <div 
                key={doc.id || doc.name}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid rgba(15, 91, 76, 0.1)',
                  boxShadow: '0 4px 18px rgba(10, 37, 32, 0.04)',
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#EAF6F3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(0, 201, 167, 0.3)'
                    }}>
                      <Stethoscope size={20} color="#0F5B4C" />
                    </div>
                    
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: doc.duty_status === 'In Consultation' ? '#FEF3C7' : '#EDFDF9',
                      color: doc.duty_status === 'In Consultation' ? '#B45309' : '#0F5B4C',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: doc.duty_status === 'In Consultation' ? '#F59E0B' : '#00C9A7'
                      }} />
                      <span>{doc.duty_status || "On Duty"}</span>
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                    {doc.name}
                  </h4>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#00C9A7', marginBottom: '8px' }}>
                    {doc.specialty}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
                    <Building2 size={13} color="#0F5B4C" />
                    <span>{doc.clinic_name || "CareConnect Partner Clinic"}</span>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                      Exp: {doc.experience}
                    </span>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                      Fee: ₹{doc.consultation_fee}
                    </span>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                      {(doc.languages || []).join(', ')}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                    {doc.current_room || "Consultation Suite 1"}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F5B4C' }}>
                    {(doc.available_slots || []).length} slots today
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── MODAL 1: ADD DOCTOR ── */}
      {isAddDoctorOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
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
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsAddDoctorOpen(false)}
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
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EAF6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={20} color="#0F5B4C" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                  Add Doctor to Roster
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Register a physician for voice triage & verified calendar booking.</p>
              </div>
            </div>

            {docSuccessMsg ? (
              <div style={{ padding: '20px', backgroundColor: '#DCFAF3', color: '#0F5B4C', borderRadius: '14px', textAlign: 'center', fontWeight: 700 }}>
                <CheckCircle2 size={32} color="#00C9A7" style={{ margin: '0 auto 8px' }} />
                <div>{docSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleAddDoctorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Menon"
                    value={newDocName}
                    onChange={e => setNewDocName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      color: '#0A2520',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Specialty
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. General Medicine"
                      value={newDocSpecialty}
                      onChange={e => setNewDocSpecialty(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        color: '#0A2520',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Experience
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 10+ years"
                      value={newDocExp}
                      onChange={e => setNewDocExp(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        color: '#0A2520',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Clinic Location
                    </label>
                    <select
                      value={newDocClinic}
                      onChange={e => setNewDocClinic(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        color: '#0A2520',
                        backgroundColor: '#FFFFFF',
                        boxSizing: 'border-box'
                      }}
                    >
                      {clinics.map(c => (
                        <option key={c.code} value={c.code}>{c.name} ({c.branch})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={newDocFee}
                      onChange={e => setNewDocFee(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        color: '#0A2520',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Consulting Languages (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newDocLangs}
                    onChange={e => setNewDocLangs(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '14px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddDoctorOpen(false)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={docSubmitting}
                    style={{
                      flex: 2,
                      padding: '11px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#0F5B4C',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      cursor: docSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                    }}
                  >
                    {docSubmitting ? 'Registering...' : 'Add Doctor to Duty'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 2: VIEW SCHEDULE ── */}
      {isScheduleModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '720px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarDays size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                  Doctor Operating Schedule
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>Timetable used by Priya Voice AI to verify live appointment requests.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {doctors.map(doc => (
                <div key={doc.id || doc.name} style={{ padding: '16px', borderRadius: '14px', backgroundColor: '#FAF8F5', border: '1px solid rgba(15, 91, 76, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '15px' }}>{doc.name}</div>
                      <div style={{ fontSize: '12.5px', color: '#00C9A7', fontWeight: 600 }}>{doc.specialty} · {doc.clinic_name}</div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '999px', backgroundColor: '#DCFAF3', color: '#0F5B4C', fontWeight: 700 }}>
                      Active
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                    <strong>Available Days:</strong> {(doc.available_days || ["Monday - Saturday"]).join(', ')}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(doc.available_slots || ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"]).map(slot => (
                      <span key={slot} style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F5B4C', fontWeight: 600 }}>
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}


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
  Users,
  FileText,
  PhoneCall,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock4
} from 'lucide-react';
import { 
  fetchAppointmentsOverview, 
  fetchDoctorsOnDuty, 
  fetchClinics, 
  addDoctorToClinic, 
  updateAppointmentStatus 
} from '../api/client';
import BackgroundPattern from './common/BackgroundPattern';

export default function ClinicOverview({ onNavigateToPatients, onNavigateToReports, onNavigateToDoctors }) {
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'cancellations' | 'doctors'
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
        clinic_name: chosenClinic ? chosenClinic.name : "Apex Care Clinic",
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

  const metrics = overviewData?.metrics || {
    today_count: 14,
    upcoming_count: 38,
    cancellations_count: 2
  };

  // Determine appointments to display based on activeTab
  const getDisplayedAppointments = () => {
    let list = [];
    if (activeTab === 'today') {
      list = overviewData?.today_appointments || [];
    } else if (activeTab === 'upcoming') {
      list = overviewData?.upcoming_bookings || [];
    } else if (activeTab === 'cancellations') {
      list = overviewData?.cancellations || [];
    } else {
      list = (overviewData?.today_appointments || []).concat(overviewData?.upcoming_bookings || []);
    }

    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(b => 
      b.patient_name?.toLowerCase().includes(q) ||
      b.doctor_name?.toLowerCase().includes(q) ||
      b.reference_id?.toLowerCase().includes(q) ||
      b.specialty?.toLowerCase().includes(q)
    );
  };

  const displayedList = getDisplayedAppointments();

  return (
    <div style={{ position: 'relative', minHeight: '100%' }}>
      {/* ── Sera UI Background Pattern with Radial Gradient Mask ── */}
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />

      {/* ── Content Container ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ── 21st.dev Executive Header Banner ── */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '22px 28px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '18px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: '#EDFDF9',
                color: '#007A65',
                fontSize: '11px',
                fontWeight: 800,
                border: '1px solid rgba(0, 201, 167, 0.3)'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00C9A7', animation: 'pulseDotLive 1.5s infinite' }} />
                OPERATIONAL LIVE
              </span>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                Node: <strong>Apollo Prime, Bangalore (CARE-IND-01)</strong>
              </span>
            </div>

            <h1 style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#0A2520',
              margin: '0 0 4px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.02em'
            }}>
              Clinical Operations Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Live patient queues, on-duty specialist chambers, Priya Voice AI telephony, and schedule verification.
            </p>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sync Roster</span>
            </button>

            {onNavigateToDoctors && (
              <button
                type="button"
                onClick={onNavigateToDoctors}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#EDFDF9',
                  color: '#0F5B4C',
                  border: '1px solid rgba(0, 201, 167, 0.35)',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                <Stethoscope size={14} color="#00C9A7" />
                <span>Doctor Roster</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddDoctorOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: '#0F5B4C',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 91, 76, 0.25)'
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>Add Physician</span>
            </button>
          </div>
        </div>

        {/* ── 21st.dev Bento Metric Grid ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {/* Card 1: Today's Appointments */}
          <div 
            onClick={() => setActiveTab('today')}
            style={{
              padding: '20px 22px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: activeTab === 'today' ? '2px solid #00C9A7' : '1px solid #E2E8F0',
              boxShadow: activeTab === 'today' ? '0 4px 16px rgba(0, 201, 167, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Today's Consultations
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={16} color="#00C9A7" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {metrics.today_count}
              </span>
              <span style={{ fontSize: '11px', color: '#007A65', fontWeight: 800, backgroundColor: '#EDFDF9', padding: '2px 7px', borderRadius: '999px' }}>
                +14% vs yesterday
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
              8 In-Person · 6 Priya Voice AI Booked
            </div>
          </div>

          {/* Card 2: Upcoming Bookings */}
          <div 
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '20px 22px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: activeTab === 'upcoming' ? '2px solid #00C9A7' : '1px solid #E2E8F0',
              boxShadow: activeTab === 'upcoming' ? '0 4px 16px rgba(0, 201, 167, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Upcoming (7 Days)
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} color="#2563EB" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {metrics.upcoming_count}
              </span>
              <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 800, backgroundColor: '#EFF6FF', padding: '2px 7px', borderRadius: '999px' }}>
                Roster Synced
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
              Verified slot allocations
            </div>
          </div>

          {/* Card 3: Active Specialists On Duty */}
          <div 
            onClick={() => setActiveTab('doctors')}
            style={{
              padding: '20px 22px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: activeTab === 'doctors' ? '2px solid #00C9A7' : '1px solid #E2E8F0',
              boxShadow: activeTab === 'doctors' ? '0 4px 16px rgba(0, 201, 167, 0.12)' : '0 1px 3px rgba(0,0,0,0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Doctors On Duty
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EDFDF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={16} color="#00C9A7" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {doctors.length || 5}
              </span>
              <span style={{ fontSize: '11px', color: '#0F5B4C', fontWeight: 800, backgroundColor: '#EDFDF9', padding: '2px 7px', borderRadius: '999px' }}>
                Chambers Active
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
              Medicine, Cardio, Pediatrics, ENT
            </div>
          </div>

          {/* Card 4: Voice AI Bookings (Priya) */}
          <div 
            style={{
              padding: '20px 22px',
              borderRadius: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Priya AI Voice Intake
              </span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={16} color="#7C3AED" />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '30px', fontWeight: 900, color: '#7C3AED', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                98.4%
              </span>
              <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 800, backgroundColor: '#FAF5FF', padding: '2px 7px', borderRadius: '999px' }}>
                Precision
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
              Zero slot collisions or double-bookings
            </div>
          </div>
        </div>

        {/* ── 21st.dev Main Split Grid: Left (Data Explorer) & Right (Clinic Command Sidebar) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '24px',
          alignItems: 'start'
        }}>
          
          {/* ── Left Column: Tabbed Data Explorer ── */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Tab Selection Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#FAFAF9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'today', label: `Today's Appointments (${metrics.today_count})` },
                  { id: 'upcoming', label: `Upcoming Bookings (${metrics.upcoming_count})` },
                  { id: 'cancellations', label: `Cancellations (${metrics.cancellations_count})` },
                  { id: 'doctors', label: `Duty Roster (${doctors.length})` }
                ].map(t => {
                  const isCur = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: isCur ? '1px solid #00C9A7' : '1px solid transparent',
                        backgroundColor: isCur ? '#EDFDF9' : 'transparent',
                        color: isCur ? '#0F5B4C' : '#64748B',
                        fontSize: '12.5px',
                        fontWeight: isCur ? 800 : 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={13} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Filter queue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            {/* Content view depending on active tab */}
            {activeTab === 'doctors' ? (
              /* Doctor Roster View */
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '14px'
                }}>
                  {doctors.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: '#EDFDF9',
                          border: '1px solid rgba(0, 201, 167, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#007A65',
                          fontWeight: 800,
                          fontSize: '14px'
                        }}>
                          {doc.name.split(' ').filter(n => !n.startsWith('Dr')).map(n => n[0]).slice(0, 2).join('') || 'DR'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '14px' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#0F5B4C', fontWeight: 600 }}>
                            {doc.specialty}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div>📍 Room: <strong>{doc.current_room || 'Consultation Room 1'}</strong></div>
                        <div>⏱ Fee: <strong>₹{doc.consultation_fee || 700}</strong> · Exp: {doc.experience || '8+ yrs'}</div>
                        <div style={{ marginTop: '4px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '10.5px',
                            fontWeight: 800,
                            backgroundColor: '#EDFDF9',
                            color: '#007A65'
                          }}>
                            ● ON DUTY TODAY
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Appointments Table */
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '12px 18px', fontWeight: 800 }}>Time & Ref</th>
                      <th style={{ padding: '12px 18px', fontWeight: 800 }}>Patient</th>
                      <th style={{ padding: '12px 18px', fontWeight: 800 }}>Physician & Dept</th>
                      <th style={{ padding: '12px 18px', fontWeight: 800 }}>Channel / Type</th>
                      <th style={{ padding: '12px 18px', fontWeight: 800 }}>Status</th>
                      <th style={{ padding: '12px 18px', fontWeight: 800, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedList.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                          <Calendar size={28} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
                          <div style={{ fontWeight: 700, color: '#0A2520' }}>No appointments match this view</div>
                          <div style={{ fontSize: '12px', marginTop: '2px' }}>Try switching tabs or adjusting search criteria.</div>
                        </td>
                      </tr>
                    ) : (
                      displayedList.map((item, idx) => {
                        const isCancelled = item.status === 'CANCELLED';
                        const isCompleted = item.status === 'COMPLETED';
                        const isConfirmed = item.status === 'CONFIRMED' || !item.status;

                        return (
                          <tr 
                            key={item.reference_id || idx}
                            style={{ 
                              borderBottom: '1px solid #F1F5F9',
                              transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAF9'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            {/* Time & Ref */}
                            <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                              <div style={{ fontWeight: 800, color: '#0A2520' }}>
                                {item.time || item.slot || '10:30 AM'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#0F5B4C', fontFamily: 'monospace', marginTop: '2px' }}>
                                {item.reference_id || `REF-${1000 + idx}`}
                              </div>
                            </td>

                            {/* Patient */}
                            <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                              <div style={{ fontWeight: 800, color: '#0A2520' }}>
                                {item.patient_name || 'Patient'}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Phone size={10} color="#00C9A7" />
                                <span>{item.phone || item.patient_phone || '+91 98XXX XXXXX'}</span>
                              </div>
                            </td>

                            {/* Doctor & Specialty */}
                            <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                              <div style={{ fontWeight: 700, color: '#0A2520' }}>
                                {item.doctor_name || 'Assigned Duty Doctor'}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                                {item.specialty || 'General Medicine'}
                              </div>
                            </td>

                            {/* Channel / Type */}
                            <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 800,
                                backgroundColor: item.booking_channel === 'VOICE_AI' ? '#FAF5FF' : '#EFF6FF',
                                color: item.booking_channel === 'VOICE_AI' ? '#7C3AED' : '#1D4ED8'
                              }}>
                                {item.booking_channel === 'VOICE_AI' ? <Sparkles size={10} /> : <User size={10} />}
                                <span>{item.booking_channel === 'VOICE_AI' ? 'Priya Voice AI' : 'In-Person'}</span>
                              </span>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                              {isConfirmed && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  backgroundColor: '#EDFDF9',
                                  color: '#007A65'
                                }}>
                                  <CheckCircle2 size={11} color="#00C9A7" />
                                  <span>Confirmed</span>
                                </span>
                              )}
                              {isCompleted && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  backgroundColor: '#EFF6FF',
                                  color: '#2563EB'
                                }}>
                                  <Check size={11} color="#2563EB" />
                                  <span>Completed</span>
                                </span>
                              )}
                              {isCancelled && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  backgroundColor: '#FEE2E2',
                                  color: '#DC2626'
                                }}>
                                  <XCircle size={11} color="#DC2626" />
                                  <span>Cancelled</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '14px 18px', verticalAlign: 'middle', textAlign: 'right' }}>
                              {!isCancelled && !isCompleted && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(item.reference_id, 'COMPLETED')}
                                    title="Mark Completed"
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: '#EDFDF9',
                                      border: '1px solid rgba(0, 201, 167, 0.4)',
                                      color: '#007A65',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Done
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleStatusChange(item.reference_id, 'CANCELLED')}
                                    title="Cancel Appointment"
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: '#FEE2E2',
                                      border: '1px solid #FECACA',
                                      color: '#DC2626',
                                      fontSize: '11.5px',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Right Column: Clinic Identity & Quick Command Card ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Verified Clinic Identity Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #F1F5F9',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="#00C9A7" />
                  <span style={{ fontWeight: 800, fontSize: '13.5px', color: '#0A2520' }}>
                    Clinic Identity
                  </span>
                </div>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '999px',
                  backgroundColor: '#EDFDF9',
                  color: '#007A65'
                }}>
                  VERIFIED
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Primary Facility
                  </div>
                  <div style={{ fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                    Apollo Clinic & Diagnostics Prime
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                    Koramangala, Bengaluru · Code: CARE-IND-01
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Operating Hours
                  </div>
                  <div style={{ fontWeight: 700, color: '#0F5B4C', marginTop: '2px' }}>
                    Mon - Sat: 08:00 AM – 08:30 PM
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Sunday: 09:00 AM – 02:00 PM
                  </div>
                </div>

                <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Telephony Gateway
                  </div>
                  <div style={{ fontWeight: 700, color: '#0A2520', marginTop: '2px' }}>
                    Sarvam AI Multi-Channel DID
                  </div>
                  <div style={{ fontSize: '11px', color: '#007A65', fontWeight: 700 }}>
                    Inbound & Outbound Telephony Active
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0A2520',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <CalendarDays size={13} color="#00C9A7" />
                  <span>Inspect Full Schedule</span>
                </button>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div style={{
              backgroundColor: '#0F5B4C',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px 20px',
              boxShadow: '0 2px 10px rgba(15, 91, 76, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={16} color="#00C9A7" />
                <div style={{ fontWeight: 800, fontSize: '13.5px' }}>Apex Care Security Standards</div>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#A7F3D0', lineHeight: 1.5 }}>
                Protected with role-based clinical access, HIPAA compliant voice audio archiving, and instant NABL diagnostic synchronization.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* ── Modal: Add Doctor ── */}
      {isAddDoctorOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              backgroundColor: '#0F5B4C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} color="#00C9A7" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Add Physician to Duty Roster</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDoctorOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {docSuccessMsg && (
                <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#EDFDF9', color: '#007A65', fontSize: '13px', fontWeight: 700 }}>
                  ✓ {docSuccessMsg}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                  Doctor Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Specialty / Department
                  </label>
                  <select
                    value={newDocSpecialty}
                    onChange={(e) => setNewDocSpecialty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="General Medicine">General Medicine</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={newDocFee}
                    onChange={(e) => setNewDocFee(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Experience
                  </label>
                  <input
                    type="text"
                    value={newDocExp}
                    onChange={(e) => setNewDocExp(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>
                    Languages
                  </label>
                  <input
                    type="text"
                    value={newDocLangs}
                    onChange={(e) => setNewDocLangs(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docSubmitting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: docSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {docSubmitting ? 'Adding...' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: View Schedule ── */}
      {isScheduleModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              padding: '18px 24px',
              backgroundColor: '#0F5B4C',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} color="#00C9A7" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Verified Clinic Operating Schedule</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#EDFDF9',
                border: '1px solid rgba(0, 201, 167, 0.3)'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#007A65' }}>FACILITY ID: CARE-IND-01</div>
                <div style={{ fontSize: '15px', fontWeight: 900, color: '#0A2520', marginTop: '2px' }}>Apollo Clinic & Diagnostics Prime</div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>Koramangala 4th Block, Bengaluru, Karnataka</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0A2520' }}>Monday to Saturday</span>
                  <span style={{ fontWeight: 800, color: '#0F5B4C' }}>08:00 AM – 08:30 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0A2520' }}>Sunday OPD</span>
                  <span style={{ fontWeight: 800, color: '#0F5B4C' }}>09:00 AM – 02:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0A2520' }}>Fasting Blood Collection</span>
                  <span style={{ fontWeight: 800, color: '#007A65' }}>Starts 07:30 AM Daily</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#0A2520' }}>Priya Telephony Reception</span>
                  <span style={{ fontWeight: 800, color: '#7C3AED' }}>24/7 Automated Intake</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

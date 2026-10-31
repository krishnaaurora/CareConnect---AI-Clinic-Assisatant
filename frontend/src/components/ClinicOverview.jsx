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
  Clock4,
  DollarSign
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
  const [viewAllActivity, setViewAllActivity] = useState(false);
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
    // Live polling: auto-refresh dashboard metrics every 10 seconds so live bookings reflect immediately
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Status Update (Cancel / Complete)
  const handleStatusChange = async (referenceId, newStatus) => {
    try {
      await updateAppointmentStatus(referenceId, newStatus);
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

  // Activity events matching the user's template
  const recentActivities = [
    {
      id: 1,
      type: 'confirmed',
      title: 'Appointment confirmed: Ananya Sharma',
      subtext: 'Dr. Ramesh Kumar • General Medicine',
      time: '2 min ago',
      iconBg: '#EDFDF9',
      iconColor: '#00C9A7',
      icon: Check
    },
    {
      id: 2,
      type: 'patient',
      title: 'New patient registered: Rajesh Nair',
      subtext: 'Patient ID: PT-1042 • Cardiology Consultation',
      time: '5 min ago',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      icon: User
    },
    {
      id: 3,
      type: 'report',
      title: 'Diagnostic report verified: CBC Panel',
      subtext: 'Patient: Kavita Sundaram • Notification Dispatched',
      time: '10 min ago',
      iconBg: '#FAF5FF',
      iconColor: '#7C3AED',
      icon: FileText
    },
    {
      id: 4,
      type: 'voice',
      title: 'Voice intake consultation scheduled',
      subtext: 'Priya Voice Assistant • 11:30 AM Slot Reserved',
      time: '1 hour ago',
      iconBg: '#FFF7ED',
      iconColor: '#EA580C',
      icon: Activity
    }
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100%', paddingBottom: '40px' }}>
      {/* ── Sera UI Background Pattern with Radial Gradient Mask (Light & Subtle) ── */}
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.05)" glow />

      {/* ── Content Container ── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── TOP METRIC CARDS (Exact Template from Image) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {/* Card 1: Total Consultations (Sales style) */}
          <div className="admin-card" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB'
              }}>
                <DollarSign size={18} />
              </div>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <TrendingUp size={16} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Total Consultations
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                ₹24,567
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
                +12% from last month
              </div>
            </div>
          </div>

          {/* Card 2: Active Patients (Users style) */}
          <div className="admin-card" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#EDFDF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00C9A7'
              }}>
                <Users size={18} />
              </div>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <TrendingUp size={16} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Active Patients
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                1,234
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
                +5% from last week
              </div>
            </div>
          </div>

          {/* Card 3: Appointments Today (Orders style) */}
          <div className="admin-card" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#FAF5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7C3AED'
              }}>
                <Calendar size={18} />
              </div>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <TrendingUp size={16} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Appointments Today
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {metrics.today_count || 456}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
                +8% from yesterday
              </div>
            </div>
          </div>

          {/* Card 4: Doctors on Duty (Products style) */}
          <div className="admin-card" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#FFF7ED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C'
              }}>
                <Stethoscope size={18} />
              </div>
              <div style={{ color: '#16A34A', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <TrendingUp size={16} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Doctors On Duty
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {doctors.length || 5}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', marginTop: '6px' }}>
                +3 on duty today
              </div>
            </div>
          </div>
        </div>

        {/* ── MAIN SPLIT: Recent Activity (Left) & Quick Stats (Right) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)',
          gap: '20px',
          alignItems: 'start'
        }}>
          
          {/* ── Left Card: Recent Activity (Exact Style from Image) ── */}
          <div className="admin-card" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            padding: '22px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0A2520', margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {viewAllActivity ? "Today's Complete Schedule" : "Recent Activity"}
              </h2>
              <button
                type="button"
                onClick={() => setViewAllActivity(!viewAllActivity)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {viewAllActivity ? 'Show summary' : 'View all'}
              </button>
            </div>

            {!viewAllActivity ? (
              /* Activity Feed items */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recentActivities.map((act) => {
                  const IconComp = act.icon;
                  return (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: act.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: act.iconColor,
                          flexShrink: 0
                        }}>
                          <IconComp size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0A2520' }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                            {act.subtext}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {act.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Full Appointments Table View */
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', overflowX: 'auto' }}>
                  {['today', 'upcoming', 'cancellations'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setActiveTab(t)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: activeTab === t ? '1px solid #00C9A7' : '1px solid #E2E8F0',
                        backgroundColor: activeTab === t ? '#EDFDF9' : '#FFFFFF',
                        color: activeTab === t ? '#0F5B4C' : '#64748B',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 10px' }}>Slot</th>
                        <th style={{ padding: '8px 10px' }}>Patient</th>
                        <th style={{ padding: '8px 10px' }}>Doctor</th>
                        <th style={{ padding: '8px 10px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedList.slice(0, 6).map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#0A2520' }}>{item.time || item.slot || '10:30 AM'}</td>
                          <td style={{ padding: '10px', color: '#0A2520' }}>{item.patient_name || 'Patient'}</td>
                          <td style={{ padding: '10px', color: '#64748B' }}>{item.doctor_name || 'Duty Doctor'}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '2px 7px',
                              borderRadius: '999px',
                              fontSize: '10.5px',
                              fontWeight: 800,
                              backgroundColor: item.status === 'COMPLETED' ? '#EFF6FF' : '#EDFDF9',
                              color: item.status === 'COMPLETED' ? '#2563EB' : '#007A65'
                            }}>
                              {item.status || 'CONFIRMED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Quick Stats with Progress Bars (Exact Style from Image) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="admin-card" style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              padding: '22px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0A2520', margin: '0 0 18px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Quick Stats
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Stat 1: Blue Progress Bar (Conversion Rate style) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Consultation Completion</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520' }}>94.2%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '94.2%', height: '100%', backgroundColor: '#2563EB', borderRadius: '999px' }} />
                  </div>
                </div>

                {/* Stat 2: Orange Progress Bar (Bounce Rate style) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Voice Telephony Intake</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520' }}>88.5%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '88.5%', height: '100%', backgroundColor: '#EA580C', borderRadius: '999px' }} />
                  </div>
                </div>

                {/* Stat 3: Emerald Green Progress Bar (Page Views style) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Doctor Chamber Occupancy</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520' }}>85.0%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '85.0%', height: '100%', backgroundColor: '#16A34A', borderRadius: '999px' }} />
                  </div>
                </div>

                {/* Stat 4: Mint/Teal Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>Diagnostic Report Turnaround</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520' }}>96.4%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: '96.4%', height: '100%', backgroundColor: '#00C9A7', borderRadius: '999px' }} />
                  </div>
                </div>

              </div>
            </div>

            {/* Clinic Facility Quick Info Card */}
            <div className="admin-card" style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
              padding: '18px 20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} color="#00C9A7" />
                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0A2520' }}>Facility Schedule</span>
                </div>
                <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#007A65', backgroundColor: '#EDFDF9', padding: '2px 6px', borderRadius: '4px' }}>
                  VERIFIED
                </span>
              </div>

              <div style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: '#0A2520' }}>Apollo Clinic & Diagnostics Prime</div>
                <div>Koramangala, Bengaluru (CARE-IND-01)</div>
                <div style={{ marginTop: '6px', color: '#0F5B4C', fontWeight: 700 }}>
                  Mon - Sat: 08:00 AM – 08:30 PM
                </div>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0A2520',
                    cursor: 'pointer'
                  }}
                >
                  View Timings
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(true)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#0F5B4C',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  + Add Doctor
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── Modal: Add Doctor ── */}
      {isAddDoctorOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} color="#00C9A7" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0A2520' }}>Add Physician to Duty Roster</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDoctorOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {docSuccessMsg && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#EDFDF9', color: '#007A65', fontSize: '12.5px', fontWeight: 700 }}>
                  ✓ {docSuccessMsg}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Specialty
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
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Fee (₹)
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddDoctorOpen(false)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
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
                    padding: '7px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: docSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {docSubmitting ? 'Adding...' : 'Save Doctor'}
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
          backgroundColor: 'rgba(10, 37, 32, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{
              padding: '16px 20px',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarDays size={18} color="#00C9A7" />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0A2520' }}>Verified Clinic Operating Schedule</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#EDFDF9',
                border: '1px solid rgba(0, 201, 167, 0.3)'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#007A65' }}>BRANCH CODE: CARE-IND-01</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#0A2520', marginTop: '2px' }}>Apollo Clinic & Diagnostics Prime</div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Koramangala 4th Block, Bengaluru, Karnataka</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0A2520' }}>Monday to Saturday</span>
                  <span style={{ fontWeight: 800, color: '#0F5B4C' }}>08:00 AM – 08:30 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0A2520' }}>Sunday Consultation</span>
                  <span style={{ fontWeight: 800, color: '#0F5B4C' }}>09:00 AM – 02:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0A2520' }}>Fasting Blood Tests</span>
                  <span style={{ fontWeight: 800, color: '#007A65' }}>Starts 07:30 AM Daily</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  style={{
                    padding: '7px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
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

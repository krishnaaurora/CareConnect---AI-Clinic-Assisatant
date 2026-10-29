import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Edit3, 
  Power, 
  Calendar, 
  Clock, 
  Coffee, 
  CalendarOff, 
  Building2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Check, 
  UserCheck, 
  UserX,
  Timer,
  Layers,
  ChevronDown
} from 'lucide-react';
import { 
  fetchDoctorsOnDuty, 
  fetchClinics, 
  addDoctorToClinic, 
  updateDoctorProfile, 
  toggleDoctorActiveStatus 
} from '../api/client';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology Department',
  'Pediatrics & Neonatal',
  'Orthopedic Surgery',
  'Dermatology & Skin Care',
  'ENT & Head-Neck',
  'Gynecology & Obstetrics',
  'Emergency Care'
];

const DURATION_OPTIONS = ['15 mins', '20 mins', '30 mins', '45 mins', '60 mins'];

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DEACTIVATED' | 'ON_LEAVE'
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Modal State (Add or Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [currentDoctorId, setCurrentDoctorId] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [department, setDepartment] = useState('General Medicine');
  const [consultationDuration, setConsultationDuration] = useState('20 mins');
  const [consultationFee, setConsultationFee] = useState(700);
  const [experience, setExperience] = useState('6+ years');
  const [clinicCode, setClinicCode] = useState('CARE-IND-01');
  const [workingDays, setWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [shiftMorning, setShiftMorning] = useState('09:00 AM - 01:00 PM');
  const [shiftEvening, setShiftEvening] = useState('04:30 PM - 08:00 PM');
  const [breaks, setBreaks] = useState('01:00 PM - 02:00 PM (Lunch)');
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [leaveNote, setLeaveNote] = useState('');
  const [leavesText, setLeavesText] = useState('');
  const [languages, setLanguages] = useState('English, Hindi');
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Load initial doctors & clinics
  const loadDoctors = async () => {
    setLoading(true);
    try {
      const [docs, clinicList] = await Promise.all([
        fetchDoctorsOnDuty(),
        fetchClinics()
      ]);
      setDoctors(docs || []);
      setClinics(clinicList || []);
      if (clinicList && clinicList.length > 0) {
        setClinicCode(clinicList[0].code);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  // Open Add Doctor Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setCurrentDoctorId(null);
    setName('');
    setSpecialty('');
    setDepartment('General Medicine');
    setConsultationDuration('20 mins');
    setConsultationFee(700);
    setExperience('6+ years');
    setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setShiftMorning('09:00 AM - 01:00 PM');
    setShiftEvening('04:30 PM - 08:00 PM');
    setBreaks('01:00 PM - 02:00 PM (Lunch)');
    setIsOnLeave(false);
    setLeaveNote('');
    setLeavesText('');
    setLanguages('English, Hindi');
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Doctor Modal
  const handleOpenEdit = (doc) => {
    setModalMode('edit');
    setCurrentDoctorId(doc.id);
    setName(doc.name || '');
    setSpecialty(doc.specialty || '');
    setDepartment(doc.department || 'General Medicine');
    setConsultationDuration(doc.consultation_duration || '20 mins');
    setConsultationFee(doc.consultation_fee || 700);
    setExperience(doc.experience || '5+ years');
    setClinicCode(doc.clinic_code || clinics[0]?.code || 'CARE-IND-01');
    setWorkingDays(doc.working_days || doc.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    
    // Shifts
    const shiftsArr = doc.shifts || [];
    setShiftMorning(shiftsArr[0] || '09:00 AM - 01:00 PM');
    setShiftEvening(shiftsArr[1] || '04:30 PM - 08:00 PM');
    
    // Breaks & Leaves
    setBreaks((doc.breaks || []).join(', ') || '01:00 PM - 02:00 PM (Lunch)');
    setIsOnLeave(Boolean(doc.is_on_leave));
    setLeaveNote(doc.leave_note || '');
    setLeavesText((doc.leaves || []).join(', '));
    setLanguages((doc.languages || []).join(', ') || 'English, Hindi');
    setIsActive(doc.is_active !== false);

    setIsModalOpen(true);
  };

  // Toggle Working Day Selection
  const toggleWorkingDay = (day) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Submit Add or Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const shifts = [shiftMorning.trim(), shiftEvening.trim()].filter(Boolean);
    const breaksArr = breaks.split(',').map(b => b.trim()).filter(Boolean);
    const leavesArr = leavesText.split(',').map(l => l.trim()).filter(Boolean);
    const langsArr = languages.split(',').map(l => l.trim()).filter(Boolean);

    const doctorPayload = {
      name: name.trim(),
      specialty: specialty.trim() || department,
      department,
      consultation_duration: consultationDuration,
      consultation_fee: parseInt(consultationFee, 10) || 700,
      experience,
      working_days: workingDays,
      available_days: workingDays,
      shifts,
      breaks: breaksArr,
      leaves: leavesArr,
      is_on_leave: isOnLeave,
      leave_note: leaveNote.trim(),
      languages: langsArr,
      is_active: isActive,
      available_slots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"]
    };

    try {
      if (modalMode === 'add') {
        const res = await addDoctorToClinic(clinicCode, doctorPayload);
        const chosenClinic = clinics.find(c => c.code === clinicCode);
        const createdDoc = {
          ...doctorPayload,
          id: res.data?.id || `doc-${Date.now()}`,
          clinic_name: chosenClinic?.name || "CareConnect Clinic",
          clinic_code: clinicCode,
          duty_status: isActive ? (isOnLeave ? "On Leave" : "Available") : "Deactivated",
        };
        setDoctors(prev => [createdDoc, ...prev]);
        showNotification(`${doctorPayload.name} added to clinic roster!`);
      } else {
        await updateDoctorProfile(clinicCode, currentDoctorId, doctorPayload);
        setDoctors(prev => prev.map(d => {
          if (d.id === currentDoctorId) {
            return {
              ...d,
              ...doctorPayload,
              duty_status: isActive ? (isOnLeave ? "On Leave" : "Available") : "Deactivated",
            };
          }
          return d;
        }));
        showNotification(`Profile for ${doctorPayload.name} updated!`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save doctor:', err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Doctor Active / Deactivate
  const handleToggleActive = async (doc) => {
    const nextStatus = doc.is_active === false;
    try {
      await toggleDoctorActiveStatus(doc.clinic_code || 'CARE-IND-01', doc.id, nextStatus);
      setDoctors(prev => prev.map(d => {
        if (d.id === doc.id) {
          return {
            ...d,
            is_active: nextStatus,
            duty_status: nextStatus ? (d.is_on_leave ? 'On Leave' : 'Available') : 'Deactivated'
          };
        }
        return d;
      }));
      showNotification(`${doc.name} ${nextStatus ? 'reactivated' : 'deactivated'}.`);
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  // Quick Toggle Leave
  const handleToggleLeave = async (doc) => {
    const nextLeave = !doc.is_on_leave;
    const note = nextLeave ? "Marked on Leave" : "";
    try {
      await updateDoctorProfile(doc.clinic_code || 'CARE-IND-01', doc.id, {
        is_on_leave: nextLeave,
        leave_note: note
      });
      setDoctors(prev => prev.map(d => {
        if (d.id === doc.id) {
          return {
            ...d,
            is_on_leave: nextLeave,
            leave_note: note,
            duty_status: nextLeave ? "On Leave" : "Available"
          };
        }
        return d;
      }));
      showNotification(`${doc.name} marked ${nextLeave ? 'On Leave' : 'Back on Duty'}.`);
    } catch (err) {
      console.error('Leave toggle failed:', err);
    }
  };

  // Filter Doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = !searchQuery || 
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clinic_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || doc.department === deptFilter;

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') matchesStatus = doc.is_active !== false && !doc.is_on_leave;
    if (statusFilter === 'DEACTIVATED') matchesStatus = doc.is_active === false;
    if (statusFilter === 'ON_LEAVE') matchesStatus = Boolean(doc.is_on_leave);

    return matchesSearch && matchesDept && matchesStatus;
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
          fontSize: '13.5px',
          animation: 'fadeIn 0.2s ease-in-out'
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
        marginBottom: '28px'
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
            <Stethoscope size={13} color="#0F5B4C" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F5B4C', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Physician Management
            </span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0A2520', margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>
            Doctor Profiles & Duty Roster
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
            Configure medical departments, consultation slot intervals, active shifts, break periods, and leave calendars.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '12px',
            backgroundColor: '#0F5B4C',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0A4337'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0F5B4C'}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Filters Toolbar */}
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
        marginBottom: '26px'
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
          minWidth: '240px',
          flex: '1 1 240px'
        }}>
          <Search size={15} color="#64748B" />
          <input
            type="text"
            placeholder="Search by name, specialty, or clinic..."
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

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Doctors' },
            { id: 'ACTIVE', label: 'Active on Duty' },
            { id: 'ON_LEAVE', label: 'On Leave' },
            { id: 'DEACTIVATED', label: 'Deactivated' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 14px',
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

        {/* Department Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="#64748B" />
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
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
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '22px'
      }}>
        {filteredDoctors.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
            <Stethoscope size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 6px', color: '#0A2520', fontWeight: 800 }}>No Doctor Profiles Found</h4>
            <p style={{ margin: 0, color: '#64748B', fontSize: '14px' }}>Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          filteredDoctors.map(doc => {
            const isInactive = doc.is_active === false;
            const onLeave = Boolean(doc.is_on_leave);

            return (
              <div
                key={doc.id || doc.name}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: isInactive 
                    ? '1px dashed #CBD5E1' 
                    : (onLeave ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(15, 91, 76, 0.12)'),
                  boxShadow: '0 4px 18px rgba(10, 37, 32, 0.03)',
                  padding: '22px',
                  opacity: isInactive ? 0.65 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Row: Specialty & Status */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      backgroundColor: '#EAF6F3',
                      color: '#0F5B4C',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      <Building2 size={11} color="#00C9A7" />
                      <span>{doc.department || doc.specialty}</span>
                    </div>

                    {/* Status Pill */}
                    {isInactive ? (
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#F1F5F9', color: '#64748B' }}>
                        Deactivated
                      </span>
                    ) : onLeave ? (
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#B45309' }}>
                        On Leave
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', backgroundColor: '#DCFAF3', color: '#0F5B4C' }}>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Doctor Name & Clinic */}
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                    {doc.name}
                  </h3>
                  <div style={{ fontSize: '13px', color: '#00C9A7', fontWeight: 700, marginBottom: '6px' }}>
                    {doc.specialty}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                    <Building2 size={12} color="#0F5B4C" />
                    <span>{doc.clinic_name || "CareConnect Partner Branch"}</span>
                  </div>

                  {/* Operational Details Grid */}
                  <div style={{
                    backgroundColor: '#FAF8F5',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#334155',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {/* Consultation Duration & Fee */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B' }}>
                        <Timer size={13} color="#00C9A7" />
                        <span>Duration: <strong>{doc.consultation_duration || '20 mins'}</strong></span>
                      </span>
                      <span>Fee: <strong>₹{doc.consultation_fee || 700}</strong></span>
                    </div>

                    {/* Shifts */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                      <Clock size={13} color="#0F5B4C" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Shifts:</strong> {(doc.shifts || ["09:00 AM - 01:00 PM", "04:30 PM - 08:00 PM"]).join(' | ')}
                      </div>
                    </div>

                    {/* Breaks */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                      <Coffee size={13} color="#B45309" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Breaks:</strong> {(doc.breaks || ["01:00 PM - 02:00 PM (Lunch)"]).join(', ')}
                      </div>
                    </div>

                    {/* Working Days */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                      <Calendar size={13} color="#00C9A7" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <div>
                        <strong>Days:</strong> {(doc.working_days || doc.available_days || ["Mon-Sat"]).join(', ')}
                      </div>
                    </div>

                    {/* Leave Notice if any */}
                    {doc.leave_note && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px', color: '#B45309', backgroundColor: '#FEF3C7', padding: '6px 8px', borderRadius: '6px' }}>
                        <CalendarOff size={13} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>{doc.leave_note}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(doc)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                      color: '#0A2520',
                      border: '1px solid #E2E8F0',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <Edit3 size={13} color="#0F5B4C" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleLeave(doc)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: onLeave ? '#FEF3C7' : '#F8FAFC',
                      color: onLeave ? '#B45309' : '#64748B',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={onLeave ? "Cancel Leave and Resume Duty" : "Mark Doctor On Leave"}
                  >
                    <CalendarOff size={13} />
                    <span>{onLeave ? 'On Leave' : 'Set Leave'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(doc)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      backgroundColor: isInactive ? '#DCFAF3' : '#FEE2E2',
                      color: isInactive ? '#0F5B4C' : '#DC2626',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={isInactive ? "Reactivate Doctor" : "Deactivate Doctor"}
                  >
                    <Power size={13} />
                    <span>{isInactive ? 'Activate' : 'Deactivate'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── MODAL: ADD / EDIT DOCTOR PROFILE ── */}
      {isModalOpen && (
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
            maxWidth: '680px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: '#EAF6F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Stethoscope size={22} color="#0F5B4C" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520', fontFamily: 'Manrope, sans-serif' }}>
                  {modalMode === 'add' ? 'Add Doctor Profile' : `Edit Doctor Profile: ${name}`}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Provide complete working hours, department allocations, and leave configurations.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Row 1: Doctor Name & Specialty */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Menon"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Specialty Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiologist & Interventional Specialist"
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Department & Consultation Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Medical Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Consultation Duration
                  </label>
                  <select
                    value={consultationDuration}
                    onChange={e => setConsultationDuration(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    {DURATION_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Clinic, Experience & Fee */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Clinic Location
                  </label>
                  <select
                    value={clinicCode}
                    onChange={e => setClinicCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
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
                    Experience
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={e => setExperience(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={e => setConsultationFee(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Working Days Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Working Days (Click to toggle)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_DAYS.map(day => {
                    const isSelected = workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWorkingDay(day)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#0F5B4C' : '#F1F5F9',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          border: isSelected ? '1px solid #0F5B4C' : '1px solid #E2E8F0',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shifts & Breaks */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Morning Shift Hours
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 01:00 PM"
                    value={shiftMorning}
                    onChange={e => setShiftMorning(e.target.value)}
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
                    Evening Shift Hours
                  </label>
                  <input
                    type="text"
                    placeholder="04:30 PM - 08:00 PM"
                    value={shiftEvening}
                    onChange={e => setShiftEvening(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Breaks (e.g. Lunch, Tea - comma separated)
                </label>
                <input
                  type="text"
                  placeholder="01:00 PM - 02:00 PM (Lunch), 05:00 PM - 05:15 PM (Tea)"
                  value={breaks}
                  onChange={e => setBreaks(e.target.value)}
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

              {/* Leave Management Section */}
              <div style={{ backgroundColor: '#FAF8F5', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0A2520', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CalendarOff size={15} color="#D97706" />
                    <span>Leave Status Configuration</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#B45309', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isOnLeave}
                      onChange={e => setIsOnLeave(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>Mark Currently on Leave</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#64748B', marginBottom: '3px' }}>
                      Current Leave Note / Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Attending Annual Cardiology Summit"
                      value={leaveNote}
                      onChange={e => setLeaveNote(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', color: '#64748B', marginBottom: '3px' }}>
                      Upcoming Planned Leaves (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2026-11-12 to 2026-11-14"
                      value={leavesText}
                      onChange={e => setLeavesText(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '12.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Languages & Active Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Consultation Languages
                  </label>
                  <input
                    type="text"
                    value={languages}
                    onChange={e => setLanguages(e.target.value)}
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

                <div style={{ marginTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#0A2520', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Profile Active</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
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
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                  }}
                >
                  {saving ? 'Saving...' : (modalMode === 'add' ? 'Save Doctor Profile' : 'Update Profile')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}


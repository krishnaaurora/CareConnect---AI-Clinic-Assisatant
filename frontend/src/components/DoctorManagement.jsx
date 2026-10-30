import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Award,
  FileText,
  Eye,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  User,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Bot
} from 'lucide-react';
import { 
  fetchAllDoctors, 
  fetchClinics, 
  addDoctorToClinic, 
  updateDoctorProfile, 
  toggleDoctorActiveStatus,
  fetchDepartments,
  addDoctorLeave,
  cancelDoctorLeave,
  fetchDoctorAppointments,
  fetchAllAppointments
} from '../api/client';
import BackgroundPattern from './common/BackgroundPattern';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STANDARD_DEPARTMENTS = [
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
  // Navigation Tabs within Doctors Section
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'departments' | 'schedule' | 'appointments'

  // Master State
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ text: '', type: 'success' });

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [specFilter, setSpecFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE_NOW' | 'ON_LEAVE'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DEACTIVATED'

  // Modal 1: Add / Edit Doctor
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [savingDoctor, setSavingDoctor] = useState(false);

  // Doctor Form Fields
  const [formName, setFormName] = useState('');
  const [formQualification, setFormQualification] = useState('MBBS, MD');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formDepartment, setFormDepartment] = useState('General Medicine');
  const [formRegNumber, setFormRegNumber] = useState('');
  const [formExperience, setFormExperience] = useState('5+ years');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formFee, setFormFee] = useState(700);
  const [formBio, setFormBio] = useState('');
  const [formProfilePhoto, setFormProfilePhoto] = useState('');
  const [formWorkingDays, setFormWorkingDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [formShiftMorning, setFormShiftMorning] = useState('09:00 AM - 01:00 PM');
  const [formShiftEvening, setFormShiftEvening] = useState('04:30 PM - 08:00 PM');
  const [formBreaks, setFormBreaks] = useState('01:00 PM - 02:00 PM (Lunch)');
  const [formSlotDuration, setFormSlotDuration] = useState('20 mins');
  const [formLanguages, setFormLanguages] = useState('English, Hindi');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formClinicCode, setFormClinicCode] = useState('CARE-IND-01');

  // Modal 2: Doctor Profile View (Drawer / Modal)
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState(null);
  const [profileAppointments, setProfileAppointments] = useState([]);
  const [loadingProfileAppts, setLoadingProfileAppts] = useState(false);
  const [profileApptFilter, setProfileApptFilter] = useState('ALL'); // 'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'

  // Modal 3: Working Schedule & Availability / Leave Manager
  const [scheduleModalDoctor, setScheduleModalDoctor] = useState(null);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Modal 4: Confirmation Dialog (Deactivation / Cancel Leave)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    confirmColor: '#DC2626',
    onConfirm: () => {}
  });

  // Doctor-wise Appointment View State
  const [apptSelectedDoctorName, setApptSelectedDoctorName] = useState('');
  const [doctorApptsList, setDoctorApptsList] = useState([]);
  const [loadingDoctorAppts, setLoadingDoctorAppts] = useState(false);
  const [apptViewMode, setApptViewMode] = useState('all'); // 'all' | 'today' | 'upcoming'

  // Weekly Consultation Timetable Matrix (Mac Style: Day | Week | Month)
  const [timetableMode, setTimetableMode] = useState('week'); // 'day' | 'week' | 'month'
  const [timetableDate, setTimetableDate] = useState(() => new Date(2026, 9, 31));
  const [timetableDoctorFilter, setTimetableDoctorFilter] = useState('ALL');
  const [timetableDeptFilter, setTimetableDeptFilter] = useState('ALL');
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  // Initial Load
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [docs, clinicList, depts, appts] = await Promise.all([
        fetchAllDoctors().catch(() => []),
        fetchClinics().catch(() => []),
        fetchDepartments().catch(() => []),
        fetchAllAppointments().catch(() => [])
      ]);
      setDoctors(docs || []);
      setClinics(clinicList || []);
      setDepartmentsData(depts || []);
      setAllAppointments(appts || []);
      if (clinicList && clinicList.length > 0) {
        setFormClinicCode(clinicList[0].code);
      }
      if (docs && docs.length > 0 && !apptSelectedDoctorName) {
        setApptSelectedDoctorName(docs[0].name);
      }
    } catch (err) {
      console.error('Failed to load initial doctors data:', err);
      showNotification('Failed to load physician records from backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const showNotification = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: '', type: 'success' }), 4000);
  };

  // KPI Metrics calculation
  const metrics = useMemo(() => {
    const total = doctors.length;
    const active = doctors.filter(d => d.is_active !== false).length;
    const onLeave = doctors.filter(d => Boolean(d.is_on_leave)).length;
    const available = doctors.filter(d => d.is_active !== false && !d.is_on_leave).length;
    return { total, active, onLeave, available };
  }, [doctors]);

  // Unique Specializations for Filter
  const uniqueSpecialties = useMemo(() => {
    const set = new Set();
    doctors.forEach(d => {
      if (d.specialty) set.add(d.specialty);
    });
    return Array.from(set);
  }, [doctors]);

  // Unique Departments
  const uniqueDepartments = useMemo(() => {
    const set = new Set(STANDARD_DEPARTMENTS);
    doctors.forEach(d => {
      if (d.department) set.add(d.department);
    });
    return Array.from(set);
  }, [doctors]);

  // Filtered Doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        doc.name?.toLowerCase().includes(q) ||
        doc.specialty?.toLowerCase().includes(q) ||
        doc.department?.toLowerCase().includes(q) ||
        doc.qualification?.toLowerCase().includes(q) ||
        doc.registration_number?.toLowerCase().includes(q) ||
        doc.clinic_name?.toLowerCase().includes(q);

      const matchesDept = deptFilter === 'ALL' || doc.department === deptFilter;
      const matchesSpec = specFilter === 'ALL' || doc.specialty === specFilter;

      let matchesAvailability = true;
      if (availabilityFilter === 'AVAILABLE_NOW') {
        matchesAvailability = doc.is_active !== false && !doc.is_on_leave;
      } else if (availabilityFilter === 'ON_LEAVE') {
        matchesAvailability = Boolean(doc.is_on_leave);
      }

      let matchesStatus = true;
      if (statusFilter === 'ACTIVE') {
        matchesStatus = doc.is_active !== false;
      } else if (statusFilter === 'DEACTIVATED') {
        matchesStatus = doc.is_active === false;
      }

      return matchesSearch && matchesDept && matchesSpec && matchesAvailability && matchesStatus;
    });
  }, [doctors, searchQuery, deptFilter, specFilter, availabilityFilter, statusFilter]);

  // ── Open Add Doctor Modal ──
  const handleOpenAddDoctor = () => {
    setFormMode('add');
    setEditingDoctorId(null);
    setFormName('');
    setFormQualification('MBBS, MD');
    setFormSpecialty('');
    setFormDepartment('General Medicine');
    setFormRegNumber('');
    setFormExperience('5+ years');
    setFormPhone('');
    setFormEmail('');
    setFormFee(700);
    setFormBio('');
    setFormProfilePhoto('');
    setFormWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    setFormShiftMorning('09:00 AM - 01:00 PM');
    setFormShiftEvening('04:30 PM - 08:00 PM');
    setFormBreaks('01:00 PM - 02:00 PM (Lunch)');
    setFormSlotDuration('20 mins');
    setFormLanguages('English, Hindi');
    setFormIsActive(true);
    setFormClinicCode(clinics[0]?.code || 'CARE-IND-01');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // ── Open Edit Doctor Modal ──
  const handleOpenEditDoctor = (doc) => {
    setFormMode('edit');
    setEditingDoctorId(doc.id);
    setFormName(doc.name || '');
    setFormQualification(doc.qualification || 'MBBS, MD');
    setFormSpecialty(doc.specialty || '');
    setFormDepartment(doc.department || 'General Medicine');
    setFormRegNumber(doc.registration_number || '');
    setFormExperience(doc.experience || '5+ years');
    setFormPhone(doc.phone || '');
    setFormEmail(doc.email || '');
    setFormFee(doc.consultation_fee || 700);
    setFormBio(doc.bio || '');
    setFormProfilePhoto(doc.profile_photo || '');
    setFormWorkingDays(doc.working_days || doc.available_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    
    const shiftsArr = doc.shifts || [];
    setFormShiftMorning(shiftsArr[0] || '09:00 AM - 01:00 PM');
    setFormShiftEvening(shiftsArr[1] || '04:30 PM - 08:00 PM');
    setFormBreaks((doc.breaks || []).join(', ') || '01:00 PM - 02:00 PM (Lunch)');
    setFormSlotDuration(doc.consultation_duration || '20 mins');
    setFormLanguages((doc.languages || []).join(', ') || 'English, Hindi');
    setFormIsActive(doc.is_active !== false);
    setFormClinicCode(doc.clinic_code || clinics[0]?.code || 'CARE-IND-01');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Toggle Working Day Selection
  const toggleWorkingDay = (day) => {
    setFormWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Validate Doctor Form
  const validateDoctorForm = () => {
    const errors = {};
    if (!formName.trim()) errors.name = 'Doctor name is required';
    if (!formSpecialty.trim()) errors.specialty = 'Specialization is required';
    if (!formDepartment.trim()) errors.department = 'Department is required';
    if (formWorkingDays.length === 0) errors.workingDays = 'Select at least one consultation day';
    
    if (formPhone.trim()) {
      const cleanDigits = formPhone.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        errors.phone = 'Valid 10-digit mobile number required (+91 XXXXXXXXXX)';
      }
    }
    if (formEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formEmail.trim())) {
        errors.email = 'Invalid email address format';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Add / Edit Doctor
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!validateDoctorForm()) return;

    setSavingDoctor(true);
    const shifts = [formShiftMorning.trim(), formShiftEvening.trim()].filter(Boolean);
    const breaksArr = formBreaks.split(',').map(b => b.trim()).filter(Boolean);
    const langsArr = formLanguages.split(',').map(l => l.trim()).filter(Boolean);

    const payload = {
      name: formName.trim(),
      qualification: formQualification.trim(),
      specialty: formSpecialty.trim(),
      department: formDepartment.trim(),
      registration_number: formRegNumber.trim() || undefined,
      experience: formExperience.trim(),
      phone: formPhone.trim() || undefined,
      email: formEmail.trim() || undefined,
      consultation_fee: parseInt(formFee, 10) || 700,
      bio: formBio.trim() || undefined,
      profile_photo: formProfilePhoto.trim() || undefined,
      working_days: formWorkingDays,
      available_days: formWorkingDays,
      shifts,
      breaks: breaksArr,
      consultation_duration: formSlotDuration,
      languages: langsArr,
      is_active: formIsActive,
      available_slots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"]
    };

    try {
      if (formMode === 'add') {
        const res = await addDoctorToClinic(formClinicCode, payload);
        const chosenClinic = clinics.find(c => c.code === formClinicCode);
        const createdDoctor = {
          ...payload,
          id: res.data?.id || `doc-${Date.now()}`,
          clinic_name: chosenClinic?.name || "Apex Care Clinic",
          clinic_code: formClinicCode,
          is_on_leave: false,
          leave_records: [],
          duty_status: formIsActive ? "Available" : "Deactivated"
        };
        setDoctors(prev => [createdDoctor, ...prev]);
        showNotification(`Physician ${payload.name} added to roster successfully!`);
      } else {
        await updateDoctorProfile(formClinicCode, editingDoctorId, payload);
        setDoctors(prev => prev.map(d => {
          if (d.id === editingDoctorId) {
            return {
              ...d,
              ...payload,
              duty_status: formIsActive ? (d.is_on_leave ? 'On Leave' : 'Available') : 'Deactivated'
            };
          }
          return d;
        }));
        showNotification(`Profile for ${payload.name} updated successfully!`);
        if (selectedDoctorProfile && selectedDoctorProfile.id === editingDoctorId) {
          setSelectedDoctorProfile(prev => ({ ...prev, ...payload }));
        }
      }
      setIsFormModalOpen(false);
      // Refresh departments
      fetchDepartments().then(depts => setDepartmentsData(depts || [])).catch(() => {});
    } catch (err) {
      console.error('Failed to save doctor:', err);
      showNotification(err.message || 'Failed to save doctor record', 'error');
    } finally {
      setSavingDoctor(false);
    }
  };

  // Toggle Doctor Active / Deactivate (with Confirmation)
  const promptToggleDoctorActive = (doc) => {
    const willDeactivate = doc.is_active !== false;
    setConfirmDialog({
      isOpen: true,
      title: willDeactivate ? `Deactivate ${doc.name}?` : `Reactivate ${doc.name}?`,
      message: willDeactivate 
        ? `Deactivating ${doc.name} will remove them from Priya Voice AI bookings and hide their schedule from patient availability. Existing appointment records will be preserved.`
        : `Reactivating ${doc.name} will restore their availability across the web portal and Priya Voice scheduling.`,
      confirmText: willDeactivate ? 'Yes, Deactivate' : 'Yes, Reactivate',
      confirmColor: willDeactivate ? '#DC2626' : '#0F5B4C',
      onConfirm: async () => {
        try {
          const nextStatus = !willDeactivate;
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
          showNotification(`${doc.name} has been ${nextStatus ? 'reactivated' : 'deactivated'}.`);
          if (selectedDoctorProfile && selectedDoctorProfile.id === doc.id) {
            setSelectedDoctorProfile(prev => ({ ...prev, is_active: nextStatus }));
          }
        } catch (err) {
          console.error('Failed to change status:', err);
          showNotification('Failed to toggle status: ' + err.message, 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // ── Open Doctor Profile View ──
  const handleOpenDoctorProfile = async (doc) => {
    setSelectedDoctorProfile(doc);
    setLoadingProfileAppts(true);
    try {
      const appts = await fetchDoctorAppointments(doc.name);
      setProfileAppointments(appts || []);
    } catch (err) {
      console.error('Failed to fetch doctor appointments:', err);
      setProfileAppointments([]);
    } finally {
      setLoadingProfileAppts(false);
    }
  };

  // ── Open Schedule & Leave Modal ──
  const handleOpenScheduleModal = (doc) => {
    setScheduleModalDoctor(doc);
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
  };

  // Submit Planned Leave
  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate) {
      showNotification('Please select both start and end leave dates', 'error');
      return;
    }
    if (leaveStartDate > leaveEndDate) {
      showNotification('Leave start date cannot be after end date', 'error');
      return;
    }

    setSubmittingLeave(true);
    const doc = scheduleModalDoctor;
    const clinicCode = doc.clinic_code || 'CARE-IND-01';
    const payload = {
      start_date: leaveStartDate,
      end_date: leaveEndDate,
      reason: leaveReason.trim() || 'Approved Medical Leave'
    };

    try {
      const res = await addDoctorLeave(clinicCode, doc.id, payload);
      const newLeaveRecord = res.data;
      const todayStr = new Date().toISOString().split('T')[0];
      const isCurrentlyToday = leaveStartDate <= todayStr && todayStr <= leaveEndDate;

      // Update doctor in local state
      setDoctors(prev => prev.map(d => {
        if (d.id === doc.id) {
          const updatedRecords = [...(d.leave_records || []), newLeaveRecord];
          return {
            ...d,
            leave_records: updatedRecords,
            is_on_leave: isCurrentlyToday ? true : d.is_on_leave,
            leave_note: isCurrentlyToday ? payload.reason : d.leave_note
          };
        }
        return d;
      }));

      // Update schedule modal doctor view
      setScheduleModalDoctor(prev => ({
        ...prev,
        leave_records: [...(prev.leave_records || []), newLeaveRecord],
        is_on_leave: isCurrentlyToday ? true : prev.is_on_leave,
        leave_note: isCurrentlyToday ? payload.reason : prev.leave_note
      }));

      showNotification(`Leave recorded for ${doc.name} from ${leaveStartDate} to ${leaveEndDate}.`);
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
    } catch (err) {
      console.error('Failed to record leave:', err);
      showNotification(err.message || 'Failed to submit leave', 'error');
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Cancel Planned Leave
  const handleCancelLeave = (leaveId) => {
    const doc = scheduleModalDoctor;
    if (!doc) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Leave Entry?',
      message: `Cancel this leave entry for ${doc.name} and restore physician availability?`,
      confirmText: 'Yes, Cancel Leave',
      confirmColor: '#0F5B4C',
      onConfirm: async () => {
        try {
          const clinicCode = doc.clinic_code || 'CARE-IND-01';
          await cancelDoctorLeave(clinicCode, doc.id, leaveId);

          setDoctors(prev => prev.map(d => {
            if (d.id === doc.id) {
              const filteredLeaves = (d.leave_records || []).filter(l => l.id !== leaveId);
              return {
                ...d,
                leave_records: filteredLeaves,
                is_on_leave: filteredLeaves.length === 0 ? false : d.is_on_leave,
                leave_note: filteredLeaves.length === 0 ? '' : d.leave_note
              };
            }
            return d;
          }));

          setScheduleModalDoctor(prev => {
            const filteredLeaves = (prev.leave_records || []).filter(l => l.id !== leaveId);
            return {
              ...prev,
              leave_records: filteredLeaves,
              is_on_leave: filteredLeaves.length === 0 ? false : prev.is_on_leave,
              leave_note: filteredLeaves.length === 0 ? '' : prev.leave_note
            };
          });

          showNotification('Leave cancelled. Physician duty restored.');
        } catch (err) {
          console.error('Failed to cancel leave:', err);
          showNotification('Failed to cancel leave: ' + err.message, 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  // Instant Toggle Available / Unavailable
  const handleToggleDoctorAvailableInstant = async (doc) => {
    const nextOnLeave = !doc.is_on_leave;
    const note = nextOnLeave ? 'Marked Unavailable by Admin' : '';
    try {
      await updateDoctorProfile(doc.clinic_code || 'CARE-IND-01', doc.id, {
        is_on_leave: nextOnLeave,
        leave_note: note
      });
      setDoctors(prev => prev.map(d => {
        if (d.id === doc.id) {
          return {
            ...d,
            is_on_leave: nextOnLeave,
            leave_note: note,
            duty_status: nextOnLeave ? 'On Leave' : 'Available'
          };
        }
        return d;
      }));
      if (scheduleModalDoctor && scheduleModalDoctor.id === doc.id) {
        setScheduleModalDoctor(prev => ({
          ...prev,
          is_on_leave: nextOnLeave,
          leave_note: note
        }));
      }
      showNotification(`${doc.name} marked ${nextOnLeave ? 'On Leave / Unavailable' : 'Available for Booking'}.`);
    } catch (err) {
      console.error('Leave toggle failed:', err);
      showNotification('Failed to update availability: ' + err.message, 'error');
    }
  };

  // Load Doctor Appointments for Tab 4
  useEffect(() => {
    if (activeTab === 'appointments' && apptSelectedDoctorName) {
      setLoadingDoctorAppts(true);
      fetchDoctorAppointments(apptSelectedDoctorName)
        .then(res => setDoctorApptsList(res || []))
        .catch(err => {
          console.error('Failed to load appointments:', err);
          setDoctorApptsList([]);
        })
        .finally(() => setLoadingDoctorAppts(false));
    }
  }, [activeTab, apptSelectedDoctorName]);

  // Doctor Initials Helper
  const getInitials = (name) => {
    if (!name) return 'DR';
    const clean = name.replace(/^Dr\.\s*/i, '').trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ── Timetable Matrix Date & Parsing Helpers ──
  const formatYYYYMMDD = (d) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDays = (currDate) => {
    const d = new Date(currDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const getMonthGrid = (currDate) => {
    const year = currDate.getFullYear();
    const month = currDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const cells = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      cells.push({
        date: d,
        dateStr: formatYYYYMMDD(d),
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isToday: formatYYYYMMDD(d) === '2026-10-31'
      });
    }

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      cells.push({
        date: d,
        dateStr: formatYYYYMMDD(d),
        dayNum: i,
        isCurrentMonth: true,
        isToday: formatYYYYMMDD(d) === '2026-10-31'
      });
    }

    const remaining = (cells.length <= 35 ? 35 : 42) - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        date: d,
        dateStr: formatYYYYMMDD(d),
        dayNum: i,
        isCurrentMonth: false,
        isToday: formatYYYYMMDD(d) === '2026-10-31'
      });
    }

    return cells;
  };

  const handlePrevTimetable = () => {
    const d = new Date(timetableDate);
    if (timetableMode === 'day') {
      d.setDate(d.getDate() - 1);
    } else if (timetableMode === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setTimetableDate(d);
  };

  const handleNextTimetable = () => {
    const d = new Date(timetableDate);
    if (timetableMode === 'day') {
      d.setDate(d.getDate() + 1);
    } else if (timetableMode === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setTimetableDate(d);
  };

  const handleTodayTimetable = () => {
    setTimetableDate(new Date(2026, 9, 31));
  };

  const getTimetableTitle = () => {
    if (timetableMode === 'day') {
      return timetableDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (timetableMode === 'week') {
      const week = getWeekDays(timetableDate);
      const start = week[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const end = week[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} – ${end}`;
    }
    return timetableDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDoctorAppointmentsOnDate = (docName, dateStr) => {
    if (!docName || !dateStr) return [];
    const cleanDoc = docName.toLowerCase().replace(/^dr\.\s*/i, '').trim();
    return allAppointments.filter(a => {
      const aDoc = (a.doctor_name || '').toLowerCase().replace(/^dr\.\s*/i, '').trim();
      const matchDoc = aDoc.includes(cleanDoc) || cleanDoc.includes(aDoc);
      return matchDoc && a.preferred_date === dateStr;
    });
  };

  const getDoctorLeaveOnDate = (doc, dateStr) => {
    if (!doc || !dateStr) return null;
    if (doc.is_on_leave && doc.leave_start_date && doc.leave_end_date) {
      if (dateStr >= doc.leave_start_date && dateStr <= doc.leave_end_date) {
        return {
          reason: doc.leave_reason || 'Approved Medical Leave',
          start_date: doc.leave_start_date,
          end_date: doc.leave_end_date
        };
      }
    }
    if (doc.leaves && Array.isArray(doc.leaves)) {
      for (const l of doc.leaves) {
        if (dateStr >= l.start_date && dateStr <= l.end_date) {
          return {
            reason: l.reason || 'Approved Planned Leave',
            start_date: l.start_date,
            end_date: l.end_date
          };
        }
      }
    }
    return null;
  };

  const parseTimeToFloat = (timeStr) => {
    if (!timeStr) return 10.0;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return 10.0;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3] ? match[3].toUpperCase() : null;
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour + (minute / 60);
  };

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif', color: '#0A2520', position: 'relative' }}>
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />
      <div style={{ position: 'relative', zIndex: 1 }}>
      
      {/* ── Toast Notification ── */}
      {notification.text && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: notification.type === 'error' ? '#991B1B' : '#0F5B4C',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(15, 91, 76, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 2000,
          fontWeight: 700,
          fontSize: '13.5px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {notification.type === 'error' ? (
            <AlertCircle size={17} color="#FCA5A5" />
          ) : (
            <CheckCircle2 size={17} color="#00C9A7" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* ── SECTION 1: ACTIONS & KPI CARDS (Clean, no duplicate headings) ── */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={loadInitialData}
              title="Refresh roster from clinic records"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '11px',
                backgroundColor: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddDoctor}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '11px',
                backgroundColor: '#0F5B4C',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#0A4337'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0F5B4C'}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add New Doctor</span>
            </button>
          </div>
        </div>

        {/* ── KPI Metric Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '26px'
        }}>
          {/* Card 1: Total Doctors */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(10, 37, 32, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#EDFDF9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F5B4C'
            }}>
              <Stethoscope size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Doctors
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#0A2520' }}>
                {metrics.total}
              </div>
              <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                Across all clinic branches
              </div>
            </div>
          </div>

          {/* Card 2: Active Doctors */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(10, 37, 32, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#059669'
            }}>
              <UserCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Doctors
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669' }}>
                {metrics.active}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                Eligible for live booking
              </div>
            </div>
          </div>

          {/* Card 3: Currently Available */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(10, 37, 32, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16A34A'
            }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Currently Available
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#16A34A' }}>
                {metrics.available}
              </div>
              <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>
                Synchronized with Priya AI
              </div>
            </div>
          </div>

          {/* Card 4: Doctors on Leave */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '18px 20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(10, 37, 32, 0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D97706'
            }}>
              <CalendarOff size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Doctors on Leave
              </div>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#D97706' }}>
                {metrics.onLeave}
              </div>
              <div style={{ fontSize: '11.5px', color: '#B45309', fontWeight: 600 }}>
                Slots safely blocked
              </div>
            </div>
          </div>
        </div>

        {/* ── Sub-Navigation Tabs ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid #E2E8F0',
          paddingBottom: '2px',
          marginBottom: '20px'
        }}>
          {[
            { id: 'directory', label: 'Doctor Directory', icon: Stethoscope },
            { id: 'departments', label: 'Department Rosters', icon: Building2 },
            { id: 'schedule', label: 'Working Schedules', icon: Clock },
            { id: 'appointments', label: 'Doctor-wise Appointments', icon: Calendar }
          ].map(tab => {
            const IconComponent = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  borderBottom: isCurrent ? '3px solid #0F5B4C' : '3px solid transparent',
                  marginBottom: '-3px',
                  color: isCurrent ? '#0F5B4C' : '#64748B',
                  fontWeight: isCurrent ? 800 : 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <IconComponent size={16} color={isCurrent ? '#0F5B4C' : '#94A3B8'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TAB 1: DOCTOR DIRECTORY ── */}
      {activeTab === 'directory' && (
        <div>
          {/* Filters Toolbar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid #E2E8F0',
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
              padding: '9px 14px',
              borderRadius: '10px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              minWidth: '240px',
              flex: '1 1 240px'
            }}>
              <Search size={15} color="#64748B" />
              <input
                type="text"
                placeholder="Search by name, specialization, qualification, or clinic..."
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

            {/* Department Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} color="#64748B" />
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#0A2520',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Departments</option>
                {uniqueDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Specialization Filter */}
            {uniqueSpecialties.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Stethoscope size={14} color="#64748B" />
                <select
                  value={specFilter}
                  onChange={e => setSpecFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '9px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13px',
                    color: '#0A2520',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Specializations</option>
                  {uniqueSpecialties.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Availability Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#64748B" />
              <select
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#0A2520',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Availability</option>
                <option value="AVAILABLE_NOW">Available on Duty</option>
                <option value="ON_LEAVE">Currently On Leave</option>
              </select>
            </div>

            {/* Active / Inactive Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '9px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: '#0A2520',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Profiles</option>
                <option value="DEACTIVATED">Deactivated</option>
              </select>
            </div>
          </div>

          {/* Doctors Grid / Directory Cards */}
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
              <RefreshCw size={36} color="#0F5B4C" className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#0A2520', fontWeight: 800 }}>Loading Physician Roster...</h4>
              <p style={{ margin: 0, color: '#64748B', fontSize: '13.5px' }}>Fetching verified doctors and operating schedules</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
              <Stethoscope size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#0A2520', fontWeight: 800 }}>No Doctor Profiles Found</h4>
              <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '14px' }}>Try adjusting your search keywords, department, or availability filters.</p>
              <button
                type="button"
                onClick={handleOpenAddDoctor}
                style={{
                  padding: '9px 18px',
                  borderRadius: '9px',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Add First Doctor
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px'
            }}>
              {filteredDoctors.map(doc => {
                const isInactive = doc.is_active === false;
                const onLeave = Boolean(doc.is_on_leave);
                const shifts = doc.shifts || ["09:00 AM - 01:00 PM", "04:30 PM - 08:00 PM"];
                const days = doc.working_days || doc.available_days || ["Mon-Sat"];

                return (
                  <div
                    key={doc.id || doc.name}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: isInactive
                        ? '1px dashed #CBD5E1'
                        : (onLeave ? '1px solid #FCD34D' : '1px solid #E2E8F0'),
                      boxShadow: '0 3px 14px rgba(10, 37, 32, 0.03)',
                      padding: '22px',
                      opacity: isInactive ? 0.72 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      {/* Top Bar: Dept Pill & Status Badge */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{
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
                          <span>{doc.department || 'General Medicine'}</span>
                        </span>

                        {/* Status Badge */}
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
                            Available
                          </span>
                        )}
                      </div>

                      {/* Doctor Info Row */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                        {/* Avatar */}
                        {doc.profile_photo ? (
                          <img
                            src={doc.profile_photo}
                            alt={doc.name}
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '14px',
                              objectFit: 'cover',
                              border: '2px solid #E2E8F0',
                              flexShrink: 0
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '14px',
                            backgroundColor: '#0F5B4C',
                            color: '#FFFFFF',
                            fontWeight: 900,
                            fontSize: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 3px 10px rgba(15, 91, 76, 0.2)'
                          }}>
                            {getInitials(doc.name)}
                          </div>
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{
                            margin: '0 0 2px',
                            fontSize: '17px',
                            fontWeight: 900,
                            color: '#0A2520',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {doc.name}
                          </h3>
                          <div style={{ fontSize: '12.5px', color: '#00C9A7', fontWeight: 700, marginBottom: '2px' }}>
                            {doc.specialty}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                            {doc.qualification || 'MBBS, MD'} • {doc.experience || '5+ yrs exp'}
                          </div>
                          {doc.registration_number && (
                            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                              Reg: {doc.registration_number}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Operational Details Box */}
                      <div style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '12px',
                        fontSize: '12px',
                        color: '#334155',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginBottom: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748B' }}>
                            <Timer size={13} color="#00C9A7" />
                            <span>Slot: <strong>{doc.consultation_duration || '20 mins'}</strong></span>
                          </span>
                          <span>Fee: <strong>₹{doc.consultation_fee || 700}</strong></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                          <Clock size={13} color="#0F5B4C" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <strong>Shifts:</strong> {shifts.join(' | ')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                          <Calendar size={13} color="#00C9A7" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <strong>Days:</strong> {days.join(', ')}
                          </div>
                        </div>

                        {/* Leave Note Alert if any */}
                        {onLeave && doc.leave_note && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '5px',
                            color: '#B45309',
                            backgroundColor: '#FEF3C7',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            marginTop: '4px',
                            fontSize: '11.5px'
                          }}>
                            <CalendarOff size={13} style={{ marginTop: '1px', flexShrink: 0 }} />
                            <span><strong>Leave:</strong> {doc.leave_note}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '14px',
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr auto',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => handleOpenDoctorProfile(doc)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#F8FAFC',
                          color: '#0F5B4C',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                        title="View Complete Doctor Profile"
                      >
                        <Eye size={13} />
                        <span>Profile</span>
                      </button>

                      {/* Edit Doctor */}
                      <button
                        type="button"
                        onClick={() => handleOpenEditDoctor(doc)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#F8FAFC',
                          color: '#334155',
                          border: '1px solid #E2E8F0',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                        title="Edit Doctor Details"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>

                      {/* Manage Schedule */}
                      <button
                        type="button"
                        onClick={() => handleOpenScheduleModal(doc)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#EDFDF9',
                          color: '#0F5B4C',
                          border: '1px solid rgba(0, 201, 167, 0.3)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                        title="Manage Working Schedule & Leaves"
                      >
                        <Calendar size={13} />
                        <span>Schedule</span>
                      </button>

                      {/* Deactivate / Reactivate */}
                      <button
                        type="button"
                        onClick={() => promptToggleDoctorActive(doc)}
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
                          justifyContent: 'center'
                        }}
                        title={isInactive ? "Reactivate Doctor" : "Deactivate Doctor"}
                      >
                        <Power size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DEPARTMENT ROSTERS ── */}
      {activeTab === 'departments' && (
        <div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)'
          }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#0A2520' }}>
              Clinical Department Allocation
            </h3>
            <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B' }}>
              Assign doctors to departments, inspect doctor counts, and review specialized staffing per specialty unit.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '18px'
          }}>
            {uniqueDepartments.map(deptName => {
              const deptDocs = doctors.filter(d => (d.department || 'General Medicine') === deptName);
              const activeCount = deptDocs.filter(d => d.is_active !== false && !d.is_on_leave).length;

              return (
                <div
                  key={deptName}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: '#EAF6F3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#0F5B4C'
                        }}>
                          <Building2 size={18} />
                        </div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0A2520' }}>
                          {deptName}
                        </h4>
                      </div>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: activeCount > 0 ? '#DCFAF3' : '#F1F5F9',
                        color: activeCount > 0 ? '#0F5B4C' : '#64748B'
                      }}>
                        {activeCount} Active
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '14px' }}>
                      <strong>{deptDocs.length}</strong> {deptDocs.length === 1 ? 'physician' : 'physicians'} assigned
                    </div>

                    {/* Doctor pills */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {deptDocs.length === 0 ? (
                        <div style={{ fontSize: '12.5px', color: '#94A3B8', fontStyle: 'italic', padding: '10px 0' }}>
                          No physicians currently assigned to this department.
                        </div>
                      ) : (
                        deptDocs.map(doc => (
                          <div
                            key={doc.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              backgroundColor: '#F8FAFC',
                              borderRadius: '8px',
                              fontSize: '12.5px'
                            }}
                          >
                            <span style={{ fontWeight: 700, color: '#0A2520' }}>{doc.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: '#64748B' }}>{doc.specialty}</span>
                              <button
                                type="button"
                                onClick={() => handleOpenEditDoctor(doc)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#0F5B4C',
                                  cursor: 'pointer',
                                  padding: '2px'
                                }}
                                title="Change Department / Edit"
                              >
                                <Edit3 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDeptFilter(deptName);
                      setActiveTab('directory');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: '#F1F5F9',
                      color: '#0F5B4C',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>View Department Directory</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: WORKING SCHEDULES & TIMETABLE MATRIX ── */}
      {activeTab === 'schedule' && (() => {
        const weekDays = getWeekDays(timetableDate);
        const monthGrid = getMonthGrid(timetableDate);
        const dayStr = formatYYYYMMDD(timetableDate);
        const hoursList = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

        const filteredTimetableDocs = doctors.filter(doc => {
          const matchDoc = timetableDoctorFilter === 'ALL' || doc.name === timetableDoctorFilter;
          const matchDept = timetableDeptFilter === 'ALL' || doc.department === timetableDeptFilter;
          return matchDoc && matchDept;
        });

        const selectedDocObj = timetableDoctorFilter !== 'ALL'
          ? doctors.find(d => d.name === timetableDoctorFilter) || null
          : null;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* ── Top Bar: Title, Mac Segmented Control, Date Navigator ── */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '18px 22px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#0A2520', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Weekly Consultation Timetable Matrix
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Unified clinical timetable across physicians, booked appointments, consultation shifts, and planned leaves.
                </p>
              </div>

              {/* Mac-Style Segmented View Switcher [ Day | Week | Month ] */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: '#F1F5F9',
                padding: '3px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0'
              }}>
                {[
                  { id: 'day', label: 'Day' },
                  { id: 'week', label: 'Week' },
                  { id: 'month', label: 'Month' }
                ].map(mode => {
                  const isCurrent = timetableMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setTimetableMode(mode.id)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '7px',
                        border: 'none',
                        backgroundColor: isCurrent ? '#FFFFFF' : 'transparent',
                        color: isCurrent ? '#0F5B4C' : '#64748B',
                        fontSize: '12.5px',
                        fontWeight: isCurrent ? 800 : 600,
                        cursor: 'pointer',
                        boxShadow: isCurrent ? '0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {/* Date Navigator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleTodayTimetable}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0A2520',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Today
                </button>

                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '8px', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={handlePrevTimetable}
                    style={{
                      padding: '6px 8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#0A2520',
                    minWidth: '140px',
                    textAlign: 'center',
                    borderLeft: '1px solid #E2E8F0',
                    borderRight: '1px solid #E2E8F0'
                  }}>
                    {getTimetableTitle()}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextTimetable}
                    style={{
                      padding: '6px 8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#475569',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Filter Controls & Legend Bar ── */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '14px 20px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Doctor Filter Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B' }}>Physician:</span>
                  <select
                    value={timetableDoctorFilter}
                    onChange={e => setTimetableDoctorFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#0A2520',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL">All Physicians (Whole Clinic)</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.name}>{d.name} — {d.specialty || d.department}</option>
                    ))}
                  </select>
                </div>

                {/* Department Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748B' }}>Department:</span>
                  <select
                    value={timetableDeptFilter}
                    onChange={e => setTimetableDeptFilter(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#0A2520',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="ALL">All Departments</option>
                    {STANDARD_DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {timetableDoctorFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => setTimetableDoctorFilter('ALL')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #E2E8F0',
                      color: '#475569',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Reset Filter
                  </button>
                )}
              </div>

              {/* Legend matching Image 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#2563EB', display: 'inline-block' }} />
                  <span>Consultation Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }} />
                  <span>On Duty / Available</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#8B5CF6', display: 'inline-block' }} />
                  <span>Break / Handover</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#F59E0B', display: 'inline-block' }} />
                  <span>Approved Leave</span>
                </div>
              </div>
            </div>

            {/* ── Single Doctor Hero Strip (When Filtered by Each Doctor) ── */}
            {selectedDocObj && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '18px 22px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: '#EDFDF9',
                    border: '1px solid rgba(0, 201, 167, 0.3)',
                    color: '#0F5B4C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '16px'
                  }}>
                    {getInitials(selectedDocObj.name)}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0A2520' }}>
                        {selectedDocObj.name}
                      </h4>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: selectedDocObj.is_on_leave ? '#FEF3C7' : '#EDFDF9',
                        color: selectedDocObj.is_on_leave ? '#B45309' : '#0F5B4C'
                      }}>
                        {selectedDocObj.is_on_leave ? 'On Approved Leave' : 'Active On Duty'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                      {selectedDocObj.specialty || selectedDocObj.department} • Reg: {selectedDocObj.medical_registration_number || 'MCI-DEL-4491'} • Slot: {selectedDocObj.consultation_duration || '20 mins'} • Fee: ₹{selectedDocObj.consultation_fee || 700}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenScheduleModal(selectedDocObj)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#0F5B4C',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Calendar size={13} />
                    <span>Manage Schedule & Leaves</span>
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ── VIEW 1: DAY VIEW (Horizontal Timeline Matrix, Image 2 Style) ── */}
            {/* ══════════════════════════════════════════════════════════ */}
            {timetableMode === 'day' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                overflowX: 'auto',
                padding: '20px'
              }}>
                <div style={{ minWidth: '950px' }}>
                  {/* Timeline Header Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '220px repeat(9, 1fr)',
                    borderBottom: '2px solid #E2E8F0',
                    paddingBottom: '10px',
                    marginBottom: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#64748B'
                  }}>
                    <div>Physician & Chamber</div>
                    {hoursList.slice(0, 9).map(hr => (
                      <div key={hr} style={{ textAlign: 'center' }}>{hr}</div>
                    ))}
                  </div>

                  {/* Doctor Timeline Rows */}
                  {filteredTimetableDocs.map((doc, idx) => {
                    const docAppts = getDoctorAppointmentsOnDate(doc.name, dayStr);
                    const leave = getDoctorLeaveOnDate(doc, dayStr);
                    const dayName = timetableDate.toLocaleDateString('en-US', { weekday: 'long' });
                    const worksToday = (doc.working_days || doc.available_days || []).includes(dayName);

                    return (
                      <div
                        key={doc.id || idx}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '220px 1fr',
                          borderBottom: '1px solid #F1F5F9',
                          padding: '14px 0',
                          alignItems: 'center',
                          position: 'relative'
                        }}
                      >
                        {/* Doctor Column */}
                        <div style={{ paddingRight: '16px' }}>
                          <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '13.5px' }}>
                            {doc.name}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#00C9A7', fontWeight: 600 }}>
                            {doc.department}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                            Chamber 10{idx + 1} • {worksToday ? 'Shift: 09:00 - 13:00' : 'Off Duty'}
                          </div>
                        </div>

                        {/* Timeline Track Area */}
                        <div style={{
                          position: 'relative',
                          height: '52px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '10px',
                          border: '1px dashed #CBD5E1',
                          overflow: 'hidden'
                        }}>
                          {/* Grid hour guidelines */}
                          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', pointerEvents: 'none' }}>
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div key={i} style={{ borderRight: '1px solid #E2E8F0', height: '100%' }} />
                            ))}
                          </div>

                          {/* Leave Banner if on leave */}
                          {leave ? (
                            <div style={{
                              position: 'absolute',
                              inset: '6px',
                              backgroundColor: '#FEF3C7',
                              border: '1px solid #FCD34D',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              fontWeight: 800,
                              color: '#B45309',
                              zIndex: 2
                            }}>
                              <CalendarOff size={14} />
                              <span>Approved Leave: {leave.reason}</span>
                            </div>
                          ) : !worksToday ? (
                            <div style={{
                              position: 'absolute',
                              inset: '6px',
                              backgroundColor: '#F1F5F9',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#94A3B8'
                            }}>
                              Off Duty on {dayName}s
                            </div>
                          ) : (
                            <>
                              {/* Lunch Break block (13:00 to 14:00 is column 4 in 0..8) */}
                              <div style={{
                                position: 'absolute',
                                left: `${(4 / 9) * 100}%`,
                                width: `${(1 / 9) * 100}%`,
                                top: '6px',
                                bottom: '6px',
                                backgroundColor: '#F3E8FF',
                                border: '1px solid #DDD6FE',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: '#7C3AED',
                                zIndex: 1
                              }}>
                                Break
                              </div>

                              {/* Booked Appointments */}
                              {docAppts.map((appt, aIdx) => {
                                const floatTime = parseTimeToFloat(appt.preferred_time);
                                const clampedTime = Math.max(9, Math.min(17.5, floatTime));
                                const leftPercent = Math.max(1, Math.min(85, ((clampedTime - 9) / 9) * 100));

                                return (
                                  <div
                                    key={appt.reference_id || aIdx}
                                    onClick={() => setSelectedEventDetails({ type: 'appointment', data: appt, doctor: doc })}
                                    style={{
                                      position: 'absolute',
                                      left: `${leftPercent}%`,
                                      width: '135px',
                                      top: '5px',
                                      bottom: '5px',
                                      backgroundColor: '#EFF6FF',
                                      borderLeft: '4px solid #2563EB',
                                      border: '1px solid #BFDBFE',
                                      borderLeftWidth: '4px',
                                      borderRadius: '6px',
                                      padding: '3px 8px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      boxShadow: '0 1px 4px rgba(37, 99, 235, 0.12)',
                                      zIndex: 3
                                    }}
                                  >
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {appt.patient_name}
                                    </div>
                                    <div style={{ fontSize: '9.5px', color: '#3B82F6', fontWeight: 600 }}>
                                      {appt.preferred_time} • {appt.visit_type || 'Consult'}
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ── VIEW 2: WEEK VIEW (7-Day Schedule Matrix) ── */}
            {/* ══════════════════════════════════════════════════════════ */}
            {timetableMode === 'week' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                overflowX: 'auto'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                      <th style={{ padding: '16px 18px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', width: '220px' }}>
                        Physician & Department
                      </th>
                      {weekDays.map(d => {
                        const isToday = formatYYYYMMDD(d) === '2026-10-31';
                        return (
                          <th key={d.toISOString()} style={{
                            padding: '14px 10px',
                            textAlign: 'center',
                            backgroundColor: isToday ? '#EDFDF9' : '#F8FAFC',
                            borderLeft: '1px solid #E2E8F0'
                          }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: isToday ? '#0F5B4C' : '#64748B', textTransform: 'uppercase' }}>
                              {d.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div style={{
                              fontSize: '15px',
                              fontWeight: 900,
                              color: isToday ? '#0F5B4C' : '#0A2520',
                              marginTop: '2px'
                            }}>
                              {d.getDate()}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTimetableDocs.map((doc, idx) => {
                      return (
                        <tr
                          key={doc.id || idx}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFB'
                          }}
                        >
                          {/* Physician Info */}
                          <td style={{ padding: '16px 18px', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 800, color: '#0A2520', fontSize: '13.5px' }}>
                              {doc.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#00C9A7', fontWeight: 600 }}>
                              {doc.specialty || doc.department}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                              Fee: ₹{doc.consultation_fee || 700} • {doc.consultation_duration || '20 mins'}
                            </div>
                          </td>

                          {/* 7 Days of the Week */}
                          {weekDays.map(d => {
                            const dateStr = formatYYYYMMDD(d);
                            const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                            const worksToday = (doc.working_days || doc.available_days || []).includes(dayName);
                            const leave = getDoctorLeaveOnDate(doc, dateStr);
                            const dayAppts = getDoctorAppointmentsOnDate(doc.name, dateStr);

                            return (
                              <td
                                key={dateStr}
                                style={{
                                  padding: '12px 8px',
                                  verticalAlign: 'top',
                                  borderLeft: '1px solid #F1F5F9',
                                  minWidth: '120px'
                                }}
                              >
                                {leave ? (
                                  <div
                                    onClick={() => setSelectedEventDetails({ type: 'leave', data: leave, doctor: doc })}
                                    style={{
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      backgroundColor: '#FEF3C7',
                                      border: '1px solid #FCD34D',
                                      fontSize: '11px',
                                      color: '#B45309',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <CalendarOff size={11} />
                                      <span>On Leave</span>
                                    </div>
                                    <div style={{ fontSize: '9.5px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {leave.reason}
                                    </div>
                                  </div>
                                ) : !worksToday ? (
                                  <div style={{ textAlign: 'center', color: '#CBD5E1', fontSize: '12px', padding: '12px 0' }}>
                                    — Off —
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {/* Shift tag */}
                                    <div style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      color: '#0F5B4C',
                                      backgroundColor: '#EDFDF9',
                                      border: '1px solid rgba(0, 201, 167, 0.3)',
                                      padding: '3px 6px',
                                      borderRadius: '6px',
                                      textAlign: 'center'
                                    }}>
                                      Shift: 09:00 - 13:00
                                    </div>

                                    {/* Appointments Booked on this date */}
                                    {dayAppts.length > 0 ? (
                                      dayAppts.map(a => (
                                        <div
                                          key={a.reference_id}
                                          onClick={() => setSelectedEventDetails({ type: 'appointment', data: a, doctor: doc })}
                                          style={{
                                            padding: '4px 6px',
                                            borderRadius: '6px',
                                            backgroundColor: '#EFF6FF',
                                            borderLeft: '3px solid #2563EB',
                                            fontSize: '10.5px',
                                            fontWeight: 700,
                                            color: '#1E40AF',
                                            cursor: 'pointer',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                                          }}
                                        >
                                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.patient_name}
                                          </div>
                                          <div style={{ fontSize: '9px', color: '#3B82F6' }}>
                                            {a.preferred_time}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div style={{ fontSize: '10px', color: '#94A3B8', textAlign: 'center', padding: '4px 0' }}>
                                        Open Slots
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════ */}
            {/* ── VIEW 3: MONTH VIEW (Full Calendar Grid, Image 3 & 4 Style) ── */}
            {/* ══════════════════════════════════════════════════════════ */}
            {timetableMode === 'month' && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                overflow: 'hidden'
              }}>
                {/* Calendar Day Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: '#475569',
                  padding: '12px 0'
                }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(dayName => (
                    <div key={dayName}>{dayName}</div>
                  ))}
                </div>

                {/* Calendar 35/42 Days Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  backgroundColor: '#E2E8F0',
                  gap: '1px'
                }}>
                  {monthGrid.map((cell, cIdx) => {
                    const cellDateStr = cell.dateStr;
                    // Gather appointments and leaves in this cell
                    const cellAppts = allAppointments.filter(a => {
                      const matchDate = a.preferred_date === cellDateStr;
                      const matchDoc = timetableDoctorFilter === 'ALL' || (a.doctor_name || '').includes(timetableDoctorFilter.replace(/^dr\.\s*/i, ''));
                      return matchDate && matchDoc;
                    });

                    const leavesInCell = filteredTimetableDocs
                      .map(doc => {
                        const l = getDoctorLeaveOnDate(doc, cellDateStr);
                        return l ? { doc, leave: l } : null;
                      })
                      .filter(Boolean);

                    return (
                      <div
                        key={cellDateStr + cIdx}
                        onClick={() => {
                          setTimetableDate(cell.date);
                          setTimetableMode('day');
                        }}
                        style={{
                          backgroundColor: cell.isCurrentMonth ? '#FFFFFF' : '#FAFCFB',
                          minHeight: '115px',
                          padding: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          transition: 'background-color 0.1s ease',
                          opacity: cell.isCurrentMonth ? 1 : 0.45
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = cell.isCurrentMonth ? '#F8FAFC' : '#F1F5F9'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = cell.isCurrentMonth ? '#FFFFFF' : '#FAFCFB'}
                      >
                        {/* Day Number Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{
                            fontSize: '12.5px',
                            fontWeight: cell.isToday ? 900 : 700,
                            color: cell.isToday ? '#FFFFFF' : (cell.isCurrentMonth ? '#0A2520' : '#94A3B8'),
                            backgroundColor: cell.isToday ? '#0F5B4C' : 'transparent',
                            width: cell.isToday ? '24px' : 'auto',
                            height: cell.isToday ? '24px' : 'auto',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {cell.dayNum}
                          </span>

                          {cellAppts.length > 0 && (
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#2563EB' }}>
                              {cellAppts.length} {cellAppts.length === 1 ? 'visit' : 'visits'}
                            </span>
                          )}
                        </div>

                        {/* Event Pills inside Day Cell (Multi-day Leave / Appointments) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflow: 'hidden' }}>
                          {/* Leaves in this date cell */}
                          {leavesInCell.slice(0, 1).map(({ doc, leave }, lIdx) => (
                            <div
                              key={lIdx}
                              style={{
                                padding: '2px 5px',
                                borderRadius: '4px',
                                backgroundColor: '#FEF3C7',
                                borderLeft: '3px solid #F59E0B',
                                fontSize: '9.5px',
                                fontWeight: 700,
                                color: '#B45309',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Leave: {doc.name.replace(/^dr\.\s*/i, '')}
                            </div>
                          ))}

                          {/* Appointments in this date cell */}
                          {cellAppts.slice(0, 2).map((a, aIdx) => (
                            <div
                              key={a.reference_id || aIdx}
                              style={{
                                padding: '2px 5px',
                                borderRadius: '4px',
                                backgroundColor: '#EFF6FF',
                                borderLeft: '3px solid #2563EB',
                                fontSize: '9.5px',
                                fontWeight: 700,
                                color: '#1E40AF',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {a.preferred_time} {a.patient_name}
                            </div>
                          ))}

                          {cellAppts.length > 2 && (
                            <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 700, paddingLeft: '4px' }}>
                              +{cellAppts.length - 2} more bookings
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Event Details Modal (When clicking any appointment or leave) ── */}
            {selectedEventDetails && (
              <div style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(10, 37, 32, 0.6)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1100,
                padding: '16px'
              }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '520px',
                  padding: '28px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: selectedEventDetails.type === 'leave' ? '#F59E0B' : '#2563EB'
                      }} />
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0A2520' }}>
                        {selectedEventDetails.type === 'leave' ? 'Approved Leave Details' : 'Appointment Information'}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEventDetails(null)}
                      style={{
                        padding: '6px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#F1F5F9',
                        color: '#64748B',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {selectedEventDetails.type === 'appointment' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase' }}>
                          Patient Ticket: {selectedEventDetails.data.reference_id}
                        </div>
                        <div style={{ fontSize: '17px', fontWeight: 900, color: '#0A2520', marginTop: '2px' }}>
                          {selectedEventDetails.data.patient_name}
                        </div>
                        <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                          Phone: {selectedEventDetails.data.phone || 'Not available'}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Physician</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                            {selectedEventDetails.data.doctor_name}
                          </div>
                        </div>

                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Date & Time</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                            {selectedEventDetails.data.preferred_date} • {selectedEventDetails.data.preferred_time}
                          </div>
                        </div>

                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Visit Type</div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                            {selectedEventDetails.data.visit_type || 'Consultation'}
                          </div>
                        </div>

                        <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Status</div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F5B4C', marginTop: '2px' }}>
                            {selectedEventDetails.data.status}
                          </div>
                        </div>
                      </div>

                      {selectedEventDetails.data.notes && (
                        <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Clinical Notes</div>
                          <div style={{ fontSize: '12.5px', color: '#334155', marginTop: '2px' }}>
                            {selectedEventDetails.data.notes}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEventDetails(null)}
                          style={{
                            padding: '9px 18px',
                            borderRadius: '10px',
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
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: '#FEF3C7', border: '1px solid #FCD34D' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', textTransform: 'uppercase' }}>
                          Approved Planned Leave
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 900, color: '#0A2520', marginTop: '2px' }}>
                          {selectedEventDetails.doctor.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#78350F', marginTop: '4px' }}>
                          Reason: {selectedEventDetails.data.reason}
                        </div>
                      </div>

                      <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Leave Period</div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520', marginTop: '2px' }}>
                          {selectedEventDetails.data.start_date} to {selectedEventDetails.data.end_date}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEventDetails(null)}
                          style={{
                            padding: '9px 18px',
                            borderRadius: '10px',
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
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── TAB 4: DOCTOR-WISE APPOINTMENT SCHEDULE ── */}
      {activeTab === 'appointments' && (
        <div>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            marginBottom: '20px',
            boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 800, color: '#0A2520' }}>
                Doctor-Wise Clinical Appointments
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B' }}>
                Real-time appointment schedule, patient visits, and status tracking.
              </p>
            </div>

            {/* Doctor Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Select Physician:</span>
              <select
                value={apptSelectedDoctorName}
                onChange={e => setApptSelectedDoctorName(e.target.value)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1px solid #0F5B4C',
                  backgroundColor: '#FFFFFF',
                  color: '#0A2520',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Appointment Schedule List */}
          {loadingDoctorAppts ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
              <RefreshCw size={36} color="#0F5B4C" className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#0A2520', fontWeight: 800 }}>Loading Appointments...</h4>
            </div>
          ) : doctorApptsList.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0' }}>
              <Calendar size={40} color="#94A3B8" style={{ marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#0A2520', fontWeight: 800 }}>No Appointments Found</h4>
              <p style={{ margin: 0, color: '#64748B', fontSize: '13.5px' }}>
                There are currently no recorded appointments for {apptSelectedDoctorName}.
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Ticket Ref</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Patient Name</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Contact</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Date & Slot</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Visit Type</th>
                    <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {doctorApptsList.map((appt, idx) => (
                    <tr 
                      key={appt.reference_id || idx}
                      style={{
                        borderBottom: idx !== doctorApptsList.length - 1 ? '1px solid #F1F5F9' : 'none',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFB'
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F5B4C', fontSize: '13px' }}>
                        {appt.reference_id}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0A2520', fontSize: '13.5px' }}>
                        {appt.patient_name}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '13px' }}>
                        {appt.phone}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#0A2520', fontSize: '13px' }}>
                        <div style={{ fontWeight: 700 }}>{appt.preferred_date}</div>
                        <div style={{ fontSize: '12px', color: '#00C9A7' }}>{appt.preferred_time}</div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12.5px' }}>
                        {appt.visit_type || 'In-Person Consultation'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: appt.status === 'VERIFIED_CONFIRMED' ? '#DCFAF3' : (appt.status === 'CANCELLED' ? '#FEE2E2' : '#FEF3C7'),
                          color: appt.status === 'VERIFIED_CONFIRMED' ? '#0F5B4C' : (appt.status === 'CANCELLED' ? '#DC2626' : '#B45309')
                        }}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: ADD / EDIT DOCTOR REGISTRATION ── */}
      {isFormModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1100,
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
            padding: '30px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '22px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#EDFDF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F5B4C'
              }}>
                <Stethoscope size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0A2520' }}>
                  {formMode === 'add' ? 'Register New Physician' : `Edit Doctor Profile: ${formName}`}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Complete physician credentials, clinical shifts, consultation fees, and working days.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDoctor} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Row 1: Name & Qualification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Full Doctor Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Priya Menon"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: formErrors.name ? '1px solid #DC2626' : '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.name && <span style={{ fontSize: '11px', color: '#DC2626' }}>{formErrors.name}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Qualifications *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MBBS, MD, DM"
                    value={formQualification}
                    onChange={e => setFormQualification(e.target.value)}
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

              {/* Row 2: Specialty & Department */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Interventional Cardiologist"
                    value={formSpecialty}
                    onChange={e => setFormSpecialty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: formErrors.specialty ? '1px solid #DC2626' : '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.specialty && <span style={{ fontSize: '11px', color: '#DC2626' }}>{formErrors.specialty}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Department *
                  </label>
                  <select
                    value={formDepartment}
                    onChange={e => setFormDepartment(e.target.value)}
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
                    {uniqueDepartments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Medical Reg No & Experience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Medical Registration Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KMC/2015/04321"
                    value={formRegNumber}
                    onChange={e => setFormRegNumber(e.target.value)}
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
                    Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8+ years"
                    value={formExperience}
                    onChange={e => setFormExperience(e.target.value)}
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

              {/* Row 4: Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: formErrors.phone ? '1px solid #DC2626' : '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.phone && <span style={{ fontSize: '11px', color: '#DC2626' }}>{formErrors.phone}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. doctor@careconnect.ai"
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: formErrors.email ? '1px solid #DC2626' : '1px solid #CBD5E1',
                      fontSize: '13.5px',
                      color: '#0A2520',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.email && <span style={{ fontSize: '11px', color: '#DC2626' }}>{formErrors.email}</span>}
                </div>
              </div>

              {/* Row 5: Clinic, Consultation Fee & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Clinic Location
                  </label>
                  <select
                    value={formClinicCode}
                    onChange={e => setFormClinicCode(e.target.value)}
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
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formFee}
                    onChange={e => setFormFee(e.target.value)}
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
                    Slot Duration
                  </label>
                  <select
                    value={formSlotDuration}
                    onChange={e => setFormSlotDuration(e.target.value)}
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

              {/* Working Days Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Working Days (Click to toggle) *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_DAYS.map(day => {
                    const isSelected = formWorkingDays.includes(day);
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
                {formErrors.workingDays && <span style={{ fontSize: '11px', color: '#DC2626' }}>{formErrors.workingDays}</span>}
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
                    value={formShiftMorning}
                    onChange={e => setFormShiftMorning(e.target.value)}
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
                    value={formShiftEvening}
                    onChange={e => setFormShiftEvening(e.target.value)}
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

              {/* Breaks */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Breaks (e.g. Lunch, Tea - comma separated)
                </label>
                <input
                  type="text"
                  placeholder="01:00 PM - 02:00 PM (Lunch)"
                  value={formBreaks}
                  onChange={e => setFormBreaks(e.target.value)}
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

              {/* Bio Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Professional Bio Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief clinical background, key surgical competencies, or sub-specialization focus..."
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '9px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Languages & Active Checkbox */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', alignItems: 'center' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    value={formLanguages}
                    onChange={e => setFormLanguages(e.target.value)}
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
                      checked={formIsActive}
                      onChange={e => setFormIsActive(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span>Active Profile</span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
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
                  disabled={savingDoctor}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: savingDoctor ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
                  }}
                >
                  {savingDoctor ? 'Saving to Database...' : (formMode === 'add' ? 'Save Doctor Profile' : 'Update Profile')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: DOCTOR PROFILE VIEW (DRAWER / MODAL) ── */}
      {selectedDoctorProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1100,
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
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setSelectedDoctorProfile(null)}
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

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: '#0F5B4C',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {getInitials(selectedDoctorProfile.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#0A2520' }}>
                    {selectedDoctorProfile.name}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: selectedDoctorProfile.is_active === false ? '#F1F5F9' : (selectedDoctorProfile.is_on_leave ? '#FEF3C7' : '#DCFAF3'),
                    color: selectedDoctorProfile.is_active === false ? '#64748B' : (selectedDoctorProfile.is_on_leave ? '#B45309' : '#0F5B4C')
                  }}>
                    {selectedDoctorProfile.is_active === false ? 'Deactivated' : (selectedDoctorProfile.is_on_leave ? 'On Leave' : 'Available on Duty')}
                  </span>
                </div>
                <div style={{ fontSize: '13.5px', color: '#00C9A7', fontWeight: 700 }}>
                  {selectedDoctorProfile.specialty} • {selectedDoctorProfile.department}
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                  {selectedDoctorProfile.qualification || 'MBBS, MD'} • {selectedDoctorProfile.experience || '5+ yrs'} • {selectedDoctorProfile.clinic_name}
                </div>
              </div>
            </div>

            {/* Profile Grid: Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Credentials & Practice
                </div>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div><strong>Registration No:</strong> {selectedDoctorProfile.registration_number || 'KMC-Verified'}</div>
                  <div><strong>Consultation Fee:</strong> ₹{selectedDoctorProfile.consultation_fee || 700}</div>
                  <div><strong>Slot Interval:</strong> {selectedDoctorProfile.consultation_duration || '20 mins'}</div>
                  <div><strong>Languages:</strong> {(selectedDoctorProfile.languages || []).join(', ') || 'English, Hindi'}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Contact Information
                </div>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#0F5B4C" />
                    <span>{selectedDoctorProfile.phone || '+91 80 6426 9783'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="#0F5B4C" />
                    <span>{selectedDoctorProfile.email || 'appointments@careconnect.ai'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={13} color="#0F5B4C" />
                    <span>{selectedDoctorProfile.clinic_name || 'Apex Care Clinic'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Bio */}
            {selectedDoctorProfile.bio && (
              <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '24px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Clinical Background & Bio
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                  {selectedDoctorProfile.bio}
                </p>
              </div>
            )}

            {/* Doctor's Appointments History */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0A2520' }}>
                  Associated Clinical Appointments ({profileAppointments.length})
                </h4>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['ALL', 'UPCOMING', 'CANCELLED'].map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setProfileApptFilter(mode)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: profileApptFilter === mode ? '#0F5B4C' : '#F1F5F9',
                        color: profileApptFilter === mode ? '#FFFFFF' : '#475569'
                      }}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {loadingProfileAppts ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  Loading appointments from clinic records...
                </div>
              ) : profileAppointments.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: '10px', color: '#64748B', fontSize: '13px' }}>
                  No appointments registered for this doctor.
                </div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profileAppointments
                    .filter(a => {
                      if (profileApptFilter === 'CANCELLED') return a.status === 'CANCELLED';
                      if (profileApptFilter === 'UPCOMING') return a.status === 'VERIFIED_CONFIRMED';
                      return true;
                    })
                    .map((a, i) => (
                      <div
                        key={a.reference_id || i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: '#F8FAFC',
                          borderRadius: '8px',
                          fontSize: '12.5px'
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 800, color: '#0F5B4C', marginRight: '8px' }}>{a.reference_id}</span>
                          <span style={{ fontWeight: 700, color: '#0A2520' }}>{a.patient_name}</span>
                          <span style={{ color: '#64748B', marginLeft: '8px' }}>({a.phone})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 600 }}>{a.preferred_date} • {a.preferred_time}</span>
                          <span style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: a.status === 'VERIFIED_CONFIRMED' ? '#DCFAF3' : '#FEE2E2',
                            color: a.status === 'VERIFIED_CONFIRMED' ? '#0F5B4C' : '#DC2626'
                          }}>
                            {a.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedDoctorProfile(null);
                  handleOpenEditDoctor(selectedDoctorProfile);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '9px',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Edit Doctor Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedDoctorProfile(null);
                  handleOpenScheduleModal(selectedDoctorProfile);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '9px',
                  backgroundColor: '#F1F5F9',
                  color: '#0A2520',
                  border: '1px solid #CBD5E1',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Manage Schedule & Leaves
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: WORKING SCHEDULE & AVAILABILITY / LEAVE MANAGER ── */}
      {scheduleModalDoctor && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1100,
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
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}>
            <button
              type="button"
              onClick={() => setScheduleModalDoctor(null)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#EDFDF9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F5B4C'
              }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 900, color: '#0A2520' }}>
                  Schedule & Leave: {scheduleModalDoctor.name}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Live availability status, shift configurations, and planned leave reservations.
                </p>
              </div>
            </div>

            {/* Live Availability Toggle Card */}
            <div style={{
              backgroundColor: scheduleModalDoctor.is_on_leave ? '#FEF3C7' : '#EDFDF9',
              borderRadius: '14px',
              padding: '16px 20px',
              border: scheduleModalDoctor.is_on_leave ? '1px solid #FCD34D' : '1px solid rgba(0, 201, 167, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: scheduleModalDoctor.is_on_leave ? '#B45309' : '#0F5B4C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {scheduleModalDoctor.is_on_leave ? <CalendarOff size={16} /> : <CheckCircle2 size={16} />}
                  <span>Status: {scheduleModalDoctor.is_on_leave ? 'Currently On Leave' : 'Available for Consultations'}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '2px' }}>
                  {scheduleModalDoctor.is_on_leave 
                    ? (scheduleModalDoctor.leave_note || 'Appointments safely blocked') 
                    : 'Open for online bookings and Priya Voice scheduling'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleToggleDoctorAvailableInstant(scheduleModalDoctor)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: scheduleModalDoctor.is_on_leave ? '#0F5B4C' : '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {scheduleModalDoctor.is_on_leave ? 'Mark Available' : 'Mark On Leave'}
              </button>
            </div>

            {/* Weekly Timetable Summary */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0', marginBottom: '22px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                Configured Shifts & Timings
              </div>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Working Days:</strong> {(scheduleModalDoctor.working_days || scheduleModalDoctor.available_days || []).join(', ')}</div>
                <div><strong>Daily Shifts:</strong> {(scheduleModalDoctor.shifts || []).join(' | ')}</div>
                <div><strong>Break Windows:</strong> {(scheduleModalDoctor.breaks || []).join(', ')}</div>
                <div><strong>Slot Duration:</strong> {scheduleModalDoctor.consultation_duration || '20 mins'}</div>
              </div>
            </div>

            {/* Planned Leave Form */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '18px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '15px', fontWeight: 800, color: '#0A2520' }}>
                Add Planned Leave Window
              </h4>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#64748B' }}>
                Appointments will be automatically blocked for this physician during the chosen date range.
              </p>

              <form onSubmit={handleAddLeave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Leave Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={leaveStartDate}
                      onChange={e => setLeaveStartDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Leave End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={leaveEndDate}
                      onChange={e => setLeaveEndDate(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Reason / Official Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Attending Annual Cardiology Conference"
                    value={leaveReason}
                    onChange={e => setLeaveReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLeave}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#0F5B4C',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: submittingLeave ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(15, 91, 76, 0.2)'
                  }}
                >
                  {submittingLeave ? 'Registering Leave...' : 'Approve & Save Planned Leave'}
                </button>
              </form>
            </div>

            {/* Upcoming Leaves List */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 800, color: '#0A2520' }}>
                Recorded Leaves & Schedule Blocks
              </h4>

              {(!scheduleModalDoctor.leave_records || scheduleModalDoctor.leave_records.length === 0) ? (
                <div style={{ fontSize: '12.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                  No planned leaves registered for this physician.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {scheduleModalDoctor.leave_records.map((leave, idx) => (
                    <div
                      key={leave.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        backgroundColor: '#FEF3C7',
                        borderRadius: '8px',
                        border: '1px solid #FCD34D',
                        fontSize: '12.5px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, color: '#B45309' }}>
                          {leave.start_date} to {leave.end_date}
                        </div>
                        <div style={{ color: '#78350F', fontSize: '11.5px' }}>
                          {leave.reason}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCancelLeave(leave.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          color: '#DC2626',
                          border: '1px solid #DC2626',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel Leave
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 4: CONFIRMATION DIALOG ── */}
      {confirmDialog.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 37, 32, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '460px',
            width: '100%',
            padding: '26px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <AlertTriangle size={24} />
            </div>

            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 900, color: '#0A2520' }}>
              {confirmDialog.title}
            </h3>

            <p style={{ margin: '0 0 22px', fontSize: '13.5px', color: '#64748B', lineHeight: 1.5 }}>
              {confirmDialog.message}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  backgroundColor: confirmDialog.confirmColor,
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {confirmDialog.confirmText}
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

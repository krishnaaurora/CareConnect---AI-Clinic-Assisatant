const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchHealth() {
  try {
    const res = await fetch('http://localhost:8000/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend health check error:', err);
    return { status: 'offline', database: 'disconnected' };
  }
}

export async function fetchClinics() {
  const res = await fetch(`${API_BASE_URL}/clinics`);
  if (!res.ok) throw new Error('Failed to fetch clinics from backend');
  return await res.json();
}

export async function createAppointment(payload) {
  const res = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit appointment request');
  }
  return await res.json();
}

export async function queryAppointmentStatus(referenceId) {
  const res = await fetch(`${API_BASE_URL}/appointments/${referenceId}`);
  if (!res.ok) throw new Error('Appointment ticket not found');
  return await res.json();
}

export async function interactVoiceAgent(message, language = 'English', clinicCode = 'CARE-IND-01') {
  const res = await fetch(`${API_BASE_URL}/voice/interact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      language,
      clinic_code: clinicCode
    })
  });
  if (!res.ok) throw new Error('Voice agent connection failed');
  return await res.json();
}

export async function submitCallbackRequest(payload) {
  const res = await fetch(`${API_BASE_URL}/enquiries/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to register callback');
  return await res.json();
}

export async function fetchAppointmentsOverview() {
  const res = await fetch(`${API_BASE_URL}/appointments/overview`);
  if (!res.ok) throw new Error('Failed to fetch appointments overview');
  const json = await res.json();
  return json.data;
}

export async function fetchSlotGrid(doctorName, date, clinicCode = 'CARE-IND-01') {
  try {
    const params = new URLSearchParams({
      doctor_name: doctorName,
      date: date,
      clinic_code: clinicCode
    });
    const res = await fetch(`${API_BASE_URL}/appointments/slots?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch slot availability');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Slot grid fallback:', err);
    return null;
  }
}

export async function sendAppointmentReminder(referenceId, payload = {}) {
  const res = await fetch(`${API_BASE_URL}/appointments/${referenceId}/remind`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to dispatch appointment reminder');
  }
  return await res.json();
}

export async function batchSendReminders(targetDate = null) {
  const url = targetDate 
    ? `${API_BASE_URL}/appointments/batch-remind?target_date=${encodeURIComponent(targetDate)}`
    : `${API_BASE_URL}/appointments/batch-remind`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to dispatch batch reminders');
  }
  return await res.json();
}

export async function cancelAppointment(referenceId, reason = 'Cancelled via clinic administration console.') {
  const res = await fetch(`${API_BASE_URL}/appointments/${referenceId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to cancel appointment');
  }
  return await res.json();
}

export async function updateAppointmentStatus(referenceId, status, notes = '') {
  const res = await fetch(`${API_BASE_URL}/appointments/${referenceId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Status update failed');
  }
  return await res.json();
}

export async function addDoctorToClinic(clinicCode, doctorData) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctorData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to add doctor');
  }
  return await res.json();
}

export async function updateDoctorProfile(clinicCode, doctorId, doctorData) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/doctors/${doctorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doctorData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update doctor profile');
  }
  return await res.json();
}

export async function toggleDoctorActiveStatus(clinicCode, doctorId, isActive) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/doctors/${doctorId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ is_active: isActive })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to change doctor status');
  }
  return await res.json();
}

export async function fetchDoctorsOnDuty(day) {
  const url = day ? `${API_BASE_URL}/clinics/on-duty?day=${encodeURIComponent(day)}` : `${API_BASE_URL}/clinics/on-duty`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch on-duty doctors');
  return await res.json();
}

export async function fetchAllDoctors() {
  const res = await fetch(`${API_BASE_URL}/clinics/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors roster');
  return await res.json();
}

export async function fetchDoctorById(doctorId) {
  const res = await fetch(`${API_BASE_URL}/clinics/doctors/${doctorId}`);
  if (!res.ok) throw new Error('Failed to fetch doctor profile');
  const json = await res.json();
  return json.data;
}

export async function fetchDepartments() {
  const res = await fetch(`${API_BASE_URL}/clinics/departments`);
  if (!res.ok) throw new Error('Failed to fetch departments roster');
  return await res.json();
}

export async function addDoctorLeave(clinicCode, doctorId, leavePayload) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/doctors/${doctorId}/leaves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leavePayload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit leave request');
  }
  return await res.json();
}

export async function cancelDoctorLeave(clinicCode, doctorId, leaveId) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/doctors/${doctorId}/leaves/${leaveId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to cancel leave');
  }
  return await res.json();
}

export async function fetchDoctorAppointments(doctorName) {
  const url = doctorName 
    ? `${API_BASE_URL}/appointments?doctor_name=${encodeURIComponent(doctorName)}`
    : `${API_BASE_URL}/appointments`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch doctor appointments');
  return await res.json();
}

export async function fetchScheduleConfig(clinicCode = 'CARE-IND-01') {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/schedule-config`);
  if (!res.ok) throw new Error('Failed to fetch schedule config');
  const json = await res.json();
  return json.data;
}

export async function saveScheduleConfig(clinicCode = 'CARE-IND-01', config) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/schedule-config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to save config');
  return await res.json();
}

export async function blockClinicSlot(clinicCode = 'CARE-IND-01', blockData) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/block-slot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blockData)
  });
  if (!res.ok) throw new Error('Failed to block slot');
  return await res.json();
}

export async function unblockClinicSlot(clinicCode = 'CARE-IND-01', payload) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/unblock-slot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to unblock slot');
  return await res.json();
}

export async function rescheduleAppointment(referenceId, newDate, newTime, doctorName = null) {
  const res = await fetch(`${API_BASE_URL}/appointments/${referenceId}/reschedule`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      preferred_date: newDate,
      preferred_time: newTime,
      doctor_name: doctorName
    })
  });
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.detail || 'Failed to reschedule appointment');
  }
  return await res.json();
}

export async function fetchAllAppointments() {
  const res = await fetch(`${API_BASE_URL}/appointments`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return await res.json();
}

export async function fetchAICallActivity() {
  const res = await fetch(`${API_BASE_URL}/voice/activity`);
  if (!res.ok) throw new Error('Failed to fetch voice activity');
  const json = await res.json();
  return json.data;
}

export async function resolveCallFollowup(callId, notes = '') {
  const res = await fetch(`${API_BASE_URL}/voice/activity/${callId}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes })
  });
  if (!res.ok) throw new Error('Failed to resolve follow-up');
  return await res.json();
}

export async function retryCall(callId) {
  const res = await fetch(`${API_BASE_URL}/voice/activity/${callId}/retry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to retry call');
  }
  return await res.json();
}

export async function updateCallbackStatus(callbackId, status = 'RESOLVED', notes = '') {
  const res = await fetch(`${API_BASE_URL}/enquiries/callbacks/${callbackId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update callback status');
  }
  return await res.json();
}

export async function fetchClinicSettings(clinicCode = 'CARE-IND-01') {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/settings`);
  if (!res.ok) throw new Error('Failed to fetch clinic settings');
  const json = await res.json();
  return json.data;
}

export async function updateClinicSettings(clinicCode = 'CARE-IND-01', settingsData) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  if (!res.ok) throw new Error('Failed to update clinic settings');
  return await res.json();
}

export async function fetchClinicStaff(clinicCode = 'CARE-IND-01') {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/staff`);
  if (!res.ok) throw new Error('Failed to fetch staff');
  const json = await res.json();
  return json.data;
}

export async function addClinicStaff(clinicCode = 'CARE-IND-01', staffData) {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData)
  });
  if (!res.ok) throw new Error('Failed to add clinic staff member');
  return await res.json();
}

export async function fetchAuditLogs(clinicCode = 'CARE-IND-01') {
  const res = await fetch(`${API_BASE_URL}/clinics/${clinicCode}/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  const json = await res.json();
  return json.data;
}

// ── Reports & Follow-ups (Module 7) ──
import { INITIAL_REPORTS, INITIAL_FOLLOWUPS } from '../data/reportsMockData';

export async function fetchReports() {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    return await res.json();
  } catch (err) {
    console.warn('Reports backend offline, using mock data fallback:', err);
    return INITIAL_REPORTS;
  }
}

export async function fetchReportsSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/summary`);
    if (!res.ok) throw new Error('Failed to fetch reports summary');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Reports summary backend offline, using mock calculation:', err);
    return {
      awaiting_verification: INITIAL_REPORTS.filter(r => r.verification_status === 'Awaiting Verification').length,
      ready_to_notify: INITIAL_REPORTS.filter(r => r.verification_status === 'Ready to Notify').length,
      notification_pending: INITIAL_REPORTS.filter(r => r.notification_status === 'Pending').length,
      followup_required: INITIAL_REPORTS.filter(r => ['Follow-up Required', 'No Answer', 'Call Failed'].includes(r.notification_status)).length
    };
  }
}

export async function uploadReport(reportData) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    if (!res.ok) throw new Error('Failed to upload report');
    return await res.json();
  } catch (err) {
    console.warn('Upload report local simulation:', err);
    return {
      success: true,
      data: {
        ...reportData,
        id: `RPT-${Math.floor(1000 + Math.random() * 9000)}`,
        uploaded_date: reportData.uploaded_date || new Date().toISOString().split('T')[0],
        uploaded_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        verification_status: 'Awaiting Verification',
        notification_status: 'Not Started',
        timeline: [
          { step: 'Report Uploaded', timestamp: 'Just Now', actor: reportData.uploaded_by || 'Admin', done: true },
          { step: 'Physician Verification', timestamp: 'Pending', actor: 'Attending Doctor', done: false },
          { step: 'Ready to Notify', timestamp: 'Pending', actor: 'Clinical Desk', done: false },
          { step: 'Patient Notification', timestamp: 'Scheduled Phase 4', actor: 'Priya AI Voice', done: false }
        ]
      },
      message: 'Report uploaded successfully (simulated).'
    };
  }
}

export async function updateReportStatus(reportId, updateData) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error('Failed to update report status');
    return await res.json();
  } catch (err) {
    console.warn('Update report status fallback:', err);
    return { success: true, message: `Report ${reportId} status updated locally.` };
  }
}

export async function fetchFollowups() {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/followups`);
    if (!res.ok) throw new Error('Failed to fetch follow-ups');
    return await res.json();
  } catch (err) {
    console.warn('Followups backend offline, using mock data:', err);
    return INITIAL_FOLLOWUPS;
  }
}

export async function resolveFollowup(followupId, notes = '') {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/followups/${followupId}/resolve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    });
    if (!res.ok) throw new Error('Failed to resolve follow-up');
    return await res.json();
  } catch (err) {
    console.warn('Resolve followup fallback:', err);
    return { success: true, message: `Follow-up ${followupId} marked resolved.` };
  }
}

// ==========================================
// 8. PATIENT REGISTRY & CONSENT APIs
// ==========================================

export async function fetchPatients(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.report_status && params.report_status !== 'All') query.append('report_status', params.report_status);
    if (params.consent_status && params.consent_status !== 'All') query.append('consent_status', params.consent_status);
    if (params.gender && params.gender !== 'All') query.append('gender', params.gender);
    if (params.blood_group && params.blood_group !== 'All') query.append('blood_group', params.blood_group);

    const url = `${API_BASE_URL}/patients${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch patients');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Patients API fallback:', err);
    return [
      {
        id: "PAT-1001",
        name: "Rahul Sharma",
        phone: "8897371942",
        masked_phone: "88XXXXXX42",
        email: "rahul.sharma@example.com",
        age: 38,
        gender: "Male",
        blood_group: "O+",
        address: "#142, 4th Cross, 100ft Road, Indiranagar",
        city: "Bengaluru",
        pincode: "560038",
        emergency_contact_name: "Sunita Sharma",
        emergency_contact_phone: "+91 98765 43210",
        emergency_contact_relation: "Spouse",
        report_status: "Ready",
        report_id: "RPT-1001",
        report_type: "Comprehensive Metabolic Panel",
        report_updated_at: "2026-10-29T14:30:00Z",
        communication_consent: {
          status: "Consented",
          channels: ["Voice AI Call", "SMS"],
          consented_at: "2026-10-28T09:30:00Z",
          recorded_by: "Front Desk Reception",
          source: "Digital Intake Form",
          consent_notes: "Patient authorized automated Priya voice calls and SMS alerts for diagnostic updates."
        },
        notification_history: [],
        clinical_notes: "Annual executive health checkup; report analyzed and verified by Dr. Rajesh Sharma."
      },
      {
        id: "PAT-1002",
        name: "Priya Reddy",
        phone: "8897371942",
        masked_phone: "88XXXXXX42",
        email: "priya.reddy@example.com",
        age: 29,
        gender: "Female",
        blood_group: "B+",
        address: "Flat 302, Green Glen Heights, Koramangala 4th Block",
        city: "Bengaluru",
        pincode: "560034",
        emergency_contact_name: "Vikram Reddy",
        emergency_contact_phone: "+91 98450 12345",
        emergency_contact_relation: "Brother",
        report_status: "Processing",
        report_id: "RPT-1002",
        report_type: "Thyroid Profile (T3, T4, TSH)",
        report_updated_at: "2026-10-30T08:15:00Z",
        communication_consent: {
          status: "Consented",
          channels: ["WhatsApp", "Voice AI Call", "SMS"],
          consented_at: "2026-10-29T11:15:00Z",
          recorded_by: "Web Intake",
          source: "Online Verification",
          consent_notes: "Explicit consent captured during online appointment reservation."
        },
        notification_history: [],
        clinical_notes: "Sample collected at Apollo Clinic lab; automated biochemical assay currently in progress."
      },
      {
        id: "PAT-1003",
        name: "Arjun Kumar",
        phone: "8897371942",
        masked_phone: "88XXXXXX42",
        email: "arjun.kumar@example.com",
        age: 45,
        gender: "Male",
        blood_group: "A+",
        address: "Villa 12, Sobha Primrose, HSR Layout Sector 2",
        city: "Bengaluru",
        pincode: "560102",
        emergency_contact_name: "Meera Kumar",
        emergency_contact_phone: "+91 97312 34567",
        emergency_contact_relation: "Spouse",
        report_status: "Ready",
        report_id: "RPT-1003",
        report_type: "HbA1c & Fasting Lipid Profile",
        report_updated_at: "2026-10-29T16:45:00Z",
        communication_consent: {
          status: "Consented",
          channels: ["Voice AI Call", "SMS"],
          consented_at: "2026-10-27T14:20:00Z",
          recorded_by: "Front Desk Reception",
          source: "Verbal Consent at Intake",
          consent_notes: "Patient confirmed primary phone number for outbound voice notifications."
        },
        notification_history: [],
        clinical_notes: "Diabetic profile review. Dr. Sneha Kulkarni cleared the report for patient delivery."
      }
    ];
  }
}

export async function fetchPatientMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/metrics`);
    if (!res.ok) throw new Error('Failed to fetch patient metrics');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Patient metrics API fallback:', err);
    return {
      total_patients: 5,
      reports_ready: 3,
      reports_processing: 2,
      consented_count: 4,
      pending_consent_count: 1
    };
  }
}

export async function fetchPatientById(patientId) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch patient ${patientId}`);
  const json = await res.json();
  return json.data;
}

export async function fetchPatientAppointments(patientId) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/appointments`);
    if (!res.ok) throw new Error('Failed to fetch patient appointments');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn(`Appointments fetch failed for ${patientId}:`, err);
    return [];
  }
}

export async function fetchPatientReports(patientId) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/reports`);
    if (!res.ok) throw new Error('Failed to fetch patient diagnostic reports');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn(`Reports fetch failed for ${patientId}:`, err);
    return [];
  }
}

export async function checkPhoneRegistered(phone) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/check-phone/${encodeURIComponent(phone)}`);
    if (!res.ok) throw new Error('Failed to check phone');
    return await res.json();
  } catch (err) {
    console.warn('Check phone fallback:', err);
    return { registered: false, patient: null };
  }
}

export async function createPatient(data) {
  const res = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create patient');
  }
  return await res.json();
}

export async function updatePatient(patientId, data) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update patient');
  }
  return await res.json();
}

export async function recordPatientConsent(patientId, consentData) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/consent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consentData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to record consent');
  }
  return await res.json();
}

export async function notifyPatient(patientId, payload = {}) {
  const res = await fetch(`${API_BASE_URL}/patients/${patientId}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to notify patient');
  }
  return await res.json();
}

// ==========================================
// 9. DIAGNOSTIC REPORTS & AUTOMATIC SARVAM AI CALL APIs
// ==========================================

export async function fetchDiagnosticReports(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.report_type && params.report_type !== 'All') query.append('report_type', params.report_type);

    const url = `${API_BASE_URL}/diagnostic-reports${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch diagnostic reports');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Diagnostic reports API fallback:', err);
    return [
      {
        id: "RPT-2001",
        patient_id: "PAT-1001",
        patient_name: "Rahul Sharma",
        patient_phone: "8897371942",
        masked_phone: "88XXXXXX42",
        report_type: "Blood Test",
        uploaded_date: "Oct 30",
        status: "Ready",
        file_name: "Rahul_Sharma_CBC_Report.pdf",
        file_size: "1.4 MB",
        communication_consent: { status: "Consented", channels: ["Voice AI Call", "SMS"], verified: true },
        sarvam_call: null
      },
      {
        id: "RPT-2002",
        patient_id: "PAT-1002",
        patient_name: "Priya Reddy",
        patient_phone: "8897371942",
        masked_phone: "88XXXXXX42",
        report_type: "MRI",
        uploaded_date: "Oct 30",
        status: "Processing",
        file_name: "Priya_Reddy_Lumbar_MRI.pdf",
        file_size: "4.8 MB",
        communication_consent: { status: "Consented", channels: ["Voice AI Call", "SMS", "WhatsApp"], verified: true },
        sarvam_call: null
      },
      {
        id: "RPT-2003",
        patient_id: "PAT-1003",
        patient_name: "Arjun Kumar",
        patient_phone: "8897371942",
        masked_phone: "88XXXXXX42",
        report_type: "X-Ray",
        uploaded_date: "Oct 30",
        status: "Ready",
        file_name: "Arjun_Kumar_Chest_XRay.pdf",
        file_size: "2.1 MB",
        communication_consent: { status: "Consented", channels: ["Voice AI Call", "SMS"], verified: true },
        sarvam_call: null
      }
    ];
  }
}

export async function fetchDiagnosticReportMetrics() {
  try {
    const res = await fetch(`${API_BASE_URL}/diagnostic-reports/metrics`);
    if (!res.ok) throw new Error('Failed to fetch diagnostic report metrics');
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Diagnostic metrics fallback:', err);
    return {
      total_reports: 3,
      ready_count: 2,
      processing_count: 1,
      calls_dispatched: 0,
      calls_completed: 0,
      calls_failed: 0,
      calls_blocked_consent: 0,
      ready_to_dispatch_count: 2
    };
  }
}

export async function fetchDiagnosticReportById(reportId) {
  const res = await fetch(`${API_BASE_URL}/diagnostic-reports/${reportId}`);
  if (!res.ok) throw new Error(`Failed to fetch report ${reportId}`);
  const json = await res.json();
  return json.data;
}

export async function uploadDiagnosticReport(data) {
  const res = await fetch(`${API_BASE_URL}/diagnostic-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload diagnostic report');
  }
  return await res.json();
}

export async function updateDiagnosticReportStatus(reportId, data) {
  const res = await fetch(`${API_BASE_URL}/diagnostic-reports/${reportId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update report status');
  }
  return await res.json();
}

// ── SARVAM VOICE AGENTS INTEGRATION (PRIYA) ──

export async function notifyDiagnosticReport(reportId) {
  const res = await fetch(`${API_BASE_URL}/diagnostic-reports/${reportId}/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to dispatch Sarvam voice call');
  }
  return await res.json();
}

export async function fetchSarvamCalls(limit = 50) {
  try {
    const res = await fetch(`${API_BASE_URL}/sarvam/calls?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch Sarvam calls');
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.warn('Sarvam calls fallback:', err);
    return [];
  }
}

export async function fetchSarvamCallDetail(attemptId) {
  const res = await fetch(`${API_BASE_URL}/sarvam/calls/${attemptId}`);
  if (!res.ok) throw new Error(`Call attempt ${attemptId} not found`);
  const json = await res.json();
  return json.data;
}

export async function fetchSarvamHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/sarvam/health`);
    if (!res.ok) throw new Error('Sarvam health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Sarvam health fallback:', err);
    return { status: 'offline', provider: 'Sarvam AI Voice Agents' };
  }
}


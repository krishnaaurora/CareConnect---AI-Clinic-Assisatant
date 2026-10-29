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

export async function resolveCallFollowup(callId) {
  const res = await fetch(`${API_BASE_URL}/voice/activity/${callId}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('Failed to resolve follow-up');
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

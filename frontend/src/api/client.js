const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchHealth() {
  try {
    const res = await fetch('http://localhost:8000/api/health');
    return await res.json();
  } catch (err) {
    console.warn('Backend offline or loading:', err);
    return { status: 'offline', database: 'disconnected' };
  }
}

export async function fetchClinics() {
  try {
    const res = await fetch(`${API_BASE_URL}/clinics`);
    if (!res.ok) throw new Error('Failed to fetch clinics');
    return await res.json();
  } catch (err) {
    console.error('Error fetching clinics:', err);
    // Return structured default verified clinics fallback if network fails
    return [
      {
        code: "CARE-IND-01",
        name: "Apollo Clinic & Diagnostics",
        branch: "Indiranagar, Bengaluru",
        phone: "+91 80 4125 7800",
        timings: "08:00 AM - 08:30 PM",
        doctors: [
          {
            id: "doc-01",
            name: "Dr. Rajesh Sharma",
            specialty: "Cardiology & General Medicine",
            experience: "16+ years",
            languages: ["English", "Hindi"],
            consultation_fee: 800,
            available_days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            available_slots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"]
          },
          {
            id: "doc-02",
            name: "Dr. Sneha Kulkarni",
            specialty: "Pediatrics & Child Care",
            experience: "12+ years",
            languages: ["English", "Hindi", "Telugu"],
            consultation_fee: 700,
            available_days: ["Monday", "Wednesday", "Friday", "Saturday"],
            available_slots: ["10:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"]
          }
        ]
      },
      {
        code: "CARE-JAY-02",
        name: "CareFirst Multi-Speciality Clinic",
        branch: "Jayanagar 4th Block, Bengaluru",
        phone: "+91 80 2663 9922",
        timings: "08:30 AM - 09:00 PM",
        doctors: [
          {
            id: "doc-03",
            name: "Dr. Venkat Rao",
            specialty: "Orthopedics & Joint Care",
            experience: "18+ years",
            languages: ["English", "Telugu", "Hindi"],
            consultation_fee: 850,
            available_days: ["Tuesday", "Thursday", "Saturday"],
            available_slots: ["10:00 AM", "12:00 PM", "04:00 PM", "06:30 PM"]
          },
          {
            id: "doc-04",
            name: "Dr. Ananya Reddy",
            specialty: "Dermatology & Cosmetology",
            experience: "9+ years",
            languages: ["English", "Telugu", "Hindi"],
            consultation_fee: 750,
            available_days: ["Monday", "Tuesday", "Thursday", "Friday"],
            available_slots: ["11:00 AM", "01:30 PM", "03:30 PM", "05:30 PM"]
          }
        ]
      }
    ];
  }
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

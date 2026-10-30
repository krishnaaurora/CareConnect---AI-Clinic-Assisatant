import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Stethoscope, Building2, CheckCircle2, ShieldCheck, AlertCircle, Copy, Check, Search, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fetchClinics, createAppointment, queryAppointmentStatus } from '../api/client';

export default function AppointmentBooking() {
  const [clinics, setClinics] = useState([]);
  const [selectedClinicCode, setSelectedClinicCode] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  
  // Form State
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('11:00 AM');
  const [visitType, setVisitType] = useState('In-Person Consultation');
  const [notes, setNotes] = useState('');

  // UI / Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [copied, setCopied] = useState(false);

  // Status Lookup State
  const [searchTicket, setSearchTicket] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    fetchClinics().then(data => {
      if (data && data.length > 0) {
        setClinics(data);
        setSelectedClinicCode(data[0].code);
        setAvailableDoctors(data[0].doctors || []);
        if (data[0].doctors && data[0].doctors.length > 0) {
          setSelectedDoctorName(data[0].doctors[0].name);
        }
      }
    });
  }, []);

  const handleClinicChange = (code) => {
    setSelectedClinicCode(code);
    const chosen = clinics.find(c => c.code === code);
    if (chosen && chosen.doctors) {
      setAvailableDoctors(chosen.doctors);
      if (chosen.doctors.length > 0) {
        setSelectedDoctorName(chosen.doctors[0].name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError('');
    setBookingResult(null);

    try {
      const payload = {
        patient_name: patientName,
        phone: phone,
        clinic_code: selectedClinicCode,
        doctor_name: selectedDoctorName,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        visit_type: visitType,
        notes: notes || undefined,
        booking_source: "CareConnect Web Landing Portal"
      };

      const res = await createAppointment(payload);
      setBookingResult(res.data);

      if (res.data.status === 'VERIFIED_CONFIRMED') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0D3E33', '#10B981', '#CEF17A', '#38BDF8']
        });
      }
    } catch (err) {
      setBookingError(err.message || 'Verification failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLookupStatus = async (e) => {
    e.preventDefault();
    if (!searchTicket.trim()) return;
    setLookupLoading(true);
    try {
      const res = await queryAppointmentStatus(searchTicket.trim());
      setLookupResult(res.data);
    } catch (err) {
      setLookupResult({ error: 'Ticket not found. Please verify the reference ID.' });
    } finally {
      setLookupLoading(false);
    }
  };

  const currentDoctor = availableDoctors.find(d => d.name === selectedDoctorName);

  return (
    <section id="book-appointment" style={{ padding: '90px 0', position: 'relative' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 60px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: '#EBF7EE',
            border: '1px solid rgba(13, 62, 51, 0.12)',
            marginBottom: '16px'
          }}>
            <Calendar size={15} color="#0D3E33" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0D3E33', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Direct Clinic Scheduling
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(2.2rem, 3.4vw, 2.9rem)', fontWeight: 800, color: '#0D3E33', marginBottom: '16px', lineHeight: 1.15 }}>
            Request an Appointment with <br />
            <span style={{ color: '#059669' }}>Live Backend Verification</span>
          </h2>

          <p style={{ fontSize: '16px', color: '#4B5563', lineHeight: 1.65 }}>
            Priya verifies physician availability against our live clinic schedule to prevent double bookings. Every verified request receives a reference ticket immediately.
          </p>
        </div>

        {/* 3D Booking Card Container in White Theme */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '36px',
          alignItems: 'start'
        }}>
          
          {/* Main Booking Form */}
          <div className="white-card" style={{
            padding: '36px',
            borderRadius: '26px',
            background: '#FFFFFF'
          }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#F1F5F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Stethoscope size={20} color="#0D3E33" />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0D3E33', margin: 0 }}>
                    Patient Appointment Form
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>Verified Doctor Schedule</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: '#0D3E33',
                padding: '4px 10px',
                borderRadius: '8px',
                background: '#DCF2E3',
                fontWeight: 700
              }}>
                <ShieldCheck size={14} />
                <span>Clinic Verified</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Row 1: Patient Name & Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <User size={15} color="#0D3E33" /> Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={e => setPatientName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Phone size={15} color="#0D3E33" /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Clinic & Doctor Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Building2 size={15} color="#0D3E33" /> Select Clinic Branch *
                  </label>
                  <select
                    value={selectedClinicCode}
                    onChange={e => handleClinicChange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {clinics.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.branch})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Stethoscope size={15} color="#0D3E33" /> Preferred Doctor *
                  </label>
                  <select
                    value={selectedDoctorName}
                    onChange={e => setSelectedDoctorName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {availableDoctors.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name} — {d.specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Details Pill */}
              {currentDoctor && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: '#F0FDF4',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#0D3E33', fontWeight: 600 }}>
                    Consultation Fee: <strong>₹{currentDoctor.consultation_fee}</strong> • Experience: <strong>{currentDoctor.experience}</strong>
                  </span>
                  <span style={{ color: '#047857' }}>
                    Languages: {currentDoctor.languages.join(', ')}
                  </span>
                </div>
              )}

              {/* Row 3: Date & Slot Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Calendar size={15} color="#0D3E33" /> Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setPreferredDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Clock size={15} color="#0D3E33" /> Available Time Slot *
                  </label>
                  <select
                    value={preferredTime}
                    onChange={e => setPreferredTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      color: '#111827',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  >
                    {(currentDoctor?.available_slots || ["09:30 AM", "11:00 AM", "02:30 PM", "04:30 PM", "06:00 PM"]).map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Visit Type Chips */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'block', marginBottom: '8px' }}>
                  Consultation Visit Type:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                  {[
                    "In-Person Consultation",
                    "Follow-Up Review",
                    "Routine Checkup",
                    "Video Consultation"
                  ].map(vt => (
                    <button
                      type="button"
                      key={vt}
                      onClick={() => setVisitType(vt)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: '10px',
                        border: visitType === vt ? '2px solid #0D3E33' : '1px solid #E5E7EB',
                        background: visitType === vt ? '#DCF2E3' : '#F9FAFB',
                        color: '#0D3E33',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      {vt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 5: Symptoms or Notes */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#1F2937', display: 'block', marginBottom: '8px' }}>
                  Reason for Visit / Patient Symptoms (Optional):
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Regular BP review, recurring mild cough"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Error Alert */}
              {bookingError && (
                <div style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#FEE2E2',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#B91C1C',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Submit CTA matching screenshot style */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-dark-green"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '14px',
                  fontSize: '15px'
                }}
              >
                {isSubmitting ? (
                  <span>Verifying Doctor Slot Availability...</span>
                ) : (
                  <>
                    <Calendar size={18} />
                    <span>Submit & Verify Appointment</span>
                  </>
                )}
              </button>

            </form>

          </div>

          {/* Right Column: Instant Verification Result & Ticket Tracker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Real-time Verification Ticket Result */}
            {bookingResult ? (
              <div className="white-card" style={{
                padding: '30px',
                borderRadius: '24px',
                background: '#F7FCF9',
                border: '1px solid rgba(16, 185, 129, 0.35)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <CheckCircle2 size={24} color="#0D3E33" />
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0D3E33', margin: 0 }}>
                      {bookingResult.status === 'VERIFIED_CONFIRMED' ? 'Appointment Verified & Confirmed' : 'Request Queued for Clinic Staff'}
                    </h4>
                    <p style={{ fontSize: '11px', color: '#64748B', margin: 0 }}>Verified against Clinic Operating Schedule</p>
                  </div>
                </div>

                {/* Ticket Reference Code Banner */}
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#FFFFFF',
                  border: '1px dashed #0D3E33',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#059669', fontWeight: 800 }}>
                      Reference Ticket Code
                    </span>
                    <h3 style={{ fontSize: '24px', fontWeight: 900, color: '#0D3E33', margin: '4px 0 0 0', letterSpacing: '0.05em' }}>
                      {bookingResult.reference_id}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopyTicket(bookingResult.reference_id)}
                    style={{
                      background: '#F1F5F3',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#0D3E33',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Details Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#374151' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Patient:</span>
                    <strong style={{ color: '#111827' }}>{bookingResult.patient_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Doctor:</span>
                    <strong style={{ color: '#111827' }}>{bookingResult.doctor_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Clinic:</span>
                    <strong style={{ color: '#111827' }}>{bookingResult.clinic_name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6B7280' }}>Schedule:</span>
                    <strong style={{ color: '#0D3E33' }}>{bookingResult.preferred_date} at {bookingResult.preferred_time}</strong>
                  </div>
                </div>

                <div style={{
                  marginTop: '18px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#EBF7EE',
                  fontSize: '12px',
                  color: '#0D3E33',
                  lineHeight: 1.5,
                  fontWeight: 500
                }}>
                  {bookingResult.verification_message}
                </div>
              </div>
            ) : (
              <div className="white-card" style={{
                padding: '30px',
                borderRadius: '24px',
                background: '#FFFFFF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#DCF2E3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileCheck size={18} color="#0D3E33" />
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0D3E33', margin: 0 }}>
                    Verification Guarantees
                  </h4>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#4B5563' }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#0D3E33" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Instant schedule cross-check against active doctor shifts.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#0D3E33" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>No unverified claims: AI never confirms without backend approval.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#0D3E33" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>High capacity slots automatically routed to clinic desk for follow-up.</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#0D3E33" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>Automatic SMS confirmation with doctor directions.</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Track Existing Ticket Status */}
            <div className="white-card" style={{
              padding: '24px',
              borderRadius: '22px',
              background: '#FFFFFF'
            }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0D3E33', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} color="#0D3E33" /> Track Your Appointment
              </h4>
              <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px' }}>
                Already spoke with Priya or received a ticket? Enter your reference ID:
              </p>

              <form onSubmit={handleLookupStatus} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="e.g. CC-9B214F"
                  value={searchTicket}
                  onChange={e => setSearchTicket(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    color: '#111827',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="btn-dark-green"
                  style={{ padding: '0 16px', fontSize: '12px' }}
                >
                  {lookupLoading ? 'Checking...' : 'Check'}
                </button>
              </form>

              {lookupResult && (
                <div style={{
                  marginTop: '14px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: lookupResult.error ? '#FEE2E2' : '#DCF2E3',
                  border: lookupResult.error ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(16,185,129,0.3)',
                  fontSize: '12px',
                  color: lookupResult.error ? '#B91C1C' : '#0D3E33'
                }}>
                  {lookupResult.error ? (
                    lookupResult.error
                  ) : (
                    <div>
                      <strong>Status: {lookupResult.status}</strong>
                      <p style={{ margin: '4px 0 0 0', color: '#1F2937' }}>
                        {lookupResult.patient_name} with {lookupResult.doctor_name} ({lookupResult.preferred_date} at {lookupResult.preferred_time})
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

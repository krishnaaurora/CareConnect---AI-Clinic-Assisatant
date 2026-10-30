import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Bot, 
  Globe, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Save, 
  Plus, 
  Eye, 
  X, 
  Layers,
  Sparkles,
  Shield,
  Activity,
  UserPlus
} from 'lucide-react';
import { 
  fetchClinicSettings, 
  updateClinicSettings, 
  fetchClinicStaff, 
  addClinicStaff,
  fetchAuditLogs 
} from '../api/client';
import BackgroundPattern from './common/BackgroundPattern';

const ALL_LANGUAGES = ['English', 'Hindi', 'Telugu', 'Kannada', 'Tamil', 'Malayalam', 'Bengali'];

const ROLES = [
  'Super Admin',
  'Clinic Administrator',
  'Doctor / Physician',
  'Receptionist / Front Desk'
];

export default function ClinicSettingsSecurity() {
  const [activeSection, setActiveSection] = useState('general'); // 'general' | 'ai' | 'staff' | 'audit'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // General Clinic State
  const [clinicName, setClinicName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [timings, setTimings] = useState('');
  const [emergencyOpd, setEmergencyOpd] = useState(true);

  // AI Voice & Languages State
  const [aiAgentName, setAiAgentName] = useState('Priya');
  const [aiGreeting, setAiGreeting] = useState('');
  const [supportedLanguages, setSupportedLanguages] = useState(['English', 'Hindi', 'Telugu']);
  const [speechSpeed, setSpeechSpeed] = useState('Normal (1.0x)');

  // Staff & Permissions State
  const [staffList, setStaffList] = useState([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Receptionist / Front Desk');
  const [newStaffDept, setNewStaffDept] = useState('Front Office');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState('ALL');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [settings, staff, logs] = await Promise.all([
        fetchClinicSettings(),
        fetchClinicStaff(),
        fetchAuditLogs()
      ]);

      if (settings) {
        setClinicName(settings.name || 'Apollo Clinic & Diagnostics');
        setBranchAddress(settings.branch || '100ft Road, Indiranagar, Bengaluru');
        setPhone(settings.phone || '+91 80 4125 7800');
        setEmail(settings.email || 'support@careconnect.ai');
        setEmergencyPhone(settings.emergency_phone || '+91 80 4125 7899');
        setTimings(settings.timings || '08:00 AM - 08:30 PM (Mon-Sat)');
        setEmergencyOpd(settings.emergency_opd !== false);
        setAiAgentName(settings.ai_agent_name || 'Priya');
        setAiGreeting(settings.ai_greeting || '');
        setSupportedLanguages(settings.supported_languages || ['English', 'Hindi', 'Telugu']);
        setSpeechSpeed(settings.speech_speed || 'Normal (1.0x)');
      }

      setStaffList(staff || []);
      setAuditLogs(logs || []);
    } catch (err) {
      console.error('Failed to load clinic settings & security:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save General & AI Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: clinicName,
      branch: branchAddress,
      phone,
      email,
      emergency_phone: emergencyPhone,
      timings,
      emergency_opd: emergencyOpd,
      ai_agent_name: aiAgentName,
      ai_greeting: aiGreeting,
      supported_languages: supportedLanguages,
      speech_speed: speechSpeed
    };

    try {
      await updateClinicSettings('CARE-IND-01', payload);
      showNotification('Clinic settings & AI voice configuration updated successfully!');
      const updatedLogs = await fetchAuditLogs('CARE-IND-01');
      if (updatedLogs) setAuditLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle Language Checkbox
  const toggleLanguage = (lang) => {
    setSupportedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  // Add Staff Member
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    const newStaff = {
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      department: newStaffDept,
      status: 'Active',
      last_active: 'Just Now'
    };

    try {
      const res = await addClinicStaff('CARE-IND-01', newStaff);
      setStaffList(prev => [res.data || newStaff, ...prev]);
      showNotification(`Staff user ${newStaff.name} created with ${newStaff.role} role.`);
      setIsAddStaffOpen(false);
      setNewStaffName('');
      setNewStaffEmail('');
      const updatedLogs = await fetchAuditLogs('CARE-IND-01');
      if (updatedLogs) setAuditLogs(updatedLogs);
    } catch (err) {
      console.error('Failed to add staff member:', err);
      showNotification('Failed to create staff member.');
    }
  };

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(l => {
    if (auditFilter === 'ALL') return true;
    return l.action === auditFilter;
  });

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', position: 'relative' }}>
      <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.07)" glow />
      <div style={{ position: 'relative', zIndex: 1 }}>

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

      {/* Header */}


      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '28px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'general', label: 'Clinic Details & Operating Hours' },
          { id: 'ai', label: 'AI Voice Greeting & Languages' },
          { id: 'staff', label: 'Staff Roles & Permissions' },
          { id: 'audit', label: 'Security Audit Log' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeSection === tab.id ? '3px solid #00C9A7' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeSection === tab.id ? '#0A2520' : '#64748B',
              fontWeight: activeSection === tab.id ? 800 : 600,
              fontSize: '14px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── SECTION 1: CLINIC DETAILS & OPENING HOURS ── */}
      {activeSection === 'general' && (
        <form onSubmit={handleSaveSettings} style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid rgba(15, 91, 76, 0.1)',
          boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0A2520', margin: '0 0 4px' }}>
              Facility Profile & Address
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Physical clinic contact details announced by Priya Voice AI to prospective patients.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Clinic Legal Name
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={e => setClinicName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  color: '#0A2520',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Primary Telephone Line
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Full Physical Address
            </label>
            <input
              type="text"
              required
              value={branchAddress}
              onChange={e => setBranchAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13.5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Support / Enquiries Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                24/7 Emergency Line
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Standard Clinic Opening Hours
              </label>
              <input
                type="text"
                required
                value={timings}
                onChange={e => setTimings(e.target.value)}
                placeholder="08:00 AM - 08:30 PM (Monday - Saturday)"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
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
                  checked={emergencyOpd}
                  onChange={e => setEmergencyOpd(e.target.checked)}
                  style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                />
                <span>Emergency OPD Active</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '10px',
                backgroundColor: '#0F5B4C',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Clinic Details'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── SECTION 2: AI VOICE GREETING & SUPPORTED LANGUAGES ── */}
      {activeSection === 'ai' && (
        <form onSubmit={handleSaveSettings} style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid rgba(15, 91, 76, 0.1)',
          boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0A2520', margin: '0 0 4px' }}>
              Priya Voice AI Persona & Multilingual Configuration
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Customize the verbal greeting, detected languages, and real-time safety guardrails across telephony callers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                AI Receptionist Persona Name
              </label>
              <input
                type="text"
                required
                value={aiAgentName}
                onChange={e => setAiAgentName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Speech Pace & Tone
              </label>
              <select
                value={speechSpeed}
                onChange={e => setSpeechSpeed(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13.5px',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box'
                }}
              >
                <option value="Slow & Reassuring (0.9x)">Slow & Reassuring (0.9x)</option>
                <option value="Normal (1.0x)">Normal (1.0x)</option>
                <option value="Concise & Fast (1.1x)">Concise & Fast (1.1x)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Verbal Call Greeting (Played when patient phones clinic)
            </label>
            <textarea
              rows={3}
              required
              value={aiGreeting}
              onChange={e => setAiGreeting(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '13.5px',
                color: '#0A2520',
                lineHeight: 1.5,
                fontFamily: 'Inter, sans-serif',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Supported Languages Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
              Supported Telephony Languages (Multilingual Speech Recognition)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {ALL_LANGUAGES.map(lang => {
                const isSelected = supportedLanguages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#DCFAF3' : '#F1F5F9',
                      color: isSelected ? '#0F5B4C' : '#64748B',
                      border: isSelected ? '1px solid #00C9A7' : '1px solid #E2E8F0',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected && <Check size={14} color="#00C9A7" strokeWidth={3} />}
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guardrails Preview */}
          <div style={{ backgroundColor: '#FAF8F5', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Shield size={16} color="#0F5B4C" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0A2520' }}>
                Safety Guardrail Escalation Protocol: ENABLED
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
              Callers reporting acute symptoms (*chest pain, breathless, stroke*) or asking for unprescribed drugs are automatically prevented from receiving synthetic medical advice and escalated to human emergency lines.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '10px',
                backgroundColor: '#0F5B4C',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(15, 91, 76, 0.25)'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save AI Configuration'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ── SECTION 3: SECURE STAFF LOGIN & ROLE-BASED ACCESS (RBAC) ── */}
      {activeSection === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid rgba(15, 91, 76, 0.1)',
            boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0A2520', margin: '0 0 4px' }}>
                  Staff Credentials & Authorized Operators
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Role-based permissions governing who can modify schedules, manage waitlists, and adjust clinic settings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddStaffOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#0F5B4C',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <UserPlus size={15} />
                <span>Add Staff User</span>
              </button>
            </div>

            {/* Staff Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '11.5px' }}>
                    <th style={{ padding: '12px 16px' }}>Staff Name</th>
                    <th style={{ padding: '12px 16px' }}>Email / Login</th>
                    <th style={{ padding: '12px 16px' }}>Role</th>
                    <th style={{ padding: '12px 16px' }}>Department</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map(stf => (
                    <tr key={stf.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0A2520' }}>
                        {stf.name}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {stf.email}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: stf.role.includes('Super') ? '#FEF3C7' : stf.role.includes('Doctor') ? '#DCFAF3' : '#F1F5F9',
                          color: stf.role.includes('Super') ? '#B45309' : stf.role.includes('Doctor') ? '#0F5B4C' : '#334155'
                        }}>
                          {stf.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>
                        {stf.department}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0F5B4C' }}>
                          ● {stf.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#94A3B8' }}>
                        {stf.last_active}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role-Based Permissions Matrix */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid rgba(15, 91, 76, 0.1)',
            boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0A2520', margin: '0 0 4px' }}>
              Role-Based Access Permissions Matrix (RBAC)
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px' }}>
              Granular privileges enforced across the clinic management console.
            </p>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#EAF6F3', borderBottom: '1px solid rgba(15, 91, 76, 0.1)', color: '#0F5B4C', fontWeight: 800 }}>
                    <th style={{ padding: '12px 14px' }}>Feature Privilege</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Super Admin</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Clinic Admin</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Physician / Doctor</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Receptionist Desk</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { perm: 'View Clinic Overview & Real-time Roster', s: true, c: true, d: true, r: true },
                    { perm: 'Book / Reschedule / Cancel Appointments', s: true, c: true, d: true, r: true },
                    { perm: 'Block / Reopen Calendar Time Slots', s: true, c: true, d: true, r: false },
                    { perm: 'Add / Edit / Deactivate Doctor Profiles', s: true, c: true, d: false, r: false },
                    { perm: 'Manage Clinic Settings & AI Telephony Voice', s: true, c: true, d: false, r: false },
                    { perm: 'Inspect Security Audit Logs & IP Addresses', s: true, c: true, d: false, r: false },
                    { perm: 'Manage Staff Credentials & User Access', s: true, c: false, d: false, r: false },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0A2520' }}>{row.perm}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{row.s ? <Check size={16} color="#00C9A7" strokeWidth={3} /> : <X size={16} color="#CBD5E1" />}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{row.c ? <Check size={16} color="#00C9A7" strokeWidth={3} /> : <X size={16} color="#CBD5E1" />}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{row.d ? <Check size={16} color="#00C9A7" strokeWidth={3} /> : <X size={16} color="#CBD5E1" />}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{row.r ? <Check size={16} color="#00C9A7" strokeWidth={3} /> : <X size={16} color="#CBD5E1" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ── SECTION 4: AUDIT LOG FOR IMPORTANT BOOKING CHANGES ── */}
      {activeSection === 'audit' && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid rgba(15, 91, 76, 0.1)',
          boxShadow: '0 4px 20px rgba(10, 37, 32, 0.03)',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0A2520', margin: '0 0 4px' }}>
                Immutable Booking & Security Audit Trail
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                Chronological ledger recording all slot modifications, cancellations, staff overrides, and voice AI bookings.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} color="#64748B" />
              <select
                value={auditFilter}
                onChange={e => setAuditFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '12.5px',
                  color: '#0A2520',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">All Event Types</option>
                <option value="APPOINTMENT_CREATED">Appointments Created</option>
                <option value="APPOINTMENT_RESCHEDULED">Appointments Rescheduled</option>
                <option value="APPOINTMENT_CANCELLED">Appointments Cancelled</option>
                <option value="SLOT_BLOCKED">Slots Blocked</option>
                <option value="SETTINGS_UPDATED">Settings Updated</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Operator / Origin</th>
                  <th style={{ padding: '12px 16px' }}>Action Trigger</th>
                  <th style={{ padding: '12px 16px' }}>Target Subject</th>
                  <th style={{ padding: '12px 16px' }}>Change Details</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Gateway</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                      No audit events matching this filter.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontSize: '12px' }}>
                        {log.timestamp}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0A2520' }}>
                        {log.user}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: log.action.includes('CANCEL') ? '#FEE2E2' : log.action.includes('RESCHEDULE') ? '#FEF3C7' : '#DCFAF3',
                          color: log.action.includes('CANCEL') ? '#DC2626' : log.action.includes('RESCHEDULE') ? '#B45309' : '#0F5B4C'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#0F5B4C', fontWeight: 600 }}>
                        {log.target}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12.5px' }}>
                        {log.details}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#94A3B8', fontFamily: 'monospace', fontSize: '11px' }}>
                        {log.ip_address}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD STAFF MEMBER ── */}
      {isAddStaffOpen && (
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
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsAddStaffOpen(false)}
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
                <UserCheck size={20} color="#00C9A7" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#0A2520' }}>
                  Provision Staff Account
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  Assign security role and department privileges.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddStaffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Mahindra"
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
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
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@apolloclinic.com"
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Security Role
                  </label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={newStaffDept}
                    onChange={e => setNewStaffDept(e.target.value)}
                    placeholder="Front Office"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '9px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
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
                    cursor: 'pointer'
                  }}
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Z-Index Wrapper */}
      </div>
    </div>
  );
}


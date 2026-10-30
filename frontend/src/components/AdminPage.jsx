import React, { useState } from 'react';
import careconnectLogoWhite from '../assets/careconnect-logo-white-text.png';
import careconnectLogo from '../assets/careconnect-logo-transparent.png';
import { 
  Building2, 
  ArrowLeft, 
  ShieldCheck, 
  Activity, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Bell, 
  Home,
  LayoutDashboard,
  UserCheck,
  Layers,
  Settings,
  Menu,
  X,
  Radio,
  ChevronRight,
  Shield,
  Users,
  FileText,
  Bot,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import ClinicOverview from './ClinicOverview';
import DoctorManagement from './DoctorManagement';
import PatientRegistry from './PatientRegistry';
import AppointmentManagement from './AppointmentManagement';
import DiagnosticReports from './DiagnosticReports';
import AICallActivity from './AICallActivity';
import ClinicSettingsSecurity from './ClinicSettingsSecurity';
import BackgroundPattern from './common/BackgroundPattern';

export default function AdminPage({ onNavigateHome }) {
  const [adminTab, setAdminTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['dashboard', 'doctors', 'patients', 'appointments', 'diagnostic_reports', 'call_history', 'clinic_settings'].includes(hash)) {
        return hash;
      }
    }
    return 'dashboard';
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      num: '1',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Live'
    },
    {
      id: 'doctors',
      num: '2',
      label: 'Doctors',
      icon: Stethoscope,
      badge: 'Roster'
    },
    {
      id: 'patients',
      num: '3',
      label: 'Patients',
      icon: Users,
      badge: null
    },
    {
      id: 'appointments',
      num: '4',
      label: 'Appointments',
      icon: Calendar,
      badge: null
    },
    {
      id: 'diagnostic_reports',
      num: '5',
      label: 'Diagnostic Reports',
      icon: FileText,
      badge: 'Sarvam AI'
    },
    {
      id: 'call_history',
      num: '6',
      label: 'Call History',
      icon: PhoneCall,
      badge: 'Live Stream'
    },
    {
      id: 'clinic_settings',
      num: '7',
      label: 'Clinic Settings',
      icon: Settings,
      badge: null
    }
  ];

  const currentNav = NAV_ITEMS.find(item => item.id === adminTab) || NAV_ITEMS[0];

  const handleSelectTab = (tabId) => {
    setAdminTab(tabId);
    setMobileNavOpen(false);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/admin#${tabId}`);
    }
  };

  const getTabDescription = (tabId) => {
    switch (tabId) {
      case 'dashboard':
        return 'Real-time operational dashboard: live bookings, waitlist queues, doctor rosters, and schedule verification.';
      case 'doctors':
        return 'Verified physician directory: consult shifts, department rosters, session fees, and active duty management.';
      case 'patients':
        return 'Comprehensive patient registry: demographic records, electronic health details, and multi-channel communication consent.';
      case 'appointments':
        return 'Clinical appointment management: slot verification, conflict prevention, status tracking, and reschedule handling.';
      case 'diagnostic_reports':
        return 'Diagnostic laboratory repository: PDF report uploads and automated Sarvam Voice AI patient telephony alerts.';
      case 'call_history':
        return 'Telephony ledger & Live Transcripts: real-time conversational streaming, call logs, patient sentiment, and AI resolutions.';
      case 'clinic_settings':
        return 'Practice administration: clinic configuration, operating hours, staff role permissions, and immutable audit logs.';
      default:
        return 'Real-time operational dashboard and clinical management console.';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F8FAFC', 
      color: '#0A2520', 
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'row',
      position: 'relative'
    }}>
      
      <style>{`
        @keyframes pulseDotLive {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            z-index: 1000 !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-main-panel {
            width: 100% !important;
            padding-top: 64px !important;
          }
        }
        @media (min-width: 1025px) {
          .admin-mobile-header {
            display: none !important;
          }
          .admin-backdrop {
            display: none !important;
          }
          .admin-sidebar {
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
          }
        }
      `}</style>

      {/* ── Mobile Backdrop Overlay ── */}
      {mobileNavOpen && (
        <div 
          className="admin-backdrop"
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 37, 32, 0.65)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
      )}

      {/* ── Mobile Top Bar ── */}
      <div 
        className="admin-mobile-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: '#0A2520',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 18px',
          zIndex: 900,
        }}
      >
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer'
          }}
          aria-label="Open Navigation Sidebar"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={careconnectLogoWhite}
            alt="CareConnect AI"
            style={{ height: '24px', width: 'auto', display: 'block', objectFit: 'contain' }}
          />
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            color: '#00C9A7',
            backgroundColor: 'rgba(0, 201, 167, 0.15)',
            border: '1px solid rgba(0, 201, 167, 0.3)',
            padding: '2px 7px',
            borderRadius: '6px',
            textTransform: 'uppercase'
          }}>
            Admin
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            border: 'none',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={13} />
          <span>Exit</span>
        </button>
      </div>

      {/* ── Left Sidebar Navigation (Side Nav) ── */}
      <aside 
        className={`admin-sidebar ${mobileNavOpen ? 'open' : ''}`}
        style={{
          width: '280px',
          flexShrink: 0,
          backgroundColor: '#051814',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.18)',
          position: 'relative'
        }}
      >
        {/* Sera UI Background Pattern for Sidebar */}
        <BackgroundPattern variant="plus" dark size={32} />
        {/* Top Part: Branding + Back Button */}
        <div>
          {/* Header Brand */}
          <div style={{ 
            padding: '24px 20px 18px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={careconnectLogoWhite}
                  alt="CareConnect AI"
                  style={{ height: '28px', width: 'auto', display: 'block', objectFit: 'contain' }}
                />
              </div>

              {/* Close button on mobile */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="admin-mobile-close"
                style={{
                  display: mobileNavOpen ? 'flex' : 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Back to Website button */}
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.07)',
                color: '#E2E8F0',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%',
                justifyContent: 'flex-start'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.14)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                e.currentTarget.style.color = '#E2E8F0';
              }}
            >
              <ArrowLeft size={14} color="#00C9A7" />
              <span>Back to Website</span>
            </button>
          </div>

          {/* Navigation Items Section */}
          <div style={{ padding: '20px 14px 10px' }}>
            <div style={{
              fontSize: '10.5px',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.45)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0 10px',
              marginBottom: '10px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Clinic Console Menu
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '14px',
                      border: isActive ? '1px solid rgba(0, 201, 167, 0.3)' : '1px solid transparent',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: '#FFFFFF',
                      backdropFilter: isActive ? 'blur(8px)' : 'none',
                      boxShadow: isActive ? '0 4px 14px rgba(0, 0, 0, 0.2)' : 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      fontFamily: 'Inter, sans-serif',
                      position: 'relative',
                      zIndex: 1
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? 'rgba(0, 201, 167, 0.16)' : 'rgba(255, 255, 255, 0.05)',
                        border: isActive ? '1px solid rgba(0, 201, 167, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: '#00C9A7'
                      }}>
                        <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          color: isActive ? '#00C9A7' : 'rgba(255, 255, 255, 0.45)' 
                        }}>
                          {item.num}.
                        </span>
                        <span style={{
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          letterSpacing: '-0.01em',
                          color: '#FFFFFF',
                          fontWeight: isActive ? 800 : 600
                        }}>
                          {item.label}
                        </span>
                      </div>
                    </div>

                    {item.badge && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 900,
                        backgroundColor: 'rgba(0, 201, 167, 0.14)',
                        color: '#00C9A7',
                        border: '1px solid rgba(0, 201, 167, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Part: Priya Status Card + Quick Info */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)' 
        }}>
          {/* Priya AI Assistant Status */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#00C9A7',
                  boxShadow: '0 0 10px #00C9A7',
                  animation: 'pulseDotLive 2s ease-in-out infinite'
                }} />
              </div>
              <div>
                <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Priya Voice AI
                </div>
                <div style={{ fontSize: '10.5px', color: '#A7F3D0' }}>
                  Live & Autonomous
                </div>
              </div>
            </div>

            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#00C9A7',
              color: '#071F1B',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              ONLINE
            </span>
          </div>

          {/* Access Direct Badge */}
          <div style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.55)',
            textAlign: 'center',
            lineHeight: 1.4,
            padding: '4px 0'
          }}>
            Access: <strong style={{ color: '#E2E8F0' }}>Direct Admin</strong> (No Auth)
          </div>
        </div>
      </aside>

      {/* ── Main Content Panel ── */}
      <div 
        className="admin-main-panel"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: '#F8FAFC'
        }}
      >
        {/* ── Top Header Banner ── */}
        <header style={{
          backgroundColor: '#051814',
          color: '#FFFFFF',
          padding: '22px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Sera UI Pattern for Executive Header */}
          <BackgroundPattern variant="plus" dark size={32} />

          <div style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            position: 'relative',
            zIndex: 1
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#A7F3D0',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>
                <span>Portal Console</span>
                <span>/</span>
                <span style={{ color: '#00C9A7' }}>{currentNav.label}</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(0, 201, 167, 0.15)',
                  border: '1px solid rgba(0, 201, 167, 0.25)',
                  color: '#00C9A7',
                  fontSize: '9.5px',
                  fontWeight: 900
                }}>
                  ACTIVE
                </span>
              </div>

              <h1 style={{ 
                fontSize: 'clamp(1.5rem, 2.5vw, 1.85rem)', 
                fontWeight: 900, 
                margin: '0 0 6px', 
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                letterSpacing: '-0.025em'
              }}>
                {currentNav.label === 'Dashboard' ? 'Clinic Administration Dashboard' : currentNav.label}
              </h1>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
                {getTabDescription(adminTab)}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '12px', 
                color: '#E2E8F0', 
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '7px 14px',
                borderRadius: '10px'
              }}>
                <Calendar size={13} color="#00C9A7" />
                <span>{currentDate}</span>
              </div>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                fontWeight: 800,
                backgroundColor: 'rgba(0, 201, 167, 0.12)',
                border: '1px solid rgba(0, 201, 167, 0.25)',
                padding: '7px 14px',
                borderRadius: '10px',
                color: '#00C9A7'
              }}>
                <Shield size={12} color="#00C9A7" />
                <span>Verified Facility: Apollo Prime</span>
              </span>
            </div>
          </div>
        </header>

        {/* ── Active Tab Component View ── */}
        <main style={{ 
          maxWidth: '1360px', 
          width: '100%', 
          margin: '0 auto', 
          padding: '28px 32px 64px',
          boxSizing: 'border-box'
        }}>
          {adminTab === 'dashboard' && (
            <ClinicOverview 
              onNavigateToDoctors={() => handleSelectTab('doctors')}
              onNavigateToPatients={() => handleSelectTab('patients')} 
              onNavigateToReports={() => handleSelectTab('diagnostic_reports')} 
            />
          )}
          {adminTab === 'doctors' && <DoctorManagement />}
          {adminTab === 'patients' && <PatientRegistry />}
          {adminTab === 'appointments' && <AppointmentManagement />}
          {adminTab === 'diagnostic_reports' && <DiagnosticReports />}
          {adminTab === 'call_history' && <AICallActivity />}
          {adminTab === 'clinic_settings' && <ClinicSettingsSecurity />}
        </main>
      </div>

    </div>
  );
}

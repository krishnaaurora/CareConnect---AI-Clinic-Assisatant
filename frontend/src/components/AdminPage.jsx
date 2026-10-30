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
      icon: LayoutDashboard
    },
    {
      id: 'doctors',
      num: '2',
      label: 'Doctors',
      icon: Stethoscope
    },
    {
      id: 'patients',
      num: '3',
      label: 'Patients',
      icon: Users
    },
    {
      id: 'appointments',
      num: '4',
      label: 'Appointments',
      icon: Calendar
    },
    {
      id: 'diagnostic_reports',
      num: '5',
      label: 'Diagnostic Reports',
      icon: FileText
    },
    {
      id: 'call_history',
      num: '6',
      label: 'Call History',
      icon: PhoneCall
    },
    {
      id: 'clinic_settings',
      num: '7',
      label: 'Clinic Settings',
      icon: Settings
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
        return 'Welcome back to your clinic dashboard';
      case 'doctors':
        return 'Physician directory, operating shifts & leaves';
      case 'patients':
        return 'Patient registry, electronic health & consent';
      case 'appointments':
        return 'Clinical scheduling, conflict checks & bookings';
      case 'diagnostic_reports':
        return 'Laboratory report repository & voice dispatch';
      case 'call_history':
        return 'Telephony ledger, transcripts & call activity';
      case 'clinic_settings':
        return 'Practice administration & facility governance';
      default:
        return 'Welcome back to your dashboard';
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
        /* Completely hide scrollbars on sidebar across all browsers */
        .admin-sidebar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .admin-sidebar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
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
        className={`admin-sidebar no-scrollbar ${mobileNavOpen ? 'open' : ''}`}
        style={{
          width: '232px',
          flexShrink: 0,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          boxShadow: '1px 0 6px rgba(0, 0, 0, 0.02)',
          position: 'relative'
        }}
      >
        {/* Subtle Sera UI Pattern for Light Sidebar */}
        <BackgroundPattern variant="plus" size={32} color="rgba(15, 91, 76, 0.03)" />

        {/* Top Part: Branding + Back Button */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Header Brand */}
          <div style={{ 
            padding: '14px 14px 10px', 
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img
                src={careconnectLogo}
                alt="CareConnect"
                style={{ height: '26px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />

              {/* Close button on mobile */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="admin-mobile-close"
                style={{
                  display: mobileNavOpen ? 'flex' : 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Back to Website button */}
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                justifyContent: 'flex-start'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = '#0F5B4C';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <ArrowLeft size={12} color="#00C9A7" />
              <span>Back to Website</span>
            </button>
          </div>

          {/* Navigation Items Section */}
          <div style={{ padding: '10px 8px 6px' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0 8px',
              marginBottom: '6px',
              fontFamily: 'Inter, sans-serif'
            }}>
              Clinic Console Menu
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                      padding: '7px 9px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid rgba(0, 201, 167, 0.35)' : '1px solid transparent',
                      fontSize: '12.5px',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: isActive ? '#EDFDF9' : 'transparent',
                      color: isActive ? '#0F5B4C' : '#475569',
                      transition: 'all 0.15s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.color = '#0A2520';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#475569';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <Icon 
                        size={16} 
                        strokeWidth={isActive ? 2.4 : 1.8} 
                        color={isActive ? '#007A65' : '#64748B'}
                        style={{ flexShrink: 0 }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 700, 
                          color: isActive ? '#007A65' : '#94A3B8' 
                        }}>
                          {item.num}.
                        </span>
                        <span style={{
                          letterSpacing: '-0.01em',
                          color: isActive ? '#0A2520' : '#475569',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '12.5px'
                        }}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Part: Priya Assistant Status Card */}
        <div style={{ 
          padding: '10px 12px', 
          borderTop: '1px solid #F1F5F9',
          backgroundColor: '#FFFFFF',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Priya AI Assistant Status */}
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '9px',
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px'
          }}>
            <div style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#00C9A7',
              boxShadow: '0 0 6px #00C9A7',
              animation: 'pulseDotLive 2s ease-in-out infinite',
              flexShrink: 0
            }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F5B4C', lineHeight: 1.2 }}>
                Priya Receptionist
              </div>
              <div style={{ fontSize: '9.5px', color: '#64748B' }}>
                Voice Assistant Active
              </div>
            </div>
          </div>

          {/* Access Direct Badge */}
          <div style={{
            fontSize: '10px',
            color: '#94A3B8',
            textAlign: 'center',
            lineHeight: 1.3
          }}>
            Role: <strong style={{ color: '#475569' }}>Clinic Administrator</strong>
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
        {/* ── Top Header (Clean Light 21st.dev / Sera Style, Sticky Top Navbar) ── */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '14px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
        }}>
          <div style={{ minWidth: 0, flexShrink: 1 }}>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: 900, 
              margin: 0, 
              color: '#0A2520',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}>
              {currentNav.label === 'Dashboard' ? 'Dashboard' : currentNav.label}
            </h1>
            <p style={{ 
              fontSize: '12px', 
              color: '#64748B', 
              margin: '2px 0 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {currentNav.label === 'Dashboard' ? 'Welcome back to your dashboard' : getTabDescription(adminTab)}
            </p>
          </div>

          {/* Right Group: Pinned in Top Navbar across every section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            {/* Notifications Bell with unread dot */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <Bell size={16} />
              <span style={{
                position: 'absolute',
                top: '7px',
                right: '8px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#EF4444',
                border: '1.5px solid #FFFFFF'
              }} />
            </div>

            {/* Current Date Widget */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '12px', 
              color: '#475569', 
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              padding: '7px 12px',
              borderRadius: '8px',
              fontWeight: 600
            }}>
              <Calendar size={13} color="#00C9A7" />
              <span>{currentDate}</span>
            </div>

            {/* Admin Profile Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px 5px 6px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#EDFDF9',
                color: '#007A65',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '11px'
              }}>
                AD
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#0A2520'
              }}>
                Apex Admin
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

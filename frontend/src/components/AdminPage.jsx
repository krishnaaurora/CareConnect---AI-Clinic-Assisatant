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
  FileText
} from 'lucide-react';
import ClinicOverview from './ClinicOverview';
import PatientRegistry from './PatientRegistry';
import DiagnosticReports from './DiagnosticReports';

export default function AdminPage({ onNavigateHome }) {
  const [adminTab, setAdminTab] = useState('dashboard');
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
      id: 'patients',
      num: '2',
      label: 'Patient Registry',
      icon: Users,
      badge: 'Directory'
    },
    {
      id: 'diagnostic_reports',
      num: '3',
      label: 'Diagnostic Reports',
      icon: FileText,
      badge: 'Bolna AI'
    }
  ];

  const currentNav = NAV_ITEMS.find(item => item.id === adminTab) || NAV_ITEMS[0];

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
          backgroundColor: '#071F1B',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)',
        }}
      >
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
                    onClick={() => {
                      setAdminTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                      color: isActive ? '#0A2520' : 'rgba(255, 255, 255, 0.78)',
                      boxShadow: isActive ? '0 4px 18px rgba(0, 0, 0, 0.18)' : 'none',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.78)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        backgroundColor: isActive ? '#DCFAF3' : 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: isActive ? '#007A65' : '#00C9A7'
                      }}>
                        <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          color: isActive ? '#007A65' : 'rgba(255, 255, 255, 0.45)' 
                        }}>
                          {item.num}.
                        </span>
                        <span style={{
                          fontFamily: 'Plus Jakarta Sans, sans-serif',
                          letterSpacing: '-0.01em'
                        }}>
                          {item.label}
                        </span>
                      </div>
                    </div>

                    {item.badge && (
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        backgroundColor: isActive ? '#DCFAF3' : 'rgba(0, 201, 167, 0.18)',
                        color: isActive ? '#007A65' : '#00C9A7',
                        padding: '2px 7px',
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
        {/* ── Top Header Banner matching Screenshot ── */}
        <header style={{
          backgroundColor: '#0F5B4C',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          color: '#FFFFFF',
          padding: '24px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(10, 37, 32, 0.06)'
        }}>
          <div style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#A7F3D0',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>
                <span>Portal</span>
                <span>/</span>
                <span style={{ color: '#FFFFFF' }}>{currentNav.label}</span>
              </div>

              <h1 style={{ 
                fontSize: 'clamp(1.5rem, 2.5vw, 1.85rem)', 
                fontWeight: 900, 
                margin: '0 0 6px', 
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                letterSpacing: '-0.025em'
              }}>
                Clinic Administration Dashboard
              </h1>
              <p style={{ fontSize: '13.5px', color: '#A7F3D0', margin: 0, lineHeight: 1.5 }}>
                Real-time operational dashboard: live bookings, waitlist queues, doctor rosters, and schedule verification.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '12.5px', 
                color: '#E2E8F0', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px'
              }}>
                <Calendar size={13} color="#00C9A7" />
                <span>{currentDate}</span>
              </div>

              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '6px 12px',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}>
                Access: Direct Admin (No Auth Required)
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
              onNavigateToPatients={() => setAdminTab('patients')} 
              onNavigateToReports={() => setAdminTab('diagnostic_reports')} 
            />
          )}
          {adminTab === 'patients' && <PatientRegistry />}
          {adminTab === 'diagnostic_reports' && <DiagnosticReports />}
        </main>
      </div>

    </div>
  );
}

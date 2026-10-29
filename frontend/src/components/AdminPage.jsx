import React, { useState } from 'react';
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
  Settings
} from 'lucide-react';
import ClinicOverview from './ClinicOverview';
import DoctorManagement from './DoctorManagement';
import ScheduleCalendar from './ScheduleCalendar';
import AppointmentManagement from './AppointmentManagement';
import AICallActivity from './AICallActivity';
import ClinicSettingsSecurity from './ClinicSettingsSecurity';

export default function AdminPage({ onNavigateHome }) {
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'doctors' | 'calendar' | 'appointments' | 'calls' | 'settings'
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', color: '#0A2520', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Admin Top Navigation Bar ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(15, 91, 76, 0.1)',
        boxShadow: '0 2px 10px rgba(10, 37, 32, 0.03)',
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Left: Brand & Admin Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={onNavigateHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                color: '#0F5B4C',
                border: '1px solid rgba(15, 91, 76, 0.12)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            >
              <ArrowLeft size={15} />
              <span>Back to Website</span>
            </button>

            <div style={{ height: '24px', width: '1px', backgroundColor: '#E2E8F0' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={careconnectLogo}
                alt="CareConnect AI"
                style={{ height: '30px', width: 'auto', display: 'block', objectFit: 'contain' }}
              />
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#0F5B4C',
                backgroundColor: '#DCFAF3',
                padding: '3px 9px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Admin Portal
              </span>
            </div>
          </div>

          {/* Right: Date & Clinic Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
              <Calendar size={14} color="#00C9A7" />
              <span>{currentDate}</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              backgroundColor: '#EDFDF9',
              border: '1px solid rgba(0, 201, 167, 0.3)',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0F5B4C'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00C9A7' }} />
              <span>Priya Voice AI: Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Subheader Banner ── */}
      <div style={{
        backgroundColor: '#0F5B4C',
        color: '#FFFFFF',
        padding: '24px 0',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: '0 0 4px', fontFamily: 'Manrope, sans-serif' }}>
              Clinic Administration & Voice Reception Console
            </h1>
            <p style={{ fontSize: '14px', color: '#A7F3D0', margin: 0 }}>
              Unrestricted clinical dashboard: live bookings, waitlist queues, doctor rosters, and schedule verification.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '6px 12px',
              borderRadius: '8px',
              color: '#FFFFFF'
            }}>
              Access: Direct Admin (No Auth Required)
            </span>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div style={{ maxWidth: '1360px', margin: '20px auto 0', padding: '0 24px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setAdminTab('overview')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: adminTab === 'overview' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
              color: adminTab === 'overview' ? '#0F5B4C' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={16} />
            <span>1. Clinic Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('doctors')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: adminTab === 'doctors' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
              color: adminTab === 'doctors' ? '#0F5B4C' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            <Stethoscope size={16} />
            <span>2. Doctor Management</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('calendar')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: adminTab === 'calendar' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
              color: adminTab === 'calendar' ? '#0F5B4C' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            <Calendar size={16} />
            <span>3. Schedule Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('appointments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: adminTab === 'appointments' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
              color: adminTab === 'appointments' ? '#0F5B4C' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={16} />
            <span>4. Appointment Management</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('calls')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: adminTab === 'calls' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
              color: adminTab === 'calls' ? '#0F5B4C' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={16} />
            <span>5. AI Call Activity</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('settings')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              backgroundColor: adminTab === 'settings' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)',
              color: adminTab === 'settings' ? '#0F5B4C' : '#FFFFFF',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} />
            <span>6. Clinic Settings & Security</span>
          </button>
        </div>
      </div>

      {/* ── Main View Embed ── */}
      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 24px 60px' }}>
        {adminTab === 'overview' && <ClinicOverview />}
        {adminTab === 'doctors' && <DoctorManagement />}
        {adminTab === 'calendar' && <ScheduleCalendar />}
        {adminTab === 'appointments' && <AppointmentManagement />}
        {adminTab === 'calls' && <AICallActivity />}
        {adminTab === 'settings' && <ClinicSettingsSecurity />}
      </main>

    </div>
  );
}

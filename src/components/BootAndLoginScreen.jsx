import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Database,
  Wifi,
  Cpu,
  Lock,
  PlusCircle,
  ArrowRight,
  User,
  Users,
  KeyRound,
  RotateCcw,
  Settings2,
  ChevronRight,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useArena } from '../context/ArenaContext.jsx';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { ALL_PERMISSION_KEYS } from './arbacCatalog.js';

export function BootAndLoginScreen() {
  const {
    arenaState,
    loading,
    submitting,
    error,
    setError,
    wsConnected,
    bootCompleted,
    setBootCompleted,
    setAuthenticatedOperator,
    activeTenantId,
    switchTenant,
    mutateApi,
    notifySuccess
  } = useArena();

  const [bootStep, setBootStep] = useState(0);

  // Modes: 'login' (default real OS login) | 'setup' (first-time provisioning / database switch)
  const [setupMode, setSetupMode] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  // Auto-ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Auto-request true hardware fullscreen on first user gesture anywhere
  useEffect(() => {
    const handleFirstGesture = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
    };
  }, []);

  // Login Form State
  const [selectedUserCode, setSelectedUserCode] = useState('');
  const [pinInput, setPinInput] = useState('');

  // First-Boot / New Tenant DB Provisioning State
  const [setupForm, setSetupForm] = useState({
    tenant_code: 'SJC-01',
    arena_name: '',
    gab_license: 'GAB-COL-2026-0884',
    mayors_permit: 'LGU-MP-2026-99201',
    bir_cas_min: 'MIN-20260411-88392014',
    full_name: '',
    role: 'Superadmin / Pangulo ng Sabungan',
    zone: 'Executive Command Console',
    pin_code: '1234'
  });

  // OS Boot Sequence progression (only on initial load)
  useEffect(() => {
    if (bootCompleted) return undefined;
    const t1 = setTimeout(() => setBootStep(1), 500);
    const t2 = setTimeout(() => setBootStep(2), 1000);
    const t3 = setTimeout(() => setBootStep(3), 1500);
    const t4 = setTimeout(() => setBootStep(4), 2000);
    const t5 = setTimeout(() => setBootCompleted(true), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [bootCompleted, setBootCompleted]);

  // Keyboard shortcut during bootloader: F2 or Del enters Coliseum Server & Database Setup
  useEffect(() => {
    if (bootCompleted) return undefined;
    const handleBootKey = (e) => {
      if (e.key === 'F2' || e.key === 'Delete') {
        e.preventDefault();
        setSetupMode(true);
        setBootCompleted(true);
      }
    };
    window.addEventListener('keydown', handleBootKey);
    return () => window.removeEventListener('keydown', handleBootKey);
  }, [bootCompleted, setBootCompleted]);

  const tenants = arenaState?.tenants || [];
  const employees = arenaState?.employees || [];
  const activeTenant = arenaState?.activeTenant;
  const sys = arenaState?.systemMetrics;

  // Auto-select primary operator (e.g. EMP-01) on load
  useEffect(() => {
    if (employees.length > 0 && (!selectedUserCode || !employees.some((e) => e.staff_code === selectedUserCode))) {
      setSelectedUserCode(employees[0].staff_code);
    }
  }, [employees, selectedUserCode]);

  const currentOperator = employees.find((e) => e.staff_code === selectedUserCode) || employees[0] || null;

  // STAGE 1: OS KERNEL & HARDWARE BOOT SEQUENCE
  if (!bootCompleted) {
    const bootChecks = [
      {
        id: 1,
        label: 'Mounting Native SQLite Multi-Tenant WAL Engine (node:sqlite)...',
        status: bootStep >= 1 ? 'OK' : 'WAIT'
      },
      {
        id: 2,
        label: `Binding Air-Gapped Local LAN Interface (${sys?.lanIp || 'Detecting'} / ${sys?.terminalId || 'Host'})...`,
        status: bootStep >= 2 ? 'OK' : 'WAIT'
      },
      {
        id: 3,
        label: `Starting RFC6455 WebSocket Broadcast Hub (${wsConnected ? 'ONLINE' : 'SYNCING'})...`,
        status: bootStep >= 3 ? 'OK' : 'WAIT'
      },
      {
        id: 4,
        label: 'Initializing Gate 0–8 Zero-Trust & 23-Permission ARBAC Security Guard...',
        status: bootStep >= 4 ? 'OK' : 'WAIT'
      }
    ];

    return (
      <div className="os-boot-screen">
        <div className="os-boot-card">
          <div className="os-boot-brand-row">
            <div className="brand-crest-diamond">
              <img
                src="/assets/brand-favicon.png"
                alt="Cockpit OS Emblem"
                className="brand-crest-img"
              />
            </div>
            <div>
              <div className="os-boot-title">COCKPIT OS v2.4.0</div>
              <div className="os-boot-subtitle">
                ENTERPRISE ZERO-TRUST COLISEO KERNEL • MULTI-TENANT SQLITE WAL
              </div>
            </div>
          </div>

          <div className="os-boot-terminal-box">
            {bootChecks.map((chk) => (
              <div key={chk.id} className="os-boot-log-line">
                <span
                  className={`os-boot-tag ${chk.status === 'OK' ? 'is-ok' : 'is-wait'}`}
                >
                  [{chk.status}]
                </span>
                <span>{chk.label}</span>
              </div>
            ))}
          </div>

          <div className="os-boot-footer">
            <button
              type="button"
              className="btn-boot-setup"
              onClick={() => {
                setSetupMode(true);
                setBootCompleted(true);
              }}
              title="Open Coliseum Server & Tenant Database Setup (F2 or Del)"
            >
              <Settings2 size={13} />
              <span>Configure Server &amp; Database (F2)</span>
            </button>

            <button
              type="button"
              className="btn-secondary-gold"
              onClick={() => setBootCompleted(true)}
            >
              Proceed to Sign-In &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle PIN submission
  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedUserCode || !pinInput) return;

    setError(null);
    const res = await mutateApi('/api/auth/login', 'POST', {
      tenant_id: activeTenantId,
      employee_id: selectedUserCode,
      pin_code: pinInput
    });

    if (res.ok && res.data?.operator) {
      setPinInput('');
      setAuthenticatedOperator(res.data.operator);
      if (notifySuccess) {
        notifySuccess(
          'Terminal Session Unlocked',
          `Welcome, ${res.data.operator.full_name}. Gate 0 security verified.`
        );
      }
    }
  };

  const handleDigitClick = (digit) => {
    if (pinInput.length < 8) {
      setPinInput((prev) => `${prev}${digit}`);
    }
  };

  // Determine whether to show First-Boot Setup wizard
  // Shows ONLY if zero tenants exist on a new server, or when explicitly requested via setupMode
  const isFirstBootNewServer = tenants.length === 0;
  const showSetupWizard = isFirstBootNewServer || setupMode;

  return (
    <div className="os-boot-screen is-real-os-login">
      {/* Global Error Banner */}
      {error && (
        <div className="real-os-error-toast">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button
            type="button"
            className="toast-close-x"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* =========================================================================
         CASE A: FIRST TIME NEW SERVER SETUP / DATABASE PROVISIONING WIZARD
         ========================================================================= */}
      {showSetupWizard ? (
        <div className="os-login-card setup-wizard-card">
          <header className="os-login-header">
            <div className="top-brand-cluster">
              <div className="brand-crest-diamond">
                <img
                  src="/assets/brand-favicon.png"
                  alt="Cockpit OS Emblem"
                  className="brand-crest-img"
                />
              </div>
              <div className="brand-title-stack">
                <span className="os-boot-title">
                  {isFirstBootNewServer
                    ? 'FIRST-BOOT SERVER INITIALIZATION'
                    : 'COLISEUM ARENA DATABASE SETUP'}
                </span>
                <span className="os-boot-subtitle">
                  PROVISION DEDICATED PHYSICAL SQLITE WAL &amp; ROOT SUPERADMIN
                </span>
              </div>
            </div>

            {!isFirstBootNewServer && (
              <button
                type="button"
                className="btn-secondary-gold"
                onClick={() => setSetupMode(false)}
              >
                Back to User Sign-In &rarr;
              </button>
            )}
          </header>

          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await mutateApi('/api/tenants', 'POST', {
                ...setupForm,
                permissions: ALL_PERMISSION_KEYS
              });
              if (res.ok && res.data?.operator) {
                setSetupMode(false);
                setAuthenticatedOperator(res.data.operator);
              }
            }}
          >
            <div className="setup-intro-callout">
              <HardDrive size={20} className="card-title-icon-emerald" />
              <p>
                {isFirstBootNewServer
                  ? 'Welcome to Cockpit OS. No arena databases were detected on this server. Configure your initial coliseum venue credentials below to initialize the physical SQLite WAL database.'
                  : 'Select an existing arena database partition or provision an additional isolated database file for a new venue.'}
              </p>
            </div>

            {/* Existing Tenant Selector if any exist */}
            {tenants.length > 0 && (
              <div className="form-field select-db-field">
                <label className="form-label">Switch Active Arena Database Drive</label>
                <div className="db-select-row">
                  <select
                    className="form-select is-lg"
                    value={activeTenantId || ''}
                    onChange={(e) => {
                      setSelectedUserCode('');
                      switchTenant(e.target.value);
                    }}
                  >
                    {tenants.map((t) => (
                      <option key={t.tenant_id} value={t.tenant_id}>
                        {t.tenant_code} — {t.arena_name} ({t.db_file_name})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-primary-emerald"
                    onClick={() => setSetupMode(false)}
                  >
                    Use Selected Database &rarr;
                  </button>
                </div>
              </div>
            )}

            <div className="form-divider-label">
              <span>Or Provision New Venue Database File:</span>
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Tenant Partition Code</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. SJC-01, CEBU-01"
                  value={setupForm.tenant_code}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, tenant_code: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Coliseum / Arena Venue Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. San Juan Coliseum Arena"
                  value={setupForm.arena_name}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, arena_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">GAB License Number</label>
                <input
                  className="form-input"
                  required
                  value={setupForm.gab_license}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, gab_license: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">BIR CAS MIN</label>
                <input
                  className="form-input"
                  required
                  value={setupForm.bir_cas_min}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, bir_cas_min: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Pangulo / Superadmin Full Legal Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Victoriano S. Santos"
                  value={setupForm.full_name}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, full_name: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Operator Security PIN (4–6 digits)</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="1234"
                  value={setupForm.pin_code}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, pin_code: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="action-btn-row mt-3">
              <button
                type="submit"
                className="btn-primary-emerald"
                disabled={submitting}
              >
                {submitting
                  ? 'Initializing Database...'
                  : 'Initialize Dedicated SQLite DB & Boot Into Cockpit OS'}
              </button>

              {!isFirstBootNewServer && (
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() => setSetupMode(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* =========================================================================
           CASE B: REAL OS USER LOGIN SCREEN (JUST LIKE WINDOWS 11 / REAL OS LOGIN)
           ========================================================================= */
        <div className="real-os-login-container">
          {/* Centered Large Lock Screen Typography Clock (No Pill, No Border) */}
          <div className="real-os-lock-clock-zone">
            <div className="lock-clock-time-display">
              {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
            <div className="lock-clock-date-display">
              {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="real-os-user-card">
            {/* Operator Avatar with Glowing Halo */}
            <div className="real-os-avatar-cluster">
              <div className="real-os-avatar-ring">
                <div className="real-os-avatar-inner">
                  <User size={48} className="card-title-icon-emerald" />
                </div>
              </div>
              <div className="real-os-avatar-status-dot" />
            </div>

            {/* Operator Identification */}
            <div className="real-os-identity-stack">
              <h1 className="real-os-operator-name">
                {currentOperator ? currentOperator.full_name : 'Coliseum Operator'}
              </h1>
              <div className="real-os-role-badge">
                <span className="role-code-tag">
                  {currentOperator ? currentOperator.staff_code : 'EMP-01'}
                </span>
                <span className="role-name-text">
                  {currentOperator ? currentOperator.role : 'Authorized Coliseum Staff'}
                </span>
              </div>
              <div className="real-os-zone-sub">
                {currentOperator?.zone || 'Executive Command Console'}
              </div>
            </div>

            {/* Password / PIN Login Input Form */}
            <form className="real-os-pin-form" onSubmit={handleLoginSubmit}>
              <div className="real-os-pin-input-wrap">
                <div className="pin-key-icon">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  className="real-os-pin-input"
                  autoFocus
                  required
                  placeholder="Enter Security PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="real-os-pin-submit-btn"
                  disabled={submitting || !pinInput}
                  title="Unlock Cockpit OS Session [Enter]"
                >
                  <ArrowRight size={18} />
                </button>
              </div>

              {/* Toggle On-Screen Keypad for POS/Touch Terminals */}
              <div className="real-os-keypad-toggle-row">
                <button
                  type="button"
                  className="btn-keypad-toggle"
                  onClick={() => setShowKeypad((prev) => !prev)}
                >
                  <KeyRound size={13} />
                  <span>{showKeypad ? 'Hide On-Screen Keypad' : 'Touch Keypad'}</span>
                </button>
              </div>

              {/* On-Screen Numeric Keypad */}
              {showKeypad && (
                <div className="real-os-keypad-grid">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', '⌫'].map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        className="os-keypad-key"
                        onClick={() => {
                          if (key === 'CLR') setPinInput('');
                          else if (key === '⌫') setPinInput((p) => p.slice(0, -1));
                          else handleDigitClick(key);
                        }}
                      >
                        {key}
                      </button>
                    )
                  )}
                </div>
              )}

              <div className="real-os-lockout-notice">
                <ShieldCheck size={13} />
                <span>Zero-Trust Gate 0 • 3-strikes hardware lockout policy</span>
              </div>
            </form>

            {/* Other Enrolled Operators User Switcher (Windows 11 style) */}
            {employees.length > 1 && (
              <div className="real-os-user-switcher-section">
                <span className="switcher-label">Switch Operator Account:</span>
                <div className="switcher-users-row">
                  {employees.map((emp) => {
                    const isSelected = emp.staff_code === selectedUserCode;
                    return (
                      <button
                        key={emp.employee_id}
                        type="button"
                        className={`switcher-user-chip ${isSelected ? 'is-selected' : ''}`}
                        onClick={() => {
                          setSelectedUserCode(emp.staff_code);
                          setPinInput('');
                        }}
                      >
                        <div className="chip-avatar">
                          {emp.full_name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div className="chip-details">
                          <span className="chip-name">{emp.full_name}</span>
                          <span className="chip-role">{emp.staff_code}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* End of User Card */}
          </div>

          {/* Unified Bottom-Right System Tray (The ONLY dock on the lock screen) */}
          <div className="real-os-system-tray">
            <div className="tray-stat-chip" title={`Terminal Hardware ID: ${sys?.terminalId || 'LOCAL'}`}>
              <Cpu size={12} />
              <span>{sys?.terminalId || 'TERM-LOCAL'}</span>
            </div>
            <div className="tray-stat-chip is-online" title={`LAN Mesh IP: ${sys?.lanIp || '127.0.0.1'}`}>
              <Wifi size={12} />
              <span>{sys?.lanIp || '127.0.0.1'}</span>
            </div>
            {activeTenant && (
              <div className="tray-stat-chip is-venue" title={activeTenant.arena_name}>
                <HardDrive size={12} />
                <span>{activeTenant.tenant_code}</span>
              </div>
            )}
            <button
              type="button"
              className="tray-btn-fs"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Hardware Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Wifi, Cpu, Lock, PlusCircle } from 'lucide-react';
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
  const [creatingTenantMode, setCreatingTenantMode] = useState(false);

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
    role: 'Chief System Architect / CSO',
    zone: 'Executive Command Console',
    pin_code: ''
  });

  // OS Boot Sequence progression
  useEffect(() => {
    if (bootCompleted) return undefined;
    const t1 = setTimeout(() => setBootStep(1), 350);
    const t2 = setTimeout(() => setBootStep(2), 750);
    const t3 = setTimeout(() => setBootStep(3), 1150);
    const t4 = setTimeout(() => setBootStep(4), 1550);
    const t5 = setTimeout(() => setBootCompleted(true), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [bootCompleted, setBootCompleted]);

  const tenants = arenaState?.tenants || [];
  const employees = arenaState?.employees || [];
  const sys = arenaState?.systemMetrics;

  useEffect(() => {
    if (employees.length > 0 && !selectedUserCode) {
      setSelectedUserCode(employees[0].staff_code);
    }
  }, [employees, selectedUserCode]);

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
            <span className="activity-time-tag">
              PRECISION | CONTROL | FAIR PLAY • OFFLINE-FIRST LAN OS
            </span>
            <button
              type="button"
              className="btn-secondary-gold"
              onClick={() => setBootCompleted(true)}
            >
              Skip Boot &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STAGE 2: ZERO-TRUST MULTI-TENANT / MULTI-DATABASE LOGIN & FIRST-BOOT WIZARD
  const showProvisionWizard = tenants.length === 0 || creatingTenantMode;

  const handleDigitClick = (digit) => {
    if (pinInput.length < 8) {
      setPinInput((prev) => `${prev}${digit}`);
    }
  };

  return (
    <div className="os-boot-screen">
      <div className="os-login-card">
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
              <span className="os-boot-title">COCKPIT OS — GATE 0 AUTHENTICATION</span>
              <span className="os-boot-subtitle">
                MULTI-TENANT PHYSICAL DB ISOLATION &amp; 23-PERMISSION ARBAC
              </span>
            </div>
          </div>

          <div className="os-login-badges">
            <span className="gateway-pill">
              <Cpu size={12} />
              {sys?.terminalId || 'HOST'}
            </span>
            <span className="gateway-pill">
              <Wifi size={12} />
              {sys?.lanIp || '127.0.0.1'}
            </span>
          </div>
        </header>

        {error && (
          <div className="status-alert-banner is-error">
            <span>{error}</span>
            <button
              type="button"
              className="btn-danger-outline"
              onClick={() => setError(null)}
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="skeleton-stack">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : showProvisionWizard ? (
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await mutateApi('/api/tenants', 'POST', {
                ...setupForm,
                permissions: ALL_PERMISSION_KEYS
              });
              if (res.ok && res.data?.operator) {
                setCreatingTenantMode(false);
                setAuthenticatedOperator(res.data.operator);
              }
            }}
          >
            <div className="workspace-panel-title">
              {tenants.length === 0
                ? 'First-Boot Initialization: Provision Isolated Coliseum Tenant Database & Root DB Owner'
                : 'Provision New Dedicated Coliseum Tenant SQLite Database'}
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Tenant Code (Creates Dedicated .db File)</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. SJC-01"
                  value={setupForm.tenant_code}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, tenant_code: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Coliseum / Arena Tenant Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. SAN JUAN COLISEUM ARENA"
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
                <label className="form-label">Root Database Operator Full Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Engr. Dante Alcantara"
                  value={setupForm.full_name}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, full_name: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Root Operator Security PIN (4–6 digits)</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="Enter 4+ digit PIN (e.g. 1234)"
                  value={setupForm.pin_code}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, pin_code: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="action-btn-row">
              <button
                type="submit"
                className="btn-primary-emerald"
                disabled={submitting}
              >
                {submitting
                  ? 'Provisioning Tenant Database & Binding Host...'
                  : 'Initialize Dedicated SQLite DB & Boot Into Cockpit OS'}
              </button>
              {tenants.length > 0 && (
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() => setCreatingTenantMode(false)}
                >
                  Back to Operator Sign-In
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="workspace-split-grid">
            <div className="workspace-panel form-stack">
              <div className="workspace-panel-title">
                1. Select Isolated Tenant Database
              </div>
              <div className="form-field">
                <label className="form-label">Mounted Physical SQLite Database</label>
                <select
                  className="form-select"
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
              </div>

              <button
                type="button"
                className="btn-secondary-gold"
                onClick={() => setCreatingTenantMode(true)}
              >
                <PlusCircle size={13} /> + Provision Another Isolated Tenant DB
              </button>

              <div className="workspace-panel-title">
                2. Select Database Operator Account
              </div>
              {employees.length === 0 ? (
                <div className="card-empty-state">
                  <span className="card-empty-text">
                    No operators found in this Tenant DB.
                  </span>
                </div>
              ) : (
                <div className="form-field">
                  <label className="form-label">Enrolled ARBAC Operator</label>
                  <select
                    className="form-select"
                    value={selectedUserCode}
                    onChange={(e) => setSelectedUserCode(e.target.value)}
                  >
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.staff_code}>
                        {emp.staff_code} — {emp.full_name} ({emp.role} •{' '}
                        {emp.permissions_count}/23 Perms)
                        {emp.is_locked ? ' [LOCKED]' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <form
              className="workspace-panel form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
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
              }}
            >
              <div className="workspace-panel-title">
                3. Enter Gate 0 Security PIN (3-Strikes Lockout Policy)
              </div>

              <div className="form-field">
                <label className="form-label">Operator PIN</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  placeholder="Enter Security PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                />
              </div>

              <div className="pin-keypad-grid">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', '⌫'].map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      className="pin-key-btn"
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

              <button
                type="submit"
                className="btn-primary-emerald"
                disabled={submitting || !selectedUserCode || !pinInput}
              >
                <Lock size={13} />{' '}
                {submitting
                  ? 'Verifying Gate 0 Hardware & PIN...'
                  : 'Authenticate & Unlock Cockpit OS Desktop'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


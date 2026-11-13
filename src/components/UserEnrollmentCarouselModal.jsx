import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  User,
  HardDrive,
  KeyRound,
  BadgeDollarSign,
  Monitor,
  Check,
  RotateCcw,
  Search,
  Eye,
  EyeOff,
  Hash,
  Filter
} from 'lucide-react';
import {
  ARBAC_PERMISSION_GROUPS,
  ALL_PERMISSION_KEYS,
  FILIPINO_SABONG_DEFAULT_ROLES
} from './arbacCatalog.js';

export function UserEnrollmentCarouselModal({
  isOpen,
  onClose,
  editingEmployee,
  devices,
  activeTenant,
  submitting,
  onSubmit
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedRolePreset, setSelectedRolePreset] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [permSearch, setPermSearch] = useState('');
  const [autoStaffCode, setAutoStaffCode] = useState(true);

  const [form, setForm] = useState({
    full_name: '',
    staff_code: '',
    role: 'Superadmin / Pangulo ng Sabungan',
    zone: 'Executive Command Console',
    bound_device_code: 'T01',
    pin_code: '1234',
    cash_float: '1000000',
    commission_rate: '0.00',
    permissions: [...ALL_PERMISSION_KEYS]
  });

  // Initialize form when opened or editing
  useEffect(() => {
    if (editingEmployee) {
      setForm({
        full_name: editingEmployee.full_name || '',
        staff_code: editingEmployee.staff_code || '',
        role: editingEmployee.role || 'Superadmin / Pangulo ng Sabungan',
        zone: editingEmployee.zone || 'Executive Command Console',
        bound_device_code: editingEmployee.bound_device_code || '',
        pin_code: '',
        cash_float: String(editingEmployee.cash_float ?? 0),
        commission_rate: String(editingEmployee.commission_rate ?? 0.02),
        permissions: Array.isArray(editingEmployee.permissions)
          ? [...editingEmployee.permissions]
          : []
      });
      setAutoStaffCode(false);
      // Find matching preset if any
      const matching = FILIPINO_SABONG_DEFAULT_ROLES.find(
        (r) => r.role_name === editingEmployee.role
      );
      setSelectedRolePreset(matching || null);
      setCurrentStage(2);
    } else {
      // Default to Superadmin
      const defaultPreset = FILIPINO_SABONG_DEFAULT_ROLES[0];
      setSelectedRolePreset(defaultPreset);
      setForm({
        full_name: '',
        staff_code: '',
        role: defaultPreset.role_name,
        zone: defaultPreset.department_zone,
        bound_device_code: 'T01',
        pin_code: '1234',
        cash_float: String(defaultPreset.max_cash_float),
        commission_rate: '0.00',
        permissions: [...defaultPreset.permissions]
      });
      setAutoStaffCode(true);
      setCurrentStage(1);
    }
  }, [editingEmployee, isOpen]);

  const totalPerms = form.permissions.length;
  const clearancePct = Math.round((totalPerms / ALL_PERMISSION_KEYS.length) * 100);

  const handleFullNameChange = (val) => {
    const slug = val
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    setForm((prev) => ({
      ...prev,
      full_name: val,
      staff_code: autoStaffCode ? slug : prev.staff_code
    }));
  };

  const togglePermission = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter((k) => k !== key)
        : [...prev.permissions, key]
    }));
  };

  const toggleDomain = (domainPerms) => {
    const domainKeys = domainPerms.map((p) => p.key);
    const allChecked = domainKeys.every((k) => form.permissions.includes(k));
    setForm((prev) => ({
      ...prev,
      permissions: allChecked
        ? prev.permissions.filter((k) => !domainKeys.includes(k))
        : Array.from(new Set([...prev.permissions, ...domainKeys]))
    }));
  };

  const handleSelectRolePreset = (preset) => {
    setSelectedRolePreset(preset);
    setForm((prev) => ({
      ...prev,
      role: preset.role_name,
      zone: preset.department_zone,
      cash_float: String(preset.max_cash_float),
      permissions: [...preset.permissions]
    }));
  };

  const handleRoleDropdownChange = (roleName) => {
    const preset = FILIPINO_SABONG_DEFAULT_ROLES.find((r) => r.role_name === roleName);
    if (preset) {
      handleSelectRolePreset(preset);
    } else {
      setForm((prev) => ({ ...prev, role: roleName }));
    }
  };

  const handleNext = () => {
    if (currentStage === 2) {
      if (!form.full_name.trim()) {
        alert('Please enter Operator Full Name before continuing.');
        return;
      }
      if (!form.staff_code.trim()) {
        alert('Please enter Operator Username / Staff Code for sign-in identification.');
        return;
      }
    }
    setCurrentStage((s) => Math.min(4, s + 1));
  };

  const handlePrev = () => {
    setCurrentStage((s) => Math.max(1, s - 1));
  };

  const handleSubmitEnrollment = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.full_name.trim()) {
      alert('Please enter Operator Full Name.');
      setCurrentStage(2);
      return;
    }
    if (!form.staff_code.trim()) {
      alert('Please enter Operator Username / Staff Code.');
      setCurrentStage(2);
      return;
    }
    onSubmit(form);
  };

  const filteredPermissionGroups = useMemo(() => {
    const q = permSearch.trim().toLowerCase();
    if (!q) return ARBAC_PERMISSION_GROUPS;

    return ARBAC_PERMISSION_GROUPS.map((grp) => {
      const domainMatches = grp.domainTitle.toLowerCase().includes(q);
      const matchingPerms = grp.permissions.filter(
        (p) =>
          domainMatches ||
          p.label.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q)
      );
      return {
        ...grp,
        permissions: matchingPerms
      };
    }).filter((grp) => grp.permissions.length > 0);
  }, [permSearch]);

  const stages = [
    { num: 1, label: 'Role Archetype', sub: 'Filipino Sabong Context' },
    { num: 2, label: 'Operator Identity', sub: 'Profile, Username & PIN' },
    { num: 3, label: 'ARBAC Matrix', sub: `${ALL_PERMISSION_KEYS.length}-Checkbox Clearance` },
    { num: 4, label: 'Verification', sub: 'Physical DB Enrollment' }
  ];

  if (!isOpen) return null;

  return (
    <div className="carousel-journey-backdrop" onClick={onClose}>
      <div
        className="carousel-journey-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Operator Enrollment Carousel Journey"
      >
        {/* 1. Carousel Header with Progress Journey Tracker */}
        <div className="journey-header-bar">
          <div className="journey-title-cluster">
            <span className="journey-badge-pill">
              <Sparkles size={13} className="card-title-icon-gold" />
              <span>COLISEUM OPERATOR JOURNEY</span>
            </span>
            <h2 className="journey-main-heading">
              {editingEmployee
                ? `Update Operator: ${editingEmployee.staff_code} (${editingEmployee.full_name})`
                : 'Enroll New Coliseum Operator'}
            </h2>
          </div>

          {/* Interactive Steps Tracker */}
          <div className="journey-steps-tracker">
            {stages.map((st) => {
              const isCompleted = currentStage > st.num;
              const isCurrent = currentStage === st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  className={`journey-step-item ${isCurrent ? 'is-current' : ''} ${
                    isCompleted ? 'is-completed' : ''
                  }`}
                  onClick={() => setCurrentStage(st.num)}
                >
                  <div className="journey-step-num-bubble">
                    {isCompleted ? <Check size={12} /> : st.num}
                  </div>
                  <div className="journey-step-labels">
                    <span className="journey-step-name">{st.label}</span>
                    <span className="journey-step-sub">{st.sub}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <button type="button" className="journey-close-btn" onClick={onClose} title="Cancel & Close">
            <X size={18} />
          </button>
        </div>

        {/* 2. Carousel Slide View Container */}
        <div className="journey-slide-container">
          {/* =====================================================================
             STAGE 1: FILIPINO SABONG ROLE ARCHETYPE CAROUSEL
             ===================================================================== */}
          {currentStage === 1 && (
            <div className="journey-slide slide-role-archetypes">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 1: Select Official Filipino Legal Sabong Role Archetype
                </div>
                <div className="slide-intro-desc">
                  Choose a licensed GAB / PD 449 coliseum role archetype. Selecting a card automatically configures department zone, max cash float, and checks the exact regulatory permissions.
                </div>
              </div>

              <div className="roles-carousel-grid">
                {FILIPINO_SABONG_DEFAULT_ROLES.map((role) => {
                  const isSelected = selectedRolePreset?.role_id === role.role_id;
                  return (
                    <div
                      key={role.role_id}
                      className={`role-archetype-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleSelectRolePreset(role)}
                    >
                      <div className="role-card-top-row">
                        <span className="role-card-tag">{role.tag}</span>
                        <span className="role-card-perms-badge">
                          {role.permissions.length} / {ALL_PERMISSION_KEYS.length} Perms
                        </span>
                      </div>

                      <div className="role-card-title">{role.role_name}</div>
                      <div className="role-card-filipino-title">{role.filipino_title}</div>

                      <p className="role-card-desc">{role.description}</p>

                      <div className="role-card-meta-row">
                        <span className="role-meta-item">
                          Zone: <strong>{role.department_zone}</strong>
                        </span>
                        <span className="role-meta-item">
                          Float: <strong>₱{role.max_cash_float.toLocaleString()}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`role-card-select-btn ${isSelected ? 'is-active' : ''}`}
                      >
                        {isSelected ? 'Selected Archetype ✓' : 'Apply Archetype'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================================
             STAGE 2: OPERATOR PROFILE, USERNAME & SECURITY PIN
             ===================================================================== */}
          {currentStage === 2 && (
            <div className="journey-slide slide-operator-identity">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 2: Operator Identification, Username &amp; Hardware Device Binding
                </div>
                <div className="slide-intro-desc">
                  Provide the operator's legal credentials, assign their unique <strong>login username / staff code</strong> and security PIN, and bind them to an authorized hardware terminal for Gate 0 zero-trust security.
                </div>
              </div>

              <div className="slide-form-card">
                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">
                      <User size={13} className="card-title-icon-emerald" />
                      <span>Operator Full Name</span>
                    </label>
                    <input
                      className="form-input is-lg"
                      required
                      placeholder="e.g. Victoriano S. Santos"
                      value={form.full_name}
                      autoFocus
                      onChange={(e) => handleFullNameChange(e.target.value)}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <Hash size={13} className="card-title-icon-emerald" />
                      <span>Operator Username / Staff Code (Sign-In Identifier)</span>
                    </label>
                    <div className="input-with-action-group">
                      <input
                        className="form-input is-lg is-mono"
                        required
                        placeholder="e.g. vsantos, EMP-02, lylemiro"
                        value={form.staff_code}
                        onChange={(e) => {
                          setAutoStaffCode(false);
                          setForm({ ...form, staff_code: e.target.value });
                        }}
                      />
                      <button
                        type="button"
                        className="input-inline-btn"
                        title="Auto-generate username slug from full name"
                        onClick={() => {
                          const slug = form.full_name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
                          setForm((prev) => ({ ...prev, staff_code: slug || 'operator' }));
                          setAutoStaffCode(true);
                        }}
                      >
                        Auto Slug
                      </button>
                    </div>
                    <span className="field-hint-text">
                      Identifier used on the login screen (e.g. <code>lylemiro</code>, <code>EMP-02</code>, <code>teller01</code>).
                    </span>
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">
                      <KeyRound size={13} className="card-title-icon-gold" />
                      <span>Security PIN (4–8 Digits)</span>
                    </label>
                    <div className="input-with-action-group">
                      <input
                        type={showPin ? 'text' : 'password'}
                        className="form-input is-lg is-mono"
                        placeholder={editingEmployee ? 'Leave blank to preserve current PIN' : 'e.g. 1234'}
                        required={!editingEmployee}
                        value={form.pin_code}
                        onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                      />
                      <button
                        type="button"
                        className="input-inline-btn"
                        onClick={() => setShowPin(!showPin)}
                        title={showPin ? 'Hide PIN' : 'Reveal PIN'}
                      >
                        {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <div className="quick-pin-presets-row">
                      <span>Presets:</span>
                      <button
                        type="button"
                        className="pin-preset-pill"
                        onClick={() => setForm((p) => ({ ...p, pin_code: '1234' }))}
                      >
                        1234
                      </button>
                      <button
                        type="button"
                        className="pin-preset-pill"
                        onClick={() => setForm((p) => ({ ...p, pin_code: '0000' }))}
                      >
                        0000
                      </button>
                      <button
                        type="button"
                        className="pin-preset-pill"
                        onClick={() => setForm((p) => ({ ...p, pin_code: '9999' }))}
                      >
                        9999
                      </button>
                      <button
                        type="button"
                        className="pin-preset-pill"
                        onClick={() => {
                          const rnd = Math.floor(1000 + Math.random() * 9000).toString();
                          setForm((p) => ({ ...p, pin_code: rnd }));
                          setShowPin(true);
                        }}
                      >
                        Random
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Assigned Filipino Role Archetype</label>
                    <select
                      className="form-select is-lg"
                      value={form.role}
                      onChange={(e) => handleRoleDropdownChange(e.target.value)}
                    >
                      {FILIPINO_SABONG_DEFAULT_ROLES.map((r) => (
                        <option key={r.role_id} value={r.role_name}>
                          {r.role_name} ({r.permissions.length}/{ALL_PERMISSION_KEYS.length} Perms)
                        </option>
                      ))}
                    </select>
                    <span className="field-hint-text">
                      Selecting a role automatically synchronizes its zone, float, and {ALL_PERMISSION_KEYS.length}-permission checklist.
                    </span>
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Department / Arena Zone</label>
                    <input
                      className="form-input"
                      required
                      value={form.zone}
                      onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <Monitor size={13} className="card-title-icon-emerald" />
                      <span>Bound Hardware Device (Gate 0 Enforcement)</span>
                    </label>
                    <select
                      className="form-select is-lg"
                      value={form.bound_device_code}
                      onChange={(e) => setForm({ ...form, bound_device_code: e.target.value })}
                    >
                      <option value="">-- Any Authorized Coliseum Device --</option>
                      {devices.map((d) => (
                        <option key={d.device_id} value={d.code}>
                          {d.code}: {d.label} • Zone: {d.station_zone || 'Arena'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">
                      <BadgeDollarSign size={13} className="card-title-icon-gold" />
                      <span>Assigned Vault Cash Float (₱)</span>
                    </label>
                    <input
                      type="number"
                      className="form-input is-lg"
                      value={form.cash_float}
                      onChange={(e) => setForm({ ...form, cash_float: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input is-lg"
                      value={form.commission_rate}
                      onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
             STAGE 3: GRANULAR ARBAC MATRIX & ROLES CHECKLIST
             ===================================================================== */}
          {currentStage === 3 && (
            <div className="journey-slide slide-arbac-matrix">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 3: Granular {ALL_PERMISSION_KEYS.length}-Checkbox ARBAC Clearance Matrix &amp; Roles Checklist
                </div>
                <div className="slide-intro-desc">
                  Permissions are pre-selected based on the <strong>{form.role}</strong> archetype. Use the role checklist chips below to quick-apply any archetype, search permissions, or toggle individual checkboxes.
                </div>
              </div>

              {/* Roles Quick-Select Checklist Ribbon */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <span className="checklist-strip-title">
                    <Filter size={13} className="card-title-icon-emerald" />
                    <span>Quick Role Checklist Selector:</span>
                  </span>
                  <span className="checklist-strip-hint">
                    Click any role pill to immediately check its official regulatory permissions.
                  </span>
                </div>
                <div className="roles-checklist-pills-row">
                  {FILIPINO_SABONG_DEFAULT_ROLES.map((r) => {
                    const isSelected = form.role === r.role_name;
                    return (
                      <button
                        key={r.role_id}
                        type="button"
                        className={`role-pill-btn ${isSelected ? 'is-active' : ''}`}
                        onClick={() => handleSelectRolePreset(r)}
                        title={`${r.filipino_title}: ${r.description}`}
                      >
                        <span>{r.role_name.split(' / ')[0]}</span>
                        <span className="role-pill-badge">{r.permissions.length}/{ALL_PERMISSION_KEYS.length}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clearance Stats & Search & Bulk Action Bar */}
              <div className="journey-matrix-actions-bar">
                <div className="matrix-stat-pill">
                  <span>Activated Clearance:</span>
                  <strong>{totalPerms} / {ALL_PERMISSION_KEYS.length} Permissions ({clearancePct}%)</strong>
                </div>

                <div className="matrix-search-box">
                  <Search size={14} className="card-title-icon-emerald" />
                  <input
                    type="text"
                    className="matrix-search-input"
                    placeholder="Search permissions (e.g. weigh, payout, tari, verdict, void)..."
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                  />
                  {permSearch && (
                    <button
                      type="button"
                      className="search-clear-x"
                      onClick={() => setPermSearch('')}
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="matrix-quick-btns">
                  {selectedRolePreset && (
                    <button
                      type="button"
                      className="btn-secondary-gold"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          permissions: [...selectedRolePreset.permissions]
                        }))
                      }
                      title="Reset checkboxes back to selected role archetype defaults"
                    >
                      <RotateCcw size={13} />
                      <span>Reset to Role Defaults</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary-gold"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, permissions: [...ALL_PERMISSION_KEYS] }))
                    }
                  >
                    Check All ({ALL_PERMISSION_KEYS.length})
                  </button>
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() => setForm((prev) => ({ ...prev, permissions: [] }))}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Expansive 3-Column Domain Matrix */}
              <div className="journey-domains-matrix-grid">
                {filteredPermissionGroups.map((grp) => {
                  const grpKeys = grp.permissions.map((p) => p.key);
                  const checkedInGrp = grpKeys.filter((k) => form.permissions.includes(k)).length;
                  const isAllChecked = grpKeys.length > 0 && checkedInGrp === grpKeys.length;

                  return (
                    <div key={grp.domainId} className="journey-domain-card">
                      <label className="journey-domain-card-header">
                        <input
                          type="checkbox"
                          checked={isAllChecked}
                          onChange={() => toggleDomain(grp.permissions)}
                        />
                        <span className="journey-domain-title">
                          {grp.domainTitle} ({checkedInGrp}/{grpKeys.length})
                        </span>
                      </label>

                      <div className="journey-checkboxes-stack">
                        {grp.permissions.map((perm) => {
                          const isChecked = form.permissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`journey-checkbox-row ${isChecked ? 'is-checked' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                              />
                              <div className="journey-perm-text">
                                <span className="journey-perm-label">{perm.label}</span>
                                <span className="journey-perm-key">{perm.key}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================================
             STAGE 4: VERIFICATION & PHYSICAL SQLITE ENROLLMENT
             ===================================================================== */}
          {currentStage === 4 && (
            <div className="journey-slide slide-verification">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 4: Verification &amp; Physical SQLite Database Enrollment
                </div>
                <div className="slide-intro-desc">
                  Review the operator credentials and security clearance passport below before committing changes to the active physical SQLite WAL database.
                </div>
              </div>

              <div className="journey-passport-card">
                <div className="passport-header">
                  <div className="passport-crest-avatar">
                    <ShieldCheck size={36} className="card-title-icon-emerald" />
                  </div>
                  <div className="passport-title-group">
                    <div className="passport-operator-name">
                      {form.full_name || 'Unnamed Operator'}
                    </div>
                    <div className="passport-username-tag">
                      Sign-In Username: <strong>{form.staff_code || 'Unassigned'}</strong>
                    </div>
                    <div className="passport-role-tag">{form.role}</div>
                  </div>
                  <div className="passport-status-stamp">
                    <CheckCircle2 size={16} />
                    <span>ZERO-TRUST READY</span>
                  </div>
                </div>

                <div className="passport-details-grid">
                  <div className="passport-field">
                    <span className="passport-label">Username / Staff Code</span>
                    <span className="passport-value is-mono is-emerald">
                      {form.staff_code || 'Auto-generated'}
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Assigned Department</span>
                    <span className="passport-value">{form.zone}</span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Bound Hardware Device</span>
                    <span className="passport-value">
                      {form.bound_device_code ? `Device: ${form.bound_device_code}` : 'Any Authorized Terminal'}
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Vault Cash Float</span>
                    <span className="passport-value is-gold">
                      ₱{Number(form.cash_float || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Security PIN</span>
                    <span className="passport-value is-mono">
                      {form.pin_code ? `${form.pin_code} (Active)` : '(Preserved Current PIN)'}
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Clearance Percentage</span>
                    <span className="passport-value is-emerald">
                      {totalPerms} / {ALL_PERMISSION_KEYS.length} Permissions ({clearancePct}%)
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Target SQLite WAL DB</span>
                    <span className="passport-value is-mono">
                      {activeTenant?.db_file_name || 'Physical SQLite DB'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Navigation Footer Bar (Direct Submit - No Next Button) */}
        <div className="journey-nav-footer">
          <div className="journey-footer-left">
            <span className="journey-active-summary">
              Role: <strong>{form.role.split(' / ')[0]}</strong> • <strong>{totalPerms} / {ALL_PERMISSION_KEYS.length}</strong> Perms ({clearancePct}%)
            </span>
          </div>

          <div className="journey-footer-right">
            <button type="button" className="btn-cancel-flat" onClick={onClose}>
              Cancel
            </button>

            <button
              type="button"
              className="btn-primary-emerald is-submit-btn"
              disabled={submitting}
              onClick={handleSubmitEnrollment}
            >
              <ShieldCheck size={16} />
              <span>
                {submitting
                  ? 'Writing to SQLite WAL...'
                  : editingEmployee
                  ? 'Confirm & Save Operator Changes'
                  : 'Enroll Operator in Active Tenant DB'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


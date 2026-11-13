import React, { useState, useEffect } from 'react';
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
  RotateCcw
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

  const [form, setForm] = useState({
    full_name: '',
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
        full_name: editingEmployee.full_name,
        role: editingEmployee.role,
        zone: editingEmployee.zone,
        bound_device_code: editingEmployee.bound_device_code || '',
        pin_code: '',
        cash_float: String(editingEmployee.cash_float ?? 0),
        commission_rate: String(editingEmployee.commission_rate ?? 0.02),
        permissions: Array.isArray(editingEmployee.permissions)
          ? [...editingEmployee.permissions]
          : []
      });
      // Find matching preset if any
      const matching = FILIPINO_SABONG_DEFAULT_ROLES.find(
        (r) => r.role_name === editingEmployee.role
      );
      setSelectedRolePreset(matching || null);
      // If editing, start at stage 2 or 3
      setCurrentStage(2);
    } else {
      // Default to Superadmin
      const defaultPreset = FILIPINO_SABONG_DEFAULT_ROLES[0];
      setSelectedRolePreset(defaultPreset);
      setForm({
        full_name: '',
        role: defaultPreset.role_name,
        zone: defaultPreset.department_zone,
        bound_device_code: 'T01',
        pin_code: '1234',
        cash_float: String(defaultPreset.max_cash_float),
        commission_rate: '0.00',
        permissions: [...defaultPreset.permissions]
      });
      setCurrentStage(1);
    }
  }, [editingEmployee, isOpen]);

  if (!isOpen) return null;

  const totalPerms = form.permissions.length;
  const clearancePct = Math.round((totalPerms / 23) * 100);

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
    // Smoothly progress to next slide in journey
    setCurrentStage(2);
  };

  const handleNext = () => {
    if (currentStage === 2 && !form.full_name.trim()) {
      alert('Please enter Operator Full Name before continuing.');
      return;
    }
    setCurrentStage((s) => Math.min(4, s + 1));
  };

  const handlePrev = () => {
    setCurrentStage((s) => Math.max(1, s - 1));
  };

  const handleSubmitEnrollment = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const stages = [
    { num: 1, label: 'Role Archetype', sub: 'Filipino Sabong Context' },
    { num: 2, label: 'Operator Identity', sub: 'Profile & Device Binding' },
    { num: 3, label: 'ARBAC Matrix', sub: '23-Checkbox Clearance' },
    { num: 4, label: 'Verification', sub: 'Physical DB Enrollment' }
  ];

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
                ? `Update Operator: ${editingEmployee.staff_code}`
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
                  onClick={() => {
                    // Only allow jumping back or jumping to completed steps
                    if (st.num < currentStage || (currentStage === 1 && form.full_name)) {
                      setCurrentStage(st.num);
                    }
                  }}
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
                          {role.permissions.length} / 23 Perms
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
                        {isSelected ? 'Selected Preset ✓' : 'Select & Continue →'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================================
             STAGE 2: OPERATOR PROFILE & HARDWARE DEVICE BINDING
             ===================================================================== */}
          {currentStage === 2 && (
            <div className="journey-slide slide-operator-identity">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 2: Operator Identification &amp; Hardware Device Binding
                </div>
                <div className="slide-intro-desc">
                  Provide the operator's legal coliseum credentials, assign their physical security PIN, and bind them to an authorized hardware terminal for Gate 0 zero-trust enforcement.
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
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">
                      <KeyRound size={13} className="card-title-icon-gold" />
                      <span>Security PIN (4–6 Digits)</span>
                    </label>
                    <input
                      type="password"
                      className="form-input is-lg"
                      placeholder={editingEmployee ? 'Leave blank to preserve current PIN' : 'e.g. 1234'}
                      required={!editingEmployee}
                      value={form.pin_code}
                      onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Assigned Filipino Role Title</label>
                    <input
                      className="form-input"
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Department / Arena Zone</label>
                    <input
                      className="form-input"
                      required
                      value={form.zone}
                      onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
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
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
             STAGE 3: GRANULAR 23-PERMISSION ARBAC MATRIX FINE-TUNING
             ===================================================================== */}
          {currentStage === 3 && (
            <div className="journey-slide slide-arbac-matrix">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 3: Granular 23-Checkbox ARBAC Clearance Matrix
                </div>
                <div className="slide-intro-desc">
                  Permissions are pre-selected based on the <strong>{form.role}</strong> archetype. You can toggle individual checkboxes or domains to customize this operator's zero-trust clearance.
                </div>
              </div>

              {/* Clearance Stats & Bulk Action Bar */}
              <div className="journey-matrix-actions-bar">
                <div className="matrix-stat-pill">
                  <span>Activated Clearance:</span>
                  <strong>{totalPerms} / 23 Permissions ({clearancePct}%)</strong>
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
                    Check All 23
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
                {ARBAC_PERMISSION_GROUPS.map((grp) => {
                  const grpKeys = grp.permissions.map((p) => p.key);
                  const checkedInGrp = grpKeys.filter((k) => form.permissions.includes(k)).length;
                  const isAllChecked = checkedInGrp === grpKeys.length;

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
                    <div className="passport-role-tag">{form.role}</div>
                  </div>
                  <div className="passport-status-stamp">
                    <CheckCircle2 size={16} />
                    <span>ZERO-TRUST READY</span>
                  </div>
                </div>

                <div className="passport-details-grid">
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
                      {form.pin_code ? '•••••• (Set)' : '(Preserved)'}
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Clearance Percentage</span>
                    <span className="passport-value is-emerald">
                      {totalPerms} / 23 Permissions ({clearancePct}%)
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Target SQLite WAL DB</span>
                    <span className="passport-value is-mono">
                      {activeTenant?.db_file_name || 'tenant_sjc_01_mwdb7iq3.db'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Carousel Navigation Footer Bar */}
        <div className="journey-nav-footer">
          <div className="journey-footer-left">
            {currentStage > 1 && (
              <button
                type="button"
                className="btn-secondary-gold"
                onClick={handlePrev}
              >
                <ChevronLeft size={16} />
                <span>Previous Stage</span>
              </button>
            )}
            <span className="journey-stage-counter">
              Stage <strong>{currentStage}</strong> of <strong>4</strong>
            </span>
          </div>

          <div className="journey-footer-right">
            <button type="button" className="btn-cancel-flat" onClick={onClose}>
              Cancel
            </button>

            {currentStage < 4 ? (
              <button
                type="button"
                className="btn-primary-emerald"
                onClick={handleNext}
              >
                <span>Continue to Next Stage</span>
                <ChevronRight size={16} />
              </button>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


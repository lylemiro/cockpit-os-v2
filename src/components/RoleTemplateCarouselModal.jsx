import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  KeyRound,
  BadgeDollarSign,
  Building2,
  Check,
  RotateCcw
} from 'lucide-react';
import {
  ARBAC_PERMISSION_GROUPS,
  ALL_PERMISSION_KEYS,
  FILIPINO_SABONG_DEFAULT_ROLES
} from './arbacCatalog.js';

export function RoleTemplateCarouselModal({
  isOpen,
  onClose,
  editingRole,
  submitting,
  onSubmit
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const [form, setForm] = useState({
    role_name: '',
    department_zone: 'Ring Pit / Ruedo',
    max_cash_float: '0',
    commission_rate: '0.00',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (editingRole) {
      setForm({
        role_name: editingRole.role_name || '',
        department_zone: editingRole.department_zone || 'Arena Operations',
        max_cash_float: String(editingRole.max_cash_float ?? 0),
        commission_rate: String(editingRole.commission_rate ?? 0.00),
        description: editingRole.description || '',
        permissions: Array.isArray(editingRole.permissions)
          ? [...editingRole.permissions]
          : typeof editingRole.permissions === 'string'
          ? JSON.parse(editingRole.permissions || '[]')
          : []
      });
      const matching = FILIPINO_SABONG_DEFAULT_ROLES.find(
        (r) => r.role_name === editingRole.role_name
      );
      setSelectedPreset(matching || null);
      setCurrentStage(1);
    } else {
      const defaultPreset = FILIPINO_SABONG_DEFAULT_ROLES[3] || FILIPINO_SABONG_DEFAULT_ROLES[0]; // Sentenciador
      setSelectedPreset(defaultPreset);
      setForm({
        role_name: defaultPreset.role_name,
        department_zone: defaultPreset.department_zone,
        max_cash_float: String(defaultPreset.max_cash_float),
        commission_rate: '0.00',
        description: defaultPreset.description,
        permissions: [...defaultPreset.permissions]
      });
      setCurrentStage(1);
    }
  }, [editingRole, isOpen]);

  const totalPerms = form.permissions.length;
  const clearancePct = Math.round((totalPerms / ALL_PERMISSION_KEYS.length) * 100);

  const applyArchetypePreset = (preset) => {
    setSelectedPreset(preset);
    setForm((prev) => ({
      ...prev,
      role_name: preset.role_name,
      department_zone: preset.department_zone,
      max_cash_float: String(preset.max_cash_float),
      description: preset.description,
      permissions: [...preset.permissions]
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
    const allIn = domainPerms.every((k) => form.permissions.includes(k));
    if (allIn) {
      setForm((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((k) => !domainPerms.includes(k))
      }));
    } else {
      const merged = Array.from(new Set([...form.permissions, ...domainPerms]));
      setForm((prev) => ({
        ...prev,
        permissions: merged
      }));
    }
  };

  const handleNext = () => {
    if (currentStage === 1) {
      if (!form.role_name.trim()) {
        alert('Please enter a role template name or pick an archetype.');
        return;
      }
    }
    if (currentStage < 3) {
      setCurrentStage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => prev - 1);
    }
  };

  const handleSubmitRole = () => {
    if (!form.role_name.trim()) {
      alert('Role template name is required.');
      return;
    }
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="carousel-journey-backdrop" onClick={onClose}>
      <div
        className="carousel-journey-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Bar with Step Tracker */}
        <div className="journey-header-bar">
          <div className="journey-title-block">
            <div className="journey-icon-badge is-gold">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="journey-main-title">
                {editingRole
                  ? `Modify Role Template: ${editingRole.role_name}`
                  : 'Create Granular ARBAC Role Template'}
              </h3>
              <p className="journey-sub-title">
                3-Stage Carousel Journey • Define official Filipino Sabong roles, department authority & security matrix
              </p>
            </div>
          </div>

          <div className="journey-steps-tracker">
            <div
              className={`journey-step-item ${
                currentStage === 1
                  ? 'is-current'
                  : currentStage > 1
                  ? 'is-completed'
                  : ''
              }`}
              onClick={() => setCurrentStage(1)}
            >
              <div className="step-number-bubble">
                {currentStage > 1 ? <Check size={14} /> : '1'}
              </div>
              <span className="step-label">Role Archetype</span>
            </div>

            <div className="journey-step-divider" />

            <div
              className={`journey-step-item ${
                currentStage === 2
                  ? 'is-current'
                  : currentStage > 2
                  ? 'is-completed'
                  : ''
              }`}
              onClick={() => setCurrentStage(2)}
            >
              <div className="step-number-bubble">
                {currentStage > 2 ? <Check size={14} /> : '2'}
              </div>
              <span className="step-label">Clearance Matrix</span>
            </div>

            <div className="journey-step-divider" />

            <div
              className={`journey-step-item ${
                currentStage === 3 ? 'is-current' : ''
              }`}
              onClick={() => setCurrentStage(3)}
            >
              <div className="step-number-bubble">3</div>
              <span className="step-label">Verification</span>
            </div>
          </div>

          <button
            type="button"
            className="journey-close-btn"
            onClick={onClose}
            title="Close Journey"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Slide Content Area */}
        <div className="journey-slide-container">
          {/* ================================= STAGE 1: ROLE IDENTITY ================================= */}
          {currentStage === 1 && (
            <div className="journey-slide-stage">
              <div className="stage-hero-banner">
                <div className="hero-banner-content">
                  <span className="hero-eyebrow">STAGE 01 OF 03 • IDENTITY & SCOPE</span>
                  <h4>Select Official Filipino Sabong Template or Create Custom Role</h4>
                  <p>
                    Choose an official regulatory role defined under Presidential Decree 449 and GAB / LGU standards, or customize title and zone boundaries.
                  </p>
                </div>
              </div>

              {/* Archetypes Selector Grid */}
              <div className="roles-carousel-heading">
                <Sparkles size={16} />
                <span>Standard Filipino Sabong Archetypes (Click to Pre-populate):</span>
              </div>

              <div className="roles-carousel-grid">
                {FILIPINO_SABONG_DEFAULT_ROLES.map((archetype) => {
                  const isSelected = selectedPreset?.role_name === archetype.role_name;
                  return (
                    <div
                      key={archetype.role_name}
                      className={`role-archetype-card ${
                        isSelected ? 'is-selected' : ''
                      }`}
                      onClick={() => applyArchetypePreset(archetype)}
                    >
                      <div className="role-card-top">
                        <span className="role-card-name">
                          {archetype.role_name}
                        </span>
                        {isSelected && (
                          <div className="role-selected-badge">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <div className="role-card-department">
                        <Building2 size={12} />
                        <span>{archetype.department_zone}</span>
                      </div>
                      <p className="role-card-desc">{archetype.description}</p>
                      <div className="role-card-meta-pills">
                        <span className="meta-pill-clearance">
                          {archetype.permissions.length} / {ALL_PERMISSION_KEYS.length} Permissions
                        </span>
                        {archetype.max_cash_float > 0 && (
                          <span className="meta-pill-float">
                            ₱{archetype.max_cash_float.toLocaleString()} Float
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Overrides Form */}
              <div className="stage-form-section">
                <h5 className="form-section-title">Role Attributes & Scope Details:</h5>
                <div className="stage-input-grid">
                  <div className="stage-form-group">
                    <label>Role Template Name *</label>
                    <input
                      type="text"
                      className="input-stage"
                      value={form.role_name}
                      onChange={(e) =>
                        setForm({ ...form, role_name: e.target.value })
                      }
                      placeholder="e.g. Mesa de Control / Hukom sa Mesa"
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Department / Arena Zone</label>
                    <input
                      type="text"
                      className="input-stage"
                      value={form.department_zone}
                      onChange={(e) =>
                        setForm({ ...form, department_zone: e.target.value })
                      }
                      placeholder="e.g. Ring Pit / Ruedo / Mesa de Control"
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Default Cash Float Cap (₱)</label>
                    <input
                      type="number"
                      className="input-stage"
                      value={form.max_cash_float}
                      onChange={(e) =>
                        setForm({ ...form, max_cash_float: e.target.value })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Commission Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-stage"
                      value={form.commission_rate}
                      onChange={(e) =>
                        setForm({ ...form, commission_rate: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="stage-form-group mt-3">
                  <label>Scope of Regulatory Authority & Duty</label>
                  <textarea
                    rows={2}
                    className="input-stage"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Describe duties, sign-offs, and operational accountability in the coliseum..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================= STAGE 2: GRANULAR MATRIX ================================= */}
          {currentStage === 2 && (
            <div className="journey-slide-stage">
              <div className="stage-hero-banner">
                <div className="hero-banner-content">
                  <span className="hero-eyebrow">STAGE 02 OF 03 • ZERO-TRUST ARBAC MATRIX</span>
                  <h4>Configure Granular {ALL_PERMISSION_KEYS.length}-Checkbox Permissions</h4>
                  <p>
                    Every button, table view, and mutation in COCKPIT OS v2 is guarded by these {ALL_PERMISSION_KEYS.length} cryptographic permission keys.
                  </p>
                </div>
                <div className="hero-clearance-stat">
                  <div className="stat-big-number">
                    {totalPerms}
                    <span className="stat-total-den">/{ALL_PERMISSION_KEYS.length}</span>
                  </div>
                  <div className="stat-percentage-bar">
                    <div
                      className="stat-fill-bar"
                      style={{ width: `${clearancePct}%` }}
                    />
                  </div>
                  <span className="stat-clearance-text">
                    {clearancePct}% Clearance Level
                  </span>
                </div>
              </div>

              {/* Quick Actions Header */}
              <div className="matrix-toolbar">
                <div className="matrix-toolbar-left">
                  <span className="matrix-active-count">
                    Active Permissions for <strong>{form.role_name || 'Role'}</strong>: <strong>{totalPerms}</strong> of {ALL_PERMISSION_KEYS.length}
                  </span>
                </div>
                <div className="matrix-toolbar-actions">
                  <button
                    type="button"
                    className="btn-quick-check"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        permissions: [...ALL_PERMISSION_KEYS]
                      }))
                    }
                  >
                    <Check size={14} />
                    <span>Check All ({ALL_PERMISSION_KEYS.length})</span>
                  </button>
                  <button
                    type="button"
                    className="btn-quick-clear"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, permissions: [] }))
                    }
                  >
                    <RotateCcw size={14} />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {/* 3-Column Domain Groups Grid */}
              <div className="journey-domains-matrix-grid">
                {ARBAC_PERMISSION_GROUPS.map((group) => {
                  const groupPermKeys = group.permissions.map((p) => p.key);
                  const activeInGroup = groupPermKeys.filter((k) =>
                    form.permissions.includes(k)
                  ).length;
                  const allActive =
                    activeInGroup === groupPermKeys.length &&
                    groupPermKeys.length > 0;

                  return (
                    <div key={group.domainId} className="domain-matrix-card">
                      <div className="domain-card-header">
                        <label className="domain-checkbox-label">
                          <input
                            type="checkbox"
                            checked={allActive}
                            onChange={() => toggleDomain(groupPermKeys)}
                          />
                          <span className="domain-header-title">
                            {group.domainTitle}
                          </span>
                        </label>
                        <span className="domain-active-badge">
                          {activeInGroup} / {groupPermKeys.length}
                        </span>
                      </div>

                      <div className="domain-permissions-list">
                        {group.permissions.map((perm) => {
                          const isChecked = form.permissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`perm-item-row ${
                                isChecked ? 'is-checked' : ''
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(perm.key)}
                              />
                              <div className="perm-item-text">
                                <span className="perm-label">{perm.label}</span>
                                <span className="perm-key-tag">{perm.key}</span>
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

          {/* ================================= STAGE 3: VERIFICATION ================================= */}
          {currentStage === 3 && (
            <div className="journey-slide-stage">
              <div className="stage-hero-banner">
                <div className="hero-banner-content">
                  <span className="hero-eyebrow">STAGE 03 OF 03 • FINAL CONFIRMATION</span>
                  <h4>Review & Publish Role Template to Master Registry</h4>
                  <p>
                    Verify department scope and clearance. Once published, this role will immediately be available across all tenant databases.
                  </p>
                </div>
              </div>

              <div className="journey-passport-card">
                <div className="passport-header">
                  <div className="passport-avatar-bubble">
                    <Layers size={32} />
                  </div>
                  <div className="passport-hero-info">
                    <span className="passport-type-badge">ROLE TEMPLATE</span>
                    <h4 className="passport-operator-name">
                      {form.role_name}
                    </h4>
                    <p className="passport-role-tag">{form.department_zone}</p>
                  </div>
                  <div className="passport-status-stamp">
                    <CheckCircle2 size={16} />
                    <span>CATALOG READY</span>
                  </div>
                </div>

                <div className="passport-details-grid">
                  <div className="passport-field">
                    <span className="passport-label">Department / Arena Zone</span>
                    <span className="passport-value">{form.department_zone}</span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Default Cash Float</span>
                    <span className="passport-value is-gold">
                      ₱{Number(form.max_cash_float || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Commission Rate</span>
                    <span className="passport-value">
                      {(Number(form.commission_rate || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Active Permissions</span>
                    <span className="passport-value is-emerald">
                      {totalPerms} / {ALL_PERMISSION_KEYS.length} ({clearancePct}% Clearance)
                    </span>
                  </div>
                  <div className="passport-field full-row">
                    <span className="passport-label">Duties Description</span>
                    <span className="passport-value">
                      {form.description || 'Standard arena operations duties.'}
                    </span>
                  </div>
                  <div className="passport-field full-row">
                    <span className="passport-label">Destination Database</span>
                    <span className="passport-value is-mono">
                      master_control_plane.db → arbac_roles
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
              Stage <strong>{currentStage}</strong> of <strong>3</strong>
            </span>
          </div>

          <div className="journey-footer-right">
            <button type="button" className="btn-cancel-flat" onClick={onClose}>
              Cancel
            </button>

            {currentStage < 3 ? (
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
                onClick={handleSubmitRole}
              >
                <ShieldCheck size={16} />
                <span>
                  {submitting
                    ? 'Publishing to SQLite Master...'
                    : editingRole
                    ? 'Save Role Template Changes'
                    : 'Publish Role Template to Catalog'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


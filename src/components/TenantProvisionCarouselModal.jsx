import React, { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Building2,
  FileText,
  KeyRound,
  Check,
  Sparkles
} from 'lucide-react';

export function TenantProvisionCarouselModal({
  isOpen,
  onClose,
  submitting,
  onSubmit
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [form, setForm] = useState({
    tenant_code: 'SJC-02',
    arena_name: '',
    gab_license: 'GAB-COL-2026-02',
    mayors_permit: 'LGU-MP-2026-02',
    bir_cas_min: 'MIN-2026-0002',
    full_name: '',
    role: 'Superadmin / Pangulo ng Sabungan',
    zone: 'Executive Command Console',
    pin_code: '1234'
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStage === 1) {
      if (!form.tenant_code.trim() || !form.arena_name.trim()) {
        alert('Please fill in Coliseum Arena Name and Tenant Code.');
        return;
      }
    }
    if (currentStage === 2) {
      if (!form.gab_license.trim() || !form.bir_cas_min.trim()) {
        alert('GAB License and BIR CAS Machine Identification Number (MIN) are required.');
        return;
      }
    }
    if (currentStage < 4) {
      setCurrentStage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStage > 1) {
      setCurrentStage((prev) => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.pin_code.trim()) {
      alert('Please provide Primary Superadmin name and security PIN.');
      return;
    }
    onSubmit(form);
  };

  const dbFileName = `tenant_${form.tenant_code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_isolated.db`;

  return (
    <div className="carousel-journey-backdrop" onClick={onClose}>
      <div
        className="carousel-journey-modal is-fullscreen"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="journey-header-bar">
          <div className="journey-title-block">
            <div className="journey-icon-badge">
              <HardDrive size={22} />
            </div>
            <div>
              <h3 className="journey-main-title">
                Provision New Isolated Tenant Database Drive
              </h3>
              <p className="journey-sub-title">
                4-Stage Carousel Journey • Dedicated physical SQLite WAL file per coliseum venue
              </p>
            </div>
          </div>

          <div className="journey-steps-tracker">
            <div
              className={`journey-step-item ${currentStage === 1 ? 'is-current' : currentStage > 1 ? 'is-completed' : ''}`}
              onClick={() => setCurrentStage(1)}
            >
              <div className="step-number-bubble">
                {currentStage > 1 ? <Check size={14} /> : '1'}
              </div>
              <span className="step-label">Venue Identity</span>
            </div>

            <div className="journey-step-divider" />

            <div
              className={`journey-step-item ${currentStage === 2 ? 'is-current' : currentStage > 2 ? 'is-completed' : ''}`}
              onClick={() => setCurrentStage(2)}
            >
              <div className="step-number-bubble">
                {currentStage > 2 ? <Check size={14} /> : '2'}
              </div>
              <span className="step-label">Regulatory Permits</span>
            </div>

            <div className="journey-step-divider" />

            <div
              className={`journey-step-item ${currentStage === 3 ? 'is-current' : currentStage > 3 ? 'is-completed' : ''}`}
              onClick={() => setCurrentStage(3)}
            >
              <div className="step-number-bubble">
                {currentStage > 3 ? <Check size={14} /> : '3'}
              </div>
              <span className="step-label">Pangulo / Superadmin</span>
            </div>

            <div className="journey-step-divider" />

            <div
              className={`journey-step-item ${currentStage === 4 ? 'is-current' : ''}`}
              onClick={() => setCurrentStage(4)}
            >
              <div className="step-number-bubble">4</div>
              <span className="step-label">Provision WAL</span>
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

        {/* Content */}
        <div className="journey-slide-container">
          {currentStage === 1 && (
            <div className="journey-slide-stage">
              <div className="stage-hero-banner">
                <div className="hero-banner-content">
                  <span className="hero-eyebrow">STAGE 01 OF 04 • VENUE & DRIVE PARTITION</span>
                  <h4>Coliseum Arena Venue Details</h4>
                  <p>
                    Each coliseum venue operates on an isolated physical SQLite database file with zero cross-tenant contamination.
                  </p>
                </div>
              </div>

              <div className="stage-form-section">
                <div className="stage-input-grid">
                  <div className="stage-form-group">
                    <label>Tenant Partition Drive Code (e.g. CEBU-01, DVO-01) *</label>
                    <input
                      type="text"
                      className="input-stage"
                      value={form.tenant_code}
                      onChange={(e) =>
                        setForm({ ...form, tenant_code: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g. CEBU-01"
                      required
                    />
                  </div>
                  <div className="stage-form-group">
                    <label>Coliseum Arena Venue Name *</label>
                    <input
                      type="text"
                      className="input-stage"
                      value={form.arena_name}
                      onChange={(e) => setForm({ ...form, arena_name: e.target.value })}
                      placeholder="e.g. Cebu Coliseum Complex & Recreation"
                      required
                    />
                  </div>
                </div>

                <div className="venue-preview-box mt-3">
                  <HardDrive size={18} className="card-title-icon-emerald" />
                  <span>
                    Target Physical Drive File: <code>server/db/tenants/{dbFileName}</code>
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStage === 2 && (
            <div className="journey-slide-stage">
              <div className="stage-hero-banner">
                <div className="hero-banner-content">
                  <span className="hero-eyebrow">STAGE 02 OF 04 • LEGAL ACCREDITATION</span>
                  <h4>GAB License, Mayor's Permit &amp; BIR CAS MIN</h4>
                  <p>
                    Required Philippine regulatory registration numbers stamped on all official match receipts and audit ledgers.
                  </p>
                </div>
              </div>

              <div className="stage-form-section">
                <div className="stage-input-grid">
                  <div className="stage-form-group">
                    <label>GAB Coliseum Operator License No. *</label>
                    <input
                      type="text"
                      className="input-stage"
                      value={form.gab_license}
                      onChange={(e) => setForm({ ...form, gab_license: e.target.value })}
                      placeholder="e.g. GAB-COL-2026-02"
                      required
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>LGU Mayor's Coliseum Business Permit</label>
                    <input
                      type="text"
                      className="input-stage"
                      value={form.mayors_permit}
                      onChange={(e) => setForm({ ...form, mayors_permit: e.target.value })}
                      placeholder="e.g. LGU-MP-2026-02"
                    />
                  </div>
                </div>

                <div className="stage-form-group mt-3">
                  <label>BIR CAS Machine Identification Number (MIN) *</label>
                  <input
                    type="text"
                    className="input-stage"
                    value={form.bir_cas_min}
                    onChange={(e) => setForm({ ...form, bir_cas_min: e.target.value })}
                    placeholder="e.g. MIN-2026-0002"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStage === 3 && (
            <div className="journey-slide-stage">
              <div className="stage-hero-banner">
                <div className="hero-banner-content">
                  <span className="hero-eyebrow">STAGE 03 OF 04 • PRIMARY OPERATOR</span>
                  <h4>Pangulo ng Sabungan / Initial Superadmin Account</h4>
                  <p>
                    This root operator is granted all 23 ARBAC permissions and provisioned inside the new database as EMP-01.
                  </p>
                </div>
              </div>

              <div className="stage-form-section">
                <div className="stage-input-grid">
                  <div className="stage-form-group">
                    <label>Pangulo Full Legal Name *</label>
                    <input
                      type="text"
                      className="input-stage"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      placeholder="e.g. Arch. Rodrigo M. Tan"
                      required
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Security PIN Code (4–6 digits) *</label>
                    <input
                      type="password"
                      className="input-stage"
                      value={form.pin_code}
                      onChange={(e) => setForm({ ...form, pin_code: e.target.value })}
                      placeholder="••••"
                      required
                    />
                  </div>
                </div>

                <div className="stage-form-group mt-3">
                  <label>Initial ARBAC Designation</label>
                  <input
                    type="text"
                    className="input-stage"
                    value={form.role}
                    disabled
                  />
                  <small className="text-muted mt-1">
                    Auto-assigned 23 of 23 permissions under Executive Security domain.
                  </small>
                </div>
              </div>
            </div>
          )}

          {currentStage === 4 && (
            <div className="journey-slide-stage">
              <div className="stage-hero-banner">
                <div className="hero-banner-content">
                  <span className="hero-eyebrow">STAGE 04 OF 04 • WAL SYNCHRONIZATION</span>
                  <h4>Review &amp; Provision Physical Database</h4>
                  <p>
                    Clicking provision will initialize SQLite WAL mode, run migration schemas, and register drive in master catalog.
                  </p>
                </div>
              </div>

              <div className="journey-passport-card">
                <div className="passport-header">
                  <div className="passport-avatar-bubble">
                    <HardDrive size={32} />
                  </div>
                  <div className="passport-hero-info">
                    <span className="passport-type-badge">PHYSICAL SQLITE DRIVE</span>
                    <h4 className="passport-operator-name">
                      {form.arena_name || 'Unnamed Arena'}
                    </h4>
                    <p className="passport-role-tag">{form.tenant_code}: Partition</p>
                  </div>
                  <div className="passport-status-stamp">
                    <CheckCircle2 size={16} />
                    <span>ISOLATED WAL READY</span>
                  </div>
                </div>

                <div className="passport-details-grid">
                  <div className="passport-field">
                    <span className="passport-label">GAB License</span>
                    <span className="passport-value">{form.gab_license}</span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">BIR CAS MIN</span>
                    <span className="passport-value is-mono">{form.bir_cas_min}</span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Superadmin (EMP-01)</span>
                    <span className="passport-value is-emerald">{form.full_name}</span>
                  </div>
                  <div className="passport-field">
                    <span className="passport-label">Dedicated Database File</span>
                    <span className="passport-value is-mono">{dbFileName}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
                onClick={handleSubmit}
              >
                <ShieldCheck size={16} />
                <span>
                  {submitting
                    ? 'Provisioning Physical SQLite File...'
                    : 'Provision Physical Tenant Database'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


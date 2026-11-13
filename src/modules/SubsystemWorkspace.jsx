import React, { useState, useEffect } from 'react';
import { Upload, X, Trophy, Edit3, Lock, FileText, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useArena } from '../context/ArenaContext.jsx';
import { DatabaseRelationshipGraph } from '../components/DatabaseRelationshipGraph.jsx';
import { ArbacManager } from '../components/ArbacManager.jsx';

export function SubsystemWorkspace({ moduleId }) {
  const {
    arenaState,
    loading,
    submitting,
    mutateApi,
    setActiveModuleId,
    theme,
    toggleTheme,
    wallpaper,
    setWallpaper,
    soundEnabled,
    toggleSound
  } = useArena();

  const [notice, setNotice] = useState(null);
  const [dbTab, setDbTab] = useState('graph'); // 'graph' | 'tables'
  const [isEditingArena, setIsEditingArena] = useState(false);
  const [paperworkDocType, setPaperworkDocType] = useState('bout_sheet'); // 'bout_sheet' | 'tari_clearance' | 'plasada_voucher'

  // Form states for dynamic creation across modules
  const [arenaForm, setArenaForm] = useState({
    arena_name: '',
    gab_license: '',
    mayors_permit: '',
    bir_cas_min: '',
    plasada_rate: '0.10',
    logo_url: '',
    security_pin: '',
    min_rest_gap: '4',
    vip_seats: '320',
    lower_box_seats: '1450',
    upper_grandstand_seats: '3200',
    total_cockhouse_bays: '120'
  });

  const [deviceForm, setDeviceForm] = useState({
    code: '',
    label: '',
    station_zone: 'Center Cashier Cage',
    mac_address: '',
    ip_address: ''
  });

  const [empForm, setEmpForm] = useState({
    full_name: '',
    role: 'Head Monton Cashier',
    zone: 'Center Cashier Cage',
    cash_float: '50000',
    permissions_count: '48'
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    format: '4-Cock Stag Derby',
    event_date: new Date().toISOString().slice(0, 10),
    min_bet: '5500',
    pot_fee: '55000',
    promoter: '',
    plasada_split: '70/30',
    min_weight_grams: '1800',
    max_weight_grams: '2450',
    weight_tolerance_grams: '30',
    derby_rules: 'Standard GAB / PD 449 Rules. Wing & leg band verified. Max weight variance 30g.'
  });

  const [entryForm, setEntryForm] = useState({
    entry_name: '',
    owner_gallero: '',
    syndicate_tier: 'VIP Ringside',
    pot_payment_status: 'PAID'
  });

  const [roosterForm, setRoosterForm] = useState({
    entry_id: '',
    wing_band: '',
    leg_band: '',
    weight_grams: '',
    plumage_color: 'Alimbuyugin (Red/Black)',
    leg_color: 'Dilaw (Yellow)'
  });

  const [wagerForm, setWagerForm] = useState({
    fight_number: '',
    side: 'MERON',
    amount: ''
  });

  const [bayForm, setBayForm] = useState({
    bay_number: '',
    assigned_entry: '',
    room_suite: '',
    rooster_count: '4',
    biosecurity_status: 'DISINFECTED'
  });

  const [vetForm, setVetForm] = useState({
    fight_number: '',
    wing_band: '',
    entry_name: '',
    manggagamot: '',
    procedure_notes: ''
  });

  const [invForm, setInvForm] = useState({
    sku: '',
    item_name: '',
    category: 'Tari Armory',
    stock_qty: '',
    unit: 'pcs',
    prerequisite_kit: '',
    custodian: ''
  });

  // Pre-fill arenaForm whenever current config is loaded from SQLite SSOT (only if not actively editing)
  useEffect(() => {
    if (arenaState?.arenaConfig && !isEditingArena) {
      const c = arenaState.arenaConfig;
      setArenaForm((prev) => ({
        ...prev,
        arena_name: c.arena_name || '',
        gab_license: c.gab_license || '',
        mayors_permit: c.mayors_permit || '',
        bir_cas_min: c.bir_cas_min || '',
        plasada_rate: c.plasada_rate != null ? String(c.plasada_rate) : '0.10',
        logo_url: c.logo_url || '',
        security_pin: '',
        min_rest_gap: String(c.min_rest_gap || 4),
        vip_seats: String(c.vip_seats || 320),
        lower_box_seats: String(c.lower_box_seats || 1450),
        upper_grandstand_seats: String(c.upper_grandstand_seats || 3200),
        total_cockhouse_bays: String(c.total_cockhouse_bays || 120)
      }));
    }
  }, [arenaState?.arenaConfig, isEditingArena]);

  if (loading || !arenaState) {
    return (
      <div className="skeleton-stack">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line" />
      </div>
    );
  }

  const handleAction = async (endpoint, method, payload, successMessage) => {
    setNotice(null);
    const result = await mutateApi(endpoint, method, payload);
    if (result.ok && successMessage) {
      setNotice(successMessage);
    }
    return result;
  };

  // 1. COMMAND OVERVIEW (Gate 0 - Gate 8 Matrix)
  if (moduleId === 'command-overview') {
    const gates = arenaState.gates || [];
    return (
      <>
        <div className="gate-cards-grid">
          {gates.map((g) => (
            <div
              key={g.gateId}
              className={`gate-status-card ${g.passed ? 'is-passed' : ''}`}
            >
              <div className="gate-card-top">
                <span className="gate-id-tag">{g.gateId}</span>
                <span className={`status-badge ${g.passed ? 'is-passed' : 'is-pending'}`}>
                  {g.passed ? 'VERIFIED' : 'PREREQUISITE PENDING'}
                </span>
              </div>
              <div className="gate-name-title">{g.name}</div>
              <div className="gate-metric-text">{g.metric}</div>
              <div>
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() => setActiveModuleId(g.owner)}
                >
                  Open {g.owner} &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 2. ARENA SETUP
  if (moduleId === 'arena-setup') {
    const current = arenaState.arenaConfig;
    const showForm = !current || isEditingArena;
    const activeLogo = arenaForm.logo_url || current?.logo_url || '';
    const previewConfig = {
      arena_name: (showForm ? arenaForm.arena_name : current?.arena_name) || current?.arena_name || arenaForm.arena_name || '',
      gab_license: (showForm ? arenaForm.gab_license : current?.gab_license) || current?.gab_license || arenaForm.gab_license || '',
      mayors_permit: (showForm ? arenaForm.mayors_permit : current?.mayors_permit) || current?.mayors_permit || arenaForm.mayors_permit || '',
      bir_cas_min: (showForm ? arenaForm.bir_cas_min : current?.bir_cas_min) || current?.bir_cas_min || arenaForm.bir_cas_min || '',
      plasada_rate: (showForm ? arenaForm.plasada_rate : current?.plasada_rate) || current?.plasada_rate || arenaForm.plasada_rate || '',
      logo_url: activeLogo
    };

    return (
      <div className="workspace-split-grid">
        {/* Left Column: Form (when editing or first setup) OR Profile Card (when view mode) */}
        {showForm ? (
          <form
            className="workspace-panel form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await handleAction(
                '/api/arena-config',
                'POST',
                arenaForm,
                'Arena configuration and paperwork parameters saved to SQLite SSOT.'
              );
              if (res?.ok) {
                setIsEditingArena(false);
                setArenaForm((prev) => ({ ...prev, security_pin: '' }));
              }
            }}
          >
            <div className="arena-panel-header-row">
              <div className="workspace-panel-title">
                {current ? 'Edit Coliseum Parameters' : 'Save Coliseum Parameters'}
              </div>
              {current && (
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() => {
                    setIsEditingArena(false);
                    setArenaForm((prev) => ({ ...prev, security_pin: '' }));
                  }}
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              )}
            </div>
            {notice && <div className="status-alert-banner is-success">{notice}</div>}
            <div className="form-field">
              <label className="form-label">Arena / Coliseum Name</label>
              <input
                className="form-input"
                required
                placeholder="e.g. San Juan Coliseum Arena"
                value={arenaForm.arena_name}
                onChange={(e) => setArenaForm({ ...arenaForm, arena_name: e.target.value })}
              />
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">GAB License No.</label>
                <input
                  className="form-input"
                  required
                  placeholder="GAB-COL-2026-01"
                  value={arenaForm.gab_license}
                  onChange={(e) => setArenaForm({ ...arenaForm, gab_license: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">LGU Mayor Permit</label>
                <input
                  className="form-input"
                  required
                  placeholder="LGU-MP-2026-01"
                  value={arenaForm.mayors_permit}
                  onChange={(e) => setArenaForm({ ...arenaForm, mayors_permit: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">BIR CAS MIN</label>
                <input
                  className="form-input"
                  required
                  placeholder="MIN-2026-00001"
                  value={arenaForm.bir_cas_min}
                  onChange={(e) => setArenaForm({ ...arenaForm, bir_cas_min: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">House Plasada Rate</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={arenaForm.plasada_rate}
                  onChange={(e) => setArenaForm({ ...arenaForm, plasada_rate: e.target.value })}
                />
              </div>
            </div>

            {/* Coliseum Logo Upload */}
            <div className="form-field">
              <label className="form-label">Coliseum Official Logo / Crest</label>
              <div className="arena-logo-upload-box">
                {arenaForm.logo_url ? (
                  <div className="arena-logo-preview-card">
                    <img src={arenaForm.logo_url} alt="Coliseum Logo" className="arena-logo-img" />
                    <div className="arena-logo-actions">
                      <button
                        type="button"
                        className="btn-secondary-gold"
                        onClick={() => setArenaForm({ ...arenaForm, logo_url: '' })}
                      >
                        <X size={14} />
                        <span>Remove Logo</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="arena-logo-dropzone">
                    <Upload size={20} className="card-title-icon-emerald" />
                    <div className="arena-logo-drop-text">
                      <strong>Click to upload official Coliseum Logo / Crest</strong>
                      <span>Supports PNG, JPG, WebP, SVG</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="arena-file-input-hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (rev) => {
                            const raw = rev.target?.result;
                            if (typeof raw !== 'string') return;
                            const img = new Image();
                            img.onload = () => {
                              try {
                                const maxDim = 400;
                                let w = img.width;
                                let h = img.height;
                                if (w > maxDim || h > maxDim) {
                                  if (w > h) {
                                    h = Math.round((h * maxDim) / w);
                                    w = maxDim;
                                  } else {
                                    w = Math.round((w * maxDim) / h);
                                    h = maxDim;
                                  }
                                }
                                const canvas = document.createElement('canvas');
                                canvas.width = w;
                                canvas.height = h;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, w, h);
                                const optimized = canvas.toDataURL('image/png', 0.92);
                                setArenaForm((prev) => ({ ...prev, logo_url: optimized }));
                              } catch {
                                setArenaForm((prev) => ({ ...prev, logo_url: raw }));
                              }
                            };
                            img.onerror = () => {
                              setArenaForm((prev) => ({ ...prev, logo_url: raw }));
                            };
                            img.src = raw;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Mandatory Operator Security PIN / Password */}
            <div className="form-field">
              <label className="form-label">
                <Lock size={13} className="card-title-icon-gold" />
                <span>Operator Security PIN / Password (Required to Save)</span>
              </label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="Enter 4-digit Security PIN to authenticate changes"
                value={arenaForm.security_pin}
                onChange={(e) => setArenaForm({ ...arenaForm, security_pin: e.target.value })}
              />
              <div className="arena-pin-notice">
                <AlertTriangle size={13} />
                <span>Zero-Trust Gate 0: Authorized operator credentials required to commit legal Coliseum SSOT parameters.</span>
              </div>
            </div>

            <div className="arena-form-actions-row">
              <button type="submit" className="btn-primary-emerald" disabled={submitting}>
                {submitting ? 'Authenticating & Saving...' : current ? 'Update Arena Parameters' : 'Save Arena Setup'}
              </button>
              {current && (
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() => {
                    setIsEditingArena(false);
                    setArenaForm((prev) => ({ ...prev, security_pin: '' }));
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="workspace-panel form-stack">
            <div className="arena-panel-header-row">
              <div className="workspace-panel-title">Active SSOT Venue Profile</div>
              <button
                type="button"
                className="btn-secondary-gold"
                onClick={() => {
                  setIsEditingArena(true);
                  if (current) {
                    setArenaForm({
                      arena_name: current.arena_name || '',
                      gab_license: current.gab_license || '',
                      mayors_permit: current.mayors_permit || '',
                      bir_cas_min: current.bir_cas_min || '',
                      plasada_rate: current.plasada_rate != null ? String(current.plasada_rate) : '0.10',
                      logo_url: current.logo_url || '',
                      security_pin: '',
                      min_rest_gap: String(current.min_rest_gap || 4),
                      vip_seats: String(current.vip_seats || 320),
                      lower_box_seats: String(current.lower_box_seats || 1450),
                      upper_grandstand_seats: String(current.upper_grandstand_seats || 3200),
                      total_cockhouse_bays: String(current.total_cockhouse_bays || 120)
                    });
                  }
                }}
              >
                <Edit3 size={14} />
                <span>Edit Arena Parameters</span>
              </button>
            </div>
            {notice && <div className="status-alert-banner is-success">{notice}</div>}
            <div className="data-table-wrap">
              {current.logo_url && (
                <div className="venue-profile-crest-row">
                  <div className="venue-profile-crest-wrap">
                    <img src={current.logo_url} alt="Official Coliseum Crest" className="venue-profile-crest-img" />
                  </div>
                  <div className="venue-profile-crest-info">
                    <div className="venue-profile-crest-name">{current.arena_name}</div>
                    <div className="venue-profile-crest-tag">Official GAB &amp; LGU Licensed Coliseum Emblem</div>
                  </div>
                </div>
              )}
              <table className="data-table">
                <tbody>
                  <tr>
                    <th>Arena Name</th>
                    <td><strong>{current.arena_name}</strong></td>
                  </tr>
                  <tr>
                    <th>GAB License</th>
                    <td><span className="top-mono-item">{current.gab_license}</span></td>
                  </tr>
                  <tr>
                    <th>Mayor&apos;s Permit</th>
                    <td><span className="top-mono-item">{current.mayors_permit}</span></td>
                  </tr>
                  <tr>
                    <th>BIR CAS MIN</th>
                    <td><span className="top-mono-item">{current.bir_cas_min}</span></td>
                  </tr>
                  <tr>
                    <th>Plasada Commission</th>
                    <td><strong>{Math.round(current.plasada_rate * 100)}%</strong></td>
                  </tr>
                  <tr>
                    <th>Regulatory Status</th>
                    <td>
                      <span className="badge-tag is-pass">
                        <ShieldCheck size={12} />
                        <span>PD 449 / GAB Certified</span>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right Column: Official Paperwork Header Live Preview */}
        <div className="workspace-panel">
          <div className="arena-panel-header-row">
            <div className="workspace-panel-title">
              <FileText size={15} className="card-title-icon-emerald" />
              <span>Official Coliseum Paperwork Header Preview</span>
            </div>
            <span className="top-mono-item">Printable 300-DPI Layout</span>
          </div>

          <div className="paperwork-tabs-bar">
            <button
              type="button"
              className={`paperwork-tab-btn ${paperworkDocType === 'bout_sheet' ? 'is-active' : ''}`}
              onClick={() => setPaperworkDocType('bout_sheet')}
            >
              <span>GAB Soltada Bout Sheet</span>
            </button>
            <button
              type="button"
              className={`paperwork-tab-btn ${paperworkDocType === 'tari_clearance' ? 'is-active' : ''}`}
              onClick={() => setPaperworkDocType('tari_clearance')}
            >
              <span>Tari Armorer Clearance</span>
            </button>
            <button
              type="button"
              className={`paperwork-tab-btn ${paperworkDocType === 'plasada_voucher' ? 'is-active' : ''}`}
              onClick={() => setPaperworkDocType('plasada_voucher')}
            >
              <span>BIR Plasada Voucher</span>
            </button>
          </div>

          {/* Printable Document Sheet Preview */}
          <div className="paperwork-sheet">
            <div className="paperwork-sheet-inner">
              {/* Official Letterhead */}
              <div className="paperwork-letterhead">
                {previewConfig.logo_url ? (
                  <div className="paperwork-logo-box">
                    <img
                      src={previewConfig.logo_url}
                      alt="Coliseum Crest"
                      className="paperwork-logo-img"
                    />
                  </div>
                ) : null}

                <div className="paperwork-gov-header">
                  <span className="paperwork-gov-sup">Republic of the Philippines • Office of the President</span>
                  <span className="paperwork-gov-agency">GAMES AND AMUSEMENTS BOARD (GAB)</span>
                  {previewConfig.arena_name ? (
                    <h3 className="paperwork-coliseum-name">{previewConfig.arena_name}</h3>
                  ) : null}
                  <div className="paperwork-license-strip">
                    {previewConfig.gab_license ? (
                      <span className="paperwork-license-item">
                        GAB LIC: <strong>{previewConfig.gab_license}</strong>
                      </span>
                    ) : null}
                    {previewConfig.mayors_permit ? (
                      <span className="paperwork-license-item">
                        MAYOR&apos;S PERMIT: <strong>{previewConfig.mayors_permit}</strong>
                      </span>
                    ) : null}
                    {previewConfig.bir_cas_min ? (
                      <span className="paperwork-license-item">
                        BIR CAS MIN: <strong>{previewConfig.bir_cas_min}</strong>
                      </span>
                    ) : null}
                    {previewConfig.plasada_rate ? (
                      <span className="paperwork-license-item">
                        PLASADA: <strong>{Math.round(Number(previewConfig.plasada_rate) * 100)}%</strong>
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="paperwork-double-divider" />

              {/* Dynamic Document Type Content */}
              {paperworkDocType === 'bout_sheet' && (
                <>
                  <div className="paperwork-doc-banner">
                    <div>
                      <div className="paperwork-doc-title">Official GAB Soltada Bout Sheet &amp; Referee Fight Card</div>
                      <div className="paperwork-doc-decree">Legal Mandate: Presidential Decree No. 449 (Cockfighting Law of 1974)</div>
                    </div>
                    <span className="top-mono-item">SOLTADA #01</span>
                  </div>
                  <table className="paperwork-data-grid">
                    <thead>
                      <tr>
                        <th>Side</th>
                        <th>Entry Gallero</th>
                        <th>Leg Band</th>
                        <th>Wing Band</th>
                        <th>Weight</th>
                        <th>Variance</th>
                        <th>GAB Gate</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>MERON</strong></td>
                        <td>Thunderbird Alpha (VIP)</td>
                        <td>LB-9021</td>
                        <td>WB-4011</td>
                        <td>2,185g</td>
                        <td rowSpan={2} style={{ verticalAlign: 'middle', textAlign: 'center', fontWeight: 'bold' }}>
                          5g (&lt; 30g)
                        </td>
                        <td><span className="paperwork-tag-pass">PASSED</span></td>
                      </tr>
                      <tr>
                        <td><strong>WALA</strong></td>
                        <td>Golden Falcon Syndicate</td>
                        <td>LB-9025</td>
                        <td>WB-4018</td>
                        <td>2,190g</td>
                        <td><span className="paperwork-tag-pass">PASSED</span></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="paperwork-signatures-row">
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">Arena Tagapamahala</div>
                      <div className="paperwork-signer-title">General Coliseum Operations</div>
                    </div>
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">Official Sentenciador</div>
                      <div className="paperwork-signer-title">Licensed Ring Referee (Judge)</div>
                    </div>
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">GAB Field Inspector</div>
                      <div className="paperwork-signer-title">Games &amp; Amusements Board</div>
                    </div>
                  </div>
                </>
              )}

              {paperworkDocType === 'tari_clearance' && (
                <>
                  <div className="paperwork-doc-banner">
                    <div>
                      <div className="paperwork-doc-title">Tari Armorer Gaff Blade Inspection &amp; Biosecurity Clearance</div>
                      <div className="paperwork-doc-decree">Pre-Fight Safety Inspection • Regulation Sec. 5 Armory Protocol</div>
                    </div>
                    <span className="top-mono-item">BAY #04 CLEARANCE</span>
                  </div>
                  <table className="paperwork-data-grid">
                    <thead>
                      <tr>
                        <th>Inspection Item</th>
                        <th>Specification Standard</th>
                        <th>Armorer Assessment</th>
                        <th>Compliance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Blade Sharpness &amp; Curve</strong></td>
                        <td>Single curved high-carbon surgical gaff (&le; 3.0 in)</td>
                        <td>2.75 in blade, curvature verified against standard gauge</td>
                        <td><span className="paperwork-tag-pass">PASSED</span></td>
                      </tr>
                      <tr>
                        <td><strong>Tying &amp; Leg Mounting</strong></td>
                        <td>Braided cord, 0 looseness or lateral play</td>
                        <td>Leg bone pad secured, zero rotational slip verified</td>
                        <td><span className="paperwork-tag-pass">PASSED</span></td>
                      </tr>
                      <tr>
                        <td><strong>Biosecurity Immersion</strong></td>
                        <td>0.5% Chlorhexidine antiseptic pre-bout dip</td>
                        <td>Sanitized at armory table prior to pit transfer</td>
                        <td><span className="paperwork-tag-pass">PASSED</span></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="paperwork-signatures-row">
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">Licensed Mananari</div>
                      <div className="paperwork-signer-title">GAB Coliseo Blade Armorer</div>
                    </div>
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">Hukom sa Mesa</div>
                      <div className="paperwork-signer-title">Pit Director &amp; Timer</div>
                    </div>
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">Coliseum Safety Officer</div>
                      <div className="paperwork-signer-title">Biosecurity &amp; Emergency Unit</div>
                    </div>
                  </div>
                </>
              )}

              {paperworkDocType === 'plasada_voucher' && (
                <>
                  <div className="paperwork-doc-banner">
                    <div>
                      <div className="paperwork-doc-title">BIR CAS Machine Plasada Audit &amp; Tax Clearance Voucher</div>
                      <div className="paperwork-doc-decree">Bureau of Internal Revenue CAS RMO No. 10-2020 • RR No. 09-2021</div>
                    </div>
                    <span className="top-mono-item">CAS RECEIPT #2026-0089</span>
                  </div>
                  <table className="paperwork-data-grid">
                    <thead>
                      <tr>
                        <th>Accounting Breakdown</th>
                        <th>Percentage</th>
                        <th>Amount (PHP)</th>
                        <th>Audit Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Gross Soltada Wager Pool</strong></td>
                        <td>100.00%</td>
                        <td>₱550,000.00</td>
                        <td><span className="paperwork-tag-pass">BALANCED</span></td>
                      </tr>
                      <tr>
                        <td><strong>Gross Arena Plasada Retained</strong></td>
                        <td>{Math.round((previewConfig.plasada_rate || 0.1) * 100)}%</td>
                        <td>₱55,000.00</td>
                        <td><span className="paperwork-tag-pass">VERIFIED</span></td>
                      </tr>
                      <tr>
                        <td><strong>LGU Amusement Tax (PD 449 / LGC)</strong></td>
                        <td>10.00% of Plasada</td>
                        <td>₱5,500.00</td>
                        <td><span className="paperwork-tag-pass">REMITTED</span></td>
                      </tr>
                      <tr>
                        <td><strong>Net Coliseum Operating Share</strong></td>
                        <td>90.00% of Plasada</td>
                        <td>₱49,500.00</td>
                        <td><span className="paperwork-tag-pass">SETTLED</span></td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="paperwork-signatures-row">
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">Head Cashier</div>
                      <div className="paperwork-signer-title">Monton &amp; Vault Supervisor</div>
                    </div>
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">BIR Compliance Officer</div>
                      <div className="paperwork-signer-title">Internal Revenue Auditor</div>
                    </div>
                    <div className="paperwork-signature-col">
                      <div className="paperwork-signature-line" />
                      <div className="paperwork-signer-name">Arena Comptroller</div>
                      <div className="paperwork-signer-title">Chief Financial Officer</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. DEVICES & TERMINALS (Gate 0)
  if (moduleId === 'devices-terminals') {
    const devices = arenaState.devices || [];
    return (
      <div className="workspace-split-grid">
        <form
          className="workspace-panel form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await handleAction(
              '/api/devices',
              'POST',
              deviceForm,
              `Whitelisted terminal ${deviceForm.code.toUpperCase()}.`
            );
            if (res.ok) {
              setDeviceForm({
                code: '',
                label: '',
                station_zone: 'Center Cashier Cage',
                mac_address: '',
                ip_address: ''
              });
            }
          }}
        >
          <div className="workspace-panel-title">Gate 0: Whitelist Hardware Terminal</div>
          {notice && <div className="status-alert-banner is-success">{notice}</div>}
          <div className="form-row-2col">
            <div className="form-field">
              <label className="form-label">Terminal Code</label>
              <input
                className="form-input"
                required
                placeholder="e.g. T01"
                value={deviceForm.code}
                onChange={(e) => setDeviceForm({ ...deviceForm, code: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Terminal Label</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Cashier 1"
                value={deviceForm.label}
                onChange={(e) => setDeviceForm({ ...deviceForm, label: e.target.value })}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Assigned Station Zone</label>
            <input
              className="form-input"
              required
              value={deviceForm.station_zone}
              onChange={(e) => setDeviceForm({ ...deviceForm, station_zone: e.target.value })}
            />
          </div>
          <div className="form-row-2col">
            <div className="form-field">
              <label className="form-label">MAC Address</label>
              <input
                className="form-input"
                required
                placeholder="00:1B:44:11:3A:01"
                value={deviceForm.mac_address}
                onChange={(e) => setDeviceForm({ ...deviceForm, mac_address: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Static LAN IP</label>
              <input
                className="form-input"
                required
                placeholder="192.168.1.101"
                value={deviceForm.ip_address}
                onChange={(e) => setDeviceForm({ ...deviceForm, ip_address: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary-emerald" disabled={submitting}>
            {submitting ? 'Whitelisting...' : '+ Authorize Terminal'}
          </button>
        </form>

        <div className="workspace-panel">
          <div className="workspace-panel-title">
            Registered Arena Terminals ({devices.length})
          </div>
          {devices.length === 0 ? (
            <div className="module-empty-state">
              <div className="module-empty-title">No Hardware Terminals Whitelisted</div>
              <div className="module-empty-desc">
                Gate 0 enforces strict 1-Operator, 1-Machine binding. Register your Cashier, Kiosk, or POS terminals on the left so they appear in the Active Terminals panel.
              </div>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Label</th>
                    <th>Zone</th>
                    <th>MAC / IP</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d) => (
                    <tr key={d.device_id}>
                      <td>
                        <strong>{d.code}</strong>
                      </td>
                      <td>{d.label}</td>
                      <td>{d.station_zone}</td>
                      <td>
                        {d.mac_address} ({d.ip_address})
                      </td>
                      <td>
                        <span
                          className={`status-badge ${d.status === 'Online' ? 'is-passed' : 'is-pending'}`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary-gold"
                          onClick={() => handleAction(`/api/devices/${d.device_id}`, 'PATCH', {})}
                        >
                          Toggle Online
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4. USERS & PERMISSIONS (Granular ARBAC + Multi-Tenant DB Users CRUD)
  if (moduleId === 'users-permissions') {
    return <ArbacManager />;
  }

  // 5. EVENTS & SCHEDULE (Gate 1 & Gate 2)
  if (moduleId === 'events-schedule') {
    const events = arenaState.events || [];
    const entries = arenaState.entries || [];
    return (
      <div className="workspace-split-grid">
        <div className="form-stack">
          <form
            className="workspace-panel form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await handleAction(
                '/api/events',
                'POST',
                eventForm,
                `Created derby "${eventForm.title}".`
              );
              if (res.ok) setEventForm({ ...eventForm, title: '', promoter: '' });
            }}
          >
            <div className="workspace-panel-title">Gate 1: Schedule Derby Event</div>
            <div className="form-field">
              <label className="form-label">Tournament Title</label>
              <input
                className="form-input"
                required
                placeholder="e.g. 2026 National Stag 4-Cock Derby"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Format</label>
                <select
                  className="form-select"
                  value={eventForm.format}
                  onChange={(e) => setEventForm({ ...eventForm, format: e.target.value })}
                >
                  <option>2-Cock Ulutan</option>
                  <option>3-Cock Derby</option>
                  <option>4-Cock Stag Derby</option>
                  <option>5-Cock Championship</option>
                  <option>7-Cock Invitational</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Pot Fee (₱)</label>
                <input
                  type="number"
                  className="form-input"
                  value={eventForm.pot_fee}
                  onChange={(e) => setEventForm({ ...eventForm, pot_fee: e.target.value })}
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Host / Promoter</label>
              <input
                className="form-input"
                required
                placeholder="e.g. San Juan Syndicate"
                value={eventForm.promoter}
                onChange={(e) => setEventForm({ ...eventForm, promoter: e.target.value })}
              />
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Derby Min Weight (g)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={eventForm.min_weight_grams}
                  onChange={(e) => setEventForm({ ...eventForm, min_weight_grams: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Derby Max Weight (g)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={eventForm.max_weight_grams}
                  onChange={(e) => setEventForm({ ...eventForm, max_weight_grams: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Kasahan Tolerance (±g)</label>
                <input
                  type="number"
                  className="form-input"
                  required
                  value={eventForm.weight_tolerance_grams}
                  onChange={(e) => setEventForm({ ...eventForm, weight_tolerance_grams: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Derby Rules &amp; Sanctions</label>
                <input
                  className="form-input"
                  placeholder="e.g. Standard GAB / PD 449 Rules"
                  value={eventForm.derby_rules}
                  onChange={(e) => setEventForm({ ...eventForm, derby_rules: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-emerald" disabled={submitting}>
              {submitting ? 'Creating...' : '+ Create Derby Event'}
            </button>
          </form>

          <form
            className="workspace-panel form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await handleAction(
                '/api/entries',
                'POST',
                entryForm,
                `Enrolled syndicate entry "${entryForm.entry_name.toUpperCase()}".`
              );
              if (res.ok) setEntryForm({ ...entryForm, entry_name: '', owner_gallero: '' });
            }}
          >
            <div className="workspace-panel-title">Gate 2: Enroll Entry & Pot Escrow</div>
            <div className="form-field">
              <label className="form-label">Entry / Team Name</label>
              <input
                className="form-input"
                required
                placeholder="e.g. THUNDERBIRD GOLD"
                value={entryForm.entry_name}
                onChange={(e) => setEntryForm({ ...entryForm, entry_name: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Owner / Gallero</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Boss Atong / San Juan Farm"
                value={entryForm.owner_gallero}
                onChange={(e) => setEntryForm({ ...entryForm, owner_gallero: e.target.value })}
              />
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Pot Escrow Status</label>
                <select
                  className="form-select"
                  value={entryForm.pot_payment_status}
                  onChange={(e) =>
                    setEntryForm({ ...entryForm, pot_payment_status: e.target.value })
                  }
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING_CASHIER">PENDING_CASHIER</option>
                  <option value="EXEMPT">EXEMPT</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Seating Tier</label>
                <select
                  className="form-select"
                  value={entryForm.syndicate_tier}
                  onChange={(e) => setEntryForm({ ...entryForm, syndicate_tier: e.target.value })}
                >
                  <option>VIP Ringside</option>
                  <option>Lower Box</option>
                  <option>Upper Grandstand</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary-emerald" disabled={submitting}>
              {submitting ? 'Enrolling...' : '+ Enroll Syndicate Entry'}
            </button>
          </form>
        </div>

        <div className="form-stack">
          {arenaState?.activeEvent && (
            <div className="active-derby-rules-banner">
              <div className="derby-rules-title">
                <Trophy size={16} className="card-title-icon-gold" />
                <span>Active Derby: <strong>{arenaState.activeEvent.title}</strong></span>
              </div>
              <div className="derby-rules-grid">
                <div className="derby-rule-chip">
                  <span className="derby-rule-label">Format</span>
                  <span className="derby-rule-val">{arenaState.activeEvent.format}</span>
                </div>
                <div className="derby-rule-chip">
                  <span className="derby-rule-label">Weight Bracket</span>
                  <span className="derby-rule-val is-emerald">
                    {arenaState.activeEvent.min_weight_grams || 1800}g – {arenaState.activeEvent.max_weight_grams || 2450}g
                  </span>
                </div>
                <div className="derby-rule-chip">
                  <span className="derby-rule-label">Kasahan Tolerance</span>
                  <span className="derby-rule-val is-gold">
                    &le; {arenaState.activeEvent.weight_tolerance_grams || 30}g variance
                  </span>
                </div>
                <div className="derby-rule-chip">
                  <span className="derby-rule-label">Derby Rules</span>
                  <span className="derby-rule-val">
                    {arenaState.activeEvent.derby_rules || 'Standard GAB Rules'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="workspace-panel">
            <div className="workspace-panel-title">
              Tournament Calendar ({events.length}) — Single Active Derby Rule
            </div>
            {events.length === 0 ? (
              <div className="module-empty-state">
                <div className="module-empty-title">No Tournaments Scheduled</div>
                <div className="module-empty-desc">
                  Create a Derby Event on the left to unlock Gate 1 and enable participant entry enrollment.
                </div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Format</th>
                      <th>Weight Rules</th>
                      <th>Promoter</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.event_id}>
                        <td>
                          <strong>{ev.title}</strong>
                        </td>
                        <td>{ev.format}</td>
                        <td>
                          <span className="top-mono-item">
                            {ev.min_weight_grams || 1800}g – {ev.max_weight_grams || 2450}g (&plusmn;{ev.weight_tolerance_grams || 30}g)
                          </span>
                        </td>
                        <td>{ev.promoter}</td>
                        <td>
                          <span
                            className={`status-badge ${ev.status === 'ACTIVE' ? 'is-passed' : 'is-pending'}`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td>
                          {ev.status !== 'ACTIVE' && (
                            <button
                              type="button"
                              className="btn-secondary-gold"
                              onClick={() =>
                                handleAction(`/api/events/${ev.event_id}`, 'PATCH', {})
                              }
                            >
                              Make Active
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="workspace-panel">
            <div className="workspace-panel-title">
              Enrolled Syndicate Entries & Standings ({entries.length})
            </div>
            {entries.length === 0 ? (
              <div className="module-empty-state">
                <div className="module-empty-title">No Entries Enrolled Yet</div>
                <div className="module-empty-desc">
                  Enroll at least 2 entries in Gate 2 so their roosters can be weighed and paired in Kasahan Matchmaking.
                </div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Entry Name</th>
                      <th>Gallero</th>
                      <th>Pot Escrow</th>
                      <th>W-D-L</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((en) => (
                      <tr key={en.entry_id}>
                        <td>
                          <strong>{en.entry_name}</strong>
                        </td>
                        <td>{en.owner_gallero}</td>
                        <td>
                          <span className="status-badge is-passed">{en.pot_payment_status}</span>
                        </td>
                        <td>
                          {en.wins}-{en.draws}-{en.losses}
                        </td>
                        <td>
                          <strong>{en.points.toFixed(1)} pts</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 6. KASAHAN MATCHMAKING (Gate 3, Gate 4, Gate 5)
  if (moduleId === 'kasahan-matchmaking') {
    const entries = arenaState.entries || [];
    const roosters = arenaState.roosters || [];
    const fights = arenaState.fights || [];

    return (
      <div className="workspace-split-grid">
        <div className="form-stack">
          <form
            className="workspace-panel form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await handleAction(
                '/api/timbangan/intake',
                'POST',
                roosterForm,
                `Weighed rooster ${roosterForm.wing_band.toUpperCase()} (${roosterForm.weight_grams}g).`
              );
              if (res.ok) {
                setRoosterForm({
                  ...roosterForm,
                  wing_band: '',
                  leg_band: '',
                  weight_grams: ''
                });
              }
            }}
          >
            <div className="workspace-panel-title">Gate 3: Sub-60s Timbangan Scale Intake</div>
            {notice && <div className="status-alert-banner is-success">{notice}</div>}
            <div className="form-field">
              <label className="form-label">Select Enrolled Syndicate Entry</label>
              <select
                className="form-select"
                required
                value={roosterForm.entry_id}
                onChange={(e) => setRoosterForm({ ...roosterForm, entry_id: e.target.value })}
              >
                <option value="">-- Choose Entry --</option>
                {entries.map((en) => (
                  <option key={en.entry_id} value={en.entry_id}>
                    {en.entry_name} ({en.owner_gallero})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Wingband Tag</label>
                <input
                  className="form-input"
                  required
                  placeholder="WB-2026-001"
                  value={roosterForm.wing_band}
                  onChange={(e) => setRoosterForm({ ...roosterForm, wing_band: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Legband Tag</label>
                <input
                  className="form-input"
                  required
                  placeholder="LB-01A"
                  value={roosterForm.leg_band}
                  onChange={(e) => setRoosterForm({ ...roosterForm, leg_band: e.target.value })}
                />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">
                Digital Scale Weight ({arenaState?.activeEvent ? `${arenaState.activeEvent.min_weight_grams || 1800}g – ${arenaState.activeEvent.max_weight_grams || 2450}g` : '1,800g – 2,450g'})
              </label>
              <input
                type="number"
                className="form-input"
                required
                placeholder="e.g. 2140"
                value={roosterForm.weight_grams}
                onChange={(e) => setRoosterForm({ ...roosterForm, weight_grams: e.target.value })}
              />
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Plumage Color</label>
                <input
                  className="form-input"
                  required
                  value={roosterForm.plumage_color}
                  onChange={(e) =>
                    setRoosterForm({ ...roosterForm, plumage_color: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Leg / Shank Color</label>
                <input
                  className="form-input"
                  required
                  value={roosterForm.leg_color}
                  onChange={(e) => setRoosterForm({ ...roosterForm, leg_color: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-emerald" disabled={submitting}>
              {submitting ? 'Logging Biometrics...' : '+ Log Calibrated Scale Weight'}
            </button>
          </form>

          <div className="workspace-panel">
            <div className="workspace-panel-title">Gate 4: Algorithmic Kasahan Pairing</div>
            <p className="module-empty-desc">
              Matches un-paired roosters within &le;30g tolerance while preventing same-owner collisions.
            </p>
            <button
              type="button"
              className="btn-secondary-gold"
              disabled={submitting}
              onClick={() =>
                handleAction(
                  '/api/kasahan/auto-pair',
                  'POST',
                  {},
                  'Kasahan pairing matrix executed and published to Fight Card.'
                )
              }
            >
              Run Auto-Pairing Matrix (&le;30g)
            </button>
          </div>
        </div>

        <div className="form-stack">
          <div className="workspace-panel">
            <div className="workspace-panel-title">
              Weighed Rooster Pool ({roosters.length})
            </div>
            {roosters.length === 0 ? (
              <div className="module-empty-state">
                <div className="module-empty-title">Timbangan Pool is Empty</div>
                <div className="module-empty-desc">
                  Weigh stags using the intake form on the left. Once at least 2 stags from different entries are within 30g of each other, click Run Auto-Pairing Matrix.
                </div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Wingband</th>
                      <th>Entry</th>
                      <th>Weight</th>
                      <th>Biometrics</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roosters.map((r) => (
                      <tr key={r.rooster_id}>
                        <td>
                          <strong>{r.wing_band}</strong> ({r.leg_band})
                        </td>
                        <td>{r.entry_name}</td>
                        <td>
                          <strong>{r.weight_grams}g</strong>
                        </td>
                        <td>
                          {r.plumage_color} / {r.leg_color}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${r.status === 'PAIRED' ? 'is-passed' : 'is-pending'}`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="workspace-panel">
            <div className="workspace-panel-title">
              Gate 4 & 5: Published Soltadas & Tari Armorer Sign-Off ({fights.length})
            </div>
            {fights.length === 0 ? (
              <div className="module-empty-state">
                <div className="module-empty-title">No Paired Fights Published</div>
                <div className="module-empty-desc">
                  Run the Kasahan Auto-Pairing Matrix after weighing compatible roosters.
                </div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fight #</th>
                      <th>MERON</th>
                      <th>WALA</th>
                      <th>Diff</th>
                      <th>Gate 5 Tari</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fights.map((f) => (
                      <tr key={f.fight_id}>
                        <td>
                          <strong>#{f.fight_number}</strong>
                        </td>
                        <td>
                          {f.meron_entry_name} ({f.meron_weight}g)
                        </td>
                        <td>
                          {f.wala_entry_name} ({f.wala_weight}g)
                        </td>
                        <td>{f.weight_diff}g</td>
                        <td>
                          {f.tari_signed_by ? (
                            <span className="status-badge is-passed">
                              ARMED ({f.tari_signed_by})
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn-secondary-gold"
                              onClick={() =>
                                handleAction(`/api/fights/${f.fight_id}/tari-signoff`, 'POST', {
                                  armorer_name: 'Chief Armorer'
                                })
                              }
                            >
                              Sign Off Tari Blade
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 7. RUEDO PIT & BELL (Gate 6, Gate 7, Gate 8)
  if (moduleId === 'ruedo-pit') {
    const fights = arenaState.fights || [];
    const liveFight = fights.find((f) => f.staging_tier === 'LIVE_PIT');

    return (
      <div className="form-stack">
        {notice && <div className="status-alert-banner is-success">{notice}</div>}
        <div className="workspace-panel">
          <div className="workspace-panel-title">
            Mesa de Control — Live Pit Ring (Gate 6, 7 & 8)
          </div>
          {!liveFight ? (
            <div className="module-empty-state">
              <div className="module-empty-title">No Bout Currently in the Live Pit</div>
              <div className="module-empty-desc">
                Ensure a paired fight has Gate 5 Tari Armorer sign-off, then advance it into the LIVE_PIT staging tier below.
              </div>
            </div>
          ) : (
            <div className="form-stack">
              <div className="metric-row">
                <span>
                  <strong>FIGHT #{liveFight.fight_number}:</strong> {liveFight.meron_entry_name} (
                  {liveFight.meron_weight}g) vs. {liveFight.wala_entry_name} (
                  {liveFight.wala_weight}g)
                </span>
                <span className="status-badge is-passed">
                  {liveFight.is_betting_open ? 'PUSTA BUKAS (BETTING OPEN)' : liveFight.status}
                </span>
              </div>

              <div className="action-btn-row">
                <button
                  type="button"
                  className="btn-primary-emerald"
                  onClick={() =>
                    handleAction('/api/ruedo/betting-toggle', 'POST', {
                      fight_id: liveFight.fight_id,
                      open_betting: true
                    })
                  }
                >
                  Open Betting (Pusta Bukas)
                </button>
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() =>
                    handleAction('/api/ruedo/betting-toggle', 'POST', {
                      fight_id: liveFight.fight_id,
                      open_betting: false
                    })
                  }
                >
                  Ring Pit Bell & Lock Bets (Gate 7)
                </button>
                <button
                  type="button"
                  className="btn-primary-emerald"
                  onClick={() =>
                    handleAction('/api/ruedo/verdict', 'POST', {
                      fight_id: liveFight.fight_id,
                      verdict: 'MERON'
                    })
                  }
                >
                  Declare MERON Winner [M]
                </button>
                <button
                  type="button"
                  className="btn-primary-emerald"
                  onClick={() =>
                    handleAction('/api/ruedo/verdict', 'POST', {
                      fight_id: liveFight.fight_id,
                      verdict: 'WALA'
                    })
                  }
                >
                  Declare WALA Winner [W]
                </button>
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() =>
                    handleAction('/api/ruedo/verdict', 'POST', {
                      fight_id: liveFight.fight_id,
                      verdict: 'TABLA'
                    })
                  }
                >
                  Declare TABLA Draw [T]
                </button>
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() =>
                    handleAction('/api/ruedo/verdict', 'POST', {
                      fight_id: liveFight.fight_id,
                      verdict: 'CANCELLED'
                    })
                  }
                >
                  Cancel Bout [C]
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="workspace-panel">
          <div className="workspace-panel-title">
            Gate 6: 3-Tier Staging Call Ribbon (Heeling &rarr; On-Deck &rarr; Live Pit)
          </div>
          {fights.length === 0 ? (
            <div className="module-empty-state">
              <div className="module-empty-title">Staging Queue is Empty</div>
              <div className="module-empty-desc">
                Publish bouts from Kasahan Matchmaking to populate the 3-tier staging ribbon.
              </div>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Fight #</th>
                    <th>Matchup</th>
                    <th>Staging Tier</th>
                    <th>Status / Verdict</th>
                    <th>Advance Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {fights.map((f) => (
                    <tr key={f.fight_id}>
                      <td>
                        <strong>#{f.fight_number}</strong>
                      </td>
                      <td>
                        {f.meron_entry_name} vs. {f.wala_entry_name}
                      </td>
                      <td>
                        <span className="status-badge is-passed">{f.staging_tier}</span>
                      </td>
                      <td>{f.verdict || f.status}</td>
                      <td>
                        {f.status !== 'COMPLETED' && (
                          <div className="action-btn-row">
                            <button
                              type="button"
                              className="btn-secondary-gold"
                              onClick={() =>
                                handleAction(`/api/fights/${f.fight_id}/stage`, 'POST', {
                                  target_tier: 'HEELING'
                                })
                              }
                            >
                              Heeling
                            </button>
                            <button
                              type="button"
                              className="btn-secondary-gold"
                              onClick={() =>
                                handleAction(`/api/fights/${f.fight_id}/stage`, 'POST', {
                                  target_tier: 'ON_DECK'
                                })
                              }
                            >
                              On-Deck
                            </button>
                            <button
                              type="button"
                              className="btn-primary-emerald"
                              onClick={() =>
                                handleAction(`/api/fights/${f.fight_id}/stage`, 'POST', {
                                  target_tier: 'LIVE_PIT'
                                })
                              }
                            >
                              Send to Live Pit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 8. GRANDSTAND BETTING & 9. CASHIER PAYOUTS
  if (moduleId === 'grandstand-betting' || moduleId === 'cashier-payouts') {
    const fights = arenaState.fights || [];
    const wagers = arenaState.wagers || [];

    return (
      <div className="workspace-split-grid">
        <form
          className="workspace-panel form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await handleAction(
              '/api/wagers',
              'POST',
              wagerForm,
              'Bet ticket issued and pool odds updated.'
            );
            if (res.ok) setWagerForm({ ...wagerForm, amount: '' });
          }}
        >
          <div className="workspace-panel-title">Issue Kristo / Cashier Wager Ticket</div>
          {notice && <div className="status-alert-banner is-success">{notice}</div>}
          <div className="form-field">
            <label className="form-label">Select Open Fight</label>
            <select
              className="form-select"
              required
              value={wagerForm.fight_number}
              onChange={(e) => setWagerForm({ ...wagerForm, fight_number: e.target.value })}
            >
              <option value="">-- Choose Bout --</option>
              {fights.map((f) => (
                <option key={f.fight_id} value={f.fight_number}>
                  Fight #{f.fight_number}: {f.meron_entry_name} vs {f.wala_entry_name} (
                  {f.is_betting_open ? 'OPEN' : 'LOCKED'})
                </option>
              ))}
            </select>
          </div>
          <div className="form-row-2col">
            <div className="form-field">
              <label className="form-label">Side</label>
              <select
                className="form-select"
                value={wagerForm.side}
                onChange={(e) => setWagerForm({ ...wagerForm, side: e.target.value })}
              >
                <option value="MERON">MERON</option>
                <option value="WALA">WALA</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Wager Amount (₱)</label>
              <input
                type="number"
                className="form-input"
                required
                placeholder="e.g. 5000"
                value={wagerForm.amount}
                onChange={(e) => setWagerForm({ ...wagerForm, amount: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary-emerald" disabled={submitting}>
            {submitting ? 'Printing Ticket...' : '+ Issue Encrypted Bet Ticket'}
          </button>
        </form>

        <div className="workspace-panel">
          <div className="workspace-panel-title">
            Issued Wager Tickets & Barcode Payouts ({wagers.length})
          </div>
          {wagers.length === 0 ? (
            <div className="module-empty-state">
              <div className="module-empty-title">No Bet Tickets Issued</div>
              <div className="module-empty-desc">
                Open betting on the active bout in Ruedo Pit & Bell, then issue wagers on the left to dynamically update Gross Handle, 10% House Plasada, and Meron/Wala pool percentages.
              </div>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket Barcode</th>
                    <th>Fight / Side</th>
                    <th>Wager</th>
                    <th>Net Payout</th>
                    <th>Status</th>
                    <th>Cashier Action</th>
                  </tr>
                </thead>
                <tbody>
                  {wagers.map((w) => (
                    <tr key={w.ticket_id}>
                      <td>
                        <strong>{w.ticket_id}</strong>
                      </td>
                      <td>
                        #{w.fight_number} • {w.side}
                      </td>
                      <td>₱{w.amount.toLocaleString()}</td>
                      <td>₱{w.potential_payout.toLocaleString()}</td>
                      <td>
                        <span
                          className={`status-badge ${w.status === 'WON' || w.status === 'PAID_OUT' ? 'is-passed' : 'is-pending'}`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td>
                        {(w.status === 'WON' || w.status === 'REFUNDABLE') && (
                          <button
                            type="button"
                            className="btn-primary-emerald"
                            onClick={() =>
                              handleAction(`/api/wagers/${w.ticket_id}/payout`, 'POST', {})
                            }
                          >
                            Release Payout
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 10. COCKPIT & ROOMS
  if (moduleId === 'cockpit-rooms') {
    const bays = arenaState.cockhouseBays || [];
    return (
      <div className="workspace-split-grid">
        <form
          className="workspace-panel form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await handleAction(
              '/api/cockhouse',
              'POST',
              bayForm,
              `Assigned ${bayForm.bay_number.toUpperCase()} to ${bayForm.assigned_entry.toUpperCase()}.`
            );
            if (res.ok) setBayForm({ ...bayForm, bay_number: '', assigned_entry: '', room_suite: '' });
          }}
        >
          <div className="workspace-panel-title">Assign Cockhouse Bay & Suite</div>
          {notice && <div className="status-alert-banner is-success">{notice}</div>}
          <div className="form-field">
            <label className="form-label">Bay Number</label>
            <input
              className="form-input"
              required
              placeholder="BAY-001"
              value={bayForm.bay_number}
              onChange={(e) => setBayForm({ ...bayForm, bay_number: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Assigned Syndicate Entry</label>
            <input
              className="form-input"
              required
              placeholder="THUNDERBIRD GOLD"
              value={bayForm.assigned_entry}
              onChange={(e) => setBayForm({ ...bayForm, assigned_entry: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Handler Suite / Bunk</label>
            <input
              className="form-input"
              required
              placeholder="Executive Suite A-01"
              value={bayForm.room_suite}
              onChange={(e) => setBayForm({ ...bayForm, room_suite: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary-emerald" disabled={submitting}>
            + Check In Cockhouse Bay
          </button>
        </form>

        <div className="workspace-panel">
          <div className="workspace-panel-title">Cockhouse Bay Manifest ({bays.length})</div>
          {bays.length === 0 ? (
            <div className="module-empty-state">
              <div className="module-empty-title">No Cockhouse Bays Occupied</div>
              <div className="module-empty-desc">
                Check in traveling gamefowl teams on the left to track biosecurity disinfection and RFID bay custody.
              </div>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Bay</th>
                    <th>Entry</th>
                    <th>Suite</th>
                    <th>Biosecurity</th>
                  </tr>
                </thead>
                <tbody>
                  {bays.map((b) => (
                    <tr key={b.bay_number}>
                      <td>
                        <strong>{b.bay_number}</strong>
                      </td>
                      <td>{b.assigned_entry}</td>
                      <td>{b.room_suite}</td>
                      <td>
                        <span className="status-badge is-passed">{b.biosecurity_status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 11. VET CLINIC & SUTURES
  if (moduleId === 'vet-clinic') {
    const cases = arenaState.vetSutures || [];
    return (
      <div className="workspace-split-grid">
        <form
          className="workspace-panel form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await handleAction('/api/vet-clinic', 'POST', vetForm, 'Suture case recorded.');
            if (res.ok)
              setVetForm({
                fight_number: '',
                wing_band: '',
                entry_name: '',
                manggagamot: '',
                procedure_notes: ''
              });
          }}
        >
          <div className="workspace-panel-title">Log Post-Fight Manggagamot Suture</div>
          <div className="form-row-2col">
            <div className="form-field">
              <label className="form-label">Fight #</label>
              <input
                type="number"
                className="form-input"
                required
                value={vetForm.fight_number}
                onChange={(e) => setVetForm({ ...vetForm, fight_number: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Wingband</label>
              <input
                className="form-input"
                required
                value={vetForm.wing_band}
                onChange={(e) => setVetForm({ ...vetForm, wing_band: e.target.value })}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Entry Name</label>
            <input
              className="form-input"
              required
              value={vetForm.entry_name}
              onChange={(e) => setVetForm({ ...vetForm, entry_name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Attending Manggagamot / Vet</label>
            <input
              className="form-input"
              required
              value={vetForm.manggagamot}
              onChange={(e) => setVetForm({ ...vetForm, manggagamot: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Suture & Medication Notes</label>
            <input
              className="form-input"
              required
              value={vetForm.procedure_notes}
              onChange={(e) => setVetForm({ ...vetForm, procedure_notes: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary-emerald" disabled={submitting}>
            + Record Vet Procedure
          </button>
        </form>

        <div className="workspace-panel">
          <div className="workspace-panel-title">Clinic Recovery Log ({cases.length})</div>
          {cases.length === 0 ? (
            <div className="module-empty-state">
              <div className="module-empty-title">No Surgical Recovery Cases Logged</div>
              <div className="module-empty-desc">
                Post-fight suture and antibiotic logs recorded by the arena Manggagamot will appear here.
              </div>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Fight / Wingband</th>
                    <th>Entry</th>
                    <th>Manggagamot</th>
                    <th>Procedure</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.case_id}>
                      <td>
                        <strong>{c.case_id}</strong>
                      </td>
                      <td>
                        #{c.fight_number} • {c.wing_band}
                      </td>
                      <td>{c.entry_name}</td>
                      <td>{c.manggagamot}</td>
                      <td>{c.procedure_notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 12. INVENTORY & EQUIPMENT
  if (moduleId === 'inventory-equipment') {
    const items = arenaState.inventoryAssets || [];
    return (
      <div className="workspace-split-grid">
        <form
          className="workspace-panel form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await handleAction('/api/inventory', 'POST', invForm, 'Inventory asset saved.');
            if (res.ok)
              setInvForm({
                sku: '',
                item_name: '',
                category: 'Tari Armory',
                stock_qty: '',
                unit: 'pcs',
                prerequisite_kit: '',
                custodian: ''
              });
          }}
        >
          <div className="workspace-panel-title">Register Armory / Arena Asset</div>
          <div className="form-row-2col">
            <div className="form-field">
              <label className="form-label">SKU</label>
              <input
                className="form-input"
                required
                placeholder="ARM-TARI-01"
                value={invForm.sku}
                onChange={(e) => setInvForm({ ...invForm, sku: e.target.value })}
              />
            </div>
            <div className="form-field">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-input"
                required
                value={invForm.stock_qty}
                onChange={(e) => setInvForm({ ...invForm, stock_qty: e.target.value })}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Item Name</label>
            <input
              className="form-input"
              required
              placeholder="Slasher Gaff Blade 3.25 in"
              value={invForm.item_name}
              onChange={(e) => setInvForm({ ...invForm, item_name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Prerequisite Kit Dependency</label>
            <input
              className="form-input"
              required
              placeholder="Requires Leather Sheath + Tie Cord"
              value={invForm.prerequisite_kit}
              onChange={(e) => setInvForm({ ...invForm, prerequisite_kit: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Custodian</label>
            <input
              className="form-input"
              required
              placeholder="Chief Armorer"
              value={invForm.custodian}
              onChange={(e) => setInvForm({ ...invForm, custodian: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary-emerald" disabled={submitting}>
            + Save Inventory Asset
          </button>
        </form>

        <div className="workspace-panel">
          <div className="workspace-panel-title">Asset Registry ({items.length})</div>
          {items.length === 0 ? (
            <div className="module-empty-state">
              <div className="module-empty-title">No Inventory Assets Registered</div>
              <div className="module-empty-desc">
                Register Tari blades, thermal receipt rolls, and calibrated platform scales on the left.
              </div>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Asset Name</th>
                    <th>Stock</th>
                    <th>Prerequisite Kit</th>
                    <th>Custodian</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.sku}>
                      <td>
                        <strong>{it.sku}</strong>
                      </td>
                      <td>{it.item_name}</td>
                      <td>
                        {it.stock_qty} {it.unit}
                      </td>
                      <td>{it.prerequisite_kit}</td>
                      <td>{it.custodian}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 13. DATABASE EXPLORER (Interactive Obsidian Relationship Graph + SQLite WAL Table Inspector)
  if (moduleId === 'database-explorer') {
    const tables = arenaState.databaseTables || [];
    return (
      <div className="form-stack">
        <div className="action-btn-row">
          <button
            type="button"
            className={dbTab === 'graph' ? 'btn-primary-emerald' : 'btn-secondary-gold'}
            onClick={() => setDbTab('graph')}
          >
            Interactive Relationship Graph (Node View)
          </button>
          <button
            type="button"
            className={dbTab === 'tables' ? 'btn-primary-emerald' : 'btn-secondary-gold'}
            onClick={() => setDbTab('tables')}
          >
            SQLite WAL Table Inspector ({tables.length} Tables)
          </button>
        </div>

        {dbTab === 'graph' ? (
          <DatabaseRelationshipGraph />
        ) : (
          <div className="workspace-panel">
            <div className="workspace-panel-title">
              Native SQLite (WAL Mode) Live Table Counts
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SQLite Table Name</th>
                    <th>Columns</th>
                    <th>Foreign Keys</th>
                    <th>Live Record Count</th>
                    <th>Storage Engine</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((t) => (
                    <tr key={t.tableName}>
                      <td>
                        <strong>{t.tableName}</strong>
                      </td>
                      <td>{t.columns?.length || 0} cols</td>
                      <td>{t.foreignKeys?.length || 0} FKs</td>
                      <td>{t.rowCount} rows</td>
                      <td>
                        <span className="status-badge is-passed">node:sqlite WAL</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 14. SECURITY & AUDIT LOGTRAIL
  if (moduleId === 'security-audit') {
    const logs = arenaState.auditLogs || [];
    return (
      <div className="workspace-panel">
        <div className="workspace-panel-title">
          Tamper-Evident Append-Only Audit Logtrail ({logs.length})
        </div>
        {logs.length === 0 ? (
          <div className="module-empty-state">
            <div className="module-empty-title">No Audit Events Recorded Yet</div>
            <div className="module-empty-desc">
              Every state transition across Gates 0–8 is immutably appended here with actor and terminal attribution.
            </div>
          </div>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Event Code</th>
                  <th>Actor</th>
                  <th>Terminal</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.log_id}>
                    <td>#{l.log_id}</td>
                    <td>
                      <strong>{l.event_code}</strong>
                    </td>
                    <td>{l.actor}</td>
                    <td>{l.terminal_id}</td>
                    <td>{l.details}</td>
                    <td>{l.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (moduleId === 'settings') {
    return (
      <div className="workspace-panel">
        <div className="workspace-panel-title">
          Desktop Environment, Fullscreen Wallpaper &amp; Arena Preferences
        </div>

        {/* 1. Fullscreen Wallpaper Picker */}
        <div className="form-card">
          <div className="form-card-title">Fullscreen Desktop Wallpaper (Nanobanana AI Coliseo)</div>
          <p className="form-card-help">
            Choose between the smooth wavy silk aesthetic (ultra-high legibility) or the futuristic coliseo arena wallpapers (optimized for night mode).
          </p>

          <div className="wallpaper-picker-grid">
            <button
              type="button"
              className={`wallpaper-card-option ${wallpaper === 'luxury_wavy' ? 'is-active' : ''}`}
              onClick={() => setWallpaper('luxury_wavy')}
            >
              <img
                src="/assets/cockpit_os_luxury_wallpaper.jpg"
                alt="Emerald Silk Wave — Subtle Classy Rooster"
                className="wallpaper-preview-thumb"
              />
              <div className="wallpaper-card-meta">
                <span className="wallpaper-card-name">Emerald Silk Wave (Subtle &amp; Classy)</span>
                <span className="wallpaper-card-desc">
                  Smooth wavy flowing silk ribbons, pearlescent ivory base, and a subtle classy embossed rooster motif. Optimal text contrast.
                </span>
                {wallpaper === 'luxury_wavy' && (
                  <span className="wallpaper-card-badge">ACTIVE WALLPAPER</span>
                )}
              </div>
            </button>

            <button
              type="button"
              className={`wallpaper-card-option ${wallpaper === 'wallpaper_v2' ? 'is-active' : ''}`}
              onClick={() => setWallpaper('wallpaper_v2')}
            >
              <img
                src="/assets/wallpaper_v2.jpg"
                alt="Coliseo Arena — Centered Champion Gamecock"
                className="wallpaper-preview-thumb"
              />
              <div className="wallpaper-card-meta">
                <span className="wallpaper-card-name">Coliseo Arena (Centered Champion)</span>
                <span className="wallpaper-card-desc">
                  Majestic Philippine Sweater/Kelso gamecock on pedestal inside emerald stadium tiers. Breathtaking in Night Mode.
                </span>
                {wallpaper === 'wallpaper_v2' && (
                  <span className="wallpaper-card-badge">ACTIVE WALLPAPER</span>
                )}
              </div>
            </button>

            <button
              type="button"
              className={`wallpaper-card-option ${wallpaper === 'wallpaper_v3' ? 'is-active' : ''}`}
              onClick={() => setWallpaper('wallpaper_v3')}
            >
              <img
                src="/assets/wallpaper_v3.jpg"
                alt="Coliseo Dome — Wide Cinematic Staging"
                className="wallpaper-preview-thumb"
              />
              <div className="wallpaper-card-meta">
                <span className="wallpaper-card-name">Coliseo Dome (Cinematic Widescreen)</span>
                <span className="wallpaper-card-desc">
                  Wide arena dome with right platform gamecock and left negative space. Optimized for dark coliseum ambiance.
                </span>
                {wallpaper === 'wallpaper_v3' && (
                  <span className="wallpaper-card-badge">ACTIVE WALLPAPER</span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* 2. Theme & Sound Preferences */}
        <div className="form-card">
          <div className="form-card-title">Display Theme &amp; Audio Cues</div>
          <div className="form-row-cols">
            <div className="form-group">
              <label className="form-label">Visual Theme Mode</label>
              <div className="btn-group-row">
                <button
                  type="button"
                  className={theme === 'light' ? 'btn-primary-emerald' : 'btn-secondary-gold'}
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                >
                  Emerald Light Glass
                </button>
                <button
                  type="button"
                  className={theme === 'dark' ? 'btn-primary-emerald' : 'btn-secondary-gold'}
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                >
                  Coliseum Dark Titanium
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Terminal Audio Feedback</label>
              <button
                type="button"
                className={soundEnabled ? 'btn-primary-emerald' : 'btn-secondary-gold'}
                onClick={toggleSound}
              >
                {soundEnabled ? 'Terminal Audio Enabled (Gate Cues)' : 'Terminal Audio Muted'}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Mesa de Control Hotkeys */}
        <div className="form-card">
          <div className="form-card-title">Mesa de Control Hotkeys &amp; Single-Key Shortcuts</div>
          <div className="hotkey-table-wrap">
            <table className="hotkey-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Action</th>
                  <th>Zero-Trust Context</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><kbd className="table-kbd">Space</kbd></td>
                  <td>Toggle Ruedo Fight Clock (Timer Start / Pause)</td>
                  <td>Gate 6 Verdict Authority</td>
                </tr>
                <tr>
                  <td><kbd className="table-kbd">B</kbd></td>
                  <td>Ring Ruedo Bell / Kampana Audio Cue</td>
                  <td>Coliseum Acoustic Protocol</td>
                </tr>
                <tr>
                  <td><kbd className="table-kbd">M</kbd></td>
                  <td>Meron Wager / Quick Meron Select</td>
                  <td>Gate 7 Grandstand Bet Pool</td>
                </tr>
                <tr>
                  <td><kbd className="table-kbd">W</kbd></td>
                  <td>Wala Wager / Quick Wala Select</td>
                  <td>Gate 7 Grandstand Bet Pool</td>
                </tr>
                <tr>
                  <td><kbd className="table-kbd">T</kbd></td>
                  <td>Declare Tabla / Draw Fight Result</td>
                  <td>Gate 8 Dual Sign-Off Required</td>
                </tr>
                <tr>
                  <td><kbd className="table-kbd">C</kbd></td>
                  <td>Cancel Fight / Void Round</td>
                  <td>Emergency Referee Override</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT / FINANCE / REPORTS / PAPERWORKS / NETWORK
  const ops = arenaState.operationsSummary;
  const sys = arenaState.systemMetrics;
  return (
    <div className="workspace-panel">
      <div className="workspace-panel-title">
        Live Module Telemetry & Regulatory Summary ({moduleId})
      </div>
      <div className="gate-cards-grid">
        <div className="gate-status-card is-passed">
          <div className="gate-id-tag">GROSS HANDLE</div>
          <div className="gate-name-title">
            ₱{Number(ops?.grossHandle || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <div className="gate-metric-text">Total Wager Pool Across Fights</div>
        </div>
        <div className="gate-status-card is-passed">
          <div className="gate-id-tag">HOUSE PLASADA ({ops?.plasadaRatePct ?? 10}%)</div>
          <div className="gate-name-title">
            ₱{Number(ops?.housePlasada || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </div>
          <div className="gate-metric-text">Retained Arena Commission Ledger</div>
        </div>
        <div className="gate-status-card is-passed">
          <div className="gate-id-tag">LOCAL LAN GATEWAY</div>
          <div className="gate-name-title">{sys?.lanIp}</div>
          <div className="gate-metric-text">
            Host: {sys?.terminalId} • {sys?.wsClientCount} Active WS Mesh Clients
          </div>
        </div>
      </div>
    </div>
  );
}

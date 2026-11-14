import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Users,
  Search,
  Sparkles,
  Trophy,
  Layers,
  RotateCw,
  Feather,
  FileText,
  BadgeDollarSign,
  Building2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function RegisterEntryCarouselModal({
  isOpen,
  onClose,
  activeEvent,
  existingEntries = [],
  onSuccess,
  handleAction
}) {
  if (!isOpen) return null;

  // Active Stage Determination
  const isMultiStage = activeEvent?.format?.toLowerCase().includes('multi') ||
    activeEvent?.format?.toLowerCase().includes('championship') ||
    (activeEvent?.rules_json && activeEvent?.rules_json.isMultiStage);

  const [targetStageNum, setTargetStageNum] = useState(activeEvent?.current_active_stage || 1);

  // Dynamic Stag Quota based on active event format & target stage
  const getStageQuota = (stgNum) => {
    const rules = typeof activeEvent?.rules_json === 'string'
      ? (() => { try { return JSON.parse(activeEvent.rules_json); } catch { return {}; } })()
      : activeEvent?.rules_json || {};

    if (isMultiStage) {
      if (stgNum === 1) return rules.elimsRounds || 3;
      if (stgNum === 2) return rules.semisRounds || 3;
      if (stgNum === 3) return rules.finalsRounds || 5;
      return 3;
    }
    // Single-Stage / Regular Format (Ulutan = 2, Panta = 3, 4-Cock = 4)
    if (activeEvent?.format?.toLowerCase().includes('ulutan')) return 2;
    if (activeEvent?.format?.toLowerCase().includes('panta')) return 3;
    return rules.totalRounds || 4;
  };

  const currentQuota = getStageQuota(targetStageNum);

  // Carousel Stepper (4 Stages)
  const [currentStage, setCurrentStage] = useState(1);
  const stages = [
    { num: 1, label: 'Breeder & Syndicate', sub: 'Participant Details' },
    { num: 2, label: 'Stag Legbands & Biometrics', sub: `${currentQuota} Stags for Loob` },
    { num: 3, label: 'Timbangan & Scale Window', sub: 'Physical Weight Verification' },
    { num: 4, label: 'Passport & Cashier Dispatch', sub: 'Unpaid Pot Escrow' }
  ];

  // Stage 1: Breeder & Participant Details
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [entryName, setEntryName] = useState('');
  const [ownerGallero, setOwnerGallero] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [handlerName, setHandlerName] = useState('');
  const [gafferName, setGafferName] = useState('');

  // Stage 2 & 3: Stags Data
  const [stags, setStags] = useState([]);

  // Initialize or re-shape stags array when quota changes
  useEffect(() => {
    setStags((prev) => {
      const next = [];
      for (let i = 0; i < currentQuota; i++) {
        const existing = prev[i] || {};
        next.push({
          index: i + 1,
          leg_band: existing.leg_band || '',
          wing_band: existing.wing_band || '',
          strain: existing.strain || 'Sweater Roundhead',
          plumage_color: existing.plumage_color || 'Pula',
          leg_color: existing.leg_color || 'Yellow',
          is_henny: existing.is_henny || false,
          weight_grams: existing.weight_grams || 1900
        });
      }
      return next;
    });
  }, [currentQuota]);

  // Autocomplete / Quick-Select returning team
  const handleSelectExistingEntry = (ent) => {
    setSelectedEntryId(ent.entry_id);
    setEntryName(ent.entry_name || '');
    setOwnerGallero(ent.owner_gallero || '');
    setContactNumber(ent.contact_number || '');
    setFarmLocation(ent.farm_location || '');
    setHandlerName(ent.handler_name || '');
    setGafferName(ent.gaffer_name || '');
    setSearchFilter('');
  };

  const handleClearSelection = () => {
    setSelectedEntryId(null);
    setEntryName('');
    setOwnerGallero('');
    setContactNumber('');
    setFarmLocation('');
    setHandlerName('');
    setGafferName('');
  };

  // Filtered returning entries
  const matchingEntries = existingEntries.filter((e) => {
    if (!searchFilter.trim()) return false;
    const q = searchFilter.toLowerCase();
    return (
      (e.entry_name && e.entry_name.toLowerCase().includes(q)) ||
      (e.owner_gallero && e.owner_gallero.toLowerCase().includes(q))
    );
  });

  // Scale window specs
  const minW = activeEvent?.min_weight_grams ?? 1700;
  const maxW = activeEvent?.max_weight_grams ?? 2250;
  const tolW = activeEvent?.weight_tolerance_grams ?? 35;

  const isStagWeightValid = (w) => Number(w) >= minW && Number(w) <= maxW;
  const allStagsWeighedCoherent = stags.every((s) => isStagWeightValid(s.weight_grams));

  // Saving states (2s delay requirement)
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleUpdateStag = (idx, field, val) => {
    setStags((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!entryName.trim() || !ownerGallero.trim()) {
      setErrorMessage('Entry Name and Gallero Owner are required.');
      return;
    }

    setSubmitting(true);
    setSaveStatus('saving');
    setErrorMessage('');

    const payload = {
      entry_id: selectedEntryId,
      entry_name: entryName.trim(),
      owner_gallero: ownerGallero.trim(),
      contact_number: contactNumber.trim(),
      farm_location: farmLocation.trim(),
      handler_name: handlerName.trim(),
      gaffer_name: gafferName.trim(),
      stage_num: targetStageNum,
      stags: stags.map((s, idx) => ({
        leg_band: s.leg_band.trim() || `EV-GBaCA-${Date.now().toString().slice(-4)}-${idx + 1}`,
        wing_band: s.wing_band.trim() || `WB-${Date.now().toString().slice(-4)}-${idx + 1}`,
        strain: s.strain,
        plumage_color: s.plumage_color,
        leg_color: s.leg_color,
        is_henny: Boolean(s.is_henny),
        weight_grams: Number(s.weight_grams || 1900)
      }))
    };

    // 2-Second saving animation state
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await handleAction(
        '/api/entries',
        'POST',
        payload,
        `Enrolled syndicate entry "${entryName.toUpperCase()}" with ${stags.length} stags (Status: UNPAID - Queued for Cashier).`
      );

      if (res && res.ok === false) {
        setSaveStatus('error');
        setErrorMessage(res.error || 'Failed to register syndicate entry.');
        setSubmitting(false);
        return;
      }

      setSaveStatus('success');
      setTimeout(() => {
        setSubmitting(false);
        if (onSuccess) onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      setSaveStatus('error');
      setErrorMessage(err.message || 'Error occurred while saving entry.');
      setSubmitting(false);
    }
  };

  return (
    <div className="carousel-journey-backdrop" onClick={onClose}>
      <div
        className="carousel-journey-modal animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Bar with Carousel Progress Tracker */}
        <div className="journey-header-bar">
          <div className="journey-title-cluster">
            <span className="journey-badge-pill">
              <Users size={13} className="card-title-icon-gold" />
              <span>GATE 2 • SYNDICATE ENTRY & BIOMETRIC REGISTRATION</span>
            </span>
            <h2 className="journey-main-heading">Register Official Syndicate Entry</h2>
          </div>

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

          <button
            type="button"
            className="journey-close-btn"
            onClick={onClose}
            title="Cancel &amp; Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Slide Container */}
        <div className="journey-slide-container">
          {/* ===================================================================
              STAGE 1: BREEDER & SYNDICATE PARTICIPANT DETAILS
              =================================================================== */}
          {currentStage === 1 && (
            <div className="journey-slide">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 1: Syndicate Ownership, Breeder Profile &amp; Kennel Personnel
                </div>
                <div className="slide-intro-desc">
                  Enroll participant credentials for tournament registry. For returning teams advancing from previous rounds, use Quick-Select below to pre-populate details.
                </div>
              </div>

              {/* Quick-Select Returning Team Strip */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Search size={14} className="card-title-icon-gold" />
                    <span>Quick-Select Returning Team / Advancing Qualifier</span>
                  </div>
                  {selectedEntryId && (
                    <button
                      type="button"
                      className="category-pill-btn"
                      onClick={handleClearSelection}
                    >
                      Clear Selection (Enter New Team)
                    </button>
                  )}
                </div>

                <div className="stage-input-grid">
                  <div className="stage-form-group full-row">
                    <input
                      type="text"
                      className="input-stage"
                      placeholder="Type entry name or owner to search existing registered syndicates..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>
                </div>

                {matchingEntries.length > 0 && (
                  <div className="category-preset-bar">
                    <span className="category-preset-label">Matching Registered Teams:</span>
                    <div className="category-quick-pills">
                      {matchingEntries.slice(0, 6).map((ent) => (
                        <button
                          key={ent.entry_id}
                          type="button"
                          className={`category-pill-btn ${selectedEntryId === ent.entry_id ? 'is-active' : ''}`}
                          onClick={() => handleSelectExistingEntry(ent)}
                        >
                          {ent.entry_name} ({ent.owner_gallero})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tournament Stage Target Box (if multi-stage) */}
              {isMultiStage && (
                <div className="roles-quick-checklist-strip">
                  <div className="checklist-strip-header">
                    <div className="checklist-strip-title">
                      <Layers size={14} className="card-title-icon-gold" />
                      <span>Target Tournament Stage &amp; Today's Stag Loob Quota</span>
                    </div>
                    <span className="checklist-strip-hint">
                      Today's Requirement: {currentQuota} Stags / Cocks
                    </span>
                  </div>
                  <div className="category-quick-pills">
                    {[
                      { num: 1, label: 'Stage 1: Eliminations', quota: getStageQuota(1) },
                      { num: 2, label: 'Stage 2: Semi-Finals', quota: getStageQuota(2) },
                      { num: 3, label: 'Stage 3: Championship Finals', quota: getStageQuota(3) }
                    ].map((stg) => (
                      <button
                        key={stg.num}
                        type="button"
                        className={`category-pill-btn ${targetStageNum === stg.num ? 'is-active' : ''}`}
                        onClick={() => setTargetStageNum(stg.num)}
                      >
                        {stg.label} ({stg.quota} Stags)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Syndicate Registration Fields */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Building2 size={14} className="card-title-icon-gold" />
                    <span>Official Syndicate Identity &amp; Kennel Authority</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Official GAB / PD 449 Gallero Credentials
                  </span>
                </div>

                <div className="stage-input-grid">
                  <div className="stage-form-group">
                    <label>Entry / Syndicate Team Name *</label>
                    <input
                      className="input-stage"
                      required
                      placeholder="e.g. THUNDERBIRD GOLD"
                      value={entryName}
                      onChange={(e) => setEntryName(e.target.value)}
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Owner / Gallero Breeder *</label>
                    <input
                      className="input-stage"
                      required
                      placeholder="e.g. Boss Atong / San Juan Farm"
                      value={ownerGallero}
                      onChange={(e) => setOwnerGallero(e.target.value)}
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Contact / Mobile Number</label>
                    <input
                      className="input-stage"
                      placeholder="e.g. 0917-555-0199"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Farm Location / LGU / Chapter</label>
                    <input
                      className="input-stage"
                      placeholder="e.g. Palo, Leyte • EV-GBaCA Chapter"
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Designated Handler (Magpapakain)</label>
                    <input
                      className="input-stage"
                      placeholder="e.g. Master Jun Handler"
                      value={handlerName}
                      onChange={(e) => setHandlerName(e.target.value)}
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Designated Gaffer (Mananari)</label>
                    <input
                      className="input-stage"
                      placeholder="e.g. Ka Berting Gaffer"
                      value={gafferName}
                      onChange={(e) => setGafferName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STAGE 2: STAG ENTRIES & LEGBAND ASSIGNMENT
              =================================================================== */}
          {currentStage === 2 && (
            <div className="journey-slide">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 2: Official Stag Entries, Federation Bands &amp; Biometrics ({currentQuota} Stags)
                </div>
                <div className="slide-intro-desc">
                  Dynamically generated for today's fight card ({currentQuota} stags). Enter verified federation legbands, wing bands, bloodline strains, plumage, and shank color.
                </div>
              </div>

              {/* Stag Entry Cards Grid */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Feather size={14} className="card-title-icon-gold" />
                    <span>Stag Identification &amp; Regulatory Band Registry</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Total Required Loob: {currentQuota} Stags
                  </span>
                </div>

                {stags.map((stag, idx) => (
                  <div key={idx} className="roles-quick-checklist-strip stag-biometric-card">
                    <div className="checklist-strip-header">
                      <div className="checklist-strip-title">
                        <Sparkles size={13} className="card-title-icon-emerald" />
                        <span>Stag #{idx + 1} (Loob #{idx + 1})</span>
                      </div>
                      <span className="category-preset-label">
                        {stag.strain} • {stag.plumage_color}
                      </span>
                    </div>

                    <div className="form-row-3col">
                      <div className="stage-form-group">
                        <label>Federation Legband # *</label>
                        <input
                          className="input-stage"
                          required
                          placeholder={`e.g. EV-GBaCA-${2026}-${String(idx + 101).padStart(4, '0')}`}
                          value={stag.leg_band}
                          onChange={(e) => handleUpdateStag(idx, 'leg_band', e.target.value)}
                        />
                      </div>

                      <div className="stage-form-group">
                        <label>Wing Band # *</label>
                        <input
                          className="input-stage"
                          required
                          placeholder={`e.g. WB-${String(idx + 501).padStart(4, '0')}`}
                          value={stag.wing_band}
                          onChange={(e) => handleUpdateStag(idx, 'wing_band', e.target.value)}
                        />
                      </div>

                      <div className="stage-form-group">
                        <label>Bloodline / Breed Strain</label>
                        <input
                          className="input-stage"
                          placeholder="e.g. Sweater Roundhead, Kelso"
                          value={stag.strain}
                          onChange={(e) => handleUpdateStag(idx, 'strain', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row-3col stag-biometric-subrow">
                      <div className="stage-form-group">
                        <label>Plumage Color</label>
                        <select
                          className="input-stage"
                          value={stag.plumage_color}
                          onChange={(e) => handleUpdateStag(idx, 'plumage_color', e.target.value)}
                        >
                          <option value="Pula">Pula (Red)</option>
                          <option value="Alimbuyogan">Alimbuyogan</option>
                          <option value="Talisayin">Talisayin</option>
                          <option value="Mayahin">Mayahin</option>
                          <option value="Bulik">Bulik</option>
                          <option value="Lasak">Lasak</option>
                          <option value="Sinibalang">Sinibalang</option>
                          <option value="Kalasag">Kalasag</option>
                        </select>
                      </div>

                      <div className="stage-form-group">
                        <label>Shank / Leg Color</label>
                        <select
                          className="input-stage"
                          value={stag.leg_color}
                          onChange={(e) => handleUpdateStag(idx, 'leg_color', e.target.value)}
                        >
                          <option value="Yellow">Yellow Shank</option>
                          <option value="Green">Green Shank</option>
                          <option value="White">White Shank</option>
                          <option value="Blue/Lead">Blue / Lead Shank</option>
                        </select>
                      </div>

                      <div className="stage-form-group">
                        <label>Gender Policy Compliance</label>
                        <label className="derby-activate-checkbox-label stag-henny-checkbox-container">
                          <input
                            type="checkbox"
                            checked={stag.is_henny}
                            onChange={(e) => handleUpdateStag(idx, 'is_henny', e.target.checked)}
                          />
                          <span>Henny Exemption (Check only if Henny)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              STAGE 3: TIMBANGAN & FINAL WEIGHT IN PREPARATION FOR MATCHMAKING
              =================================================================== */}
          {currentStage === 3 && (
            <div className="journey-slide">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 3: Official Timbangan Scale Verification &amp; Kasahan Envelope
                </div>
                <div className="slide-intro-desc">
                  Input verified platform scale weights in grams. Birds must fall within the sanctioned tournament window ({minW.toLocaleString()}g – {maxW.toLocaleString()}g) for automated Kasahan pairing.
                </div>
              </div>

              {/* Tournament Scale Window Visualizer */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Scale size={14} className="card-title-icon-gold" />
                    <span>Sanctioned Kasahan Acceptance Envelope</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Allowable Match Variance: &plusmn;{tolW}g
                  </span>
                </div>

                <div className="derby-scale-envelope-bar">
                  <div className="derby-scale-end-box">
                    <div className="derby-scale-end-label">MIN WEIGHT</div>
                    <div className="derby-scale-end-val">{minW}g</div>
                    <div className="derby-scale-end-sub">({(minW / 1000).toFixed(3)} kg)</div>
                  </div>
                  <div className="derby-scale-track">
                    <div className="derby-scale-fill" />
                  </div>
                  <div className="derby-scale-end-box">
                    <div className="derby-scale-end-label">MAX WEIGHT</div>
                    <div className="derby-scale-end-val">{maxW}g</div>
                    <div className="derby-scale-end-sub">({(maxW / 1000).toFixed(3)} kg)</div>
                  </div>
                </div>
              </div>

              {/* Stag Weigh-In Cards */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <CheckCircle2 size={14} className="card-title-icon-emerald" />
                    <span>Official Scale Weight Intake ({stags.length} Stags)</span>
                  </div>
                  <span className={`balance-check-pill ${allStagsWeighedCoherent ? 'is-balanced' : 'is-warning'}`}>
                    {allStagsWeighedCoherent ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>All {stags.length} Stags Within Accepted Window</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={12} />
                        <span>Weight Warning Detected</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="form-row-3col">
                  {stags.map((stag, idx) => {
                    const isValid = isStagWeightValid(stag.weight_grams);
                    return (
                      <div
                        key={idx}
                        className={`stage-form-group stag-scale-input-card ${isValid ? 'is-valid' : 'is-invalid'}`}
                      >
                        <div className="stag-scale-card-header">
                          <label>Stag #{idx + 1} Scale Weight</label>
                          <span
                            className={isValid ? 'cashier-pot-badge-paid' : 'cashier-pot-badge-unpaid'}
                          >
                            {isValid ? 'PASSED' : 'OUTSIDE'}
                          </span>
                        </div>

                        <input
                          type="number"
                          className="input-stage"
                          min="1000"
                          max="3500"
                          required
                          value={stag.weight_grams}
                          onChange={(e) => handleUpdateStag(idx, 'weight_grams', Number(e.target.value))}
                        />

                        <div className="field-hint-text stag-scale-card-footer">
                          <span>{stag.leg_band || `Stag ${idx + 1}`}</span>
                          <span className={isValid ? 'passport-value is-emerald' : 'passport-value is-locked'}>
                            {(Number(stag.weight_grams || 0) / 1000).toFixed(3)} kg
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STAGE 4: SYNDICATE ENTRY PASSPORT & CASHIER ROUTING (UNPAID ESCROW)
              =================================================================== */}
          {currentStage === 4 && (
            <div className="journey-slide slide-verification">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 4: Official Syndicate Entry Passport &amp; Center Cashier Clearance
                </div>
                <div className="slide-intro-desc">
                  Review the enrolled syndicate dossier. This entry will be routed directly to the Center Cashier Cage as UNPAID. In accordance with Coliseum Rules, matchmaking is locked until the pot fee is verified and settled.
                </div>
              </div>

              {/* Syndicate Passport Summary Card */}
              <div className="journey-passport-card">
                <div className="passport-header">
                  <div className="passport-crest-avatar">
                    <Trophy size={36} className="card-title-icon-gold" />
                  </div>
                  <div className="passport-title-group">
                    <div className="passport-operator-name">{entryName || 'UNTITLED SYNDICATE'}</div>
                    <div className="passport-username-tag">
                      Owner: <strong>{ownerGallero || 'N/A'}</strong> • {farmLocation || 'Regional Open'}
                    </div>
                    <div className="passport-role-tag">
                      Handler: {handlerName || 'None'} • Gaffer: {gafferName || 'None'}
                    </div>
                  </div>
                  <div className="passport-status-stamp is-unpaid">
                    <ShieldAlert size={16} />
                    <span>UNPAID • PENDING CASHIER</span>
                  </div>
                </div>

                <div className="passport-details-grid">
                  <div className="passport-field">
                    <span className="passport-label">Active Tournament</span>
                    <span className="passport-value">{activeEvent?.title || 'Sanctioned Derby'}</span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Registered Loob</span>
                    <span className="passport-value is-emerald">
                      {stags.length} Stags (Stage {targetStageNum})
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Pot Fee Due</span>
                    <span className="passport-value is-gold">
                      ₱{Number(activeEvent?.pot_fee || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Matchmaking Clearance</span>
                    <span className="passport-value is-locked">
                      LOCKED (Pay at Cashier)
                    </span>
                  </div>

                  <div className="passport-field full-row">
                    <span className="passport-label">Registered Stags &amp; Biometrics</span>
                    <div className="passport-stags-wrap">
                      {stags.map((s, i) => (
                        <span key={i} className="category-pill-btn">
                          <strong>#{i + 1}</strong>: {s.leg_band || `Band ${i + 1}`} ({s.weight_grams}g • {s.strain})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="passport-field full-row">
                    <span className="passport-label">Coliseum Regulatory Protocol (Gate 2 &amp; Gate 8)</span>
                    <span className="passport-value passport-manifesto-text">
                      This syndicate entry will be submitted to the physical SQLite WAL database with payment status <strong>UNPAID</strong>. The entry will immediately populate the Center Cashier Cage's Unpaid Pot Receivables list. Automated Kasahan and Ruedo matchmaking will strictly exclude this entry until official payment receipt is logged by the Head Cashier.
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Notice if any */}
              {errorMessage && (
                <div className="warning-banner is-error">
                  <AlertTriangle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Navigation Footer Bar */}
        <div className="journey-nav-footer">
          <div className="journey-footer-left">
            <span className="journey-stage-counter">
              Stage <strong>0{currentStage}</strong> of 04
            </span>
            <div className="journey-active-summary">
              <span>Team:</span>
              <strong>{entryName || 'New Entry'}</strong>
              <span>•</span>
              <span>Stags:</span>
              <strong>{stags.length}</strong>
              <span>•</span>
              <span>Status:</span>
              <strong className="passport-value is-locked">UNPAID (Pending Cashier)</strong>
            </div>
          </div>

          <div className="journey-footer-right">
            <button
              type="button"
              className="btn-cancel-flat"
              onClick={currentStage === 1 ? onClose : () => setCurrentStage((s) => s - 1)}
            >
              {currentStage === 1 ? 'Cancel' : '< Previous Step'}
            </button>

            {currentStage < 4 ? (
              <button
                type="button"
                className="btn-primary-emerald"
                onClick={() => {
                  if (currentStage === 1 && (!entryName.trim() || !ownerGallero.trim())) {
                    setErrorMessage('Please provide Entry / Team Name and Gallero Owner before proceeding.');
                    return;
                  }
                  setErrorMessage('');
                  setCurrentStage((s) => s + 1);
                }}
              >
                <span>Continue to Stage {currentStage + 1}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                className={`btn-primary-emerald ${saveStatus === 'success' ? 'is-success-btn' : ''}`}
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting && <RotateCw size={14} className="spin" />}
                <span>
                  {saveStatus === 'saving'
                    ? 'Registering & Routing to Cashier (2s)...'
                    : saveStatus === 'success'
                    ? 'Registered Successfully!'
                    : '+ Submit Official Entry'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

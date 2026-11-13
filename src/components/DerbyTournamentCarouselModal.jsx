import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Scale,
  BadgeDollarSign,
  Calendar,
  Building2,
  Check,
  RotateCw,
  AlertCircle,
  Award,
  Layers,
  MapPin,
  Clock,
  Swords,
  Users,
  Sliders,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

export function DerbyTournamentCarouselModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  activeTenant
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [saveError, setSaveError] = useState('');

  // 1. DYNAMIC IDENTITY & STAGE STRUCTURE
  const [tournamentCategory, setTournamentCategory] = useState('Stag Derby'); // 'Stag Derby' | 'Cock Derby' | 'Bullstag Derby' | 'Pewee Derby'
  const [totalRounds, setTotalRounds] = useState(11);
  const [isMultiStage, setIsMultiStage] = useState(true);
  const [elimsRounds, setElimsRounds] = useState(3);
  const [semisRounds, setSemisRounds] = useState(3);
  const [finalsRounds, setFinalsRounds] = useState(5);

  const [title, setTitle] = useState('ENCUENTRO SA OTSO - CLASH OF THE CHAMPIONS');
  const [promoter, setPromoter] = useState('Eastern Visayas Gamefowl Breeders and Cockfighting Aficionados (EV-GBaCA)');
  const [venueName, setVenueName] = useState(
    activeTenant?.arena_name || 'Leyte Recreational and Amusement Complex (LRAC), Brgy. Salvacion, Palo, Leyte'
  );
  const [clusterDistrict, setClusterDistrict] = useState('Eastern Visayas Region 8 (Samar, Leyte, Biliran)');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));

  // 2. DYNAMIC KASAHAN & SCALE RULES
  const [minWeightGrams, setMinWeightGrams] = useState(1700);
  const [maxWeightGrams, setMaxWeightGrams] = useState(2250);
  const [weightToleranceGrams, setWeightToleranceGrams] = useState(35);
  const [matchingSystem, setMatchingSystem] = useState('HABOL_SYSTEM'); // 'HABOL_SYSTEM' | 'STANDARD' | 'FIGHT_ALL'
  const [bandingCategory, setBandingCategory] = useState('OPEN'); // 'OPEN' | 'NATIONAL_ONLY' | 'LATE_BORN'
  const [henniesAllowed, setHenniesAllowed] = useState(0); // 0 = Strictly No Hennies, 1 = Allowed
  const [submissionCutoff, setSubmissionCutoff] = useState('1 day before derby until 12:00 NN (Derby Day screening until 2:00 PM)');

  // 3. DYNAMIC POT & BETTING ECONOMICS
  const [potMode, setPotMode] = useState('NO_POT_BAYAD_AGAD'); // 'NO_POT_BAYAD_AGAD' | 'UPFRONT_POT_ESCROW'
  const [dayMoneyAmount, setDayMoneyAmount] = useState(50000);
  const [potFee, setPotFee] = useState(0);
  const [guaranteedPrize, setGuaranteedPrize] = useState(5000000);
  const [minBet, setMinBet] = useState(3500);
  const [maxLevelBet, setMaxLevelBet] = useState(0); // 0 = open declared
  const [plasadaSplit, setPlasadaSplit] = useState('70/30');

  // 4. DYNAMIC ADVANCEMENT & PRIZE BREAKDOWN
  const [elimsAdvancePts, setElimsAdvancePts] = useState('2.0');
  const [semisScoreReset, setSemisScoreReset] = useState(1); // 1 = Scores back to zero, 0 = cumulative
  const [championPrize, setChampionPrize] = useState(1500000);
  const [runnerupPrize, setRunnerupPrize] = useState(500000);
  const [bracketAny7Prize, setBracketAny7Prize] = useState(1000000);
  const [bracketAny6Prize, setBracketAny6Prize] = useState(1000000);
  const [bracketAny5Prize, setBracketAny5Prize] = useState(700000);
  const [bracketAny3Prize, setBracketAny3Prize] = useState(25000);
  const [handlerAward, setHandlerAward] = useState(200000);
  const [gafferAward, setGafferAward] = useState(100000);
  const [stagFighterAward, setStagFighterAward] = useState(1000000);

  const [activateNow, setActivateNow] = useState(true);

  // Auto-calculated logical stage coherence
  const stageRoundsSum = useMemo(() => {
    if (!isMultiStage) return totalRounds;
    return Number(elimsRounds || 0) + Number(semisRounds || 0) + Number(finalsRounds || 0);
  }, [isMultiStage, totalRounds, elimsRounds, semisRounds, finalsRounds]);

  const isStageBreakdownCoherent = useMemo(() => {
    if (!isMultiStage) return true;
    return stageRoundsSum === Number(totalRounds);
  }, [isMultiStage, stageRoundsSum, totalRounds]);

  // Dynamic format label
  const derivedFormatLabel = useMemo(() => {
    if (!isMultiStage) {
      return `${totalRounds}-${tournamentCategory.replace(' Derby', '')} Straight Derby`;
    }
    return `${totalRounds}-${tournamentCategory.replace(' Derby', '')} Derby (${elimsRounds}-${semisRounds}-${finalsRounds} Championship Format)`;
  }, [totalRounds, tournamentCategory, isMultiStage, elimsRounds, semisRounds, finalsRounds]);

  // Sum of distributed prizes
  const totalAllocatedPrizes = useMemo(() => {
    return (
      Number(championPrize || 0) +
      Number(runnerupPrize || 0) +
      Number(bracketAny7Prize || 0) +
      Number(bracketAny6Prize || 0) +
      Number(bracketAny5Prize || 0) +
      Number(bracketAny3Prize || 0) +
      Number(handlerAward || 0) +
      Number(gafferAward || 0) +
      Number(stagFighterAward || 0)
    );
  }, [
    championPrize,
    runnerupPrize,
    bracketAny7Prize,
    bracketAny6Prize,
    bracketAny5Prize,
    bracketAny3Prize,
    handlerAward,
    gafferAward,
    stagFighterAward
  ]);

  const prizeAllocationDifference = useMemo(() => {
    return Number(guaranteedPrize || 0) - totalAllocatedPrizes;
  }, [guaranteedPrize, totalAllocatedPrizes]);

  // Dynamically synthesized rules text
  const synthesizedDerbyRules = useMemo(() => {
    const potDesc =
      potMode === 'NO_POT_BAYAD_AGAD'
        ? `No Pot Money on Elims. Guaranteed Day Money ₱${Number(dayMoneyAmount).toLocaleString()}.`
        : `Upfront Pot Escrow ₱${Number(potFee).toLocaleString()} per syndicate entry.`;

    const resetDesc = semisScoreReset
      ? 'Semi-Finals Score Rule: Scores reset back to zero on Semi-Finals (EV-GBaCA Standard).'
      : 'Scores cumulative across all stages.';

    const matchDesc =
      matchingSystem === 'HABOL_SYSTEM'
        ? `Habol System (±${weightToleranceGrams}g Kasahan Give & Take).`
        : `Standard Fair Matching (±${weightToleranceGrams}g tolerance).`;

    const hennieDesc = henniesAllowed
      ? 'Hennies permitted by special exemption.'
      : 'Strictly No Hennies (Bring Official Stag Registry).';

    return (
      `Official ${derivedFormatLabel}. ${potDesc} Min Bet: ₱${Number(minBet).toLocaleString()} per sultada. ` +
      `Accepted scale: ${minWeightGrams}g–${maxWeightGrams}g. ${matchDesc} ` +
      `Banding: ${bandingCategory}. ${hennieDesc} Advancing cutoff: ${elimsAdvancePts} pts. ${resetDesc} ` +
      `Total Guaranteed Prize: ₱${Number(guaranteedPrize).toLocaleString()}.`
    );
  }, [
    derivedFormatLabel,
    potMode,
    dayMoneyAmount,
    potFee,
    minBet,
    minWeightGrams,
    maxWeightGrams,
    matchingSystem,
    weightToleranceGrams,
    bandingCategory,
    henniesAllowed,
    elimsAdvancePts,
    semisScoreReset,
    guaranteedPrize
  ]);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setSaveStatus('idle');
      setSaveError('');
      setCurrentStage(1);
    }
  }, [isOpen]);

  const stages = [
    { num: 1, label: 'Identity & Format', sub: 'Category & Stage Breakdown' },
    { num: 2, label: 'Kasahan & Scale', sub: 'Weight Bracket & Habol System' },
    { num: 3, label: 'Pot & Bet Rules', sub: 'Day Money, Min Bet & Plasada' },
    { num: 4, label: 'Advancement & Purse', sub: 'Score Reset & Prize Allocation' },
    { num: 5, label: 'Manifesto & Launch', sub: 'Physical SQLite WAL Audit' }
  ];

  const handleNext = () => {
    if (currentStage === 1) {
      if (!title.trim() || !promoter.trim()) {
        alert('Please fill in the Tournament Title and Promoter / Host.');
        return;
      }
      if (!isStageBreakdownCoherent) {
        alert(
          `Stage fight counts (${stageRoundsSum}) do not match total stags (${totalRounds}). Please adjust so they are logically coherent.`
        );
        return;
      }
    }
    if (currentStage === 2) {
      if (Number(minWeightGrams) >= Number(maxWeightGrams)) {
        alert('Minimum weight must be strictly less than maximum weight.');
        return;
      }
    }
    setCurrentStage((prev) => Math.min(5, prev + 1));
  };

  const handlePrev = () => {
    setCurrentStage((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (saveStatus === 'saving' || saveStatus === 'success') return;

    if (!title.trim() || !promoter.trim() || !eventDate) {
      alert('Tournament Title, Event Date, and Host/Promoter are required.');
      setCurrentStage(1);
      return;
    }

    setSaveStatus('saving');
    setSaveError('');

    const payload = {
      title: title.trim(),
      format: derivedFormatLabel,
      promoter: promoter.trim(),
      venue_name: venueName.trim(),
      cluster_district: clusterDistrict.trim(),
      event_date: eventDate,
      min_weight_grams: Number(minWeightGrams),
      max_weight_grams: Number(maxWeightGrams),
      weight_tolerance_grams: Number(weightToleranceGrams),
      matching_system: matchingSystem,
      pot_mode: potMode,
      day_money_amount: Number(dayMoneyAmount || 0),
      pot_fee: Number(potFee || 0),
      guaranteed_prize: Number(guaranteedPrize || 0),
      min_bet: Number(minBet || 0),
      max_level_bet: Number(maxLevelBet || 0),
      plasada_split: plasadaSplit,
      banding_category: bandingCategory,
      hennies_allowed: Number(henniesAllowed),
      elims_advance_pts: String(elimsAdvancePts),
      semis_score_reset: Number(semisScoreReset),
      champion_prize: Number(championPrize || 0),
      runnerup_prize: Number(runnerupPrize || 0),
      handler_award: Number(handlerAward || 0),
      gaffer_award: Number(gafferAward || 0),
      stag_fighter_award: Number(stagFighterAward || 0),
      derby_rules: synthesizedDerbyRules,
      activate_now: activateNow
    };

    try {
      const res = await onSubmit(payload);
      if (res && res.ok === false) {
        setSaveStatus('error');
        setSaveError(res.error || 'Failed to provision tournament event.');
        return;
      }
      setSaveStatus('success');
      setTimeout(() => {
        onClose();
      }, 1100);
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err?.message || 'Error occurred while saving tournament event.');
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="carousel-journey-backdrop" onClick={onClose}>
      <div
        className="carousel-journey-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Coliseum Derby Tournament Creation Journey"
      >
        {/* 1. Header Bar with Carousel Progress Tracker */}
        <div className="journey-header-bar">
          <div className="journey-title-cluster">
            <span className="journey-badge-pill">
              <Trophy size={13} className="card-title-icon-gold" />
              <span>COLISEO DERBY RULES ENGINE</span>
            </span>
            <h2 className="journey-main-heading">
              Configure &amp; Launch Derby Tournament
            </h2>
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
              STAGE 1: TOURNAMENT IDENTITY & DYNAMIC STAGE BREAKDOWN
              =================================================================== */}
          {currentStage === 1 && (
            <div className="journey-slide">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 1: Tournament Identity, Host Association &amp; Dynamic Format Architecture
                </div>
                <div className="slide-intro-desc">
                  Dynamically construct the stage progression (Eliminations, Semi-Finals, and Championship Finals) with real-time logical validation.
                </div>
              </div>

              {/* Dynamic Structure Builder Box */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Layers size={14} className="card-title-icon-gold" />
                    <span>Dynamic Tournament Stage Allocation &amp; Coherence</span>
                  </div>
                  <div className="top-pills-row">
                    <span className={`balance-check-pill ${isStageBreakdownCoherent ? 'is-balanced' : 'is-warning'}`}>
                      {isStageBreakdownCoherent ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Coherent: {stageRoundsSum} Stags Total</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} />
                          <span>Mismatch: {stageRoundsSum} / {totalRounds} Stags</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="form-row-3col" style={{ marginTop: '8px' }}>
                  <div className="stage-form-group">
                    <label>Tournament Category</label>
                    <select
                      className="input-stage"
                      value={tournamentCategory}
                      onChange={(e) => setTournamentCategory(e.target.value)}
                    >
                      <option value="Stag Derby">Stag Derby (Banded Young Stags)</option>
                      <option value="Cock Derby">Cock Derby (Mature Cocks)</option>
                      <option value="Bullstag Derby">Bullstag Derby</option>
                      <option value="Pewee Derby">Pewee / Small Fowl Derby</option>
                    </select>
                  </div>

                  <div className="stage-form-group">
                    <label>Total Stags / Cocks per Entry</label>
                    <input
                      type="number"
                      min="2"
                      max="15"
                      className="input-stage"
                      value={totalRounds}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTotalRounds(val);
                        if (val === 11) {
                          setElimsRounds(3);
                          setSemisRounds(3);
                          setFinalsRounds(5);
                          setIsMultiStage(true);
                        } else if (val === 4) {
                          setElimsRounds(2);
                          setSemisRounds(0);
                          setFinalsRounds(2);
                          setIsMultiStage(true);
                        } else if (val === 3) {
                          setElimsRounds(3);
                          setSemisRounds(0);
                          setFinalsRounds(0);
                          setIsMultiStage(false);
                        }
                      }}
                    />
                  </div>

                  <div className="stage-form-group">
                    <label>Progression Architecture</label>
                    <select
                      className="input-stage"
                      value={isMultiStage ? 'MULTI' : 'SINGLE'}
                      onChange={(e) => setIsMultiStage(e.target.value === 'MULTI')}
                    >
                      <option value="MULTI">Multi-Stage Championship (Elims ➔ Semis ➔ Finals)</option>
                      <option value="SINGLE">Single-Stage (Straight Fight-All / Panta)</option>
                    </select>
                  </div>
                </div>

                {isMultiStage && (
                  <div className="derby-stages-flow-strip" style={{ marginTop: '12px' }}>
                    <div className="derby-flow-step-box">
                      <div className="step-tag">STAGE 1: ELIMINATIONS</div>
                      <div className="step-stags">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="input-stage"
                          style={{ width: '80px', textAlign: 'center', fontWeight: '800' }}
                          value={elimsRounds}
                          onChange={(e) => setElimsRounds(Number(e.target.value))}
                        />
                        <span style={{ fontSize: '11px', fontWeight: '700' }}>Stags</span>
                      </div>
                      <div className="step-sub">Local / Open Bands</div>
                    </div>

                    <div className="step-arrow">➔</div>

                    <div className="derby-flow-step-box">
                      <div className="step-tag">STAGE 2: SEMI-FINALS</div>
                      <div className="step-stags">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="input-stage"
                          style={{ width: '80px', textAlign: 'center', fontWeight: '800' }}
                          value={semisRounds}
                          onChange={(e) => setSemisRounds(Number(e.target.value))}
                        />
                        <span style={{ fontSize: '11px', fontWeight: '700' }}>Stags</span>
                      </div>
                      <div className="step-sub">Scores Back to Zero</div>
                    </div>

                    <div className="step-arrow">➔</div>

                    <div className="derby-flow-step-box is-final">
                      <div className="step-tag">STAGE 3: FINALS</div>
                      <div className="step-stags">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="input-stage"
                          style={{ width: '80px', textAlign: 'center', fontWeight: '800' }}
                          value={finalsRounds}
                          onChange={(e) => setFinalsRounds(Number(e.target.value))}
                        />
                        <span style={{ fontSize: '11px', fontWeight: '700' }}>Stags</span>
                      </div>
                      <div className="step-sub">Purse &amp; Champion</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tournament Identifiers Input Grid */}
              <div className="stage-input-grid" style={{ marginTop: '12px' }}>
                <div className="stage-form-group">
                  <label>Official Tournament Title *</label>
                  <input
                    className="input-stage"
                    required
                    placeholder="e.g. ENCUENTRO SA OTSO - CLASH OF THE CHAMPIONS"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Promoter / Host Organization *</label>
                  <input
                    className="input-stage"
                    required
                    placeholder="e.g. Eastern Visayas Gamefowl Breeders (EV-GBaCA)"
                    value={promoter}
                    onChange={(e) => setPromoter(e.target.value)}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Coliseum Venue &amp; Facility</label>
                  <input
                    className="input-stage"
                    placeholder="e.g. Leyte Recreational and Amusement Complex (LRAC), Palo, Leyte"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Cluster / District Coverage</label>
                  <input
                    className="input-stage"
                    placeholder="e.g. Eastern Visayas Region 8 (Samar, Leyte, Biliran)"
                    value={clusterDistrict}
                    onChange={(e) => setClusterDistrict(e.target.value)}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Official Derby Event Date *</label>
                  <input
                    type="date"
                    className="input-stage"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Derived Official Format Descriptor</label>
                  <input
                    className="input-stage"
                    readOnly
                    value={derivedFormatLabel}
                    style={{ background: 'var(--bg-card-subtle)', fontWeight: '700' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STAGE 2: KASAHAN & SCALE RULES
              =================================================================== */}
          {currentStage === 2 && (
            <div className="journey-slide">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 2: Physical Scale Calibration, Kasahan Tolerance &amp; Matchmaking System
                </div>
                <div className="slide-intro-desc">
                  Learned from EV-GBaCA / LRAC standards: weight window 1,700g–2,250g, 35g give &amp; take tolerance, and the authentic Habol pairing system.
                </div>
              </div>

              {/* Live Scale Envelope Display */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Scale size={14} className="card-title-icon-gold" />
                    <span>Physical Scale Acceptance Window &amp; Kasahan Envelope</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Allowable Match Variance: &plusmn;{weightToleranceGrams}g
                  </span>
                </div>
                <div style={{ padding: '8px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ textAlign: 'center', minWidth: '90px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>MIN WEIGHT</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>{minWeightGrams}g</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({(minWeightGrams / 1000).toFixed(3)} kg)</div>
                  </div>
                  <div style={{ flex: 1, height: '8px', background: 'var(--border-card)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #10b981, #d97706, #10b981)' }} />
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '90px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>MAX WEIGHT</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>{maxWeightGrams}g</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({(maxWeightGrams / 1000).toFixed(3)} kg)</div>
                  </div>
                </div>
              </div>

              <div className="stage-input-grid" style={{ marginTop: '12px' }}>
                <div className="stage-form-group">
                  <label>Minimum Accepted Weight (grams) *</label>
                  <input
                    type="number"
                    className="input-stage"
                    required
                    value={minWeightGrams}
                    onChange={(e) => setMinWeightGrams(Number(e.target.value))}
                  />
                  <span className="field-hint-text">EV-GBaCA / LRAC Standard: 1,700g (1.700 kg)</span>
                </div>

                <div className="stage-form-group">
                  <label>Maximum Accepted Weight (grams) *</label>
                  <input
                    type="number"
                    className="input-stage"
                    required
                    value={maxWeightGrams}
                    onChange={(e) => setMaxWeightGrams(Number(e.target.value))}
                  />
                  <span className="field-hint-text">EV-GBaCA / LRAC Standard: 2,250g (2.250 kg)</span>
                </div>

                <div className="stage-form-group">
                  <label>Kasahan Give &amp; Take Variance (&plusmn;grams) *</label>
                  <input
                    type="number"
                    className="input-stage"
                    required
                    value={weightToleranceGrams}
                    onChange={(e) => setWeightToleranceGrams(Number(e.target.value))}
                  />
                  <span className="field-hint-text">Official rule: 35g give &amp; take for Kasahan matchmaking</span>
                </div>

                <div className="stage-form-group">
                  <label>Automated Matchmaking System</label>
                  <select
                    className="input-stage"
                    value={matchingSystem}
                    onChange={(e) => setMatchingSystem(e.target.value)}
                  >
                    <option value="HABOL_SYSTEM">Habol System (Catch-Up Variable Pairing for Late Entries)</option>
                    <option value="STANDARD">Standard Fair Weight Automated Pairing</option>
                    <option value="FIGHT_ALL">Fight All / Round Robin (Walang Iwanan)</option>
                  </select>
                  <span className="field-hint-text">Habol system allows controlled variance matching for dynamic cards</span>
                </div>

                <div className="stage-form-group">
                  <label>Hennies &amp; Gender Policy</label>
                  <select
                    className="input-stage"
                    value={henniesAllowed}
                    onChange={(e) => setHenniesAllowed(Number(e.target.value))}
                  >
                    <option value={0}>Strictly No Hennies Allowed (Bring Stag Registry)</option>
                    <option value={1}>Hennies Allowed by Special Exemption</option>
                  </select>
                  <span className="field-hint-text">Official poster requirement: Hennies strictly prohibited</span>
                </div>

                <div className="stage-form-group">
                  <label>Banding Eligibility Category</label>
                  <select
                    className="input-stage"
                    value={bandingCategory}
                    onChange={(e) => setBandingCategory(e.target.value)}
                  >
                    <option value="OPEN">Open Banded (Any Verified Local or Federation Band)</option>
                    <option value="NATIONAL_ONLY">National Bands Only (EV-GBaCA, WPC, Bakbakan, Digmaan)</option>
                    <option value="LATE_BORN">National &amp; Late Born Bands Only</option>
                  </select>
                </div>

                <div className="stage-form-group full-row">
                  <label>Entry Submission &amp; Banding Deadlines</label>
                  <input
                    className="input-stage"
                    value={submissionCutoff}
                    onChange={(e) => setSubmissionCutoff(e.target.value)}
                    placeholder="e.g. 1 day before derby until 12:00 NN"
                  />
                  <span className="field-hint-text">Official submission window printed on paperwork</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STAGE 3: POT MONEY MODE, GUARANTEED PURSE & BET LIMITS
              =================================================================== */}
          {currentStage === 3 && (
            <div className="journey-slide">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 3: Pot Money Architecture, Guaranteed Prize &amp; Betting Economics
                </div>
                <div className="slide-intro-desc">
                  Configure between Eastern Visayas No Pot Money (Bayad Agad / Day Money) or Standard Upfront Pot Escrow.
                </div>
              </div>

              <div className="stage-input-grid">
                <div className="stage-form-group">
                  <label>Pot Money Structure Architecture</label>
                  <select
                    className="input-stage"
                    value={potMode}
                    onChange={(e) => setPotMode(e.target.value)}
                  >
                    <option value="NO_POT_BAYAD_AGAD">No Pot Money on Elims (Bayad Agad / Day Money Subsidized)</option>
                    <option value="UPFRONT_POT_ESCROW">Standard Upfront Pot Escrow (Fixed Entry Fee Deposited)</option>
                  </select>
                </div>

                {potMode === 'NO_POT_BAYAD_AGAD' ? (
                  <div className="stage-form-group">
                    <label>Day Money / Bayad Agad Amount (₱)</label>
                    <input
                      type="number"
                      className="input-stage"
                      value={dayMoneyAmount}
                      onChange={(e) => setDayMoneyAmount(Number(e.target.value))}
                      placeholder="50000"
                    />
                    <span className="field-hint-text">Guaranteed Day Money for participating clusters (₱20,000–₱150,000)</span>
                  </div>
                ) : (
                  <div className="stage-form-group">
                    <label>Upfront Pot Fee per Syndicate Entry (₱)</label>
                    <input
                      type="number"
                      className="input-stage"
                      value={potFee}
                      onChange={(e) => setPotFee(Number(e.target.value))}
                      placeholder="55000"
                    />
                    <span className="field-hint-text">Escrow amount collected at cashier desk per entry</span>
                  </div>
                )}

                <div className="stage-form-group">
                  <label>Total Guaranteed Tournament Prize Pool (₱) *</label>
                  <input
                    type="number"
                    className="input-stage"
                    required
                    value={guaranteedPrize}
                    onChange={(e) => setGuaranteedPrize(Number(e.target.value))}
                    placeholder="5000000"
                  />
                  <span className="field-hint-text">e.g. ₱5,000,000 (₱5 Million Guaranteed)</span>
                </div>

                <div className="stage-form-group">
                  <label>Minimum Bet per Sultada (₱) *</label>
                  <input
                    type="number"
                    className="input-stage"
                    required
                    value={minBet}
                    onChange={(e) => setMinBet(Number(e.target.value))}
                    placeholder="3500"
                  />
                  <span className="field-hint-text">Official standards: ₱3,300 / ₱3,500 / ₱4,400 per sultada</span>
                </div>

                <div className="stage-form-group">
                  <label>Max Level Bet / Declared Bet (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={maxLevelBet}
                    onChange={(e) => setMaxLevelBet(Number(e.target.value))}
                    placeholder="0 for Open Declared, or 11000"
                  />
                  <span className="field-hint-text">0 = Open Declared Level Bet (or e.g. ₱11,000 max level bet)</span>
                </div>

                <div className="stage-form-group">
                  <label>Coliseum Plasada Split / Commission</label>
                  <select
                    className="input-stage"
                    value={plasadaSplit}
                    onChange={(e) => setPlasadaSplit(e.target.value)}
                  >
                    <option value="70/30">70% Promoter / 30% Coliseum Operations</option>
                    <option value="80/20">80% Promoter / 20% Coliseum Operations</option>
                    <option value="100/0">100% Retained by Coliseum</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STAGE 4: ADVANCEMENT & DYNAMIC PRIZE DISTRIBUTION
              =================================================================== */}
          {currentStage === 4 && (
            <div className="journey-slide">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 4: Multi-Stage Advancement, Score Reset Protocol &amp; Prize Breakdown
                </div>
                <div className="slide-intro-desc">
                  Learned from EV-GBaCA posters: score reset to 0 in Semi-Finals, 2.0/2.5/3.0 advance cutoffs, and official awards for Best Handler, Gaffer &amp; Stag Fighter.
                </div>
              </div>

              {/* Dynamic Purse Balance Meter */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <BadgeDollarSign size={14} className="card-title-icon-gold" />
                    <span>Dynamic Prize Pool Allocation Meter</span>
                  </div>
                  <span className={`balance-check-pill ${prizeAllocationDifference === 0 ? 'is-balanced' : 'is-warning'}`}>
                    {prizeAllocationDifference === 0 ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>100% Coherent: ₱{totalAllocatedPrizes.toLocaleString()}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={12} />
                        <span>
                          {prizeAllocationDifference > 0
                            ? `Unallocated: ₱${prizeAllocationDifference.toLocaleString()}`
                            : `Over-allocated: ₱${Math.abs(prizeAllocationDifference).toLocaleString()}`}
                        </span>
                      </>
                    )}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
                  <div style={{ background: 'var(--bg-card-subtle)', padding: '6px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>GUARANTEED PURSE</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#d97706' }}>₱{Number(guaranteedPrize).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card-subtle)', padding: '6px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>CHAMPION + RUNNER UP</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#10b981' }}>₱{(Number(championPrize) + Number(runnerupPrize)).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card-subtle)', padding: '6px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>POINT BRACKETS (7/6/5/3)</div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>₱{(Number(bracketAny7Prize) + Number(bracketAny6Prize) + Number(bracketAny5Prize) + Number(bracketAny3Prize)).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'var(--bg-card-subtle)', padding: '6px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>SPECIAL AWARDS</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#3b82f6' }}>₱{(Number(handlerAward) + Number(gafferAward) + Number(stagFighterAward)).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="stage-input-grid" style={{ marginTop: '12px' }}>
                <div className="stage-form-group">
                  <label>Semi-Finals Score Reset Protocol</label>
                  <select
                    className="input-stage"
                    value={semisScoreReset}
                    onChange={(e) => setSemisScoreReset(Number(e.target.value))}
                  >
                    <option value={1}>Scores Reset Back to Zero on Semi-Finals (EV-GBaCA Standard Rule)</option>
                    <option value={0}>Cumulative Points Carryover Across All Stages</option>
                  </select>
                  <span className="field-hint-text">EV-GBaCA Poster: "On the Semi-Final, all scores will be back to zero"</span>
                </div>

                <div className="stage-form-group">
                  <label>Elimination Advancing Cutoff (Points)</label>
                  <select
                    className="input-stage"
                    value={elimsAdvancePts}
                    onChange={(e) => setElimsAdvancePts(e.target.value)}
                  >
                    <option value="2.0">Score 2.0, 2.5, 3.0 pts advance (2 wins or more)</option>
                    <option value="2.5">Score 2.5, 3.0 pts advance (2 wins + 1 draw)</option>
                    <option value="3.0">Clean Sweep (3.0 pts clean record only)</option>
                  </select>
                  <span className="field-hint-text">Official qualifying rule from Encuentro sa Otso</span>
                </div>

                <div className="stage-form-group">
                  <label>Champion Purse (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={championPrize}
                    onChange={(e) => setChampionPrize(Number(e.target.value))}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Runner-Up Purse (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={runnerupPrize}
                    onChange={(e) => setRunnerupPrize(Number(e.target.value))}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Any 7 Points Bracket (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={bracketAny7Prize}
                    onChange={(e) => setBracketAny7Prize(Number(e.target.value))}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Any 6 Points Bracket (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={bracketAny6Prize}
                    onChange={(e) => setBracketAny6Prize(Number(e.target.value))}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Any 5 Points Bracket (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={bracketAny5Prize}
                    onChange={(e) => setBracketAny5Prize(Number(e.target.value))}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Any 3 Points / Consolation (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={bracketAny3Prize}
                    onChange={(e) => setBracketAny3Prize(Number(e.target.value))}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Stag Fighter of the Year / Fastest Kill (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={stagFighterAward}
                    onChange={(e) => setStagFighterAward(Number(e.target.value))}
                  />
                  <span className="field-hint-text">Learned from EV-GBaCA: ₱1M award + Artalyer Trophy</span>
                </div>

                <div className="stage-form-group">
                  <label>Best Handler Special Award (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={handlerAward}
                    onChange={(e) => setHandlerAward(Number(e.target.value))}
                  />
                </div>

                <div className="stage-form-group">
                  <label>Best Gaffer (Mananari) Award (₱)</label>
                  <input
                    type="number"
                    className="input-stage"
                    value={gafferAward}
                    onChange={(e) => setGafferAward(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              STAGE 5: OFFICIAL MANIFESTO & PHYSICAL SQLITE LAUNCH
              =================================================================== */}
          {currentStage === 5 && (
            <div className="journey-slide slide-verification">
              <div className="slide-intro-banner">
                <div className="slide-intro-title">
                  Stage 5: Official Coliseo Derby Manifesto &amp; Physical SQLite Launch
                </div>
                <div className="slide-intro-desc">
                  Review the dynamically synthesized tournament rules below. Committing will write the official derby record into the physical SQLite database.
                </div>
              </div>

              {/* Tournament Manifesto Card */}
              <div className="journey-passport-card">
                <div className="passport-header">
                  <div className="passport-crest-avatar">
                    <Trophy size={36} className="card-title-icon-gold" />
                  </div>
                  <div className="passport-title-group">
                    <div className="passport-operator-name">{title}</div>
                    <div className="passport-username-tag">
                      Format: <strong>{derivedFormatLabel}</strong> • {clusterDistrict}
                    </div>
                    <div className="passport-role-tag">{promoter}</div>
                  </div>
                  <div className="passport-status-stamp">
                    <CheckCircle2 size={16} />
                    <span>PD 449 / GAB SANCTIONED</span>
                  </div>
                </div>

                <div className="passport-details-grid">
                  <div className="passport-field">
                    <span className="passport-label">Guaranteed Prize Pool</span>
                    <span className="passport-value is-gold">
                      ₱{Number(guaranteedPrize || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Weight Bracket</span>
                    <span className="passport-value is-emerald is-mono">
                      {minWeightGrams}g – {maxWeightGrams}g (&plusmn;{weightToleranceGrams}g)
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Matchmaking System</span>
                    <span className="passport-value">
                      {matchingSystem === 'HABOL_SYSTEM'
                        ? 'Habol System (Dynamic Catch-Up Variance)'
                        : matchingSystem === 'FIGHT_ALL'
                        ? 'Fight All / Round Robin'
                        : 'Standard Fair Match'}
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Pot Money Mode</span>
                    <span className="passport-value">
                      {potMode === 'NO_POT_BAYAD_AGAD'
                        ? `No Pot Money (₱${Number(dayMoneyAmount).toLocaleString()} Day Money)`
                        : `Standard Pot ₱${Number(potFee).toLocaleString()}`}
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Minimum Bet</span>
                    <span className="passport-value is-mono">
                      ₱{Number(minBet || 0).toLocaleString()} per Sultada
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Semi-Finals Score Rule</span>
                    <span className="passport-value is-emerald">
                      {semisScoreReset ? 'Scores Reset to 0 (EV-GBaCA Standard)' : 'Cumulative Carryover'}
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Banding &amp; Hennies</span>
                    <span className="passport-value">
                      {bandingCategory} • {henniesAllowed ? 'Hennies Permitted' : 'Strictly No Hennies'}
                    </span>
                  </div>

                  <div className="passport-field">
                    <span className="passport-label">Special Awards</span>
                    <span className="passport-value is-gold">
                      Stag Fighter ₱{Number(stagFighterAward).toLocaleString()} • Handler ₱{Number(handlerAward).toLocaleString()}
                    </span>
                  </div>

                  <div className="passport-field full-row">
                    <span className="passport-label">Coliseum Venue</span>
                    <span className="passport-value">{venueName}</span>
                  </div>

                  <div className="passport-field full-row">
                    <span className="passport-label">Synthesized Sanction Text</span>
                    <span className="passport-value" style={{ fontSize: '11px', lineHeight: '1.45', color: 'var(--text-secondary)' }}>
                      {synthesizedDerbyRules}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="activateNow"
                  checked={activateNow}
                  onChange={(e) => setActivateNow(e.target.checked)}
                />
                <label htmlFor="activateNow" style={{ fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  Set as Active Live Tournament immediately (Enforces Gate 1 Lock)
                </label>
              </div>

              {saveError && (
                <div className="stage4-error-banner" style={{ marginTop: '10px' }}>
                  <AlertCircle size={16} />
                  <span>{saveError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Unified Navigation Footer Bar - DOCKED BOTTOM ONLY */}
        <div className="journey-nav-footer">
          <div className="journey-footer-left">
            <span className="journey-active-summary">
              Tournament: <strong>{title.slice(0, 32)}...</strong> • Format: <strong>{derivedFormatLabel}</strong>
            </span>
          </div>

          <div className="journey-footer-right">
            <button
              type="button"
              className="btn-cancel-flat"
              disabled={saveStatus === 'saving'}
              onClick={onClose}
            >
              Cancel
            </button>

            {currentStage > 1 && (
              <button
                type="button"
                className="btn-secondary-gold"
                disabled={saveStatus === 'saving' || saveStatus === 'success'}
                onClick={handlePrev}
              >
                <ChevronLeft size={15} />
                <span>Previous Stage</span>
              </button>
            )}

            {currentStage < 5 ? (
              <button
                type="button"
                className="btn-primary-emerald"
                onClick={handleNext}
              >
                <span>Continue to Stage {currentStage + 1}</span>
                <ChevronRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className={`btn-primary-emerald is-submit-btn ${saveStatus === 'success' ? 'is-success-btn' : ''}`}
                disabled={saveStatus === 'saving' || saveStatus === 'success'}
                onClick={handleSubmit}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <RotateCw size={16} className="journey-spinner-rotating" />
                    <span>Writing to Physical SQLite WAL...</span>
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle2 size={16} className="journey-success-check-pulse" />
                    <span>Tournament Activated!</span>
                  </>
                ) : (
                  <>
                    <Trophy size={16} />
                    <span>Finish &amp; Launch Derby Event</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}

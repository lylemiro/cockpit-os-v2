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
  AlertTriangle,
  Lock
} from 'lucide-react';

export function DerbyTournamentCarouselModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  activeTenant,
  initialConfig,
  editingEvent
}) {
  const [currentStage, setCurrentStage] = useState(1);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [saveError, setSaveError] = useState('');
  const [securityPin, setSecurityPin] = useState('');

  // 1. DYNAMIC IDENTITY & STAGE STRUCTURE
  const [tournamentCategory, setTournamentCategory] = useState('Stag Derby'); // Free-text e.g. 'Regular Derby', 'Ulutan', 'Panta', 'Stag Derby'
  const [customFormatOverride, setCustomFormatOverride] = useState('');
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
  const [semisDate, setSemisDate] = useState(
    new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10)
  );
  const [finalsDate, setFinalsDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );

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
  const autoFormatLabel = useMemo(() => {
    const rawCat = tournamentCategory.trim() || 'Derby';
    const cleanBase = rawCat.replace(/\s*derby$/i, '').trim() || 'Open';
    if (!isMultiStage) {
      if (/ulutan|hackfight|pintakasi/i.test(rawCat)) {
        return Number(totalRounds) <= 1 ? `${rawCat} (Open Weight Matching)` : `${totalRounds}-Hits ${rawCat}`;
      }
      if (/panta/i.test(rawCat)) {
        return `${totalRounds}-Cock ${rawCat} (Fight-All Format)`;
      }
      return `${totalRounds}-${cleanBase} Regular Derby (Straight Format)`;
    }
    const stageParts = [elimsRounds, semisRounds, finalsRounds].filter((n) => Number(n) > 0).join('-');
    return `${totalRounds}-${cleanBase} Derby (${stageParts} Format)`;
  }, [totalRounds, tournamentCategory, isMultiStage, elimsRounds, semisRounds, finalsRounds]);

  const derivedFormatLabel = useMemo(() => {
    return customFormatOverride.trim() ? customFormatOverride.trim() : autoFormatLabel;
  }, [customFormatOverride, autoFormatLabel]);

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

  // Reset & load archetype config or editingEvent when opened
  useEffect(() => {
    if (isOpen) {
      setSaveStatus('idle');
      setSaveError('');
      setSecurityPin('');
      setCustomFormatOverride('');
      setCurrentStage(1);
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setCustomFormatOverride(editingEvent.format || '');
        setPromoter(editingEvent.promoter || '');
        setVenueName(editingEvent.venue_name || activeTenant?.arena_name || '');
        setClusterDistrict(editingEvent.cluster_district || '');
        setEventDate(editingEvent.event_date ? String(editingEvent.event_date).slice(0, 10) : new Date().toISOString().slice(0, 10));
        setSemisDate(editingEvent.semis_event_date ? String(editingEvent.semis_event_date).slice(0, 10) : new Date(Date.now() + 6 * 86400000).toISOString().slice(0, 10));
        setFinalsDate(editingEvent.finals_event_date ? String(editingEvent.finals_event_date).slice(0, 10) : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
        setMinWeightGrams(editingEvent.min_weight_grams ?? 1700);
        setMaxWeightGrams(editingEvent.max_weight_grams ?? 2250);
        setWeightToleranceGrams(editingEvent.weight_tolerance_grams ?? 35);
        setMatchingSystem(editingEvent.matching_system || 'HABOL_SYSTEM');
        setPotMode(editingEvent.pot_mode || 'NO_POT_BAYAD_AGAD');
        setDayMoneyAmount(editingEvent.day_money_amount ?? 50000);
        setPotFee(editingEvent.pot_fee ?? 0);
        setGuaranteedPrize(editingEvent.guaranteed_prize ?? 5000000);
        setMinBet(editingEvent.min_bet ?? 3500);
        setMaxLevelBet(editingEvent.max_level_bet ?? 0);
        setPlasadaSplit(editingEvent.plasada_split || '70/30');
        setBandingCategory(editingEvent.banding_category || 'OPEN');
        setHenniesAllowed(editingEvent.hennies_allowed ?? 0);
        setElimsAdvancePts(String(editingEvent.elims_advance_pts ?? '2.0'));
        setSemisScoreReset(editingEvent.semis_score_reset ?? 1);
        setChampionPrize(editingEvent.champion_prize ?? 1500000);
        setRunnerupPrize(editingEvent.runnerup_prize ?? 500000);
        setHandlerAward(editingEvent.handler_award ?? 200000);
        setGafferAward(editingEvent.gaffer_award ?? 100000);
        setStagFighterAward(editingEvent.stag_fighter_award ?? 1000000);
        setActivateNow(editingEvent.status === 'ACTIVE');
      } else if (initialConfig) {
        if (initialConfig.tournamentCategory !== undefined) setTournamentCategory(initialConfig.tournamentCategory);
        if (initialConfig.totalRounds !== undefined) setTotalRounds(initialConfig.totalRounds);
        if (initialConfig.isMultiStage !== undefined) setIsMultiStage(initialConfig.isMultiStage);
        if (initialConfig.elimsRounds !== undefined) setElimsRounds(initialConfig.elimsRounds);
        if (initialConfig.semisRounds !== undefined) setSemisRounds(initialConfig.semisRounds);
        if (initialConfig.finalsRounds !== undefined) setFinalsRounds(initialConfig.finalsRounds);
        if (initialConfig.title !== undefined) setTitle(initialConfig.title);
        if (initialConfig.promoter !== undefined) setPromoter(initialConfig.promoter);
        if (initialConfig.venueName !== undefined) setVenueName(initialConfig.venueName);
        if (initialConfig.clusterDistrict !== undefined) setClusterDistrict(initialConfig.clusterDistrict);
        if (initialConfig.minWeightGrams !== undefined) setMinWeightGrams(initialConfig.minWeightGrams);
        if (initialConfig.maxWeightGrams !== undefined) setMaxWeightGrams(initialConfig.maxWeightGrams);
        if (initialConfig.weightToleranceGrams !== undefined) setWeightToleranceGrams(initialConfig.weightToleranceGrams);
        if (initialConfig.matchingSystem !== undefined) setMatchingSystem(initialConfig.matchingSystem);
        if (initialConfig.potMode !== undefined) setPotMode(initialConfig.potMode);
        if (initialConfig.dayMoneyAmount !== undefined) setDayMoneyAmount(initialConfig.dayMoneyAmount);
        if (initialConfig.potFee !== undefined) setPotFee(initialConfig.potFee);
        if (initialConfig.guaranteedPrize !== undefined) setGuaranteedPrize(initialConfig.guaranteedPrize);
        if (initialConfig.minBet !== undefined) setMinBet(initialConfig.minBet);
        if (initialConfig.maxLevelBet !== undefined) setMaxLevelBet(initialConfig.maxLevelBet);
        if (initialConfig.plasadaSplit !== undefined) setPlasadaSplit(initialConfig.plasadaSplit);
        if (initialConfig.bandingCategory !== undefined) setBandingCategory(initialConfig.bandingCategory);
        if (initialConfig.henniesAllowed !== undefined) setHenniesAllowed(initialConfig.henniesAllowed);
        if (initialConfig.elimsAdvancePts !== undefined) setElimsAdvancePts(initialConfig.elimsAdvancePts);
        if (initialConfig.semisScoreReset !== undefined) setSemisScoreReset(initialConfig.semisScoreReset);
        if (initialConfig.championPrize !== undefined) setChampionPrize(initialConfig.championPrize);
        if (initialConfig.runnerupPrize !== undefined) setRunnerupPrize(initialConfig.runnerupPrize);
        if (initialConfig.handlerAward !== undefined) setHandlerAward(initialConfig.handlerAward);
        if (initialConfig.gafferAward !== undefined) setGafferAward(initialConfig.gafferAward);
        if (initialConfig.stagFighterAward !== undefined) setStagFighterAward(initialConfig.stagFighterAward);
      }
    }
  }, [isOpen, initialConfig, editingEvent, activeTenant?.arena_name]);

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

    if (!securityPin.trim() || securityPin.trim().length < 4) {
      setSaveStatus('error');
      setSaveError('Operator Security PIN / Password is required to authorize and save tournament changes.');
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
      semis_event_date: isMultiStage ? semisDate : '',
      finals_event_date: isMultiStage ? finalsDate : '',
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
      activate_now: activateNow,
      security_pin: securityPin.trim()
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
      }, 600);
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
              {editingEvent ? 'Edit Sanctioned Derby Tournament' : 'Configure & Launch Derby Tournament'}
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

                {/* Full-width Preset Bar so the 3-column inputs below align on one horizontal baseline */}
                <div className="category-preset-bar">
                  <span className="category-preset-label">Quick Format Presets:</span>
                  <div className="category-quick-pills">
                    {[
                      { label: 'Regular Derby', rounds: 4, multi: false },
                      { label: 'Ulutan', rounds: 2, multi: false },
                      { label: 'Panta', rounds: 3, multi: false, match: 'FIGHT_ALL' },
                      { label: 'Stag Derby', rounds: 11, multi: true },
                      { label: 'Cock Derby', rounds: 5, multi: true },
                      { label: 'Bullstag', rounds: 4, multi: false }
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className={`category-pill-btn ${tournamentCategory.toLowerCase() === preset.label.toLowerCase() ? 'is-active' : ''}`}
                        onClick={() => {
                          setTournamentCategory(preset.label);
                          setCustomFormatOverride('');
                          setIsMultiStage(preset.multi);
                          setTotalRounds(preset.rounds);
                          if (preset.match) {
                            setMatchingSystem(preset.match);
                          }
                          if (preset.multi && preset.rounds === 11) {
                            setElimsRounds(3);
                            setSemisRounds(3);
                            setFinalsRounds(5);
                          } else if (preset.multi && preset.rounds === 5) {
                            setElimsRounds(2);
                            setSemisRounds(0);
                            setFinalsRounds(3);
                          } else {
                            setElimsRounds(preset.rounds);
                            setSemisRounds(0);
                            setFinalsRounds(0);
                          }
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row-3col is-stage-header-row">
                  <div className="stage-form-group">
                    <label>Tournament Category (Type Custom or Pick Preset)</label>
                    <input
                      className="input-stage"
                      type="text"
                      list="coliseo-category-suggestions"
                      placeholder="Type category (e.g. Regular Derby, Ulutan, Panta)..."
                      value={tournamentCategory}
                      onChange={(e) => {
                        setTournamentCategory(e.target.value);
                        setCustomFormatOverride('');
                      }}
                    />
                    <datalist id="coliseo-category-suggestions">
                      <option value="Regular Derby" />
                      <option value="Ulutan" />
                      <option value="Panta" />
                      <option value="Stag Derby" />
                      <option value="Cock Derby" />
                      <option value="Bullstag Derby" />
                      <option value="Hackfight / Timbangan" />
                      <option value="Pintakasi Special" />
                      <option value="Barkadahan Derby" />
                    </datalist>
                  </div>

                  <div className="stage-form-group">
                    <label>Total Stags / Cocks / Hits per Entry</label>
                    <input
                      type="number"
                      min="1"
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
                        } else if (val === 4 && isMultiStage) {
                          setElimsRounds(2);
                          setSemisRounds(0);
                          setFinalsRounds(2);
                        } else if (val <= 3 && !isMultiStage) {
                          setElimsRounds(val);
                          setSemisRounds(0);
                          setFinalsRounds(0);
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
                      <option value="SINGLE">Single-Stage / Regular (Ulutan / Panta / Straight)</option>
                    </select>
                  </div>
                </div>

                {isMultiStage && (
                  <div className="derby-stages-flow-strip">
                    <div className="derby-flow-step-box">
                      <div className="step-tag">STAGE 1: ELIMINATIONS</div>
                      <div className="step-stags">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="input-stage input-stage-number"
                          value={elimsRounds}
                          onChange={(e) => setElimsRounds(Number(e.target.value))}
                        />
                        <span className="step-tag">Stags</span>
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
                          className="input-stage input-stage-number"
                          value={semisRounds}
                          onChange={(e) => setSemisRounds(Number(e.target.value))}
                        />
                        <span className="step-tag">Stags</span>
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
                          className="input-stage input-stage-number"
                          value={finalsRounds}
                          onChange={(e) => setFinalsRounds(Number(e.target.value))}
                        />
                        <span className="step-tag">Stags</span>
                      </div>
                      <div className="step-sub">Purse &amp; Champion</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tournament Identifiers Input Grid inside matching Card Container */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Building2 size={14} className="card-title-icon-gold" />
                    <span>Official Tournament Identity, Venue &amp; Schedule</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Sanctioned Coliseum Registry &amp; Derby Date
                  </span>
                </div>
                <div className="stage-input-grid">
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

                  {isMultiStage ? (
                    <div className="stage-form-group full-row">
                      <label>Multi-Stage Championship Progression Schedule (Dates per Stage)</label>
                      <div className="form-row-3col">
                        <div className="stage-form-group">
                          <label>Stage 1: Eliminations Date *</label>
                          <input
                            type="date"
                            className="input-stage"
                            required
                            value={eventDate}
                            onChange={(e) => setEventDate(e.target.value)}
                          />
                          <span className="field-hint-text">Fight Card: {elimsRounds} Stags / Cocks</span>
                        </div>
                        <div className="stage-form-group">
                          <label>Stage 2: Semi-Finals Date *</label>
                          <input
                            type="date"
                            className="input-stage"
                            required
                            value={semisDate}
                            onChange={(e) => setSemisDate(e.target.value)}
                          />
                          <span className="field-hint-text">Fight Card: {semisRounds} Stags / Cocks</span>
                        </div>
                        <div className="stage-form-group">
                          <label>Stage 3: Finals Date *</label>
                          <input
                            type="date"
                            className="input-stage"
                            required
                            value={finalsDate}
                            onChange={(e) => setFinalsDate(e.target.value)}
                          />
                          <span className="field-hint-text">Fight Card: {finalsRounds} Stags / Cocks</span>
                        </div>
                      </div>
                    </div>
                  ) : (
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
                  )}

                  <div className="stage-form-group">
                    <label>Official Format Descriptor (Auto-derived or Custom)</label>
                    <input
                      className="input-stage"
                      type="text"
                      value={customFormatOverride || autoFormatLabel}
                      onChange={(e) => setCustomFormatOverride(e.target.value)}
                      placeholder={autoFormatLabel}
                    />
                  </div>
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

              {/* Live Scale Envelope Display with 3-Column Inputs */}
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
                <div className="derby-scale-envelope-bar">
                  <div className="derby-scale-end-box">
                    <div className="derby-scale-end-label">MIN WEIGHT</div>
                    <div className="derby-scale-end-val">{minWeightGrams}g</div>
                    <div className="derby-scale-end-sub">({(minWeightGrams / 1000).toFixed(3)} kg)</div>
                  </div>
                  <div className="derby-scale-track">
                    <div className="derby-scale-fill" />
                  </div>
                  <div className="derby-scale-end-box">
                    <div className="derby-scale-end-label">MAX WEIGHT</div>
                    <div className="derby-scale-end-val">{maxWeightGrams}g</div>
                    <div className="derby-scale-end-sub">({(maxWeightGrams / 1000).toFixed(3)} kg)</div>
                  </div>
                </div>

                <div className="form-row-3col">
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
                </div>
              </div>

              {/* Matchmaking Algorithm & Banding Governance Card */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Layers size={14} className="card-title-icon-gold" />
                    <span>Matchmaking Algorithm &amp; Coliseum Banding Governance</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Authentic Habol System &amp; GAB / PD 449 Banding Protocols
                  </span>
                </div>
                <div className="stage-input-grid">
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

              {/* Pot Money & Betting Economics Card */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <BadgeDollarSign size={14} className="card-title-icon-gold" />
                    <span>Pot Architecture, Guaranteed Prize &amp; Betting Limits</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Philippine Cockfighting Law (PD 449) Escrow Standards
                  </span>
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
                <div className="derby-purse-meter-grid">
                  <div className="derby-purse-meter-cell">
                    <div className="derby-purse-meter-title">GUARANTEED PURSE</div>
                    <div className="derby-purse-meter-val is-gold">₱{Number(guaranteedPrize).toLocaleString()}</div>
                  </div>
                  <div className="derby-purse-meter-cell">
                    <div className="derby-purse-meter-title">CHAMPION + RUNNER UP</div>
                    <div className="derby-purse-meter-val is-green">₱{(Number(championPrize) + Number(runnerupPrize)).toLocaleString()}</div>
                  </div>
                  <div className="derby-purse-meter-cell">
                    <div className="derby-purse-meter-title">POINT BRACKETS (7/6/5/3)</div>
                    <div className="derby-purse-meter-val">₱{(Number(bracketAny7Prize) + Number(bracketAny6Prize) + Number(bracketAny5Prize) + Number(bracketAny3Prize)).toLocaleString()}</div>
                  </div>
                  <div className="derby-purse-meter-cell">
                    <div className="derby-purse-meter-title">SPECIAL AWARDS</div>
                    <div className="derby-purse-meter-val is-blue">₱{(Number(handlerAward) + Number(gafferAward) + Number(stagFighterAward)).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Advancement Thresholds & Championship Escrow */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Trophy size={14} className="card-title-icon-gold" />
                    <span>Advancement Protocol &amp; Championship Purse Escrow</span>
                  </div>
                  <span className="checklist-strip-hint">
                    EV-GBaCA / LRAC Cutoff &amp; Escrow Distribution
                  </span>
                </div>
                <div className="stage-input-grid">
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
                </div>
              </div>

              {/* Point Progression Brackets (4 Columns) */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Layers size={14} className="card-title-icon-gold" />
                    <span>Points Progression Brackets Distribution</span>
                  </div>
                  <span className="checklist-strip-hint">
                    EV-GBaCA Sanctioned Bracket Prizes (Any 7, 6, 5, 3 Points)
                  </span>
                </div>
                <div className="form-row-4col">
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
                </div>
              </div>

              {/* Special Cockpit Awards (3 Columns) */}
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <Sparkles size={14} className="card-title-icon-gold" />
                    <span>Cockpit Personnel &amp; Special Gamefowl Awards</span>
                  </div>
                  <span className="checklist-strip-hint">
                    Artalyer Trophy &amp; Official Regulatory Recognition
                  </span>
                </div>
                <div className="form-row-3col">
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
                    <span className="passport-value passport-manifesto-text">
                      {synthesizedDerbyRules}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active / Auto-Live Toggle */}
              <div className="derby-activate-checkbox-row">
                <input
                  type="checkbox"
                  id="activateNow"
                  checked={activateNow}
                  onChange={(e) => setActivateNow(e.target.checked)}
                />
                <label htmlFor="activateNow" className="derby-activate-checkbox-label">
                  Auto-Live on Scheduled Event Date ({eventDate}) — Stays SCHEDULED until the event day arrives
                </label>
              </div>

              {/* Mandatory Operator Security PIN / Password Box */}
              <div className="derby-security-pin-card">
                <div className="derby-security-pin-info">
                  <div className="derby-security-pin-title">
                    <Lock size={14} className="card-title-icon-gold" />
                    <span>Operator Security PIN / Password Required *</span>
                  </div>
                  <div className="derby-security-pin-sub">
                    Enter your 4-digit Coliseum Security PIN (default: 1234) or Operator Password to authorize saving.
                  </div>
                </div>
                <div className="derby-security-pin-input-wrap">
                  <input
                    type="password"
                    className="input-stage"
                    placeholder="Enter Security PIN..."
                    value={securityPin}
                    onChange={(e) => setSecurityPin(e.target.value)}
                    required
                  />
                </div>
              </div>

              {saveError && (
                <div className="stage4-error-banner">
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
                    <span>{editingEvent ? 'Tournament Updated!' : 'Tournament Saved!'}</span>
                  </>
                ) : (
                  <>
                    <Trophy size={16} />
                    <span>{editingEvent ? 'Save Tournament Changes' : 'Save & Schedule Derby Event'}</span>
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

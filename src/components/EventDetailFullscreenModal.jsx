import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Scale,
  BadgeDollarSign,
  ShieldCheck,
  Award,
  Layers,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export function EventDetailFullscreenModal({
  isOpen,
  events = [],
  initialIndex = 0,
  onClose,
  onNavigateToWorkspace
}) {
  const [activeIdx, setActiveIdx] = useState(initialIndex);

  useEffect(() => {
    setActiveIdx(initialIndex || 0);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [isOpen, onClose]);

  if (!isOpen || !events || events.length === 0) return null;

  const ev = events[activeIdx] || events[0];
  const minW = Number(ev.min_weight_grams || 1700);
  const maxW = Number(ev.max_weight_grams || 2250);
  const tolW = Number(ev.weight_tolerance_grams || 35);
  const guaranteed = Number(ev.guaranteed_prize || ev.pot_money || 0);

  const modalContent = (
    <div
      className="carousel-journey-backdrop event-detail-fullscreen-backdrop"
      onClick={onClose}
    >
      <div
        className="carousel-journey-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Tournament Event Fullscreen Details"
      >
        {/* 1. Header Bar */}
        <div className="journey-header-bar">
          <div className="journey-title-cluster">
            <span className="journey-badge-pill">
              <Trophy size={13} className="card-title-icon-gold" />
              <span>COLISEUM DERBY EVENT SPECIFICATION</span>
            </span>
            <h2 className="journey-main-heading">{ev.title}</h2>
          </div>

          {events.length > 1 && (
            <div className="event-modal-tabs">
              {events.map((item, idx) => (
                <button
                  key={item.event_id || idx}
                  type="button"
                  className={`category-pill-btn ${idx === activeIdx ? 'is-active' : ''}`}
                  onClick={() => setActiveIdx(idx)}
                >
                  {item.title?.slice(0, 26) || `Event ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="journey-close-btn"
            onClick={onClose}
            title="Close Event Details (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Scrollable Fullscreen Content */}
        <div className="journey-slide-container">
          <div className="journey-slide">
            {/* Hero Passport Card */}
            <div className="journey-passport-card">
              <div className="passport-header">
                <div className="passport-crest-avatar">
                  <Trophy size={34} className="card-title-icon-gold" />
                </div>
                <div className="passport-title-group">
                  <div className="passport-operator-name">{ev.title}</div>
                  <div className="passport-username-tag">
                    <strong>{ev.format || ev.game_type || 'Standard Derby'}</strong> &bull;{' '}
                    <span>{ev.event_date || 'Scheduled'}</span>
                  </div>
                  <div className="passport-role-tag">
                    {ev.promoter || 'Coliseum Operations & Promoters Council'}
                  </div>
                </div>
                <div className="passport-status-stamp">
                  <CheckCircle2 size={15} />
                  <span>{ev.status || 'SCHEDULED'}</span>
                </div>
              </div>

              <div className="passport-details-grid">
                <div className="passport-field">
                  <span className="passport-label">
                    <Calendar size={12} /> Official Event Date
                  </span>
                  <span className="passport-value">{ev.event_date || 'N/A'}</span>
                </div>
                <div className="passport-field">
                  <span className="passport-label">
                    <MapPin size={12} /> Coliseum Venue
                  </span>
                  <span className="passport-value">
                    {ev.venue_name || 'Coliseum Main Arena'}
                  </span>
                </div>
                <div className="passport-field">
                  <span className="passport-label">
                    <Users size={12} /> Cluster / District
                  </span>
                  <span className="passport-value">
                    {ev.cluster_district || 'Regional Open'}
                  </span>
                </div>
                <div className="passport-field">
                  <span className="passport-label">
                    <Layers size={12} /> Format &amp; Category
                  </span>
                  <span className="passport-value">
                    {ev.format || ev.game_type || 'Standard Derby'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3-Column Specification Cards */}
            <div className="form-row-3col">
              {/* Scale & Kasahan */}
              <div className="derby-regulatory-card">
                <div className="derby-regulatory-header">
                  <Scale size={15} className="card-title-icon-gold" />
                  <span>Scale &amp; Kasahan Rules</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Weight Bracket</span>
                  <span className="derby-reg-val">
                    {minW.toLocaleString()}g &ndash; {maxW.toLocaleString()}g
                  </span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Give &amp; Take</span>
                  <span className="derby-reg-val">&plusmn;{tolW}g</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Matching System</span>
                  <span className="derby-reg-val">{ev.matching_system || 'STANDARD'}</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Banding</span>
                  <span className="derby-reg-val">{ev.banding_category || 'OPEN'}</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Hennies Policy</span>
                  <span className="derby-reg-val">
                    {ev.hennies_allowed ? 'Allowed (Exemption)' : 'Strictly Prohibited'}
                  </span>
                </div>
              </div>

              {/* Pot & Betting Economics */}
              <div className="derby-regulatory-card">
                <div className="derby-regulatory-header">
                  <BadgeDollarSign size={15} className="card-title-icon-emerald" />
                  <span>Pot &amp; Betting Economics</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Guaranteed Purse</span>
                  <span className="derby-reg-val">₱{guaranteed.toLocaleString()}</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Pot Structure</span>
                  <span className="derby-reg-val">
                    {ev.pot_mode === 'NO_POT_BAYAD_AGAD'
                      ? 'No Pot (Bayad Agad)'
                      : 'Upfront Pot Escrow'}
                  </span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">
                    {ev.pot_mode === 'NO_POT_BAYAD_AGAD' ? 'Day Money' : 'Pot Fee'}
                  </span>
                  <span className="derby-reg-val">
                    ₱
                    {Number(
                      ev.pot_mode === 'NO_POT_BAYAD_AGAD'
                        ? ev.day_money_amount || 0
                        : ev.pot_fee || ev.pot_money || 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Minimum Bet</span>
                  <span className="derby-reg-val">
                    ₱{Number(ev.min_bet || 0).toLocaleString()}
                  </span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Plasada Split</span>
                  <span className="derby-reg-val">{ev.plasada_split || '70/30'}</span>
                </div>
              </div>

              {/* Advancement & Awards */}
              <div className="derby-regulatory-card">
                <div className="derby-regulatory-header">
                  <Award size={15} className="card-title-icon-gold" />
                  <span>Purse &amp; Advancement</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Advance Cutoff</span>
                  <span className="derby-reg-val">{ev.elims_advance_pts || '2.0'} pts</span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Semis Score Rule</span>
                  <span className="derby-reg-val">
                    {ev.semis_score_reset ? 'Back to Zero' : 'Cumulative'}
                  </span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Champion Purse</span>
                  <span className="derby-reg-val">
                    ₱{Number(ev.champion_prize || 0).toLocaleString()}
                  </span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Runner-Up Purse</span>
                  <span className="derby-reg-val">
                    ₱{Number(ev.runnerup_prize || 0).toLocaleString()}
                  </span>
                </div>
                <div className="derby-reg-row">
                  <span className="derby-reg-label">Special Awards</span>
                  <span className="derby-reg-val">
                    ₱
                    {(
                      Number(ev.handler_award || 0) +
                      Number(ev.gaffer_award || 0) +
                      Number(ev.stag_fighter_award || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Sanction Manifesto */}
            {ev.derby_rules && (
              <div className="roles-quick-checklist-strip">
                <div className="checklist-strip-header">
                  <div className="checklist-strip-title">
                    <ShieldCheck size={14} className="card-title-icon-emerald" />
                    <span>Official Sanctioned Rules &amp; Manifesto</span>
                  </div>
                </div>
                <div className="passport-manifesto-text">{ev.derby_rules}</div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer Navigation */}
        <div className="journey-nav-footer">
          <div className="journey-footer-left">
            <span className="journey-active-summary">
              Event ID: <strong>{ev.event_id}</strong> &bull; Status:{' '}
              <strong>{ev.status || 'SCHEDULED'}</strong>
            </span>
          </div>

          <div className="journey-footer-actions">
            {onNavigateToWorkspace && (
              <button
                type="button"
                className="btn-secondary-gold"
                onClick={onNavigateToWorkspace}
              >
                <ExternalLink size={14} />
                <span>Open in Events &amp; Schedule</span>
              </button>
            )}
            <button
              type="button"
              className="btn-primary-emerald"
              onClick={onClose}
            >
              <span>Close Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}


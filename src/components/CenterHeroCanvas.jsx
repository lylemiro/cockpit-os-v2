import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useArena } from '../context/ArenaContext.jsx';

export function CenterHeroCanvas() {
  const { arenaState, loading, setActiveModuleId } = useArena();
  const gates = arenaState?.gates || [];
  const passedGates = gates.filter((g) => g.passed).length;
  const activeEvent = arenaState?.activeEvent;

  return (
    <main className="center-hero-stage">
      <div className="hero-brand-placard">
        <div className="hero-vertical-accent" />
        <div className="hero-typography-box">
          <h1 className="hero-headline">
            <span className="hero-word-cockpit">COCKPIT</span>
            <span className="hero-word-os">OS</span>
          </h1>

          <div className="hero-subheadline">ARENA OPERATIONS ENVIRONMENT</div>

          <div className="hero-pillars-row">
            <span>PRECISION</span>
            <span className="hero-pillar-sep">|</span>
            <span>CONTROL</span>
            <span className="hero-pillar-sep">|</span>
            <span>FAIR PLAY</span>
            <span className="hero-version-pill">VERSION 2.4.0</span>
          </div>

          <button
            type="button"
            className="hero-gate-summary-bar"
            onClick={() => setActiveModuleId('command-overview')}
          >
            <ShieldCheck size={15} className="card-title-icon-emerald" />
            {loading ? (
              <span>Evaluating Zero-Trust Gate Matrix...</span>
            ) : activeEvent ? (
              <span>
                Live Derby: <strong>{activeEvent.title}</strong> • {passedGates}/9 Gates Verified
              </span>
            ) : (
              <span>
                Zero-Trust Ready: <strong>{passedGates}/9 Gates Cleared</strong> • Click to Configure Arena
              </span>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}


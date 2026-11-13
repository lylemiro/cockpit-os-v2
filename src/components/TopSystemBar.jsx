import React, { useState, useEffect } from 'react';
import { Minus, Square, Lock, RotateCcw } from 'lucide-react';
import { useArena } from '../context/ArenaContext.jsx';
import { AppIconGlyph } from './AppIconGlyph.jsx';

export function TopSystemBar() {
  const {
    arenaState,
    loading,
    wsConnected,
    setActiveModuleId,
    authenticatedOperator,
    lockSession,
    rebootSystem
  } = useArena();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const metrics = arenaState?.systemMetrics;
  const activeTenant = arenaState?.activeTenant;

  const formattedDate = now
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    .toUpperCase();

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <header className="top-system-bar">
      <div className="top-brand-cluster">
        <div className="brand-crest-diamond">
          <img
            src="/assets/brand-favicon.png"
            alt="Cockpit OS Emblem"
            className="brand-crest-img"
          />
        </div>
        <div className="brand-title-stack">
          <span className="brand-main-name">COCKPIT OS</span>
          <span className="brand-sub-name">
            {activeTenant
              ? `${activeTenant.arena_name} • [${activeTenant.db_file_name}]`
              : 'ARENA OPERATIONS ENVIRONMENT'}
          </span>
        </div>
      </div>

      <div className="top-telemetry-strip">
        {authenticatedOperator && (
          <>
            <button
              type="button"
              className="command-pill-btn"
              title="Open Multi-Tenant & ARBAC Manager"
              onClick={() => setActiveModuleId('users-permissions')}
            >
              {authenticatedOperator.staff_code || 'EMP-01'}: {authenticatedOperator.full_name || 'Operator'} (
              {authenticatedOperator.permissions_count ?? (Array.isArray(authenticatedOperator.permissions) ? authenticatedOperator.permissions.length : 23)}/23)
            </button>
            <span className="top-divider">|</span>
          </>
        )}

        <span className="top-mono-item">
          {loading ? 'DETECTING HOST...' : metrics?.terminalId || 'TERM-UNBOUND'}
        </span>
        <span className="top-divider">|</span>
        <span className="top-mono-item">
          {loading ? '---.---.---.---' : metrics?.lanIp || '127.0.0.1'}
        </span>
        <span className="top-divider">|</span>

        <span className={`gateway-pill ${wsConnected ? '' : 'is-offline'}`}>
          <span className="gateway-dot" />
          {loading
            ? 'GATEWAY: SYNCING'
            : wsConnected
              ? 'GATEWAY: ONLINE'
              : 'GATEWAY: RECONNECTING'}
        </span>

        <span className="top-divider">|</span>
        <span>
          {formattedDate} &nbsp;{formattedTime}
        </span>

        <div className="window-controls">
          <button
            type="button"
            className="window-ctrl-btn"
            title="Minimize Active Workspace"
            onClick={() => setActiveModuleId(null)}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="window-ctrl-btn"
            title="Open Command Overview"
            onClick={() => setActiveModuleId('command-overview')}
          >
            <Square size={12} />
          </button>
          <button
            type="button"
            className="window-ctrl-btn"
            title="Lock Operator Session (Return to Gate 0 Login)"
            onClick={lockSession}
          >
            <Lock size={13} />
          </button>
          <button
            type="button"
            className="window-ctrl-btn"
            title="Reboot Cockpit OS Kernel"
            onClick={rebootSystem}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}

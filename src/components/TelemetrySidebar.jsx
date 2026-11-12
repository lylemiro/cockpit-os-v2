import React from 'react';
import {
  Layers,
  Activity,
  Monitor,
  ClipboardList,
  Coins,
  Home,
  ReceiptText,
  Server,
  Database,
  MonitorSmartphone,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  MoreHorizontal
} from 'lucide-react';
import { useArena } from '../context/ArenaContext.jsx';

function formatPeso(value) {
  const num = Number(value || 0);
  return `₱${num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatRelativeTime(isoString) {
  if (!isoString) return 'Now';
  const created = new Date(isoString.endsWith('Z') ? isoString : `${isoString}Z`);
  if (Number.isNaN(created.getTime())) return 'Now';
  const diffSec = Math.max(0, Math.floor((Date.now() - created.getTime()) / 1000));
  if (diffSec < 45) return 'Now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  return `${Math.floor(diffSec / 3600)}h ago`;
}

export function TelemetrySidebar() {
  const { arenaState, loading, error, setActiveModuleId } = useArena();

  const ops = arenaState?.operationsSummary;
  const sys = arenaState?.systemMetrics;
  const devices = arenaState?.devices || [];
  const logs = arenaState?.auditLogs || [];

  const onlineDevicesCount = devices.filter(
    (d) => d.is_authorized === 1 && d.status === 'Online'
  ).length;

  return (
    <aside className="telemetry-sidebar">
      {/* CARD 1: ARENA OPERATIONS */}
      <section className="telemetry-card">
        <div className="telemetry-card-header">
          <div className="telemetry-card-title-group">
            <Layers size={15} className="card-title-icon-gold" />
            <span>ARENA OPERATIONS</span>
          </div>
          <div className="telemetry-header-actions">
            <button
              type="button"
              className="command-pill-btn"
              onClick={() => setActiveModuleId('command-overview')}
            >
              COMMAND &gt;
            </button>
            <button
              type="button"
              className="window-ctrl-btn"
              title="Open Finance & Plasada Ledger"
              onClick={() => setActiveModuleId('finance-bir')}
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="skeleton-stack">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : (
          <>
            <div className="metric-row">
              <span className="metric-label">
                <Coins size={13} className="card-title-icon-emerald" />
                Gross Handle
              </span>
              <span className="metric-value">{formatPeso(ops?.grossHandle)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <Home size={13} className="card-title-icon-emerald" />
                House Plasada ({ops?.plasadaRatePct ?? 10}%)
              </span>
              <span className="metric-value">{formatPeso(ops?.housePlasada)}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <ReceiptText size={13} className="card-title-icon-emerald" />
                Released Payouts
              </span>
              <span className="metric-value is-gold">{formatPeso(ops?.releasedPayouts)}</span>
            </div>

            <div className="pool-split-bar">
              <span className="pool-side-meron">MERON {ops?.meronSharePct ?? 0}%</span>
              <span className="pool-center-label">
                {ops?.currentFightNumber
                  ? `FIGHT #${ops.currentFightNumber} POOL`
                  : 'NO ACTIVE BOUT'}
              </span>
              <span className="pool-side-wala">{ops?.walaSharePct ?? 0}% WALA</span>
            </div>
          </>
        )}
      </section>

      {/* CARD 2: SYSTEM STATUS */}
      <section className="telemetry-card">
        <div className="telemetry-card-header">
          <div className="telemetry-card-title-group">
            <Activity size={15} className="card-title-icon-gold" />
            <span>SYSTEM STATUS</span>
          </div>
          <button
            type="button"
            className="window-ctrl-btn"
            title="Open Network Gateway Diagnostics"
            onClick={() => setActiveModuleId('network-gateway')}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {loading ? (
          <div className="skeleton-stack">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : (
          <>
            <div className="operational-banner">
              <span className="operational-orb" />
              <div>
                <div className="operational-headline">
                  {error ? 'DEGRADED' : 'OPERATIONAL'}
                </div>
                <div className="operational-subtext">
                  {error || 'All systems running normally'}
                </div>
              </div>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <Server size={13} />
                Local Server
              </span>
              <span className="metric-value is-emerald">{sys?.serverStatus || 'Online'}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <Database size={13} />
                Database
              </span>
              <span className="metric-value is-emerald">{sys?.databaseStatus || 'Connected'}</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <MonitorSmartphone size={13} />
                Terminals
              </span>
              <span className="metric-value">
                {sys?.activeTerminalsCount ?? 0} / {sys?.totalTerminalsCount ?? 0} Active
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <HardDrive size={13} />
                Storage
              </span>
              <span className="metric-value">
                {sys?.storageUsedGb != null
                  ? `${sys.storageUsedGb} / ${sys.storageTotalGb} GB`
                  : 'Local NVMe Active'}
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <Cpu size={13} />
                CPU
              </span>
              <span className="metric-value">{sys?.cpuLoadPct ?? 0}%</span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <MemoryStick size={13} />
                Memory
              </span>
              <span className="metric-value">
                {sys?.memoryUsedGb ?? 0} / {sys?.memoryTotalGb ?? 0} GB
              </span>
            </div>

            <div className="metric-row">
              <span className="metric-label">
                <Wifi size={13} />
                Network (LAN)
              </span>
              <span className="metric-value is-emerald">{sys?.lanIp || '127.0.0.1'}</span>
            </div>
          </>
        )}
      </section>

      {/* CARD 3: ACTIVE TERMINALS */}
      <section className="telemetry-card">
        <div className="telemetry-card-header">
          <div className="telemetry-card-title-group">
            <Monitor size={15} className="card-title-icon-gold" />
            <span>ACTIVE TERMINALS</span>
          </div>
          <span
            className={`online-count-pill ${onlineDevicesCount === 0 ? 'is-empty' : ''}`}
          >
            {onlineDevicesCount} ONLINE
          </span>
        </div>

        {loading ? (
          <div className="skeleton-stack">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : devices.length === 0 ? (
          <div className="card-empty-state">
            <span className="card-empty-text">
              No hardware terminals whitelisted in Gate 0 yet.
            </span>
            <button
              type="button"
              className="card-empty-cta"
              onClick={() => setActiveModuleId('devices-terminals')}
            >
              + Whitelist Terminal
            </button>
          </div>
        ) : (
          <div className="terminal-list">
            {devices.slice(0, 6).map((dev) => (
              <div key={dev.device_id} className="terminal-item-row">
                <span className="status-dot-online" />
                <span className="terminal-code">{dev.code}</span>
                <span className="terminal-name">{dev.label}</span>
                <span className="terminal-status-tag">{dev.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CARD 4: RECENT ACTIVITY */}
      <section className="telemetry-card">
        <div className="telemetry-card-header">
          <div className="telemetry-card-title-group">
            <ClipboardList size={15} className="card-title-icon-gold" />
            <span>RECENT ACTIVITY</span>
          </div>
          <button
            type="button"
            className="view-all-link"
            onClick={() => setActiveModuleId('security-audit')}
          >
            VIEW ALL &gt;
          </button>
        </div>

        {loading ? (
          <div className="skeleton-stack">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : logs.length === 0 ? (
          <div className="card-empty-state">
            <span className="card-empty-text">
              Audit logtrail is empty. Operational actions will appear here live.
            </span>
            <button
              type="button"
              className="card-empty-cta"
              onClick={() => setActiveModuleId('arena-setup')}
            >
              Configure Arena Setup
            </button>
          </div>
        ) : (
          <div className="activity-list">
            {logs.slice(0, 5).map((log) => (
              <div key={log.log_id} className="activity-item-row">
                <span className="activity-ring-icon" />
                <span className="activity-code" title={log.details}>
                  {log.event_code}
                </span>
                <span className="activity-time-tag">
                  {formatRelativeTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}


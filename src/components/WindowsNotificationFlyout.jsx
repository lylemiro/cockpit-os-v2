import React, { useRef, useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ShieldCheck,
  HardDrive,
  Monitor,
  Terminal,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useArena } from '../context/ArenaContext.jsx';

export function WindowsNotificationFlyout({ isOpen, onClose }) {
  const {
    toasts,
    dismissToast,
    arenaState,
    setActiveModuleId,
    soundEnabled,
    toggleSound,
    theme,
    toggleTheme,
    notifyInfo
  } = useArena();

  const flyoutRef = useRef(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'alerts' | 'audit'

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        if (!e.target.closest('.tray-bell-btn')) {
          onClose();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Extract database audit logs safely
  const auditLogs = Array.isArray(arenaState?.auditLogs) ? arenaState.auditLogs : [];
  const activeTenant = arenaState?.activeTenant;
  const systemMetrics = arenaState?.systemMetrics;
  const devices = Array.isArray(arenaState?.devices) ? arenaState.devices : [];

  const getLogIcon = (eventCode, severity) => {
    const code = String(eventCode || '').toUpperCase();
    const sev = String(severity || '').toUpperCase();

    if (sev === 'SUCCESS' || code.includes('SUCCESS') || code.includes('CLEARED') || code.includes('PASSED')) {
      return <CheckCircle2 size={16} className="card-title-icon-emerald" />;
    }
    if (sev === 'DANGER' || sev === 'ERROR' || code.includes('FAIL') || code.includes('DENIED') || code.includes('LOCKOUT')) {
      return <AlertCircle size={16} className="card-title-icon-gold text-red-500" />;
    }
    if (sev === 'WARN' || code.includes('WARN') || code.includes('CHANGED') || code.includes('REPLAY')) {
      return <AlertTriangle size={16} className="card-title-icon-gold" />;
    }
    return <Info size={16} className="card-title-icon-emerald" />;
  };

  const clearAllToasts = () => {
    toasts.forEach((t) => dismissToast(t.id));
  };

  // Synthesize operational status alerts
  const systemAlerts = [];
  if (activeTenant) {
    systemAlerts.push({
      id: 'sys-tenant-mount',
      type: 'success',
      title: 'Active Database Drive Mounted',
      message: `Partition ${activeTenant.tenant_code}: ${activeTenant.arena_name} (${activeTenant.db_file_name}) running under SQLite WAL mode.`,
      time: 'Physical DB Online',
      moduleId: 'users-permissions'
    });
  }

  const onlineTerminals = devices.filter((d) => d.status === 'Online');
  if (onlineTerminals.length > 0) {
    systemAlerts.push({
      id: 'sys-devices-online',
      type: 'info',
      title: 'Gate 0 Zero-Trust Hardware Whitelist',
      message: `${onlineTerminals.length} of ${devices.length} coliseum terminal(s) verified and authorized with cryptographic device codes.`,
      time: 'Hardware Active',
      moduleId: 'devices-terminals'
    });
  }

  const totalNotifsCount = toasts.length + systemAlerts.length + auditLogs.length;

  return (
    <div
      ref={flyoutRef}
      className="win-notification-flyout"
      role="dialog"
      aria-label="Windows Action Center & Notifications"
    >
      {/* 1. Flyout Header */}
      <div className="notif-header">
        <div className="notif-header-title">
          <Bell size={16} className="card-title-icon-gold" />
          <span>Coliseum Action Center</span>
          {totalNotifsCount > 0 && (
            <span className="notif-count-badge">{totalNotifsCount}</span>
          )}
        </div>

        <div className="notif-header-actions">
          {toasts.length > 0 && (
            <button
              type="button"
              className="notif-clear-btn"
              onClick={clearAllToasts}
              title="Clear active toasts"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Notification Category Tabs */}
      <div className="notif-category-bar">
        <button
          type="button"
          className={`notif-filter-pill ${filter === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({totalNotifsCount})
        </button>
        <button
          type="button"
          className={`notif-filter-pill ${filter === 'alerts' ? 'is-active' : ''}`}
          onClick={() => setFilter('alerts')}
        >
          Alerts ({toasts.length + systemAlerts.length})
        </button>
        <button
          type="button"
          className={`notif-filter-pill ${filter === 'audit' ? 'is-active' : ''}`}
          onClick={() => setFilter('audit')}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* 3. Scrollable Notifications Feed */}
      <div className="notif-list-container">
        {/* A. Live Real-time Toasts */}
        {(filter === 'all' || filter === 'alerts') &&
          toasts.map((toast) => (
            <div
              key={toast.id}
              className={`notif-card is-${toast.type || 'info'}`}
            >
              <div className="notif-card-icon">
                {toast.type === 'success' && <CheckCircle2 size={16} className="card-title-icon-emerald" />}
                {toast.type === 'warning' && <AlertTriangle size={16} className="card-title-icon-gold" />}
                {toast.type === 'error' && <AlertCircle size={16} className="text-red-500" />}
                {(!toast.type || toast.type === 'info') && <Info size={16} className="card-title-icon-emerald" />}
              </div>
              <div className="notif-card-content">
                <div className="notif-card-title">{toast.title || 'System Notification'}</div>
                <div className="notif-card-message">{toast.message}</div>
                <span className="notif-card-time">Live Alert</span>
              </div>
              <button
                type="button"
                className="notif-dismiss-btn"
                onClick={() => dismissToast(toast.id)}
                title="Dismiss"
              >
                ×
              </button>
            </div>
          ))}

        {/* B. Operational System Health Alerts */}
        {(filter === 'all' || filter === 'alerts') &&
          systemAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`notif-card is-${alert.type}`}
              onClick={() => {
                onClose();
                if (alert.moduleId) setActiveModuleId(alert.moduleId);
              }}
            >
              <div className="notif-card-icon">
                {alert.type === 'success' ? (
                  <HardDrive size={16} className="card-title-icon-emerald" />
                ) : (
                  <Monitor size={16} className="card-title-icon-emerald" />
                )}
              </div>
              <div className="notif-card-content">
                <div className="notif-card-title">{alert.title}</div>
                <div className="notif-card-message">{alert.message}</div>
                <span className="notif-card-time">{alert.time}</span>
              </div>
            </div>
          ))}

        {/* C. Physical SQLite Audit Logtrail Feed */}
        {(filter === 'all' || filter === 'audit') &&
          auditLogs.slice(0, 15).map((log, idx) => {
            const rawEvent = log.event_code || log.action || 'COLISEUM_EVENT';
            const displayTitle = String(rawEvent).replace(/_/g, ' ');
            const actor = log.actor || log.operator_name || 'System Operator';
            const details = log.details || `Triggered by ${actor}`;
            const timeString = log.created_at || log.timestamp;
            const formattedTime = timeString
              ? new Date(timeString).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Recent';

            return (
              <div
                key={log.log_id || idx}
                className="notif-card is-audit"
                onClick={() => {
                  onClose();
                  setActiveModuleId('security-audit');
                }}
                title="Click to view tamper-evident security audit trail"
              >
                <div className="notif-card-icon">
                  {getLogIcon(rawEvent, log.severity)}
                </div>
                <div className="notif-card-content">
                  <div className="notif-card-title-row">
                    <span className="notif-card-title">{displayTitle}</span>
                    {log.terminal_id && (
                      <span className="notif-terminal-tag">{log.terminal_id}</span>
                    )}
                  </div>
                  <div className="notif-card-message">{details}</div>
                  <div className="notif-card-meta-line">
                    <span className="notif-actor-name">{actor}</span>
                    <span className="notif-card-dot">•</span>
                    <span className="notif-card-time">{formattedTime}</span>
                  </div>
                </div>
              </div>
            );
          })}

        {/* Empty State */}
        {totalNotifsCount === 0 && (
          <div className="notif-empty-state">
            <ShieldCheck size={36} className="card-title-icon-emerald" />
            <div className="notif-empty-title">All Systems Normal</div>
            <div className="notif-empty-desc">
              Zero pending alerts. All coliseum operations are operating within verified Zero-Trust parameters.
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Center Quick Settings Bar */}
      <div className="notif-quick-actions">
        <button
          type="button"
          className="notif-quick-btn"
          onClick={toggleSound}
          title={soundEnabled ? 'Acoustic Cues Active' : 'Acoustic Cues Muted'}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
        </button>

        <button
          type="button"
          className="notif-quick-btn"
          onClick={toggleTheme}
          title="Toggle Dark / Light Theme"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          <span>{theme === 'light' ? 'Night' : 'Day'}</span>
        </button>

        <button
          type="button"
          className="notif-quick-btn"
          onClick={() => {
            notifyInfo('Security Heartbeat', 'Cryptographic zero-trust audit trail verified.');
          }}
          title="Send test operational acoustic notification"
        >
          <Sparkles size={14} />
          <span>Ping</span>
        </button>

        <button
          type="button"
          className="notif-quick-btn"
          onClick={() => {
            onClose();
            setActiveModuleId('security-audit');
          }}
          title="Inspect Tamper-Evident Audit Trail"
        >
          <ShieldCheck size={14} />
          <span>Audit Log</span>
        </button>
      </div>
    </div>
  );
}

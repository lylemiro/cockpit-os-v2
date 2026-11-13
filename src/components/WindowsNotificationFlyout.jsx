import React, { useRef, useEffect } from 'react';
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
  ShieldCheck
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
    toggleTheme
  } = useArena();

  const flyoutRef = useRef(null);

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

  const auditLogs = arenaState?.auditLogs || [];
  const recentLogs = auditLogs.slice(0, 8);

  const getLogIcon = (action) => {
    if (action.includes('SUCCESS') || action.includes('CLEARED') || action.includes('PASSED')) {
      return <CheckCircle2 size={16} className="text-emerald-500" />;
    }
    if (action.includes('FAIL') || action.includes('DENIED') || action.includes('LOCKOUT')) {
      return <AlertCircle size={16} className="text-red-500" />;
    }
    if (action.includes('WARN') || action.includes('CHANGED')) {
      return <AlertTriangle size={16} className="text-amber-500" />;
    }
    return <Info size={16} className="text-blue-500" />;
  };

  const clearAllNotifications = () => {
    toasts.forEach((t) => dismissToast(t.id));
  };

  const totalCount = toasts.length + recentLogs.length;

  return (
    <div
      ref={flyoutRef}
      className="win-notification-flyout"
      role="dialog"
      aria-label="Notification Center"
    >
      {/* Header */}
      <div className="notif-header">
        <div className="notif-header-title">
          <Bell size={16} className="card-title-icon-gold" />
          <span>Notifications &amp; Activity</span>
          {totalCount > 0 && <span className="notif-count-badge">{totalCount}</span>}
        </div>
        {toasts.length > 0 && (
          <button
            type="button"
            className="notif-clear-btn"
            onClick={clearAllNotifications}
            title="Clear all alerts"
          >
            <Trash2 size={13} />
            <span>Clear alerts</span>
          </button>
        )}
      </div>

      {/* Notification Items List */}
      <div className="notif-list-container">
        {/* Active Toast Stack */}
        {toasts.map((toast) => (
          <div key={toast.id} className={`notif-card is-${toast.type || 'info'}`}>
            <div className="notif-card-icon">
              {toast.type === 'success' && <CheckCircle2 size={16} />}
              {toast.type === 'warning' && <AlertTriangle size={16} />}
              {toast.type === 'error' && <AlertCircle size={16} />}
              {(!toast.type || toast.type === 'info') && <Info size={16} />}
            </div>
            <div className="notif-card-content">
              <div className="notif-card-title">{toast.title}</div>
              <div className="notif-card-message">{toast.message}</div>
              <span className="notif-card-time">Active Alert</span>
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

        {/* Recent Tamper-Evident System & Arena Activity */}
        {recentLogs.map((log) => (
          <div
            key={log.log_id || log.timestamp}
            className="notif-card is-audit"
            onClick={() => {
              onClose();
              setActiveModuleId('security-audit');
            }}
          >
            <div className="notif-card-icon">{getLogIcon(log.action)}</div>
            <div className="notif-card-content">
              <div className="notif-card-title">{log.action.replace(/_/g, ' ')}</div>
              <div className="notif-card-message">
                {log.details || `Executed by ${log.operator_name || 'System Operator'}`}
              </div>
              <span className="notif-card-time">
                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
              </span>
            </div>
          </div>
        ))}

        {totalCount === 0 && (
          <div className="notif-empty-state">
            <ShieldCheck size={32} className="card-title-icon-emerald" />
            <div className="notif-empty-title">All Caught Up</div>
            <div className="notif-empty-desc">
              No pending alerts. Coliseum operations are operating under Zero-Trust parameters.
            </div>
          </div>
        )}
      </div>

      {/* Quick Action Tiles Bar */}
      <div className="notif-quick-actions">
        <button
          type="button"
          className="notif-quick-btn"
          onClick={toggleSound}
          title={soundEnabled ? 'Mute Arena Audio' : 'Unmute Arena Audio'}
        >
          {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          <span>{soundEnabled ? 'Sound: On' : 'Sound: Off'}</span>
        </button>

        <button
          type="button"
          className="notif-quick-btn"
          onClick={toggleTheme}
          title="Toggle Night/Day Mode"
        >
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          <span>{theme === 'light' ? 'Night Mode' : 'Day Mode'}</span>
        </button>

        <button
          type="button"
          className="notif-quick-btn"
          onClick={() => {
            onClose();
            setActiveModuleId('security-audit');
          }}
          title="Open Audit Logtrail"
        >
          <ShieldCheck size={15} />
          <span>Audit Log</span>
        </button>
      </div>
    </div>
  );
}

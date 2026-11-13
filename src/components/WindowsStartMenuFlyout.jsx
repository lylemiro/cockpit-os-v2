import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Lock,
  RotateCcw,
  Power,
  LogOut,
  Settings as SettingsIcon,
  Shield,
  HardDrive,
  Trophy,
  Activity,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { useArena } from '../context/ArenaContext.jsx';

export function WindowsStartMenuFlyout({ isOpen, onClose, onOpenSearch }) {
  const {
    arenaState,
    setActiveModuleId,
    authenticatedOperator,
    lockSession,
    rebootSystem,
    theme,
    toggleTheme
  } = useArena();

  const flyoutRef = useRef(null);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close menus when flyout closes
  useEffect(() => {
    if (!isOpen) {
      setIsPowerMenuOpen(false);
      setIsUserMenuOpen(false);
    }
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        // If clicked on the start button itself, BottomTaskbar toggles it, but otherwise close
        if (!e.target.closest('.start-launcher-btn')) {
          onClose();
        }
      } else {
        // If clicked inside flyout but outside power menu, close power menu
        if (isPowerMenuOpen && !e.target.closest('.start-power-actions') && !e.target.closest('.start-power-flyout-menu')) {
          setIsPowerMenuOpen(false);
        }
        if (isUserMenuOpen && !e.target.closest('.start-operator-info') && !e.target.closest('.start-user-flyout-menu')) {
          setIsUserMenuOpen(false);
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isPowerMenuOpen) {
          setIsPowerMenuOpen(false);
        } else if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isPowerMenuOpen, isUserMenuOpen]);

  if (!isOpen) return null;

  const activeTenant = arenaState?.activeTenant;
  const activeEvent = arenaState?.activeEvent;
  const gates = arenaState?.gates || [];
  const passedGates = gates.filter((g) => g.passed).length;

  const handleLaunchApp = (appId) => {
    onClose();
    setActiveModuleId(appId);
  };

  return createPortal(
    <>
      <div
        className="win-start-menu-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div ref={flyoutRef} className="win-start-menu-flyout" role="dialog" aria-label="Cockpit OS Start Menu">
      {/* 1. Quick Search Trigger */}
      <div className="start-search-bar" onClick={() => { onClose(); onOpenSearch(); }}>
        <Search size={16} className="card-title-icon-emerald" />
        <span className="start-search-placeholder">Type to search apps, live bets, staff, roosters...</span>
        <span className="taskbar-search-kbd">Ctrl + K</span>
      </div>

      {/* 2. Pinned Coliseum Apps Grid */}
      <div className="start-section-heading">
        <span>Pinned Coliseum Modules</span>
        <button
          type="button"
          className="start-view-all-btn"
          onClick={() => handleLaunchApp('this-pc')}
        >
          All Applications ({DESKTOP_APPS.length}) <ChevronRight size={12} />
        </button>
      </div>

      <div className="start-pinned-grid">
        {DESKTOP_APPS.map((app) => (
          <button
            key={app.id}
            type="button"
            className="start-app-tile"
            onClick={() => handleLaunchApp(app.id)}
            title={`${app.label} • ${app.subtitle}`}
          >
            <div className="start-app-icon-wrap">
              <AppIconGlyph name={app.icon} size={28} />
            </div>
            <span className="start-app-label">{app.label}</span>
          </button>
        ))}
      </div>

      {/* 3. Recommended / Recent Arena Highlights */}
      <div className="start-section-heading">
        <span>Recent Coliseum Activities</span>
      </div>

      <div className="start-recent-list">
        <button
          type="button"
          className="start-recent-item"
          onClick={() => handleLaunchApp('command-overview')}
        >
          <div className="start-recent-icon is-emerald">
            <Shield size={16} />
          </div>
          <div className="start-recent-text">
            <div className="start-recent-title">Zero-Trust Integrity Matrix</div>
            <div className="start-recent-sub">
              {passedGates}/9 Gates Cleared • Coliseum Health 100%
            </div>
          </div>
        </button>

        <button
          type="button"
          className="start-recent-item"
          onClick={() => handleLaunchApp('users-permissions')}
        >
          <div className="start-recent-icon is-gold">
            <HardDrive size={16} />
          </div>
          <div className="start-recent-text">
            <div className="start-recent-title">
              {activeTenant ? activeTenant.arena_name : 'Primary Tenant Database'}
            </div>
            <div className="start-recent-sub">
              {activeTenant ? activeTenant.db_file_name : 'tenant_sjc_01_mwdb7iq3.db'} • Physical WAL
            </div>
          </div>
        </button>

        {activeEvent && (
          <button
            type="button"
            className="start-recent-item"
            onClick={() => handleLaunchApp('events-schedule')}
          >
            <div className="start-recent-icon is-gold">
              <Trophy size={16} />
            </div>
            <div className="start-recent-text">
              <div className="start-recent-title">{activeEvent.title}</div>
              <div className="start-recent-sub">Active Derby • Entry Fee ₱{activeEvent.entry_fee?.toLocaleString()}</div>
            </div>
          </button>
        )}

        <button
          type="button"
          className="start-recent-item"
          onClick={() => handleLaunchApp('security-audit')}
        >
          <div className="start-recent-icon is-cyan">
            <Activity size={16} />
          </div>
          <div className="start-recent-text">
            <div className="start-recent-title">Tamper-Evident Audit Logtrail</div>
            <div className="start-recent-sub">Microsecond cryptographic surveillance stream</div>
          </div>
        </button>
      </div>

      {/* 4. Bottom Operator Profile & Power Actions */}
      <div className="start-footer-bar">
        {/* User Session Flyout Popup */}
        {isUserMenuOpen && (
          <div className="start-user-flyout-menu" role="menu">
            <button
              type="button"
              className="start-power-menu-item"
              onClick={() => {
                setIsUserMenuOpen(false);
                onClose();
                handleLaunchApp('users-permissions');
              }}
            >
              <Shield size={15} className="card-title-icon-emerald" />
              <div className="start-power-item-text">
                <span className="start-power-item-title">Account Settings</span>
                <span className="start-power-item-desc">ARBAC &amp; Permissions</span>
              </div>
            </button>
            <button
              type="button"
              className="start-power-menu-item"
              onClick={() => {
                setIsUserMenuOpen(false);
                onClose();
                lockSession();
              }}
            >
              <Lock size={15} className="card-title-icon-gold" />
              <div className="start-power-item-text">
                <span className="start-power-item-title">Lock Session</span>
                <span className="start-power-item-desc">Zero-Trust Gate 0 PIN</span>
              </div>
            </button>
            <button
              type="button"
              className="start-power-menu-item is-signout"
              onClick={() => {
                setIsUserMenuOpen(false);
                onClose();
                lockSession();
              }}
            >
              <LogOut size={15} />
              <div className="start-power-item-text">
                <span className="start-power-item-title">Sign Out</span>
                <span className="start-power-item-desc">Switch Operator Account</span>
              </div>
            </button>
          </div>
        )}

        {/* Power / Restart Flyout Popup */}
        {isPowerMenuOpen && (
          <div className="start-power-flyout-menu" role="menu">
            <button
              type="button"
              className="start-power-menu-item"
              onClick={() => {
                setIsPowerMenuOpen(false);
                onClose();
                lockSession();
              }}
            >
              <Lock size={15} className="card-title-icon-gold" />
              <div className="start-power-item-text">
                <span className="start-power-item-title">Lock</span>
                <span className="start-power-item-desc">Lock operator workstation</span>
              </div>
            </button>
            <button
              type="button"
              className="start-power-menu-item is-restart"
              onClick={() => {
                setIsPowerMenuOpen(false);
                onClose();
                rebootSystem();
              }}
            >
              <RotateCcw size={15} className="card-title-icon-emerald" />
              <div className="start-power-item-text">
                <span className="start-power-item-title">Restart</span>
                <span className="start-power-item-desc">Reboot Cockpit OS Kernel</span>
              </div>
            </button>
            <button
              type="button"
              className="start-power-menu-item is-signout"
              onClick={() => {
                setIsPowerMenuOpen(false);
                onClose();
                lockSession();
              }}
            >
              <LogOut size={15} />
              <div className="start-power-item-text">
                <span className="start-power-item-title">Sign Out</span>
                <span className="start-power-item-desc">Return to Gate 0 Login</span>
              </div>
            </button>
          </div>
        )}

        <div
          className="start-operator-info"
          onClick={() => setIsUserMenuOpen((prev) => !prev)}
          title="Operator Profile & Session Menu"
        >
          <div className="start-operator-avatar">
            {authenticatedOperator?.staff_code || 'EMP-01'}
          </div>
          <div className="start-operator-text">
            <div className="start-operator-name">
              {authenticatedOperator?.full_name || 'BGT System'}
            </div>
            <div className="start-operator-role">
              {authenticatedOperator?.role || 'Chief System Architect / CSO'}
            </div>
          </div>
        </div>

        <div className="start-power-actions">
          <button
            type="button"
            className="start-action-btn"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            type="button"
            className="start-action-btn"
            title="Open System Preferences"
            onClick={() => handleLaunchApp('settings')}
          >
            <SettingsIcon size={16} />
          </button>
          <button
            type="button"
            className="start-action-btn"
            title="Lock Operator Session [Gate 0 PIN]"
            onClick={() => {
              onClose();
              lockSession();
            }}
          >
            <Lock size={16} />
          </button>
          <button
            type="button"
            className={`start-action-btn is-danger ${isPowerMenuOpen ? 'is-active' : ''}`}
            title="Power: Restart Cockpit OS Kernel / Sign Out"
            onClick={() => setIsPowerMenuOpen((prev) => !prev)}
          >
            <Power size={16} />
          </button>
        </div>
      </div>
    </div>
  </>,
  document.body
);
}


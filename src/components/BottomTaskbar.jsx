import React, { useState, useEffect } from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Image as ImageIcon,
  Bell
} from 'lucide-react';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { WindowsStartMenuFlyout } from './WindowsStartMenuFlyout.jsx';
import { WindowsCalendarFlyout } from './WindowsCalendarFlyout.jsx';
import { WindowsNotificationFlyout } from './WindowsNotificationFlyout.jsx';
import { GlobalSearchModal } from './GlobalSearchModal.jsx';

export function BottomTaskbar({ searchQuery, onSearchChange }) {
  const {
    arenaState,
    activeModuleId,
    setActiveModuleId,
    theme,
    toggleTheme,
    wallpaper,
    cycleWallpaper,
    soundEnabled,
    toggleSound,
    toasts
  } = useArena();

  const [now, setNow] = useState(() => new Date());
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Global hotkeys (Ctrl + K for search, Escape to close flyouts or window)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setIsStartMenuOpen(false);
        setIsCalendarOpen(false);
        setIsNotifOpen(false);
      }
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        else if (isStartMenuOpen) setIsStartMenuOpen(false);
        else if (isCalendarOpen) setIsCalendarOpen(false);
        else if (isNotifOpen) setIsNotifOpen(false);
        else if (activeModuleId) setActiveModuleId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isStartMenuOpen, isCalendarOpen, isNotifOpen, activeModuleId, setActiveModuleId]);

  const lanIp = arenaState?.systemMetrics?.lanIp || '127.0.0.1';
  const auditLogs = arenaState?.auditLogs || [];
  const totalNotifs = toasts.length + Math.min(5, auditLogs.length);

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  });

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const toggleStartMenu = () => {
    setIsStartMenuOpen((prev) => !prev);
    setIsCalendarOpen(false);
    setIsNotifOpen(false);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen((prev) => !prev);
    setIsNotifOpen(false);
    setIsStartMenuOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotifOpen((prev) => !prev);
    setIsCalendarOpen(false);
    setIsStartMenuOpen(false);
  };

  return (
    <>
      <footer className="bottom-taskbar">
        {/* Left: Start Menu Button & Global Search Engine Input */}
        <div className="taskbar-left-cluster">
          <button
            type="button"
            className={`start-launcher-btn ${isStartMenuOpen ? 'is-active' : ''}`}
            title="Cockpit OS Start Menu"
            onClick={toggleStartMenu}
          >
            <AppIconGlyph name="BrandChevronCrest" size={20} />
          </button>

          <div
            className="taskbar-search-box"
            onClick={() => setIsSearchOpen(true)}
            title="Open Global Search Engine (Ctrl + K)"
          >
            <Search size={14} className="card-title-icon-emerald" />
            <input
              type="text"
              readOnly
              className="taskbar-search-input"
              placeholder="Search across all modules, texts &amp; data..."
              value={searchQuery || ''}
              onClick={() => setIsSearchOpen(true)}
            />
            <span className="taskbar-search-kbd">Ctrl + K</span>
          </div>
        </div>

        {/* Center: Running / Pinned Apps Dock */}
        <nav className="taskbar-dock-icons" aria-label="Quick Launch Dock">
          {DESKTOP_APPS.slice(0, 16).map((app) => {
            const isActive = activeModuleId === app.id;

            return (
              <button
                key={app.id}
                type="button"
                className={`dock-icon-btn ${isActive ? 'is-active' : ''}`}
                title={app.label}
                onClick={() => {
                  setIsStartMenuOpen(false);
                  setIsCalendarOpen(false);
                  setIsNotifOpen(false);
                  setIsSearchOpen(false);
                  setActiveModuleId(isActive ? null : app.id);
                }}
              >
                <AppIconGlyph name={app.icon} size={20} />
                {isActive && <span className="dock-active-pill" />}
              </button>
            );
          })}
        </nav>

        {/* Right: Gateway Status, Audio, Wallpaper, Theme, Bell Notification & Calendar Clock */}
        <div className="taskbar-right-tray">
          <div className="tray-gateway-box">
            <span className="status-dot-online" />
            <div className="tray-gateway-labels">
              <span className="tray-gateway-title">GATEWAY</span>
              <span className="tray-gateway-ip">{lanIp}</span>
            </div>
          </div>

          <button
            type="button"
            className="tray-icon-btn"
            title={soundEnabled ? 'Acoustic Cues Enabled' : 'Acoustic Cues Muted'}
            onClick={toggleSound}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <button
            type="button"
            className="tray-icon-btn"
            title={`Cycle Wallpaper (Active: ${(wallpaper || 'luxury_wavy').replace('_', ' ').toUpperCase()})`}
            onClick={cycleWallpaper}
          >
            <ImageIcon size={16} />
          </button>

          <button
            type="button"
            className="tray-icon-btn"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Bell Icon Notification Button */}
          <button
            type="button"
            className={`tray-icon-btn tray-bell-btn ${isNotifOpen ? 'is-active' : ''}`}
            title="Action Center &amp; Notifications"
            onClick={toggleNotifications}
          >
            <Bell size={16} />
            {totalNotifs > 0 && (
              <span className="tray-bell-badge">{totalNotifs}</span>
            )}
          </button>

          {/* Interactive Date & Time Clock (Clicks to open Calendar Flyout) */}
          <div
            className={`tray-clock-stack ${isCalendarOpen ? 'is-active' : ''}`}
            onClick={toggleCalendar}
            title="View Calendar &amp; Derby Schedule"
          >
            <span className="tray-clock-time">{formattedTime}</span>
            <span className="tray-clock-date">{formattedDate}</span>
          </div>
        </div>
      </footer>

      {/* Flyouts & Modals */}
      <WindowsStartMenuFlyout
        isOpen={isStartMenuOpen}
        onClose={() => setIsStartMenuOpen(false)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <WindowsCalendarFlyout
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
      />

      <WindowsNotificationFlyout
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

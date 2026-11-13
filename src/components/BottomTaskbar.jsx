import React, { useState, useEffect, useRef } from 'react';
import { LayoutGrid, Search, Volume2, VolumeX, Sun, Moon, Image as ImageIcon } from 'lucide-react';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { useArena } from '../context/ArenaContext.jsx';

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
    toggleSound
  } = useArena();

  const [now, setNow] = useState(() => new Date());
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && activeModuleId) {
        setActiveModuleId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModuleId, setActiveModuleId]);

  const lanIp = arenaState?.systemMetrics?.lanIp || '127.0.0.1';

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

  return (
    <footer className="bottom-taskbar">
      <div className="taskbar-left-cluster">
        <button
          type="button"
          className="start-launcher-btn"
          title="Open Windows Explorer — This Arena PC (Drives & Folders)"
          onClick={() =>
            setActiveModuleId(
              activeModuleId === 'this-pc' ? null : 'this-pc'
            )
          }
        >
          <LayoutGrid size={18} />
        </button>

        <div className="taskbar-search-box">
          <Search size={14} className="card-title-icon-emerald" />
          <input
            ref={searchInputRef}
            type="text"
            className="taskbar-search-input"
            placeholder="Search applications, files, or settings..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="taskbar-search-kbd">Ctrl + K</span>
        </div>
      </div>

      <nav className="taskbar-dock-icons" aria-label="Quick Launch Dock">
        {DESKTOP_APPS.slice(0, 16).map((app) => {
          const isActive = activeModuleId === app.id;

          return (
            <button
              key={app.id}
              type="button"
              className="dock-icon-btn"
              title={app.label}
              onClick={() => setActiveModuleId(isActive ? null : app.id)}
            >
              <AppIconGlyph name={app.icon} size={18} />
            </button>
          );
        })}
      </nav>

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

        <div className="tray-clock-stack">
          <span className="tray-clock-time">{formattedTime}</span>
          <span className="tray-clock-date">{formattedDate}</span>
        </div>
      </div>
    </footer>
  );
}

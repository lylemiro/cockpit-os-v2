import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useArena } from '../context/ArenaContext.jsx';
import {
  FolderOpen,
  RefreshCw,
  Image,
  Moon,
  Sun,
  ShieldCheck,
  Lock,
  Info,
  ExternalLink,
  Share2,
  Users
} from 'lucide-react';

export function DesktopContextMenu() {
  const {
    fetchState,
    wallpaper,
    setWallpaper,
    theme,
    toggleTheme,
    setActiveModuleId,
    lockSession,
    notifySuccess,
    notifyInfo
  } = useArena();

  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [targetApp, setTargetApp] = useState(null);
  const menuRef = useRef(null);

  const handleContextMenu = useCallback((e) => {
    // If the click is on an input or textarea, let the browser handle it
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

    e.preventDefault();

    // Check if right-clicked on an app tile
    const tile = e.target.closest('[data-app-id]');
    if (tile) {
      const appId = tile.getAttribute('data-app-id');
      const appName = tile.getAttribute('data-app-name');
      setTargetApp({ id: appId, name: appName });
    } else {
      setTargetApp(null);
    }

    // Clamp coordinates to screen boundaries
    const menuWidth = 220;
    const menuHeight = 260;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth - 10);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight - 10);

    setPos({ x, y });
    setVisible(true);
  }, []);

  useEffect(() => {
    if (visible && menuRef.current) {
      menuRef.current.style.setProperty('--ctx-x', `${pos.x}px`);
      menuRef.current.style.setProperty('--ctx-y', `${pos.y}px`);
    }
  }, [visible, pos]);

  const closeMenu = useCallback(() => {
    setVisible(false);
    setTargetApp(null);
  }, []);

  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleContextMenu, closeMenu]);

  if (!visible) return null;

  const cycleWallpaper = () => {
    const sequence = ['luxury_wavy', 'wallpaper_v2', 'wallpaper_v3'];
    const nextIdx = (sequence.indexOf(wallpaper) + 1) % sequence.length;
    const nextWp = sequence[nextIdx];
    setWallpaper(nextWp);
    notifySuccess('Wallpaper Changed', `Switched to ${nextWp.replace('_', ' ').toUpperCase()}`);
    closeMenu();
  };

  const handleRefresh = async () => {
    closeMenu();
    await fetchState(true);
    notifySuccess('Desktop Refreshed', 'Arena telemetry and database records are synchronized.');
  };

  const showAbout = () => {
    closeMenu();
    notifyInfo(
      'COCKPIT OS v2.4.0',
      'Enterprise Zero-Trust Coliseo Edition • Physical SQLite WAL Multi-Tenant Isolation • RFC6455 Realtime LAN Mesh.'
    );
  };

  return (
    <div
      ref={menuRef}
      className="desktop-ctx-menu"
      onClick={(e) => e.stopPropagation()}
      role="menu"
    >
      {targetApp ? (
        <>
          <div className="ctx-menu-header">
            <span className="ctx-header-title">{targetApp.name}</span>
            <span className="ctx-header-sub">Application</span>
          </div>

          <button
            type="button"
            className="ctx-menu-item"
            onClick={() => {
              setActiveModuleId(targetApp.id);
              closeMenu();
            }}
          >
            <FolderOpen size={14} className="ctx-item-icon" />
            <span>Launch Application</span>
          </button>

          <button
            type="button"
            className="ctx-menu-item"
            onClick={() => {
              setActiveModuleId('database-explorer');
              closeMenu();
            }}
          >
            <Share2 size={14} className="ctx-item-icon" />
            <span>Inspect in Relationship Graph</span>
          </button>

          <div className="ctx-menu-divider" />

          <button
            type="button"
            className="ctx-menu-item"
            onClick={() => {
              setActiveModuleId('users-permissions');
              closeMenu();
            }}
          >
            <Users size={14} className="ctx-item-icon" />
            <span>ARBAC Permissions & Access</span>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="ctx-menu-item"
            onClick={() => {
              setActiveModuleId('this-pc');
              closeMenu();
            }}
          >
            <FolderOpen size={14} className="ctx-item-icon" />
            <span>Open File Explorer</span>
          </button>

          <button type="button" className="ctx-menu-item" onClick={handleRefresh}>
            <RefreshCw size={14} className="ctx-item-icon" />
            <span>Refresh Desktop &amp; Data</span>
          </button>

          <div className="ctx-menu-divider" />

          <button type="button" className="ctx-menu-item" onClick={cycleWallpaper}>
            <Image size={14} className="ctx-item-icon" />
            <span>Change Wallpaper</span>
          </button>

          <button
            type="button"
            className="ctx-menu-item"
            onClick={() => {
              toggleTheme();
              closeMenu();
            }}
          >
            {theme === 'light' ? (
              <>
                <Moon size={14} className="ctx-item-icon" />
                <span>Switch to Night Mode</span>
              </>
            ) : (
              <>
                <Sun size={14} className="ctx-item-icon" />
                <span>Switch to Light Mode</span>
              </>
            )}
          </button>

          <div className="ctx-menu-divider" />

          <button
            type="button"
            className="ctx-menu-item"
            onClick={() => {
              setActiveModuleId('command-overview');
              closeMenu();
            }}
          >
            <ShieldCheck size={14} className="ctx-item-icon" />
            <span>Zero-Trust Gate Matrix</span>
          </button>

          <button
            type="button"
            className="ctx-menu-item"
            onClick={() => {
              closeMenu();
              lockSession();
            }}
          >
            <Lock size={14} className="ctx-item-icon" />
            <span>Lock Terminal (Gate 0)</span>
          </button>

          <div className="ctx-menu-divider" />

          <button type="button" className="ctx-menu-item" onClick={showAbout}>
            <Info size={14} className="ctx-item-icon" />
            <span>About COCKPIT OS</span>
          </button>
        </>
      )}
    </div>
  );
}

import React from 'react';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { useArena } from '../context/ArenaContext.jsx';

export function DesktopIconGrid({ searchQuery }) {
  const { arenaState, setActiveModuleId } = useArena();

  const normalizedQuery = (searchQuery || '').trim().toLowerCase();
  const visibleApps = normalizedQuery
    ? DESKTOP_APPS.filter(
        (app) =>
          app.label.toLowerCase().includes(normalizedQuery) ||
          app.subtitle.toLowerCase().includes(normalizedQuery) ||
          app.gateTag.toLowerCase().includes(normalizedQuery)
      )
    : DESKTOP_APPS;

  return (
    <aside className="desktop-left-column">
      <div className="desktop-icon-grid">
        {visibleApps.map((app) => {
          const count = typeof app.getCount === 'function' ? app.getCount(arenaState) : 0;

          return (
            <button
              key={app.id}
              type="button"
              className="desktop-app-tile"
              data-app-id={app.id}
              data-app-name={app.label}
              onClick={() => setActiveModuleId(app.id)}
              title={`${app.label} — ${app.subtitle}`}
            >
              <div className="app-icon-box">
                <AppIconGlyph name={app.icon} size={22} />
                {count > 0 && <span className="app-tile-badge">{count}</span>}
              </div>
              <span className="app-tile-label">{app.label}</span>
            </button>
          );
        })}
      </div>

      <div className="offline-footer-tag">
        <div className="offline-gold-bar" />
        <div className="offline-footer-text">
          <div>LOCAL NETWORK ONLY</div>
          <div>OFFLINE-FIRST SYSTEM</div>
        </div>
      </div>
    </aside>
  );
}

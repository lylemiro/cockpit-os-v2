import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useArena } from '../context/ArenaContext.jsx';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { Monitor } from 'lucide-react';

const ALL_SWITCHER_ITEMS = [
  {
    id: 'this-pc',
    label: 'This Arena PC',
    icon: 'Monitor',
    subtitle: 'System Root Drives, Physical Tenant Databases & Executive Folders',
    gateTag: 'OS Root'
  },
  ...DESKTOP_APPS
];

export function AltTabSwitcher() {
  const { activeModuleId, setActiveModuleId, bootCompleted, authenticatedOperator } = useArena();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isAltDownRef = useRef(false);

  // Synchronize index when an app is active
  useEffect(() => {
    const idx = ALL_SWITCHER_ITEMS.findIndex((a) => a.id === activeModuleId);
    if (idx >= 0) {
      setSelectedIndex(idx);
    }
  }, [activeModuleId]);

  const handleKeyDown = useCallback(
    (e) => {
      // Don't intercept when booted out or logging in
      if (!bootCompleted || !authenticatedOperator) return;

      if (e.key === 'Alt') {
        isAltDownRef.current = true;
      }

      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex((prev) => {
          const step = e.shiftKey ? -1 : 1;
          return (prev + step + ALL_SWITCHER_ITEMS.length) % ALL_SWITCHER_ITEMS.length;
        });
      }

      if (isOpen) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % ALL_SWITCHER_ITEMS.length);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + ALL_SWITCHER_ITEMS.length) % ALL_SWITCHER_ITEMS.length);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          setIsOpen(false);
          setActiveModuleId(ALL_SWITCHER_ITEMS[selectedIndex].id);
        }
      }
    },
    [bootCompleted, authenticatedOperator, isOpen, selectedIndex, setActiveModuleId]
  );

  const handleKeyUp = useCallback(
    (e) => {
      if (e.key === 'Alt') {
        isAltDownRef.current = false;
        if (isOpen) {
          setIsOpen(false);
          const targetApp = ALL_SWITCHER_ITEMS[selectedIndex];
          if (targetApp) {
            setActiveModuleId(targetApp.id);
          }
        }
      }
    },
    [isOpen, selectedIndex, setActiveModuleId]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  if (!isOpen) return null;

  const currentItem = ALL_SWITCHER_ITEMS[selectedIndex] || ALL_SWITCHER_ITEMS[0];

  return (
    <div className="alttab-backdrop" onClick={() => setIsOpen(false)}>
      <div
        className="alttab-hud-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Application Switcher"
      >
        <div className="alttab-header-row">
          <div className="alttab-hud-title">TASK SWITCHER (ALT + TAB)</div>
          <div className="alttab-hud-counter">
            {selectedIndex + 1} of {ALL_SWITCHER_ITEMS.length}
          </div>
        </div>

        <div className="alttab-grid">
          {ALL_SWITCHER_ITEMS.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                className={`alttab-item-tile ${isSelected ? 'is-selected' : ''}`}
                onClick={() => {
                  setSelectedIndex(idx);
                  setActiveModuleId(item.id);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="alttab-item-icon-box">
                  {item.id === 'this-pc' ? (
                    <Monitor size={24} className="card-title-icon-emerald" />
                  ) : (
                    <AppIconGlyph name={item.icon} size={24} />
                  )}
                </div>
                <div className="alttab-item-name">{item.label}</div>
              </button>
            );
          })}
        </div>

        {/* Selected App Detailed Preview */}
        <div className="alttab-preview-footer">
          <div className="alttab-preview-icon">
            {currentItem.id === 'this-pc' ? (
              <Monitor size={22} className="card-title-icon-emerald" />
            ) : (
              <AppIconGlyph name={currentItem.icon} size={22} />
            )}
          </div>
          <div className="alttab-preview-meta">
            <div className="alttab-preview-headline">
              <span>{currentItem.label}</span>
              <span className="alttab-preview-badge">{currentItem.gateTag}</span>
            </div>
            <div className="alttab-preview-sub">{currentItem.subtitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


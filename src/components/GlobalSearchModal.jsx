import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  X,
  ArrowRight,
  Monitor,
  Users,
  HardDrive,
  Trophy,
  Coins,
  ShieldCheck,
  Activity,
  Layers,
  Database,
  Calendar,
  ChevronRight,
  Filter,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { ARBAC_PERMISSION_GROUPS } from './arbacCatalog.js';
import { useArena } from '../context/ArenaContext.jsx';

export function GlobalSearchModal({ isOpen, onClose }) {
  const {
    arenaState,
    setActiveModuleId,
    switchTenant,
    notifySuccess
  } = useArena();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'APPS' | 'DATA' | 'PERMS' | 'LOGS'
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Focus input upon open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global search compilation across all modules, text, and data
  const allSearchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // When empty query, show quick recommendations / popular apps
      return DESKTOP_APPS.slice(0, 8).map((app) => ({
        id: `app-${app.id}`,
        type: 'APP',
        category: 'Applications',
        title: app.label,
        subtitle: app.subtitle,
        gate: app.gateTag,
        icon: app.icon,
        rawApp: app,
        action: () => {
          setActiveModuleId(app.id);
          onClose();
        }
      }));
    }

    const list = [];

    // 1. Applications & Modules Index
    DESKTOP_APPS.forEach((app) => {
      const match =
        app.label.toLowerCase().includes(q) ||
        app.subtitle.toLowerCase().includes(q) ||
        app.gateTag.toLowerCase().includes(q) ||
        app.id.toLowerCase().includes(q);

      if (match) {
        list.push({
          id: `app-${app.id}`,
          type: 'APP',
          category: 'Applications',
          title: app.label,
          subtitle: app.subtitle,
          gate: app.gateTag,
          icon: app.icon,
          rawApp: app,
          action: () => {
            setActiveModuleId(app.id);
            onClose();
          }
        });
      }
    });

    // 2. Physical Multi-Tenant Databases
    (arenaState?.tenants || []).forEach((t) => {
      const match =
        t.arena_name.toLowerCase().includes(q) ||
        t.tenant_code.toLowerCase().includes(q) ||
        (t.db_file_name && t.db_file_name.toLowerCase().includes(q)) ||
        (t.gab_license && t.gab_license.toLowerCase().includes(q)) ||
        (t.bir_cas_min && t.bir_cas_min.toLowerCase().includes(q));

      if (match) {
        list.push({
          id: `tenant-${t.tenant_id}`,
          type: 'DATA',
          category: 'Tenant Databases',
          title: `${t.arena_name} (${t.tenant_code}:)`,
          subtitle: `File: ${t.db_file_name} • License: ${t.gab_license || 'GAB'} • MIN: ${t.bir_cas_min || 'BIR'}`,
          icon: 'Database',
          badge: 'Physical WAL DB',
          action: () => {
            switchTenant(t.tenant_id);
            setActiveModuleId('users-permissions');
            notifySuccess('Database Mounted', `Switched to physical database: ${t.db_file_name}`);
            onClose();
          }
        });
      }
    });

    // 3. Database Users / Staff Members
    (arenaState?.employees || []).forEach((emp) => {
      const match =
        emp.full_name.toLowerCase().includes(q) ||
        emp.staff_code.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        (emp.zone && emp.zone.toLowerCase().includes(q)) ||
        (emp.bound_device_code && emp.bound_device_code.toLowerCase().includes(q));

      if (match) {
        list.push({
          id: `emp-${emp.employee_id}`,
          type: 'DATA',
          category: 'Staff & Operators',
          title: `${emp.staff_code}: ${emp.full_name}`,
          subtitle: `Role: ${emp.role} • Zone: ${emp.zone || 'Command Cage'} • Bound POS: ${emp.bound_device_code || 'T01'}`,
          icon: 'Users',
          badge: 'DB Operator',
          action: () => {
            setActiveModuleId('users-permissions');
            onClose();
          }
        });
      }
    });

    // 4. Active Derby Events
    (arenaState?.events || []).forEach((evt) => {
      const match =
        evt.title.toLowerCase().includes(q) ||
        (evt.game_type && evt.game_type.toLowerCase().includes(q)) ||
        (evt.organizer && evt.organizer.toLowerCase().includes(q));

      if (match) {
        list.push({
          id: `event-${evt.event_id}`,
          type: 'DATA',
          category: 'Coliseum Events',
          title: evt.title,
          subtitle: `Type: ${evt.game_type} • Pot: ₱${evt.pot_money?.toLocaleString()} • Entry: ₱${evt.entry_fee?.toLocaleString()}`,
          icon: 'CalendarPlus',
          badge: 'Derby Tournament',
          action: () => {
            setActiveModuleId('events-schedule');
            onClose();
          }
        });
      }
    });

    // 5. Sultada Fights
    (arenaState?.fights || []).forEach((f) => {
      const match =
        String(f.fight_number).includes(q) ||
        (f.meron_rooster_code && f.meron_rooster_code.toLowerCase().includes(q)) ||
        (f.wala_rooster_code && f.wala_rooster_code.toLowerCase().includes(q)) ||
        (f.status && f.status.toLowerCase().includes(q)) ||
        (f.verdict && f.verdict.toLowerCase().includes(q));

      if (match) {
        list.push({
          id: `fight-${f.fight_id}`,
          type: 'DATA',
          category: 'Sultada Fights',
          title: `Fight #${f.fight_number}: Meron vs. Wala`,
          subtitle: `Status: ${f.status || 'SCHEDULED'} • Tier: ${f.staging_tier || 'PIT'} • Verdict: ${f.verdict || 'PENDING'}`,
          icon: 'Bell',
          badge: 'Soltada Match',
          action: () => {
            setActiveModuleId('ruedo-pit');
            onClose();
          }
        });
      }
    });

    // 6. Registered Roosters & Entries
    (arenaState?.roosters || []).forEach((r) => {
      const match =
        (r.wing_band && r.wing_band.toLowerCase().includes(q)) ||
        (r.leg_band && r.leg_band.toLowerCase().includes(q)) ||
        (r.entry_name && r.entry_name.toLowerCase().includes(q)) ||
        (r.breed && r.breed.toLowerCase().includes(q));

      if (match) {
        list.push({
          id: `rooster-${r.rooster_id}`,
          type: 'DATA',
          category: 'Rooster Registry',
          title: `Rooster ${r.wing_band || r.leg_band || 'Tag'} — ${r.entry_name || 'Syndicate'}`,
          subtitle: `Weight: ${r.weight_grams}g • Breed: ${r.breed || 'Sweater'} • Status: ${r.status || 'VERIFIED'}`,
          icon: 'RoosterCrest',
          badge: 'Timbangan Entry',
          action: () => {
            setActiveModuleId('kasahan-matchmaking');
            onClose();
          }
        });
      }
    });

    // 7. Wagers & Grandstand Bets
    (arenaState?.wagers || []).forEach((w) => {
      const match =
        (w.ticket_barcode && w.ticket_barcode.toLowerCase().includes(q)) ||
        (w.side && w.side.toLowerCase().includes(q)) ||
        (w.status && w.status.toLowerCase().includes(q)) ||
        String(w.amount).includes(q);

      if (match) {
        list.push({
          id: `wager-${w.wager_id}`,
          type: 'DATA',
          category: 'Wagers & Bets',
          title: `Ticket ${w.ticket_barcode || w.wager_id}: ₱${w.amount?.toLocaleString()} on ${w.side}`,
          subtitle: `Status: ${w.status} • Fight #${w.fight_id} • Kristo POS: ${w.device_code || 'T01'}`,
          icon: 'Coins',
          badge: 'Grandstand Bet',
          action: () => {
            setActiveModuleId('grandstand-betting');
            onClose();
          }
        });
      }
    });

    // 8. Granular ARBAC Permissions Catalog
    ARBAC_PERMISSION_GROUPS.forEach((grp) => {
      grp.permissions.forEach((perm) => {
        const match =
          perm.label.toLowerCase().includes(q) ||
          perm.key.toLowerCase().includes(q) ||
          (grp.domainTitle || grp.domainId || '').toLowerCase().includes(q);

        if (match) {
          list.push({
            id: `perm-${perm.key}`,
            type: 'PERMS',
            category: 'Security & ARBAC Permissions',
            title: perm.label,
            subtitle: `Domain: ${grp.domain} • Key: ${perm.key}`,
            icon: 'ShieldCheck',
            badge: 'ARBAC Clearance',
            action: () => {
              setActiveModuleId('users-permissions');
              onClose();
            }
          });
        }
      });
    });

    // 9. Zero-Trust Security Gates (0-8)
    (arenaState?.gates || []).forEach((gate) => {
      const match =
        gate.name.toLowerCase().includes(q) ||
        String(gate.gateNumber).includes(q) ||
        (gate.description && gate.description.toLowerCase().includes(q));

      if (match) {
        list.push({
          id: `gate-${gate.gateNumber}`,
          type: 'PERMS',
          category: 'Zero-Trust Gate Matrix',
          title: `Gate ${gate.gateNumber}: ${gate.name}`,
          subtitle: `${gate.passed ? 'PASSED & CERTIFIED' : 'PENDING PREREQUISITE'} • ${gate.description || ''}`,
          icon: 'Monitor',
          badge: gate.passed ? 'GATE CLEARED' : 'GATE REQUIRED',
          action: () => {
            setActiveModuleId('command-overview');
            onClose();
          }
        });
      }
    });

    // 10. Tamper-Evident Audit Logs
    (arenaState?.auditLogs || []).forEach((log) => {
      const match =
        log.action.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.operator_name && log.operator_name.toLowerCase().includes(q));

      if (match) {
        list.push({
          id: `log-${log.log_id || log.timestamp}`,
          type: 'LOGS',
          category: 'Audit Logs',
          title: log.action.replace(/_/g, ' '),
          subtitle: `Operator: ${log.operator_name || 'System'} • ${log.details || ''}`,
          icon: 'Activity',
          badge: 'Audit Trail',
          action: () => {
            setActiveModuleId('security-audit');
            onClose();
          }
        });
      }
    });

    return list;
  }, [query, arenaState, setActiveModuleId, switchTenant, notifySuccess, onClose]);

  // Filter by selected category chip
  const filteredResults = useMemo(() => {
    if (selectedCategory === 'ALL') return allSearchResults;
    return allSearchResults.filter((r) => r.type === selectedCategory);
  }, [allSearchResults, selectedCategory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredResults.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredResults.length - 1) : prev - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredResults[selectedIndex];
        if (selected && typeof selected.action === 'function') {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const activeEl = resultsContainerRef.current.querySelector('.is-keyboard-active');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const activeResult = filteredResults[selectedIndex] || filteredResults[0];

  return createPortal(
    <div className="win-global-search-backdrop" onClick={onClose}>
      <div
        className="win-global-search-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Cockpit OS Global Search Engine"
      >
        {/* 1. Global Search Top Input Bar */}
        <div className="search-modal-header">
          <Search size={22} className="card-title-icon-emerald" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search across all modules, live wagers, roosters, employees, audit trails..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button
              type="button"
              className="search-modal-clear"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          )}
          <span className="search-modal-kbd">ESC to Exit</span>
        </div>

        {/* 2. Category Filter Chips */}
        <div className="search-category-strip">
          <button
            type="button"
            className={`search-chip-btn ${selectedCategory === 'ALL' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            All Results ({allSearchResults.length})
          </button>
          <button
            type="button"
            className={`search-chip-btn ${selectedCategory === 'APP' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('APP')}
          >
            Applications ({allSearchResults.filter((r) => r.type === 'APP').length})
          </button>
          <button
            type="button"
            className={`search-chip-btn ${selectedCategory === 'DATA' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('DATA')}
          >
            Coliseum Data ({allSearchResults.filter((r) => r.type === 'DATA').length})
          </button>
          <button
            type="button"
            className={`search-chip-btn ${selectedCategory === 'PERMS' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('PERMS')}
          >
            ARBAC &amp; Gates ({allSearchResults.filter((r) => r.type === 'PERMS').length})
          </button>
          <button
            type="button"
            className={`search-chip-btn ${selectedCategory === 'LOGS' ? 'is-active' : ''}`}
            onClick={() => setSelectedCategory('LOGS')}
          >
            Audit Trails ({allSearchResults.filter((r) => r.type === 'LOGS').length})
          </button>
        </div>

        {/* 3. Main Split View: Left Results List | Right Live Preview Card */}
        <div className="search-modal-body">
          {/* Left: Results List */}
          <div ref={resultsContainerRef} className="search-results-list">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, idx) => {
                const isActive = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    className={`search-result-row ${isActive ? 'is-keyboard-active' : ''}`}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="search-row-icon">
                      <AppIconGlyph name={item.icon || 'Monitor'} size={24} />
                    </div>

                    <div className="search-row-content">
                      <div className="search-row-top">
                        <span className="search-row-title">{item.title}</span>
                        {item.badge && (
                          <span className="search-row-badge">{item.badge}</span>
                        )}
                        {item.gate && (
                          <span className="search-row-gate">{item.gate}</span>
                        )}
                      </div>
                      <div className="search-row-sub">{item.subtitle}</div>
                    </div>

                    <div className="search-row-arrow">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="search-empty-state">
                <Search size={36} className="card-title-icon-emerald" />
                <div className="search-empty-title">No matching records found for "{query}"</div>
                <div className="search-empty-desc">
                  Try searching for keywords like "rooster", "weigh-in", "tari", "kristo", "bet", "cashier", "audit", or employee names.
                </div>
              </div>
            )}
          </div>

          {/* Right: Live Detailed Preview Pane */}
          {activeResult && (
            <aside className="search-preview-pane">
              <div className="search-preview-card">
                <div className="search-preview-icon-wrap">
                  <AppIconGlyph name={activeResult.icon || 'Monitor'} size={48} />
                </div>

                <div className="search-preview-title">{activeResult.title}</div>
                <div className="search-preview-category">{activeResult.category}</div>

                <p className="search-preview-desc">{activeResult.subtitle}</p>

                {activeResult.rawApp && (
                  <div className="search-preview-details">
                    <div className="metric-row">
                      <span className="metric-label">Security Gate</span>
                      <span className="metric-value is-gold">{activeResult.rawApp.gateTag}</span>
                    </div>
                    <div className="metric-row">
                      <span className="metric-label">App ID</span>
                      <span className="metric-value">{activeResult.rawApp.id}</span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className="search-preview-action-btn"
                  onClick={() => activeResult.action()}
                >
                  <span>Open Selected Item</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </aside>
          )}
        </div>

        {/* 4. Bottom Search Footer Shortcuts */}
        <div className="search-modal-footer">
          <div className="search-footer-shortcuts">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span>
            <span><kbd>ENTER</kbd> Open / Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <div className="search-footer-status">
            Cockpit OS Omniscient Global Search Engine • Real-time SQLite Indexed
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


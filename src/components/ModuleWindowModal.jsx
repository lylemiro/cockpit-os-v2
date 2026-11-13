import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCw,
  Folder,
  FolderOpen,
  HardDrive,
  Star,
  ChevronRight,
  ChevronDown,
  Search,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Plus,
  LayoutGrid,
  Network,
  PanelRight,
  Monitor
} from 'lucide-react';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { SubsystemWorkspace } from '../modules/SubsystemWorkspace.jsx';
import { DatabaseRelationshipGraph } from './DatabaseRelationshipGraph.jsx';
import { ErrorAlert, LoadingState, EmptyState } from './CentralizedFeedbackStates.jsx';

export function ModuleWindowModal() {
  const {
    arenaState,
    activeModuleId,
    setActiveModuleId,
    activeTenantId,
    switchTenant,
    authenticatedOperator,
    fetchState,
    loading,
    error,
    setError,
    notifySuccess
  } = useArena();

  const [openTabs, setOpenTabs] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showDetailsPane, setShowDetailsPane] = useState(false);
  const [explorerSearch, setExplorerSearch] = useState('');
  const [viewMode, setViewMode] = useState('workspace'); // 'workspace' | 'this-pc' | 'graph'

  const [expandedSections, setExpandedSections] = useState({
    quickAccess: true,
    drives: true,
    folders: true
  });

  // Sync activeModuleId from Desktop/Taskbar into Windows Explorer Tabs & History
  useEffect(() => {
    if (!activeModuleId) return;

    setViewMode(activeModuleId === 'this-pc' ? 'this-pc' : 'workspace');

    setOpenTabs((prev) => {
      if (prev.includes(activeModuleId)) return prev;
      return [...prev, activeModuleId];
    });

    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      if (sliced[sliced.length - 1] === activeModuleId) return prev;
      const next = [...sliced, activeModuleId];
      setHistoryIndex(next.length - 1);
      return next;
    });
  }, [activeModuleId]);

  if (!activeModuleId) return null;

  const navigateToFolder = (folderId) => {
    setError(null);
    if (folderId === 'this-pc') {
      setViewMode('this-pc');
      setActiveModuleId('this-pc');
    } else {
      setViewMode('workspace');
      setActiveModuleId(folderId);
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevId = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setActiveModuleId(prevId);
      setViewMode(prevId === 'this-pc' ? 'this-pc' : 'workspace');
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextId = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setActiveModuleId(nextId);
      setViewMode(nextId === 'this-pc' ? 'this-pc' : 'workspace');
    }
  };

  const handleUpToThisPc = () => {
    navigateToFolder('this-pc');
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    const remaining = openTabs.filter((id) => id !== tabId);
    setOpenTabs(remaining);
    if (activeModuleId === tabId) {
      if (remaining.length > 0) {
        setActiveModuleId(remaining[remaining.length - 1]);
      } else {
        setActiveModuleId(null);
      }
    }
  };

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const currentApp =
    activeModuleId === 'this-pc'
      ? {
          id: 'this-pc',
          label: 'This Arena PC',
          gateTag: 'Root Explorer',
          subtitle: 'Multi-Tenant SQLite Drives & Coliseum System Folders',
          icon: 'Monitor'
        }
      : DESKTOP_APPS.find((a) => a.id === activeModuleId) || {
          id: activeModuleId,
          label: activeModuleId,
          gateTag: 'System Folder',
          subtitle: 'Coliseum Operational Module',
          icon: 'Monitor'
        };

  const tenants = arenaState?.tenants || [];
  const activeTenant = arenaState?.activeTenant;
  const normSearch = explorerSearch.trim().toLowerCase();

  const filteredFolders = normSearch
    ? DESKTOP_APPS.filter(
        (app) =>
          app.label.toLowerCase().includes(normSearch) ||
          app.subtitle.toLowerCase().includes(normSearch) ||
          app.gateTag.toLowerCase().includes(normSearch)
      )
    : DESKTOP_APPS;

  const quickAccessIds = [
    'command-overview',
    'users-permissions',
    'database-explorer',
    'kasahan-matchmaking',
    'ruedo-pit'
  ];

  const currentItemCount =
    typeof currentApp.getCount === 'function'
      ? currentApp.getCount(arenaState)
      : DESKTOP_APPS.length;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveModuleId(null);
      }}
    >
      <section
        className={`win-explorer-window ${isMaximized ? 'is-maximized' : ''}`}
        role="dialog"
        aria-modal="true"
      >
        {/* 1. WINDOWS 11 EXPLORER TABBED TITLE BAR */}
        <header className="win-titlebar">
          <div className="win-tabs-strip">
            <button
              type="button"
              className={`win-tab-item ${activeModuleId === 'this-pc' ? 'is-active' : ''}`}
              onClick={() => navigateToFolder('this-pc')}
            >
              <Monitor size={13} className="card-title-icon-emerald" />
              <span className="win-tab-label">This Arena PC</span>
            </button>

            {openTabs
              .filter((t) => t !== 'this-pc')
              .map((tabId) => {
                const tabApp = DESKTOP_APPS.find((a) => a.id === tabId);
                if (!tabApp) return null;
                const isTabActive = activeModuleId === tabId && viewMode !== 'this-pc';
                return (
                  <div
                    key={tabId}
                    className={`win-tab-item ${isTabActive ? 'is-active' : ''}`}
                    onClick={() => navigateToFolder(tabId)}
                  >
                    <AppIconGlyph name={tabApp.icon} size={13} />
                    <span className="win-tab-label">{tabApp.label}</span>
                    <button
                      type="button"
                      className="win-tab-close"
                      onClick={(e) => closeTab(tabId, e)}
                      title="Close Tab"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}

            <button
              type="button"
              className="win-new-tab-btn"
              title="Open This Arena PC Overview"
              onClick={() => navigateToFolder('this-pc')}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="win-caption-controls">
            <button
              type="button"
              className="win-caption-btn"
              title="Minimize to Desktop"
              onClick={() => setActiveModuleId(null)}
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              className="win-caption-btn"
              title={isMaximized ? 'Restore Window' : 'Maximize Window'}
              onClick={() => setIsMaximized((prev) => !prev)}
            >
              {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
            <button
              type="button"
              className="win-caption-btn is-close"
              title="Close Window [ESC]"
              onClick={() => {
                setError(null);
                setActiveModuleId(null);
              }}
            >
              <X size={15} />
            </button>
          </div>
        </header>

        {/* 2. WINDOWS EXPLORER COMMAND RIBBON & BREADCRUMB ADDRESS BAR */}
        <div className="win-command-bar">
          <div className="win-nav-buttons">
            <button
              type="button"
              className="win-nav-btn"
              disabled={historyIndex <= 0}
              onClick={handleBack}
              title="Back"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              className="win-nav-btn"
              disabled={historyIndex >= history.length - 1}
              onClick={handleForward}
              title="Forward"
            >
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              className="win-nav-btn"
              onClick={handleUpToThisPc}
              title="Up to This Arena PC"
            >
              <ArrowUp size={15} />
            </button>
            <button
              type="button"
              className="win-nav-btn"
              onClick={() => fetchState(false)}
              title="Refresh SQLite State"
            >
              <RotateCw size={14} />
            </button>
          </div>

          {/* Breadcrumb Address Bar */}
          <div className="win-address-bar">
            <button
              type="button"
              className="win-breadcrumb-segment"
              onClick={() => navigateToFolder('this-pc')}
            >
              <Monitor size={13} className="card-title-icon-emerald" />
              <span>This Arena PC</span>
            </button>

            <ChevronRight size={13} className="win-breadcrumb-sep" />

            <button
              type="button"
              className="win-breadcrumb-segment"
              onClick={() => navigateToFolder('users-permissions')}
            >
              <HardDrive size={13} className="card-title-icon-gold" />
              <span>
                {activeTenant
                  ? `${activeTenant.tenant_code}: (${activeTenant.db_file_name})`
                  : 'Unmounted Drive'}
              </span>
            </button>

            {viewMode !== 'this-pc' && (
              <>
                <ChevronRight size={13} className="win-breadcrumb-sep" />
                <span className="win-breadcrumb-segment is-current">
                  <FolderOpen size={13} className="card-title-icon-emerald" />
                  <span>{currentApp.label}</span>
                </span>
              </>
            )}
          </div>

          {/* Explorer Search Input */}
          <div className="win-search-box">
            <Search size={13} className="card-title-icon-emerald" />
            <input
              type="text"
              className="win-search-input"
              placeholder={`Search ${currentApp.label}...`}
              value={explorerSearch}
              onChange={(e) => setExplorerSearch(e.target.value)}
            />
          </div>

          {/* Explorer View Switcher */}
          <div className="win-view-toggles">
            <button
              type="button"
              className={`win-view-btn ${viewMode === 'this-pc' ? 'is-active' : ''}`}
              onClick={() => setViewMode('this-pc')}
              title="This Arena PC (Drives & Folders View)"
            >
              <LayoutGrid size={14} />
              <span>Drives &amp; Folders</span>
            </button>
            <button
              type="button"
              className={`win-view-btn ${viewMode === 'workspace' ? 'is-active' : ''}`}
              onClick={() => setViewMode('workspace')}
              title="Operational Workspace View"
            >
              <FolderOpen size={14} />
              <span>Workspace</span>
            </button>
            <button
              type="button"
              className={`win-view-btn ${viewMode === 'graph' ? 'is-active' : ''}`}
              onClick={() => setViewMode('graph')}
              title="Database Relationship Graph (Obsidian View)"
            >
              <Network size={14} />
              <span>DB Graph</span>
            </button>
            <button
              type="button"
              className={`win-view-btn ${showDetailsPane ? 'is-active' : ''}`}
              onClick={() => setShowDetailsPane((p) => !p)}
              title="Toggle Right Details Pane"
            >
              <PanelRight size={14} />
            </button>
          </div>
        </div>

        {/* 3. WINDOWS EXPLORER 3-PANE BODY (LEFT TREE | CENTER CONTENT | RIGHT DETAILS) */}
        <div
          className={`win-explorer-body ${showDetailsPane ? 'has-details-pane' : ''}`}
        >
          {/* Left Navigation Tree Pane */}
          <aside className="win-tree-pane">
            {/* Section A: Quick Access */}
            <div className="win-tree-group">
              <button
                type="button"
                className="win-tree-section-header"
                onClick={() => toggleSection('quickAccess')}
              >
                {expandedSections.quickAccess ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
                <Star size={13} className="card-title-icon-gold" />
                <span>Quick Access</span>
              </button>

              {expandedSections.quickAccess && (
                <div className="win-tree-items">
                  <button
                    type="button"
                    className={`win-tree-item ${viewMode === 'this-pc' ? 'is-selected' : ''}`}
                    onClick={() => navigateToFolder('this-pc')}
                  >
                    <Monitor size={14} className="card-title-icon-emerald" />
                    <span className="win-tree-item-label">This Arena PC</span>
                  </button>
                  {quickAccessIds.map((qid) => {
                    const qapp = DESKTOP_APPS.find((a) => a.id === qid);
                    if (!qapp) return null;
                    const isSel = activeModuleId === qid && viewMode === 'workspace';
                    return (
                      <button
                        key={qid}
                        type="button"
                        className={`win-tree-item ${isSel ? 'is-selected' : ''}`}
                        onClick={() => navigateToFolder(qid)}
                      >
                        <AppIconGlyph name={qapp.icon} size={14} />
                        <span className="win-tree-item-label">{qapp.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section B: Multi-Tenant SQLite Drives */}
            <div className="win-tree-group">
              <button
                type="button"
                className="win-tree-section-header"
                onClick={() => toggleSection('drives')}
              >
                {expandedSections.drives ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
                <HardDrive size={13} className="card-title-icon-emerald" />
                <span>Tenant SQLite Drives ({tenants.length})</span>
              </button>

              {expandedSections.drives && (
                <div className="win-tree-items">
                  {tenants.map((t) => {
                    const isMounted = t.tenant_id === activeTenantId;
                    return (
                      <button
                        key={t.tenant_id}
                        type="button"
                        className={`win-tree-item ${isMounted ? 'is-selected' : ''}`}
                        onClick={() => switchTenant(t.tenant_id)}
                        title={`Mount ${t.db_file_name}`}
                      >
                        <HardDrive
                          size={14}
                          className={
                            isMounted ? 'card-title-icon-gold' : 'card-title-icon-emerald'
                          }
                        />
                        <span className="win-tree-item-label">
                          ({t.tenant_code}:) {t.arena_name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section C: All 19 Coliseum Subsystem Folders */}
            <div className="win-tree-group">
              <button
                type="button"
                className="win-tree-section-header"
                onClick={() => toggleSection('folders')}
              >
                {expandedSections.folders ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
                <Folder size={13} className="card-title-icon-gold" />
                <span>System Folders ({filteredFolders.length})</span>
              </button>

              {expandedSections.folders && (
                <div className="win-tree-items">
                  {filteredFolders.map((app) => {
                    const isSel = activeModuleId === app.id && viewMode === 'workspace';
                    const count =
                      typeof app.getCount === 'function' ? app.getCount(arenaState) : 0;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        className={`win-tree-item ${isSel ? 'is-selected' : ''}`}
                        onClick={() => navigateToFolder(app.id)}
                      >
                        {isSel ? (
                          <FolderOpen size={14} className="card-title-icon-gold" />
                        ) : (
                          <Folder size={14} className="card-title-icon-emerald" />
                        )}
                        <span className="win-tree-item-label">{app.label}</span>
                        {count > 0 && <span className="win-tree-count">{count}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Center Explorer Content Pane */}
          <main className="win-content-pane">
            {error && (
              <ErrorAlert
                title={error.title || 'Action Notice'}
                message={error.message || String(error)}
                tip={error.tip}
                onDismiss={() => setError(null)}
              />
            )}

            {loading && !arenaState ? (
              <LoadingState
                title="Loading Arena Storage..."
                message="Mounting physical SQLite WAL database and telemetry streams."
              />
            ) : viewMode === 'graph' ? (
              <DatabaseRelationshipGraph />
            ) : viewMode === 'this-pc' ? (
              <div className="form-stack">
                {/* Windows Explorer "Devices and drives" section */}
                <div className="win-section-group">
                  <div className="win-section-heading">
                    Devices and drives — Physical Multi-Tenant SQLite Databases ({tenants.length})
                  </div>
                  <div className="win-drives-grid">
                    {tenants.map((t) => {
                      const isMounted = t.tenant_id === activeTenantId;
                      const sizeKb = t.dbMetrics?.sizeKb || 16;
                      const pct = Math.min(95, Math.max(12, Math.round((sizeKb / 512) * 100)));
                      return (
                        <div
                          key={t.tenant_id}
                          className={`win-drive-tile ${isMounted ? 'is-mounted' : ''}`}
                          onClick={() => switchTenant(t.tenant_id)}
                        >
                          <HardDrive size={34} className="card-title-icon-emerald" />
                          <div className="win-drive-info">
                            <div className="win-drive-title">
                              {t.arena_name} ({t.tenant_code}:)
                            </div>
                            <div className="win-drive-bar-track">
                              <div
                                className={`win-drive-bar-fill ${
                                  pct > 75 ? 'is-high' : 'is-normal'
                                }`}
                              />
                            </div>
                            <div className="win-drive-meta">
                              {t.db_file_name} • {sizeKb} KB SQLite WAL{' '}
                              {isMounted ? '• [ACTIVE DRIVE]' : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Windows Explorer "Folders" section */}
                <div className="win-section-group">
                  <div className="win-section-heading">
                    Coliseum Operational Folders ({filteredFolders.length})
                  </div>
                  <div className="win-folders-grid">
                    {filteredFolders.map((folder) => {
                      const count =
                        typeof folder.getCount === 'function'
                          ? folder.getCount(arenaState)
                          : null;
                      return (
                        <button
                          key={folder.id}
                          type="button"
                          className="win-folder-tile"
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          <div className="win-folder-icon-wrap">
                            <AppIconGlyph name={folder.icon} size={22} />
                          </div>
                          <div className="win-folder-text">
                            <div className="win-folder-name">{folder.label}</div>
                            <div className="win-folder-sub">
                              {folder.gateTag}
                              {count !== null ? ` • ${count} items` : ''}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Windows Explorer "Executables (.exe)" section */}
                <div className="win-section-group">
                  <div className="win-section-heading">
                    System Applications &amp; Executables (.exe) — Native Cockpit Binaries ({filteredFolders.length})
                  </div>
                  <div className="win-exe-table-wrap">
                    <div className="win-exe-table-header">
                      <span>Name</span>
                      <span>Type</span>
                      <span>Size</span>
                      <span>Security Gate</span>
                      <span>Execution Rights</span>
                    </div>
                    {filteredFolders.map((app) => {
                      const exeName = `${app.label.replace(/[^a-zA-Z0-9]/g, '')}.exe`;
                      const sizeMb = (2.2 + (app.id.length % 4) * 0.6).toFixed(1);
                      return (
                        <div
                          key={`exe-${app.id}`}
                          className="win-exe-row"
                          onClick={() => navigateToFolder(app.id)}
                          onDoubleClick={() => navigateToFolder(app.id)}
                          title={`Launch ${exeName}`}
                        >
                          <div className="win-exe-name-col">
                            <div className="win-exe-icon">
                              <AppIconGlyph name={app.icon} size={15} />
                            </div>
                            <span>{exeName}</span>
                          </div>
                          <span className="win-exe-type">Application (.exe)</span>
                          <span className="win-exe-size">{sizeMb} MB</span>
                          <div>
                            <span className="win-exe-badge">{app.gateTag}</span>
                          </div>
                          <div className="win-exe-actions">
                            <button
                              type="button"
                              className="btn-run-admin"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToFolder(app.id);
                                notifySuccess(
                                  'Elevated Rights Granted',
                                  `${exeName} launched with Gate 0 Administrator privileges.`
                                );
                              }}
                              title="Run as Arena Administrator"
                            >
                              Run as Admin
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <SubsystemWorkspace moduleId={activeModuleId} />
            )}
          </main>

          {/* Right Windows Explorer Details / Inspector Pane */}
          {showDetailsPane && (
            <aside className="win-details-pane">
              <div className="win-details-header">
                <AppIconGlyph name={currentApp.icon || 'Monitor'} size={28} />
                <div>
                  <div className="win-details-title">{currentApp.label}</div>
                  <div className="win-details-type">
                    System Folder • {currentApp.gateTag}
                  </div>
                </div>
              </div>

              <p className="win-details-desc">{currentApp.subtitle}</p>

              <div className="win-details-props">
                <div className="metric-row">
                  <span className="metric-label">Mounted Tenant DB</span>
                  <span className="metric-value is-emerald">
                    {activeTenant?.db_file_name || 'None'}
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Drive Partition</span>
                  <span className="metric-value">
                    {activeTenant?.tenant_code || 'N/A'}:
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Records in Folder</span>
                  <span className="metric-value">{currentItemCount}</span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">Active DB User</span>
                  <span className="metric-value">
                    {authenticatedOperator?.staff_code || 'EMP-01'}
                  </span>
                </div>
                <div className="metric-row">
                  <span className="metric-label">ARBAC Clearance</span>
                  <span className="metric-value is-gold">
                    {authenticatedOperator?.permissions_count || 23} / 23 Perms
                  </span>
                </div>
              </div>

              <div className="workspace-panel-title">Quick Navigation</div>
              <div className="form-stack">
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() => setViewMode('graph')}
                >
                  Inspect in Relationship Graph
                </button>
                <button
                  type="button"
                  className="btn-secondary-gold"
                  onClick={() => navigateToFolder('users-permissions')}
                >
                  Open ARBAC &amp; Tenant DB Manager
                </button>
              </div>
            </aside>
          )}
        </div>

        {/* 4. WINDOWS EXPLORER BOTTOM STATUS BAR */}
        <footer className="win-statusbar">
          <div className="win-status-left">
            <span>{currentItemCount} items</span>
            <span className="top-divider">|</span>
            <span>
              Mounted SQLite Drive:{' '}
              <strong>
                {activeTenant
                  ? `${activeTenant.tenant_code}:\\${activeTenant.db_file_name}`
                  : 'Unmounted'}
              </strong>
            </span>
            <span className="top-divider">|</span>
            <span>Isolation: Physical DB-per-Tenant (WAL)</span>
          </div>

          <div className="win-status-right">
            <span>
              Operator:{' '}
              <strong>
                {authenticatedOperator
                  ? `${authenticatedOperator.staff_code} (${authenticatedOperator.full_name})`
                  : 'Unbound'}
              </strong>
            </span>
          </div>
        </footer>
      </section>
    </div>
  );
}

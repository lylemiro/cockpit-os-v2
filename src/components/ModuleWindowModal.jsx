import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronLeft,
  ChevronsUpDown,
  Search,
  Minus,
  Maximize2,
  Minimize2,
  X,
  Plus,
  LayoutGrid,
  Network,
  PanelRight,
  PanelLeft,
  Monitor,
  CopyPlus
} from 'lucide-react';
import { DESKTOP_APPS } from './desktopAppsConfig.js';
import { AppIconGlyph } from './AppIconGlyph.jsx';
import { useArena } from '../context/ArenaContext.jsx';
import { SubsystemWorkspace } from '../modules/SubsystemWorkspace.jsx';
import { DatabaseRelationshipGraph } from './DatabaseRelationshipGraph.jsx';
import { ErrorAlert, LoadingState } from './CentralizedFeedbackStates.jsx';
import { ALL_PERMISSION_KEYS } from './arbacCatalog.js';

let windowSequence = 1;

function createNewWindowState(moduleId = 'this-pc', offsetCount = 0) {
  const isClient = typeof window !== 'undefined';
  const defaultW = Math.min(1160, isClient ? Math.max(760, window.innerWidth - 80) : 1160);
  const defaultH = Math.min(730, isClient ? Math.max(480, window.innerHeight - 150) : 730);
  const baseStartX = isClient ? Math.max(20, Math.floor((window.innerWidth - defaultW) / 2)) : 40;
  const baseStartY = isClient ? Math.max(52, Math.floor((window.innerHeight - 54 - defaultH) / 2)) : 54;

  const offset = (offsetCount % 6) * 32;
  const x = isClient ? Math.max(10, Math.min(window.innerWidth - defaultW - 20, baseStartX + offset)) : 40;
  const y = isClient ? Math.max(48, Math.min(window.innerHeight - defaultH - 60, baseStartY + offset)) : 54;

  const initialTab = moduleId || 'this-pc';
  const openTabs = initialTab === 'this-pc' ? ['this-pc'] : ['this-pc', initialTab];

  return {
    id: `win_${Date.now()}_${windowSequence++}`,
    activeModuleId: initialTab,
    openTabs,
    history: [initialTab],
    historyIndex: initialTab === 'this-pc' ? 0 : 1,
    viewMode: initialTab === 'this-pc' ? 'this-pc' : 'workspace',
    isMaximized: false,
    isMinimized: false,
    isSidebarCollapsed: false,
    expandedSections: {
      quickAccess: true,
      drives: true,
      folders: true
    },
    explorerSearch: '',
    showDetailsPane: false,
    windowPos: { x, y, width: defaultW, height: defaultH },
    zIndex: 100 + offsetCount
  };
}

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

  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);

  // Sync activeModuleId from Desktop / Taskbar into Windows
  useEffect(() => {
    if (!activeModuleId) return;

    setWindows((prev) => {
      // 1. If an existing window already has this module active or open, restore and focus it
      const existingWin = prev.find(
        (w) => w.activeModuleId === activeModuleId || w.openTabs.includes(activeModuleId)
      );

      if (existingWin) {
        const highestZ = Math.max(100, ...prev.map((w) => w.zIndex || 100));
        return prev.map((w) => {
          if (w.id === existingWin.id) {
            return {
              ...w,
              activeModuleId,
              isMinimized: false,
              zIndex: highestZ + 1,
              viewMode: activeModuleId === 'this-pc' ? 'this-pc' : 'workspace',
              openTabs: w.openTabs.includes(activeModuleId)
                ? w.openTabs
                : [...w.openTabs, activeModuleId]
            };
          }
          return w;
        });
      }

      // 2. If there are existing open windows, open in the currently focused window
      if (prev.length > 0 && activeWindowId) {
        const highestZ = Math.max(100, ...prev.map((w) => w.zIndex || 100));
        return prev.map((w) => {
          if (w.id === activeWindowId) {
            const nextTabs = w.openTabs.includes(activeModuleId)
              ? w.openTabs
              : [...w.openTabs, activeModuleId];
            const nextHistory = [...w.history.slice(0, w.historyIndex + 1), activeModuleId];
            return {
              ...w,
              activeModuleId,
              isMinimized: false,
              zIndex: highestZ + 1,
              openTabs: nextTabs,
              history: nextHistory,
              historyIndex: nextHistory.length - 1,
              viewMode: activeModuleId === 'this-pc' ? 'this-pc' : 'workspace'
            };
          }
          return w;
        });
      }

      // 3. Otherwise create a new window
      const newWin = createNewWindowState(activeModuleId, prev.length);
      setActiveWindowId(newWin.id);
      return [...prev, newWin];
    });
  }, [activeModuleId]);

  // Bring a window to the front
  const bringToFront = useCallback(
    (winId) => {
      setWindows((prev) => {
        const highestZ = Math.max(100, ...prev.map((w) => w.zIndex || 100));
        return prev.map((w) => {
          if (w.id === winId) {
            return { ...w, zIndex: highestZ + 1, isMinimized: false };
          }
          return w;
        });
      });
      setActiveWindowId(winId);

      // Keep taskbar in sync with the newly focused window's module
      const targetWin = windows.find((w) => w.id === winId);
      if (targetWin && targetWin.activeModuleId && targetWin.activeModuleId !== activeModuleId) {
        setActiveModuleId(targetWin.activeModuleId);
      }
    },
    [windows, activeModuleId, setActiveModuleId]
  );

  // Spawn a new independent explorer window
  const createNewWindow = useCallback(
    (initialModuleId = 'this-pc') => {
      setWindows((prev) => {
        const highestZ = Math.max(100, ...prev.map((w) => w.zIndex || 100));
        const newWin = createNewWindowState(initialModuleId, prev.length);
        newWin.zIndex = highestZ + 1;
        setActiveWindowId(newWin.id);
        setActiveModuleId(newWin.activeModuleId);
        return [...prev, newWin];
      });
    },
    [setActiveModuleId]
  );

  // Close a specific window
  const closeWindow = useCallback(
    (winId) => {
      setWindows((prev) => {
        const remaining = prev.filter((w) => w.id !== winId);
        if (remaining.length === 0) {
          setActiveWindowId(null);
          setActiveModuleId(null);
        } else {
          // Focus the topmost remaining window
          const sorted = [...remaining].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
          const nextActive = sorted[0];
          setActiveWindowId(nextActive.id);
          setActiveModuleId(nextActive.activeModuleId);
        }
        return remaining;
      });
    },
    [setActiveModuleId]
  );

  // Minimize a specific window
  const minimizeWindow = useCallback(
    (winId) => {
      setWindows((prev) => {
        const next = prev.map((w) => (w.id === winId ? { ...w, isMinimized: true } : w));
        const visible = next.filter((w) => !w.isMinimized);
        if (visible.length === 0) {
          setActiveModuleId(null);
          setActiveWindowId(null);
        } else {
          const sorted = [...visible].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
          setActiveWindowId(sorted[0].id);
          setActiveModuleId(sorted[0].activeModuleId);
        }
        return next;
      });
    },
    [setActiveModuleId]
  );

  // Toggle maximize for a window
  const toggleMaximizeWindow = useCallback((winId) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === winId ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  }, []);

  // Update specific fields of a window
  const updateWindow = useCallback((winId, updater) => {
    setWindows((prev) =>
      prev.map((w) => {
        if (w.id === winId) {
          return typeof updater === 'function' ? updater(w) : { ...w, ...updater };
        }
        return w;
      })
    );
  }, []);

  // Render nothing if no windows exist
  if (windows.length === 0) return null;

  return (
    <div className="modal-backdrop">
      {windows.map((win) => {
        if (win.isMinimized) return null;

        return (
          <ExplorerWindow
            key={win.id}
            win={win}
            isActiveWindow={win.id === activeWindowId}
            onFocus={() => bringToFront(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onToggleMaximize={() => toggleMaximizeWindow(win.id)}
            onNewWindow={() => createNewWindow(win.activeModuleId)}
            onUpdate={(updater) => updateWindow(win.id, updater)}
            arenaState={arenaState}
            activeTenantId={activeTenantId}
            switchTenant={switchTenant}
            authenticatedOperator={authenticatedOperator}
            fetchState={fetchState}
            loading={loading}
            error={error}
            setError={setError}
            notifySuccess={notifySuccess}
            setActiveModuleId={setActiveModuleId}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// Single Independent Explorer Window Component
// ============================================================================
function ExplorerWindow({
  win,
  isActiveWindow,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onNewWindow,
  onUpdate,
  arenaState,
  activeTenantId,
  switchTenant,
  authenticatedOperator,
  fetchState,
  loading,
  error,
  setError,
  notifySuccess,
  setActiveModuleId
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const {
    id,
    activeModuleId,
    openTabs,
    history,
    historyIndex,
    viewMode,
    isMaximized,
    isSidebarCollapsed,
    expandedSections,
    explorerSearch,
    showDetailsPane,
    windowPos,
    zIndex
  } = win;

  // Window drag handler
  const handleTitlebarPointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('button, input, a, .win-tab-item, .win-new-tab-btn, .win-caption-controls, .win-new-win-title-btn')) {
      return;
    }

    onFocus();
    e.preventDefault();
    setIsDragging(true);

    let startMouseX = e.clientX;
    let startMouseY = e.clientY;
    let startPos = { ...windowPos };

    if (isMaximized) {
      onToggleMaximize();
      const restoredWidth = startPos.width || 1140;
      const restoredX = Math.max(10, Math.min(window.innerWidth - restoredWidth - 10, e.clientX - restoredWidth / 2));
      const restoredY = 52;
      startPos = { ...startPos, x: restoredX, y: restoredY };
      onUpdate({ windowPos: startPos });
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    }

    const onPointerMove = (moveEv) => {
      const deltaX = moveEv.clientX - startMouseX;
      const deltaY = moveEv.clientY - startMouseY;

      const clampedX = Math.max(-startPos.width + 160, Math.min(window.innerWidth - 160, startPos.x + deltaX));
      const clampedY = Math.max(46, Math.min(window.innerHeight - 94, startPos.y + deltaY));

      onUpdate((w) => ({
        ...w,
        windowPos: {
          ...w.windowPos,
          x: clampedX,
          y: clampedY
        }
      }));
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleTitlebarDoubleClick = (e) => {
    if (e.target.closest('button, input, a, .win-tab-item, .win-new-tab-btn, .win-caption-controls, .win-new-win-title-btn')) {
      return;
    }
    onToggleMaximize();
  };

  // 8-directional Resizing logic
  const handleResizePointerDown = (e, dir) => {
    if (isMaximized) return;
    onFocus();
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const initial = { ...windowPos };

    const onPointerMove = (moveEv) => {
      const deltaX = moveEv.clientX - startMouseX;
      const deltaY = moveEv.clientY - startMouseY;

      let nextX = initial.x;
      let nextY = initial.y;
      let nextW = initial.width;
      let nextH = initial.height;

      const minW = 680;
      const minH = 440;
      const maxW = window.innerWidth - 20;
      const maxH = window.innerHeight - 105;

      if (dir.includes('e')) {
        nextW = Math.max(minW, Math.min(maxW - initial.x, initial.width + deltaX));
      }
      if (dir.includes('s')) {
        nextH = Math.max(minH, Math.min(maxH - initial.y, initial.height + deltaY));
      }
      if (dir.includes('w')) {
        const potentialW = initial.width - deltaX;
        if (potentialW >= minW) {
          nextX = initial.x + deltaX;
          nextW = potentialW;
        } else {
          nextX = initial.x + (initial.width - minW);
          nextW = minW;
        }
      }
      if (dir.includes('n')) {
        const potentialH = initial.height - deltaY;
        if (potentialH >= minH && initial.y + deltaY >= 46) {
          nextY = initial.y + deltaY;
          nextH = potentialH;
        } else if (potentialH < minH) {
          nextY = initial.y + (initial.height - minH);
          nextH = minH;
        }
      }

      onUpdate((w) => ({
        ...w,
        windowPos: {
          x: nextX,
          y: nextY,
          width: nextW,
          height: nextH
        }
      }));
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Folder navigation within this window
  const navigateToFolder = (folderId) => {
    setError(null);
    onFocus();

    const targetViewMode = folderId === 'this-pc' ? 'this-pc' : 'workspace';
    const nextTabs = openTabs.includes(folderId) ? openTabs : [...openTabs, folderId];
    const sliced = history.slice(0, historyIndex + 1);
    const nextHistory = sliced[sliced.length - 1] === folderId ? sliced : [...sliced, folderId];

    onUpdate({
      activeModuleId: folderId,
      viewMode: targetViewMode,
      openTabs: nextTabs,
      history: nextHistory,
      historyIndex: nextHistory.length - 1
    });

    setActiveModuleId(folderId);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevId = history[historyIndex - 1];
      onUpdate({
        activeModuleId: prevId,
        historyIndex: historyIndex - 1,
        viewMode: prevId === 'this-pc' ? 'this-pc' : 'workspace'
      });
      setActiveModuleId(prevId);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextId = history[historyIndex + 1];
      onUpdate({
        activeModuleId: nextId,
        historyIndex: historyIndex + 1,
        viewMode: nextId === 'this-pc' ? 'this-pc' : 'workspace'
      });
      setActiveModuleId(nextId);
    }
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    const remaining = openTabs.filter((id) => id !== tabId);
    if (activeModuleId === tabId) {
      const nextActive = remaining.length > 0 ? remaining[remaining.length - 1] : 'this-pc';
      onUpdate({
        openTabs: remaining.length > 0 ? remaining : ['this-pc'],
        activeModuleId: nextActive,
        viewMode: nextActive === 'this-pc' ? 'this-pc' : 'workspace'
      });
      setActiveModuleId(nextActive);
    } else {
      onUpdate({ openTabs: remaining });
    }
  };

  // Section toggle inside sidebar (Vertical collapse)
  const toggleSection = (key) => {
    onUpdate((w) => ({
      ...w,
      expandedSections: {
        ...w.expandedSections,
        [key]: !w.expandedSections[key]
      }
    }));
  };

  // Toggle all sections vertically (Fold All / Unfold All)
  const areAllSectionsExpanded =
    expandedSections.quickAccess && expandedSections.drives && expandedSections.folders;

  const toggleAllSectionsVertically = () => {
    const nextState = !areAllSectionsExpanded;
    onUpdate((w) => ({
      ...w,
      expandedSections: {
        quickAccess: nextState,
        drives: nextState,
        folders: nextState
      }
    }));
  };

  // Toggle entire sidebar navigation horizontally
  const toggleSidebarCollapse = () => {
    onUpdate((w) => ({
      ...w,
      isSidebarCollapsed: !w.isSidebarCollapsed
    }));
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
    <section
      className={`win-explorer-window ${isActiveWindow ? 'is-active-window' : ''} ${
        isMaximized ? 'is-maximized' : ''
      } ${isDragging ? 'is-dragging' : ''} ${isResizing ? 'is-resizing' : ''}`}
      role="dialog"
      aria-modal="true"
      onPointerDown={onFocus}
      style={
        isMaximized
          ? { zIndex }
          : {
              left: `${windowPos.x}px`,
              top: `${windowPos.y}px`,
              width: `${windowPos.width}px`,
              height: `${windowPos.height}px`,
              zIndex
            }
      }
    >
      {/* 8-Directional Resize Handles */}
      {!isMaximized && (
        <>
          <div className="win-resize-handle is-n" onPointerDown={(e) => handleResizePointerDown(e, 'n')} />
          <div className="win-resize-handle is-s" onPointerDown={(e) => handleResizePointerDown(e, 's')} />
          <div className="win-resize-handle is-e" onPointerDown={(e) => handleResizePointerDown(e, 'e')} />
          <div className="win-resize-handle is-w" onPointerDown={(e) => handleResizePointerDown(e, 'w')} />
          <div className="win-resize-handle is-ne" onPointerDown={(e) => handleResizePointerDown(e, 'ne')} />
          <div className="win-resize-handle is-nw" onPointerDown={(e) => handleResizePointerDown(e, 'nw')} />
          <div className="win-resize-handle is-se" onPointerDown={(e) => handleResizePointerDown(e, 'se')} />
          <div className="win-resize-handle is-sw" onPointerDown={(e) => handleResizePointerDown(e, 'sw')} />
        </>
      )}

      {/* 1. WINDOWS 11 EXPLORER TABBED TITLE BAR */}
      <header
        className="win-titlebar"
        onPointerDown={handleTitlebarPointerDown}
        onDoubleClick={handleTitlebarDoubleClick}
      >
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
            title="Open New Tab (This Arena PC)"
            onClick={() => navigateToFolder('this-pc')}
          >
            <Plus size={14} />
          </button>

          <button
            type="button"
            className="win-new-win-title-btn"
            title="Open in New Explorer Window"
            onClick={onNewWindow}
          >
            <CopyPlus size={13} />
          </button>
        </div>

        <div className="win-caption-controls">
          <button
            type="button"
            className="win-caption-btn"
            title="Minimize Window"
            onClick={onMinimize}
          >
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="win-caption-btn"
            title={isMaximized ? 'Restore Window' : 'Maximize Window'}
            onClick={onToggleMaximize}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button
            type="button"
            className="win-caption-btn is-close"
            title="Close Window"
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>
      </header>

      {/* 2. EXPLORER COMMAND BAR & BREADCRUMB ADDRESS BAR */}
      <div className="win-command-bar">
        <div className="win-nav-buttons">
          <button
            type="button"
            className={`win-nav-btn ${!isSidebarCollapsed ? 'is-active' : ''}`}
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? 'Show Navigation Pane' : 'Hide Navigation Pane'}
          >
            <PanelLeft size={15} />
          </button>
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
            onClick={() => navigateToFolder('this-pc')}
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
            onChange={(e) => onUpdate({ explorerSearch: e.target.value })}
          />
        </div>

        {/* Explorer View Switchers & New Window Action */}
        <div className="win-view-toggles">
          <button
            type="button"
            className="win-new-win-btn"
            onClick={onNewWindow}
            title="Open Multiple Explorer Windows side-by-side"
          >
            <CopyPlus size={13} />
            <span>New Window</span>
          </button>

          <button
            type="button"
            className={`win-view-btn ${viewMode === 'this-pc' ? 'is-active' : ''}`}
            onClick={() => onUpdate({ viewMode: 'this-pc' })}
            title="This Arena PC (Drives & Folders View)"
          >
            <LayoutGrid size={14} />
            <span>Drives</span>
          </button>
          <button
            type="button"
            className={`win-view-btn ${viewMode === 'workspace' ? 'is-active' : ''}`}
            onClick={() => onUpdate({ viewMode: 'workspace' })}
            title="Operational Workspace View"
          >
            <FolderOpen size={14} />
            <span>Workspace</span>
          </button>
          <button
            type="button"
            className={`win-view-btn ${viewMode === 'graph' ? 'is-active' : ''}`}
            onClick={() => onUpdate({ viewMode: 'graph' })}
            title="Database Relationship Graph (Obsidian View)"
          >
            <Network size={14} />
            <span>DB Graph</span>
          </button>
          <button
            type="button"
            className={`win-view-btn ${showDetailsPane ? 'is-active' : ''}`}
            onClick={() => onUpdate({ showDetailsPane: !showDetailsPane })}
            title="Toggle Right Details Pane"
          >
            <PanelRight size={14} />
          </button>
        </div>
      </div>

      {/* 3. WINDOWS EXPLORER 3-PANE BODY (LEFT TREE | CENTER CONTENT | RIGHT DETAILS) */}
      <div
        className={`win-explorer-body ${isSidebarCollapsed ? 'is-sidebar-collapsed' : ''} ${
          showDetailsPane ? 'has-details-pane' : ''
        }`}
      >
        {/* Floating Expand Rail button when the entire side nav is collapsed */}
        {isSidebarCollapsed && (
          <button
            type="button"
            className="win-sidebar-expand-rail"
            onClick={toggleSidebarCollapse}
            title="Expand Navigation Pane"
          >
            <PanelLeft size={13} />
            <span>Show Navigation</span>
            <ChevronRight size={12} />
          </button>
        )}

        {/* Left Navigation Tree Pane */}
        <aside className="win-tree-pane">
          {/* Header row with Vertical Fold/Unfold All & Horizontal Collapse Pane */}
          <div className="win-tree-pane-top-row">
            <span className="win-tree-header-title">Navigation</span>
            <div className="win-tree-top-actions">
              <button
                type="button"
                className="win-tree-header-btn"
                onClick={toggleAllSectionsVertically}
                title={areAllSectionsExpanded ? 'Fold All Sections Vertically' : 'Unfold All Sections Vertically'}
              >
                <ChevronsUpDown size={12} />
                <span>{areAllSectionsExpanded ? 'Fold All' : 'Unfold All'}</span>
              </button>
              <button
                type="button"
                className="win-tree-header-btn"
                onClick={toggleSidebarCollapse}
                title="Collapse Navigation Pane Horizontally"
              >
                <ChevronLeft size={13} />
              </button>
            </div>
          </div>

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

          {/* Section C: Coliseum Subsystem Folders */}
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
                  {authenticatedOperator?.permissions_count || ALL_PERMISSION_KEYS.length} / {ALL_PERMISSION_KEYS.length} Perms
                </span>
              </div>
            </div>

            <div className="workspace-panel-title">Quick Navigation</div>
            <div className="form-stack">
              <button
                type="button"
                className="btn-secondary-gold"
                onClick={() => onUpdate({ viewMode: 'graph' })}
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
  );
}

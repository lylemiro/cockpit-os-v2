import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { translateToFriendlyError } from '../utils/friendlyErrors.js';

const ArenaContext = createContext(null);

function readStorage(key, fallback = null) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? val : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore storage quota / privacy error
  }
}

export function ArenaProvider({ children }) {
  const [arenaState, setArenaState] = useState(null);

  const [activeTenantId, setActiveTenantId] = useState(() =>
    readStorage('cockpit_active_tenant_id', null)
  );

  const [bootCompleted, setBootCompletedState] = useState(
    () => readStorage('cockpit_boot_completed', 'false') === 'true'
  );

  const [authenticatedOperator, setAuthenticatedOperatorState] = useState(() => {
    const raw = readStorage('cockpit_auth_operator', null);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const [activeModuleId, setActiveModuleIdState] = useState(() =>
    readStorage('cockpit_active_module_id', null)
  );

  const authOpRef = useRef(authenticatedOperator);
  useEffect(() => {
    authOpRef.current = authenticatedOperator;
  }, [authenticatedOperator]);

  const [theme, setTheme] = useState(() => readStorage('cockpit_theme', 'dark'));
  const [wallpaper, setWallpaperState] = useState(() => {
    const saved = readStorage('cockpit_wallpaper', null);
    if (!saved || saved === 'wallpaper_v2' || saved === 'default') {
      return 'luxury_wavy';
    }
    return saved;
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    ({ type = 'info', title, message, tip = null, durationMs = 4500 }) => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newToast = { id, type, title, message, tip, timestamp: Date.now() };
      setToasts((prev) => [...prev.slice(-4), newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
      return id;
    },
    [dismissToast]
  );

  const notifySuccess = useCallback(
    (title, message, tip = null) =>
      notify({ type: 'success', title, message, tip, durationMs: 4000 }),
    [notify]
  );

  const notifyWarning = useCallback(
    (title, message, tip = null) =>
      notify({ type: 'warning', title, message, tip, durationMs: 5500 }),
    [notify]
  );

  const notifyInfo = useCallback(
    (title, message, tip = null) =>
      notify({ type: 'info', title, message, tip, durationMs: 4500 }),
    [notify]
  );

  const notifyError = useCallback(
    (rawError, customMessage = null) => {
      const friendly = translateToFriendlyError(rawError);
      return notify({
        type: 'error',
        title: friendly.title,
        message: customMessage || friendly.message,
        tip: friendly.tip,
        durationMs: 6500
      });
    },
    [notify]
  );

  const setBootCompleted = useCallback((val) => {
    setBootCompletedState(Boolean(val));
    writeStorage('cockpit_boot_completed', val ? 'true' : null);
  }, []);

  const setAuthenticatedOperator = useCallback((op) => {
    setAuthenticatedOperatorState(op || null);
    writeStorage('cockpit_auth_operator', op ? JSON.stringify(op) : null);
  }, []);

  const setActiveModuleId = useCallback((modId) => {
    setActiveModuleIdState(modId || null);
    writeStorage('cockpit_active_module_id', modId || null);
  }, []);

  const fetchState = useCallback(
    async (showSkeleton = false, overrideTenantId = undefined) => {
      if (showSkeleton) setLoading(true);
      const targetTenant =
        overrideTenantId !== undefined ? overrideTenantId : activeTenantId;
      try {
        const headers = {};
        if (targetTenant) headers['X-Tenant-Id'] = targetTenant;
        const response = await fetch('/api/state', { headers });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Unable to load arena state`);
        }
        const data = await response.json();
        setArenaState(data);

        if (data.activeTenantId && data.activeTenantId !== activeTenantId) {
          setActiveTenantId(data.activeTenantId);
          writeStorage('cockpit_active_tenant_id', data.activeTenantId);
        }

        // If no tenants exist in DB at all (fresh wipe), clear stale operator session
        if (Array.isArray(data.tenants) && data.tenants.length === 0) {
          setAuthenticatedOperator(null);
        } else {
          const currentOp = authOpRef.current;
          if (currentOp && Array.isArray(data.employees)) {
            // Sync live ARBAC permission count if current operator was edited
            const updatedOp = data.employees.find(
              (e) =>
                (e.staff_code && e.staff_code === currentOp.staff_code) ||
                (e.employee_id && e.employee_id === currentOp.employee_id)
            );
            if (
              updatedOp &&
              Number(updatedOp.permissions_count ?? updatedOp.permissions?.length ?? 0) !==
                Number(currentOp.permissions_count ?? currentOp.permissions?.length ?? 0)
            ) {
              setAuthenticatedOperator({
                ...currentOp,
                full_name: updatedOp.full_name,
                role: updatedOp.role,
                zone: updatedOp.zone,
                permissions: updatedOp.permissions,
                permissions_count: updatedOp.permissions_count
              });
            }
          }
        }

        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to connect to local arena server');
      } finally {
        setLoading(false);
      }
    },
    [activeTenantId, setAuthenticatedOperator]
  );

  useEffect(() => {
    fetchState(true);

    let ws;
    let reconnectTimer;

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          if (packet.event === 'LIVE_SYNC' && packet.state) {
            setArenaState((prev) => {
              if (
                !prev?.activeTenantId ||
                !packet.tenantId ||
                packet.tenantId === prev.activeTenantId
              ) {
                return packet.state;
              }
              return prev;
            });
          } else if (packet.event === 'TELEMETRY_HEARTBEAT') {
            setArenaState((prev) =>
              prev
                ? {
                    ...prev,
                    systemMetrics: packet.systemMetrics || prev.systemMetrics
                  }
                : prev
            );
          }
        } catch {
          // Ignore malformed WS message
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimer = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, [activeTenantId]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    writeStorage('cockpit_theme', theme);
  }, [theme]);

  const switchTenant = useCallback(
    async (nextTenantId) => {
      setActiveTenantId(nextTenantId);
      writeStorage('cockpit_active_tenant_id', nextTenantId || null);
      await fetchState(true, nextTenantId);
    },
    [fetchState]
  );

  const mutateApi = useCallback(
    async (endpoint, method = 'POST', payload = {}, options = {}) => {
      setSubmitting(true);
      setError(null);
      const startTime = Date.now();
      const minSaveMs =
        options.minSaveMs !== undefined
          ? options.minSaveMs
          : endpoint === '/api/auth/logout'
          ? 0
          : 2000;

      const waitRemainingSaveDelay = async () => {
        if (minSaveMs <= 0) return;
        const elapsed = Date.now() - startTime;
        if (elapsed < minSaveMs) {
          await new Promise((resolve) => setTimeout(resolve, minSaveMs - elapsed));
        }
      };

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (activeTenantId) headers['X-Tenant-Id'] = activeTenantId;

        const res = await fetch(endpoint, {
          method,
          headers,
          body: method === 'GET' ? undefined : JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Request failed (${res.status})`);
        }

        await waitRemainingSaveDelay();

        if (data.state) {
          setArenaState(data.state);
          if (data.state.activeTenantId) {
            setActiveTenantId(data.state.activeTenantId);
            writeStorage('cockpit_active_tenant_id', data.state.activeTenantId);
          }
        }
        if (!options.silentSuccess) {
          notifySuccess(
            options.successTitle || 'Saved Successfully',
            options.successMessage ||
              data.message ||
              'Operation committed and logged to activity log.'
          );
        }
        return { ok: true, data };
      } catch (err) {
        await waitRemainingSaveDelay();
        const friendly = translateToFriendlyError(err);
        setError(friendly);
        if (!options.silentError) {
          notifyError(err);
        }
        return { ok: false, error: friendly.message, friendly };
      } finally {
        setSubmitting(false);
      }
    },
    [activeTenantId, notifySuccess, notifyError]
  );

  const lockSession = useCallback(async () => {
    if (authenticatedOperator) {
      await mutateApi('/api/auth/logout', 'POST', {
        operator_name: `${authenticatedOperator.staff_code} (${authenticatedOperator.full_name})`
      });
    }
    setAuthenticatedOperator(null);
    setActiveModuleId(null);
  }, [authenticatedOperator, mutateApi, setAuthenticatedOperator, setActiveModuleId]);

  const rebootSystem = useCallback(() => {
    setAuthenticatedOperator(null);
    setActiveModuleId(null);
    setBootCompleted(false);
  }, [setAuthenticatedOperator, setActiveModuleId, setBootCompleted]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const setWallpaper = useCallback((val) => {
    setWallpaperState(val);
    writeStorage('cockpit_wallpaper', val);
  }, []);

  const cycleWallpaper = useCallback(() => {
    const sequence = ['luxury_wavy', 'wallpaper_v2', 'wallpaper_v3'];
    setWallpaperState((prev) => {
      const nextIdx = (sequence.indexOf(prev) + 1) % sequence.length;
      const nextWp = sequence[nextIdx];
      writeStorage('cockpit_wallpaper', nextWp);
      notifySuccess(
        'Wallpaper Changed',
        `Switched to ${nextWp.replace('_', ' ').toUpperCase()}`
      );
      return nextWp;
    });
  }, [notifySuccess]);

  return (
    <ArenaContext.Provider
      value={{
        arenaState,
        activeTenantId,
        switchTenant,
        bootCompleted,
        setBootCompleted,
        authenticatedOperator,
        setAuthenticatedOperator,
        lockSession,
        rebootSystem,
        loading,
        submitting,
        error,
        setError,
        toasts,
        notify,
        notifySuccess,
        notifyWarning,
        notifyInfo,
        notifyError,
        dismissToast,
        wsConnected,
        activeModuleId,
        setActiveModuleId,
        fetchState,
        mutateApi,
        theme,
        toggleTheme,
        wallpaper,
        setWallpaper,
        cycleWallpaper,
        soundEnabled,
        toggleSound
      }}
    >
      {children}
    </ArenaContext.Provider>
  );
}

export function useArena() {
  const ctx = useContext(ArenaContext);
  if (!ctx) throw new Error('useArena must be used within an ArenaProvider');
  return ctx;
}

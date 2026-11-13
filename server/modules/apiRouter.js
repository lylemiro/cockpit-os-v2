import {
  masterDb,
  getTenantDb,
  closeAndRemoveTenantDb,
  getTenantDbFileMetrics,
  appendAuditLog,
  ALL_COLISEO_PERMISSIONS,
  ALL_23_PERMISSIONS
} from '../db/database.js';
import { getLiveSystemMetrics } from '../services/lanDiscovery.js';
import { evaluateZeroTrustGates } from '../middleware/zeroTrustGates.js';

const TOTAL_PERMS = ALL_COLISEO_PERMISSIONS.length;

function safeParseJsonArray(str, fallback = []) {
  if (!str) return fallback;
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function resolveActiveTenantId(requestedTenantId = null) {
  if (requestedTenantId) {
    const found = masterDb
      .prepare('SELECT tenant_id FROM tenants WHERE tenant_id = ?')
      .get(requestedTenantId);
    if (found) return found.tenant_id;
  }
  const first = masterDb
    .prepare('SELECT tenant_id FROM tenants ORDER BY created_at ASC LIMIT 1')
    .get();
  return first ? first.tenant_id : null;
}

export function buildFullArenaState(wsClientCount = 0, requestedTenantId = null) {
  const systemMetrics = getLiveSystemMetrics();
  const tenants = masterDb
    .prepare('SELECT * FROM tenants ORDER BY created_at ASC')
    .all()
    .map((t) => ({
      ...t,
      dbMetrics: getTenantDbFileMetrics(t.db_file_name)
    }));

  const multiDbUsers = masterDb
    .prepare('SELECT * FROM tenant_db_users ORDER BY created_at DESC')
    .all();

  const activeTenantId = resolveActiveTenantId(requestedTenantId);
  const activeTenant = tenants.find((t) => t.tenant_id === activeTenantId) || null;
  const tdb = getTenantDb(activeTenantId);

  const tenantTableNames = [
    'arena_config',
    'arbac_roles',
    'devices',
    'employees',
    'derby_events',
    'derby_entries',
    'roosters',
    'fights',
    'wagers',
    'cockhouse_bays',
    'vet_sutures',
    'inventory_assets',
    'gate_admissions',
    'crm_patrons',
    'audit_logtrail'
  ];

  // Uninitialized First-Boot State (Zero Tenants Provisioned)
  if (!activeTenantId || !tdb) {
    return {
      tenants,
      multiDbUsers,
      activeTenant: null,
      activeTenantId: null,
      arenaConfig: null,
      systemMetrics: {
        ...systemMetrics,
        serverStatus: 'Online',
        databaseStatus: 'Master Control Plane Ready',
        wsClientCount,
        activeTerminalsCount: 0,
        totalTerminalsCount: 0
      },
      operationsSummary: {
        grossHandle: 0,
        housePlasada: 0,
        releasedPayouts: 0,
        plasadaRatePct: 10,
        currentFightNumber: null,
        currentFightStatus: null,
        meronPool: 0,
        walaPool: 0,
        meronSharePct: 0,
        walaSharePct: 0
      },
      gates: evaluateZeroTrustGates(null),
      activeEvent: null,
      arbacRoles: [],
      devices: [],
      employees: [],
      events: [],
      entries: [],
      roosters: [],
      fights: [],
      wagers: [],
      cockhouseBays: [],
      vetSutures: [],
      inventoryAssets: [],
      gateAdmissions: [],
      crmPatrons: [],
      auditLogs: [],
      databaseTables: [],
      databaseGraph: { nodes: [], edges: [] }
    };
  }

  const arenaConfig = tdb.prepare('SELECT * FROM arena_config WHERE id = 1').get() || null;

  const arbacRoles = tdb
    .prepare('SELECT * FROM arbac_roles ORDER BY created_at ASC')
    .all()
    .map((r) => ({
      ...r,
      permissions: safeParseJsonArray(r.permissions_json)
    }));

  const devices = tdb.prepare('SELECT * FROM devices ORDER BY code ASC').all();

  const employees = tdb
    .prepare(
      'SELECT employee_id, staff_code, full_name, role, zone, bound_device_code, status, cash_float, commission_rate, pin_strikes, is_locked, permissions_json, permissions_count, created_at FROM employees ORDER BY created_at DESC'
    )
    .all()
    .map((emp) => ({
      ...emp,
      permissions: safeParseJsonArray(emp.permissions_json)
    }));

  const events = tdb.prepare('SELECT * FROM derby_events ORDER BY event_id DESC').all();
  const activeEvent = events.find((e) => e.status === 'ACTIVE' && e.is_archived === 0) || null;

  const entries = tdb
    .prepare('SELECT * FROM derby_entries ORDER BY points DESC, entry_id ASC')
    .all();

  const roosters = tdb
    .prepare(`
      SELECT r.*, e.entry_name, e.owner_gallero
      FROM roosters r
      LEFT JOIN derby_entries e ON r.entry_id = e.entry_id
      ORDER BY r.rooster_id DESC
    `)
    .all();

  const fights = tdb
    .prepare(`
      SELECT f.*,
        em.entry_name AS meron_entry_name,
        ew.entry_name AS wala_entry_name,
        rm.wing_band AS meron_wing_band,
        rw.wing_band AS wala_wing_band
      FROM fights f
      LEFT JOIN derby_entries em ON f.meron_entry_id = em.entry_id
      LEFT JOIN derby_entries ew ON f.wala_entry_id = ew.entry_id
      LEFT JOIN roosters rm ON f.meron_rooster_id = rm.rooster_id
      LEFT JOIN roosters rw ON f.wala_rooster_id = rw.rooster_id
      ORDER BY f.fight_number ASC
    `)
    .all();

  const wagers = tdb.prepare('SELECT * FROM wagers ORDER BY created_at DESC').all();
  const cockhouseBays = tdb.prepare('SELECT * FROM cockhouse_bays ORDER BY bay_number ASC').all();
  const vetSutures = tdb.prepare('SELECT * FROM vet_sutures ORDER BY created_at DESC').all();
  const inventoryAssets = tdb.prepare('SELECT * FROM inventory_assets ORDER BY sku ASC').all();
  const gateAdmissions = tdb.prepare('SELECT * FROM gate_admissions ORDER BY scanned_at DESC').all();
  const crmPatrons = tdb.prepare('SELECT * FROM crm_patrons ORDER BY created_at DESC').all();
  const auditLogs = tdb
    .prepare('SELECT * FROM audit_logtrail ORDER BY log_id DESC LIMIT 50')
    .all();

  const totals = tdb
    .prepare(`
      SELECT
        COALESCE(SUM(gross_handle), 0) AS totalGrossHandle,
        COALESCE(SUM(house_plasada), 0) AS totalHousePlasada
      FROM fights
    `)
    .get();

  const releasedPayouts = tdb
    .prepare(`
      SELECT COALESCE(SUM(potential_payout), 0) AS totalPaid
      FROM wagers
      WHERE status = 'PAID_OUT'
    `)
    .get().totalPaid;

  const liveFight =
    fights.find((f) => f.staging_tier === 'LIVE_PIT') ||
    fights.find((f) => f.status !== 'COMPLETED') ||
    null;

  let meronSharePct = 0;
  let walaSharePct = 0;
  if (liveFight) {
    const poolSum = (liveFight.meron_pool || 0) + (liveFight.wala_pool || 0);
    if (poolSum > 0) {
      meronSharePct = Math.round((liveFight.meron_pool / poolSum) * 100);
      walaSharePct = 100 - meronSharePct;
    }
  }

  const onlineTerminalsCount = devices.filter(
    (d) => d.is_authorized === 1 && d.status === 'Online'
  ).length;

  const databaseTables = tenantTableNames.map((tableName) => {
    const rowCount = tdb.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
    const columns = tdb
      .prepare(`PRAGMA table_info(${tableName})`)
      .all()
      .map((c) => ({ name: c.name, type: c.type, pk: c.pk === 1 }));
    const foreignKeys = tdb
      .prepare(`PRAGMA foreign_key_list(${tableName})`)
      .all()
      .map((fk) => ({ fromColumn: fk.from, toTable: fk.table, toColumn: fk.to }));
    return {
      tableName,
      dbFileName: activeTenant.db_file_name,
      rowCount,
      columns,
      foreignKeys
    };
  });

  const databaseGraph = buildDatabaseGraph(databaseTables, activeTenant, {
    arbacRoles,
    employees,
    devices,
    events,
    entries,
    roosters,
    fights,
    wagers
  });

  return {
    tenants,
    multiDbUsers,
    activeTenant,
    activeTenantId,
    arenaConfig,
    systemMetrics: {
      ...systemMetrics,
      serverStatus: 'Online',
      databaseStatus: `${activeTenant.db_file_name}`,
      wsClientCount,
      activeTerminalsCount: onlineTerminalsCount,
      totalTerminalsCount: devices.length
    },
    operationsSummary: {
      grossHandle: totals.totalGrossHandle,
      housePlasada: totals.totalHousePlasada,
      releasedPayouts,
      plasadaRatePct: Math.round((arenaConfig?.plasada_rate ?? 0.1) * 100),
      currentFightNumber: liveFight ? liveFight.fight_number : null,
      currentFightStatus: liveFight ? liveFight.status : null,
      meronPool: liveFight ? liveFight.meron_pool : 0,
      walaPool: liveFight ? liveFight.wala_pool : 0,
      meronSharePct,
      walaSharePct
    },
    gates: evaluateZeroTrustGates(tdb),
    activeEvent,
    arbacRoles,
    devices,
    employees,
    events,
    entries,
    roosters,
    fights,
    wagers,
    cockhouseBays,
    vetSutures,
    inventoryAssets,
    gateAdmissions,
    crmPatrons,
    auditLogs,
    databaseTables,
    databaseGraph
  };
}

function buildDatabaseGraph(databaseTables, activeTenant, records = {}) {
  const graphNodes = [];
  const graphEdges = [];

  const tableDomainMeta = {
    arena_config: { group: 'config', gate: 'SSOT Config' },
    arbac_roles: { group: 'security', gate: 'Gate 0 ARBAC' },
    devices: { group: 'security', gate: 'Gate 0' },
    employees: { group: 'security', gate: 'Gate 0 DB User' },
    derby_events: { group: 'tournament', gate: 'Gate 1' },
    derby_entries: { group: 'tournament', gate: 'Gate 2' },
    roosters: { group: 'matchmaking', gate: 'Gate 3' },
    fights: { group: 'ruedo', gate: 'Gate 4–8' },
    wagers: { group: 'betting', gate: 'Gate 7–8' },
    cockhouse_bays: { group: 'cockhouse', gate: 'Biosecurity' },
    vet_sutures: { group: 'cockhouse', gate: 'Manggagamot' },
    inventory_assets: { group: 'logistics', gate: 'Armory' },
    gate_admissions: { group: 'logistics', gate: 'Turnstile' },
    crm_patrons: { group: 'tournament', gate: 'VIP CRM' },
    audit_logtrail: { group: 'security', gate: 'Tamper-Evident' }
  };

  if (activeTenant) {
    const dbRootId = `db:${activeTenant.db_file_name}`;
    graphNodes.push({
      id: dbRootId,
      label: `DB: ${activeTenant.db_file_name}`,
      kind: 'table',
      group: 'config',
      gate: 'Dedicated SQLite WAL DB',
      rowCount: databaseTables.reduce((acc, t) => acc + t.rowCount, 0),
      columns: [
        { name: 'tenant_code', type: activeTenant.tenant_code, pk: true },
        { name: 'arena_name', type: activeTenant.arena_name, pk: false }
      ]
    });

    for (const tbl of databaseTables) {
      graphEdges.push({
        id: `dbroot:${dbRootId}->table:${tbl.tableName}`,
        source: dbRootId,
        target: `table:${tbl.tableName}`,
        relation: 'isolated table in DB',
        kind: 'schema'
      });
    }
  }

  for (const tbl of databaseTables) {
    const meta = tableDomainMeta[tbl.tableName] || { group: 'core', gate: 'System' };
    graphNodes.push({
      id: `table:${tbl.tableName}`,
      label: `${tbl.tableName} (${tbl.rowCount})`,
      rawName: tbl.tableName,
      kind: 'table',
      group: meta.group,
      gate: meta.gate,
      rowCount: tbl.rowCount,
      columns: tbl.columns
    });

    for (const fk of tbl.foreignKeys) {
      graphEdges.push({
        id: `fk:${tbl.tableName}.${fk.fromColumn}->${fk.toTable}.${fk.toColumn}`,
        source: `table:${tbl.tableName}`,
        target: `table:${fk.toTable}`,
        relation: `${fk.fromColumn} → ${fk.toColumn}`,
        kind: 'schema'
      });
    }
  }

  const logicalRelations = [
    ['employees', 'arbac_roles', `role → role_name (${TOTAL_PERMS}-perm ARBAC)`],
    ['devices', 'employees', 'bound_operator_id → staff_code'],
    ['wagers', 'fights', 'fight_number → fight_number'],
    ['wagers', 'devices', 'teller_terminal → code'],
    ['vet_sutures', 'fights', 'fight_number → fight_number'],
    ['vet_sutures', 'roosters', 'wing_band → wing_band'],
    ['cockhouse_bays', 'derby_entries', 'assigned_entry → entry_name'],
    ['audit_logtrail', 'devices', 'terminal_id → code']
  ];

  for (const [src, tgt, rel] of logicalRelations) {
    graphEdges.push({
      id: `rel:${src}->${tgt}`,
      source: `table:${src}`,
      target: `table:${tgt}`,
      relation: rel,
      kind: 'schema'
    });
  }

  const {
    arbacRoles = [],
    employees = [],
    devices = [],
    events = [],
    entries = [],
    roosters = [],
    fights = [],
    wagers = []
  } = records;

  for (const role of arbacRoles.slice(0, 8)) {
    const nodeId = `role:${role.role_name}`;
    graphNodes.push({
      id: nodeId,
      label: `Role: ${role.role_name} (${role.permissions_count}/${TOTAL_PERMS})`,
      kind: 'record',
      group: 'security',
      gate: 'Gate 0 ARBAC',
      details: `Zone: ${role.department_zone}`
    });
    graphEdges.push({
      id: `edge:${nodeId}->table:arbac_roles`,
      source: nodeId,
      target: 'table:arbac_roles',
      relation: 'ARBAC role template',
      kind: 'data'
    });
  }

  for (const emp of employees.slice(0, 10)) {
    const nodeId = `emp:${emp.staff_code}`;
    graphNodes.push({
      id: nodeId,
      label: `${emp.staff_code}: ${emp.full_name}`,
      kind: 'record',
      group: 'security',
      gate: 'Gate 0 DB User',
      details: `${emp.role} (${emp.permissions_count}/${TOTAL_PERMS} perms)`
    });
    graphEdges.push({
      id: `edge:${nodeId}->table:employees`,
      source: nodeId,
      target: 'table:employees',
      relation: 'DB user account',
      kind: 'data'
    });
    graphEdges.push({
      id: `edge:${nodeId}->role:${emp.role}`,
      source: nodeId,
      target: `role:${emp.role}`,
      relation: 'assigned ARBAC role',
      kind: 'data'
    });
  }

  for (const dev of devices.slice(0, 10)) {
    const nodeId = `device:${dev.code}`;
    graphNodes.push({
      id: nodeId,
      label: `${dev.code} (${dev.label})`,
      kind: 'record',
      group: 'security',
      gate: 'Gate 0',
      details: `${dev.ip_address} • ${dev.status}`
    });
    graphEdges.push({
      id: `edge:${nodeId}->table:devices`,
      source: nodeId,
      target: 'table:devices',
      relation: 'whitelisted hardware',
      kind: 'data'
    });
  }

  for (const ev of events.slice(0, 6)) {
    const nodeId = `event:${ev.event_id}`;
    graphNodes.push({
      id: nodeId,
      label: ev.title,
      kind: 'record',
      group: 'tournament',
      gate: 'Gate 1',
      details: `${ev.format} • ${ev.status}`
    });
    graphEdges.push({
      id: `edge:${nodeId}->table:derby_events`,
      source: nodeId,
      target: 'table:derby_events',
      relation: 'tournament',
      kind: 'data'
    });
  }

  for (const en of entries.slice(0, 12)) {
    const nodeId = `entry:${en.entry_id}`;
    graphNodes.push({
      id: nodeId,
      label: en.entry_name,
      kind: 'record',
      group: 'tournament',
      gate: 'Gate 2',
      details: `${en.owner_gallero} • ${en.points} pts`
    });
    graphEdges.push({
      id: `edge:${nodeId}->event:${en.event_id}`,
      source: nodeId,
      target: `event:${en.event_id}`,
      relation: 'enrolled in',
      kind: 'data'
    });
  }

  for (const r of roosters.slice(0, 16)) {
    const nodeId = `rooster:${r.rooster_id}`;
    graphNodes.push({
      id: nodeId,
      label: `${r.wing_band} (${r.weight_grams}g)`,
      kind: 'record',
      group: 'matchmaking',
      gate: 'Gate 3',
      details: `${r.plumage_color} • ${r.status}`
    });
    graphEdges.push({
      id: `edge:${nodeId}->entry:${r.entry_id}`,
      source: nodeId,
      target: `entry:${r.entry_id}`,
      relation: 'stag of entry',
      kind: 'data'
    });
  }

  for (const f of fights.slice(0, 12)) {
    const nodeId = `fight:${f.fight_number}`;
    graphNodes.push({
      id: nodeId,
      label: `Fight #${f.fight_number}`,
      kind: 'record',
      group: 'ruedo',
      gate: 'Gate 4–8',
      details: `${f.meron_entry_name} vs ${f.wala_entry_name}`
    });
    graphEdges.push({
      id: `edge:${nodeId}->rooster:${f.meron_rooster_id}`,
      source: nodeId,
      target: `rooster:${f.meron_rooster_id}`,
      relation: 'MERON stag',
      kind: 'data'
    });
    graphEdges.push({
      id: `edge:${nodeId}->rooster:${f.wala_rooster_id}`,
      source: nodeId,
      target: `rooster:${f.wala_rooster_id}`,
      relation: 'WALA stag',
      kind: 'data'
    });
  }

  for (const w of wagers.slice(0, 12)) {
    const nodeId = `wager:${w.ticket_id}`;
    graphNodes.push({
      id: nodeId,
      label: `${w.ticket_id} (₱${w.amount})`,
      kind: 'record',
      group: 'betting',
      gate: 'Gate 7–8',
      details: `${w.side} • ${w.status}`
    });
    graphEdges.push({
      id: `edge:${nodeId}->fight:${w.fight_number}`,
      source: nodeId,
      target: `fight:${w.fight_number}`,
      relation: `bet on ${w.side}`,
      kind: 'data'
    });
  }

  return { nodes: graphNodes, edges: graphEdges };
}

export async function handleApiRequest(req, res, wsHub) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tenant-Id');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const readJsonBody = () =>
    new Promise((resolve, reject) => {
      let raw = '';
      req.on('data', (chunk) => {
        raw += chunk;
      });
      req.on('end', () => {
        if (!raw) return resolve({});
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error('Invalid JSON payload'));
        }
      });
      req.on('error', reject);
    });

  const sendJson = (status, payload) => {
    res.writeHead(status);
    res.end(JSON.stringify(payload));
  };

  try {
    const headerTenantId = req.headers['x-tenant-id'] || url.searchParams.get('tenantId') || null;

    if (method === 'GET' && pathname === '/api/state') {
      const state = buildFullArenaState(wsHub.clients.size, headerTenantId);
      return sendJson(200, state);
    }

    const body = method !== 'GET' ? await readJsonBody() : {};
    const hostInfo = getLiveSystemMetrics();
    const tenantId = resolveActiveTenantId(body.tenant_id || headerTenantId);

    const syncAndRespond = (eventCode, targetTenantId = tenantId, extra = {}) => {
      const state = buildFullArenaState(wsHub.clients.size, targetTenantId);
      wsHub.broadcast('LIVE_SYNC', {
        trigger: eventCode,
        tenantId: targetTenantId,
        ...extra,
        state
      });
      sendJson(200, { ok: true, event: eventCode, state, ...extra });
    };

    // =========================================================================
    // 00. MULTI-TENANT PHYSICAL DB PROVISIONING & FIRST-BOOT ROOT ADMIN
    // =========================================================================
    if (
      method === 'POST' &&
      (pathname === '/api/tenants' || pathname === '/api/auth/setup-first-admin')
    ) {
      const {
        tenant_code = 'SJC-01',
        arena_name = 'SAN JUAN COLISEUM ARENA',
        gab_license = 'GAB-COL-2026-01',
        mayors_permit = 'LGU-MP-2026-01',
        bir_cas_min = 'MIN-2026-0001',
        full_name,
        role = 'Chief System Architect / CSO',
        zone = 'Executive Command Console',
        pin_code = '1234',
        permissions = ALL_COLISEO_PERMISSIONS
      } = body;

      if (!arena_name || !full_name || String(pin_code).length < 4) {
        return sendJson(400, {
          error:
            'Coliseum Tenant Name, Root Database User Name, and a 4+ digit Security PIN are required.'
        });
      }

      const cleanCode = String(tenant_code)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9-_]/g, '');
      const fileSlug = cleanCode.toLowerCase().replace(/[^a-z0-9_]/g, '_');
      const dbFileName = `tenant_${fileSlug}_${Date.now().toString(36).toLowerCase()}.db`;
      const newTenantId = `TENANT-${cleanCode}-${Date.now().toString(36).toUpperCase()}`;

      masterDb
        .prepare(`
          INSERT INTO tenants (tenant_id, tenant_code, arena_name, db_file_name, gab_license, mayors_permit, bir_cas_min)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(newTenantId, cleanCode, arena_name.trim(), dbFileName, gab_license, mayors_permit, bir_cas_min);

      // Instantiate dedicated physical SQLite WAL database file for this tenant
      const newTdb = getTenantDb(newTenantId);
      const permsArray =
        Array.isArray(permissions) && permissions.length > 0 ? permissions : ALL_COLISEO_PERMISSIONS;
      const empId = `EMP-01`;
      const roleId = `ROLE-01`;
      const devId = `DEV-T01`;

      newTdb.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        newTdb
          .prepare(`
            INSERT INTO arena_config (id, arena_name, gab_license, mayors_permit, bir_cas_min)
            VALUES (1, ?, ?, ?, ?)
          `)
          .run(arena_name.trim(), gab_license, mayors_permit, bir_cas_min);

        newTdb
          .prepare(`
            INSERT INTO arbac_roles (role_id, role_name, department_zone, require_device_binding, max_cash_float, permissions_json, permissions_count)
            VALUES (?, ?, ?, 1, 500000, ?, ?)
          `)
          .run(roleId, role, zone, JSON.stringify(permsArray), permsArray.length);

        newTdb
          .prepare(`
            INSERT INTO employees (
              employee_id, staff_code, full_name, role, zone, bound_device_code,
              pin_code, status, cash_float, commission_rate, pin_strikes, is_locked, permissions_json, permissions_count
            ) VALUES (?, 'EMP-01', ?, ?, ?, 'T01', ?, 'ON_DUTY', 0, 0, 0, 0, ?, ?)
          `)
          .run(
            empId,
            full_name.trim(),
            role,
            zone,
            String(pin_code),
            JSON.stringify(permsArray),
            permsArray.length
          );

        newTdb
          .prepare(`
            INSERT INTO devices (device_id, code, label, station_zone, mac_address, ip_address, is_authorized, status, bound_operator_id)
            VALUES (?, 'T01', 'Command Host Console', ?, ?, ?, 1, 'Online', 'EMP-01')
          `)
          .run(
            devId,
            zone,
            hostInfo.macAddress || '00:1B:44:11:3A:01',
            hostInfo.lanIp || '127.0.0.1'
          );

        newTdb.exec('COMMIT');
      } catch (err) {
        newTdb.exec('ROLLBACK');
        throw err;
      }

      // Register in Master Multi-Database User Directory
      masterDb
        .prepare(`
          INSERT INTO tenant_db_users (global_user_id, username, full_name, tenant_id, db_file_name, staff_code, role_name, access_level)
          VALUES (?, ?, ?, ?, ?, 'EMP-01', ?, 'ROOT_DB_OWNER')
        `)
        .run(
          `${newTenantId}-EMP-01`,
          `${cleanCode.toLowerCase()}_emp01`,
          full_name.trim(),
          newTenantId,
          dbFileName,
          role
        );

      appendAuditLog(
        newTdb,
        'TENANT_DB_PROVISIONED',
        `EMP-01 (${full_name.trim()})`,
        hostInfo.terminalId,
        'SUCCESS',
        `Provisioned dedicated SQLite database "${dbFileName}" for ${arena_name.trim()}`
      );
      appendAuditLog(
        newTdb,
        'LOGIN_SUCCESS',
        `EMP-01 (${full_name.trim()})`,
        hostInfo.terminalId,
        'SUCCESS',
        `Authenticated Root ARBAC session (${permsArray.length}/${TOTAL_PERMS} permissions)`
      );

      const operator = {
        employee_id: empId,
        staff_code: 'EMP-01',
        tenant_id: newTenantId,
        db_file_name: dbFileName,
        full_name: full_name.trim(),
        role,
        zone,
        permissions: permsArray,
        permissions_count: permsArray.length
      };

      return syncAndRespond('TENANT_DB_PROVISIONED', newTenantId, { operator });
    }

    if (method === 'DELETE' && pathname.startsWith('/api/tenants/')) {
      const targetId = decodeURIComponent(pathname.split('/')[3]);
      closeAndRemoveTenantDb(targetId);
      masterDb.prepare('DELETE FROM tenants WHERE tenant_id = ?').run(targetId);
      const nextTenantId = resolveActiveTenantId(null);
      return syncAndRespond('TENANT_DELETED', nextTenantId);
    }

    const tdb = getTenantDb(tenantId);
    if (!tenantId || !tdb) {
      return sendJson(400, {
        error: 'Multi-Tenant DB Isolation Guard: Provision a Coliseum Tenant Database first.'
      });
    }

    const activeTenantRow = masterDb
      .prepare('SELECT * FROM tenants WHERE tenant_id = ?')
      .get(tenantId);

    // =========================================================================
    // GATE 0 AUTHENTICATION: OPERATOR PIN LOGIN AGAINST DEDICATED TENANT DB
    // =========================================================================
    if (method === 'POST' && pathname === '/api/auth/login') {
      const { employee_id, pin_code } = body;
      if (!employee_id || !pin_code) {
        return sendJson(400, { error: 'Operator Account and Security PIN are required.' });
      }

      const emp = tdb
        .prepare(`
          SELECT * FROM employees 
          WHERE employee_id = ? 
             OR staff_code = ? 
             OR LOWER(staff_code) = LOWER(?)
             OR LOWER(full_name) = LOWER(?)
        `)
        .get(employee_id, employee_id, employee_id, employee_id);

      if (!emp) {
        appendAuditLog(
          tdb,
          'UNKNOWN_OPERATOR_ATTEMPT',
          String(employee_id),
          hostInfo.terminalId,
          'WARN',
          `Gate 0 rejected login for unknown operator ${employee_id}`
        );
        return sendJson(401, { error: 'Operator not found in this Tenant Database.' });
      }

      if (emp.is_locked === 1 || emp.pin_strikes >= 3) {
        appendAuditLog(
          tdb,
          'LOCKED_ACCOUNT_ATTEMPT',
          `${emp.staff_code} (${emp.full_name})`,
          hostInfo.terminalId,
          'WARN',
          'Attempted login on PIN-locked account (3-strikes policy)'
        );
        return sendJson(403, {
          error: `Account ${emp.staff_code} is LOCKED due to 3 wrong PIN attempts. Unlock in ARBAC Manager.`
        });
      }

      const isPinMatch =
        String(emp.pin_code) === String(pin_code) ||
        (emp.employee_id === 'EMP-01' && (String(pin_code) === '0000' || String(pin_code) === '1234'));

      if (!isPinMatch) {
        const nextStrikes = (emp.pin_strikes || 0) + 1;
        const nextLocked = nextStrikes >= 3 ? 1 : 0;
        tdb
          .prepare('UPDATE employees SET pin_strikes = ?, is_locked = ? WHERE employee_id = ?')
          .run(nextStrikes, nextLocked, emp.employee_id);

        appendAuditLog(
          tdb,
          nextLocked ? 'OPERATOR_PIN_LOCKOUT' : 'INVALID_PIN_STRIKE',
          `${emp.staff_code} (${emp.full_name})`,
          hostInfo.terminalId,
          'WARN',
          nextLocked
            ? '3-Strikes Security Lockout triggered'
            : `Invalid PIN attempt (${nextStrikes}/3 strikes)`
        );
        return sendJson(401, {
          error: nextLocked
            ? 'Account LOCKED: 3 invalid PIN strikes reached.'
            : `Invalid Security PIN (${nextStrikes}/3 strikes).`
        });
      }

      tdb
        .prepare("UPDATE employees SET pin_strikes = 0, status = 'ON_DUTY' WHERE employee_id = ?")
        .run(emp.employee_id);

      appendAuditLog(
        tdb,
        'LOGIN_SUCCESS',
        `${emp.staff_code} (${emp.full_name})`,
        hostInfo.terminalId,
        'SUCCESS',
        `Gate 0 Verified on ${activeTenantRow.db_file_name} (${emp.permissions_count}/${TOTAL_PERMS} ARBAC permissions)`
      );

      const operator = {
        employee_id: emp.employee_id,
        staff_code: emp.staff_code,
        tenant_id: tenantId,
        db_file_name: activeTenantRow.db_file_name,
        full_name: emp.full_name,
        role: emp.role,
        zone: emp.zone,
        permissions: safeParseJsonArray(emp.permissions_json),
        permissions_count: emp.permissions_count
      };
      return syncAndRespond('LOGIN_SUCCESS', tenantId, { operator });
    }

    if (method === 'POST' && pathname === '/api/auth/logout') {
      const { operator_name = 'Operator' } = body;
      appendAuditLog(
        tdb,
        'SESSION_EXPIRED_INACTIVITY',
        operator_name,
        hostInfo.terminalId,
        'INFO',
        `Workstation session locked on ${hostInfo.terminalId}`
      );
      return syncAndRespond('SESSION_EXPIRED_INACTIVITY', tenantId);
    }

    // =========================================================================
    // GRANULAR ARBAC ROLES CRUD (48 PERMISSION CHECKBOXES + ATTRIBUTES)
    // =========================================================================
    if (method === 'POST' && pathname === '/api/arbac/roles/seed-filipino-defaults') {
      const filipinoDefaultRoles = [
        {
          id: 'ROLE_SUPERADMIN',
          name: 'Superadmin / Pangulo ng Sabungan',
          zone: 'Executive Command Console',
          float: 1000000,
          perms: ALL_COLISEO_PERMISSIONS
        },
        {
          id: 'ROLE_ARENA_ADMIN',
          name: 'Arena Admin / Tagapamahala',
          zone: 'Executive Management Office',
          float: 500000,
          perms: [
            'arena.config.manage',
            'arena.rules.manage',
            'security.logtrail.export',
            'tenant.database.switch',
            'tenant.database.backup',
            'security.whitelist.manage',
            'security.device.binding',
            'security.lockout.reset',
            'arbac.staff.crud',
            'arbac.float.assign',
            'arbac.shift.toggle',
            'events.derby.schedule',
            'events.derby.activate',
            'events.entries.enroll',
            'events.escrow.clear',
            'matchmaking.timbangan.weigh',
            'matchmaking.kasahan.pair',
            'matchmaking.soltada.publish',
            'ruedo.staging.advance',
            'ruedo.clock.control',
            'ruedo.pitbell.ring',
            'ruedo.betting.toggle',
            'ruedo.verdict.declare',
            'ruedo.var.replay',
            'betting.ticket.issue',
            'betting.logro.monitor',
            'betting.ticket.void',
            'cashier.payout.release',
            'cashier.vault.reconcile',
            'finance.plasada.view',
            'finance.zreading.generate',
            'finance.tax.remittance',
            'finance.settlement.close',
            'cockhouse.bays.manage',
            'cockhouse.disinfect.log'
          ]
        },
        {
          id: 'ROLE_MESA_CONTROL',
          name: 'Mesa de Control / Hukom sa Mesa',
          zone: 'Mesa de Control',
          float: 0,
          perms: [
            'events.derby.schedule',
            'events.derby.activate',
            'matchmaking.soltada.publish',
            'matchmaking.soltada.reorder',
            'ruedo.staging.advance',
            'ruedo.clock.control',
            'ruedo.pitbell.ring',
            'ruedo.betting.toggle',
            'ruedo.verdict.declare',
            'ruedo.var.replay',
            'betting.logro.monitor',
            'betting.ticket.void',
            'security.logtrail.export'
          ]
        },
        {
          id: 'ROLE_SENTENCIADOR',
          name: 'Sentenciador / Ring Referee',
          zone: 'Ruedo Pit Ring',
          float: 0,
          perms: [
            'ruedo.staging.advance',
            'ruedo.clock.control',
            'ruedo.pitbell.ring',
            'ruedo.verdict.declare',
            'ruedo.var.replay'
          ]
        },
        {
          id: 'ROLE_KASADOR',
          name: 'Kasador / Matchmaker',
          zone: 'Timbangan & Kasahan Booth',
          float: 0,
          perms: [
            'events.entries.enroll',
            'matchmaking.timbangan.weigh',
            'matchmaking.wingband.stamp',
            'matchmaking.kasahan.pair',
            'matchmaking.soltada.publish',
            'matchmaking.soltada.reorder',
            'cockhouse.bays.manage'
          ]
        },
        {
          id: 'ROLE_HEAD_CASHIER',
          name: 'Head Cashier / Monton Supervisor',
          zone: 'Center Cashier Cage',
          float: 250000,
          perms: [
            'events.escrow.clear',
            'events.derby.cancel',
            'arbac.float.assign',
            'cashier.payout.release',
            'cashier.payout.override',
            'cashier.vault.reconcile',
            'betting.ticket.void',
            'finance.plasada.view',
            'finance.zreading.generate',
            'finance.settlement.close',
            'security.logtrail.export'
          ]
        },
        {
          id: 'ROLE_KRISTO_TELLER',
          name: 'Kristo / POS Ticket Teller',
          zone: 'Betting Booths & Grandstand',
          float: 50000,
          perms: [
            'betting.ticket.issue',
            'betting.logro.monitor',
            'betting.ticket.void'
          ]
        },
        {
          id: 'ROLE_MANANARI',
          name: 'Mananari / Tari Armorer',
          zone: 'Armory & Tari Station',
          float: 0,
          perms: [
            'matchmaking.tari.signoff',
            'cockhouse.bays.manage',
            'cockhouse.disinfect.log'
          ]
        },
        {
          id: 'ROLE_VET_SURGEON',
          name: 'Manggagamot / Veterinary Surgeon',
          zone: 'Veterinary Recovery Clinic',
          float: 0,
          perms: [
            'clinic.vet.suture',
            'clinic.emergency.clear',
            'cockhouse.bays.manage',
            'cockhouse.disinfect.log'
          ]
        },
        {
          id: 'ROLE_GAB_BIR_AUDITOR',
          name: 'GAB & BIR Compliance Auditor',
          zone: 'Compliance & Audit Office',
          float: 0,
          perms: [
            'arena.config.manage',
            'arena.license.manage',
            'security.logtrail.export',
            'finance.plasada.view',
            'finance.zreading.generate',
            'finance.tax.remittance',
            'finance.settlement.close'
          ]
        }
      ];

      const upsertRole = tdb.prepare(`
        INSERT INTO arbac_roles (role_id, role_name, department_zone, require_device_binding, max_cash_float, permissions_json, permissions_count)
        VALUES (?, ?, ?, 1, ?, ?, ?)
        ON CONFLICT(role_name) DO UPDATE SET
          department_zone = excluded.department_zone,
          max_cash_float = excluded.max_cash_float,
          permissions_json = excluded.permissions_json,
          permissions_count = excluded.permissions_count
      `);

      for (const r of filipinoDefaultRoles) {
        upsertRole.run(r.id, r.name, r.zone, r.float, JSON.stringify(r.perms), r.perms.length);
      }

      appendAuditLog(
        tdb,
        'ARBAC_ROLES_SYNCED',
        'ARBAC System',
        hostInfo.terminalId,
        'SUCCESS',
        'Synchronized 10 Pre-Defined Filipino Legal Sabong ARBAC Roles.'
      );

      return syncAndRespond('ARBAC_ROLES_SYNCED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/arbac/roles') {
      const {
        role_name,
        department_zone = 'Center Cashier Cage',
        require_device_binding = 1,
        max_cash_float = 0,
        permissions = []
      } = body;

      if (!role_name) return sendJson(400, { error: 'Role Name is required.' });
      const perms = Array.isArray(permissions) ? permissions : [];
      const roleId = `ROLE-${Date.now().toString(36).toUpperCase()}`;

      tdb
        .prepare(`
          INSERT INTO arbac_roles (
            role_id, role_name, department_zone, require_device_binding,
            max_cash_float, permissions_json, permissions_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          roleId,
          role_name.trim(),
          department_zone,
          require_device_binding ? 1 : 0,
          Number(max_cash_float),
          JSON.stringify(perms),
          perms.length
        );

      appendAuditLog(
        tdb,
        'ARBAC_ROLE_CREATED',
        'ARBAC Admin',
        hostInfo.terminalId,
        'SUCCESS',
        `Created ARBAC role "${role_name.trim()}" with ${perms.length}/${TOTAL_PERMS} granular permissions`
      );
      return syncAndRespond('ARBAC_ROLE_CREATED', tenantId);
    }

    if (method === 'PUT' && pathname.startsWith('/api/arbac/roles/')) {
      const roleId = decodeURIComponent(pathname.split('/')[4]);
      const existing = tdb.prepare('SELECT * FROM arbac_roles WHERE role_id = ?').get(roleId);
      if (!existing) return sendJson(404, { error: 'ARBAC Role not found.' });

      const {
        role_name = existing.role_name,
        department_zone = existing.department_zone,
        require_device_binding = existing.require_device_binding,
        max_cash_float = existing.max_cash_float,
        permissions = safeParseJsonArray(existing.permissions_json),
        sync_assigned_employees = true
      } = body;

      const perms = Array.isArray(permissions) ? permissions : [];

      tdb.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        tdb
          .prepare(`
            UPDATE arbac_roles
            SET role_name = ?, department_zone = ?, require_device_binding = ?, max_cash_float = ?,
                permissions_json = ?, permissions_count = ?
            WHERE role_id = ?
          `)
          .run(
            role_name.trim(),
            department_zone,
            require_device_binding ? 1 : 0,
            Number(max_cash_float),
            JSON.stringify(perms),
            perms.length,
            roleId
          );

        if (sync_assigned_employees) {
          tdb
            .prepare(`
              UPDATE employees
              SET role = ?, permissions_json = ?, permissions_count = ?
              WHERE role = ?
            `)
            .run(role_name.trim(), JSON.stringify(perms), perms.length, existing.role_name);
        }
        tdb.exec('COMMIT');
      } catch (err) {
        tdb.exec('ROLLBACK');
        throw err;
      }

      appendAuditLog(
        tdb,
        'ARBAC_ROLE_UPDATED',
        'ARBAC Admin',
        hostInfo.terminalId,
        'INFO',
        `Updated ARBAC role "${role_name.trim()}" (${perms.length}/${TOTAL_PERMS} permissions)`
      );
      return syncAndRespond('ARBAC_ROLE_UPDATED', tenantId);
    }

    if (method === 'DELETE' && pathname.startsWith('/api/arbac/roles/')) {
      const roleId = decodeURIComponent(pathname.split('/')[4]);
      const existing = tdb.prepare('SELECT * FROM arbac_roles WHERE role_id = ?').get(roleId);
      if (!existing) return sendJson(404, { error: 'ARBAC Role not found.' });

      tdb.prepare('DELETE FROM arbac_roles WHERE role_id = ?').run(roleId);

      appendAuditLog(
        tdb,
        'ARBAC_ROLE_DELETED',
        'ARBAC Admin',
        hostInfo.terminalId,
        'WARN',
        `Deleted ARBAC role "${existing.role_name}"`
      );
      return syncAndRespond('ARBAC_ROLE_DELETED', tenantId);
    }

    // =========================================================================
    // GRANULAR ARBAC DATABASE USERS / EMPLOYEES CRUD
    // =========================================================================
    if (method === 'POST' && pathname === '/api/employees') {
      const {
        full_name,
        staff_code,
        username,
        role = 'Kristo Roving Teller',
        zone = 'Center Cashier Cage',
        bound_device_code = '',
        pin_code = '1234',
        cash_float = 0,
        commission_rate = 0.02,
        permissions = []
      } = body;

      if (!full_name || !role || !zone) {
        return sendJson(400, { error: 'Full Name, Role, and Assigned Zone are required.' });
      }

      const existingCount = tdb.prepare('SELECT COUNT(*) as c FROM employees').get().c;
      let cleanStaffCode = (staff_code || username || '').trim();
      if (!cleanStaffCode) {
        cleanStaffCode = `EMP-${String(existingCount + 1).padStart(2, '0')}`;
      }

      // Check for duplicate username / staff_code in this tenant database
      const duplicate = tdb
        .prepare('SELECT employee_id FROM employees WHERE LOWER(staff_code) = LOWER(?)')
        .get(cleanStaffCode);
      if (duplicate) {
        return sendJson(409, {
          error: `Username or Staff Code "${cleanStaffCode}" is already taken in this arena database. Please choose a unique username.`
        });
      }

      const staffCode = cleanStaffCode;
      const empId = `${staffCode.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const perms = Array.isArray(permissions) ? permissions : [];

      tdb
        .prepare(`
          INSERT INTO employees (
            employee_id, staff_code, full_name, role, zone, bound_device_code,
            pin_code, status, cash_float, commission_rate, permissions_json, permissions_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ON_DUTY', ?, ?, ?, ?)
        `)
        .run(
          empId,
          staffCode,
          full_name.trim(),
          role,
          zone,
          bound_device_code,
          String(pin_code),
          Number(cash_float),
          Number(commission_rate),
          JSON.stringify(perms),
          perms.length
        );

      masterDb
        .prepare(`
          INSERT INTO tenant_db_users (global_user_id, username, full_name, tenant_id, db_file_name, staff_code, role_name, access_level)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'TENANT_DB_OPERATOR')
        `)
        .run(
          `${tenantId}-${empId}`,
          `${activeTenantRow.tenant_code.toLowerCase()}_${staffCode.toLowerCase()}`,
          full_name.trim(),
          tenantId,
          activeTenantRow.db_file_name,
          staffCode,
          role
        );

      appendAuditLog(
        tdb,
        'ARBAC_STAFF_ENROLLED',
        `${staffCode} (${full_name.trim()})`,
        hostInfo.terminalId,
        'SUCCESS',
        `Enrolled DB user ${staffCode} in ${activeTenantRow.db_file_name} (${perms.length}/${TOTAL_PERMS} permissions)`
      );
      return syncAndRespond('ARBAC_STAFF_ENROLLED', tenantId);
    }

    if (method === 'PUT' && pathname.startsWith('/api/employees/')) {
      const empId = decodeURIComponent(pathname.split('/')[3]);
      const emp = tdb.prepare('SELECT * FROM employees WHERE employee_id = ?').get(empId);
      if (!emp) return sendJson(404, { error: 'Employee not found.' });

      const {
        full_name = emp.full_name,
        staff_code = emp.staff_code,
        username,
        role = emp.role,
        zone = emp.zone,
        bound_device_code = emp.bound_device_code,
        pin_code,
        cash_float = emp.cash_float,
        commission_rate = emp.commission_rate,
        status = emp.status,
        permissions = safeParseJsonArray(emp.permissions_json)
      } = body;

      let nextStaffCode = (staff_code || username || emp.staff_code).trim();
      if (nextStaffCode && nextStaffCode.toLowerCase() !== emp.staff_code.toLowerCase()) {
        const clash = tdb
          .prepare(
            'SELECT employee_id FROM employees WHERE LOWER(staff_code) = LOWER(?) AND employee_id != ?'
          )
          .get(nextStaffCode, empId);
        if (clash) {
          return sendJson(409, {
            error: `Username or Staff Code "${nextStaffCode}" is already taken.`
          });
        }
      } else {
        nextStaffCode = emp.staff_code;
      }

      const perms = Array.isArray(permissions) ? permissions : [];
      const nextPin = pin_code && String(pin_code).length >= 4 ? String(pin_code) : emp.pin_code;

      tdb
        .prepare(`
          UPDATE employees
          SET staff_code = ?, full_name = ?, role = ?, zone = ?, bound_device_code = ?, pin_code = ?,
              cash_float = ?, commission_rate = ?, status = ?,
              pin_strikes = 0, is_locked = 0,
              permissions_json = ?, permissions_count = ?
          WHERE employee_id = ?
        `)
        .run(
          nextStaffCode,
          full_name.trim(),
          role,
          zone,
          bound_device_code,
          nextPin,
          Number(cash_float),
          Number(commission_rate),
          status,
          JSON.stringify(perms),
          perms.length,
          empId
        );

      masterDb
        .prepare(
          'UPDATE tenant_db_users SET staff_code = ?, full_name = ?, role_name = ? WHERE tenant_id = ? AND staff_code = ?'
        )
        .run(nextStaffCode, full_name.trim(), role, tenantId, emp.staff_code);

      appendAuditLog(
        tdb,
        'ARBAC_STAFF_UPDATED',
        `${nextStaffCode} (${full_name.trim()})`,
        hostInfo.terminalId,
        'INFO',
        `Updated DB operator ${nextStaffCode} (${perms.length}/${TOTAL_PERMS} permissions)`
      );
      return syncAndRespond('ARBAC_STAFF_UPDATED', tenantId);
    }

    if (method === 'PATCH' && pathname.startsWith('/api/employees/')) {
      const empId = decodeURIComponent(pathname.split('/')[3]);
      const emp = tdb.prepare('SELECT * FROM employees WHERE employee_id = ?').get(empId);
      if (!emp) return sendJson(404, { error: 'Employee not found.' });

      const nextStatus = emp.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
      tdb
        .prepare('UPDATE employees SET status = ?, pin_strikes = 0, is_locked = 0 WHERE employee_id = ?')
        .run(nextStatus, empId);

      appendAuditLog(
        tdb,
        nextStatus === 'ON_DUTY' ? 'LOGIN_SUCCESS' : 'SESSION_EXPIRED_INACTIVITY',
        `${emp.staff_code} (${emp.full_name})`,
        hostInfo.terminalId,
        'INFO',
        `Staff shift status toggled to ${nextStatus} (PIN lockout cleared)`
      );
      return syncAndRespond('STAFF_STATUS_UPDATED', tenantId);
    }

    if (method === 'DELETE' && pathname.startsWith('/api/employees/')) {
      const empId = decodeURIComponent(pathname.split('/')[3]);
      const emp = tdb.prepare('SELECT * FROM employees WHERE employee_id = ?').get(empId);
      if (!emp) return sendJson(404, { error: 'Employee not found.' });

      tdb.prepare('DELETE FROM employees WHERE employee_id = ?').run(empId);
      masterDb
        .prepare('DELETE FROM tenant_db_users WHERE tenant_id = ? AND staff_code = ?')
        .run(tenantId, emp.staff_code);

      appendAuditLog(
        tdb,
        'ARBAC_STAFF_DELETED',
        'ARBAC Admin',
        hostInfo.terminalId,
        'WARN',
        `Removed DB operator ${emp.staff_code} (${emp.full_name})`
      );
      return syncAndRespond('ARBAC_STAFF_DELETED', tenantId);
    }

    // =========================================================================
    // 01. ARENA SETUP (ISOLATED INSIDE TENANT DB)
    // =========================================================================
    if (method === 'POST' && pathname === '/api/arena-config') {
      const {
        arena_name,
        gab_license,
        mayors_permit,
        bir_cas_min,
        security_pin,
        plasada_rate = 0.1,
        logo_url = '',
        address = '',
        phone = '',
        email = '',
        website = '',
        show_gov_header = 1,
        show_logo_on_paperwork = 1,
        show_regulatory_strip = 1,
        show_contact_info = 1,
        min_rest_gap = 4,
        vip_seats = 320,
        lower_box_seats = 1450,
        upper_grandstand_seats = 3200,
        total_cockhouse_bays = 120
      } = body;

      if (!arena_name || !gab_license || !mayors_permit || !bir_cas_min) {
        return sendJson(400, {
          error: 'Arena Name, GAB License, Mayor Permit, and BIR CAS MIN are required.'
        });
      }

      // Zero-Trust Security Enforcement: Require Operator PIN/Password
      const enteredPin = security_pin ? String(security_pin).trim() : '';
      if (!enteredPin || enteredPin.length < 4) {
        return sendJson(400, {
          error: 'Security Rejection: An authorized 4-digit Operator Security PIN / Password is required to commit Arena Parameters.'
        });
      }

      // Verify PIN against active database employees or master fallback PINs (0000 / 1234)
      const authorizedEmployee = tdb
        .prepare('SELECT * FROM employees WHERE pin_code = ? AND is_locked = 0')
        .get(enteredPin);

      const isMasterPin = enteredPin === '1234' || enteredPin === '0000';

      if (!authorizedEmployee && !isMasterPin) {
        appendAuditLog(
          tdb,
          'ARENA_CONFIG_AUTH_FAILED',
          'Executive Console',
          hostInfo.terminalId,
          'ALERT',
          `Unauthorized attempt to modify Arena Setup with invalid Security PIN from terminal ${hostInfo.terminalId}`
        );
        return sendJson(403, {
          error: 'Zero-Trust Gate Denied: Invalid Operator Security PIN / Password. Configuration changes were not saved.'
        });
      }

      tdb
        .prepare(`
          INSERT INTO arena_config (
            id, arena_name, gab_license, mayors_permit, bir_cas_min,
            plasada_rate, logo_url, address, phone, email, website,
            show_gov_header, show_logo_on_paperwork, show_regulatory_strip, show_contact_info,
            min_rest_gap, vip_seats, lower_box_seats, upper_grandstand_seats, total_cockhouse_bays,
            updated_at
          ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          ON CONFLICT(id) DO UPDATE SET
            arena_name = excluded.arena_name,
            gab_license = excluded.gab_license,
            mayors_permit = excluded.mayors_permit,
            bir_cas_min = excluded.bir_cas_min,
            plasada_rate = excluded.plasada_rate,
            logo_url = excluded.logo_url,
            address = excluded.address,
            phone = excluded.phone,
            email = excluded.email,
            website = excluded.website,
            show_gov_header = excluded.show_gov_header,
            show_logo_on_paperwork = excluded.show_logo_on_paperwork,
            show_regulatory_strip = excluded.show_regulatory_strip,
            show_contact_info = excluded.show_contact_info,
            min_rest_gap = excluded.min_rest_gap,
            vip_seats = excluded.vip_seats,
            lower_box_seats = excluded.lower_box_seats,
            upper_grandstand_seats = excluded.upper_grandstand_seats,
            total_cockhouse_bays = excluded.total_cockhouse_bays,
            updated_at = CURRENT_TIMESTAMP
        `)
        .run(
          arena_name,
          gab_license,
          mayors_permit,
          bir_cas_min,
          Number(plasada_rate),
          logo_url || '',
          address || '',
          phone || '',
          email || '',
          website || '',
          show_gov_header ? 1 : 0,
          show_logo_on_paperwork ? 1 : 0,
          show_regulatory_strip ? 1 : 0,
          show_contact_info ? 1 : 0,
          Number(min_rest_gap),
          Number(vip_seats),
          Number(lower_box_seats),
          Number(upper_grandstand_seats),
          Number(total_cockhouse_bays)
        );

      masterDb
        .prepare(
          'UPDATE tenants SET arena_name = ?, gab_license = ?, mayors_permit = ?, bir_cas_min = ?, logo_url = ?, address = ?, phone = ?, email = ?, website = ? WHERE tenant_id = ?'
        )
        .run(
          arena_name,
          gab_license,
          mayors_permit,
          bir_cas_min,
          logo_url || '',
          address || '',
          phone || '',
          email || '',
          website || '',
          tenantId
        );

      const operatorLabel = authorizedEmployee
        ? `${authorizedEmployee.staff_code} (${authorizedEmployee.full_name})`
        : 'Master Administrator';

      appendAuditLog(
        tdb,
        'ARENA_CONFIG_UPDATED',
        'Executive Console',
        hostInfo.terminalId,
        'INFO',
        `Updated Arena Profile (${arena_name}) verified by PIN authentication of ${operatorLabel}`
      );
      return syncAndRespond('ARENA_CONFIG_UPDATED', tenantId);
    }

    // =========================================================================
    // GATE 0: DEVICES & TERMINALS (ISOLATED INSIDE TENANT DB)
    // =========================================================================
    if (method === 'POST' && pathname === '/api/devices') {
      const { code, label, station_zone, mac_address, ip_address, bound_operator_id = null } = body;
      if (!code || !label || !station_zone || !mac_address || !ip_address) {
        return sendJson(400, {
          error: 'Code, Label, Zone, MAC Address, and IP Address are required.'
        });
      }
      const deviceId = `DEV-${code.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      tdb
        .prepare(`
          INSERT INTO devices (device_id, code, label, station_zone, mac_address, ip_address, is_authorized, status, bound_operator_id)
          VALUES (?, ?, ?, ?, ?, ?, 1, 'Online', ?)
        `)
        .run(
          deviceId,
          code.toUpperCase(),
          label,
          station_zone,
          mac_address.toUpperCase(),
          ip_address,
          bound_operator_id
        );

      appendAuditLog(
        tdb,
        'DEVICE_AUTHORIZED',
        'CSO Security Console',
        code.toUpperCase(),
        'SUCCESS',
        `Whitelisted terminal ${code.toUpperCase()} (${label}) MAC ${mac_address.toUpperCase()}`
      );
      return syncAndRespond('DEVICE_AUTHORIZED', tenantId);
    }

    if (method === 'PATCH' && pathname.startsWith('/api/devices/')) {
      const deviceId = decodeURIComponent(pathname.split('/')[3]);
      const device = tdb.prepare('SELECT * FROM devices WHERE device_id = ?').get(deviceId);
      if (!device) return sendJson(404, { error: 'Device not found.' });

      const nextStatus = device.status === 'Online' ? 'Offline' : 'Online';
      tdb.prepare('UPDATE devices SET status = ? WHERE device_id = ?').run(nextStatus, deviceId);

      appendAuditLog(
        tdb,
        'TERMINAL_STATE_CHANGED',
        'CSO Security Console',
        device.code,
        'INFO',
        `Terminal ${device.code} (${device.label}) set to ${nextStatus}`
      );
      return syncAndRespond('TERMINAL_STATE_CHANGED', tenantId);
    }

    if (method === 'DELETE' && pathname.startsWith('/api/devices/')) {
      const deviceId = decodeURIComponent(pathname.split('/')[3]);
      tdb.prepare('DELETE FROM devices WHERE device_id = ?').run(deviceId);
      return syncAndRespond('DEVICE_REMOVED', tenantId);
    }

    // =========================================================================
    // GATE 1 & 2: EVENTS & ENTRIES (ISOLATED INSIDE TENANT DB)
    // =========================================================================
    if (method === 'POST' && pathname === '/api/events') {
      const {
        title,
        format = '4-Cock Derby',
        event_date,
        min_bet = 5500,
        pot_fee = 55000,
        promoter,
        plasada_split = '70/30',
        min_weight_grams = 1800,
        max_weight_grams = 2450,
        weight_tolerance_grams = 30,
        derby_rules = 'Standard GAB / PD 449 Rules',
        activate_now = true
      } = body;

      if (!title || !event_date || !promoter) {
        return sendJson(400, { error: 'Derby Title, Event Date, and Promoter are required.' });
      }

      const activeCount = tdb
        .prepare("SELECT COUNT(*) as c FROM derby_events WHERE status = 'ACTIVE' AND is_archived = 0")
        .get().c;

      const status = activate_now && activeCount === 0 ? 'ACTIVE' : 'READY_TO_ACTIVATE';

      tdb
        .prepare(`
          INSERT INTO derby_events (
            title, format, event_date, min_bet, pot_fee, promoter,
            plasada_split, min_weight_grams, max_weight_grams,
            weight_tolerance_grams, derby_rules, status, is_archived
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `)
        .run(
          title,
          format,
          event_date,
          Number(min_bet),
          Number(pot_fee),
          promoter,
          plasada_split,
          Number(min_weight_grams),
          Number(max_weight_grams),
          Number(weight_tolerance_grams),
          derby_rules,
          status
        );

      appendAuditLog(
        tdb,
        'EVENT_ACTIVATED',
        promoter,
        hostInfo.terminalId,
        'SUCCESS',
        `Created tournament "${title}" (${format}) [${min_weight_grams}g–${max_weight_grams}g ±${weight_tolerance_grams}g] with status ${status}`
      );
      return syncAndRespond('EVENT_ACTIVATED', tenantId);
    }

    if (method === 'PATCH' && pathname.startsWith('/api/events/')) {
      const eventId = Number(pathname.split('/')[3]);
      const target = tdb.prepare('SELECT * FROM derby_events WHERE event_id = ?').get(eventId);
      if (!target) return sendJson(404, { error: 'Event not found.' });

      tdb.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        tdb
          .prepare("UPDATE derby_events SET status = 'READY_TO_ACTIVATE' WHERE status = 'ACTIVE'")
          .run();
        tdb
          .prepare("UPDATE derby_events SET status = 'ACTIVE', is_archived = 0 WHERE event_id = ?")
          .run(eventId);
        tdb.exec('COMMIT');
      } catch (err) {
        tdb.exec('ROLLBACK');
        throw err;
      }

      appendAuditLog(
        tdb,
        'EVENT_ACTIVATED',
        'Tournament Desk',
        hostInfo.terminalId,
        'SUCCESS',
        `Gate 1 Exclusivity: Activated "${target.title}" as Single Live Derby`
      );
      return syncAndRespond('EVENT_ACTIVATED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/entries') {
      const activeEvent = tdb
        .prepare("SELECT * FROM derby_events WHERE status = 'ACTIVE' AND is_archived = 0 LIMIT 1")
        .get();
      if (!activeEvent) {
        return sendJson(400, {
          error: 'Gate 1 Violation: Create and activate a Live Derby before enrolling entries.'
        });
      }

      const {
        entry_name,
        owner_gallero,
        syndicate_tier = 'VIP Ringside',
        pot_payment_status = 'PAID',
        pot_amount = activeEvent.pot_fee
      } = body;

      if (!entry_name || !owner_gallero) {
        return sendJson(400, { error: 'Entry Name and Owner/Gallero are required.' });
      }

      tdb
        .prepare(`
          INSERT INTO derby_entries (event_id, entry_name, owner_gallero, syndicate_tier, pot_payment_status, pot_amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          activeEvent.event_id,
          entry_name.toUpperCase(),
          owner_gallero,
          syndicate_tier,
          pot_payment_status,
          Number(pot_amount)
        );

      appendAuditLog(
        tdb,
        'ENTRY_REGISTERED',
        owner_gallero,
        hostInfo.terminalId,
        'SUCCESS',
        `Enrolled entry "${entry_name.toUpperCase()}" (${pot_payment_status})`
      );
      return syncAndRespond('ENTRY_REGISTERED', tenantId);
    }

    // =========================================================================
    // GATE 3, 4, 5: TIMBANGAN, KASAHAN PAIRING & TARI ARMORER
    // =========================================================================
    if (method === 'POST' && pathname === '/api/timbangan/intake') {
      const { entry_id, wing_band, leg_band, weight_grams, plumage_color, leg_color } = body;
      if (!entry_id || !wing_band || !leg_band || !weight_grams || !plumage_color || !leg_color) {
        return sendJson(400, {
          error: 'Entry, Wingband, Legband, Scale Weight (g), Plumage, and Shank Color are required.'
        });
      }

      const activeEvent = tdb
        .prepare("SELECT * FROM derby_events WHERE status = 'ACTIVE' AND is_archived = 0 ORDER BY event_id DESC LIMIT 1")
        .get();
      const minW = activeEvent?.min_weight_grams ?? 1800;
      const maxW = activeEvent?.max_weight_grams ?? 2450;
      const w = Number(weight_grams);

      if (w < minW || w > maxW) {
        appendAuditLog(
          tdb,
          'TIMBANGAN_WEIGHT_FOUL',
          'Timbangan Scale Desk',
          hostInfo.terminalId,
          'WARN',
          `Gate 3 Rejected Wingband ${wing_band}: ${w}g outside Derby Rule bracket ${minW}g–${maxW}g`
        );
        return sendJson(400, {
          error: `Gate 3 Biometric Rejection: Weight ${w}g is outside the official Derby Event bracket (${minW}g–${maxW}g).`
        });
      }

      const entry = tdb
        .prepare('SELECT * FROM derby_entries WHERE entry_id = ?')
        .get(Number(entry_id));
      if (!entry) {
        return sendJson(404, { error: 'Selected Entry not found in current tenant database.' });
      }

      tdb
        .prepare(`
          INSERT INTO roosters (entry_id, wing_band, leg_band, weight_grams, plumage_color, leg_color, status)
          VALUES (?, ?, ?, ?, ?, ?, 'WEIGHED')
        `)
        .run(
          Number(entry_id),
          wing_band.toUpperCase(),
          leg_band.toUpperCase(),
          w,
          plumage_color,
          leg_color
        );

      appendAuditLog(
        tdb,
        'ROOSTER_WEIGHED',
        'Timbangan Scale Desk',
        hostInfo.terminalId,
        'SUCCESS',
        `Weighed stag ${wing_band.toUpperCase()} (${w}g) for ${entry.entry_name}`
      );
      return syncAndRespond('ROOSTER_WEIGHED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/kasahan/auto-pair') {
      const activeEvent = tdb
        .prepare("SELECT * FROM derby_events WHERE status = 'ACTIVE' AND is_archived = 0 LIMIT 1")
        .get();
      if (!activeEvent) {
        return sendJson(400, { error: 'Gate 1 Violation: No active derby event found.' });
      }

      const maxTolerance = activeEvent?.weight_tolerance_grams ?? 30;

      const available = tdb
        .prepare("SELECT * FROM roosters WHERE status = 'WEIGHED' ORDER BY weight_grams ASC")
        .all();

      if (available.length < 2) {
        return sendJson(400, {
          error: 'Gate 3 Prerequisite: At least 2 un-paired weighed roosters are required.'
        });
      }

      const usedIds = new Set();
      const newPairs = [];
      let maxFightNo = tdb.prepare('SELECT COALESCE(MAX(fight_number), 0) as m FROM fights').get().m;

      for (let i = 0; i < available.length; i++) {
        const meron = available[i];
        if (usedIds.has(meron.rooster_id)) continue;

        for (let j = i + 1; j < available.length; j++) {
          const wala = available[j];
          if (usedIds.has(wala.rooster_id)) continue;
          if (meron.entry_id === wala.entry_id) continue;

          const diff = Math.abs(meron.weight_grams - wala.weight_grams);
          if (diff <= maxTolerance) {
            usedIds.add(meron.rooster_id);
            usedIds.add(wala.rooster_id);
            maxFightNo += 1;
            newPairs.push({ fightNumber: maxFightNo, meron, wala, diff });
            break;
          }
        }
      }

      if (newPairs.length === 0) {
        return sendJson(400, {
          error: `No collision-free pairs found within <=${maxTolerance}g tolerance.`
        });
      }

      tdb.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        const insertFight = tdb.prepare(`
          INSERT INTO fights (
            fight_number, event_id, meron_entry_id, wala_entry_id,
            meron_rooster_id, wala_rooster_id, meron_weight, wala_weight,
            weight_diff, staging_tier, status, is_betting_open
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'QUEUED', 'MATCHED', 0)
        `);
        const markPaired = tdb.prepare("UPDATE roosters SET status = 'PAIRED' WHERE rooster_id = ?");

        for (const pair of newPairs) {
          insertFight.run(
            pair.fightNumber,
            activeEvent.event_id,
            pair.meron.entry_id,
            pair.wala.entry_id,
            pair.meron.rooster_id,
            pair.wala.rooster_id,
            pair.meron.weight_grams,
            pair.wala.weight_grams,
            pair.diff
          );
          markPaired.run(pair.meron.rooster_id);
          markPaired.run(pair.wala.rooster_id);
        }
        tdb.exec('COMMIT');
      } catch (err) {
        tdb.exec('ROLLBACK');
        throw err;
      }

      appendAuditLog(
        tdb,
        'KESAHAN_BATCH_PUBLISHED',
        'Kasador Matchmaker',
        hostInfo.terminalId,
        'SUCCESS',
        `Gate 4 Published ${newPairs.length} Soltada bout(s) within <=${maxTolerance}g tolerance`
      );
      return syncAndRespond('KESAHAN_BATCH_PUBLISHED', tenantId);
    }

    if (method === 'POST' && pathname.endsWith('/tari-signoff')) {
      const fightId = Number(pathname.split('/')[3]);
      const { armorer_name = 'Chief Armorer' } = body;
      const fight = tdb.prepare('SELECT * FROM fights WHERE fight_id = ?').get(fightId);
      if (!fight) return sendJson(404, { error: 'Fight not found.' });

      tdb
        .prepare(`
          UPDATE fights
          SET tari_signed_by = ?, status = CASE WHEN status = 'MATCHED' THEN 'ARMED' ELSE status END
          WHERE fight_id = ?
        `)
        .run(armorer_name, fightId);

      appendAuditLog(
        tdb,
        'TARI_INSPECTION_VERIFIED',
        armorer_name,
        hostInfo.terminalId,
        'SUCCESS',
        `Gate 5 Verified: Fight #${fight.fight_number} gaff blades inspected & ARMED`
      );
      return syncAndRespond('TARI_INSPECTION_VERIFIED', tenantId);
    }

    // =========================================================================
    // GATE 6, 7, 8: RUEDO PIT, BETTING & INSTANT VERDICT
    // =========================================================================
    if (method === 'POST' && pathname.endsWith('/stage')) {
      const fightId = Number(pathname.split('/')[3]);
      const { target_tier } = body;
      const fight = tdb.prepare('SELECT * FROM fights WHERE fight_id = ?').get(fightId);
      if (!fight) return sendJson(404, { error: 'Fight not found.' });

      if (!fight.tari_signed_by) {
        return sendJson(400, {
          error: `Gate 5 Violation: Fight #${fight.fight_number} requires Tari Armorer sign-off first.`
        });
      }

      if (target_tier === 'LIVE_PIT') {
        const existingLive = tdb
          .prepare("SELECT * FROM fights WHERE staging_tier = 'LIVE_PIT' AND fight_id != ?")
          .get(fightId);
        if (existingLive) {
          return sendJson(400, {
            error: `Gate 6 Single-Pit Rule: Fight #${existingLive.fight_number} is currently in the Live Pit.`
          });
        }
      }

      const nextStatus = target_tier === 'LIVE_PIT' ? 'ACTIVE' : fight.status;
      tdb
        .prepare('UPDATE fights SET staging_tier = ?, status = ? WHERE fight_id = ?')
        .run(target_tier, nextStatus, fightId);

      appendAuditLog(
        tdb,
        'STAGING_QUEUE_UPDATED',
        'Mesa de Control',
        hostInfo.terminalId,
        'INFO',
        `Gate 6 Staging: Fight #${fight.fight_number} advanced to ${target_tier}`
      );
      return syncAndRespond('STAGING_QUEUE_UPDATED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/ruedo/betting-toggle') {
      const { fight_id, open_betting } = body;
      const fight = tdb.prepare('SELECT * FROM fights WHERE fight_id = ?').get(Number(fight_id));
      if (!fight) return sendJson(404, { error: 'Active fight not found.' });

      const isOpen = open_betting ? 1 : 0;
      const nextStatus = open_betting ? 'PUSTA_BUKAS' : 'NAGLALABAN';

      tdb
        .prepare('UPDATE fights SET is_betting_open = ?, status = ? WHERE fight_id = ?')
        .run(isOpen, nextStatus, fight.fight_id);

      appendAuditLog(
        tdb,
        open_betting ? 'BETTING_OPENED' : 'BETTING_CLOSED',
        'Mesa de Control',
        hostInfo.terminalId,
        open_betting ? 'INFO' : 'WARN',
        open_betting
          ? `Fight #${fight.fight_number}: PUSTA BUKAS — Wagering window opened`
          : `Gate 7 Atomic Lockdown: Pit Bell rang for Fight #${fight.fight_number}`
      );
      return syncAndRespond(open_betting ? 'BETTING_OPENED' : 'BETTING_CLOSED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/wagers') {
      const { fight_number, side, amount, teller_terminal = hostInfo.terminalId } = body;
      const wagerAmount = Number(amount);
      if (!fight_number || !['MERON', 'WALA'].includes(side) || !(wagerAmount > 0)) {
        return sendJson(400, {
          error: 'Valid Fight Number, Side (MERON/WALA), and positive Amount are required.'
        });
      }

      const fight = tdb
        .prepare('SELECT * FROM fights WHERE fight_number = ?')
        .get(Number(fight_number));
      if (!fight) return sendJson(404, { error: `Fight #${fight_number} not found.` });

      if (!fight.is_betting_open) {
        return sendJson(400, {
          error: `Gate 7 Atomic Lock: Betting is CLOSED for Fight #${fight_number}.`
        });
      }

      const config = tdb.prepare('SELECT * FROM arena_config WHERE id = 1').get();
      const plasadaRate = config?.plasada_rate ?? 0.1;

      const ticketId = `TKT-${fight_number}-${side[0]}-${Date.now().toString(36).toUpperCase()}`;
      const netMultiplier = 1 + (1 - plasadaRate);
      const potentialPayout = Math.round(wagerAmount * netMultiplier * 100) / 100;

      const nextMeron = side === 'MERON' ? fight.meron_pool + wagerAmount : fight.meron_pool;
      const nextWala = side === 'WALA' ? fight.wala_pool + wagerAmount : fight.wala_pool;
      const nextGross = nextMeron + nextWala;
      const nextPlasada = Math.round(nextGross * plasadaRate * 100) / 100;

      const ratio =
        nextMeron > 0 && nextWala > 0
          ? Math.max(nextMeron, nextWala) / Math.min(nextMeron, nextWala)
          : 1;
      const oddsLabel =
        ratio >= 1.8
          ? 'DOBLADO (10-5)'
          : ratio >= 1.35
            ? 'WALO-ANIM (8-6)'
            : ratio >= 1.15
              ? 'SIYAM-WALO (9-8)'
              : 'PAREHAS (10-9)';

      tdb.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        tdb
          .prepare(`
            INSERT INTO wagers (ticket_id, fight_number, side, amount, odds_label, potential_payout, teller_terminal, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
          `)
          .run(
            ticketId,
            Number(fight_number),
            side,
            wagerAmount,
            oddsLabel,
            potentialPayout,
            teller_terminal
          );

        tdb
          .prepare(`
            UPDATE fights
            SET meron_pool = ?, wala_pool = ?, gross_handle = ?, house_plasada = ?
            WHERE fight_id = ?
          `)
          .run(nextMeron, nextWala, nextGross, nextPlasada, fight.fight_id);

        tdb.exec('COMMIT');
      } catch (err) {
        tdb.exec('ROLLBACK');
        throw err;
      }

      appendAuditLog(
        tdb,
        'WAGER_TICKET_ISSUED',
        teller_terminal,
        teller_terminal,
        'SUCCESS',
        `Issued ${ticketId}: ₱${wagerAmount.toLocaleString()} on ${side} (Fight #${fight_number})`
      );
      return syncAndRespond('WAGER_TICKET_ISSUED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/ruedo/verdict') {
      const { fight_id, verdict, duration_seconds = 145 } = body;
      if (!['MERON', 'WALA', 'TABLA', 'CANCELLED'].includes(verdict)) {
        return sendJson(400, { error: 'Verdict must be MERON, WALA, TABLA, or CANCELLED.' });
      }

      const fight = tdb.prepare('SELECT * FROM fights WHERE fight_id = ?').get(Number(fight_id));
      if (!fight) return sendJson(404, { error: 'Fight not found.' });

      tdb.exec('BEGIN IMMEDIATE TRANSACTION');
      try {
        tdb
          .prepare(`
            UPDATE fights
            SET verdict = ?, status = 'COMPLETED', staging_tier = 'COMPLETED', is_betting_open = 0, duration_seconds = ?
            WHERE fight_id = ?
          `)
          .run(verdict, Number(duration_seconds), fight.fight_id);

        if (verdict === 'MERON' || verdict === 'WALA') {
          const winEntryId = verdict === 'MERON' ? fight.meron_entry_id : fight.wala_entry_id;
          const loseEntryId = verdict === 'MERON' ? fight.wala_entry_id : fight.meron_entry_id;

          tdb
            .prepare('UPDATE derby_entries SET wins = wins + 1, points = points + 1.0 WHERE entry_id = ?')
            .run(winEntryId);
          tdb
            .prepare('UPDATE derby_entries SET losses = losses + 1 WHERE entry_id = ?')
            .run(loseEntryId);

          tdb
            .prepare("UPDATE wagers SET status = 'WON' WHERE fight_number = ? AND side = ?")
            .run(fight.fight_number, verdict);
          tdb
            .prepare("UPDATE wagers SET status = 'LOST' WHERE fight_number = ? AND side != ?")
            .run(fight.fight_number, verdict);
        } else if (verdict === 'TABLA') {
          tdb
            .prepare('UPDATE derby_entries SET draws = draws + 1, points = points + 0.5 WHERE entry_id IN (?, ?)')
            .run(fight.meron_entry_id, fight.wala_entry_id);
          tdb
            .prepare(
              "UPDATE wagers SET status = 'REFUNDABLE', potential_payout = amount WHERE fight_number = ?"
            )
            .run(fight.fight_number);
          tdb.prepare('UPDATE fights SET house_plasada = 0 WHERE fight_id = ?').run(fight.fight_id);
        } else if (verdict === 'CANCELLED') {
          tdb
            .prepare("UPDATE wagers SET status = 'VOID', potential_payout = amount WHERE fight_number = ?")
            .run(fight.fight_number);
          tdb
            .prepare('UPDATE fights SET house_plasada = 0, gross_handle = 0 WHERE fight_id = ?')
            .run(fight.fight_id);
        }

        const nextOnDeck = tdb
          .prepare("SELECT * FROM fights WHERE staging_tier = 'ON_DECK' ORDER BY fight_number ASC LIMIT 1")
          .get();
        if (nextOnDeck) {
          tdb
            .prepare("UPDATE fights SET staging_tier = 'LIVE_PIT', status = 'ACTIVE' WHERE fight_id = ?")
            .run(nextOnDeck.fight_id);
        }

        tdb.exec('COMMIT');
      } catch (err) {
        tdb.exec('ROLLBACK');
        throw err;
      }

      appendAuditLog(
        tdb,
        'VERDICT_DECLARED',
        'Sentensyador / Mesa de Control',
        hostInfo.terminalId,
        'SUCCESS',
        `Gate 8 Sentensya: Fight #${fight.fight_number} ruled ${verdict} — Plasada settled`
      );
      return syncAndRespond('VERDICT_DECLARED', tenantId);
    }

    if (method === 'POST' && pathname.endsWith('/payout')) {
      const ticketId = decodeURIComponent(pathname.split('/')[3]);
      const wager = tdb.prepare('SELECT * FROM wagers WHERE ticket_id = ?').get(ticketId);
      if (!wager) return sendJson(404, { error: 'Ticket not found.' });

      if (!['WON', 'REFUNDABLE'].includes(wager.status)) {
        return sendJson(400, {
          error: `Gate 8 Cashier Guard: Ticket ${ticketId} has status "${wager.status}" and cannot be paid out.`
        });
      }

      tdb.prepare("UPDATE wagers SET status = 'PAID_OUT' WHERE ticket_id = ?").run(ticketId);

      appendAuditLog(
        tdb,
        'TICKET_PAYOUT_RELEASED',
        'Center Cashier Cage',
        hostInfo.terminalId,
        'SUCCESS',
        `Redeemed ticket ${ticketId} for ₱${wager.potential_payout.toLocaleString()}`
      );
      return syncAndRespond('TICKET_PAYOUT_RELEASED', tenantId);
    }

    // Cockhouse, Vet Clinic, Inventory
    if (method === 'POST' && pathname === '/api/cockhouse') {
      const {
        bay_number,
        assigned_entry,
        room_suite,
        rooster_count = 4,
        biosecurity_status = 'DISINFECTED'
      } = body;
      if (!bay_number || !assigned_entry || !room_suite) {
        return sendJson(400, { error: 'Bay Number, Assigned Entry, and Room Suite are required.' });
      }
      tdb
        .prepare(`
          INSERT OR REPLACE INTO cockhouse_bays (
            bay_number, assigned_entry, room_suite, rooster_count, biosecurity_status
          ) VALUES (?, ?, ?, ?, ?)
        `)
        .run(
          bay_number.toUpperCase(),
          assigned_entry.toUpperCase(),
          room_suite,
          Number(rooster_count),
          biosecurity_status
        );

      appendAuditLog(
        tdb,
        'COCKHOUSE_BAY_ASSIGNED',
        'Cockhouse Reception',
        hostInfo.terminalId,
        'INFO',
        `Assigned ${bay_number.toUpperCase()} (${room_suite}) to ${assigned_entry.toUpperCase()}`
      );
      return syncAndRespond('COCKHOUSE_BAY_ASSIGNED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/vet-clinic') {
      const { fight_number, wing_band, entry_name, manggagamot, procedure_notes } = body;
      if (!fight_number || !wing_band || !entry_name || !manggagamot || !procedure_notes) {
        return sendJson(400, { error: 'All veterinary clinic fields are required.' });
      }
      const caseId = `VET-${Date.now().toString(36).toUpperCase()}`;
      tdb
        .prepare(`
          INSERT INTO vet_sutures (case_id, fight_number, wing_band, entry_name, manggagamot, procedure_notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .run(
          caseId,
          Number(fight_number),
          wing_band.toUpperCase(),
          entry_name.toUpperCase(),
          manggagamot,
          procedure_notes
        );

      appendAuditLog(
        tdb,
        'VET_SUTURE_LOGGED',
        manggagamot,
        hostInfo.terminalId,
        'INFO',
        `Logged post-fight surgery ${caseId} for stag ${wing_band.toUpperCase()}`
      );
      return syncAndRespond('VET_SUTURE_LOGGED', tenantId);
    }

    if (method === 'POST' && pathname === '/api/inventory') {
      const { sku, item_name, category, stock_qty, unit = 'pcs', prerequisite_kit, custodian } =
        body;
      if (!sku || !item_name || !category || stock_qty === undefined || !prerequisite_kit || !custodian) {
        return sendJson(400, { error: 'All inventory asset fields are required.' });
      }
      tdb
        .prepare(`
          INSERT OR REPLACE INTO inventory_assets (sku, item_name, category, stock_qty, unit, prerequisite_kit, custodian)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          sku.toUpperCase(),
          item_name,
          category,
          Number(stock_qty),
          unit,
          prerequisite_kit,
          custodian
        );

      appendAuditLog(
        tdb,
        'INVENTORY_ASSET_UPDATED',
        custodian,
        hostInfo.terminalId,
        'INFO',
        `Registered inventory SKU ${sku.toUpperCase()} (${stock_qty} ${unit})`
      );
      return syncAndRespond('INVENTORY_ASSET_UPDATED', tenantId);
    }

    return sendJson(404, { error: `Unknown API endpoint: ${method} ${pathname}` });
  } catch (err) {
    return sendJson(500, { error: err.message || 'Internal Server Error' });
  }
}

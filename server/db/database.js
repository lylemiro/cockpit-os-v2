import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tenantsDbDir = path.join(__dirname, 'tenants');
const masterDbPath = path.join(__dirname, 'master_control_plane.db');

if (!fs.existsSync(tenantsDbDir)) {
  fs.mkdirSync(tenantsDbDir, { recursive: true });
}

// Master Control Plane DB (Manages Tenant Registry, Physical DB Files & Cross-DB User Access)
export const masterDb = new DatabaseSync(masterDbPath);

// Connection Pool for Physical Per-Tenant SQLite WAL Databases
const tenantDbPool = new Map();

export const ALL_23_PERMISSIONS = [
  'arena.config.manage',
  'security.whitelist.manage',
  'security.logtrail.export',
  'arbac.roles.crud',
  'arbac.staff.crud',
  'arbac.float.assign',
  'events.derby.schedule',
  'events.entries.enroll',
  'events.escrow.clear',
  'matchmaking.timbangan.weigh',
  'matchmaking.kasahan.pair',
  'matchmaking.soltada.publish',
  'matchmaking.tari.signoff',
  'ruedo.staging.advance',
  'ruedo.betting.toggle',
  'ruedo.verdict.declare',
  'ruedo.var.replay',
  'betting.ticket.issue',
  'cashier.payout.release',
  'betting.ticket.void',
  'finance.zreading.generate',
  'cockhouse.bays.manage',
  'clinic.vet.suture'
];

export function initializeDatabase() {
  masterDb.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;

    -- Physical Database-per-Tenant Registry
    CREATE TABLE IF NOT EXISTS tenants (
      tenant_id TEXT PRIMARY KEY,
      tenant_code TEXT UNIQUE NOT NULL,
      arena_name TEXT NOT NULL,
      db_file_name TEXT UNIQUE NOT NULL,
      gab_license TEXT NOT NULL,
      mayors_permit TEXT NOT NULL,
      bir_cas_min TEXT NOT NULL,
      isolation_mode TEXT NOT NULL DEFAULT 'DEDICATED_SQLITE_WAL_DB',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Multi-Tenant / Multi-Database User Directory
    CREATE TABLE IF NOT EXISTS tenant_db_users (
      global_user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      full_name TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      db_file_name TEXT NOT NULL,
      staff_code TEXT NOT NULL,
      role_name TEXT NOT NULL,
      access_level TEXT NOT NULL DEFAULT 'TENANT_DB_OPERATOR',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id) ON DELETE CASCADE
    );
  `);
}

/**
 * Opens or returns the cached physical SQLite WAL database instance for a specific Tenant.
 * Each tenant has its own isolated `.db` file on disk in `server/db/tenants/`.
 */
export function getTenantDb(tenantId) {
  if (!tenantId) return null;
  const tenant = masterDb
    .prepare('SELECT * FROM tenants WHERE tenant_id = ?')
    .get(tenantId);
  if (!tenant) return null;

  if (tenantDbPool.has(tenant.db_file_name)) {
    return tenantDbPool.get(tenant.db_file_name);
  }

  const fullPath = path.join(tenantsDbDir, tenant.db_file_name);
  const tdb = new DatabaseSync(fullPath);
  initializeTenantSchema(tdb);
  tenantDbPool.set(tenant.db_file_name, tdb);
  return tdb;
}

export function closeAndRemoveTenantDb(tenantId) {
  const tenant = masterDb
    .prepare('SELECT * FROM tenants WHERE tenant_id = ?')
    .get(tenantId);
  if (!tenant) return;

  const cached = tenantDbPool.get(tenant.db_file_name);
  if (cached) {
    try {
      cached.close();
    } catch {
      // Ignore close error
    }
    tenantDbPool.delete(tenant.db_file_name);
  }

  const fullPath = path.join(tenantsDbDir, tenant.db_file_name);
  for (const suffix of ['', '-wal', '-shm']) {
    const p = `${fullPath}${suffix}`;
    if (fs.existsSync(p)) {
      try {
        fs.unlinkSync(p);
      } catch {
        // Ignore file lock during cleanup
      }
    }
  }
}

export function getTenantDbFileMetrics(dbFileName) {
  const fullPath = path.join(tenantsDbDir, dbFileName);
  if (!fs.existsSync(fullPath)) {
    return { exists: false, sizeKb: 0, path: fullPath };
  }
  const stats = fs.statSync(fullPath);
  return {
    exists: true,
    sizeKb: Math.max(1, Math.round(stats.size / 1024)),
    path: `server/db/tenants/${dbFileName}`
  };
}

export function initializeTenantSchema(tdb) {
  tdb.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;

    -- 01. Arena Setup & Global Parameters (Isolated to this Tenant DB)
    CREATE TABLE IF NOT EXISTS arena_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      arena_name TEXT NOT NULL,
      gab_license TEXT NOT NULL,
      mayors_permit TEXT NOT NULL,
      bir_cas_min TEXT NOT NULL,
      plasada_rate REAL NOT NULL DEFAULT 0.10,
      weight_min_grams INTEGER NOT NULL DEFAULT 1800,
      weight_max_grams INTEGER NOT NULL DEFAULT 2650,
      kasahan_tolerance_grams INTEGER NOT NULL DEFAULT 30,
      min_rest_gap INTEGER NOT NULL DEFAULT 4,
      vip_seats INTEGER NOT NULL DEFAULT 320,
      lower_box_seats INTEGER NOT NULL DEFAULT 1450,
      upper_grandstand_seats INTEGER NOT NULL DEFAULT 3200,
      total_cockhouse_bays INTEGER NOT NULL DEFAULT 120,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Gate 0: Dynamic ARBAC Role Templates (23-Permission Granular Matrix)
    CREATE TABLE IF NOT EXISTS arbac_roles (
      role_id TEXT PRIMARY KEY,
      role_name TEXT UNIQUE NOT NULL,
      department_zone TEXT NOT NULL,
      require_device_binding INTEGER NOT NULL DEFAULT 1,
      max_cash_float REAL NOT NULL DEFAULT 0,
      permissions_json TEXT NOT NULL DEFAULT '[]',
      permissions_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Gate 0: Hardware Inventory & MAC Whitelist
    CREATE TABLE IF NOT EXISTS devices (
      device_id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      station_zone TEXT NOT NULL,
      mac_address TEXT UNIQUE NOT NULL,
      ip_address TEXT NOT NULL,
      is_authorized INTEGER DEFAULT 1,
      status TEXT DEFAULT 'Online',
      bound_operator_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Gate 0: Database Users / Employees & 23-Permission Granular ARBAC
    CREATE TABLE IF NOT EXISTS employees (
      employee_id TEXT PRIMARY KEY,
      staff_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      zone TEXT NOT NULL,
      bound_device_code TEXT DEFAULT '',
      pin_code TEXT NOT NULL DEFAULT '1234',
      status TEXT DEFAULT 'ON_DUTY',
      cash_float REAL DEFAULT 0,
      commission_rate REAL DEFAULT 0.02,
      pin_strikes INTEGER DEFAULT 0,
      is_locked INTEGER DEFAULT 0,
      permissions_json TEXT NOT NULL DEFAULT '[]',
      permissions_count INTEGER DEFAULT 23,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Gate 1: Single Active Derby Event Exclusivity
    CREATE TABLE IF NOT EXISTS derby_events (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      format TEXT NOT NULL,
      event_date TEXT NOT NULL,
      min_bet REAL NOT NULL DEFAULT 0,
      pot_fee REAL NOT NULL DEFAULT 0,
      promoter TEXT NOT NULL,
      plasada_split TEXT NOT NULL DEFAULT '70/30',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      is_archived INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Gate 2: Participant Entries & Pot Escrow Clearance
    CREATE TABLE IF NOT EXISTS derby_entries (
      entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      entry_name TEXT NOT NULL,
      owner_gallero TEXT NOT NULL,
      syndicate_tier TEXT NOT NULL DEFAULT 'VIP Ringside',
      pot_payment_status TEXT NOT NULL DEFAULT 'PAID',
      pot_amount REAL NOT NULL DEFAULT 0,
      wins REAL NOT NULL DEFAULT 0,
      draws REAL NOT NULL DEFAULT 0,
      losses REAL NOT NULL DEFAULT 0,
      points REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES derby_events(event_id) ON DELETE CASCADE
    );

    -- Gate 3: Timbangan Scale & Biometric Tagging
    CREATE TABLE IF NOT EXISTS roosters (
      rooster_id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      wing_band TEXT UNIQUE NOT NULL,
      leg_band TEXT NOT NULL,
      weight_grams INTEGER NOT NULL,
      plumage_color TEXT NOT NULL,
      leg_color TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'WEIGHED',
      weighed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entry_id) REFERENCES derby_entries(entry_id) ON DELETE CASCADE
    );

    -- Gate 4, 5, 6, 7, 8: Kasahan Soltadas, Tari Sign-off, 3-Tier Staging & Ruedo Pit
    CREATE TABLE IF NOT EXISTS fights (
      fight_id INTEGER PRIMARY KEY AUTOINCREMENT,
      fight_number INTEGER UNIQUE NOT NULL,
      event_id INTEGER NOT NULL,
      meron_entry_id INTEGER NOT NULL,
      wala_entry_id INTEGER NOT NULL,
      meron_rooster_id INTEGER NOT NULL,
      wala_rooster_id INTEGER NOT NULL,
      meron_weight INTEGER NOT NULL,
      wala_weight INTEGER NOT NULL,
      weight_diff INTEGER NOT NULL,
      tari_signed_by TEXT,
      staging_tier TEXT NOT NULL DEFAULT 'QUEUED',
      status TEXT NOT NULL DEFAULT 'MATCHED',
      is_betting_open INTEGER NOT NULL DEFAULT 0,
      meron_pool REAL NOT NULL DEFAULT 0,
      wala_pool REAL NOT NULL DEFAULT 0,
      gross_handle REAL NOT NULL DEFAULT 0,
      house_plasada REAL NOT NULL DEFAULT 0,
      verdict TEXT,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES derby_events(event_id) ON DELETE CASCADE
    );

    -- Smart Betting Tickets & Cashier Payouts
    CREATE TABLE IF NOT EXISTS wagers (
      ticket_id TEXT PRIMARY KEY,
      fight_number INTEGER NOT NULL,
      side TEXT NOT NULL,
      amount REAL NOT NULL,
      odds_label TEXT NOT NULL DEFAULT 'PAREHAS (10-9)',
      potential_payout REAL NOT NULL,
      teller_terminal TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Cock House Bays & Biosecurity
    CREATE TABLE IF NOT EXISTS cockhouse_bays (
      bay_number TEXT PRIMARY KEY,
      assigned_entry TEXT NOT NULL,
      room_suite TEXT NOT NULL,
      rooster_count INTEGER NOT NULL DEFAULT 1,
      biosecurity_status TEXT NOT NULL DEFAULT 'DISINFECTED',
      rfid_lock_state TEXT NOT NULL DEFAULT 'LOCKED',
      aircon_kwh REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Post-Fight Veterinary Suture & Recovery Clinic
    CREATE TABLE IF NOT EXISTS vet_sutures (
      case_id TEXT PRIMARY KEY,
      fight_number INTEGER NOT NULL,
      wing_band TEXT NOT NULL,
      entry_name TEXT NOT NULL,
      manggagamot TEXT NOT NULL,
      procedure_notes TEXT NOT NULL,
      recovery_status TEXT NOT NULL DEFAULT 'RECOVERING',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Inventory & Armory Assets
    CREATE TABLE IF NOT EXISTS inventory_assets (
      sku TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      unit TEXT NOT NULL,
      prerequisite_kit TEXT NOT NULL,
      custodian TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Gate & Turnstile Admissions
    CREATE TABLE IF NOT EXISTS gate_admissions (
      pass_id TEXT PRIMARY KEY,
      tier TEXT NOT NULL,
      fee REAL NOT NULL,
      gate_zone TEXT NOT NULL,
      patron_name TEXT,
      scanned_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- CRM VIP & Gallero Directory
    CREATE TABLE IF NOT EXISTS crm_patrons (
      patron_id TEXT PRIMARY KEY,
      syndicate_name TEXT NOT NULL,
      principal_gallero TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      vip_lounge TEXT NOT NULL,
      championship_titles INTEGER NOT NULL DEFAULT 0,
      credit_limit REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Tamper-Evident Audit Logtrail (Isolated inside this Tenant DB)
    CREATE TABLE IF NOT EXISTS audit_logtrail (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_code TEXT NOT NULL,
      actor TEXT NOT NULL,
      terminal_id TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'INFO',
      details TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export function appendAuditLog(tdb, eventCode, actor, terminalId, severity, details) {
  if (!tdb) return null;
  const stmt = tdb.prepare(`
    INSERT INTO audit_logtrail (event_code, actor, terminal_id, severity, details)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(eventCode, actor, terminalId, severity, details);
  return tdb.prepare('SELECT * FROM audit_logtrail WHERE log_id = ?').get(info.lastInsertRowid);
}

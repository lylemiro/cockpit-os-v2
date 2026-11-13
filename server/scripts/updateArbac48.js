import { DatabaseSync } from 'node:sqlite';
import { ALL_PERMISSION_KEYS, FILIPINO_SABONG_DEFAULT_ROLES } from '../../src/components/arbacCatalog.js';

console.log('Total ARBAC keys:', ALL_PERMISSION_KEYS.length);

// 1. Update Tenant DB
const tdb = new DatabaseSync('server/db/tenants/tenant_sjc_01_mwdb7iq3.db');
tdb.exec('BEGIN IMMEDIATE TRANSACTION');
try {
  // Update EMP-01
  const updateEmp = tdb.prepare(`
    UPDATE employees
    SET permissions_json = ?, permissions_count = ?, staff_code = 'lylemiro', role = 'Superadmin / Pangulo ng Sabungan'
    WHERE employee_id = 'EMP-01'
  `);
  updateEmp.run(JSON.stringify(ALL_PERMISSION_KEYS), ALL_PERMISSION_KEYS.length);

  // Clean up legacy ROLE-01 if present
  tdb.prepare("DELETE FROM arbac_roles WHERE role_id = 'ROLE-01'").run();

  // Upsert all 10 Filipino Sabong roles into arbac_roles
  const upsertRole = tdb.prepare(`
    INSERT INTO arbac_roles (role_id, role_name, department_zone, require_device_binding, max_cash_float, permissions_json, permissions_count)
    VALUES (?, ?, ?, 1, ?, ?, ?)
    ON CONFLICT(role_name) DO UPDATE SET
      department_zone = excluded.department_zone,
      max_cash_float = excluded.max_cash_float,
      permissions_json = excluded.permissions_json,
      permissions_count = excluded.permissions_count
  `);

  for (const r of FILIPINO_SABONG_DEFAULT_ROLES) {
    upsertRole.run(
      r.role_id,
      r.role_name,
      r.department_zone,
      r.max_cash_float,
      JSON.stringify(r.permissions),
      r.permissions.length
    );
  }

  tdb.exec('COMMIT');
  console.log('Successfully updated tenant DB with 48 perms for EMP-01 and 10 default roles');
} catch (err) {
  tdb.exec('ROLLBACK');
  console.error('Error updating tenant DB:', err);
}

// 2. Update Master Control Plane DB
const mdb = new DatabaseSync('server/db/master_control_plane.db');
const updateMasterUser = mdb.prepare(`
  UPDATE tenant_db_users
  SET staff_code = 'lylemiro', role_name = 'Superadmin / Pangulo ng Sabungan'
  WHERE username = 'lylemiro' OR staff_code = 'EMP-01'
`);
updateMasterUser.run();
console.log('Successfully updated master control plane tenant_db_users');

// Verify
const emp = tdb.prepare("SELECT staff_code, full_name, role, permissions_count FROM employees WHERE employee_id = 'EMP-01'").get();
console.log('Updated Employee:', emp);
const roles = tdb.prepare('SELECT role_name, permissions_count FROM arbac_roles').all();
console.log('Roles Count in Tenant DB:', roles.length);
roles.forEach(r => console.log(' - ' + r.role_name + ': ' + r.permissions_count + ' perms'));

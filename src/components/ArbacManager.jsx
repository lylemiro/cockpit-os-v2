import React, { useState } from 'react';
import { ARBAC_PERMISSION_GROUPS, ALL_PERMISSION_KEYS } from './arbacCatalog.js';
import { useArena } from '../context/ArenaContext.jsx';

export function ArbacManager() {
  const {
    arenaState,
    submitting,
    mutateApi,
    activeTenantId,
    switchTenant
  } = useArena();

  const [subTab, setSubTab] = useState('users'); // 'users' | 'roles' | 'tenants'
  const [notice, setNotice] = useState(null);

  // User CRUD State
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    role: 'Head Monton Cashier',
    zone: 'Center Cashier Cage',
    bound_device_code: 'T01',
    pin_code: '1234',
    cash_float: '50000',
    commission_rate: '0.02',
    permissions: [...ALL_PERMISSION_KEYS]
  });

  // Role CRUD State
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({
    role_name: '',
    department_zone: 'Center Cashier Cage',
    require_device_binding: true,
    max_cash_float: '100000',
    sync_assigned_employees: true,
    permissions: [...ALL_PERMISSION_KEYS]
  });

  // Multi-Tenant DB Provisioning Form
  const [tenantForm, setTenantForm] = useState({
    tenant_code: '',
    arena_name: '',
    gab_license: 'GAB-COL-2026-02',
    mayors_permit: 'LGU-MP-2026-02',
    bir_cas_min: 'MIN-2026-0002',
    full_name: '',
    role: 'Chief System Architect / CSO',
    zone: 'Executive Command Console',
    pin_code: '1234'
  });

  const employees = arenaState?.employees || [];
  const arbacRoles = arenaState?.arbacRoles || [];
  const devices = arenaState?.devices || [];
  const tenants = arenaState?.tenants || [];
  const multiDbUsers = arenaState?.multiDbUsers || [];

  const togglePermissionInList = (list, key) =>
    list.includes(key) ? list.filter((k) => k !== key) : [...list, key];

  const toggleDomainInList = (list, domainPerms) => {
    const domainKeys = domainPerms.map((p) => p.key);
    const allChecked = domainKeys.every((k) => list.includes(k));
    if (allChecked) {
      return list.filter((k) => !domainKeys.includes(k));
    }
    return Array.from(new Set([...list, ...domainKeys]));
  };

  const applyRolePresetToUser = (roleName) => {
    const foundRole = arbacRoles.find((r) => r.role_name === roleName);
    if (foundRole) {
      setUserForm((prev) => ({
        ...prev,
        role: foundRole.role_name,
        zone: foundRole.department_zone || prev.zone,
        permissions: Array.isArray(foundRole.permissions)
          ? [...foundRole.permissions]
          : prev.permissions
      }));
    } else {
      setUserForm((prev) => ({ ...prev, role: roleName }));
    }
  };

  const startEditEmployee = (emp) => {
    setEditingEmpId(emp.employee_id);
    setUserForm({
      full_name: emp.full_name,
      role: emp.role,
      zone: emp.zone,
      bound_device_code: emp.bound_device_code || '',
      pin_code: '',
      cash_float: String(emp.cash_float ?? 0),
      commission_rate: String(emp.commission_rate ?? 0.02),
      permissions: Array.isArray(emp.permissions) ? [...emp.permissions] : []
    });
  };

  const resetUserForm = () => {
    setEditingEmpId(null);
    setUserForm({
      full_name: '',
      role: arbacRoles[0]?.role_name || 'Head Monton Cashier',
      zone: 'Center Cashier Cage',
      bound_device_code: '',
      pin_code: '1234',
      cash_float: '50000',
      commission_rate: '0.02',
      permissions: [...ALL_PERMISSION_KEYS]
    });
  };

  const startEditRole = (role) => {
    setEditingRoleId(role.role_id);
    setRoleForm({
      role_name: role.role_name,
      department_zone: role.department_zone,
      require_device_binding: Boolean(role.require_device_binding),
      max_cash_float: String(role.max_cash_float ?? 0),
      sync_assigned_employees: true,
      permissions: Array.isArray(role.permissions) ? [...role.permissions] : []
    });
  };

  const resetRoleForm = () => {
    setEditingRoleId(null);
    setRoleForm({
      role_name: '',
      department_zone: 'Center Cashier Cage',
      require_device_binding: true,
      max_cash_float: '100000',
      sync_assigned_employees: true,
      permissions: [...ALL_PERMISSION_KEYS]
    });
  };

  const renderPermissionMatrix = (selectedPerms, onChangePerms) => (
    <div className="arbac-matrix-container">
      <div className="arbac-matrix-toolbar">
        <span className="form-label">
          Granular 23-Permission ARBAC Checklist ({selectedPerms.length} / 23 Active)
        </span>
        <div className="action-btn-row">
          <button
            type="button"
            className="btn-secondary-gold"
            onClick={() => onChangePerms([...ALL_PERMISSION_KEYS])}
          >
            Check All 23
          </button>
          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => onChangePerms([])}
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="arbac-domains-grid">
        {ARBAC_PERMISSION_GROUPS.map((group) => {
          const groupKeys = group.permissions.map((p) => p.key);
          const checkedCount = groupKeys.filter((k) => selectedPerms.includes(k)).length;
          const allDomainChecked = checkedCount === groupKeys.length;

          return (
            <div key={group.domainId} className="arbac-domain-box">
              <label className="arbac-domain-header">
                <input
                  type="checkbox"
                  checked={allDomainChecked}
                  onChange={() =>
                    onChangePerms(toggleDomainInList(selectedPerms, group.permissions))
                  }
                />
                <span>
                  {group.domainTitle} ({checkedCount}/{groupKeys.length})
                </span>
              </label>

              <div className="arbac-checkbox-list">
                {group.permissions.map((perm) => {
                  const isChecked = selectedPerms.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className={`arbac-checkbox-item ${isChecked ? 'is-checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          onChangePerms(togglePermissionInList(selectedPerms, perm.key))
                        }
                      />
                      <div className="arbac-perm-text">
                        <span className="arbac-perm-label">{perm.label}</span>
                        <span className="arbac-perm-key">{perm.key}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="form-stack">
      <div className="action-btn-row">
        <button
          type="button"
          className={subTab === 'users' ? 'btn-primary-emerald' : 'btn-secondary-gold'}
          onClick={() => setSubTab('users')}
        >
          Database Users & Granular 23-Checkbox CRUD ({employees.length})
        </button>
        <button
          type="button"
          className={subTab === 'roles' ? 'btn-primary-emerald' : 'btn-secondary-gold'}
          onClick={() => setSubTab('roles')}
        >
          ARBAC Role Templates CRUD ({arbacRoles.length})
        </button>
        <button
          type="button"
          className={subTab === 'tenants' ? 'btn-primary-emerald' : 'btn-secondary-gold'}
          onClick={() => setSubTab('tenants')}
        >
          Multi-Tenant Physical Databases ({tenants.length} DBs)
        </button>
      </div>

      {notice && <div className="status-alert-banner is-success">{notice}</div>}

      {/* TAB 1: DATABASE USERS & GRANULAR 23-CHECKBOX CRUD */}
      {subTab === 'users' && (
        <div className="workspace-split-grid">
          <form
            className="workspace-panel form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setNotice(null);
              if (editingEmpId) {
                const res = await mutateApi(`/api/employees/${editingEmpId}`, 'PUT', userForm);
                if (res.ok) {
                  setNotice(`Updated ARBAC user "${userForm.full_name}" (${userForm.permissions.length}/23 permissions).`);
                  resetUserForm();
                }
              } else {
                const res = await mutateApi('/api/employees', 'POST', userForm);
                if (res.ok) {
                  setNotice(`Created DB user "${userForm.full_name}" (${userForm.permissions.length}/23 permissions).`);
                  resetUserForm();
                }
              }
            }}
          >
            <div className="workspace-panel-title">
              {editingEmpId
                ? `Edit DB User (${editingEmpId})`
                : 'Enroll New Tenant Database User'}
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Operator Full Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Ma. Lourdes Santos"
                  value={userForm.full_name}
                  onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Security PIN (4–6 digits)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder={editingEmpId ? 'Leave blank to keep PIN' : 'e.g. 1234'}
                  required={!editingEmpId}
                  value={userForm.pin_code}
                  onChange={(e) => setUserForm({ ...userForm, pin_code: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Assign ARBAC Role Template</label>
                <input
                  className="form-input"
                  list="arbac-role-options"
                  required
                  value={userForm.role}
                  onChange={(e) => applyRolePresetToUser(e.target.value)}
                />
                <datalist id="arbac-role-options">
                  {arbacRoles.map((r) => (
                    <option key={r.role_id} value={r.role_name} />
                  ))}
                  <option value="Chief System Architect / CSO" />
                  <option value="Head Monton Cashier" />
                  <option value="Kasador / Chief Matchmaker" />
                  <option value="Mesa de Control Operator" />
                  <option value="Kristo Roving Teller" />
                </datalist>
              </div>
              <div className="form-field">
                <label className="form-label">Attribute: Assigned Arena Zone</label>
                <input
                  className="form-input"
                  required
                  value={userForm.zone}
                  onChange={(e) => setUserForm({ ...userForm, zone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Attribute: Bound Terminal Code</label>
                <select
                  className="form-select"
                  value={userForm.bound_device_code}
                  onChange={(e) =>
                    setUserForm({ ...userForm, bound_device_code: e.target.value })
                  }
                >
                  <option value="">-- Any Authorized Device --</option>
                  {devices.map((d) => (
                    <option key={d.device_id} value={d.code}>
                      {d.code} ({d.label})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Attribute: Vault Cash Float (₱)</label>
                <input
                  type="number"
                  className="form-input"
                  value={userForm.cash_float}
                  onChange={(e) => setUserForm({ ...userForm, cash_float: e.target.value })}
                />
              </div>
            </div>

            {renderPermissionMatrix(userForm.permissions, (nextPerms) =>
              setUserForm({ ...userForm, permissions: nextPerms })
            )}

            <div className="action-btn-row">
              <button type="submit" className="btn-primary-emerald" disabled={submitting}>
                {submitting
                  ? 'Saving ARBAC User...'
                  : editingEmpId
                    ? 'Update DB User & Checkboxes'
                    : '+ Create DB User with Checked Permissions'}
              </button>
              {editingEmpId && (
                <button type="button" className="btn-secondary-gold" onClick={resetUserForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div className="workspace-panel">
            <div className="workspace-panel-title">
              Tenant Database Users ({employees.length}) — Active DB:{' '}
              {arenaState?.activeTenant?.db_file_name}
            </div>
            {employees.length === 0 ? (
              <div className="module-empty-state">
                <div className="module-empty-title">No Database Users Enrolled</div>
                <div className="module-empty-desc">
                  Create an operator on the left and check their granular permissions from the 23-item ARBAC matrix.
                </div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Full Name & Role</th>
                      <th>Zone / Device</th>
                      <th>Granular Perms</th>
                      <th>Status</th>
                      <th>CRUD Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.employee_id}>
                        <td>
                          <strong>{emp.staff_code}</strong>
                        </td>
                        <td>
                          <div>
                            <strong>{emp.full_name}</strong>
                          </div>
                          <div className="activity-time-tag">{emp.role}</div>
                        </td>
                        <td>
                          {emp.zone} {emp.bound_device_code ? `• [${emp.bound_device_code}]` : ''}
                        </td>
                        <td>
                          <span className="status-badge is-passed">
                            {emp.permissions_count} / 23 Checked
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              emp.is_locked
                                ? 'is-pending'
                                : emp.status === 'ON_DUTY'
                                  ? 'is-passed'
                                  : 'is-pending'
                            }`}
                          >
                            {emp.is_locked ? 'LOCKED (3 Strikes)' : emp.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btn-row">
                            <button
                              type="button"
                              className="btn-secondary-gold"
                              onClick={() => startEditEmployee(emp)}
                            >
                              Edit / Perms
                            </button>
                            <button
                              type="button"
                              className="btn-secondary-gold"
                              onClick={() =>
                                mutateApi(`/api/employees/${emp.employee_id}`, 'PATCH', {})
                              }
                            >
                              {emp.is_locked ? 'Unlock PIN' : 'Shift'}
                            </button>
                            <button
                              type="button"
                              className="btn-danger-outline"
                              onClick={() =>
                                mutateApi(`/api/employees/${emp.employee_id}`, 'DELETE', {})
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ARBAC ROLE TEMPLATES CRUD */}
      {subTab === 'roles' && (
        <div className="workspace-split-grid">
          <form
            className="workspace-panel form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setNotice(null);
              if (editingRoleId) {
                const res = await mutateApi(
                  `/api/arbac/roles/${editingRoleId}`,
                  'PUT',
                  roleForm
                );
                if (res.ok) {
                  setNotice(`Updated ARBAC role "${roleForm.role_name}".`);
                  resetRoleForm();
                }
              } else {
                const res = await mutateApi('/api/arbac/roles', 'POST', roleForm);
                if (res.ok) {
                  setNotice(`Created ARBAC role "${roleForm.role_name}".`);
                  resetRoleForm();
                }
              }
            }}
          >
            <div className="workspace-panel-title">
              {editingRoleId ? 'Edit ARBAC Role Template' : 'Create ARBAC Role Template'}
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Role Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Senior Kasador Matchmaker"
                  value={roleForm.role_name}
                  onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Default Zone Attribute</label>
                <input
                  className="form-input"
                  required
                  value={roleForm.department_zone}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, department_zone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Max Cash Float Attribute (₱)</label>
                <input
                  type="number"
                  className="form-input"
                  value={roleForm.max_cash_float}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, max_cash_float: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Hardware Binding Policy</label>
                <label className="arbac-domain-header">
                  <input
                    type="checkbox"
                    checked={roleForm.require_device_binding}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        require_device_binding: e.target.checked
                      })
                    }
                  />
                  <span>Require 1-Operator 1-Machine Lock</span>
                </label>
              </div>
            </div>

            {renderPermissionMatrix(roleForm.permissions, (nextPerms) =>
              setRoleForm({ ...roleForm, permissions: nextPerms })
            )}

            <div className="action-btn-row">
              <button type="submit" className="btn-primary-emerald" disabled={submitting}>
                {editingRoleId ? 'Update Role & Sync Users' : '+ Save ARBAC Role Template'}
              </button>
              {editingRoleId && (
                <button type="button" className="btn-secondary-gold" onClick={resetRoleForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="workspace-panel">
            <div className="workspace-panel-title">
              Configured ARBAC Roles ({arbacRoles.length})
            </div>
            {arbacRoles.length === 0 ? (
              <div className="module-empty-state">
                <div className="module-empty-title">No ARBAC Roles Defined</div>
                <div className="module-empty-desc">
                  Create reusable role templates with pre-checked permissions on the left.
                </div>
              </div>
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Role Name</th>
                      <th>Default Zone</th>
                      <th>Device Lock</th>
                      <th>Permissions</th>
                      <th>CRUD Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arbacRoles.map((r) => (
                      <tr key={r.role_id}>
                        <td>
                          <strong>{r.role_name}</strong>
                        </td>
                        <td>{r.department_zone}</td>
                        <td>{r.require_device_binding ? 'Required' : 'Optional'}</td>
                        <td>
                          <span className="status-badge is-passed">
                            {r.permissions_count} / 23 Perms
                          </span>
                        </td>
                        <td>
                          <div className="action-btn-row">
                            <button
                              type="button"
                              className="btn-secondary-gold"
                              onClick={() => startEditRole(r)}
                            >
                              Edit Checkboxes
                            </button>
                            <button
                              type="button"
                              className="btn-danger-outline"
                              onClick={() =>
                                mutateApi(`/api/arbac/roles/${r.role_id}`, 'DELETE', {})
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MULTI-TENANT PHYSICAL DATABASES & CROSS-DB USERS */}
      {subTab === 'tenants' && (
        <div className="workspace-split-grid">
          <form
            className="workspace-panel form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setNotice(null);
              const res = await mutateApi('/api/tenants', 'POST', tenantForm);
              if (res.ok && res.data?.state?.activeTenantId) {
                switchTenant(res.data.state.activeTenantId);
                setNotice(
                  `Provisioned isolated SQLite database "${res.data.state.activeTenant?.db_file_name}" and switched workspace.`
                );
                setTenantForm({
                  ...tenantForm,
                  tenant_code: '',
                  arena_name: '',
                  full_name: ''
                });
              }
            }}
          >
            <div className="workspace-panel-title">
              Provision New Dedicated Tenant SQLite Database
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Tenant Code</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. PASAY-02"
                  value={tenantForm.tenant_code}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, tenant_code: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Coliseum / Tenant Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. PASAY COCKPIT ARENA"
                  value={tenantForm.arena_name}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, arena_name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="form-row-2col">
              <div className="form-field">
                <label className="form-label">Root DB Owner Full Name</label>
                <input
                  className="form-input"
                  required
                  placeholder="e.g. Engr. Roberto Gomez"
                  value={tenantForm.full_name}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, full_name: e.target.value })
                  }
                />
              </div>
              <div className="form-field">
                <label className="form-label">Root DB Owner PIN</label>
                <input
                  type="password"
                  className="form-input"
                  required
                  value={tenantForm.pin_code}
                  onChange={(e) =>
                    setTenantForm({ ...tenantForm, pin_code: e.target.value })
                  }
                />
              </div>
            </div>
            <button type="submit" className="btn-primary-emerald" disabled={submitting}>
              + Create Dedicated .db File & Switch Tenant
            </button>
          </form>

          <div className="form-stack">
            <div className="workspace-panel">
              <div className="workspace-panel-title">
                Physical Per-Tenant SQLite WAL Databases ({tenants.length})
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Coliseum Tenant</th>
                      <th>Physical SQLite File</th>
                      <th>Size</th>
                      <th>Workspace Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => {
                      const isCurrent = t.tenant_id === activeTenantId;
                      return (
                        <tr key={t.tenant_id}>
                          <td>
                            <strong>{t.tenant_code}</strong>
                          </td>
                          <td>{t.arena_name}</td>
                          <td>
                            <span className="terminal-code">{t.db_file_name}</span>
                          </td>
                          <td>{t.dbMetrics?.sizeKb || 0} KB</td>
                          <td>
                            <div className="action-btn-row">
                              {isCurrent ? (
                                <span className="status-badge is-passed">MOUNTED DB</span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-primary-emerald"
                                  onClick={() => switchTenant(t.tenant_id)}
                                >
                                  Mount DB
                                </button>
                              )}
                              {tenants.length > 1 && (
                                <button
                                  type="button"
                                  className="btn-danger-outline"
                                  onClick={() =>
                                    mutateApi(`/api/tenants/${t.tenant_id}`, 'DELETE', {})
                                  }
                                >
                                  Drop DB
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="workspace-panel">
              <div className="workspace-panel-title">
                Master Multi-Database User Directory ({multiDbUsers.length})
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Global Username</th>
                      <th>Operator Name</th>
                      <th>Dedicated SQLite File</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiDbUsers.map((u) => (
                      <tr key={u.global_user_id}>
                        <td>
                          <strong>{u.username}</strong>
                        </td>
                        <td>{u.full_name}</td>
                        <td>{u.db_file_name}</td>
                        <td>{u.role_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  Edit2,
  RefreshCw,
  HardDrive,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  ARBAC_PERMISSION_GROUPS,
  ALL_PERMISSION_KEYS,
  FILIPINO_SABONG_DEFAULT_ROLES
} from './arbacCatalog.js';
import { useArena } from '../context/ArenaContext.jsx';

export function ArbacManager() {
  const {
    arenaState,
    submitting,
    mutateApi,
    activeTenantId,
    switchTenant,
    notifySuccess,
    notifyInfo
  } = useArena();

  const [subTab, setSubTab] = useState('users'); // 'users' | 'roles' | 'tenants'
  const [notice, setNotice] = useState(null);

  // Layout View Modes: 'drawer' (collapsible left-to-right) or 'fullwidth'
  const [formMode, setFormMode] = useState('drawer');

  // Drawer / Form Visibility States
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isTenantFormOpen, setIsTenantFormOpen] = useState(false);

  // Search Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [tenantSearch, setTenantSearch] = useState('');

  // User CRUD State
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [userForm, setUserForm] = useState({
    full_name: '',
    role: 'Superadmin / Pangulo ng Sabungan',
    zone: 'Executive Command Console',
    bound_device_code: 'T01',
    pin_code: '1234',
    cash_float: '1000000',
    commission_rate: '0.00',
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
    role: 'Superadmin / Pangulo ng Sabungan',
    zone: 'Executive Command Console',
    pin_code: '1234'
  });

  const employees = arenaState?.employees || [];
  const arbacRoles = arenaState?.arbacRoles || [];
  const devices = arenaState?.devices || [];
  const tenants = arenaState?.tenants || [];
  const activeTenant = arenaState?.activeTenant;

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

  // Apply a Pre-Defined Filipino Sabong Role
  const applyFilipinoRolePreset = (preset) => {
    setUserForm((prev) => ({
      ...prev,
      role: preset.role_name,
      zone: preset.department_zone,
      cash_float: String(preset.max_cash_float),
      permissions: [...preset.permissions]
    }));
    notifyInfo(
      'Role Preset Applied',
      `Applied "${preset.role_name}" with ${preset.permissions.length}/23 checked permissions.`
    );
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
    setIsUserFormOpen(true);
  };

  const resetUserForm = () => {
    setEditingEmpId(null);
    setUserForm({
      full_name: '',
      role: 'Superadmin / Pangulo ng Sabungan',
      zone: 'Executive Command Console',
      bound_device_code: 'T01',
      pin_code: '1234',
      cash_float: '1000000',
      commission_rate: '0.00',
      permissions: [...ALL_PERMISSION_KEYS]
    });
    setIsUserFormOpen(false);
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
    setIsRoleFormOpen(true);
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
    setIsRoleFormOpen(false);
  };

  const resetTenantForm = () => {
    setTenantForm({
      tenant_code: '',
      arena_name: '',
      gab_license: 'GAB-COL-2026-02',
      mayors_permit: 'LGU-MP-2026-02',
      bir_cas_min: 'MIN-2026-0002',
      full_name: '',
      role: 'Superadmin / Pangulo ng Sabungan',
      zone: 'Executive Command Console',
      pin_code: '1234'
    });
    setIsTenantFormOpen(false);
  };

  // Sync 10 Filipino Legal Sabong Roles into active database
  const handleSyncFilipinoRoles = async () => {
    const res = await mutateApi('/api/arbac/roles/seed-filipino-defaults', 'POST', {});
    if (res.ok) {
      notifySuccess(
        'Roles Synchronized',
        'Loaded all 10 official Filipino Legal Sabong ARBAC Roles into physical database.'
      );
    }
  };

  // Renders the Granular 23-Permission ARBAC Checkbox Matrix
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

  // Filtered Lists
  const filteredEmployees = employees.filter((emp) => {
    const q = userSearch.toLowerCase();
    return (
      emp.full_name.toLowerCase().includes(q) ||
      emp.staff_code.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      (emp.zone && emp.zone.toLowerCase().includes(q))
    );
  });

  const filteredRoles = arbacRoles.filter((r) => {
    const q = roleSearch.toLowerCase();
    return (
      r.role_name.toLowerCase().includes(q) ||
      r.department_zone.toLowerCase().includes(q)
    );
  });

  const filteredTenants = tenants.filter((t) => {
    const q = tenantSearch.toLowerCase();
    return (
      t.arena_name.toLowerCase().includes(q) ||
      t.tenant_code.toLowerCase().includes(q) ||
      t.db_file_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="workspace-fullwidth-container">
      {/* 1. Subsystem Navigation Tabs */}
      <div className="subsystem-tabs-bar">
        <button
          type="button"
          className={`subsystem-tab-btn ${subTab === 'users' ? 'is-active' : ''}`}
          onClick={() => {
            setSubTab('users');
            setIsUserFormOpen(false);
          }}
        >
          Database Users &amp; Permissions ({employees.length})
        </button>
        <button
          type="button"
          className={`subsystem-tab-btn ${subTab === 'roles' ? 'is-active' : ''}`}
          onClick={() => {
            setSubTab('roles');
            setIsRoleFormOpen(false);
          }}
        >
          Role Templates ({arbacRoles.length})
        </button>
        <button
          type="button"
          className={`subsystem-tab-btn ${subTab === 'tenants' ? 'is-active' : ''}`}
          onClick={() => {
            setSubTab('tenants');
            setIsTenantFormOpen(false);
          }}
        >
          Physical Tenant Databases ({tenants.length})
        </button>
      </div>

      {notice && <div className="status-alert-banner is-success">{notice}</div>}

      {/* =========================================================================
         TAB 1: USERS & GRANULAR PERMISSIONS (FULLWIDTH + COLLAPSIBLE DRAWER)
         ========================================================================= */}
      {subTab === 'users' && (
        <div
          className={`workspace-collapsible-wrapper ${
            isUserFormOpen ? (formMode === 'fullwidth' ? 'is-fullwidth-form' : 'has-open-drawer') : 'is-fullwidth-table'
          }`}
        >
          {/* Collapsible Left-to-Right Drawer / Form */}
          {isUserFormOpen && (
            <aside className="workspace-drawer-left">
              <div className="drawer-header-bar">
                <div className="drawer-title-stack">
                  <span className="drawer-title">
                    {editingEmpId ? `Edit Operator: ${editingEmpId}` : 'Enroll New Operator'}
                  </span>
                  <span className="drawer-sub">
                    Assign role preset, terminal binding &amp; granular 23-checkbox clearance
                  </span>
                </div>
                <div className="drawer-header-actions">
                  <button
                    type="button"
                    className="drawer-mode-btn"
                    title={formMode === 'drawer' ? 'Expand to Fullwidth Form' : 'Collapse to Side Drawer'}
                    onClick={() => setFormMode((m) => (m === 'drawer' ? 'fullwidth' : 'drawer'))}
                  >
                    {formMode === 'drawer' ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                  </button>
                  <button
                    type="button"
                    className="drawer-close-btn"
                    title="Collapse Form Left"
                    onClick={resetUserForm}
                  >
                    <ChevronLeft size={16} />
                    <span>Hide Form</span>
                  </button>
                </div>
              </div>

              {/* Pre-Defined Filipino Sabong Roles Selector Bar */}
              <div className="filipino-roles-preset-bar">
                <div className="preset-bar-title-row">
                  <Sparkles size={14} className="card-title-icon-gold" />
                  <span className="preset-bar-title">Filipino Sabong Pre-Defined Roles (Click to Auto-Check):</span>
                </div>
                <div className="preset-pills-row">
                  {FILIPINO_SABONG_DEFAULT_ROLES.map((preset) => {
                    const isSelected = userForm.role === preset.role_name;
                    return (
                      <button
                        key={preset.role_id}
                        type="button"
                        className={`preset-role-pill ${isSelected ? 'is-active' : ''}`}
                        onClick={() => applyFilipinoRolePreset(preset)}
                        title={`${preset.filipino_title} • ${preset.description}`}
                      >
                        <span className="preset-pill-name">{preset.role_name}</span>
                        <span className="preset-pill-count">{preset.permissions.length}/23</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form
                className="drawer-form-body"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setNotice(null);
                  if (editingEmpId) {
                    const res = await mutateApi(`/api/employees/${editingEmpId}`, 'PUT', userForm);
                    if (res.ok) {
                      setNotice(`Updated operator "${userForm.full_name}" (${userForm.permissions.length}/23 perms).`);
                      resetUserForm();
                    }
                  } else {
                    const res = await mutateApi('/api/employees', 'POST', userForm);
                    if (res.ok) {
                      setNotice(`Enrolled operator "${userForm.full_name}" (${userForm.permissions.length}/23 perms).`);
                      resetUserForm();
                    }
                  }
                }}
              >
                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Operator Full Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Victoriano S. Santos"
                      value={userForm.full_name}
                      onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Security PIN (4–6 digits)</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder={editingEmpId ? 'Leave blank to preserve PIN' : 'e.g. 1234'}
                      required={!editingEmpId}
                      value={userForm.pin_code}
                      onChange={(e) => setUserForm({ ...userForm, pin_code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Assigned Role</label>
                    <input
                      className="form-input"
                      required
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Department / Arena Zone</label>
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
                    <label className="form-label">Bound Hardware Device</label>
                    <select
                      className="form-select"
                      value={userForm.bound_device_code}
                      onChange={(e) => setUserForm({ ...userForm, bound_device_code: e.target.value })}
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
                    <label className="form-label">Vault Cash Float (₱)</label>
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

                <div className="drawer-footer-actions">
                  <button type="submit" className="btn-primary-emerald" disabled={submitting}>
                    {submitting
                      ? 'Saving Operator...'
                      : editingEmpId
                      ? 'Save Changes & Checkboxes'
                      : '+ Enroll Operator with Checked Perms'}
                  </button>
                  <button type="button" className="btn-secondary-gold" onClick={resetUserForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </aside>
          )}

          {/* Fullwidth User Records Table */}
          {(!isUserFormOpen || formMode !== 'fullwidth') && (
            <main className="workspace-main-panel">
              {/* Operational Toolbar */}
              <div className="workspace-action-toolbar">
                <div className="toolbar-left-group">
                  <button
                    type="button"
                    className="btn-primary-emerald"
                    onClick={() => {
                      if (isUserFormOpen) {
                        resetUserForm();
                      } else {
                        setIsUserFormOpen(true);
                      }
                    }}
                  >
                    {isUserFormOpen ? (
                      <>
                        <ChevronLeft size={16} />
                        <span>Hide Enrollment Form</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Enroll New Operator</span>
                      </>
                    )}
                  </button>

                  <div className="toolbar-search-box">
                    <Search size={14} className="card-title-icon-emerald" />
                    <input
                      type="text"
                      className="toolbar-search-input"
                      placeholder="Search operator by name, code, role, zone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="toolbar-right-meta">
                  <span className="toolbar-meta-pill">
                    Mounted DB: <strong>{activeTenant?.db_file_name || 'Physical SQLite'}</strong>
                  </span>
                  <span className="toolbar-meta-pill is-emerald">
                    Active Staff: <strong>{filteredEmployees.length}</strong>
                  </span>
                </div>
              </div>

              {/* Fullwidth Table */}
              {filteredEmployees.length === 0 ? (
                <div className="module-empty-state">
                  <Users size={36} className="card-title-icon-emerald" />
                  <div className="module-empty-title">
                    {userSearch ? 'No Matching Operators Found' : 'No Database Operators Enrolled'}
                  </div>
                  <div className="module-empty-desc">
                    {userSearch
                      ? `No operator matches "${userSearch}". Clear search to view all.`
                      : 'Click "+ Enroll New Operator" above to add coliseum staff with pre-defined Filipino sabong roles.'}
                  </div>
                </div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table is-spacious">
                    <thead>
                      <tr>
                        <th>Staff Code</th>
                        <th>Full Name &amp; Filipino Role</th>
                        <th>Assigned Zone &amp; Device</th>
                        <th>Clearance Level</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => {
                        const permCount = emp.permissions?.length || emp.permissions_count || 0;
                        const pct = Math.round((permCount / 23) * 100);

                        return (
                          <tr key={emp.employee_id}>
                            <td>
                              <span className="table-code-badge">{emp.staff_code}</span>
                            </td>
                            <td>
                              <div className="table-user-cell">
                                <span className="table-user-name">{emp.full_name}</span>
                                <span className="table-user-role">{emp.role}</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-zone-cell">
                                <span>{emp.zone}</span>
                                <span className="table-device-tag">
                                  {emp.bound_device_code ? `Device: ${emp.bound_device_code}` : 'Any Authorized Terminal'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="table-perms-progress-box">
                                <span className="table-perms-pill">
                                  {permCount} / 23 Perms ({pct}%)
                                </span>
                                <div className="table-perms-track">
                                  <div
                                    className="table-perms-bar"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`status-pill ${emp.is_locked ? 'is-danger' : 'is-success'}`}>
                                {emp.is_locked ? 'LOCKED' : emp.status || 'ON DUTY'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button
                                  type="button"
                                  className="btn-table-edit"
                                  onClick={() => startEditEmployee(emp)}
                                  title="Edit Permissions & Attributes"
                                >
                                  <Edit2 size={13} />
                                  <span>Edit / Perms</span>
                                </button>
                                <button
                                  type="button"
                                  className="btn-table-shift"
                                  onClick={async () => {
                                    const nextStatus = emp.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
                                    await mutateApi(`/api/employees/${emp.employee_id}/shift`, 'POST', {
                                      status: nextStatus
                                    });
                                  }}
                                  title="Toggle On-Duty / Off-Duty Shift"
                                >
                                  Shift
                                </button>
                                {emp.staff_code !== 'EMP-01' && (
                                  <button
                                    type="button"
                                    className="btn-table-del"
                                    onClick={async () => {
                                      if (confirm(`Delete operator "${emp.full_name}" from active tenant database?`)) {
                                        await mutateApi(`/api/employees/${emp.employee_id}`, 'DELETE');
                                      }
                                    }}
                                    title="Delete Operator"
                                  >
                                    <Trash2 size={13} />
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
              )}
            </main>
          )}
        </div>
      )}

      {/* =========================================================================
         TAB 2: ROLE TEMPLATES (FULLWIDTH + COLLAPSIBLE DRAWER)
         ========================================================================= */}
      {subTab === 'roles' && (
        <div
          className={`workspace-collapsible-wrapper ${
            isRoleFormOpen ? (formMode === 'fullwidth' ? 'is-fullwidth-form' : 'has-open-drawer') : 'is-fullwidth-table'
          }`}
        >
          {isRoleFormOpen && (
            <aside className="workspace-drawer-left">
              <div className="drawer-header-bar">
                <div className="drawer-title-stack">
                  <span className="drawer-title">
                    {editingRoleId ? 'Edit Role Template' : 'Create Role Template'}
                  </span>
                  <span className="drawer-sub">Configure template name, zone &amp; default checked permissions</span>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={resetRoleForm}
                >
                  <ChevronLeft size={16} />
                  <span>Hide Form</span>
                </button>
              </div>

              <form
                className="drawer-form-body"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (editingRoleId) {
                    await mutateApi(`/api/arbac/roles/${editingRoleId}`, 'PUT', roleForm);
                    resetRoleForm();
                  } else {
                    await mutateApi('/api/arbac/roles', 'POST', roleForm);
                    resetRoleForm();
                  }
                }}
              >
                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Role Template Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Kasador / Matchmaker"
                      value={roleForm.role_name}
                      onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Department Zone</label>
                    <input
                      className="form-input"
                      required
                      value={roleForm.department_zone}
                      onChange={(e) => setRoleForm({ ...roleForm, department_zone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Max Cash Float Limit (₱)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={roleForm.max_cash_float}
                      onChange={(e) => setRoleForm({ ...roleForm, max_cash_float: e.target.value })}
                    />
                  </div>
                  <div className="form-field checkbox-field">
                    <label className="form-checkbox-label">
                      <input
                        type="checkbox"
                        checked={roleForm.require_device_binding}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, require_device_binding: e.target.checked })
                        }
                      />
                      <span>Enforce Hardware POS Binding</span>
                    </label>
                  </div>
                </div>

                {renderPermissionMatrix(roleForm.permissions, (nextPerms) =>
                  setRoleForm({ ...roleForm, permissions: nextPerms })
                )}

                <div className="drawer-footer-actions">
                  <button type="submit" className="btn-primary-emerald" disabled={submitting}>
                    {editingRoleId ? 'Update Role Template' : '+ Create Role Template'}
                  </button>
                  <button type="button" className="btn-secondary-gold" onClick={resetRoleForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </aside>
          )}

          {(!isRoleFormOpen || formMode !== 'fullwidth') && (
            <main className="workspace-main-panel">
              <div className="workspace-action-toolbar">
                <div className="toolbar-left-group">
                  <button
                    type="button"
                    className="btn-primary-emerald"
                    onClick={() => {
                      if (isRoleFormOpen) resetRoleForm();
                      else setIsRoleFormOpen(true);
                    }}
                  >
                    {isRoleFormOpen ? (
                      <>
                        <ChevronLeft size={16} />
                        <span>Hide Role Form</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Create Role Template</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-secondary-gold"
                    onClick={handleSyncFilipinoRoles}
                    title="Synchronize all 10 standard Filipino Legal Sabong roles into SQLite"
                  >
                    <Sparkles size={14} className="card-title-icon-gold" />
                    <span>Sync 10 Filipino Sabong Roles</span>
                  </button>

                  <div className="toolbar-search-box">
                    <Search size={14} className="card-title-icon-emerald" />
                    <input
                      type="text"
                      className="toolbar-search-input"
                      placeholder="Search roles..."
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="toolbar-right-meta">
                  <span className="toolbar-meta-pill">
                    Role Templates: <strong>{filteredRoles.length}</strong>
                  </span>
                </div>
              </div>

              <div className="data-table-wrap">
                <table className="data-table is-spacious">
                  <thead>
                    <tr>
                      <th>Role Template</th>
                      <th>Department Zone</th>
                      <th>Max Float</th>
                      <th>Clearance (23 Matrix)</th>
                      <th>Device Binding</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoles.map((r) => {
                      const count = r.permissions?.length || r.permissions_count || 0;
                      return (
                        <tr key={r.role_id}>
                          <td>
                            <strong>{r.role_name}</strong>
                          </td>
                          <td>{r.department_zone}</td>
                          <td>₱{Number(r.max_cash_float || 0).toLocaleString()}</td>
                          <td>
                            <span className="table-perms-pill">
                              {count} / 23 Perms Checked
                            </span>
                          </td>
                          <td>
                            <span className="table-tag">
                              {r.require_device_binding ? 'Enforced' : 'Unrestricted'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="btn-table-edit"
                                onClick={() => startEditRole(r)}
                              >
                                <Edit2 size={13} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="btn-table-del"
                                onClick={async () => {
                                  if (confirm(`Delete ARBAC role "${r.role_name}"?`)) {
                                    await mutateApi(`/api/arbac/roles/${r.role_id}`, 'DELETE');
                                  }
                                }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </main>
          )}
        </div>
      )}

      {/* =========================================================================
         TAB 3: PHYSICAL TENANT DATABASES (FULLWIDTH + COLLAPSIBLE DRAWER)
         ========================================================================= */}
      {subTab === 'tenants' && (
        <div
          className={`workspace-collapsible-wrapper ${
            isTenantFormOpen ? (formMode === 'fullwidth' ? 'is-fullwidth-form' : 'has-open-drawer') : 'is-fullwidth-table'
          }`}
        >
          {isTenantFormOpen && (
            <aside className="workspace-drawer-left">
              <div className="drawer-header-bar">
                <div className="drawer-title-stack">
                  <span className="drawer-title">Provision New Physical Tenant DB</span>
                  <span className="drawer-sub">Isolated SQLite WAL database file per coliseum venue</span>
                </div>
                <button
                  type="button"
                  className="drawer-close-btn"
                  onClick={resetTenantForm}
                >
                  <ChevronLeft size={16} />
                  <span>Hide Form</span>
                </button>
              </div>

              <form
                className="drawer-form-body"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await mutateApi('/api/tenants/provision', 'POST', tenantForm);
                  if (res.ok) {
                    resetTenantForm();
                  }
                }}
              >
                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Tenant Partition Code</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. CEBU-01"
                      value={tenantForm.tenant_code}
                      onChange={(e) =>
                        setTenantForm({ ...tenantForm, tenant_code: e.target.value.toUpperCase() })
                      }
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Coliseum Arena Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Cebu Coliseum Complex"
                      value={tenantForm.arena_name}
                      onChange={(e) => setTenantForm({ ...tenantForm, arena_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">GAB Coliseum License</label>
                    <input
                      className="form-input"
                      required
                      value={tenantForm.gab_license}
                      onChange={(e) => setTenantForm({ ...tenantForm, gab_license: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Mayor's Permit</label>
                    <input
                      className="form-input"
                      required
                      value={tenantForm.mayors_permit}
                      onChange={(e) => setTenantForm({ ...tenantForm, mayors_permit: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">BIR CAS Machine Identification Number (MIN)</label>
                  <input
                    className="form-input"
                    required
                    value={tenantForm.bir_cas_min}
                    onChange={(e) => setTenantForm({ ...tenantForm, bir_cas_min: e.target.value })}
                  />
                </div>

                <div className="form-row-2col">
                  <div className="form-field">
                    <label className="form-label">Primary Superadmin Full Name</label>
                    <input
                      className="form-input"
                      required
                      placeholder="e.g. Arch. Rodrigo M. Tan"
                      value={tenantForm.full_name}
                      onChange={(e) => setTenantForm({ ...tenantForm, full_name: e.target.value })}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Initial Security PIN (4–6 digits)</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      placeholder="1234"
                      value={tenantForm.pin_code}
                      onChange={(e) => setTenantForm({ ...tenantForm, pin_code: e.target.value })}
                    />
                  </div>
                </div>

                <div className="drawer-footer-actions">
                  <button type="submit" className="btn-primary-emerald" disabled={submitting}>
                    {submitting ? 'Creating Database File...' : '+ Provision Physical Tenant Database'}
                  </button>
                  <button type="button" className="btn-secondary-gold" onClick={resetTenantForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </aside>
          )}

          {(!isTenantFormOpen || formMode !== 'fullwidth') && (
            <main className="workspace-main-panel">
              <div className="workspace-action-toolbar">
                <div className="toolbar-left-group">
                  <button
                    type="button"
                    className="btn-primary-emerald"
                    onClick={() => {
                      if (isTenantFormOpen) resetTenantForm();
                      else setIsTenantFormOpen(true);
                    }}
                  >
                    {isTenantFormOpen ? (
                      <>
                        <ChevronLeft size={16} />
                        <span>Hide Provisioning Form</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Provision New Tenant Database</span>
                      </>
                    )}
                  </button>

                  <div className="toolbar-search-box">
                    <Search size={14} className="card-title-icon-emerald" />
                    <input
                      type="text"
                      className="toolbar-search-input"
                      placeholder="Search tenant databases..."
                      value={tenantSearch}
                      onChange={(e) => setTenantSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="toolbar-right-meta">
                  <span className="toolbar-meta-pill">
                    Tenants: <strong>{filteredTenants.length}</strong>
                  </span>
                </div>
              </div>

              <div className="data-table-wrap">
                <table className="data-table is-spacious">
                  <thead>
                    <tr>
                      <th>Drive Code</th>
                      <th>Arena Venue Name</th>
                      <th>Dedicated SQLite File</th>
                      <th>GAB License &amp; BIR MIN</th>
                      <th>Storage &amp; Mode</th>
                      <th>Status &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((t) => {
                      const isMounted = t.tenant_id === activeTenantId;
                      return (
                        <tr key={t.tenant_id} className={isMounted ? 'is-mounted-row' : ''}>
                          <td>
                            <span className="table-code-badge">{t.tenant_code}:</span>
                          </td>
                          <td>
                            <strong>{t.arena_name}</strong>
                          </td>
                          <td>
                            <code className="table-file-code">{t.db_file_name}</code>
                          </td>
                          <td>
                            <div className="table-sub-col">
                              <span>{t.gab_license || 'GAB-PENDING'}</span>
                              <span className="table-sub-muted">{t.bir_cas_min || 'BIR-MIN-PENDING'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="table-tag">
                              {t.dbMetrics?.sizeKb || 16} KB • WAL Mode
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              {isMounted ? (
                                <span className="status-pill is-success">ACTIVE MOUNT</span>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-table-edit"
                                  onClick={() => switchTenant(t.tenant_id)}
                                >
                                  <HardDrive size={13} />
                                  <span>Mount Drive</span>
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
            </main>
          )}
        </div>
      )}
    </div>
  );
}

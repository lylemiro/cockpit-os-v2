import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Edit2,
  HardDrive,
  Users,
  CheckCircle2,
  AlertCircle,
  Layers,
  Database
} from 'lucide-react';
import { FILIPINO_SABONG_DEFAULT_ROLES, ALL_PERMISSION_KEYS } from './arbacCatalog.js';
import { useArena } from '../context/ArenaContext.jsx';
import { UserEnrollmentCarouselModal } from './UserEnrollmentCarouselModal.jsx';
import { RoleTemplateCarouselModal } from './RoleTemplateCarouselModal.jsx';
import { TenantProvisionCarouselModal } from './TenantProvisionCarouselModal.jsx';

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

  // Carousel Modals Open States
  const [isUserCarouselOpen, setIsUserCarouselOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [isRoleCarouselOpen, setIsRoleCarouselOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const [isTenantCarouselOpen, setIsTenantCarouselOpen] = useState(false);

  // Search Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [tenantSearch, setTenantSearch] = useState('');

  const employees = arenaState?.employees || [];
  const arbacRoles = arenaState?.arbacRoles || [];
  const devices = arenaState?.devices || [];
  const tenants = arenaState?.tenants || [];
  const activeTenant = arenaState?.activeTenant;

  // Filtered operators
  const filteredEmployees = employees.filter((e) => {
    if (!userSearch.trim()) return true;
    const term = userSearch.toLowerCase();
    return (
      (e.full_name || '').toLowerCase().includes(term) ||
      (e.staff_code || '').toLowerCase().includes(term) ||
      (e.role || '').toLowerCase().includes(term) ||
      (e.zone || '').toLowerCase().includes(term)
    );
  });

  // Filtered roles
  const filteredRoles = arbacRoles.filter((r) => {
    if (!roleSearch.trim()) return true;
    const term = roleSearch.toLowerCase();
    return (
      (r.role_name || '').toLowerCase().includes(term) ||
      (r.department_zone || '').toLowerCase().includes(term)
    );
  });

  // Filtered tenant databases
  const filteredTenants = tenants.filter((t) => {
    if (!tenantSearch.trim()) return true;
    const term = tenantSearch.toLowerCase();
    return (
      (t.arena_name || '').toLowerCase().includes(term) ||
      (t.tenant_code || '').toLowerCase().includes(term) ||
      (t.db_file_name || '').toLowerCase().includes(term)
    );
  });

  // User Carousel Submit Handler
  const handleUserEnrollmentSubmit = async (formData) => {
    setNotice(null);
    if (editingEmployee) {
      const res = await mutateApi(
        `/api/employees/${editingEmployee.employee_id}`,
        'PUT',
        formData
      );
      if (res.ok) {
        notifySuccess(
          'Operator Updated',
          `Successfully saved changes for "${formData.full_name}" with ${formData.permissions.length}/${ALL_PERMISSION_KEYS.length} active permissions.`
        );
        setIsUserCarouselOpen(false);
        setEditingEmployee(null);
      }
    } else {
      const res = await mutateApi('/api/employees', 'POST', formData);
      if (res.ok) {
        notifySuccess(
          'Operator Enrolled',
          `Enrolled operator "${formData.full_name}" (${formData.role}) in active database.`
        );
        setIsUserCarouselOpen(false);
        setEditingEmployee(null);
      }
    }
  };

  // Role Carousel Submit Handler
  const handleRoleTemplateSubmit = async (formData) => {
    setNotice(null);
    if (editingRole) {
      const res = await mutateApi(
        `/api/arbac/roles/${editingRole.role_id}`,
        'PUT',
        formData
      );
      if (res.ok) {
        notifySuccess(
          'Role Template Updated',
          `Updated "${formData.role_name}" (${formData.permissions.length}/${ALL_PERMISSION_KEYS.length} checked permissions).`
        );
        setIsRoleCarouselOpen(false);
        setEditingRole(null);
      }
    } else {
      const res = await mutateApi('/api/arbac/roles', 'POST', formData);
      if (res.ok) {
        notifySuccess(
          'Role Template Published',
          `Published new role template "${formData.role_name}" to master catalog.`
        );
        setIsRoleCarouselOpen(false);
        setEditingRole(null);
      }
    }
  };

  // Tenant Provision Submit Handler
  const handleTenantProvisionSubmit = async (formData) => {
    setNotice(null);
    const res = await mutateApi('/api/tenants/provision', 'POST', formData);
    if (res.ok) {
      notifySuccess(
        'Database Drive Provisioned',
        `Successfully initialized physical SQLite WAL database for "${formData.arena_name}".`
      );
      setIsTenantCarouselOpen(false);
    }
  };

  // Sync 10 Filipino Legal Sabong Roles into active database
  const handleSyncFilipinoRoles = async () => {
    const res = await mutateApi(
      '/api/arbac/roles/seed-filipino-defaults',
      'POST',
      {}
    );
    if (res.ok) {
      notifySuccess(
        'Roles Synchronized',
        'Loaded all 10 official Filipino Legal Sabong ARBAC Roles into physical database.'
      );
    }
  };

  return (
    <div className="arbac-manager-fullscreen-workspace">
      {/* Dynamic Sub-Tab Selector Navigation */}
      <div className="workspace-subtab-bar">
        <button
          type="button"
          className={`subtab-pill ${subTab === 'users' ? 'is-active' : ''}`}
          onClick={() => setSubTab('users')}
        >
          <Users size={14} />
          <span>Database Users &amp; Permissions ({employees.length})</span>
        </button>

        <button
          type="button"
          className={`subtab-pill ${subTab === 'roles' ? 'is-active' : ''}`}
          onClick={() => setSubTab('roles')}
        >
          <Layers size={14} />
          <span>Role Templates ({arbacRoles.length})</span>
        </button>

        <button
          type="button"
          className={`subtab-pill ${subTab === 'tenants' ? 'is-active' : ''}`}
          onClick={() => setSubTab('tenants')}
        >
          <HardDrive size={14} />
          <span>Physical Tenant Databases ({tenants.length})</span>
        </button>
      </div>

      {notice && (
        <div className="module-banner is-emerald">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* =========================================================================
         TAB 1: DATABASE USERS (100% FULLWIDTH TABLE + CAROUSEL JOURNEY MODAL)
         ========================================================================= */}
      {subTab === 'users' && (
        <div className="fullwidth-module-container">
          {/* Action Toolbar */}
          <div className="workspace-action-toolbar">
            <div className="toolbar-left-group">
              <button
                type="button"
                className="btn-primary-emerald"
                onClick={() => {
                  setEditingEmployee(null);
                  setIsUserCarouselOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Enroll New Operator (Carousel Journey)</span>
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

          {/* Fullwidth User Records Table */}
          {filteredEmployees.length === 0 ? (
            <div className="module-empty-state">
              <Users size={40} className="card-title-icon-emerald" />
              <div className="module-empty-title">
                {userSearch ? 'No Matching Operators Found' : 'No Database Operators Enrolled'}
              </div>
              <div className="module-empty-desc">
                {userSearch
                  ? `No operator matches "${userSearch}". Clear search to view all.`
                  : 'Click "+ Enroll New Operator (Carousel Journey)" above to add staff with pre-defined Filipino sabong roles.'}
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
                    const permsCount = Array.isArray(emp.permissions)
                      ? emp.permissions.length
                      : 0;
                    const clearancePct = Math.round((permsCount / ALL_PERMISSION_KEYS.length) * 100);

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
                              {emp.bound_device_code
                                ? `Device: ${emp.bound_device_code}`
                                : 'Any Authorized Terminal'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="table-perms-progress-box">
                            <span className="table-perms-pill">
                              {permsCount} / {ALL_PERMISSION_KEYS.length} Perms ({clearancePct}%)
                            </span>
                            <div className="table-perms-track">
                              <div
                                className="table-perms-bar"
                                style={{ width: `${clearancePct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              emp.is_locked ? 'is-danger' : 'is-success'
                            }`}
                          >
                            {emp.is_locked ? 'LOCKED' : emp.status || 'ON DUTY'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions-cell">
                            <button
                              type="button"
                              className="btn-table-edit"
                              onClick={() => {
                                setEditingEmployee(emp);
                                setIsUserCarouselOpen(true);
                              }}
                              title="Edit Permissions & Attributes via Carousel Journey"
                            >
                              <Edit2 size={13} />
                              <span>Edit / Perms</span>
                            </button>

                            <button
                              type="button"
                              className="btn-table-shift"
                              onClick={async () => {
                                const nextStatus =
                                  emp.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
                                await mutateApi(
                                  `/api/employees/${emp.employee_id}/shift`,
                                  'POST',
                                  { status: nextStatus }
                                );
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
                                  if (
                                    confirm(
                                      `Delete operator "${emp.full_name}" from active tenant database?`
                                    )
                                  ) {
                                    await mutateApi(
                                      `/api/employees/${emp.employee_id}`,
                                      'DELETE'
                                    );
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
        </div>
      )}

      {/* =========================================================================
         TAB 2: ROLE TEMPLATES (100% FULLWIDTH TABLE + CAROUSEL JOURNEY MODAL)
         ========================================================================= */}
      {subTab === 'roles' && (
        <div className="fullwidth-module-container">
          <div className="workspace-action-toolbar">
            <div className="toolbar-left-group">
              <button
                type="button"
                className="btn-primary-emerald"
                onClick={() => {
                  setEditingRole(null);
                  setIsRoleCarouselOpen(true);
                }}
              >
                <Plus size={16} />
                <span>Create Role Template (Carousel Journey)</span>
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
                  <th>Clearance ({ALL_PERMISSION_KEYS.length} Matrix)</th>
                  <th>Device Binding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((r) => {
                  const count =
                    r.permissions?.length || r.permissions_count || 0;
                  return (
                    <tr key={r.role_id}>
                      <td>
                        <strong>{r.role_name}</strong>
                      </td>
                      <td>{r.department_zone}</td>
                      <td>₱{Number(r.max_cash_float || 0).toLocaleString()}</td>
                      <td>
                        <span className="table-perms-pill">
                          {count} / {ALL_PERMISSION_KEYS.length} Perms Checked
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
                            onClick={() => {
                              setEditingRole(r);
                              setIsRoleCarouselOpen(true);
                            }}
                          >
                            <Edit2 size={13} />
                            <span>Edit Role</span>
                          </button>
                          <button
                            type="button"
                            className="btn-table-del"
                            onClick={async () => {
                              if (confirm(`Delete ARBAC role "${r.role_name}"?`)) {
                                await mutateApi(
                                  `/api/arbac/roles/${r.role_id}`,
                                  'DELETE'
                                );
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
        </div>
      )}

      {/* =========================================================================
         TAB 3: PHYSICAL TENANT DATABASES (100% FULLWIDTH TABLE + CAROUSEL MODAL)
         ========================================================================= */}
      {subTab === 'tenants' && (
        <div className="fullwidth-module-container">
          <div className="workspace-action-toolbar">
            <div className="toolbar-left-group">
              <button
                type="button"
                className="btn-primary-emerald"
                onClick={() => setIsTenantCarouselOpen(true)}
              >
                <Plus size={16} />
                <span>Provision New Tenant Database (Carousel Journey)</span>
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
                    <tr
                      key={t.tenant_id}
                      className={isMounted ? 'is-mounted-row' : ''}
                    >
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
                          <span className="table-sub-muted">
                            {t.bir_cas_min || 'BIR-MIN-PENDING'}
                          </span>
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
                            <span className="status-pill is-success">
                              ACTIVE MOUNT
                            </span>
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
        </div>
      )}

      {/* =========================================================================
         FULL SCREEN CAROUSEL JOURNEY MODALS
         ========================================================================= */}
      <UserEnrollmentCarouselModal
        isOpen={isUserCarouselOpen}
        onClose={() => {
          setIsUserCarouselOpen(false);
          setEditingEmployee(null);
        }}
        editingEmployee={editingEmployee}
        devices={devices}
        activeTenant={activeTenant}
        submitting={submitting}
        onSubmit={handleUserEnrollmentSubmit}
      />

      <RoleTemplateCarouselModal
        isOpen={isRoleCarouselOpen}
        onClose={() => {
          setIsRoleCarouselOpen(false);
          setEditingRole(null);
        }}
        editingRole={editingRole}
        submitting={submitting}
        onSubmit={handleRoleTemplateSubmit}
      />

      <TenantProvisionCarouselModal
        isOpen={isTenantCarouselOpen}
        onClose={() => setIsTenantCarouselOpen(false)}
        submitting={submitting}
        onSubmit={handleTenantProvisionSubmit}
      />
    </div>
  );
}

# COCKPIT OS v2.4.0 — Developer Coding Instructions & Engineering Guidelines

> **Target Audience:** Frontend Engineers, Backend Developers, and System Architects contributing to COCKPIT OS.  
> **Repository:** `d:\COCKPIT OS v2`  
> **Core Architecture:** Node.js v24 Native SQLite (`node:sqlite` in WAL mode) + React 18 + Vite + RFC6455 WebSockets  
> **Edition:** Enterprise Zero-Trust Coliseum Multi-Tenant Edition

---

## 1. Golden Rules (Non-Negotiable Directives)

Every pull request, commit, and code change must comply with these five mandatory rules:

### Rule 1: 100% Centralized Styling — ZERO Inline CSS
* ❌ **STRICTLY FORBIDDEN:** `<div style={{ display: 'flex', color: '#10b981' }}>` or any inline `style={{ ... }}` in JSX.
* ✅ **MANDATORY:** All styling tokens and classes must reside in:
  - [`src/styles/variables.css`](file:///d:/COCKPIT%20OS%20v2/src/styles/variables.css) — Colors, typography, spacing, shadows, radii.
  - [`src/styles/desktop.css`](file:///d:/COCKPIT%20OS%20v2/src/styles/desktop.css) — Desktop shell, taskbar, top ribbon, Alt+Tab HUD, context menus.
  - [`src/styles/modules.css`](file:///d:/COCKPIT%20OS%20v2/src/styles/modules.css) — Window modals, forms, tables, ARBAC checkboxes, feedback banners.
* **Dynamic Coordinates Exception:** When dynamic coordinates are required (such as cursor-following context menus), set CSS custom properties on the DOM ref via JavaScript (`ref.current.style.setProperty('--ctx-x', `${x}px`)`), and reference them in CSS (`left: var(--ctx-x, 0)`). Never write JSX inline style strings.

### Rule 2: Zero Hardcoded Seed Data (100% Dynamic Lifecycle)
* ❌ **STRICTLY FORBIDDEN:** Hardcoding mock roosters, dummy employees, or sample fights into database initialization files.
* ✅ **MANDATORY:** 
  - Every tenant database starts with **0 records**.
  - All views must provide shimmer skeleton loading states during fetch, and human-friendly empty states when 0 records exist.
  - Use [`CentralizedFeedbackStates.jsx`](file:///d:/COCKPIT%20OS%20v2/src/components/CentralizedFeedbackStates.jsx) (`<LoadingState />`, `<EmptyState />`).

### Rule 3: Physical Database Isolation per Tenant
* ❌ **STRICTLY FORBIDDEN:** Storing multi-tenant coliseum records in a single database using a `tenant_id` column filter.
* ✅ **MANDATORY:**
  - The master control plane is isolated in `server/db/master_control_plane.db`.
  - Every arena tenant is assigned its own **physical SQLite file on disk** (`server/db/tenants/tenant_<code_hash>.db`).
  - Always route database queries through the active tenant connection from the pool (`getTenantDb(tenantId)`).

### Rule 4: Human-First Language (Zero Technical Jargon)
* ❌ **STRICTLY FORBIDDEN:** Exposing raw database errors (e.g., `SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: entries.entry_code`) to the user.
* ✅ **MANDATORY:**
  - Route all errors through [`src/utils/friendlyErrors.js`](file:///d:/COCKPIT%20OS%20v2/src/utils/friendlyErrors.js).
  - Translate technical codes into plain English with helpful action tips (e.g., *"Entry Code Taken: A rooster is already registered under this entry code. Tip: Check the entries list or use the next available number."*).

### Rule 5: Zero-Trust Security Enforcement (Gates 0–8)
* ❌ **STRICTLY FORBIDDEN:** Executing a downstream match, bet, or payout without checking upstream Gate clearance.
* ✅ **MANDATORY:**
  - All mutating actions must pass through [`server/middleware/zeroTrustGates.js`](file:///d:/COCKPIT%20OS%20v2/server/middleware/zeroTrustGates.js).
  - Ensure the user has the specific ARBAC permission key verified before writing to the database.

---

## 2. Directory Layout & Module Structure

When adding or modifying components, adhere to the standard monorepo folder layout:

```text
d:\COCKPIT OS v2\
├── docs/                   # Markdown architecture, guidelines & instructions
├── public/                 # Static assets, SVG emblems, wallpapers, sound cues
│   ├── assets/             # Wallpapers (cockpit_os_luxury_wallpaper.jpg, etc.)
│   └── favicon.svg         # SVG favicon
├── server/                 # Node.js 24 Native SQLite & WebSocket Backend
│   ├── db/                 # Physical SQLite connection pool & Master Control Plane
│   ├── middleware/         # Zero-Trust Gate 0–8 prerequisite validators
│   ├── modules/            # Tenant-isolated REST CRUD & SQLite relationship graph builder
│   ├── services/           # Live OS CPU, RAM, Disk & LAN IPv4 discovery
│   ├── ws/                 # RFC6455 WebSocket realtime mesh server
│   └── index.js            # Master server entry point
├── src/                    # Frontend React 18 + Vite Monorepo
│   ├── components/         # Desktop shell components (TopSystemBar, BottomTaskbar, AltTabSwitcher)
│   ├── context/            # React Context & State Management (ArenaContext.jsx)
│   ├── modules/            # Subsystem operational workspaces (SubsystemWorkspace.jsx)
│   ├── styles/             # Centralized CSS (variables.css, desktop.css, modules.css)
│   └── utils/              # Helper utilities (friendlyErrors.js, etc.)
├── index.html              # Entry HTML
├── package.json            # Scripts & dependencies
└── vite.config.js          # Vite config
```

---

## 3. Frontend Development Patterns

### 3.1 Consuming the Centralized State & Notifications
Always consume the centralized arena context via `useArena()`:

```jsx
import { useArena } from '../context/ArenaContext.jsx';

export function MyColiseumComponent() {
  const {
    arenaState,          // Live coliseum state (events, entries, wagers, gates)
    activeTenantId,      // Active mounted tenant drive ID
    authenticatedOperator, // Currently logged in staff member
    mutateApi,           // Centralized API mutator with automatic friendly errors
    notifySuccess,       // Trigger floating success toast
    notifyError,         // Trigger floating error toast with friendly translation
    notifyWarning        // Trigger floating warning toast
  } = useArena();

  const handleCreate = async () => {
    const res = await mutateApi('/api/entries/create', 'POST', {
      event_id: arenaState.activeEvent.id,
      entry_code: 'ENT-101',
      syndicate_name: 'Thunderbird Farm'
    }, {
      successTitle: 'Rooster Registered',
      successMessage: 'Entry ENT-101 successfully enrolled in today’s derby.'
    });

    if (res.ok) {
      // Automatic success toast triggered!
    }
  };

  return ( ... );
}
```

### 3.2 Adding a New Coliseum Subsystem / Application
To add a new subsystem into COCKPIT OS:
1. **Register the App metadata** in [`src/components/desktopAppsConfig.js`](file:///d:/COCKPIT%20OS%20v2/src/components/desktopAppsConfig.js):
   ```javascript
   {
     id: 'my-new-module',
     label: 'Biosecurity Lab',
     icon: 'ShieldAlert',
     gateTag: 'Gate 5',
     subtitle: 'Quarantine and Wing-Band Verification Lab',
     getCount: (state) => state?.quarantineBays?.length || 0
   }
   ```
2. **Add Workspace View** in [`src/modules/SubsystemWorkspace.jsx`](file:///d:/COCKPIT%20OS%20v2/src/modules/SubsystemWorkspace.jsx):
   - Handle `if (moduleId === 'my-new-module') { return <div className="workspace-panel">...</div>; }`.
3. **Add Executable Binary Entry** in Explorer:
   - Handled automatically by [`ModuleWindowModal.jsx`](file:///d:/COCKPIT%20OS%20v2/src/components/ModuleWindowModal.jsx), creating `BiosecurityLab.exe` with double-click launch and "Run as Admin".
4. **Style with CSS Classes**:
   - Add new classes to [`src/styles/modules.css`](file:///d:/COCKPIT%20OS%20v2/src/styles/modules.css). Never use inline styles.

### 3.3 Keyboard Shortcut & Event Listener Cleanup
When attaching global event listeners (such as <kbd>Alt</kbd> + <kbd>Tab</kbd> or right-click handlers), always return a cleanup function in `useEffect`:

```jsx
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault();
      // ...
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 4. Backend Development Patterns

### 4.1 Node.js 24 Native SQLite (`node:sqlite`)
COCKPIT OS uses the native Node.js 24 synchronous SQLite engine (`DatabaseSync`). Do not install external C++ bindings like `better-sqlite3`.

```javascript
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('server/db/tenants/tenant_sjc_01.db');
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 5000;
  PRAGMA foreign_keys = ON;
`);
```

### 4.2 Safe Prepared Statements & Parameter Binding
Always use parameterized queries (`prepare().run()` or `prepare().all()`) to guarantee zero SQL injection:

```javascript
// ✅ CORRECT:
const stmt = db.prepare(`
  INSERT INTO entries (id, event_id, entry_code, syndicate_name, created_at)
  VALUES (?, ?, ?, ?, datetime('now'))
`);
stmt.run(id, eventId, entryCode, syndicateName);

// ❌ FORBIDDEN:
db.exec(`INSERT INTO entries (id) VALUES ('${id}')`); // SQL Injection vulnerability!
```

### 4.3 Microsecond Audit Trail
Every mutating endpoint must write an entry to the tenant's `audit_logtrail` table:

```javascript
export function recordAuditLog(db, { operatorName, actionType, details, ipAddress }) {
  const stmt = db.prepare(`
    INSERT INTO audit_logtrail (id, operator_name, action_type, details, ip_address, timestamp_iso)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `);
  stmt.run(crypto.randomUUID(), operatorName, actionType, JSON.stringify(details), ipAddress);
}
```

---

## 5. Git Workflow & Commit Guidelines

### 5.1 Repository Setup
The project is versioned using Git. On a new machine or setup:
```bash
git init
git add .
git commit -m "feat: initial commit of COCKPIT OS v2.4.0 (Enterprise Zero-Trust Coliseo Edition)"
```

### 5.2 Commit Message Standard
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
* `feat:` A new coliseum feature or module (e.g. `feat: add alt-tab task switcher and desktop right-click menu`)
* `fix:` A bug fix or error translation improvement (e.g. `fix: translate SQLite foreign key violation into plain English`)
* `docs:` Documentation changes only (e.g. `docs: add comprehensive coding instructions and guidelines`)
* `style:` Changes that do not affect code logic (e.g. CSS updates in `variables.css` or `desktop.css`)
* `refactor:` Code restructuring with no behavior change (e.g. `refactor: split centralized feedback alerts into separate module`)

### 5.3 Pre-Commit Verification Checklist
Before committing any changes, run the production build check to ensure zero syntax or bundling errors:

```bash
npm run build
```

Verify that the output finishes with `code 0`:
```text
✓ built in 4.xxs
dist/index.html
dist/assets/index-*.css
dist/assets/index-*.js
```

---
*COCKPIT OS v2.4.0 — High-Performance, Zero-Trust Coliseum Operations Engineering Standards.*

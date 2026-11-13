# COCKPIT OS v2.4.0 — Complete System Documentation & Guidelines
**Enterprise Zero-Trust Coliseum Operations Environment**

> **Author:** DeepMind Agentic Assistant & Arena Architecture Engineering Team  
> **Target Platform:** Windows 10/11 Offline-First Air-Gapped Local LAN Coliseum Arenas  
> **Runtime:** Node.js v24.14.0 Native SQLite (`node:sqlite` in WAL mode) + React 18 + Vite + RFC6455 WebSockets  
> **Release Edition:** Enterprise Multi-Tenant Coliseo Edition (v2.4.0)

---

## Table of Contents
1. [Core Design Directives & Non-Negotiable Standards](#1-core-design-directives--non-negotiable-standards)
2. [Monorepo Directory Structure](#2-monorepo-directory-structure)
3. [Physical Multi-Tenant, Multi-Database, Multi-User Isolation](#3-physical-multi-tenant-multi-database-multi-user-isolation)
4. [Zero-Trust Gate Matrix (Gates 0 through 8)](#4-zero-trust-gate-matrix-gates-0-through-8)
5. [Granular 23-Checkbox ARBAC Matrix](#5-granular-23-checkbox-arbac-matrix)
6. [Dynamic Data Lifecycle (Zero Seed Data Policy)](#6-dynamic-data-lifecycle-zero-seed-data-policy)
7. [Obsidian-Style Interactive Database Relationship Graph](#7-obsidian-style-interactive-database-relationship-graph)
8. [Windows 11 Desktop UI Shell & Interaction Model](#8-windows-11-desktop-ui-shell--interaction-model)
   - [Alt + Tab Task Switcher](#alt--tab-task-switcher)
   - [Desktop & App Right-Click Context Menus](#desktop--app-right-click-context-menus)
   - [Windows Explorer with Clickable Executables (.exe)](#windows-explorer-with-clickable-executables-exe)
   - [Wallpaper Management & Night Mode](#wallpaper-management--night-mode)
9. [Centralized Human-Friendly Feedback & Error Translation](#9-centralized-human-friendly-feedback--error-translation)
10. [Single-Click Bootloader, Persistence & Kiosk Launch](#10-single-click-bootloader-persistence--kiosk-launch)
11. [Operational Roles & Workflow Guide](#11-operational-roles--workflow-guide)

---

## 1. Core Design Directives & Non-Negotiable Standards

Throughout the entire lifecycle of COCKPIT OS, the following seven architectural commitments govern all development:

1. **100% Centralized Branding — Zero Inline CSS:**
   - **Never** write `style={{ ... }}` in any React JSX component.
   - All styling tokens reside in [`src/styles/variables.css`](file:///d:/COCKPIT%20OS%20v2/src/styles/variables.css).
   - Desktop shell and layout rules reside in [`src/styles/desktop.css`](file:///d:/COCKPIT%20OS%20v2/src/styles/desktop.css).
   - Module workspaces, modals, tables, and form cards reside in [`src/styles/modules.css`](file:///d:/COCKPIT%20OS%20v2/src/styles/modules.css).
   - Dynamic positioning (such as cursor coordinates for context menus) must be set via CSS custom properties (`--ctx-x`, `--ctx-y`) on DOM elements, never inline JSX style strings.

2. **Standard Recommended Monorepo Structure:**
   - Avoid legacy uppercase spaced folders (`ARENA SETUP`, `USERS PERMISSIONS`).
   - Use standard monorepo directories: `public/`, `server/`, `src/`, `docs/`, `dist/`.

3. **Zero Hardcoded Seed Data (100% Dynamic):**
   - The system boots up completely clean and dynamic.
   - Tables start with 0 records. No fake roosters, mock employees, or dummy fights are ever hardcoded into the SQLite schema.
   - All telemetry cards, lists, tables, and sidebars must feature shimmer skeleton loading states and human-friendly empty states.

4. **Multi-Tenant Physical Isolation:**
   - Shared tables with a `tenant_id` column are strictly rejected for coliseum arena operations.
   - Every arena tenant provisioned on the machine gets its own **dedicated, physically isolated SQLite database file** in write-ahead logging (WAL) mode (`server/db/tenants/tenant_<code_hash>.db`).
   - Cross-database orchestration is managed strictly by the master control plane (`server/db/master_control_plane.db`).

5. **Granular ARBAC Checkbox CRUD:**
   - Roles and staff accounts are not static enums.
   - Full Create, Read, Update, and Delete operations are provided for both Database Users (`employees`) and Role Templates (`arbac_roles`).
   - Each user can be toggled across 23 distinct permission checkboxes grouped into 6 regulatory domains.

6. **Air-Gapped Offline-First Reliability:**
   - Operates 100% autonomously on an isolated local network (LAN / Wi-Fi hotspot) without internet connection, third-party CDNs, or external cloud dependencies.
   - Telemetry syncs across handheld devices via a zero-dependency RFC6455 WebSocket hub.

7. **Human-First Language (Zero Technical Jargon):**
   - Database errors (e.g. SQLite unique constraints, foreign keys) and network interruptions are translated into plain, reassuring English with clear tips. Non-technical cashiers, referees, and arena staff can troubleshoot issues with zero friction.

---

## 2. Monorepo Directory Structure

```text
d:\COCKPIT OS v2\
├── CockpitOS.exe                   # C# Native Single-Click Bootloader (Compiled via .NET 64 csc.exe)
├── Launch_Cockpit_OS.bat           # Single-Click Windows Batch Boot Script & Kiosk Window Launcher
├── docs/
│   ├── ARCHITECTURE.md             # High-level architecture blueprint
│   └── SYSTEM_GUIDELINES.md        # Comprehensive guidelines & complete reference (this document)
├── public/
│   ├── favicon.svg                 # Scalable origami chevron/rooster SVG emblem
│   ├── assets/
│   │   ├── brand-favicon.png       # 3D faceted geometric origami rooster/chevron favicon
│   │   ├── cockpit_os_luxury_wallpaper.jpg # Default: Subtle, classy wavy emerald silk wallpaper
│   │   ├── wallpaper_v2.jpg        # Coliseo Arena: Centered champion gamecock (Night Mode)
│   │   ├── wallpaper_v3.jpg        # Coliseo Dome: Cinematic widescreen right-platform staging
│   │   └── rooster-hero.jpg        # Champion Philippine Gamefowl showcase image
├── server/
│   ├── index.js                    # HTTP REST Server, Static Dist Host, & WebSocket Port 4000
│   ├── db/
│   │   ├── database.js             # Physical Multi-Tenant Connection Pool & Schema DDL
│   │   ├── master_control_plane.db # Master Control Plane: Tenant registry & user directory
│   │   └── tenants/                # Dynamic Directory: tenant_<code_hash>.db physical files
│   ├── middleware/
│   │   └── zeroTrustGates.js       # Gate 0–8 prerequisite evaluation engine
│   ├── modules/
│   │   └── apiRouter.js            # REST CRUD Endpoints + SQLite Graph Introspection
│   ├── services/
│   │   └── lanDiscovery.js         # Realtime CPU, RAM, Disk, LAN IPv4 & Terminal ID discovery
│   └── ws/
│       └── wsHub.js                # Zero-dependency RFC6455 WebSocket server
├── src/
│   ├── components/
│   │   ├── AltTabSwitcher.jsx      # Windows 11 HUD Task Switcher (Alt + Tab keyboard listener)
│   │   ├── AppIconGlyph.jsx        # Unified icon resolver for SVG & Lucide glyphs
│   │   ├── arbacCatalog.js         # 23-Permission Catalog across 6 Operational Domains
│   │   ├── ArbacManager.jsx        # Dynamic 23-Checkbox CRUD for DB Users, Roles & Tenants
│   │   ├── BootAndLoginScreen.jsx  # Kernel Boot Animation, PIN Login, & First-Boot Setup Wizard
│   │   ├── BottomTaskbar.jsx       # Taskbar with Start Menu, Quick Search, 16 App Dock, & Tray
│   │   ├── CenterHeroCanvas.jsx    # Centered Frosted-Glass OS Brand Placard & Gate Status
│   │   ├── CentralizedFeedbackStates.jsx # Toast Notifications, Loading, Empty, Warning & Error Alerts
│   │   ├── DatabaseRelationshipGraph.jsx # Force-Directed Canvas Physics Graph with Table Nodes
│   │   ├── desktopAppsConfig.js    # Registry of all 16 Coliseum Modules & Subsystems
│   │   ├── DesktopContextMenu.jsx  # Desktop Wallpaper & App Tile Right-Click Context Menu
│   │   ├── DesktopIconGrid.jsx     # 3-Column Desktop Launcher Grid with Live Badges
│   │   ├── ModuleWindowModal.jsx   # Windows 11 Explorer multi-tab window with .exe binaries
│   │   ├── TelemetrySidebar.jsx    # Realtime Operations, System Health, and Live Terminal Cards
│   │   └── TopSystemBar.jsx        # Top Ribbon with Mounted Drive, Operator, LAN IP, Lock/Reboot
│   ├── context/
│   │   └── ArenaContext.jsx        # React Context: Multi-tenant state, session persistence, toasts
│   ├── modules/
│   │   └── SubsystemWorkspace.jsx  # Workspace forms and management tables for all 16 modules
│   ├── styles/
│   │   ├── variables.css           # Design tokens, color palette, typography, radii, shadows
│   │   ├── desktop.css             # Desktop shell, Alt+Tab, context menu, taskbar, top bar
│   │   └── modules.css             # Explorer window, ARBAC checkboxes, graph canvas, feedback states
│   ├── utils/
│   │   └── friendlyErrors.js       # Centralized human-friendly error translation engine
│   ├── App.jsx                     # Root application container & switcher
│   └── main.jsx                    # React 18 DOM mount point
├── dist/                           # Production build bundle served directly by server
├── index.html                      # HTML5 entry with meta viewport and SVG favicon link
├── package.json                    # Dependencies & build scripts
└── vite.config.js                  # Vite configuration with React plugin
```

---

## 3. Physical Multi-Tenant, Multi-Database, Multi-User Isolation

```
                                  +------------------------------------+
                                  |    server/db/database.js           |
                                  |   Master Connection Pool & Cache   |
                                  +-----------------+------------------+
                                                    |
                   +--------------------------------+--------------------------------+
                   |                                                                 |
                   v                                                                 v
+------------------------------------+                             +------------------------------------+
| server/db/master_control_plane.db  |                             | server/db/tenants/                 |
| (Control Plane Registry)           |                             | (Physical Tenant SQLite Databases) |
+------------------------------------+                             +------------------------------------+
| * tenants                          |                             | [tenant_sjc_01_mwdb7iq3.db]        |
|   - tenant_id, tenant_code         |                             | * arena_config, gab_license        |
|   - arena_name, db_file_name       |                             | * arbac_roles (Custom Role DDL)    |
|   - created_at, status             |                             | * employees (23-perm staff)        |
|                                    |                             | * entries, roosters, timbangan     |
| * tenant_db_users                  |                             | * paired_fights, wagers, payouts   |
|   - cross_user_id, staff_code      |                             | * audit_logtrail                   |
|   - assigned_tenant_id             |                             +------------------------------------+
|   - full_name, role_title          |                             | [tenant_pasay_02_k9f18m2b.db]      |
|   - pin_hash, failed_attempts      |                             | * 100% Isolated Records & WAL      |
+------------------------------------+                             +------------------------------------+
```

### Architectural Principles:
1. **Master Control Plane (`master_control_plane.db`):**
   - Keeps track of all provisioned arenas (`tenants` table) and multi-database users (`tenant_db_users` table).
   - Performs cross-tenant administrative routing and authentication pre-checks.
2. **Dedicated Physical Tenant Database Files:**
   - Every tenant has its own SQLite file on disk (`tenant_<tenant_code>_<random_hash>.db`) in `server/db/tenants/`.
   - Each tenant database runs in **WAL (Write-Ahead Logging)** mode with `busy_timeout = 5000` ms and `foreign_keys = ON`.
   - Complete physical separation ensures that no query can accidentally leak records, bets, or biometric weights across arenas.
3. **Dynamic Connection Pooling:**
   - The server maintains a cached dictionary of open tenant connections.
   - When a request arrives with an `X-Tenant-Id` header, the pool routes the transaction to that tenant's physical SQLite instance.

---

## 4. Zero-Trust Gate Matrix (Gates 0 through 8)

COCKPIT OS enforces an 8-stage prerequisite security pipeline for every match, weigh-in, and payout:

| Gate | Name | Operational Domain | Prerequisite Validation Rule |
| :---: | :--- | :--- | :--- |
| **Gate 0** | **Identity & ARBAC Verification** | System Access | Valid numeric PIN (4–6 digits), staff code assigned to current tenant DB, account not locked (strikes < 3). |
| **Gate 1** | **Single Active Event Exclusivity** | Event Governance | Exactly one event active with status `'IN_PROGRESS'`. Prevents split-pot fraud across multiple tournaments. |
| **Gate 2** | **Syndicate Entry Registration** | Entry & Registration | Rooster entry code registered, handler syndicate verified, entry fee logged. |
| **Gate 3** | **Biometric Weigh-In & Banding** | Timbangan Scale | Weight captured within tolerance (`1,800g` to `2,650g`), tamper-evident wing band serial stamped. |
| **Gate 4** | **Kasahan Matchmaking Sign-Off** | Pairing Engine | Weight difference between Meron and Wala $\le$ arena tolerance (`30g`), mandatory rest gap observed. |
| **Gate 5** | **Tari Gaffing & Biosecurity Suture** | Tari Armory | Blade length verified, left-leg mount secured, armory official biometric/PIN sign-off recorded. |
| **Gate 6** | **Ruedo Pit Entry & Fight Timer** | Coliseum Arena | Both cocks staged in pit, sentenciador referee present, fight clock initialized (10-minute cap). |
| **Gate 7** | **Pari-Mutuel Grandstand Wagering** | Betting Pool | Betting window open, logro odds calculated, betting closed before first strike is delivered. |
| **Gate 8** | **Dual Sign-Off Payout & Plasada Audit** | Cashier & Settlement | Referee verdict confirmed, winning ticket serial validated, 10% house commission retained and audited. |

---

## 5. Granular 23-Checkbox ARBAC Matrix

ARBAC (Attribute & Role-Based Access Control) provides granular permission checkboxes grouped across 6 operational domains:

```
[ARBAC DOMAINS]
├── 1. Arena Governance (4 perms)
│   ├── config.venue_edit       # Modify coliseum parameters, GAB license, Mayor's Permit
│   ├── config.licensing_view   # Inspect BIR CAS MIN and regulatory certificates
│   ├── system.tenant_create    # Provision new physical arena databases
│   └── system.db_backup        # Create tamper-evident SQLite WAL snapshots
│
├── 2. Staff & Identity (4 perms)
│   ├── arbac.user_create       # Add new database users
│   ├── arbac.user_edit         # Modify employee names, zones, and clearances
│   ├── arbac.role_manage       # Create or alter custom ARBAC role templates
│   └── arbac.pin_reset         # Unlock accounts and reset security PINs
│
├── 3. Derby & Registration (4 perms)
│   ├── event.schedule_edit     # Create tournaments and configure pot escrows
│   ├── entry.register          # Enroll syndicates and issue entry numbers
│   ├── timbangan.weigh_in      # Perform certified scale weigh-ins and band stamping
│   └── kasahan.matchmake       # Execute pairing algorithms and approve match slips
│
├── 4. Armory & Biosecurity (3 perms)
│   ├── tari.gaff_signoff       # Inspect gaff blades and sign off on armory releases
│   ├── cockhouse.bay_manage    # Allocate biosecure quarantine coop bays
│   └── vet.suture_record       # Log surgical interventions and medical treatments
│
├── 5. Ruedo Arena & Betting (4 perms)
│   ├── ruedo.clock_control     # Start, pause, or reset the official fight countdown
│   ├── ruedo.declare_verdict   # Enter official referee result (Meron, Wala, Tabla)
│   ├── wager.issue_ticket      # Operate Kristo POS terminals and issue bets
│   └── wager.cancel_ticket     # Void unconfirmed tickets before fight start
│
└── 6. Financial Settlement (4 perms)
    ├── cashier.payout_release  # Disburse verified cash winnings
    ├── finance.plasada_view    # Audit retained 10% coliseum commission ledgers
    ├── audit.logtrail_read     # Review microsecond-stamped security logs
    └── network.terminal_pair   # Pair handheld devices to the local LAN mesh
```

### User Attributes:
* **Assigned Duty Zone:** e.g., `Mesa de Control`, `Timbangan Scale Bay`, `Ruedo Arena Floor`, `Cashier Vault`.
* **Hardware Binding Code:** Whitelisted Terminal ID authorized for this employee.
* **Cash Float Limit:** Maximum operational cash drawer limit for cashiers.
* **Commission Rate:** Allowed percentage for Kristo bookmakers.
* **PIN Lockout Counter:** Automatically increments on wrong PIN, locking at 3 consecutive failed attempts.

---

## 6. Dynamic Data Lifecycle (Zero Seed Data Policy)

* **Initial State:** Upon fresh boot, the system initializes all tables completely empty.
* **Shimmer Skeleton States:** When fetching live telemetry from the local server, cards and tables display animated shimmer skeletons instead of flashing blank spaces.
* **Empty State Guidance:** Every module displays clean, welcoming empty cards with plain-language advice and primary action buttons (e.g. *"No Roosters Checked In Yet. Click 'Weigh-in Rooster' to add the first bird."*).

---

## 7. Obsidian-Style Interactive Database Relationship Graph

Located in the **Database Explorer** module and available across Explorer panes:
* **HTML5 `<canvas>` Force-Directed Physics Engine:**
  - Nodes represent:
    - 🗄️ **Database Engine Node:** Central physical `.db` file anchor.
    - 📋 **Table Nodes:** `arena_config`, `arbac_roles`, `employees`, `events`, `entries`, `roosters`, `paired_fights`, `wagers`, `cockhouse_bays`, `audit_logs`, etc.
    - 🔗 **Foreign Key Links:** Directed gravitational edges linking tables (e.g., `entries.event_id` $\to$ `events.id`, `paired_fights.meron_rooster_id` $\to$ `roosters.id`).
    - 📦 **Live Record Nodes:** Individual entities linked dynamically to their parent tables.
* **Interactive Capabilities:**
  - **Drag-and-Drop:** Drag nodes with real-time physics spring simulation.
  - **Pan & Zoom:** Smooth mouse-wheel zooming and infinite canvas panning.
  - **Node Inspector:** Click any table or record node to inspect schema definitions, column types, and live row counts in a sliding inspector pane.
  - **Search & Filters:** Instant search filter to isolate specific tables or relations.

---

## 8. Windows 11 Desktop UI Shell & Interaction Model

COCKPIT OS features a fully functional desktop operating system interface:

### Alt + Tab Task Switcher
* **Trigger:** Press and hold <kbd>Alt</kbd>, then press <kbd>Tab</kbd>.
* **Behavior:**
  - Opens a Windows 11 style translucent HUD in the center of the screen.
  - Displays all 16 arena subsystems plus **This Arena PC** with icons, titles, and security gate tags.
  - Pressing <kbd>Tab</kbd> or the arrow keys cycles the selection forward and backward.
  - Releasing <kbd>Alt</kbd> instantly focuses and launches the selected application window.
  - Pressing <kbd>Escape</kbd> cancels without changing windows.

### Desktop & App Right-Click Context Menus
* **Desktop Wallpaper Right-Click:**
  - 📁 **Open File Explorer:** Opens "This Arena PC".
  - 🔄 **Refresh Desktop & Data:** Re-synchronizes telemetry and shows a confirmation toast.
  - 🎨 **Change Wallpaper:** Cycles smoothly through the three wallpaper options.
  - 🌓 **Toggle Night Mode:** Instantly switches between Light and Dark mode.
  - 🛡️ **Zero-Trust Gate Matrix:** Direct shortcut to Command Overview.
  - 🔒 **Lock Terminal (Gate 0):** Locks session and returns to PIN login.
  - ℹ️ **About COCKPIT OS:** Displays release info and physical SQLite architecture summary.
* **App Tile Right-Click:**
  - ⚡ **Launch Application**
  - 🕸️ **Inspect in Relationship Graph**
  - 👥 **ARBAC Permissions & Access**

### Windows Explorer with Clickable Executables (.exe)
* The **This Arena PC** view features three distinct sections:
  1. **Devices and Drives:** Visual drive tiles showing mounted physical SQLite WAL databases (`SJC-01:`, etc.) with storage fill bars.
  2. **Coliseum Operational Folders:** Standard Windows-style operational folders.
  3. **System Applications & Executables (`.exe`):**
     - Native system binaries: `ArenaSetup.exe`, `BettingConsole.exe`, `TimbanganScale.exe`, `MatchmakerKasahan.exe`, `RuedoTimerClock.exe`, `CashierPayout.exe`, `BiosecurityRFID.exe`, etc.
     - Includes file sizes (`2.4 MB`, `3.8 MB`), file types (`Application (.exe)`), and gate badges.
     - **Double-click:** Immediately opens and runs the executable.
     - **Run as Admin:** Launches the module with elevated Gate 0 administrator privileges and surfaces a success toast notification.

### Wallpaper Management & Night Mode
The OS includes three curated 16:9 widescreen wallpapers generated via Google AI / Nanobanana:
1. **Emerald Silk Wave (Subtle & Classy - Default):**
   - High-key pearlescent ivory base with flowing mint and emerald silk ribbons and an embossed rooster watermark.
   - Designed specifically for Day/Light mode to ensure maximum legibility for all icons and text.
2. **Coliseo Arena (Centered Champion):**
   - Centered Philippine Sweater/Kelso gamecock on a sleek pedestal inside a futuristic coliseo arena with curved emerald light ribbons.
   - Optimized for Night/Dark mode where stadium lighting pops dramatically.
3. **Coliseo Dome (Cinematic Widescreen):**
   - Wide arena dome with the gamecock staged on the right platform, leaving negative space for desktop elements.
* Switch wallpapers anytime via the **Settings** folder module, taskbar system tray picture button, or by right-clicking the desktop.

### Windows 11 Start Menu, Calendar, Notifications & Global Search
* **Container-less Contextual Icons:**
  - Removed artificial box borders around desktop shortcuts. Each of the 19 applications features an authentic, multi-colored vector glyph representing its real arena context.
  - The signature **Cockpit & Rooms** module is symbolized by an authentic Philippine Gamecock Rooster with ruby red comb, golden hackles, emerald plumage, and leg spurs mounted inside the coliseum pit ring.
* **Bottom-Left Start Menu (`WindowsStartMenuFlyout.jsx`):**
  - Features quick search trigger, 19 pinned coliseum apps grid, recent arena events and databases, operator profile card (`EMP-01`), and power actions (Lock, Reboot, Theme, Settings).
* **Interactive Calendar Flyout (`WindowsCalendarFlyout.jsx`):**
  - Clicking the date and time clock in the bottom right opens a Windows 11 calendar flyout with live digital clock, date header, month selector, today badge, and live coliseum derby schedule.
* **Action Center & Notifications Flyout (`WindowsNotificationFlyout.jsx`):**
  - Bell icon located directly next to the clock displays an unread badge and opens the Action Center with active alerts, plain-English system messages, and tamper-evident audit logs.
* **Global Search Engine (`GlobalSearchModal.jsx`):**
  - Triggered via the taskbar search bar, Start Menu search, or <kbd>Ctrl</kbd> + <kbd>K</kbd>.
  - Indexes all 19 applications, physical SQLite database tables, employees, derby tournaments, roosters/entries, sultada fights, wagers/bets, 23 ARBAC permissions, and audit trails.
  - Supports category filters (`All`, `Apps`, `Data`, `ARBAC`, `Logs`), keyboard arrows (<kbd>↑</kbd> <kbd>↓</kbd> <kbd>Enter</kbd>), and a real-time metadata preview pane.

---

## 9. Centralized Human-Friendly Feedback & Error Translation

To ensure an effortless learning curve for arena cashiers, referees, and handlers, all errors and alerts are centrally managed and translated into plain English:

```
[System Event / Error Triggered]
               |
               v
+---------------------------------------+
|  src/utils/friendlyErrors.js          |
|  Centralized Translation Engine       |
+---------------------------------------+
               |
               v
+----------------------------------------------------------------------------+
| Translated Friendly Feedback State                                         |
|                                                                            |
|  [X] Entry Code Already in Use                                             |
|      A rooster is already registered under this entry code. Each bird       |
|      must have a distinct code.                                            |
|      Tip: Check the entry list or use the next available number.           |
+----------------------------------------------------------------------------+
               |
               v
+----------------------------------------------------------------------------+
| Floating Toast Stack (Top-Right) OR In-Module Inline Error Alert Card      |
+----------------------------------------------------------------------------+
```

### Translation Mapping Examples:
* `SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: entries.entry_code`  
  $\to$ **"Entry Code Already in Use"**  
  *"A rooster is already registered under this entry code. Each bird must have a distinct code. Tip: Check the entry list or use the next available number."*
* `SQLITE_CONSTRAINT_UNIQUE: UNIQUE constraint failed: employees.staff_code`  
  $\to$ **"Staff ID Code Already Taken"**  
  *"Another employee is already registered with this Staff Code. Please choose a unique ID. Tip: Try using initials and a number (e.g. EMP-02)."*
* `SQLITE_CONSTRAINT_FOREIGNKEY: FOREIGN KEY constraint failed`  
  $\to$ **"Item Cannot Be Removed"**  
  *"This record is currently linked to an active fight, bet, or weigh-in record. Tip: Void or complete connected records before deleting this item."*
* `3 consecutive failed PIN attempts detected`  
  $\to$ **"Account Locked for Security"**  
  *"Too many incorrect PIN attempts were detected. This user account is temporarily locked. Tip: Please ask an administrator to unlock your account in Users & Permissions."*
* `Failed to fetch / NetworkError`  
  $\to$ **"Local Connection Paused"**  
  *"The terminal lost touch with the arena database engine. Attempting to reconnect automatically. Tip: Check your arena LAN cable or local Wi-Fi hotspot."*

---

## 10. Single-Click Bootloader, Persistence & Kiosk Launch

### Single-Click Launchers:
1. **`CockpitOS.exe` (Native Binary):**
   - High-performance executable compiled with the Windows .NET Framework 64-bit compiler (`csc.exe`).
   - Automatically checks for Node.js, starts the backend daemon on port 4000, and opens Microsoft Edge in full-screen app/kiosk mode (`--app=http://127.0.0.1:4000`).
2. **`Launch_Cockpit_OS.bat` (Batch Script):**
   - Zero-dependency launch script for environments without .NET compilers.

### Session Persistence Across Refreshes:
- The system stores session tokens in `localStorage`:
  - `cockpit_boot_completed`: Remembers that the kernel bootloader has finished. Pressing <kbd>F5</kbd> skips the BIOS boot animation and keeps you directly on the desktop.
  - `cockpit_auth_operator`: Preserves the active staff session and ARBAC clearance.
  - `cockpit_active_tenant_id`: Remembers the currently mounted physical `.db` tenant drive.
  - `cockpit_active_module_id`: Keeps your active window open.
  - `cockpit_wallpaper`: Remembers your selected wallpaper preference.
  - `cockpit_theme`: Remembers your Light or Dark mode setting.
- Users can manually trigger a cold reboot or session lock anytime from the top-right ribbon controls.

---

## 11. Operational Roles & Workflow Guide

```
[1. ARENA SETUP]    --> [2. REGISTRATION]   --> [3. TIMBANGAN]      --> [4. KASAHAN]
Config venue & pot       Syndicates enroll       Weigh & wing-band       Matchmaking pairings
GAB / Mayor permits      Assign entry code       Gate 3 validation       Tolerance <= 30g
                                                                                |
                                                                                v
[8. PAYOUT]         <-- [7. BETTING]        <-- [6. RUEDO ARENA]    <-- [5. TARI GAFFING]
Cashier release          Grandstand kristos      Pit clock countdown     Blade mount check
Gate 8 dual sign-off     Gate 7 logro odds       Referee verdict         Armory sign-off
```

### Step-by-Step Operator Journey:
1. **Arena Architect / Owner:**
   - Launch `CockpitOS.exe`.
   - On first boot, provide Arena Location (`SJC-01`), GAB License, Mayor's Permit, and BIR CAS MIN.
   - Create Root Database Operator with a 4–6 digit PIN.
2. **Entry & Syndicate Registrars:**
   - Open **Events & Schedule** (`EventsSchedule.exe`). Create today's tournament (Gate 1 cleared).
   - Open **Cockpit & Rooms** to register syndicate cockhouse bays and assign entry numbers.
3. **Timbangan Scale Officers:**
   - Open **Arena Paperworks & Slips** (`TimbanganScale.exe`).
   - Capture official weights (`1,800g`–`2,650g`). Stamp wing-band serial (Gate 3 cleared).
4. **Matching Kristos & Matchmakers:**
   - Open **Kasahan Matchmaking** (`MatchmakerKasahan.exe`).
   - Auto-pair birds within the `30g` tolerance limit with minimum 4-fight rest gap (Gate 4 cleared).
5. **Armory & Gaffing Inspectors:**
   - Open **Ruedo Pit & Bell** $\to$ Armory Tab.
   - Inspect gaff blade sharpness and left-leg mounting. Record official sign-off (Gate 5 cleared).
6. **Referee (Sentenciador) & Arena Clock Operator:**
   - Press <kbd>Space</kbd> to toggle fight clock countdown (10 minutes max).
   - Press <kbd>B</kbd> to trigger the acoustic kampana bell cue.
   - After careo, declare official verdict (<kbd>M</kbd> for Meron, <kbd>W</kbd> for Wala, <kbd>T</kbd> for Tabla) (Gate 6 cleared).
7. **Cashiers & Audit Team:**
   - Open **Cashier & Payouts** (`CashierPayout.exe`).
   - Validate winning wager tickets against the referee's official verdict.
   - Release payouts, retain the audited 10% coliseum plasada, and print BIR-compliant settlement receipts (Gate 8 cleared).

---
*COCKPIT OS v2.4.0 — Certified for Enterprise Philippine Coliseum Operations.*


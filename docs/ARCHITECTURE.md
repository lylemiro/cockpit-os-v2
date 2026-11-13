# COCKPIT OS v2.4.0 — Standard Monorepo Architecture & Multi-Tenant Zero-Trust Blueprint

> **Environment:** Zero-Trust Local LAN Coliseum Arena OS (React 18 + Vite + Node.js 24 Native SQLite WAL + RFC6455 WebSockets)  
> **Multi-Tenant Isolation:** Dedicated Physical SQLite WAL Database per Tenant (`server/db/tenants/tenant_<code>.db`) + Master Control Plane (`server/db/master_control_plane.db`)  
> **Access Control:** Dynamic 48-Permission Granular ARBAC with Checkbox CRUD across 10 Domains (10 Role Archetypes)  
> **Architecture Directive:** Server-Authoritative Architecture — **Logic Always Backend, Minimal Frontend**  
> **Styling Standard:** 100% Centralized Branding (`src/styles/`) — **Zero Inline CSS**

---

## 1. Server-Authoritative Architecture (Thin Client / Heavy Backend)

COCKPIT OS enforces a strict architectural boundary between presentation and business logic:

```text
+--------------------------------------------------------------------------------------------------------+
|                                  THIN CLIENT FRONTEND (React 18 + Vite)                                |
|  - Collects Operator Input & Dispatches REST Requests (mutateApi)                                       |
|  - Renders Server-Computed State (Events, Fights, Wagers, Cashier Balances)                             |
|  - Listens to RFC6455 WebSocket Realtime Broadcasts (LIVE_SYNC)                                         |
|  - Zero Client-Side Business Logic, Zero Client-Side Odds Math, Zero Client-Side Gate Evaluation       |
+---------------------------------------------------+----------------------------------------------------+
                                                    |  REST Mutation (X-Tenant-Id, Operator Auth)
                                                    v
+--------------------------------------------------------------------------------------------------------+
|                             SERVER-AUTHORITATIVE BACKEND (Node.js 24 Native)                            |
|                                                                                                        |
|  1. Gate 0 Hardware & ARBAC Guard:                                                                     |
|     - Terminal MAC Address Whitelist Check                                                             |
|     - Account Lockout Check (< 3 PIN strikes)                                                          |
|     - 48-Permission Key Verification against Active Operator                                           |
|                                                                                                        |
|  2. Zero-Trust Pipeline (Gates 1 through 8):                                                           |
|     - Gate 1: Single Active Event Exclusivity                                                          |
|     - Gate 2: Syndicate Pot Money Escrow                                                               |
|     - Gate 3: Calibrated Scale Weigh-in & RFID Wingband Stamp                                          |
|     - Gate 4: Kasahan Auto-Pairing Matrix (<= 30g tolerance)                                            |
|     - Gate 5: Armory Tari Gaff Blade Inspection Sign-off                                                |
|     - Gate 6: 3-Tier Staging Queue & 10:00 Official Match Clock                                        |
|     - Gate 7: Grandstand Betting, Kristo POS Barcode Issuance & 10% Plasada Retention                  |
|     - Gate 8: Barcode Payout Verification & Dual Sign-Off Settlement                                    |
|                                                                                                        |
|  3. Physical Database Transaction:                                                                      |
|     - Isolated SQLite WAL Write (`node:sqlite`) on Dedicated `tenant_<code_hash>.db`                   |
|     - Tamper-Evident Microsecond Audit Logtrail Recording (`audit_logtrail`)                            |
|                                                                                                        |
|  4. Realtime Broadcast Mesh:                                                                            |
|     - RFC6455 WebSocket Broadcast Hub pushes state diff to all connected LAN terminals                  |
+--------------------------------------------------------------------------------------------------------+
```

---

## 2. Standard Recommended Directory Structure

```text
d:\COCKPIT OS v2\
├── CockpitOS.exe                   # Native Windows Single-Click OS Bootloader Executable
├── Launch_Cockpit_OS.bat           # One-Click OS Boot & Kiosk Window Launcher Script
├── docs/
│   ├── ARCHITECTURE.md             # Master architectural & Zero-Trust Gate reference (this document)
│   ├── CODING_INSTRUCTIONS.md      # Developer guidelines, Golden Rules & Hook standards
│   ├── README.md                   # Documentation index & quick reference
│   └── SYSTEM_GUIDELINES.md        # Comprehensive system guidelines & 48-permission matrix
├── public/
│   ├── assets/
│   │   ├── brand-favicon.png       # 3D faceted geometric origami rooster/chevron favicon
│   │   ├── cockpit_os_luxury_wallpaper.jpg # Subtle, classy wavy emerald silk wallpaper (Day Mode)
│   │   ├── wallpaper_v2.jpg        # Coliseo Arena: Centered champion gamecock (Night Mode)
│   │   ├── wallpaper_v3.jpg        # Coliseo Dome: Cinematic widescreen right-platform staging
│   │   └── rooster-hero.jpg        # Champion Philippine Gamefowl Hero Centerpiece
│   └── sounds/                     # Server-driven acoustic feedback cues
├── server/
│   ├── db/
│   │   ├── database.js             # Multi-Tenant SQLite WAL Pool, 48-Perm DDL & Master Control Plane
│   │   ├── master_control_plane.db # Master Control Plane: Tenants registry & global user directory
│   │   └── tenants/                # Dynamic Directory: Isolated per-tenant .db files
│   ├── middleware/
│   │   └── zeroTrustGates.js       # Gate 0–8 prerequisite validators per Tenant DB
│   ├── modules/
│   │   └── apiRouter.js            # Server-authoritative REST CRUD + SQLite relationship graph builder
│   ├── services/
│   │   └── lanDiscovery.js         # Live OS CPU/RAM/Disk telemetry & LAN IP discovery
│   ├── ws/
│   │   └── wsHub.js                # Zero-dependency RFC6455 WebSocket broadcast hub
│   └── index.js                    # Master HTTP + Static + WebSocket daemon (Port 4000)
├── src/
│   ├── components/
│   │   ├── AltTabSwitcher.jsx      # Windows 11 Task Switcher (Alt + Tab listener)
│   │   ├── AppIconGlyph.jsx        # Unified SVG & Lucide icon renderer
│   │   ├── arbacCatalog.js         # Official 48 Coliseum ARBAC permissions across 10 domains
│   │   ├── ArbacManager.jsx        # Granular 48-Checkbox CRUD for DB Users, Roles & Tenants
│   │   ├── BootAndLoginScreen.jsx  # OS Kernel Boot Sequence + Gate 0 PIN Login & First-Boot Wizard
│   │   ├── DatabaseRelationshipGraph.jsx # Obsidian-style Force-Directed Node Graph
│   │   ├── TopSystemBar.jsx        # OS Top Header (Tenant DB badge, Operator, LAN IP, Lock/Reboot)
│   │   ├── DesktopIconGrid.jsx     # 3-Column, 19-App Coliseum Desktop Launcher Grid
│   │   ├── CenterHeroCanvas.jsx    # Champion Rooster Hero & COCKPIT OS Gold Emblem
│   │   ├── TelemetrySidebar.jsx    # Live Right-Hand Cards with Skeleton & Empty States
│   │   ├── BottomTaskbar.jsx       # Start Button, Ctrl+K Search, 16 Dock Icons, Tray & Clock
│   │   ├── GlobalSearchModal.jsx   # Ctrl+K Spotlight-style search modal with category filtering
│   │   ├── WindowsStartMenuFlyout.jsx # Windows 11 start menu flyout with pinned apps & user profile
│   │   ├── WindowsCalendarFlyout.jsx  # Interactive calendar flyout & derby schedule viewer
│   │   ├── WindowsNotificationFlyout.jsx # Full-side Action Center drawer with audit logtrail
│   │   ├── UserEnrollmentCarouselModal.jsx # 4-Stage Operator Enrollment Carousel Journey
│   │   ├── RoleTemplateCarouselModal.jsx   # 3-Stage Role Template Carousel Journey
│   │   ├── TenantProvisionCarouselModal.jsx # 4-Stage Multi-Tenant Database Provisioner
│   │   └── ModuleWindowModal.jsx   # Windowed Draggable/Resizable Workspace for all 19 Subsystems
│   ├── context/
│   │   └── ArenaContext.jsx        # Multi-Tenant State, Auth Session & WebSocket LIVE_SYNC
│   ├── modules/
│   │   └── SubsystemWorkspace.jsx  # Dynamic CRUD workspaces for all coliseum modules
│   ├── styles/
│   │   ├── variables.css           # Centralized Emerald/Gold/Mint tokens, typography, shadows
│   │   ├── desktop.css             # Desktop OS shell layout, taskbar, top bar, flyouts
│   │   └── modules.css             # Boot/Login screen, Obsidian Graph, ARBAC checkboxes & tables
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

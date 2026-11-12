# COCKPIT OS v2.4.0 — Standard Monorepo Architecture & Multi-Tenant Zero-Trust Blueprint

> **Environment:** Zero-Trust Local LAN Coliseum Arena OS (React 18 + Vite + Node.js 24 Native SQLite WAL + RFC6455 WebSockets)  
> **Multi-Tenant Isolation:** Dedicated Physical SQLite WAL Database per Tenant (`server/db/tenants/tenant_<code>.db`) + Master Control Plane (`server/db/master_control_plane.db`)  
> **Access Control:** Dynamic 23-Permission Granular ARBAC with Checkbox CRUD (Roles & Multi-Database Users)  
> **Styling Standard:** 100% Centralized Branding (`src/styles/`) — **Zero Inline CSS**

---

## 1. Standard Recommended Directory Structure

```text
d:\COCKPIT OS v2\
├── CockpitOS.exe                   # Native Windows Single-Click OS Bootloader Executable
├── Launch_Cockpit_OS.bat           # One-Click OS Boot & Kiosk Window Launcher Script
├── docs/
│   └── ARCHITECTURE.md             # Master architectural & Zero-Trust Gate reference
├── public/
│   ├── assets/
│   │   └── rooster-hero.jpg        # Champion Philippine Gamefowl Hero Centerpiece
│   └── sounds/                     # Server-driven acoustic feedback cues
├── server/
│   ├── db/
│   │   ├── database.js             # Multi-Tenant SQLite WAL Pool & Master Control Plane
│   │   ├── master_control_plane.db # Created dynamically: Tenants & Multi-DB Users Registry
│   │   └── tenants/                # Created dynamically: Isolated per-tenant .db files
│   ├── middleware/
│   │   └── zeroTrustGates.js       # Gate 0–8 prerequisite validators per Tenant DB
│   ├── modules/
│   │   └── apiRouter.js            # Tenant-isolated REST CRUD + Graph Introspection
│   ├── services/
│   │   └── lanDiscovery.js         # Live OS CPU/RAM/Disk telemetry & LAN IP discovery
│   ├── ws/
│   │   └── wsHub.js                # Zero-dependency RFC6455 WebSocket broadcast hub
│   └── index.js                    # Master HTTP + Static + WebSocket daemon (Port 4000)
├── src/
│   ├── components/
│   │   ├── AppIconGlyph.jsx        # Unified SVG & Lucide icon renderer
│   │   ├── arbacCatalog.js         # Official 23 Coliseum ARBAC permissions across 6 domains
│   │   ├── ArbacManager.jsx        # Granular 23-Checkbox CRUD for DB Users, Roles & Tenants
│   │   ├── BootAndLoginScreen.jsx  # OS Kernel Boot Sequence + Gate 0 PIN Login & First-Boot Wizard
│   │   ├── DatabaseRelationshipGraph.jsx # Obsidian-style Force-Directed Node Graph
│   │   ├── TopSystemBar.jsx        # OS Top Header (Tenant DB badge, Operator, LAN IP, Lock/Reboot)
│   │   ├── DesktopIconGrid.jsx     # 3-Column, 19-App Coliseum Desktop Launcher Grid
│   │   ├── CenterHeroCanvas.jsx    # Champion Rooster Hero & COCKPIT OS Gold Emblem
│   │   ├── TelemetrySidebar.jsx    # Live Right-Hand Cards with Skeleton & Empty States
│   │   ├── BottomTaskbar.jsx       # Start Button, Ctrl+K Search, 16 Dock Icons, Tray & Clock
│   │   └── ModuleWindowModal.jsx   # Windowed Operational Workspace for all 19 Subsystems
│   ├── context/
│   │   └── ArenaContext.jsx        # Multi-Tenant State, Auth Session & WebSocket LIVE_SYNC
│   ├── modules/
│   │   └── SubsystemWorkspace.jsx  # Dynamic CRUD workspaces for all coliseum modules
│   ├── styles/
│   │   ├── variables.css           # Centralized Emerald/Gold/Mint tokens, typography, shadows
│   │   ├── desktop.css             # Desktop OS shell layout, wallpaper waves, icon cards, telemetry
│   │   └── modules.css             # Boot/Login screen, Obsidian Graph, ARBAC checkboxes & tables
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

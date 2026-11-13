export const DESKTOP_APPS = [
  {
    id: 'command-overview',
    label: 'Command Overview',
    icon: 'Monitor',
    variant: 'emerald',
    gateTag: 'Gate 0–8',
    subtitle: 'Executive Zero-Trust Prerequisite Matrix & Live Coliseum Telemetry',
    getCount: (state) => state?.gates?.filter((g) => g.passed).length || 0
  },
  {
    id: 'users-permissions',
    label: 'Users & Permissions',
    icon: 'Users',
    variant: 'emerald',
    gateTag: 'Gate 0',
    subtitle: 'Staff Registry, Granular ARBAC Matrix & Shift Zone Assignments',
    getCount: (state) => state?.employees?.length || 0
  },
  {
    id: 'arena-setup',
    label: 'Arena Setup',
    icon: 'Layers',
    variant: 'gold',
    gateTag: 'SSOT Config',
    subtitle: 'Coliseum Venue Parameters, GAB License, Mayor Permit & BIR CAS MIN',
    getCount: (state) => (state?.arenaConfig ? 1 : 0)
  },
  {
    id: 'cockpit-rooms',
    label: 'Cockpit & Rooms',
    icon: 'RoosterCrest',
    variant: 'featured-emerald',
    gateTag: 'Biosecurity',
    subtitle: 'Handler Suites, Rooster Coop Bays & RFID Biosecurity Manifest',
    getCount: (state) => state?.cockhouseBays?.length || 0
  },
  {
    id: 'grandstand-betting',
    label: 'Grandstand Betting',
    icon: 'Coins',
    variant: 'gold',
    gateTag: 'Gate 7',
    subtitle: 'Kristo POS Handhelds, Pari-Mutuel Pool & Philippine Logro Odds',
    getCount: (state) => state?.wagers?.length || 0
  },
  {
    id: 'events-schedule',
    label: 'Events & Schedule',
    icon: 'CalendarPlus',
    variant: 'emerald',
    gateTag: 'Gate 1 & 2',
    subtitle: 'Single Active Derby Exclusivity, Syndicate Entries & Pot Escrow',
    getCount: (state) => state?.events?.length || 0
  },
  {
    id: 'cashier-payouts',
    label: 'Cashier & Payouts',
    icon: 'ReceiptText',
    variant: 'emerald',
    gateTag: 'Gate 2 & 8',
    subtitle: 'Center Cashier Window, Pot Escrow Collection & Barcode Ticket Redemption',
    getCount: (state) => state?.wagers?.filter((w) => w.status === 'WON' || w.status === 'REFUNDABLE').length || 0
  },
  {
    id: 'ruedo-pit',
    label: 'Ruedo Pit & Bell',
    icon: 'Bell',
    variant: 'gold',
    gateTag: 'Gate 6–8',
    subtitle: 'Mesa de Control, 3-Tier Staging Ribbon, 10:00 Clock, Pit Bell & Verdict',
    getCount: (state) => state?.fights?.filter((f) => f.staging_tier === 'LIVE_PIT').length || 0
  },
  {
    id: 'kasahan-matchmaking',
    label: 'Kasahan Matchmaking',
    icon: 'Scale',
    variant: 'emerald',
    gateTag: 'Gate 3–5',
    subtitle: 'Sub-60s Timbangan Weigh-In, <=30g Kasahan Pairing & Tari Armorer Sign-Off',
    getCount: (state) => state?.roosters?.length || 0
  },
  {
    id: 'paperworks-slips',
    label: 'Arena Paperworks & Slips',
    icon: 'Ticket',
    variant: 'emerald',
    gateTag: '80mm / A4',
    subtitle: 'Certified Soltada Lineup Sheets, Weigh-In Slips & Official Standings',
    getCount: (state) => state?.fights?.length || 0
  },
  {
    id: 'vet-clinic',
    label: 'Vet Clinic & Sutures',
    icon: 'Activity',
    variant: 'emerald',
    gateTag: 'Manggagamot',
    subtitle: 'Post-Fight Veterinary Sutures, Hemostasis & Surgical Recovery Logs',
    getCount: (state) => state?.vetSutures?.length || 0
  },
  {
    id: 'finance-bir',
    label: 'Finance & BIR Audit',
    icon: 'PhilippinePeso',
    variant: 'emerald',
    gateTag: 'Gate 8',
    subtitle: '10% House Plasada Ledger, GAB/LGU Tax Compliance & BIR Z-Reading',
    getCount: null
  },
  {
    id: 'inventory-equipment',
    label: 'Inventory & Equipment',
    icon: 'Box',
    variant: 'emerald',
    gateTag: 'Armory',
    subtitle: 'Tari Gaff Blades, Scabbards, POS Thermal Rolls & Calibrated Scales',
    getCount: (state) => state?.inventoryAssets?.length || 0
  },
  {
    id: 'reports-audits',
    label: 'Reports & Audits',
    icon: 'BarChart3',
    variant: 'emerald',
    gateTag: 'Audit',
    subtitle: 'Daily Coliseum Settlement, Fight Operations Ledger & Teller Audits',
    getCount: null
  },
  {
    id: 'devices-terminals',
    label: 'Devices & Terminals',
    icon: 'MonitorSmartphone',
    variant: 'emerald',
    gateTag: 'Gate 0',
    subtitle: '1-Operator 1-Machine Hardware Binding & MAC Address Whitelist',
    getCount: (state) => state?.devices?.length || 0
  },
  {
    id: 'security-audit',
    label: 'Security & Audit',
    icon: 'ShieldCheck',
    variant: 'emerald',
    gateTag: 'Logtrail',
    subtitle: 'Tamper-Evident Microsecond Audit Logtrail & Session Surveillance',
    getCount: (state) => state?.auditLogs?.length || 0
  },
  {
    id: 'database-explorer',
    label: 'Database Explorer',
    icon: 'Database',
    variant: 'emerald',
    gateTag: 'SQLite WAL',
    subtitle: 'Interactive Native SQLite WAL Table Inspector & Live Record Counts',
    getCount: (state) => state?.databaseTables?.length || 0
  },
  {
    id: 'network-gateway',
    label: 'Network Gateway',
    icon: 'Network',
    variant: 'emerald',
    gateTag: 'Air-Gapped LAN',
    subtitle: 'Local LAN Hotspot Discovery, WebSocket Mesh & Turnstile Endpoints',
    getCount: null
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Settings',
    variant: 'emerald',
    gateTag: 'System',
    subtitle: 'Audio Cues, Mesa de Control Hotkeys (Space, B, M, W, T, C) & Display Theme',
    getCount: null
  }
];


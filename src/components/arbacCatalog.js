export const ARBAC_PERMISSION_GROUPS = [
  {
    domainId: 'executive',
    domainTitle: '01. Arena Profile, Licensing & Regulatory Governance',
    permissions: [
      {
        key: 'arena.config.manage',
        label: 'Configure Arena Profile, Capacity, Dimensions & City Bounds'
      },
      {
        key: 'arena.license.manage',
        label: 'Manage GAB License, Mayor’s Permit & BIR CAS MIN Certificates'
      },
      {
        key: 'arena.rules.manage',
        label: 'Configure Minimum Bet, 10% Plasada Rate & Draw Payout Cap'
      },
      {
        key: 'security.logtrail.export',
        label: 'Inspect & Export Tamper-Evident Microsecond Audit Logtrail'
      }
    ]
  },
  {
    domainId: 'database',
    domainTitle: '02. Multi-Tenant Physical SQLite Database Partitions',
    permissions: [
      {
        key: 'tenant.database.create',
        label: 'Provision New Physical SQLite WAL Database Partition'
      },
      {
        key: 'tenant.database.switch',
        label: 'Switch Active Coliseum Database & Rebind Live Memory WAL'
      },
      {
        key: 'tenant.database.backup',
        label: 'Generate & Download Cryptographic SQLite Database Snapshot'
      },
      {
        key: 'tenant.database.reset',
        label: 'Authorize Arena Database Factory Zero-Trust Wipe & Purge'
      }
    ]
  },
  {
    domainId: 'security_devices',
    domainTitle: '03. Gate 0 Zero-Trust Hardware Surveillance & Whitelist',
    permissions: [
      {
        key: 'security.whitelist.manage',
        label: 'Authorize/Revoke Hardware Terminal MAC Address Whitelist'
      },
      {
        key: 'security.device.binding',
        label: 'Bind Operator Credentials to Dedicated Hardware Machine'
      },
      {
        key: 'security.lockout.reset',
        label: 'Clear 3-Strikes PIN Hardware Lockouts & Reset Security Flags'
      },
      {
        key: 'security.session.terminate',
        label: 'Remotely Terminate Active Operator Terminal Sessions'
      }
    ]
  },
  {
    domainId: 'arbac_users',
    domainTitle: '04. Staff Accounts, Shifts & Role Templates',
    permissions: [
      {
        key: 'arbac.staff.crud',
        label: 'Enroll, Edit, and Manage Coliseum Staff Operator Accounts'
      },
      {
        key: 'arbac.roles.crud',
        label: 'Create, Update & Delete Granular ARBAC Role Templates'
      },
      {
        key: 'arbac.float.assign',
        label: 'Assign Teller Vault Cash Floats & Shift Floats'
      },
      {
        key: 'arbac.shift.toggle',
        label: 'Check-In / Check-Out Shift Operators (On-Duty / Off-Duty)'
      },
      {
        key: 'arbac.credentials.reset',
        label: 'Force Security PIN Reset on Next Terminal Login'
      }
    ]
  },
  {
    domainId: 'events_tournament',
    domainTitle: '05. Tournament, Entries & Pot Escrow (Gate 1 & 2)',
    permissions: [
      {
        key: 'events.derby.schedule',
        label: 'Schedule & Initialize Single/Multi-Day Derby Tournaments'
      },
      {
        key: 'events.derby.activate',
        label: 'Activate Single Live Derby Event (Gate 1 Exclusivity)'
      },
      {
        key: 'events.entries.enroll',
        label: 'Register Syndicate Entries, Gallero Profiles & Legbands'
      },
      {
        key: 'events.escrow.clear',
        label: 'Verify & Collect Pot Money Escrow (Gate 2 Prerequisite)'
      },
      {
        key: 'events.derby.cancel',
        label: 'Cancel or Reschedule Tournaments & Authorize Entry Refunds'
      }
    ]
  },
  {
    domainId: 'matchmaking_timbangan',
    domainTitle: '06. Timbangan, Kasahan & Armory (Gate 3–5)',
    permissions: [
      {
        key: 'matchmaking.timbangan.weigh',
        label: 'Calibrate Digital Scale & Record Biometric Weights (Gate 3)'
      },
      {
        key: 'matchmaking.wingband.stamp',
        label: 'Stamp & Verify Tamper-Evident RFID Wingband Serials'
      },
      {
        key: 'matchmaking.kasahan.pair',
        label: 'Execute <=30g Kasahan Auto-Pairing Matrix (Gate 4)'
      },
      {
        key: 'matchmaking.soltada.publish',
        label: 'Publish Official Soltada Fight Card Lineup'
      },
      {
        key: 'matchmaking.soltada.reorder',
        label: 'Reorder / Reschedule Soltada Lineup Fight Sequence'
      },
      {
        key: 'matchmaking.tari.signoff',
        label: 'Inspect & Sign Off Tari Gaff Blades (Gate 5 Armorer)'
      }
    ]
  },
  {
    domainId: 'ruedo_mesa',
    domainTitle: '07. Ruedo Pit & Mesa de Control (Gate 6–8)',
    permissions: [
      {
        key: 'ruedo.staging.advance',
        label: 'Advance 3-Tier Staging Queue (Heeling -> Pit Gate 6)'
      },
      {
        key: 'ruedo.clock.control',
        label: 'Start, Pause, and Reset 10:00 Official Match Timer'
      },
      {
        key: 'ruedo.pitbell.ring',
        label: 'Ring Official Coliseum Pit Bell (Opening / Closing Wagering)'
      },
      {
        key: 'ruedo.betting.toggle',
        label: 'Open Wagering (Pusta Bukas) & Close Wagering (Pusta Sara)'
      },
      {
        key: 'ruedo.verdict.declare',
        label: 'Declare Official Sentensya Verdict (Meron/Wala/Tabla/Cancela)'
      },
      {
        key: 'ruedo.var.replay',
        label: 'Trigger Slow-Motion VAR Disputed Call Replay Review'
      }
    ]
  },
  {
    domainId: 'betting_cashier',
    domainTitle: '08. Grandstand Betting, Kristo POS & Payouts (Gate 7 & 8)',
    permissions: [
      {
        key: 'betting.ticket.issue',
        label: 'Issue Kristo / POS Encrypted Barcode Wager Tickets (Gate 7)'
      },
      {
        key: 'betting.logro.monitor',
        label: 'Real-Time Logro Odds Monitoring & Pari-Mutuel Pool Display'
      },
      {
        key: 'betting.ticket.void',
        label: 'Authorize Void / Refund on Unstarted or Disputed Bouts'
      },
      {
        key: 'cashier.payout.release',
        label: 'Scan & Release Winning Barcode Ticket Payouts (Gate 8)'
      },
      {
        key: 'cashier.payout.override',
        label: 'Authorize Damaged / Missing Barcode Ticket Overrides'
      },
      {
        key: 'cashier.vault.reconcile',
        label: 'Reconcile Cashier Drawer Float with Gross Handle'
      }
    ]
  },
  {
    domainId: 'finance_bir',
    domainTitle: '09. Finance, Plasada Ledger & BIR Compliance',
    permissions: [
      {
        key: 'finance.plasada.view',
        label: 'Audit Real-time 10% House Plasada Ledger'
      },
      {
        key: 'finance.zreading.generate',
        label: 'Generate Official BIR CAS Z-Reading Daily Report'
      },
      {
        key: 'finance.tax.remittance',
        label: 'Calculate & Audit LGU / GAB Regulatory Tax Deductions'
      },
      {
        key: 'finance.settlement.close',
        label: 'Close Daily Financial Books & Generate Cashier Breakdown'
      }
    ]
  },
  {
    domainId: 'biosecurity_operations',
    domainTitle: '10. Cockhouse Coops, Biosecurity & Vet Clinic',
    permissions: [
      {
        key: 'cockhouse.bays.manage',
        label: 'Assign & Manage Cockhouse Bays & Coop Room Suites'
      },
      {
        key: 'cockhouse.disinfect.log',
        label: 'Record Biosecurity Disinfection Cycles & Quarantine'
      },
      {
        key: 'clinic.vet.suture',
        label: 'Record Post-Fight Manggagamot Surgical Suture Logs'
      },
      {
        key: 'clinic.emergency.clear',
        label: 'Certify Post-Fight Avian Hemostasis & Recovery Release'
      }
    ]
  }
];

export const ALL_PERMISSION_KEYS = ARBAC_PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.key)
);

/**
 * Official Pre-Defined User Roles in Filipino Legal Sabong Operations
 * (Games and Amusements Board - GAB / PD 449 / LGU Coliseum Regulatory Standard)
 */
export const FILIPINO_SABONG_DEFAULT_ROLES = [
  {
    role_id: 'ROLE_SUPERADMIN',
    role_name: 'Superadmin / Pangulo ng Sabungan',
    filipino_title: 'Pangulo ng Sabungan & Chief Security Officer (CSO)',
    department_zone: 'Executive Command Console',
    require_device_binding: true,
    max_cash_float: 1000000,
    tag: `Full ${ALL_PERMISSION_KEYS.length}/${ALL_PERMISSION_KEYS.length} Clearance`,
    description: 'Full unrestricted governance over multi-tenant databases, GAB/BIR licenses, security whitelists, and tamper-evident audit trails.',
    permissions: [...ALL_PERMISSION_KEYS]
  },
  {
    role_id: 'ROLE_ARENA_ADMIN',
    role_name: 'Arena Admin / Tagapamahala',
    filipino_title: 'Tagapamahala ng Sabungan (General Manager)',
    department_zone: 'Executive Management Office',
    require_device_binding: true,
    max_cash_float: 500000,
    tag: 'Executive Operations',
    description: 'Day-to-day coliseum operations, staff shift assignments, derby schedules, pot escrow, and BIR compliance.',
    permissions: [
      'arena.config.manage',
      'arena.rules.manage',
      'security.logtrail.export',
      'tenant.database.switch',
      'tenant.database.backup',
      'security.whitelist.manage',
      'security.device.binding',
      'security.lockout.reset',
      'arbac.staff.crud',
      'arbac.float.assign',
      'arbac.shift.toggle',
      'events.derby.schedule',
      'events.derby.activate',
      'events.entries.enroll',
      'events.escrow.clear',
      'matchmaking.timbangan.weigh',
      'matchmaking.kasahan.pair',
      'matchmaking.soltada.publish',
      'ruedo.staging.advance',
      'ruedo.clock.control',
      'ruedo.pitbell.ring',
      'ruedo.betting.toggle',
      'ruedo.verdict.declare',
      'ruedo.var.replay',
      'betting.ticket.issue',
      'betting.logro.monitor',
      'betting.ticket.void',
      'cashier.payout.release',
      'cashier.vault.reconcile',
      'finance.plasada.view',
      'finance.zreading.generate',
      'finance.tax.remittance',
      'finance.settlement.close',
      'cockhouse.bays.manage',
      'cockhouse.disinfect.log'
    ]
  },
  {
    role_id: 'ROLE_MESA_CONTROL',
    role_name: 'Mesa de Control / Hukom sa Mesa',
    filipino_title: 'Hukom sa Mesa (Fight Director & Timer)',
    department_zone: 'Mesa de Control',
    require_device_binding: true,
    max_cash_float: 0,
    tag: 'Ruedo & Timer (Gate 6–8)',
    description: 'In charge of the sultada lineup, 10-minute bout timer, ringing the official pit bell, opening/closing betting, and VAR reviews.',
    permissions: [
      'events.derby.schedule',
      'events.derby.activate',
      'matchmaking.soltada.publish',
      'matchmaking.soltada.reorder',
      'ruedo.staging.advance',
      'ruedo.clock.control',
      'ruedo.pitbell.ring',
      'ruedo.betting.toggle',
      'ruedo.verdict.declare',
      'ruedo.var.replay',
      'betting.logro.monitor',
      'betting.ticket.void',
      'security.logtrail.export'
    ]
  },
  {
    role_id: 'ROLE_SENTENCIADOR',
    role_name: 'Sentenciador / Ring Referee',
    filipino_title: 'Sentenciador (Official Ring Referee & Judge)',
    department_zone: 'Ruedo Pit Ring',
    require_device_binding: true,
    max_cash_float: 0,
    tag: 'Ruedo Ring Authority',
    description: 'In-ring authority who handles gamecocks during combat, commands peck tests (kari), and declares official verdicts.',
    permissions: [
      'ruedo.staging.advance',
      'ruedo.clock.control',
      'ruedo.pitbell.ring',
      'ruedo.verdict.declare',
      'ruedo.var.replay'
    ]
  },
  {
    role_id: 'ROLE_KASADOR',
    role_name: 'Kasador / Matchmaker',
    filipino_title: 'Kasador / Tagapagpares (Weigh-in & Pairing Officer)',
    department_zone: 'Timbangan & Kasahan Booth',
    require_device_binding: true,
    max_cash_float: 0,
    tag: 'Matchmaking (Gate 3–5)',
    description: 'Calibrated scale weigh-in, wing/leg band verification, <=30g auto-pairing matrix execution, and fight card creation.',
    permissions: [
      'events.entries.enroll',
      'matchmaking.timbangan.weigh',
      'matchmaking.wingband.stamp',
      'matchmaking.kasahan.pair',
      'matchmaking.soltada.publish',
      'matchmaking.soltada.reorder',
      'cockhouse.bays.manage'
    ]
  },
  {
    role_id: 'ROLE_HEAD_CASHIER',
    role_name: 'Head Cashier / Monton Supervisor',
    filipino_title: 'Tagapamahala ng Kahon at Monton (Head Payout Officer)',
    department_zone: 'Center Cashier Cage',
    require_device_binding: true,
    max_cash_float: 250000,
    tag: 'Vault & Payouts (Gate 2 & 8)',
    description: 'Central vault management, derby pot collection, teller float distribution, winning ticket payouts, and BIR Z-readings.',
    permissions: [
      'events.escrow.clear',
      'events.derby.cancel',
      'arbac.float.assign',
      'cashier.payout.release',
      'cashier.payout.override',
      'cashier.vault.reconcile',
      'betting.ticket.void',
      'finance.plasada.view',
      'finance.zreading.generate',
      'finance.settlement.close',
      'security.logtrail.export'
    ]
  },
  {
    role_id: 'ROLE_KRISTO_TELLER',
    role_name: 'Kristo / POS Ticket Teller',
    filipino_title: 'Kristo & POS Ticket Clerk (Wagering Operator)',
    department_zone: 'Betting Booths & Grandstand',
    require_device_binding: true,
    max_cash_float: 50000,
    tag: 'Wagering & Odds (Gate 7)',
    description: 'Encrypted barcode wager ticket issuance for Meron, Wala, and Draw bets from POS handhelds or teller booths.',
    permissions: [
      'betting.ticket.issue',
      'betting.logro.monitor',
      'betting.ticket.void'
    ]
  },
  {
    role_id: 'ROLE_MANANARI',
    role_name: 'Mananari / Tari Armorer',
    filipino_title: 'Mananari & GAB Gaff Armorer (Blade Inspector)',
    department_zone: 'Armory & Tari Station',
    require_device_binding: true,
    max_cash_float: 0,
    tag: 'Armory Sign-off (Gate 5)',
    description: 'Inspection of single/double curved tari gaff blades, blade sharpness verification, tying security, and safety clearance.',
    permissions: [
      'matchmaking.tari.signoff',
      'cockhouse.bays.manage',
      'cockhouse.disinfect.log'
    ]
  },
  {
    role_id: 'ROLE_VET_SURGEON',
    role_name: 'Manggagamot / Veterinary Surgeon',
    filipino_title: 'Manggagamot (Coliseum Veterinary Clinic Surgeon)',
    department_zone: 'Veterinary Recovery Clinic',
    require_device_binding: true,
    max_cash_float: 0,
    tag: 'Biosecurity & Sutures',
    description: 'Post-fight emergency hemostasis, antiseptic treatment, veterinary sutures (tahi), and recovery room management.',
    permissions: [
      'clinic.vet.suture',
      'clinic.emergency.clear',
      'cockhouse.bays.manage',
      'cockhouse.disinfect.log'
    ]
  },
  {
    role_id: 'ROLE_GAB_BIR_AUDITOR',
    role_name: 'GAB & BIR Compliance Auditor',
    filipino_title: 'Tagasuri ng GAB at BIR (Regulatory & Tax Auditor)',
    department_zone: 'Compliance & Audit Office',
    require_device_binding: true,
    max_cash_float: 0,
    tag: 'Regulatory & Tax Compliance',
    description: 'Regulatory audit of 10% plasada, amusement taxes, tamper-evident microsecond logtrails, and official BIR settlements.',
    permissions: [
      'arena.config.manage',
      'arena.license.manage',
      'security.logtrail.export',
      'finance.plasada.view',
      'finance.zreading.generate',
      'finance.tax.remittance',
      'finance.settlement.close'
    ]
  }
];



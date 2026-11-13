export const ARBAC_PERMISSION_GROUPS = [
  {
    domainId: 'executive',
    domainTitle: '01. Executive, Multi-Tenant & Security',
    permissions: [
      {
        key: 'arena.config.manage',
        label: 'Configure Arena Profile, GAB License & BIR MIN'
      },
      {
        key: 'security.whitelist.manage',
        label: 'Authorize/Revoke Gate 0 Hardware MAC Whitelist'
      },
      {
        key: 'security.logtrail.export',
        label: 'View & Export Tamper-Evident Audit Logtrail'
      }
    ]
  },
  {
    domainId: 'arbac',
    domainTitle: '02. Multi-Database Users & ARBAC CRUD',
    permissions: [
      {
        key: 'arbac.roles.crud',
        label: 'Create, Update & Delete Granular ARBAC Roles'
      },
      {
        key: 'arbac.staff.crud',
        label: 'Enroll, Edit, Lock/Unlock & Delete DB Users'
      },
      {
        key: 'arbac.float.assign',
        label: 'Assign Teller Vault Cash Floats & Commissions'
      }
    ]
  },
  {
    domainId: 'tournament',
    domainTitle: '03. Tournament & Pot Escrow (Gate 1 & 2)',
    permissions: [
      {
        key: 'events.derby.schedule',
        label: 'Schedule & Activate Single Live Derby Event'
      },
      {
        key: 'events.entries.enroll',
        label: 'Enroll Syndicate Entries & Gallero Profiles'
      },
      {
        key: 'events.escrow.clear',
        label: 'Verify & Clear Pot Money Escrow Status'
      }
    ]
  },
  {
    domainId: 'matchmaking',
    domainTitle: '04. Timbangan, Kasahan & Armory (Gate 3–5)',
    permissions: [
      {
        key: 'matchmaking.timbangan.weigh',
        label: 'Log Calibrated Scale Weights & Wingbands'
      },
      {
        key: 'matchmaking.kasahan.pair',
        label: 'Execute Kasahan Auto-Pairing Matrix (<=30g)'
      },
      {
        key: 'matchmaking.soltada.publish',
        label: 'Publish Official Soltada Fight Card Lineup'
      },
      {
        key: 'matchmaking.tari.signoff',
        label: 'Inspect & Sign Off Tari Gaff Blades (Armorer)'
      }
    ]
  },
  {
    domainId: 'ruedo',
    domainTitle: '05. Ruedo Pit & Mesa de Control (Gate 6–8)',
    permissions: [
      {
        key: 'ruedo.staging.advance',
        label: 'Advance 3-Tier Staging Queue (Heeling -> Pit)'
      },
      {
        key: 'ruedo.betting.toggle',
        label: 'Open Wagering (Pusta Bukas) & Ring Pit Bell'
      },
      {
        key: 'ruedo.verdict.declare',
        label: 'Declare Official Sentensya Verdict (M/W/T/C)'
      },
      {
        key: 'ruedo.var.replay',
        label: 'Trigger VAR Slow-Motion Disputed Ruling Review'
      }
    ]
  },
  {
    domainId: 'betting_finance',
    domainTitle: '06. Smart Betting, Cashier, Clinic & Finance',
    permissions: [
      {
        key: 'betting.ticket.issue',
        label: 'Issue Kristo / POS Encrypted Wager Tickets'
      },
      {
        key: 'cashier.payout.release',
        label: 'Scan & Release Winning Barcode Ticket Payouts'
      },
      {
        key: 'betting.ticket.void',
        label: 'Authorize Void / Refund on Cancelled Bouts'
      },
      {
        key: 'finance.zreading.generate',
        label: 'Generate BIR CAS Z-Reading & Settlement Ledger'
      },
      {
        key: 'cockhouse.bays.manage',
        label: 'Manage Cockhouse Bays & Biosecurity Disinfection'
      },
      {
        key: 'clinic.vet.suture',
        label: 'Record Post-Fight Manggagamot Suture Logs'
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
    tag: 'Full 23/23 Clearance',
    description: 'Full unrestricted governance over multi-tenant databases, GAB/BIR licenses, security whitelists, and tamper-evident audit trails.',
    permissions: [
      'arena.config.manage',
      'security.whitelist.manage',
      'security.logtrail.export',
      'arbac.roles.crud',
      'arbac.staff.crud',
      'arbac.float.assign',
      'events.derby.schedule',
      'events.entries.enroll',
      'events.escrow.clear',
      'matchmaking.timbangan.weigh',
      'matchmaking.kasahan.pair',
      'matchmaking.soltada.publish',
      'matchmaking.tari.signoff',
      'ruedo.staging.advance',
      'ruedo.betting.toggle',
      'ruedo.verdict.declare',
      'ruedo.var.replay',
      'betting.ticket.issue',
      'cashier.payout.release',
      'betting.ticket.void',
      'finance.zreading.generate',
      'cockhouse.bays.manage',
      'clinic.vet.suture'
    ]
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
      'security.logtrail.export',
      'arbac.staff.crud',
      'arbac.float.assign',
      'events.derby.schedule',
      'events.entries.enroll',
      'events.escrow.clear',
      'matchmaking.timbangan.weigh',
      'matchmaking.kasahan.pair',
      'matchmaking.soltada.publish',
      'ruedo.staging.advance',
      'ruedo.betting.toggle',
      'ruedo.verdict.declare',
      'ruedo.var.replay',
      'betting.ticket.issue',
      'cashier.payout.release',
      'betting.ticket.void',
      'finance.zreading.generate',
      'cockhouse.bays.manage'
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
      'matchmaking.soltada.publish',
      'ruedo.staging.advance',
      'ruedo.betting.toggle',
      'ruedo.verdict.declare',
      'ruedo.var.replay',
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
      'matchmaking.kasahan.pair',
      'matchmaking.soltada.publish',
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
      'arbac.float.assign',
      'cashier.payout.release',
      'betting.ticket.void',
      'finance.zreading.generate',
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
      'betting.ticket.issue'
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
      'cockhouse.bays.manage'
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
      'cockhouse.bays.manage'
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
      'security.logtrail.export',
      'finance.zreading.generate'
    ]
  }
];


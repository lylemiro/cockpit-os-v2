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


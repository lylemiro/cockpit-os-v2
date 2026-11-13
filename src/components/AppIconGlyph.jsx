import React from 'react';

/**
 * COCKPIT OS v2.4.0 — Contextual App Icon Glyphs
 * Enterprise Zero-Trust Coliseum Operations Environment
 * High-detail multi-color vector glyphs representing the real arena context.
 */

export function AppIconGlyph({ name, size = 36 }) {
  const s = size;

  switch (name) {
    // 1. Command Overview: Executive radar dashboard with telemetry pulse
    case 'Monitor':
    case 'command-overview':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="4" y="6" width="40" height="26" rx="5" fill="#0f291e" stroke="#12a85f" strokeWidth="2" />
          <rect x="7" y="9" width="34" height="20" rx="3" fill="#061d12" />
          {/* Radar circle & sweep */}
          <circle cx="24" cy="19" r="8" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="24" cy="19" r="4" stroke="#10b981" strokeWidth="1" />
          <circle cx="24" cy="19" r="1.5" fill="#34d399" />
          <path d="M24 19 L30 14" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
          {/* Stand */}
          <path d="M20 32 L16 41 H32 L28 32" fill="#1e3a2b" stroke="#12a85f" strokeWidth="1.5" strokeLinejoin="round" />
          <rect x="14" y="40" width="20" height="2.5" rx="1" fill="#d99b1a" />
        </svg>
      );

    // 2. Users & Permissions: Security ID badge with operator avatar, star & key
    case 'Users':
    case 'users-permissions':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* ID Card base */}
          <rect x="8" y="5" width="32" height="38" rx="5" fill="#ffffff" stroke="#0e8a4e" strokeWidth="2" />
          <rect x="8" y="5" width="32" height="9" rx="5" fill="#0e8a4e" />
          <rect x="18" y="8" width="12" height="3" rx="1.5" fill="#ffffff" opacity="0.8" />
          {/* Avatar */}
          <circle cx="24" cy="22" r="5" fill="#0b5330" />
          <path d="M16 33 C16 29 19 27 24 27 C29 27 32 29 32 33" fill="#0e8a4e" />
          {/* Security Star Badge */}
          <circle cx="34" cy="35" r="6" fill="#d99b1a" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M34 31.5 L35.2 33.8 L37.7 34.2 L35.9 36 L36.3 38.5 L34 37.3 L31.7 38.5 L32.1 36 L30.3 34.2 L32.8 33.8 Z" fill="#ffffff" />
        </svg>
      );

    // 3. Arena Setup: Coliseum stadium dome with floodlights & stadium tiers
    case 'Layers':
    case 'arena-setup':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Outer arena bowl tiers */}
          <ellipse cx="24" cy="32" rx="18" ry="11" fill="#093821" stroke="#d99b1a" strokeWidth="1.5" />
          <ellipse cx="24" cy="29" rx="15" ry="9" fill="#0e8a4e" />
          <ellipse cx="24" cy="26" rx="11" ry="6.5" fill="#12a85f" />
          {/* Center pit ring (ruedo) */}
          <ellipse cx="24" cy="24" rx="7" ry="4" fill="#f0b634" stroke="#ffffff" strokeWidth="1" />
          {/* Arena floodlights / stadium pillars */}
          <path d="M9 14 L12 28" stroke="#d99b1a" strokeWidth="2" strokeLinecap="round" />
          <path d="M39 14 L36 28" stroke="#d99b1a" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="13" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="39" cy="13" r="3.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          {/* Stadium canopy arc */}
          <path d="M12 14 C18 9 30 9 36 14" stroke="#d99b1a" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
        </svg>
      );

    // 4. Cockpit & Rooms: Signature Philippine Champion Gamecock Rooster in the arena pit
    case 'RoosterCrest':
    case 'cockpit-rooms':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Coliseum Pit Platform / Ring Base */}
          <ellipse cx="24" cy="40" rx="16" ry="5" fill="#0b5330" stroke="#d99b1a" strokeWidth="1.5" />
          <ellipse cx="24" cy="38" rx="12" ry="3.5" fill="#d99b1a" opacity="0.3" />
          {/* Tail Feathers - Sweeping High-Key Plumes */}
          <path d="M16 26 C12 20 10 12 17 8 C15 14 16 19 20 23" fill="#047857" stroke="#065f46" strokeWidth="1" />
          <path d="M14 28 C9 24 7 17 12 13 C12 19 14 23 18 26" fill="#065f46" />
          <path d="M12 30 C7 28 5 22 9 18 C10 23 12 26 16 29" fill="#0b5330" />
          {/* Gamecock Body & Wing */}
          <path d="M18 25 C19 21 23 20 27 21 C31 22 34 25 32 30 C30 35 24 35 20 33 Z" fill="#b45309" stroke="#92400e" strokeWidth="1" />
          <path d="M22 23 C25 23 28 25 28 28 C28 31 25 32 22 30 Z" fill="#d97706" />
          {/* Neck & Breast (Sweater / Kelso Golden Hackles) */}
          <path d="M27 21 C29 18 31 15 32 12 C33 16 35 21 34 25 C33 26 31 25 29 23 Z" fill="#f59e0b" />
          {/* Head & Beak */}
          <circle cx="33" cy="12" r="3.5" fill="#f59e0b" />
          <polygon points="36,11 41,13 36,14" fill="#fcd34d" stroke="#d97706" strokeWidth="0.5" />
          <circle cx="33.5" cy="11.5" r="0.8" fill="#1e293b" />
          {/* Crown Comb (Ruby Red Serrated Comb) */}
          <path d="M30 10 C30 7 32 5 33 5 C34 5 35 6 36 6 C37 6 38 7 38 9 C36 9 34 9 32 10 Z" fill="#dc2626" />
          {/* Wattle */}
          <path d="M35 14 C36 15 36 17 35 18 C34 18 34 16 34 15 Z" fill="#dc2626" />
          {/* Champion Leg Spurs (Tari Mount) */}
          <path d="M23 34 L21 40 M26 33 L27 40" stroke="#fcd34d" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M27 38 L30 37" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    // 5. Grandstand Betting: Casino/Coliseum chips stack with Peso ₱ & Odds tokens
    case 'Coins':
    case 'grandstand-betting':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Bottom Chip (Ruby Meron) */}
          <ellipse cx="24" cy="37" rx="16" ry="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="8" y="31" width="32" height="6" fill="#b91c1c" />
          <ellipse cx="24" cy="31" rx="16" ry="6" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
          {/* Middle Chip (Blue Wala) */}
          <rect x="10" y="24" width="28" height="6" fill="#1d4ed8" />
          <ellipse cx="24" cy="24" rx="14" ry="5.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
          {/* Top Chip (Gold Jackpot / Plasada) */}
          <rect x="12" y="17" width="24" height="6" fill="#b45309" />
          <ellipse cx="24" cy="17" rx="12" ry="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <ellipse cx="24" cy="17" rx="8" ry="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
          {/* Peso Symbol */}
          <text x="24" y="19" textAnchor="middle" fontSize="6" fontWeight="900" fill="#78350f" fontFamily="sans-serif">₱</text>
        </svg>
      );

    // 6. Events & Schedule: Golden derby championship trophy & calendar page
    case 'CalendarPlus':
    case 'events-schedule':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Calendar Backing */}
          <rect x="7" y="10" width="34" height="32" rx="4" fill="#ffffff" stroke="#0e8a4e" strokeWidth="2" />
          <rect x="7" y="10" width="34" height="9" rx="4" fill="#0e8a4e" />
          <circle cx="14" cy="8" r="2" fill="#047857" />
          <circle cx="34" cy="8" r="2" fill="#047857" />
          <rect x="11" y="23" width="6" height="4" rx="1" fill="#dcfce7" />
          <rect x="21" y="23" width="6" height="4" rx="1" fill="#dcfce7" />
          <rect x="11" y="31" width="6" height="4" rx="1" fill="#dcfce7" />
          <rect x="21" y="31" width="6" height="4" rx="1" fill="#dcfce7" />
          {/* Derby Trophy Cup overlay */}
          <path d="M27 18 H41 L39 28 C38 32 35 34 34 34 V37 H38 V39 H30 V37 H34 V34 C33 34 30 32 29 28 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          <path d="M27 20 H25 C23 20 23 24 25 25 H28" stroke="#b45309" strokeWidth="1" fill="none" />
          <path d="M41 20 H43 C45 20 45 24 43 25 H40" stroke="#b45309" strokeWidth="1" fill="none" />
        </svg>
      );

    // 7. Cashier & Payouts: Vault cash drawer, peso bills & redemption ticket
    case 'ReceiptText':
    case 'cashier-payouts':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Cash Vault / Drawer */}
          <rect x="6" y="18" width="36" height="24" rx="4" fill="#1e293b" stroke="#0e8a4e" strokeWidth="2" />
          {/* Green Peso Banknotes stack */}
          <rect x="11" y="12" width="26" height="14" rx="2" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
          <ellipse cx="24" cy="19" rx="4" ry="3" fill="#34d399" />
          <text x="24" y="21" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#064e3b">₱</text>
          {/* Payout Ticket Slip */}
          <path d="M26 24 H37 V39 H26 L29 36 L26 33 L29 30 L26 27 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <line x1="29" y1="27" x2="34" y2="27" stroke="#854d0e" strokeWidth="1" />
          <line x1="29" y1="30" x2="34" y2="30" stroke="#854d0e" strokeWidth="1" />
          <line x1="29" y1="33" x2="34" y2="33" stroke="#854d0e" strokeWidth="1" />
          {/* Drawer Handle */}
          <rect x="18" y="32" width="12" height="3" rx="1.5" fill="#94a3b8" />
        </svg>
      );

    // 8. Ruedo Pit & Bell: Authentic brass arena fight bell with resonance ring
    case 'Bell':
    case 'ruedo-pit':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Wooden Bracket */}
          <rect x="6" y="8" width="8" height="32" rx="2" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <path d="M14 12 H26 V18" stroke="#d99b1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* Golden Brass Bell Body */}
          <path d="M18 20 C18 16 34 16 34 20 C34 24 38 28 39 33 H13 C14 28 18 24 18 20 Z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
          {/* Bell Rim & Clapper */}
          <ellipse cx="26" cy="33" rx="13" ry="2.5" fill="#d97706" stroke="#92400e" strokeWidth="1" />
          <circle cx="26" cy="37" r="3" fill="#78350f" />
          {/* Red Bell Cord */}
          <path d="M26 39 C27 42 25 44 26 46" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
          {/* Sound Waves */}
          <path d="M40 22 C43 25 43 31 40 34" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M43 18 C47 23 47 33 43 38" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    // 9. Kasahan Matchmaking: Crossed stainless steel tari (spurs) & balance scale
    case 'Scale':
    case 'kasahan-matchmaking':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Central Scale Pillar */}
          <path d="M24 10 V38 M18 38 H30" stroke="#0e8a4e" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="10" r="3" fill="#d99b1a" />
          {/* Crossed Tari (Gaff Blades) */}
          <path d="M12 16 C18 17 24 22 28 28 L29 27 C25 21 19 16 13 15 Z" fill="#94a3b8" stroke="#475569" strokeWidth="0.8" />
          <path d="M36 16 C30 17 24 22 20 28 L19 27 C23 21 29 16 35 15 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
          {/* Scale Beam & Balance Pans */}
          <path d="M10 16 H38" stroke="#d99b1a" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 16 L8 26 H18 L14 16" stroke="#0e8a4e" strokeWidth="1" fill="none" />
          <path d="M36 16 L32 26 H42 L38 16" stroke="#0e8a4e" strokeWidth="1" fill="none" />
          <ellipse cx="13" cy="26" rx="5" ry="1.5" fill="#12a85f" />
          <ellipse cx="37" cy="26" rx="5" ry="1.5" fill="#12a85f" />
        </svg>
      );

    // 10. Arena Paperworks & Slips: Certified derby soltada lineup clipboard with GAB seal
    case 'Ticket':
    case 'paperworks-slips':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Board */}
          <rect x="9" y="8" width="30" height="34" rx="3" fill="#854d0e" stroke="#583101" strokeWidth="1.5" />
          {/* Paper Sheet */}
          <rect x="12" y="11" width="24" height="28" rx="2" fill="#ffffff" />
          {/* Top Brass Clip */}
          <rect x="18" y="6" width="12" height="6" rx="2" fill="#d99b1a" stroke="#92400e" strokeWidth="1" />
          {/* Text Rows */}
          <line x1="16" y1="16" x2="28" y2="16" stroke="#0e8a4e" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="20" x2="32" y2="20" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          <line x1="16" y1="24" x2="30" y2="24" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          <line x1="16" y1="28" x2="32" y2="28" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" />
          {/* Certified Red Wax Stamp */}
          <circle cx="28" cy="33" r="4.5" fill="#dc2626" />
          <circle cx="28" cy="33" r="3" stroke="#fca5a5" strokeWidth="0.8" fill="none" />
        </svg>
      );

    // 11. Vet Clinic & Sutures: Veterinary medical kit with red cross & surgical needle
    case 'Activity':
    case 'vet-clinic':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Medical Bag */}
          <rect x="7" y="14" width="34" height="26" rx="5" fill="#f8fafc" stroke="#0e8a4e" strokeWidth="2" />
          <path d="M17 14 V10 C17 8 20 7 24 7 C28 7 31 8 31 10 V14" stroke="#0e8a4e" strokeWidth="2" fill="none" />
          {/* Medical Red Cross */}
          <rect x="21" y="20" width="6" height="14" rx="1.5" fill="#dc2626" />
          <rect x="17" y="24" width="14" height="6" rx="1.5" fill="#dc2626" />
          {/* Curved Surgical Suture Needle & Thread */}
          <path d="M33 22 C37 25 38 31 34 35" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="33" cy="22" r="0.8" fill="#0284c7" />
          <path d="M34 35 C32 38 29 38 28 36" stroke="#0284c7" strokeWidth="1" strokeDasharray="1 1.5" fill="none" />
        </svg>
      );

    // 12. Finance & BIR Audit: Gold tax ledger with official BIR stamp & peso symbol
    case 'PhilippinePeso':
    case 'finance-bir':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Ledger Book */}
          <rect x="8" y="8" width="32" height="34" rx="4" fill="#0f291e" stroke="#d99b1a" strokeWidth="2" />
          <rect x="8" y="8" width="6" height="34" rx="2" fill="#d99b1a" />
          {/* Gold Coin with Peso Symbol */}
          <circle cx="26" cy="22" r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
          <ellipse cx="26" cy="22" rx="7" ry="7" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
          <text x="26" y="25.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="#78350f" fontFamily="sans-serif">₱</text>
          {/* BIR CAS Checkmark Strip */}
          <path d="M18 35 L23 35 M26 35 L34 35" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    // 13. Inventory & Equipment: Coliseum supply chest containing tari cases & leg bands
    case 'Box':
    case 'inventory-equipment':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Isometric Chest / Box */}
          <polygon points="24,6 40,15 24,24 8,15" fill="#12a85f" stroke="#065f46" strokeWidth="1.5" />
          <polygon points="8,15 24,24 24,42 8,33" fill="#0e8a4e" stroke="#065f46" strokeWidth="1.5" />
          <polygon points="40,15 24,24 24,42 40,33" fill="#093821" stroke="#065f46" strokeWidth="1.5" />
          {/* Metal Corner Straps */}
          <line x1="24" y1="24" x2="24" y2="42" stroke="#d99b1a" strokeWidth="2.5" />
          <path d="M16 19.5 L16 37.5 M32 19.5 L32 37.5" stroke="#d99b1a" strokeWidth="1.5" />
          {/* Steel Lock */}
          <rect x="22" y="22" width="4" height="5" rx="1" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
        </svg>
      );

    // 14. Reports & Audits: Analytical 3D bar chart with audit magnifying glass
    case 'BarChart3':
    case 'reports-audits':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Axes */}
          <path d="M8 8 V38 H40" stroke="#0e8a4e" strokeWidth="2" strokeLinecap="round" />
          {/* 3D Gradient Bars */}
          <rect x="12" y="24" width="6" height="13" rx="1.5" fill="#10b981" />
          <rect x="20" y="16" width="6" height="21" rx="1.5" fill="#0e8a4e" />
          <rect x="28" y="10" width="6" height="27" rx="1.5" fill="#d99b1a" />
          {/* Magnifying Glass */}
          <circle cx="34" cy="18" r="6" fill="rgba(255,255,255,0.7)" stroke="#0e8a4e" strokeWidth="1.8" />
          <line x1="38" y1="22" x2="43" y2="27" stroke="#0e8a4e" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="32,18 33.5,20 36.5,16" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    // 15. Devices & Terminals: Desktop command screen + Kristo wireless POS terminal
    case 'MonitorSmartphone':
    case 'devices-terminals':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Main Desktop Screen */}
          <rect x="6" y="8" width="28" height="20" rx="3" fill="#0f291e" stroke="#0e8a4e" strokeWidth="1.8" />
          <rect x="9" y="11" width="22" height="14" rx="1.5" fill="#061d12" />
          <path d="M16 28 L14 36 H26 L24 28" stroke="#0e8a4e" strokeWidth="1.5" fill="#1e3a2b" />
          {/* Handheld POS Device */}
          <rect x="28" y="18" width="14" height="24" rx="3" fill="#ffffff" stroke="#d99b1a" strokeWidth="1.8" />
          <rect x="30" y="21" width="10" height="11" rx="1" fill="#0f291e" />
          <circle cx="35" cy="37" r="1.8" fill="#d99b1a" />
          {/* Wireless signal arcs */}
          <path d="M31 14 C33 12 37 12 39 14" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M29 11 C33 8 37 8 41 11" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    // 16. Security & Audit: Zero-trust titanium padlock with holographic shield
    case 'ShieldCheck':
    case 'security-audit':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Shield Silhouette */}
          <path d="M24 6 L38 11 V22 C38 31 31 38 24 42 C17 38 10 31 10 22 V11 Z" fill="#093821" stroke="#12a85f" strokeWidth="2" />
          {/* Internal Padlock */}
          <path d="M19 22 V17 C19 14.5 21 13 24 13 C27 13 29 14.5 29 17 V22" stroke="#d99b1a" strokeWidth="2" fill="none" />
          <rect x="16" y="21" width="16" height="13" rx="3" fill="#d99b1a" stroke="#b45309" strokeWidth="1" />
          <circle cx="24" cy="26" r="2" fill="#78350f" />
          <path d="M24 28 V30" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // 17. Database Explorer: Multi-tier SQLite WAL database cylinders
    case 'Database':
    case 'database-explorer':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Bottom Cylinder */}
          <path d="M10 28 C10 32 38 32 38 28 V36 C38 40 10 40 10 36 Z" fill="#093821" stroke="#0e8a4e" strokeWidth="1.5" />
          {/* Middle Cylinder */}
          <path d="M10 18 C10 22 38 22 38 18 V26 C38 30 10 30 10 26 Z" fill="#0e8a4e" stroke="#12a85f" strokeWidth="1.5" />
          {/* Top Cylinder & Cap */}
          <path d="M10 9 C10 13 38 13 38 9 V16 C38 20 10 20 10 16 Z" fill="#12a85f" stroke="#34d399" strokeWidth="1.5" />
          <ellipse cx="24" cy="9" rx="14" ry="4.5" fill="#34d399" stroke="#ffffff" strokeWidth="1" />
          {/* SQLite WAL Indicator nodes */}
          <circle cx="16" cy="18" r="1.5" fill="#f59e0b" />
          <circle cx="16" cy="27" r="1.5" fill="#10b981" />
          <circle cx="16" cy="36" r="1.5" fill="#10b981" />
        </svg>
      );

    // 18. Network Gateway: Air-gapped LAN gigabit router & radio hub
    case 'Network':
    case 'network-gateway':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Router Body */}
          <rect x="8" y="24" width="32" height="15" rx="3" fill="#0f291e" stroke="#0e8a4e" strokeWidth="2" />
          {/* Dual Antennas */}
          <line x1="14" y1="24" x2="14" y2="10" stroke="#0e8a4e" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="24" x2="34" y2="10" stroke="#0e8a4e" strokeWidth="2" strokeLinecap="round" />
          <circle cx="14" cy="9" r="2" fill="#d99b1a" />
          <circle cx="34" cy="9" r="2" fill="#d99b1a" />
          {/* LED Indicators */}
          <circle cx="14" cy="31" r="1.5" fill="#10b981" />
          <circle cx="19" cy="31" r="1.5" fill="#10b981" />
          <circle cx="24" cy="31" r="1.5" fill="#34d399" />
          <circle cx="29" cy="31" r="1.5" fill="#f59e0b" />
          {/* Signal wave arcs */}
          <path d="M20 15 C22 13 26 13 28 15" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M17 11 C21 8 27 8 31 11" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    // 19. Settings: Precision interlocking system gears
    case 'Settings':
    case 'settings':
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          {/* Large Primary Emerald Gear */}
          <circle cx="21" cy="25" r="7" fill="#0e8a4e" stroke="#093821" strokeWidth="1.5" />
          <path d="M21 14 V17 M21 33 V36 M10 25 H13 M29 25 H32 M13.5 17.5 L15.5 19.5 M26.5 30.5 L28.5 32.5 M13.5 32.5 L15.5 30.5 M26.5 19.5 L28.5 17.5" stroke="#0e8a4e" strokeWidth="3" strokeLinecap="round" />
          <circle cx="21" cy="25" r="3" fill="#ffffff" />
          {/* Small Secondary Gold Gear */}
          <circle cx="33" cy="17" r="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          <path d="M33 9 V11 M33 23 V25 M25 17 H27 M39 17 H41 M27.5 11.5 L29 13 M37 21 L38.5 22.5 M27.5 22.5 L29 21 M37 13 L38.5 11.5" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="33" cy="17" r="2" fill="#ffffff" />
        </svg>
      );

    default:
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="8" y="8" width="32" height="32" rx="6" fill="#0e8a4e" stroke="#12a85f" strokeWidth="2" />
          <circle cx="24" cy="24" r="8" fill="#ffffff" />
        </svg>
      );
  }
}

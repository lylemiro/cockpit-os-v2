import React from 'react';
import {
  Monitor,
  Users,
  Layers,
  Coins,
  CalendarPlus,
  ReceiptText,
  Bell,
  Scale,
  Ticket,
  Activity,
  Box,
  BarChart3,
  MonitorSmartphone,
  ShieldCheck,
  Database,
  Network,
  Settings
} from 'lucide-react';

const ICON_MAP = {
  Monitor,
  Users,
  Layers,
  Coins,
  CalendarPlus,
  ReceiptText,
  Bell,
  Scale,
  Ticket,
  Activity,
  Box,
  BarChart3,
  MonitorSmartphone,
  ShieldCheck,
  Database,
  Network,
  Settings
};

export function AppIconGlyph({ name, size = 22 }) {
  if (name === 'BrandChevronCrest') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <polygon points="8,31 32,12 32,26 14,38" fill="#F6C854" />
        <polygon points="8,31 14,38 32,26 32,36 8,51" fill="#C88A14" />
        <polygon points="32,12 56,28 45,35 32,25" fill="#6EE7B7" />
        <polygon points="32,25 53,41 32,36" fill="#10B981" />
      </svg>
    );
  }

  if (name === 'RoosterCrest') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 4c-1.5 0-2.5 1-3 2-1.5 0-2.5 1-3 2.5C6.5 8 4 9.5 3 12c2 0 3.5 1 4 2.5C5 15 3.5 16.5 3 18h6l1.5 3h3v-2.5c3.5-.5 6-3.5 6-7 0-1.5-.5-3-1.5-4L20 6l-2-1c-.5-.5-1.5-1-3-1Z" />
        <circle cx="15.5" cy="7.5" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  if (name === 'PhilippinePeso') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 20V4h5.5a4.5 4.5 0 0 1 0 9H7" />
        <path d="M4 7h15" />
        <path d="M4 10.5h15" />
      </svg>
    );
  }

  const LucideComponent = ICON_MAP[name] || Monitor;
  return <LucideComponent size={size} strokeWidth={2} />;
}

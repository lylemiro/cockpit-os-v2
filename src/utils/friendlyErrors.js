/**
 * COCKPIT OS — Centralized Human-Friendly Error & Notification Translator
 * Converts technical jargon, database constraints, and network codes into clear,
 * reassuring, easy-to-understand messages for arena staff, cashiers, and referees.
 */

export function translateToFriendlyError(rawError) {
  if (!rawError) {
    return {
      title: 'Action Could Not Complete',
      message: 'Something unexpected occurred. Please try again or check your input.',
      tip: 'If this continues, ask your arena supervisor.'
    };
  }

  const errStr = typeof rawError === 'string' ? rawError : (rawError.message || String(rawError));

  // 1. UNIQUE constraint violations
  if (errStr.includes('UNIQUE constraint failed: entries.entry_code') || errStr.includes('entry_code')) {
    return {
      title: 'Entry Code Already in Use',
      message: 'A rooster is already registered under this entry code. Each bird must have a distinct code.',
      tip: 'Tip: Check the entry list or use the next available number.'
    };
  }

  if (errStr.includes('UNIQUE constraint failed: employees.staff_code') || errStr.includes('staff_code')) {
    return {
      title: 'Staff ID Code Already Taken',
      message: 'Another employee is already registered with this Staff Code. Please choose a unique ID.',
      tip: 'Tip: Try using their initials and a number (e.g. EMP-02).'
    };
  }

  if (errStr.includes('UNIQUE constraint failed: tenants.tenant_code') || errStr.includes('tenant_code')) {
    return {
      title: 'Arena Code Already Exists',
      message: 'An arena database with this code has already been created on this computer.',
      tip: 'Tip: Use your arena location code (e.g. SJC-02).'
    };
  }

  if (errStr.includes('UNIQUE constraint failed')) {
    return {
      title: 'Duplicate Record Found',
      message: 'This record already exists in the arena database and cannot be added twice.',
      tip: 'Tip: Check existing records before adding a new one.'
    };
  }

  // 2. FOREIGN KEY / Deletion blocks
  if (errStr.includes('FOREIGN KEY constraint failed')) {
    return {
      title: 'Item Cannot Be Removed',
      message: 'This record is currently linked to an active fight, bet, or weigh-in record.',
      tip: 'Tip: Void or complete connected records before deleting this item.'
    };
  }

  // 3. Authentication & PIN lockout
  if (errStr.includes('consecutive failed PIN') || errStr.includes('locked')) {
    return {
      title: 'Account Locked for Security',
      message: 'Too many incorrect PIN attempts were detected. This user account is temporarily locked.',
      tip: 'Tip: Please ask the Chief System Architect or Supervisor to unlock your account in Users & Permissions.'
    };
  }

  if (errStr.includes('Invalid operator PIN') || errStr.includes('PIN')) {
    return {
      title: 'Incorrect PIN Entered',
      message: 'The PIN code you entered does not match this staff account. Please re-enter carefully.',
      tip: 'Tip: PINs are numeric (4 to 6 digits).'
    };
  }

  // 4. Missing required fields
  if (errStr.includes('NOT NULL constraint') || errStr.includes('required')) {
    return {
      title: 'Missing Required Information',
      message: 'One or more required fields were left empty. Please fill in all required boxes.',
      tip: 'Tip: Look for fields marked with an asterisk or red highlight.'
    };
  }

  // 5. Derby / Event state prerequisites
  if (errStr.includes('active derby') || errStr.includes('active event')) {
    return {
      title: 'No Derby Event Selected',
      message: 'There is no active derby running right now. You must start or select an event first.',
      tip: 'Tip: Open Events & Schedule to create or activate today’s derby.'
    };
  }

  // 6. Network & Gateway errors
  if (errStr.includes('Failed to fetch') || errStr.includes('NetworkError') || errStr.includes('Load failed')) {
    return {
      title: 'Local Connection Paused',
      message: 'The terminal lost touch with the arena database engine. Attempting to reconnect automatically.',
      tip: 'Tip: Ensure your arena LAN cable or local Wi-Fi hotspot is securely connected.'
    };
  }

  if (errStr.includes('EADDRINUSE') || errStr.includes('address already in use')) {
    return {
      title: 'System Already Running',
      message: 'COCKPIT OS is already running in another window on this computer.',
      tip: 'Tip: Switch to the already open window or restart your computer.'
    };
  }

  // 7. General fallback
  return {
    title: 'Notice',
    message: errStr.replace(/^Error:\s*/, ''),
    tip: 'Click dismiss to continue.'
  };
}


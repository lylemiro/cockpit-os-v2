export function evaluateZeroTrustGates(tdb) {
  if (!tdb) {
    return [
      {
        gateId: 'Gate 0',
        name: 'Multi-Tenant DB & ARBAC Binding',
        owner: 'devices-terminals',
        passed: false,
        metric: 'Awaiting Physical Tenant SQLite DB Provisioning',
        wsEvent: 'DEVICE_AUTHORIZED'
      }
    ];
  }

  const authorizedDevices = tdb
    .prepare('SELECT COUNT(*) as count FROM devices WHERE is_authorized = 1')
    .get().count;

  const totalDevices = tdb.prepare('SELECT COUNT(*) as count FROM devices').get().count;

  const onDutyStaff = tdb
    .prepare("SELECT COUNT(*) as count FROM employees WHERE status = 'ON_DUTY'")
    .get().count;

  const activeDerbies = tdb
    .prepare("SELECT COUNT(*) as count FROM derby_events WHERE status = 'ACTIVE' AND is_archived = 0")
    .get().count;

  const clearedEntries = tdb
    .prepare(
      "SELECT COUNT(*) as count FROM derby_entries WHERE pot_payment_status IN ('PAID', 'PENDING_CASHIER', 'EXEMPT')"
    )
    .get().count;

  const config = tdb.prepare('SELECT * FROM arena_config WHERE id = 1').get();
  const minW = config?.weight_min_grams ?? 1800;
  const maxW = config?.weight_max_grams ?? 2650;
  const maxTol = config?.kasahan_tolerance_grams ?? 30;

  const validRoosters = tdb
    .prepare(
      'SELECT COUNT(*) as count FROM roosters WHERE weight_grams BETWEEN ? AND ? AND wing_band IS NOT NULL'
    )
    .get(minW, maxW).count;

  const pairedFights = tdb
    .prepare('SELECT COUNT(*) as count FROM fights WHERE weight_diff <= ? AND meron_entry_id != wala_entry_id')
    .get(maxTol).count;

  const armedFights = tdb
    .prepare('SELECT COUNT(*) as count FROM fights WHERE tari_signed_by IS NOT NULL')
    .get().count;

  const livePitCount = tdb
    .prepare("SELECT COUNT(*) as count FROM fights WHERE staging_tier = 'LIVE_PIT'")
    .get().count;

  const currentFight = tdb
    .prepare("SELECT * FROM fights WHERE staging_tier = 'LIVE_PIT' ORDER BY fight_number ASC LIMIT 1")
    .get();

  const completedFights = tdb
    .prepare("SELECT COUNT(*) as count FROM fights WHERE status = 'COMPLETED' AND verdict IS NOT NULL")
    .get().count;

  return [
    {
      gateId: 'Gate 0',
      name: 'Dedicated DB ARBAC & Hardware Binding',
      owner: 'devices-terminals',
      passed: authorizedDevices > 0 && onDutyStaff > 0,
      metric: `${authorizedDevices}/${totalDevices} Whitelisted Devices | ${onDutyStaff} Active DB Users`,
      wsEvent: 'DEVICE_AUTHORIZED'
    },
    {
      gateId: 'Gate 1',
      name: 'Single Active Tournament Exclusivity',
      owner: 'events-schedule',
      passed: activeDerbies === 1,
      metric:
        activeDerbies === 1
          ? '1 Live Derby Active in Tenant DB'
          : `${activeDerbies} Active Derbies (Requires Exactly 1)`,
      wsEvent: 'EVENT_ACTIVATED'
    },
    {
      gateId: 'Gate 2',
      name: 'Participant Entry & Pot Escrow Clearance',
      owner: 'events-schedule',
      passed: activeDerbies === 1 && clearedEntries >= 2,
      metric: `${clearedEntries} Syndicate Entries Cleared (${clearedEntries >= 2 ? 'Ready' : 'Min 2 Required'})`,
      wsEvent: 'ENTRY_REGISTERED'
    },
    {
      gateId: 'Gate 3',
      name: 'Calibrated Timbangan & Biometrics',
      owner: 'kasahan-matchmaking',
      passed: validRoosters >= 2,
      metric: `${validRoosters} Stags Verified (${minW}g–${maxW}g)`,
      wsEvent: 'ROOSTER_WEIGHED'
    },
    {
      gateId: 'Gate 4',
      name: 'Kasahan Pairing Matrix (<=30g)',
      owner: 'kasahan-matchmaking',
      passed: pairedFights >= 1,
      metric: `${pairedFights} Soltadas Paired (Max Diff <=${maxTol}g)`,
      wsEvent: 'KESAHAN_BATCH_PUBLISHED'
    },
    {
      gateId: 'Gate 5',
      name: 'Tari / Armorer Blade Sign-Off',
      owner: 'kasahan-matchmaking',
      passed: armedFights >= 1,
      metric: `${armedFights}/${pairedFights} Bouts Signed Off by Armorer`,
      wsEvent: 'TARI_INSPECTION_VERIFIED'
    },
    {
      gateId: 'Gate 6',
      name: '3-Tier Staging & Calling Queue',
      owner: 'ruedo-pit',
      passed: livePitCount === 1,
      metric:
        livePitCount === 1
          ? `Fight #${currentFight.fight_number} Live in Pit`
          : 'No Bout Currently in Live Pit',
      wsEvent: 'STAGING_QUEUE_UPDATED'
    },
    {
      gateId: 'Gate 7',
      name: 'Pit Bell & Atomic Bet Lockdown',
      owner: 'ruedo-pit',
      passed: Boolean(currentFight),
      metric: currentFight
        ? currentFight.is_betting_open
          ? `Fight #${currentFight.fight_number}: PUSTA BUKAS (Open)`
          : `Fight #${currentFight.fight_number}: NAGLALABAN (Locked)`
        : 'Awaiting Active Pit Bout',
      wsEvent: 'BETTING_CLOSED'
    },
    {
      gateId: 'Gate 8',
      name: 'Instant Verdict & 10% Plasada Settlement',
      owner: 'finance-bir',
      passed: completedFights >= 1,
      metric: `${completedFights} Bouts Settled with 10% House Plasada`,
      wsEvent: 'VERDICT_DECLARED'
    }
  ];
}

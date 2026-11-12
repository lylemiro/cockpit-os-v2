import os from 'node:os';
import fs from 'node:fs';
import crypto from 'node:crypto';

export function discoverArenaLanInfo() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        candidates.push({
          name,
          address: addr.address,
          mac: addr.mac || '00:00:00:00:00:00'
        });
      }
    }
  }

  const wifiHotspot = candidates.find((c) =>
    /wi-?fi|wlan|hotspot|local area connection\*/i.test(c.name)
  );
  const privateLan = candidates.find((c) => c.address.startsWith('192.168.'));
  const selected = wifiHotspot || privateLan || candidates[0] || {
    name: 'loopback',
    address: '127.0.0.1',
    mac: os.hostname()
  };

  const hash = crypto
    .createHash('sha256')
    .update(`${os.hostname()}-${selected.mac}`)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();

  return {
    lanIp: selected.address,
    interfaceName: selected.name,
    macAddress: selected.mac.toUpperCase(),
    terminalId: `TERM-${hash}`
  };
}

let previousCpuTimes = readCpuSnapshot();

function readCpuSnapshot() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    for (const type of Object.keys(cpu.times)) {
      total += cpu.times[type];
    }
    idle += cpu.times.idle;
  }
  return { idle, total };
}

export function getLiveSystemMetrics() {
  const currentCpu = readCpuSnapshot();
  const idleDiff = currentCpu.idle - previousCpuTimes.idle;
  const totalDiff = currentCpu.total - previousCpuTimes.total;
  previousCpuTimes = currentCpu;

  const cpuLoadPct =
    totalDiff > 0 ? Math.max(1, Math.min(100, Math.round((1 - idleDiff / totalDiff) * 100))) : 0;

  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;
  const memoryTotalGb = Number((totalMemBytes / 1024 ** 3).toFixed(1));
  const memoryUsedGb = Number((usedMemBytes / 1024 ** 3).toFixed(1));

  let storageUsedGb = null;
  let storageTotalGb = null;
  try {
    if (typeof fs.statfsSync === 'function') {
      const stats = fs.statfsSync(process.cwd());
      const totalDiskBytes = stats.blocks * stats.bsize;
      const freeDiskBytes = stats.bfree * stats.bsize;
      const usedDiskBytes = totalDiskBytes - freeDiskBytes;
      storageTotalGb = Math.round(totalDiskBytes / 1024 ** 3);
      storageUsedGb = Math.round(usedDiskBytes / 1024 ** 3);
    }
  } catch {
    // Disk stat unavailable on current mount
  }

  const lanInfo = discoverArenaLanInfo();

  return {
    cpuLoadPct,
    memoryUsedGb,
    memoryTotalGb,
    storageUsedGb,
    storageTotalGb,
    uptimeSeconds: Math.floor(os.uptime()),
    hostname: os.hostname(),
    ...lanInfo
  };
}

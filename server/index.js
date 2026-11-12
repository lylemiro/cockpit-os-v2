import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeDatabase } from './db/database.js';
import { ArenaWsHub } from './ws/wsHub.js';
import { handleApiRequest, buildFullArenaState } from './modules/apiRouter.js';
import { discoverArenaLanInfo } from './services/lanDiscovery.js';

initializeDatabase();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const publicDir = path.join(__dirname, '..', 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg'
};

const PORT = Number(process.env.PORT || 4000);
const wsHub = new ArenaWsHub();

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    handleApiRequest(req, res, wsHub);
    return;
  }

  // Serve built frontend from dist/ (or static assets from public/) when available
  const reqPath = new URL(req.url, 'http://localhost').pathname;
  const cleanRel = reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, '');

  const candidatePaths = [
    path.join(distDir, cleanRel),
    path.join(publicDir, cleanRel),
    path.join(distDir, 'index.html')
  ];

  for (const filePath of candidatePaths) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      system: 'COCKPIT OS v2.4.0 Daemon',
      status: 'OPERATIONAL',
      ...discoverArenaLanInfo()
    })
  );
});

wsHub.attachToServer(server);

// Broadcast live OS hardware telemetry (CPU, Memory, Disk, LAN) every 5 seconds
setInterval(() => {
  if (wsHub.clients.size > 0) {
    const state = buildFullArenaState(wsHub.clients.size);
    wsHub.broadcast('TELEMETRY_HEARTBEAT', {
      systemMetrics: state.systemMetrics,
      operationsSummary: state.operationsSummary
    });
  }
}, 5000);

server.listen(PORT, '0.0.0.0', () => {
  const lan = discoverArenaLanInfo();
  console.log(
    `[COCKPIT OS v2.4.0] Zero-Trust SQLite + WS Daemon listening on http://${lan.lanIp}:${PORT} (${lan.terminalId})`
  );
});

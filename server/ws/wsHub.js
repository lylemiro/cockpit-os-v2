import crypto from 'node:crypto';
import { discoverArenaLanInfo } from '../services/lanDiscovery.js';

export class ArenaWsHub {
  constructor() {
    this.clients = new Set();
  }

  attachToServer(httpServer) {
    httpServer.on('upgrade', (req, socket) => {
      if (!req.url.startsWith('/ws')) {
        socket.destroy();
        return;
      }

      const key = req.headers['sec-websocket-key'];
      if (!key) {
        socket.destroy();
        return;
      }

      const acceptKey = crypto
        .createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
        .digest('base64');

      const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        '\r\n'
      ];

      socket.write(headers.join('\r\n'));
      this.clients.add(socket);

      const lanInfo = discoverArenaLanInfo();
      this.sendToSocket(socket, {
        event: 'WS_CONNECTED',
        timestamp: new Date().toISOString(),
        gateway: lanInfo.lanIp,
        terminalId: lanInfo.terminalId,
        connectedClients: this.clients.size
      });

      socket.on('data', (buffer) => {
        try {
          const message = this.decodeFrame(buffer);
          if (message) {
            const parsed = JSON.parse(message);
            if (parsed.type === 'PING') {
              this.sendToSocket(socket, { event: 'PONG', timestamp: Date.now() });
            }
          }
        } catch {
          // Ignore malformed client frames
        }
      });

      socket.on('close', () => this.clients.delete(socket));
      socket.on('error', () => this.clients.delete(socket));
    });
  }

  decodeFrame(buffer) {
    if (buffer.length < 2) return null;
    const secondByte = buffer[1];
    const isMasked = (secondByte & 0x80) !== 0;
    let payloadLength = secondByte & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      payloadLength = buffer.readUInt16BE(2);
      offset = 4;
    } else if (payloadLength === 127) {
      payloadLength = Number(buffer.readBigUInt64BE(2));
      offset = 10;
    }

    let maskKey = null;
    if (isMasked) {
      maskKey = buffer.subarray(offset, offset + 4);
      offset += 4;
    }

    const payload = Buffer.alloc(payloadLength);
    for (let i = 0; i < payloadLength && offset + i < buffer.length; i++) {
      payload[i] = isMasked ? buffer[offset + i] ^ maskKey[i % 4] : buffer[offset + i];
    }

    return payload.toString('utf8');
  }

  encodeFrame(dataString) {
    const payload = Buffer.from(dataString, 'utf8');
    const length = payload.length;
    let header;

    if (length < 126) {
      header = Buffer.alloc(2);
      header[0] = 0x81;
      header[1] = length;
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x81;
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x81;
      header[1] = 127;
      header.writeBigUInt64BE(BigInt(length), 2);
    }

    return Buffer.concat([header, payload]);
  }

  sendToSocket(socket, payloadObj) {
    if (socket.destroyed) {
      this.clients.delete(socket);
      return;
    }
    const frame = this.encodeFrame(JSON.stringify(payloadObj));
    socket.write(frame);
  }

  broadcast(event, data = {}) {
    const packet = {
      event,
      timestamp: new Date().toISOString(),
      ...data
    };
    const frame = this.encodeFrame(JSON.stringify(packet));
    for (const socket of this.clients) {
      if (!socket.destroyed) {
        socket.write(frame);
      } else {
        this.clients.delete(socket);
      }
    }
  }
}

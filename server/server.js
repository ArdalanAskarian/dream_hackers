const WebSocket = require('ws');
const os = require('os');

const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT, perMessageDeflate: false });

const clients = new Set();
let phoneClient = null;
let vrClient = null;

// Get local IP address for display
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Log with timestamp
function log(message) {
  console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
}

// Handle new connections
wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  log(`New client connected from ${clientIP}`);
  clients.add(ws);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connection_established',
    message: 'Connected to Dream Hackers server',
    timestamp: Date.now()
  }));

  // Handle incoming messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      log(`Received: ${JSON.stringify(message)}`);

      // Handle client identification
      if (message.type === 'identify') {
        if (message.clientType === 'phone') {
          phoneClient = ws;
          ws.clientType = 'phone';
          log('  -> Phone client identified');

          // Notify phone of current VR status
          ws.send(JSON.stringify({
            type: 'vr_status',
            connected: vrClient !== null && vrClient.readyState === WebSocket.OPEN,
            timestamp: Date.now()
          }));
        } else if (message.clientType === 'vr') {
          vrClient = ws;
          ws.clientType = 'vr';
          log('  -> VR client identified');

          // Notify phone that VR connected
          if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
            phoneClient.send(JSON.stringify({
              type: 'vr_status',
              connected: true,
              timestamp: Date.now()
            }));
          }
        }
        return;
      }

      // Handle swipe right (accept) - relay to VR
      if (message.type === 'swipe_right') {
        log(`  -> Object "${message.objectId}" ACCEPTED (swipe right)`);

        if (vrClient && vrClient.readyState === WebSocket.OPEN) {
          vrClient.send(JSON.stringify(message));
          log('  -> Sent to VR client');

          // Confirm to phone
          if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
            phoneClient.send(JSON.stringify({
              type: 'swipe_confirmed',
              objectId: message.objectId,
              timestamp: Date.now()
            }));
          }
        } else {
          log('  -> WARNING: No VR client connected!');
          if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
            phoneClient.send(JSON.stringify({
              type: 'error',
              message: 'VR headset not connected',
              timestamp: Date.now()
            }));
          }
        }
        return;
      }

      // Handle swipe left (reject) - relay to VR
      if (message.type === 'swipe_left') {
        log(`  -> Object "${message.objectId}" REJECTED (swipe left)`);

        if (vrClient && vrClient.readyState === WebSocket.OPEN) {
          vrClient.send(JSON.stringify(message));
          log('  -> Sent rejection to VR client');
        }
        return;
      }

      // Handle spawn confirmed from VR - relay to phone
      if (message.type === 'spawn_confirmed') {
        log(`  -> Object "${message.objectId}" spawned in VR!`);

        if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
          phoneClient.send(JSON.stringify(message));
          log('  -> Notified phone client');
        }
        return;
      }

      // Handle ping/pong for keep-alive
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        return;
      }

    } catch (error) {
      log(`Error processing message: ${error.message}`);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    log(`Client disconnected (${ws.clientType || 'unknown'})`);
    clients.delete(ws);

    if (ws === phoneClient) {
      phoneClient = null;
      log('  -> Phone client disconnected');
    }
    if (ws === vrClient) {
      vrClient = null;
      log('  -> VR client disconnected');

      // Notify phone that VR disconnected
      if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
        phoneClient.send(JSON.stringify({
          type: 'vr_status',
          connected: false,
          timestamp: Date.now()
        }));
      }
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    log(`WebSocket error: ${error.message}`);
  });
});

// Keep-alive ping every 30 seconds
setInterval(() => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.ping();
    }
  });
}, 30000);

// Server startup message
const localIP = getLocalIP();
console.log('');
console.log('='.repeat(60));
console.log('  Dream Hackers WebSocket Server');
console.log('='.repeat(60));
console.log('');
console.log(`  Server running on port ${PORT}`);
console.log('');
console.log('  Connect your devices to:');
console.log(`    ws://${localIP}:${PORT}`);
console.log('');
console.log('  Status:');
console.log('    Phone: Waiting...');
console.log('    VR:    Waiting...');
console.log('');
console.log('='.repeat(60));
console.log('');
log('Server started, waiting for connections...');

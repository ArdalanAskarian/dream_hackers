const WebSocket = require('ws');
const os = require('os');

// Configuration
const PORT = process.env.PORT || 8080;

// Create WebSocket server
const wss = new WebSocket.Server({
  port: PORT,
  perMessageDeflate: false // Better performance for small messages
});

// Track connected clients
const clients = new Set();
let phoneClient = null;
let vrClient = null;

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// Broadcast message to all clients except sender
function broadcast(message, sender) {
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Handle new connections
wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`[${new Date().toLocaleTimeString()}] New client connected from ${clientIP}`);

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
      console.log(`[${new Date().toLocaleTimeString()}] Received:`, message);

      // Handle client identification
      if (message.type === 'identify') {
        if (message.clientType === 'phone') {
          phoneClient = ws;
          ws.clientType = 'phone';
          console.log('  → Phone client identified');
        } else if (message.clientType === 'vr') {
          vrClient = ws;
          ws.clientType = 'vr';
          console.log('  → VR client identified');
        }
        return;
      }

      // Handle swipe_right from phone
      if (message.type === 'swipe_right') {
        console.log(`  → Object "${message.objectId}" swiped right! Broadcasting to VR...`);

        // Broadcast to VR client specifically
        if (vrClient && vrClient.readyState === WebSocket.OPEN) {
          vrClient.send(JSON.stringify(message));
          console.log('  ✓ Sent to VR client');

          // Send confirmation back to phone
          if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
            phoneClient.send(JSON.stringify({
              type: 'swipe_confirmed',
              objectId: message.objectId,
              timestamp: Date.now()
            }));
          }
        } else {
          console.log('  ✗ No VR client connected');
          // Notify phone that VR is not connected
          ws.send(JSON.stringify({
            type: 'error',
            message: 'VR client not connected',
            timestamp: Date.now()
          }));
        }
        return;
      }

      // Handle spawn_confirmed from VR
      if (message.type === 'spawn_confirmed') {
        console.log(`  → Object "${message.objectId}" spawned in VR`);

        // Send confirmation to phone
        if (phoneClient && phoneClient.readyState === WebSocket.OPEN) {
          phoneClient.send(JSON.stringify(message));
        }
        return;
      }

      // Default: broadcast to all other clients
      broadcast(data.toString(), ws);

    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: Date.now()
      }));
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log(`[${new Date().toLocaleTimeString()}] Client disconnected (${ws.clientType || 'unknown'})`);
    clients.delete(ws);

    if (ws === phoneClient) {
      phoneClient = null;
      console.log('  → Phone client disconnected');
    }
    if (ws === vrClient) {
      vrClient = null;
      console.log('  → VR client disconnected');
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle server errors
wss.on('error', (error) => {
  console.error('Server error:', error);
});

// Server started
const localIP = getLocalIP();
console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  Dream Hackers WebSocket Server');
console.log('═══════════════════════════════════════════════════════');
console.log('');
console.log(`Server running on port ${PORT}`);
console.log('');
console.log('Connect your devices to:');
console.log(`  ws://${localIP}:${PORT}`);
console.log('');
console.log('Phone app: Open web/index.html and enter server address');
console.log('Unity VR:  Set NetworkManager serverIP to: ' + localIP);
console.log('');
console.log('Waiting for connections...');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Keep-alive ping
setInterval(() => {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.ping();
    }
  });
}, 30000); // Ping every 30 seconds

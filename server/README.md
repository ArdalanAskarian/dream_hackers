# Dream Hackers WebSocket Server

Local WebSocket server for phone-to-VR communication in the Dream Hackers project.

## Setup

### Prerequisites
- Node.js installed (v14 or higher)
- Phone and Meta Quest on the same WiFi network as your computer

### Installation

```bash
cd server
npm install
```

## Running the Server

```bash
npm start
```

Or:

```bash
node server.js
```

The server will display the local IP address and port to connect to.

## How It Works

1. **Server starts** and listens on port 8080
2. **Phone connects** via web app (identifies as "phone" client)
3. **VR headset connects** via Unity (identifies as "vr" client)
4. **Phone sends swipe events** → Server relays to VR
5. **VR spawns object** → Confirms back to phone

## Message Format

### Phone → Server → VR

```json
{
  "type": "swipe_right",
  "objectId": "sphere",
  "timestamp": 1234567890
}
```

### VR → Server → Phone (optional)

```json
{
  "type": "spawn_confirmed",
  "objectId": "sphere",
  "success": true,
  "timestamp": 1234567890
}
```

### Client Identification

When connecting, clients should send:

```json
{
  "type": "identify",
  "clientType": "phone"  // or "vr"
}
```

## Connection URLs

If your local IP is `192.168.1.100`:

- **Phone web app:** Enter `ws://192.168.1.100:8080`
- **Unity VR:** Set NetworkManager serverIP to `192.168.1.100`

## Troubleshooting

### Can't connect from phone/VR

1. Make sure all devices are on the same WiFi network
2. Check firewall settings - allow port 8080
3. Try using the exact IP address shown when server starts
4. On macOS: System Preferences → Security → Firewall → Allow Node

### Connection drops

- Keep server running continuously
- Server pings clients every 30 seconds to keep connection alive
- Check WiFi stability

### No messages received

1. Check server console for "Client connected" messages
2. Verify client sends "identify" message on connect
3. Look for "Object swiped" messages in server log

## Development

### Port Configuration

Change port via environment variable:

```bash
PORT=3000 node server.js
```

### Logging

All messages are logged to console with timestamps:
- Connection events
- Incoming messages
- Broadcast events
- Errors

## For Hackathon

This is a **local development server** designed for quick setup during the hackathon. It:
- Requires no authentication
- Runs on your local network only
- Has minimal error handling
- Is perfect for demo/prototype purposes

For production, consider:
- Adding authentication
- Using WSS (secure WebSocket)
- Deploying to cloud server
- Adding message validation
- Implementing rate limiting

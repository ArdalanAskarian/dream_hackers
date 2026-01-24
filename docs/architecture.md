# Architecture

Technical reference for the phone-to-VR communication system.

## System Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Phone App     │         │  WebSocket      │         │   Unity VR      │
│   (Web)         │         │  Server         │         │                 │
│                 │         │  (Node.js)      │         │                 │
│  ┌───────────┐  │         │                 │         │  NetworkManager │
│  │  Swipe    │  │────────▶│  Tracks:        │────────▶│  (Singleton)    │
│  │  Cards    │  │  ws://  │  • phoneClient  │  ws://  │       │         │
│  └───────────┘  │         │  • vrClient     │         │       ▼         │
│                 │         │                 │         │  SpawnController│
│  WebSocket      │         │  Relays msgs    │         │       │         │
│  Client         │         │  phone → VR     │         │       ▼         │
└─────────────────┘         └─────────────────┘         │  ObjectSpawner  │
                                                        └─────────────────┘
```

## Components

### WebSocket Server (Node.js)

**Location:** `server/server.js`

- Runs on port 8080
- Tracks phone and VR clients separately
- Relays `swipe_right` messages from phone to VR
- Displays local IP on startup
- Keep-alive pings every 30 seconds

### Phone App (Web)

**Location:** `web/`

| File | Purpose |
|------|---------|
| `index.html` | UI structure |
| `style.css` | Responsive styling |
| `app.js` | Swipe logic + WebSocket client |
| `objects.json` | Object definitions |

Features: connection screen, swipeable cards, touch/mouse support, auto-reconnect

### Unity Scripts

**NetworkManager** (`Assets/Scripts/Networking/NetworkManager.cs`)
- Singleton WebSocket client
- Events: `OnObjectSwiped`, `OnConnected`, `OnDisconnected`
- Threading-safe message queue
- Auto-reconnection

**SpawnController** (`Assets/Scripts/Spawning/SpawnController.cs`)
- Maps object IDs to prefab indices
- Calculates spawn position (in front of user)
- Cooldown system (1 second default)

---

## Message Protocol

### Client Identification

Sent immediately after connecting:

```json
{
  "type": "identify",
  "clientType": "phone",
  "timestamp": 1234567890
}
```

`clientType` is either `"phone"` or `"vr"`.

### Swipe Right (Phone → Server → VR)

```json
{
  "type": "swipe_right",
  "objectId": "sphere",
  "timestamp": 1234567890
}
```

`objectId` values: `"sphere"`, `"cube"`, `"torus"`, `"cylinder"`

### Connection Established (Server → Client)

```json
{
  "type": "connection_established",
  "message": "Connected to Dream Hackers server",
  "timestamp": 1234567890
}
```

---

## Object Mappings

| Object ID | Phone Display | Prefab Index |
|-----------|---------------|--------------|
| `sphere` | Memory Orb | 0 |
| `cube` | Thought Block | 1 |
| `torus` | Dream Ring | 2 |
| `cylinder` | Time Capsule | 3 |

---

## Key File Locations

```
dream_hackers/
├── server/
│   ├── package.json          # Dependencies (ws)
│   └── server.js             # WebSocket server
├── web/
│   ├── index.html            # Phone UI
│   ├── style.css             # Styling
│   ├── app.js                # Client logic
│   └── objects.json          # Object data
└── Dream Hackers/Assets/
    └── Scripts/
        ├── Networking/
        │   └── NetworkManager.cs
        └── Spawning/
            └── SpawnController.cs
```

---

## Quick Commands

```bash
# Find local IP (macOS)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Find local IP (Windows)
ipconfig | findstr IPv4

# Start server
cd server && node server.js

# Serve phone app
cd web && python3 -m http.server 8000
```

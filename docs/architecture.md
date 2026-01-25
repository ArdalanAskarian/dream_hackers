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

┌─────────────────┐                                     ┌─────────────────┐
│  Arduino        │                                     │   Unity VR      │
│  Pulse Sensor   │                                     │                 │
│                 │         TCP/WiFi                    │ SingularityMgr  │
│  ┌───────────┐  │────────────────────────────────────▶│       │         │
│  │ Heartbeat │  │   "BPM: 72 | IBI: 832"             │       ▼         │
│  │  Sensor   │  │                                     │ MaterialFloat   │
│  └───────────┘  │                                     │  Controller     │
└─────────────────┘                                     │       │         │
                                                        │       ▼         │
                                                        │  Shader Effects │
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

**SingularityManager** (`Assets/SingularityManager.cs`)
- TCP/WiFi client for Arduino heartbeat sensor
- Parses messages between `S` and `E` markers
- Events: `onConnected`, `onMessageRecieved`, `onError`
- Supports both Bluetooth and WiFi connection modes

**MaterialFloatController** (`Assets/Scripts/MaterialFloatController.cs`)
- Receives BPM from SingularityManager via Unity event
- Parses message format: `"BPM: 72 | IBI: 832"`
- Updates shader float property in real-time
- Uses MaterialPropertyBlock for efficient rendering

**PickupAnimatorTrigger** (`Assets/Scripts/PickupAnimatorTrigger.cs`)
- Attaches to XR interactable objects
- Finds Room animator at runtime (searches "Environment" then "Room")
- Triggers animation state when object is grabbed

### Arduino Hardware

**Pulse Sensor**
- Connects to Arduino with WiFi capability (ESP32/ESP8266)
- Sends heartbeat data over TCP to Unity
- Default port: 80 (configurable in SingularityManager)

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

### Heartbeat Data (Arduino → Unity)

Raw TCP stream with start/end markers:

```
S BPM: 72 | IBI: 832 E
```

| Field | Description |
|-------|-------------|
| `S` | Start marker |
| `BPM` | Beats per minute (heart rate) |
| `IBI` | Inter-beat interval in milliseconds |
| `E` | End marker |

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
    ├── SingularityManager.cs     # Arduino TCP client
    ├── Scripts/
    │   ├── Networking/
    │   │   └── NetworkManager.cs
    │   ├── Spawning/
    │   │   └── SpawnController.cs
    │   ├── MaterialFloatController.cs  # BPM → shader
    │   └── PickupAnimatorTrigger.cs    # XR grab events
    └── Animation/
        └── Room_Controller.controller  # Room state machine
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

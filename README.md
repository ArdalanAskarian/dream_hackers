# Dreaming Machines

**Does the Internet Dream of *itself*?**

An immersive VR experience for Meta Quest where players step inside the internet's dream of humanity. A phone companion app lets participants feed content into the VR space, where it's reinterpreted as symbolic dream artifacts.

## Demo

### Full Demo Video
<!-- Replace with your demo video link -->
[![Demo Video](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](YOUR_DEMO_VIDEO_URL)

### 30-Second Reel
<!-- Replace with your reel link -->
[![30s Reel](https://img.shields.io/badge/Watch-30s%20Reel-purple?style=for-the-badge&logo=instagram)](YOUR_REEL_URL)

---

## Quick Start

```bash
# 1. Start the server
cd server && npm install && node server.js

# 2. Connect your phone
# Open web/index.html on phone, enter the server IP, tap Connect

# 3. Connect Arduino heartbeat sensor
# Upload pulse sensor sketch to Arduino
# Configure SingularityManager in Unity with Arduino IP/port
# Message format: "BPM: 72 | IBI: 832"

# 4. Run VR
# Open Unity project, press Play (or build to Quest)
# Swipe right on phone → objects appear in VR
# Heartbeat data drives shader effects in real-time
```

## How It Works

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Phone App     │         │  WebSocket      │         │   Unity VR      │
│                 │         │  Server         │         │                 │
│  Swipe cards    │────────▶│  (Node.js)      │────────▶│  Objects spawn  │
│  left/right     │  WiFi   │  Port 8080      │  WiFi   │  with effects   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Features

- Tinder-style card swiping on phone with 3D model previews
- Real-time object spawning in VR with particle effects
- **Live heartbeat integration** - Arduino pulse sensor controls shader effects in real-time
- Works on local WiFi (no internet required)
- iOS haptic feedback support
- Hand tracking and controller support
- XR interactable objects that trigger room animations when grabbed
- Custom shaders including heartbeat/pulse effects driven by biometric data

## Tech Stack

| Component | Technology |
|-----------|------------|
| VR Platform | Meta Quest (Unity 6, URP) |
| XR Framework | OpenXR + XR Interaction Toolkit + XR Hands |
| Communication | WebSocket (Node.js server) |
| Phone App | HTML/CSS/JS + Three.js + Capacitor (iOS) |
| Hardware | Arduino + Pulse Sensor (TCP/WiFi) |
| 3D Models | GLB format (converted from FBX) |

## Project Structure

```
dream_hackers/
├── Dream Hackers/          # Unity project
│   └── Assets/Scripts/
│       ├── Networking/     # WebSocket client
│       ├── Spawning/       # Object spawn controller
│       ├── MaterialFloatController.cs  # BPM → shader control
│       ├── PickupAnimatorTrigger.cs    # XR grab → animation
│       └── SingularityManager.cs       # Arduino WiFi connection
├── server/                 # Node.js WebSocket server
├── web/                    # Mobile phone interface
│   ├── ios/               # Capacitor iOS app
│   └── dist/              # Build output
└── docs/                   # Documentation
```

## Documentation

| Document | Description |
|----------|-------------|
| [Design Vision](docs/design-vision.md) | Project concept, design pillars, and artistic goals |
| [Getting Started](docs/getting-started.md) | Quick setup and connection guide |
| [Setup Guide](docs/setup-guide.md) | Detailed Unity configuration and Quest build |
| [Architecture](docs/architecture.md) | Technical reference and message protocols |
| [Unity Events API](docs/unity-events-api.md) | Event system for custom scripts |
| [Exporting 3D Models](docs/exporting-3d-models.md) | GLB export for phone app |

## Team

Built with care by **Dream Hackers** at MIT Reality Hack 2026

| Name | Role |
|------|------|
| **Samantha Herle** | Artist & Project Manager |
| **Sean Rove** | Tech Art |
| **Ardalan Askarian** | Software |
| **Ben Branch** | Hardware |

---

## License

MIT

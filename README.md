<div align="center">

<img src="banner.gif" width="100%" alt="Dreaming Machines">

**An immersive VR experience for Meta Quest where players step inside the internet's dream of humanity.**

<br>

<a href="https://www.youtube.com/watch?v=NY5WnzpsTtc"><img src="buttons/demo.svg" alt="Watch Demo"></a>
&nbsp;&nbsp;
<a href="https://youtu.be/Sq_jPCJJbIw"><img src="buttons/reel.svg" alt="30s Reel"></a>
&nbsp;&nbsp;
<a href="https://docs.google.com/presentation/d/1j2qTOKgDBow35dwZyvudL7hVXUyHlVYta0Yu95tXGPk/edit?usp=sharing"><img src="buttons/deck.svg" alt="Pitch Deck"></a>

<br><br>

![Unity](https://img.shields.io/badge/Unity_6-000000?style=flat-square&logo=unity&logoColor=white)
![Meta Quest](https://img.shields.io/badge/Meta_Quest-1C1E20?style=flat-square&logo=meta&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-00979D?style=flat-square&logo=arduino&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat-square&logo=capacitor&logoColor=white)

</div>

<img src="https://img.shields.io/badge/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━-7B6FD4?style=flat-square" width="100%">

> *What would the internet dream about?*
>
> *An interconnected web of billions of people? The past, or the future?*
>
> In his documentary *Lo and Behold: Reveries of the Connected World*, Werner Herzog poses the question: **"Does the internet dream of itself?"**
>
> Technology is in the realm of the human. It is created by us, populated by us, and is an extension of us.
>
> ### *If the internet could dream, it would dream about us.*

<img src="https://img.shields.io/badge/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━-5B8DEF?style=flat-square" width="100%">

## <img src="https://img.shields.io/badge/01-7B6FD4?style=flat-square" height="28"> &nbsp; The Interaction

In this experience, users scroll through a series of objects on their phone. By swiping, they **choose** or **discard** items—Tinder-style—feeding content into a shared dream space.

As they scroll, a pulse sensor on their wrist captures their **heartbeat BPM**, streaming their emotional state directly into the VR environment where it drives real-time shader effects.

<div align="center">
<table>
<tr>
<td align="center"><img src="screenshots/phone-ui.png" width="180" alt="Phone UI"><br><sub>Swipe Interface</sub></td>
<td align="center"><img src="screenshots/hardware.png" width="260" alt="Hardware"><br><sub>Pulse Sensor Setup</sub></td>
<td align="center"><img src="screenshots/swiping.png" width="260" alt="Swiping"><br><sub>Choose or Discard</sub></td>
</tr>
</table>
</div>

## <img src="https://img.shields.io/badge/02-9D6BB8?style=flat-square" height="28"> &nbsp; The Subconscious

The internet's subconscious rendered as a familiar interior—transformed by dream logic.

Everyday objects float weightlessly. Time slips through windows. Digital artifacts coexist with organic life. The space feels calm, yet undeniably alive.

<div align="center">
<img src="screenshots/vr-environment.gif" width="100%" alt="VR Environment">
</div>

## <img src="https://img.shields.io/badge/03-5B8DEF?style=flat-square" height="28"> &nbsp; How It Works

```
                              ┌─────────────────┐
                              │                 │
    ┌─────────────┐           │   WebSocket     │           ┌─────────────┐
    │             │  swipes   │    Server       │  spawns   │             │
    │    Phone    │ ────────► │   (Node.js)     │ ────────► │  Meta Quest │
    │   Web App   │   WiFi    │   Port 8080     │   WiFi    │   Unity VR  │
    │             │           │                 │           │             │
    └─────────────┘           └────────┬────────┘           └─────────────┘
                                       │
                                       │ heartbeat
                              ┌────────┴────────┐
                              │                 │
                              │    Arduino      │
                              │  Pulse Sensor   │
                              │   TCP/WiFi      │
                              │                 │
                              └─────────────────┘
```

## <img src="https://img.shields.io/badge/04-EC4899?style=flat-square" height="28"> &nbsp; Features

<table>
<tr>
<td width="50%" valign="top">

| Experience | |
|:---|:---|
| <img src="icons/swipe.svg" width="18"> &nbsp; **Tinder-style swiping** | 3D previews |
| <img src="icons/sparkle.svg" width="18"> &nbsp; **Real-time spawning** | Particle effects |
| <img src="icons/heart.svg" width="18"> &nbsp; **Live heartbeat shaders** | Biometric data |
| <img src="icons/hand.svg" width="18"> &nbsp; **XR interactable objects** | Room animations |
| <img src="icons/gamepad.svg" width="18"> &nbsp; **Controller support** | Intuitive interaction |

</td>
<td width="50%" valign="top">

| Technical | |
|:---|:---|
| <img src="icons/wifi.svg" width="18"> &nbsp; **Local WiFi only** | No internet required |
| <img src="icons/cpu.svg" width="18"> &nbsp; **Arduino pulse sensor** | Biometric capture |
| <img src="icons/smartphone.svg" width="18"> &nbsp; **iOS haptic feedback** | Vibration support |
| <img src="icons/palette.svg" width="18"> &nbsp; **Custom URP shaders** | Dream effects |
| <img src="icons/glasses.svg" width="18"> &nbsp; **OpenXR + XRI Toolkit** | VR framework |

</td>
</tr>
</table>

## <img src="https://img.shields.io/badge/05-8B5CF6?style=flat-square" height="28"> &nbsp; Tech Stack

| Technology | Purpose |
|:---|:---|
| ![Unity](https://img.shields.io/badge/Unity_6_+_URP-000000?style=flat-square&logo=unity&logoColor=white) | VR rendering & custom shaders |
| ![Meta](https://img.shields.io/badge/Meta_Quest_+_OpenXR-0467DF?style=flat-square&logo=meta&logoColor=white) | Standalone VR platform |
| ![Node](https://img.shields.io/badge/Node.js_WebSocket-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Real-time communication hub |
| ![Three](https://img.shields.io/badge/Three.js_+_Capacitor-000000?style=flat-square&logo=threedotjs&logoColor=white) | Phone app with 3D previews |
| ![Arduino](https://img.shields.io/badge/Arduino_+_Pulse_Sensor-00979D?style=flat-square&logo=arduino&logoColor=white) | Biometric data capture |
| ![Blender](https://img.shields.io/badge/GLB_3D_Models-E87D0D?style=flat-square&logo=blender&logoColor=white) | Optimized asset format |

## <img src="https://img.shields.io/badge/06-00979D?style=flat-square" height="28"> &nbsp; Quick Start

```bash
# ═══════════════════════════════════════════════════════════════
# 1. START THE SERVER
# ═══════════════════════════════════════════════════════════════
cd server && npm install && node server.js

# ═══════════════════════════════════════════════════════════════
# 2. CONNECT YOUR PHONE
# ═══════════════════════════════════════════════════════════════
# Open web/index.html on your phone
# Enter the server IP address
# Tap "Connect"

# ═══════════════════════════════════════════════════════════════
# 3. CONNECT HEARTBEAT SENSOR
# ═══════════════════════════════════════════════════════════════
# Upload pulse sensor sketch to Arduino
# Configure SingularityManager in Unity:
#   - Arduino IP address
#   - Port number
# Message format: "BPM: 72 | IBI: 832"

# ═══════════════════════════════════════════════════════════════
# 4. ENTER THE DREAM
# ═══════════════════════════════════════════════════════════════
# Open Unity project → Press Play (or build to Quest)
# Swipe right on phone → Objects materialize in VR
# Your heartbeat → Drives shader effects in real-time
```

<details>
<summary><b>Project Structure</b></summary>
<br>

```
dream_hackers/
│
├── Dream Hackers/                 # Unity VR Project
│   └── Assets/Scripts/
│       ├── Networking/            # WebSocket client
│       ├── Spawning/              # Object spawn controller
│       ├── MaterialFloatController.cs   # BPM → shader control
│       ├── PickupAnimatorTrigger.cs     # XR grab → animation
│       └── SingularityManager.cs        # Arduino WiFi connection
│
├── server/                        # Node.js WebSocket Server
│   └── server.js                  # Port 8080
│
├── web/                           # Phone Interface
│   ├── index.html                 # Swipe UI
│   ├── ios/                       # Capacitor iOS build
│   └── dist/                      # Production build
│
└── docs/                          # Documentation
    ├── design-vision.md           # Concept & artistic goals
    ├── getting-started.md         # Quick setup
    ├── setup-guide.md             # Detailed Unity config
    ├── architecture.md            # Technical reference
    ├── unity-events-api.md        # Event system docs
    └── exporting-3d-models.md     # GLB export guide
```

</details>

<details>
<summary><b>Documentation</b></summary>
<br>

| Document | Description |
|:---|:---|
| [Design Vision](docs/design-vision.md) | Project concept, design pillars, artistic goals |
| [Getting Started](docs/getting-started.md) | Quick setup and connection guide |
| [Setup Guide](docs/setup-guide.md) | Detailed Unity configuration & Quest build |
| [Architecture](docs/architecture.md) | Technical reference & message protocols |
| [Unity Events API](docs/unity-events-api.md) | Event system for custom scripts |
| [Exporting 3D Models](docs/exporting-3d-models.md) | GLB export workflow |

</details>

## <img src="https://img.shields.io/badge/07-FF6B6B?style=flat-square" height="28"> &nbsp; Team

<table>
<tr>
<td width="45%">
<img src="screenshots/team.png" width="100%" alt="Team Dream Hackers">
</td>
<td width="55%" valign="top">

### Dream Hackers

| Name | Role |
|:---|:---|
| **Samantha Herle** | Designer & PM |
| **Sean Rove** | Tech Art |
| **Ardalan Askarian** | Software |
| **Ben Branch** | Hardware |

*Built with love at* ![MIT Reality Hack](https://img.shields.io/badge/MIT_Reality_Hack-2026-7B6FD4?style=for-the-badge)

</td>
</tr>
</table>

<div align="center">

<img src="https://img.shields.io/badge/━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━-9D6BB8?style=flat-square" width="100%">

<br>

<img src="dove.gif" width="40" alt="">

<br>

![License](https://img.shields.io/badge/License-MIT-5B8DEF?style=flat-square)

<sub>If the internet could dream, it would dream about us.</sub>

</div>

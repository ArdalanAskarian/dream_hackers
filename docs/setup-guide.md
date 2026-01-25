# Setup Guide

Detailed configuration for Unity scene setup, Quest builds, and troubleshooting.

## Unity Scene Setup

### 1. Add NetworkManager

1. Hierarchy → Right-click → Create Empty → Name: "NetworkManager"
2. Add Component → Search "Network Manager" (DreamHackers.Networking)
3. Configure:
   - **Server IP**: Your computer's local IP (e.g., `192.168.1.100`)
   - **Server Port**: `8080`
   - **Auto Connect On Start**: ✓
   - **Show Debug Logs**: ✓

**Finding your IP:**
- macOS: System Preferences → Network → WiFi → Advanced → TCP/IP
- Windows: Command Prompt → `ipconfig` → IPv4 Address

### 2. Add ObjectSpawner

1. Create Empty → Name: "ObjectSpawner"
2. Add Component → "Object Spawner" (XR Interaction Toolkit)
3. Configure **Object Prefabs** (Size: 4):
   - Slot 0: `Assets/VRTemplateAssets/Prefabs/Interactables/Sphere Variant.prefab`
   - Slot 1: `Cube Variant.prefab`
   - Slot 2: `Torus Variant.prefab`
   - Slot 3: `Cylinder Variant.prefab`
4. Configure:
   - **Spawn Visualization Prefab**: `Assets/VRTemplateAssets/Prefabs/Blaster/Confetti.prefab`
   - **Camera To Face**: Drag "Main Camera" from XR Origin
   - **Only Spawn In View**: ✓
   - **Apply Random Angle At Spawn**: ✓
   - **Spawn Angle Range**: 45

### 3. Add SpawnController

1. Create Empty → Name: "SpawnController"
2. Add Component → "Spawn Controller" (DreamHackers.Spawning)
3. Configure **References**:
   - **Object Spawner**: Drag "ObjectSpawner" GameObject
   - **VR Camera**: Drag "Main Camera" (XR Origin/Camera Offset/Main Camera)
4. Configure **Spawn Settings**:
   - **Spawn Distance**: 2.5
   - **Spawn Height Offset**: 0
   - **Random XZ Offset**: 0.5
   - **Spawn Cooldown**: 1
5. Configure **Object Mappings** (Size: 4):
   - Element 0: `sphere` → Index 0
   - Element 1: `cube` → Index 1
   - Element 2: `torus` → Index 2
   - Element 3: `cylinder` → Index 3
6. **Show Debug Logs**: ✓

### 4. Save Scene

File → Save Scene (Cmd+S)

---

## Building for Meta Quest

### Build Settings

1. File → Build Settings
2. Switch Platform to **Android**
3. Add Open Scenes
4. Player Settings:
   - Company Name: Your name
   - Product Name: Dream Hackers
   - Package Name: `com.yourname.dreamhackers`

### XR Settings

1. Edit → Project Settings → XR Plug-in Management
2. Enable **OpenXR** for Android
3. XR Interaction Toolkit enabled

### Build and Install

1. Connect Quest via USB
2. Enable Developer Mode on Quest
3. File → Build And Run
4. Wait for build and install

---

## Testing Checklist

- [ ] Server starts without errors
- [ ] Server shows correct local IP
- [ ] Phone app loads in mobile browser
- [ ] Phone connects (green dot)
- [ ] Phone shows object cards
- [ ] Swipe gestures work
- [ ] Swipe left plays reject sound
- [ ] Swipe right plays accept sound
- [ ] Haptic feedback works (iOS)
- [ ] Unity connects to server
- [ ] Swipe right → object spawns
- [ ] Particle effect plays
- [ ] Object is grabbable
- [ ] Multiple swipes work (cooldown respected)
- [ ] Quest build installs
- [ ] Quest app connects on WiFi
- [ ] Phone → Quest spawning works

---

## Troubleshooting

### "Module not found" in Unity

The script uses `System.Net.WebSockets` which requires:
- Unity 2021.2 or newer
- .NET Standard 2.1 or .NET 4.x

Check: Edit → Project Settings → Player → Other Settings → API Compatibility Level

### Phone browser doesn't support WebSockets

Use modern browsers:
- iOS: Safari 14+
- Android: Chrome 90+

### Objects spawn inside floor/walls

Adjust in SpawnController:
- Increase spawn distance (3-4m)
- Adjust height offset (+0.5)

### Connection drops frequently

- Stay close to WiFi router
- Use 5GHz WiFi if available
- Disable phone power saving
- Keep computer awake

---

## Customizing the Spawn Effect

The spawn uses `Confetti.prefab`. To make it look like smoke:

1. Find: `Assets/VRTemplateAssets/Prefabs/Blaster/Confetti.prefab`
2. Open and select Particle System
3. Modify:
   - **Start Color**: Light gray gradient
   - **Start Size**: 0.5-1.0
   - **Start Lifetime**: 1-2 seconds
   - **Start Speed**: 1-2 (slower)
   - **Gravity Modifier**: -0.1 (upward drift)
   - **Color over Lifetime**: Alpha fade out

---

## Demo Flow

### Setup
1. Start server: `node server.js`
2. Note the IP address
3. Launch Unity/Quest
4. Open phone browser to `web/index.html`
5. Enter server IP and connect

### Running the Demo
1. Put on Quest headset
2. Hand phone to participant
3. Participant swipes through objects
4. Swipe right → object appears in VR
5. VR user can grab and interact
6. Multiple objects can exist simultaneously

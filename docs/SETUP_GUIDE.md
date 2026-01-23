# Dream Hackers - Phone-to-VR Setup Guide

Complete setup instructions for the phone-to-VR object spawning system.

---

## 🎯 What You've Built

A multi-platform experience where:
- Phone users swipe through objects (like Tinder)
- Swipe right → object appears in VR with smoke effect
- Local WebSocket server handles communication
- Works on same WiFi network

---

## 📦 What's Been Created

### ✅ Server (Node.js)
- `/server/package.json` - Dependencies
- `/server/server.js` - WebSocket server
- `/server/README.md` - Server documentation

### ✅ Phone App (Web)
- `/web/index.html` - Mobile interface
- `/web/style.css` - Responsive styling
- `/web/app.js` - Swipe logic + WebSocket client
- `/web/objects.json` - Object data

### ✅ Unity Scripts
- `/Dream Hackers/Assets/Scripts/Networking/NetworkManager.cs` - WebSocket client
- `/Dream Hackers/Assets/Scripts/Spawning/SpawnController.cs` - Spawn integration

### 📋 Still Need to Do in Unity Editor
- Configure DreamHackers.unity scene (see Phase 4 below)
- Add prefabs to ObjectSpawner
- Test in Editor and on Quest

---

## 🚀 Phase 4: Unity Scene Setup

### Step 1: Open Unity Project

1. Open Unity Hub
2. Open "Dream Hackers" project
3. Wait for packages to import
4. Open scene: `Assets/Scenes/DreamHackers.unity`

### Step 2: Add NetworkManager

1. **Create GameObject:**
   - Right-click in Hierarchy
   - Create Empty → Name it "NetworkManager"

2. **Add Script:**
   - Select NetworkManager GameObject
   - Click "Add Component"
   - Search for "Network Manager" (DreamHackers.Networking)
   - Click to add

3. **Configure Settings:**
   - Server IP: Your computer's local IP (e.g., `192.168.1.100`)
   - Server Port: `8080`
   - Auto Connect On Start: ✓ (checked)
   - Show Debug Logs: ✓ (checked)

**To find your local IP:**
- macOS: System Preferences → Network → WiFi → Advanced → TCP/IP
- Windows: Command Prompt → `ipconfig` → look for IPv4 Address

### Step 3: Create ObjectSpawner

1. **Create GameObject:**
   - Right-click in Hierarchy
   - Create Empty → Name it "ObjectSpawner"

2. **Add ObjectSpawner Script:**
   - Select ObjectSpawner GameObject
   - Add Component → Search "Object Spawner"
   - (This is from XR Interaction Toolkit samples)

3. **Configure ObjectSpawner:**
   - **Object Prefabs List:** Add these prefabs (click + to add slots):
     - Slot 0: `Assets/VRTemplateAssets/Prefabs/Interactables/Sphere Variant.prefab`
     - Slot 1: `Assets/VRTemplateAssets/Prefabs/Interactables/Cube Variant.prefab`
     - Slot 2: `Assets/VRTemplateAssets/Prefabs/Interactables/Torus Variant.prefab`
     - Slot 3: `Assets/VRTemplateAssets/Prefabs/Interactables/Cylinder Variant.prefab`

   - **Spawn Visualization Prefab:**
     - Assign: `Assets/VRTemplateAssets/Prefabs/Blaster/Confetti.prefab`
     - (This creates the "puff" effect)

   - **Camera To Face:**
     - Drag "Main Camera" from XR Origin into this field
     - (Path: XR Origin/Camera Offset/Main Camera)

   - **Only Spawn In View:** ✓ (checked)
   - **Apply Random Angle At Spawn:** ✓ (checked)
   - **Spawn Angle Range:** 45

### Step 4: Add SpawnController

1. **Create GameObject:**
   - Right-click in Hierarchy
   - Create Empty → Name it "SpawnController"

2. **Add Script:**
   - Select SpawnController GameObject
   - Add Component → Search "Spawn Controller" (DreamHackers.Spawning)

3. **Configure References:**
   - **Object Spawner:** Drag "ObjectSpawner" GameObject here
   - **VR Camera:** Drag "Main Camera" from XR Origin
     - (Path: XR Origin/Camera Offset/Main Camera)

4. **Configure Spawn Settings:**
   - **Spawn Distance:** 2.5 (meters in front of user)
   - **Spawn Height Offset:** 0 (eye level)
   - **Random XZ Offset:** 0.5 (adds variety)
   - **Spawn Cooldown:** 1 (seconds between spawns)

5. **Configure Object Mappings:**
   - Expand "Object Mappings" section
   - Set Size to 4
   - Configure each mapping:
     - **Element 0:**
       - Object Id: `sphere`
       - Prefab Index: 0
     - **Element 1:**
       - Object Id: `cube`
       - Prefab Index: 1
     - **Element 2:**
       - Object Id: `torus`
       - Prefab Index: 2
     - **Element 3:**
       - Object Id: `cylinder`
       - Prefab Index: 3

6. **Debug Settings:**
   - Show Debug Logs: ✓ (checked)

### Step 5: Save Scene

- File → Save Scene
- Or press Cmd+S / Ctrl+S

---

## 🧪 Testing in Unity Editor

### 1. Start the Server

Open Terminal/Command Prompt:

```bash
cd /path/to/dream_hackers/server
npm install  # First time only
node server.js
```

**Note the IP address shown!** Example: `ws://192.168.1.100:8080`

### 2. Test Phone App (Desktop Browser)

1. Open `/path/to/dream_hackers/web/index.html` in browser
2. Enter server address: `192.168.1.100:8080`
3. Click "Connect"
4. Should see: "Connected" with green dot
5. Should see first object card

### 3. Run Unity Editor

1. In Unity, press Play button
2. Check Console for:
   - `[NetworkManager] Connected successfully!`
   - `[SpawnController] SpawnController initialized successfully`
   - `[SpawnController] Network connected - ready to spawn objects`

### 4. Test Swipe → Spawn

1. In phone browser, swipe right on an object
2. Unity Console should show:
   - `[NetworkManager] Received: {"type":"swipe_right","objectId":"sphere",...}`
   - `[SpawnController] Received swipe for object: sphere`
   - `[SpawnController] Successfully spawned object 'sphere' at (x, y, z)`

3. Check Scene view in Unity - object should appear in front of camera!

### 5. Troubleshooting

**If phone can't connect:**
- Verify server is running and shows IP
- Check firewall settings (allow port 8080)
- Make sure devices on same WiFi

**If Unity doesn't receive messages:**
- Check NetworkManager serverIP matches server IP exactly
- Look for errors in Unity Console
- Check Server terminal for connection messages

**If objects don't spawn:**
- Verify ObjectSpawner has prefabs assigned
- Check SpawnController has ObjectSpawner reference
- Look for "Successfully spawned" message in Console

---

## 📱 Building for Meta Quest

### 1. Build Settings

1. File → Build Settings
2. Switch Platform to Android
3. Add Open Scenes (DreamHackers.unity)
4. Player Settings:
   - Company Name: Your name
   - Product Name: Dream Hackers
   - Package Name: com.yourname.dreamhackers

### 2. XR Settings

1. Edit → Project Settings → XR Plug-in Management
2. Enable OpenXR for Android
3. XR Interaction Toolkit should be enabled

### 3. Build and Install

1. Connect Quest via USB
2. Enable Developer Mode on Quest
3. File → Build And Run
4. Select APK location
5. Wait for build and install

### 4. Test on Quest

1. Launch app on Quest
2. Open phone browser
3. Enter server IP (same WiFi!)
4. Swipe objects → they appear in VR!

---

## 🎨 Customizing the Smoke Effect

The "puff of smoke" currently uses Confetti.prefab. To make it look more like smoke:

### Option 1: Modify in Inspector

1. Find: `Assets/VRTemplateAssets/Prefabs/Blaster/Confetti.prefab`
2. Double-click to open
3. Select the Particle System
4. Modify settings:
   - **Start Color:** White → Light gray gradient
   - **Start Size:** 0.5 - 1.0
   - **Start Lifetime:** 1-2 seconds
   - **Start Speed:** 1-2 (slower)
   - **Gravity Modifier:** -0.1 (slight upward drift)
   - **Color over Lifetime:** Alpha fade out
   - **Renderer → Material:** Change to smoke texture

### Option 2: Create New Smoke Prefab

1. GameObject → Effects → Particle System
2. Configure for smoke appearance
3. Add "Destroy Self" component (from VR Template)
4. Save as prefab
5. Assign to ObjectSpawner's "Spawn Visualization Prefab"

---

## 📊 Verification Checklist

Before demo/presentation:

- [ ] Server starts without errors
- [ ] Server shows correct local IP
- [ ] Phone app loads in mobile browser
- [ ] Phone connects to server (green dot)
- [ ] Phone shows object cards
- [ ] Swipe gestures work (left/right)
- [ ] Unity Editor connects to server
- [ ] Console shows "Connected successfully"
- [ ] Swipe right → object spawns in Unity
- [ ] Particle effect plays at spawn
- [ ] Object is grabbable with VR controllers
- [ ] Multiple swipes work (cooldown respected)
- [ ] Quest build installs successfully
- [ ] Quest app connects on WiFi
- [ ] Phone → Quest spawning works
- [ ] Frame rate is smooth (72+ FPS)

---

## 🐛 Common Issues

### "Module not found" error in Unity

**Solution:** The C# script uses `System.Net.WebSockets` which requires:
- Unity 2021.2 or newer
- .NET Standard 2.1 or .NET 4.x
- Check: Edit → Project Settings → Player → Other Settings → API Compatibility Level

### Phone browser doesn't support WebSockets

**Solution:** Use modern browsers:
- iOS: Safari 14+
- Android: Chrome 90+
- Avoid: Internet Explorer, old browsers

### Objects spawn inside floor/walls

**Solution:** Adjust spawn settings in SpawnController:
- Increase spawn distance (3-4 meters)
- Adjust height offset (+0.5 to spawn higher)
- Check viewport settings in ObjectSpawner

### Connection drops frequently

**Solution:**
- Keep devices close to WiFi router
- Use 5GHz WiFi if available
- Disable WiFi power saving on phone
- Keep server computer awake

---

## 🎮 Usage Instructions (For Demo)

### Setup:
1. Start server on laptop: `node server.js`
2. Note the IP address shown
3. Launch Unity on Quest (or Editor)
4. Open phone browser to `web/index.html`
5. Enter server IP and connect

### Demo Flow:
1. Put on Quest headset
2. Hand phone to participant
3. Participant swipes through objects
4. Swipe right → object appears in VR with puff effect
5. VR user can grab and interact with spawned objects
6. Multiple objects can exist simultaneously
7. Participant continues swiping through full list

### Best Practices:
- Explain swipe gestures before starting
- Show first swipe yourself as demonstration
- Have VR user look forward (objects spawn ahead)
- Keep swipes controlled (1 second cooldown)
- Monitor server terminal for errors

---

## 🔮 Future Enhancements

Ideas for post-hackathon:
- Multiple phone users (everyone can swipe)
- Object customization (phone picks colors/sizes)
- AI-generated object variations
- Persistent objects across sessions
- VR user can send objects back to phone
- Sound effects for spawns
- Haptic feedback on phone
- Cloud server for remote connections

---

## 📚 Additional Resources

### Unity Documentation:
- XR Interaction Toolkit: https://docs.unity3d.com/Packages/com.unity.xr.interaction.toolkit@latest
- ObjectSpawner API: Check XML comments in script

### WebSocket Resources:
- ws library: https://github.com/websockets/ws
- WebSocket API (browser): https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### Project Files:
- Explore agent report: Check exploration results from Phase 1
- Plan file: `/Users/ardalanaskarian/.claude/plans/glittery-chasing-owl.md`

---

**You're ready to start testing! Good luck with your hackathon! 🚀**

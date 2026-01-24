# Getting Started

Get the phone-to-VR system running in under 5 minutes.

## Prerequisites

- Node.js installed on your computer
- Unity 6 or newer
- Phone and computer on the same WiFi network
- Xcode (for iOS app builds)

## Step 1: Start the Server

```bash
cd server
npm install    # First time only
node server.js
```

You'll see output like:
```
═══════════════════════════════════════════════════════
  Dream Hackers WebSocket Server
═══════════════════════════════════════════════════════

Server running on port 8080
Connect your devices to: ws://192.168.1.100:8080
```

**Save the IP address** — you'll need it for the phone and Unity.

---

## Step 2: Connect Your Phone

### Option 1: Via Local File (Easiest for Testing)

1. Transfer the `web` folder to your phone:
   - **AirDrop (iPhone)**: Select the entire `web` folder and AirDrop to your iPhone
   - **Email**: Zip the `web` folder and email it to yourself, download on phone
   - **Google Drive/Dropbox**: Upload `web` folder, download on phone

2. Open on phone:
   - **iPhone**: Open Files app → find `index.html` → tap to open in Safari
   - **Android**: Open Files app → find `index.html` → tap to open in Chrome

3. Enter server address:
   - Type: `YOUR_SERVER_IP:8080` (use the IP shown in server terminal)
   - Tap "Connect"

### Option 2: Via Simple Web Server (Recommended)

This serves the files over the network so your phone can access them via a URL.

In Terminal, in the `web` folder:

```bash
# Python 3 (most Macs have this)
cd web
python3 -m http.server 8000
```

You'll see:
```
Serving HTTP on 0.0.0.0 port 8000 ...
```

Then on your phone:
1. Make sure phone is on **same WiFi** as your computer
2. Open Safari/Chrome
3. Go to: `http://YOUR_COMPUTER_IP:8000` (use your computer's IP)
4. You'll see the Dream Hackers connection screen
5. Enter: `YOUR_COMPUTER_IP:8080` (same IP with WebSocket port)
6. Tap "Connect"

### Option 3: iOS App (Best Experience)

Build and install the native iOS app:

```bash
cd web
npm install
npx cap sync ios
```

Then open `web/ios/App/App.xcworkspace` in Xcode and build to your iPhone.

### Option 4: Via ngrok (If Different WiFi Networks)

If your phone and computer can't be on the same WiFi:

```bash
# Install ngrok (one time)
brew install ngrok

# In the web folder
cd /Users/ardalanaskarian/Desktop/dream_hackers/web
python3 -m http.server 8000

# In another terminal
ngrok http 8000
```

Use the public URL ngrok gives you on your phone.

---

## Step 3: Run Unity

1. Open Unity project: `Dream Hackers/`
2. Open scene: `Assets/Scenes/DreamHackers.unity`
3. Check NetworkManager has the correct server IP
4. Press **Play**

---

## Verify It Works

| Check | Expected |
|-------|----------|
| Server terminal | Shows "Phone client identified" and "VR client identified" |
| Phone screen | Green dot, "Connected" status |
| Unity Console | "[NetworkManager] Connected successfully!" |
| Swipe right on phone | Object appears in Unity Scene view |

---

## Troubleshooting

**Phone can't connect?**
- Verify server is running
- Check both devices on same WiFi
- Try disabling firewall temporarily

**Unity not receiving messages?**
- Check NetworkManager serverIP matches exactly
- Look for errors in Console

**Objects don't appear?**
- Verify ObjectSpawner has prefabs assigned
- Check SpawnController references are set

See [Setup Guide](setup-guide.md) for detailed configuration.

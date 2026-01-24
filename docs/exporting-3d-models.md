# Exporting 3D Models

How to export Unity objects as GLB files for the phone app.

## Quick Start

The phone app shows 3D primitives (sphere, cube, cylinder, cone, torus) automatically. If you want **custom Unity models** instead, follow the steps below.

---

## Option 1: Use Built-in Primitives

The phone app automatically creates basic shapes that match your Unity objects. **No export needed** if you're happy with primitives.

---

## Option 2: Export Custom Models

### Step 1: Install GLTFUtility

1. Window → Package Manager
2. Click **+** → Add package from git URL
3. Enter: `https://github.com/Siccity/GLTFUtility.git`
4. Click Add

### Step 2: Export Each Object

1. Select object in Hierarchy
2. Right-click → Export to GLB
3. Save as:
   - `cylinder.glb`
   - `sphere.glb`
   - `cone.glb`
   - `torus.glb`
   - `cube.glb`

### Step 3: Copy to Web Folder

Save your GLB files to the models folder:
```
web/models/
├── cylinder.glb
├── sphere.glb
├── cone.glb
├── torus.glb
└── cube.glb
```

### Step 4: Copy to dist and Sync to iOS

Run these commands from the `web/` folder:

```bash
# Copy models to distribution folder
cp models/*.glb dist/models/

# Sync to iOS
npx cap sync ios
```

Then rebuild in Xcode (`web/ios/App/App.xcworkspace`).

---

## File Locations Summary

| What | Path |
|------|------|
| Unity FBX models | `Dream Hackers/Assets/Models/` |
| GLB files go here | `web/models/` |
| Also copy to | `web/dist/models/` |
| iOS Xcode project | `web/ios/App/App.xcworkspace` |
| Object config | `web/objects.json` |

---

## Alternative: Online FBX to GLB Converter (Recommended)

If GLTFUtility doesn't work (it's often import-only), use an online converter:

### Step 1: Locate your FBX files

Your Unity models are already in FBX format at:
```
Dream Hackers/Assets/Models/
```

### Step 2: Convert using ImageToStl

1. Go to: **https://imagetostl.com/convert/file/fbx/to/glb**
2. Upload each FBX file
3. Download the converted GLB

### Step 3: Rename files to match object IDs

| FBX File | Rename to |
|----------|-----------|
| `Television_01_4k.fbx` | `cylinder.glb` |
| `boombox_4k.fbx` | `sphere.glb` |
| `Cat.fbx` | `cone.glb` |
| `speakerMan.fbx` | `torus.glb` |
| `phone.fbx` | `cube.glb` |

### Step 4: Save to the models folder

Move the renamed GLB files to:
```
web/models/
```

### Other converter options

If ImageToStl doesn't work, try:
- https://anyconv.com/fbx-to-glb-converter/
- https://www.3dpea.com/en/convert/FBX-to-GLB
- https://fabconvert.com/convert/fbx/to/glb

---

## Alternative: Use Blender

If you prefer more control over the conversion:

1. Export from Unity as FBX (File → Export → FBX)
2. Open in Blender
3. Export as GLB (File → Export → glTF 2.0)
   - Format: GLB (binary)
   - Include: Selected Objects
4. Save to `web/models/`

---

## Model Requirements

| Requirement | Recommended |
|-------------|-------------|
| File size | < 500KB per model |
| Polygons | < 10,000 per model |
| Textures | 512x512 or smaller |
| Format | GLB (binary glTF) |

---

## Customizing Colors

Each object has a fallback color in `objects.json`:

```json
{
  "id": "sphere",
  "name": "Memory Orb",
  "color": "#EC4899"
}
```

If the GLB fails to load, the app shows a primitive in this color.

---

## Testing

```bash
cd web
python3 -m http.server 8000
```

Open `http://localhost:8000` — you should see 3D models rotating on each card.

---

## Troubleshooting

**Models not loading?**
- Check browser console for errors
- Verify files exist in `web/models/`
- Ensure files copied to `web/dist/models/`

**Models look wrong?**
- Center at origin before export
- Apply all transforms in Blender
- Check scale (auto-scaled to fit)

**Performance issues?**
- Reduce polygon count
- Use smaller textures
- Limit to 1 material per model

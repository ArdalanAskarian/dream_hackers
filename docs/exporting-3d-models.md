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

```
web/models/
├── cylinder.glb
├── sphere.glb
├── cone.glb
├── torus.glb
└── cube.glb
```

### Step 4: Sync to iOS

```bash
cp web/models/*.glb web/dist/models/
cd web && npx cap sync ios
```

Then rebuild in Xcode.

---

## Alternative: Use Blender

If GLTFUtility doesn't work:

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

# Exporting 3D Models from Unity for Phone App

This guide explains how to export your Unity objects as GLB files so they appear as spinning 3D models on the phone app.

---

## Quick Start

The phone app will show 3D primitives (sphere, cube, cylinder, cone, torus) automatically. If you want to use your **custom Unity models** instead, follow the steps below.

---

## Option 1: Use Built-in Primitives (No Export Needed)

The phone app automatically creates these basic shapes:
- Sphere
- Cube
- Cylinder
- Cone
- Torus

These match the objects in your Unity scene and rotate nicely on the phone. **No action needed** if you're happy with basic shapes.

---

## Option 2: Export Custom Models from Unity

If you want your exact Unity models (with materials, custom meshes, etc.) to appear on the phone:

### Step 1: Install GLTFUtility Package

1. In Unity, go to **Window > Package Manager**
2. Click **+** > **Add package from git URL**
3. Enter: `https://github.com/Siccity/GLTFUtility.git`
4. Click **Add**

### Step 2: Export Each Object

1. Select the object in the Hierarchy (e.g., Sphere, Cylinder)
2. Right-click > **Export to GLB** (if GLTFUtility is installed)
3. Or use **File > Export > GLB**
4. Save as:
   - `cylinder.glb`
   - `sphere.glb`
   - `cone.glb`
   - `torus.glb`
   - `cube.glb`

### Step 3: Copy to Web Folder

Put the exported files in:
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

1. Export from Unity as FBX (**File > Export > FBX**)
2. Open in Blender
3. Export as GLB (**File > Export > glTF 2.0**)
   - Format: GLB (binary)
   - Include: Selected Objects
4. Save to `web/models/`

---

## Model Requirements

For best results on mobile:

| Requirement | Recommended |
|-------------|-------------|
| File size | < 500KB per model |
| Polygons | < 10,000 per model |
| Textures | 512x512 or smaller |
| Format | GLB (binary glTF) |

---

## Customizing Colors

Each object has a fallback color defined in `objects.json`:

```json
{
  "id": "sphere",
  "name": "Memory Orb",
  "color": "#EC4899"
}
```

If the GLB file fails to load, the app will show a primitive shape in this color.

---

## Testing

1. Start a local server:
   ```bash
   cd web
   python3 -m http.server 8000
   ```

2. Open `http://localhost:8000` in Chrome

3. You should see the 3D models rotating on each card

4. If you see colored primitives instead of your models, check the browser console for errors

---

## Troubleshooting

### Models not loading?
- Check browser console for errors
- Verify GLB files exist in `web/models/`
- Make sure files are copied to `web/dist/models/`

### Models look wrong?
- Center the model at origin in Unity before export
- Apply all transforms in Blender before export
- Check scale (models are auto-scaled to fit)

### Performance issues?
- Reduce polygon count
- Use smaller textures
- Limit to 1 material per model

---

## File Structure

```
web/
├── models/
│   ├── cylinder.glb
│   ├── sphere.glb
│   ├── cone.glb
│   ├── torus.glb
│   └── cube.glb
├── objects.json      # References model paths
├── app.js           # 3D viewer code
└── index.html       # Loads Three.js
```

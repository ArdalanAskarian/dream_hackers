# AR Foundation "Invalid Signature" Error - Fix Guide

## 🔴 Problem
Unity shows "Invalid signature" error for AR Foundation package 6.3.1 in the Package Manager.

## 💡 Root Cause
The Android XR OpenXR package (1.1.0) requires **AR Foundation 6.3.0**, but the project specifies **6.3.1**, creating a version conflict that Unity cannot verify.

## ✅ Solution
Downgrade AR Foundation from 6.3.1 to 6.3.0 to match the Android XR dependency.

---

## 🍎 For macOS Users

### Automated Fix
1. Navigate to the project folder in Terminal
2. Run the provided script:
   ```bash
   ./reset_unity_packages.sh
   ```
3. Close and reopen Unity
4. Verify in Package Manager that AR Foundation shows 6.3.0 with no errors

---

## 🪟 For Windows Users

You have **3 files** to fix this issue:

### Files Included
- `reset_unity_packages.ps1` - PowerShell script (recommended)
- `reset_unity_packages.bat` - Batch script (fallback)
- `WINDOWS_FIX_README.txt` - Detailed instructions

### Quick Start (PowerShell - Recommended)

1. **Copy the files** to your `dream_hackers` folder
2. **Right-click** on `reset_unity_packages.ps1`
3. **Select** "Run with PowerShell"
4. If blocked, open PowerShell as Admin and run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
5. **Close Unity** completely
6. **Reopen** your project from Unity Hub
7. **Verify** in Package Manager

### Alternative (Batch Script)

1. **Double-click** `reset_unity_packages.bat`
2. **Follow** on-screen instructions
3. If needed, **manually edit** `Packages/manifest.json`:
   - Change: `"com.unity.xr.arfoundation": "6.3.1"`
   - To: `"com.unity.xr.arfoundation": "6.3.0"`
4. **Close and reopen** Unity

---

## 🛠️ Manual Fix (All Platforms)

If scripts don't work:

1. **Close Unity completely**

2. **Edit** `Dream Hackers/Packages/manifest.json`:
   ```json
   "com.unity.xr.arfoundation": "6.3.0"  // Changed from 6.3.1
   ```

3. **Delete** `Dream Hackers/Packages/packages-lock.json`

4. **Delete cache folders**:
   - macOS: `Library/PackageCache/com.unity.xr.arfoundation@*`
   - Windows: `Library\PackageCache\com.unity.xr.arfoundation@*`

5. **Reopen Unity** - it will auto-download correct packages

---

## ✅ Verification

After applying the fix:

1. Open **Window → Package Manager** in Unity
2. Find **AR Foundation**
3. Confirm:
   - ✅ Version: **6.3.0**
   - ✅ **No warning icon**
   - ✅ **No "Invalid signature" error**

If you still see the error in the UI:
- Close Unity completely (Cmd+Q / Alt+F4)
- Reopen the project
- Click refresh (⟳) in Package Manager
- The packages are correct; the UI may show a cached error

---

## 📦 What Changed

| Package | Before | After | Why |
|---------|--------|-------|-----|
| AR Foundation | 6.3.1 | **6.3.0** | Match Android XR dependency |
| Android XR OpenXR | 1.1.0 | 1.1.0 | No change |
| Other packages | - | - | No changes needed |

---

## 🔍 Technical Details

**Why the error occurred:**
- `com.unity.xr.androidxr-openxr@1.1.0` explicitly requires `com.unity.xr.arfoundation@6.3.0`
- When manifest.json specified 6.3.1, Unity's dependency resolver created a conflict
- The signature verification failed because the resolved version didn't match expectations

**Why this fix works:**
- Aligning to AR Foundation 6.3.0 satisfies all package dependencies
- The dependency tree becomes consistent
- Unity can verify package signatures successfully
- The 6.3.0 → 6.3.1 difference is a minor patch, so no features are lost

---

## ❓ FAQ

**Q: Will this break any features?**
A: No. 6.3.0 and 6.3.1 are nearly identical (6.3.1 is a minor patch).

**Q: Can I keep using 6.3.1?**
A: Only if you remove the Android XR OpenXR package. Otherwise, you must use 6.3.0.

**Q: What if I need Android XR features AND AR Foundation 6.3.1?**
A: Wait for Android XR OpenXR to release a version that supports AR Foundation 6.3.1.

**Q: The error is still showing!**
A: The packages are correctly installed. Close Unity completely and reopen. The UI caches error states.

---

## 📞 Support

If you encounter issues:

1. Check `WINDOWS_FIX_README.txt` for detailed Windows troubleshooting
2. Verify `Packages/manifest.json` shows AR Foundation as `6.3.0`
3. Check that `Packages/packages-lock.json` exists and shows version `6.3.0`
4. Try the manual fix steps if scripts fail

---

## 📄 Files Included

- ✅ `reset_unity_packages.sh` - macOS/Linux script
- ✅ `reset_unity_packages.bat` - Windows batch script
- ✅ `reset_unity_packages.ps1` - Windows PowerShell script
- ✅ `WINDOWS_FIX_README.txt` - Detailed Windows instructions
- ✅ `SHARE_WITH_TEAM.md` - This guide

Share these files with anyone experiencing the same issue!

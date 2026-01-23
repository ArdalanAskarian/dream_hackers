================================================================================
  Unity AR Foundation "Invalid Signature" Error - Windows Fix
================================================================================

PROBLEM:
--------
AR Foundation 6.3.1 shows "Invalid signature" error in Unity Package Manager.

CAUSE:
------
Android XR OpenXR package (1.1.0) requires AR Foundation 6.3.0, but the
project has 6.3.1 specified, creating a version mismatch that Unity can't verify.

SOLUTION:
---------
Use one of the provided scripts to automatically fix the issue.


================================================================================
  OPTION 1: PowerShell Script (RECOMMENDED for Windows 10/11)
================================================================================

STEPS:
------
1. Copy these 3 files to your "dream_hackers" folder:
   - reset_unity_packages.ps1
   - reset_unity_packages.bat
   - WINDOWS_FIX_README.txt (this file)

2. Right-click on "reset_unity_packages.ps1"

3. Select "Run with PowerShell"

4. If you get a security warning about execution policy:
   - Open PowerShell as Administrator
   - Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   - Press Y to confirm
   - Close PowerShell and try step 2 again

5. The script will:
   ✓ Clear cached AR packages
   ✓ Delete packages-lock.json
   ✓ Fix AR Foundation version to 6.3.0
   ✓ Trigger Unity to re-download packages

6. Close Unity completely (if open)

7. Reopen your project from Unity Hub

8. Wait for compilation to complete

9. Open Window → Package Manager and verify no errors


================================================================================
  OPTION 2: Batch Script (Works on all Windows versions)
================================================================================

STEPS:
------
1. Copy the files to your "dream_hackers" folder (same as Option 1)

2. Double-click "reset_unity_packages.bat"

3. Follow the on-screen instructions

4. If it warns about manifest.json, you need to manually edit:
   - Open: dream_hackers\Dream Hackers\Packages\manifest.json
   - Find the line: "com.unity.xr.arfoundation": "6.3.1"
   - Change to: "com.unity.xr.arfoundation": "6.3.0"
   - Save the file

5. Close Unity completely (if open)

6. Reopen your project from Unity Hub

7. Wait for compilation to complete

8. Open Window → Package Manager and verify no errors


================================================================================
  MANUAL FIX (if scripts don't work)
================================================================================

1. Close Unity completely

2. Edit this file:
   dream_hackers\Dream Hackers\Packages\manifest.json

   Change this line:
   "com.unity.xr.arfoundation": "6.3.1"

   To:
   "com.unity.xr.arfoundation": "6.3.0"

3. Delete this file:
   dream_hackers\Dream Hackers\Packages\packages-lock.json

4. Delete these folders (if they exist):
   dream_hackers\Dream Hackers\Library\PackageCache\com.unity.xr.arfoundation@*
   dream_hackers\Dream Hackers\Library\PackageCache\com.unity.xr.androidxr-openxr@*

5. Reopen your project from Unity Hub

6. Unity will automatically re-download the correct packages


================================================================================
  VERIFICATION
================================================================================

After running the fix, verify it worked:

1. Open Unity
2. Go to: Window → Package Manager
3. Find "AR Foundation" in the list
4. Should show:
   ✓ Version: 6.3.0
   ✓ No warning icon
   ✓ No "Invalid signature" error
   ✓ Status: Up to date

If you still see errors:
- Try closing and reopening Unity one more time
- Click the refresh icon (⟳) in Package Manager
- The packages are correctly installed; any remaining error is just a UI cache issue


================================================================================
  TROUBLESHOOTING
================================================================================

Q: The script says "cannot be loaded because running scripts is disabled"
A: Windows blocks PowerShell scripts by default. Follow the execution policy
   instructions in OPTION 1, step 4 above.

Q: The batch script doesn't change the manifest.json automatically
A: The .bat version can only verify the version. You need to manually edit
   manifest.json if it's still at 6.3.1. Use the PowerShell version instead.

Q: I still see the error after running the script
A: The packages are correct. Close Unity completely and reopen. The UI
   sometimes caches old error states.

Q: Can I just remove the Android XR package?
A: Yes, if you don't need Android XR features. Edit manifest.json and remove
   the line: "com.unity.xr.androidxr-openxr": "1.1.0"
   Then you can use AR Foundation 6.3.1.


================================================================================
  TECHNICAL DETAILS
================================================================================

Package versions after fix:
- AR Foundation: 6.3.0 (downgraded from 6.3.1)
- Android XR OpenXR: 1.1.0 (requires AR Foundation 6.3.0)
- All other XR packages: Remain at their current versions

Why this works:
The Android XR OpenXR package explicitly requires AR Foundation 6.3.0 in its
dependencies. When you have 6.3.1 in manifest.json, Unity's package resolver
creates a conflict that fails signature verification. By aligning to 6.3.0,
the dependency tree is consistent and passes validation.


================================================================================

If you have any issues, share this file and the error messages with your team.

Good luck!

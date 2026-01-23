@echo off
REM Script to fully reset Unity Package Manager and clear all package errors
REM This will force Unity to re-download and re-validate all packages

echo.
echo ============================================
echo   Unity Package Manager Reset Tool
echo ============================================
echo.

REM Get the script directory and assume project is in parent folder
set SCRIPT_DIR=%~dp0
set PROJECT_PATH=%SCRIPT_DIR%Dream Hackers

REM Check if project exists
if not exist "%PROJECT_PATH%\Packages\manifest.json" (
    echo ERROR: Could not find Unity project at: %PROJECT_PATH%
    echo.
    echo Please run this script from the project root folder, or
    echo edit the script to set the correct PROJECT_PATH
    echo.
    pause
    exit /b 1
)

echo Project found: %PROJECT_PATH%
echo.
echo 🔧 Resetting Unity Package Manager...
echo.

REM Step 1: Remove all cached packages for AR-related packages
echo 1️⃣  Clearing AR Foundation and Android XR package caches...
if exist "%PROJECT_PATH%\Library\PackageCache\com.unity.xr.arfoundation@*" (
    for /d %%D in ("%PROJECT_PATH%\Library\PackageCache\com.unity.xr.arfoundation@*") do rd /s /q "%%D" 2>nul
)
if exist "%PROJECT_PATH%\Library\PackageCache\com.unity.xr.androidxr-openxr@*" (
    for /d %%D in ("%PROJECT_PATH%\Library\PackageCache\com.unity.xr.androidxr-openxr@*") do rd /s /q "%%D" 2>nul
)
if exist "%PROJECT_PATH%\Library\PackageCache\com.unity.xr.hands@*" (
    for /d %%D in ("%PROJECT_PATH%\Library\PackageCache\com.unity.xr.hands@*") do rd /s /q "%%D" 2>nul
)
if exist "%PROJECT_PATH%\Library\PackageCache\com.unity.xr.openxr@*" (
    for /d %%D in ("%PROJECT_PATH%\Library\PackageCache\com.unity.xr.openxr@*") do rd /s /q "%%D" 2>nul
)
echo    ✓ Package caches cleared
echo.

REM Step 2: Remove packages-lock.json
echo 2️⃣  Removing packages-lock.json...
if exist "%PROJECT_PATH%\Packages\packages-lock.json" (
    del /f /q "%PROJECT_PATH%\Packages\packages-lock.json" 2>nul
    echo    ✓ Lock file removed
) else (
    echo    ℹ Lock file not found (may already be deleted)
)
echo.

REM Step 3: Clear Unity's global package cache (if exists)
echo 3️⃣  Clearing Unity's global package cache...
set UNITY_CACHE=%LOCALAPPDATA%\Unity\cache\packages\packages.unity.com
if exist "%UNITY_CACHE%\com.unity.xr.arfoundation@*" (
    for /d %%D in ("%UNITY_CACHE%\com.unity.xr.arfoundation@*") do rd /s /q "%%D" 2>nul
    echo    ✓ Global cache cleared
) else (
    echo    ℹ No global cache found
)
echo.

REM Step 4: Update manifest.json to ensure correct AR Foundation version
echo 4️⃣  Verifying manifest.json has correct AR Foundation version...
findstr /C:"\"com.unity.xr.arfoundation\": \"6.3.0\"" "%PROJECT_PATH%\Packages\manifest.json" >nul
if %errorlevel% equ 0 (
    echo    ✓ AR Foundation is already set to 6.3.0
) else (
    echo    ⚠ WARNING: manifest.json may not have AR Foundation 6.3.0
    echo    Please manually edit Packages\manifest.json and change:
    echo    "com.unity.xr.arfoundation": "6.3.1"  to  "6.3.0"
)
echo.

REM Step 5: Touch manifest to trigger Unity's package resolver
echo 5️⃣  Triggering Unity package resolution...
copy /b "%PROJECT_PATH%\Packages\manifest.json"+,, "%PROJECT_PATH%\Packages\manifest.json" >nul 2>&1
echo    ✓ Manifest timestamp updated
echo.

echo ============================================
echo   ✅ Package cache cleared successfully!
echo ============================================
echo.
echo 📋 Next steps:
echo    1. Close Unity completely if it's open
echo    2. Reopen your project from Unity Hub
echo    3. Unity will automatically re-download packages
echo    4. Wait for Unity to finish compiling
echo    5. Open Window → Package Manager
echo    6. Click the refresh icon (⟳) in Package Manager
echo    7. Verify AR Foundation 6.3.0 shows no errors
echo.
echo 💡 If errors persist:
echo    - The invalid signature error is caused by version mismatch
echo    - Ensure manifest.json has: "com.unity.xr.arfoundation": "6.3.0"
echo    - Android XR OpenXR 1.1.0 requires AR Foundation 6.3.0 (not 6.3.1)
echo.
pause

@echo off
REM Setup Git Hooks for Unity Package Version Control (Windows)
REM Run this script once after cloning the repository

echo.
echo ================================================================
echo   Unity Package Version Control - Git Hooks Setup (Windows)
echo ================================================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
set HOOKS_DIR=%SCRIPT_DIR%.git\hooks

REM Check if we're in a git repository
if not exist "%SCRIPT_DIR%.git" (
    echo ERROR: Not a git repository!
    echo Please run this script from the root of the dream_hackers repository
    pause
    exit /b 1
)

echo Installing Git hooks to prevent package conflicts...
echo.

REM Create hooks directory if it doesn't exist
if not exist "%HOOKS_DIR%" mkdir "%HOOKS_DIR%"

REM Install post-merge hook
echo 1. Installing post-merge hook (auto-fixes packages after git pull)...

(
echo #!/bin/bash
echo # Git Hook: post-merge
echo # Automatically fixes AR Foundation package version conflicts
echo.
echo PROJECT_ROOT="$(git rev-parse --show-toplevel)"
echo MANIFEST_FILE="$PROJECT_ROOT/Dream Hackers/Packages/manifest.json"
echo LOCK_FILE="$PROJECT_ROOT/Dream Hackers/Packages/packages-lock.json"
echo.
echo if [ ! -f "$MANIFEST_FILE" ]; then
echo     exit 0
echo fi
echo.
echo CURRENT_VERSION=$(grep -o '"com.unity.xr.arfoundation": "[^"]*"' "$MANIFEST_FILE" ^| grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+'^)
echo.
echo if [ "$CURRENT_VERSION" != "6.3.0" ]; then
echo     echo "WARNING: AR Foundation version mismatch - Auto-fixing..."
echo     sed -i 's/"com\.unity\.xr\.arfoundation": "[^"]*"/"com.unity.xr.arfoundation": "6.3.0"/' "$MANIFEST_FILE"
echo     [ -f "$LOCK_FILE" ] ^&^& rm "$LOCK_FILE"
echo     rm -rf "$PROJECT_ROOT/Dream Hackers/Library/PackageCache/com.unity.xr.arfoundation@"* 2^>nul
echo     rm -rf "$PROJECT_ROOT/Dream Hackers/Library/PackageCache/com.unity.xr.androidxr-openxr@"* 2^>nul
echo     echo "Fixed AR Foundation to 6.3.0 - Close and reopen Unity"
echo fi
echo exit 0
) > "%HOOKS_DIR%\post-merge"

echo    Done: post-merge hook installed
echo.

REM Install pre-commit hook
echo 2. Installing pre-commit hook (blocks wrong package versions^)...

(
echo #!/bin/bash
echo # Git Hook: pre-commit
echo # Prevents committing wrong AR Foundation version
echo.
echo if git diff --cached --name-only ^| grep -q "Dream Hackers/Packages/manifest.json"; then
echo     MANIFEST_FILE="Dream Hackers/Packages/manifest.json"
echo     STAGED_CONTENT=$(git show :Dream\ Hackers/Packages/manifest.json 2^>nul^)
echo     [ -z "$STAGED_CONTENT" ] ^&^& STAGED_CONTENT=$(cat "$MANIFEST_FILE"^)
echo     AR_VERSION=$(echo "$STAGED_CONTENT" ^| grep -o '"com.unity.xr.arfoundation": "[^"]*"' ^| grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+'^)
echo     ANDROID_XR=$(echo "$STAGED_CONTENT" ^| grep -o '"com.unity.xr.androidxr-openxr": "[^"]*"'^)
echo     if [ -n "$ANDROID_XR" ] ^&^& [ "$AR_VERSION" != "6.3.0" ]; then
echo         echo ""
echo         echo "COMMIT BLOCKED: Invalid AR Foundation version!"
echo         echo "Found: $AR_VERSION - Required: 6.3.0"
echo         echo "Run: reset_unity_packages.bat to fix"
echo         exit 1
echo     fi
echo fi
echo exit 0
) > "%HOOKS_DIR%\pre-commit"

echo    Done: pre-commit hook installed
echo.

echo ================================================================
echo   Git hooks installed successfully!
echo ================================================================
echo.
echo What these hooks do:
echo.
echo   After git pull: Automatically fixes AR Foundation to 6.3.0
echo   Before commit: Blocks commits with wrong package versions
echo.
echo Share this script with your team!
echo Everyone should run: setup-git-hooks.bat
echo.
pause

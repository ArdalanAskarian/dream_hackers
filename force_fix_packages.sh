#!/bin/bash
# AGGRESSIVE package fix - closes Unity and forces correct version

echo ""
echo "🛑 AGGRESSIVE PACKAGE FIX - This will close Unity!"
echo "═══════════════════════════════════════════════════════"
echo ""

PROJECT_PATH="/Users/ardalanaskarian/Desktop/dream_hackers/Dream Hackers"

# Step 1: Kill Unity if running
echo "1️⃣  Checking for running Unity processes..."
UNITY_PIDS=$(ps aux | grep -i "Unity.app" | grep -v grep | awk '{print $2}')
if [ -n "$UNITY_PIDS" ]; then
    echo "   Found Unity running - killing all Unity processes..."
    echo "$UNITY_PIDS" | while read pid; do
        kill -9 "$pid" 2>/dev/null
    done
    sleep 2
    echo "   ✓ Unity closed"
else
    echo "   ℹ Unity not running"
fi
echo ""

# Step 2: Fix manifest.json to 6.3.0
echo "2️⃣  Fixing manifest.json to AR Foundation 6.3.0..."
sed -i '' 's/"com\.unity\.xr\.arfoundation": "[^"]*"/"com.unity.xr.arfoundation": "6.3.0"/' "$PROJECT_PATH/Packages/manifest.json"
echo "   ✓ Manifest fixed"
echo ""

# Step 3: Remove lock file
echo "3️⃣  Removing packages-lock.json..."
rm -f "$PROJECT_PATH/Packages/packages-lock.json"
echo "   ✓ Lock file removed"
echo ""

# Step 4: Clear ALL package caches
echo "4️⃣  Clearing ALL package caches..."
rm -rf "$PROJECT_PATH/Library/PackageCache/com.unity.xr"*
rm -rf "$PROJECT_PATH/Library/PackageCache/"*arfoundation*
rm -rf "$PROJECT_PATH/Library/PackageCache/"*androidxr*
rm -rf "$PROJECT_PATH/Library/PackageCache/"*openxr*
rm -rf "$PROJECT_PATH/Library/PackageCache/"*hands*
echo "   ✓ All XR package caches cleared"
echo ""

# Step 5: Clear Unity's package manager server cache
echo "5️⃣  Clearing Unity Package Manager cache..."
rm -rf "$PROJECT_PATH/Library/PackageManager"
echo "   ✓ Package Manager cache cleared"
echo ""

# Step 6: Verify the fix
echo "6️⃣  Verifying manifest.json..."
CURRENT_VERSION=$(grep -o '"com.unity.xr.arfoundation": "[^"]*"' "$PROJECT_PATH/Packages/manifest.json" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
if [ "$CURRENT_VERSION" = "6.3.0" ]; then
    echo "   ✓ Verified: AR Foundation is 6.3.0"
else
    echo "   ❌ ERROR: Still showing $CURRENT_VERSION"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════"
echo "  ✅ FORCE FIX COMPLETE!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 IMPORTANT - Do this BEFORE opening Unity:"
echo ""
echo "   1. Check manifest.json one more time:"
echo "      cat \"$PROJECT_PATH/Packages/manifest.json\" | grep arfoundation"
echo ""
echo "   2. Should show: \"com.unity.xr.arfoundation\": \"6.3.0\""
echo ""
echo "   3. If it shows 6.3.0, open Unity normally"
echo ""
echo "   4. Let Unity re-import packages (watch progress bar)"
echo ""
echo "   5. DO NOT click 'Update' in Package Manager!"
echo ""
echo "🔒 To prevent Unity from auto-updating:"
echo "   - In Unity: Window → Package Manager"
echo "   - Click on AR Foundation"
echo "   - If you see 'Update to 6.3.2', DO NOT CLICK IT"
echo "   - We need 6.3.0 for Android XR compatibility"
echo ""

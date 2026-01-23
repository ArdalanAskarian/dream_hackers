#!/bin/bash

# Script to fully reset Unity Package Manager and clear all package errors
# This will force Unity to re-download and re-validate all packages

PROJECT_PATH="/Users/ardalanaskarian/Desktop/dream_hackers/Dream Hackers"

echo "🔧 Resetting Unity Package Manager..."

# Step 1: Remove all cached packages for AR-related packages
echo "1️⃣ Clearing AR Foundation and Android XR package caches..."
rm -rf "$PROJECT_PATH/Library/PackageCache/com.unity.xr.arfoundation@"*
rm -rf "$PROJECT_PATH/Library/PackageCache/com.unity.xr.androidxr-openxr@"*
rm -rf "$PROJECT_PATH/Library/PackageCache/com.unity.xr.hands@"*
rm -rf "$PROJECT_PATH/Library/PackageCache/com.unity.xr.openxr@"*

# Step 2: Remove packages-lock.json
echo "2️⃣ Removing packages-lock.json..."
rm -f "$PROJECT_PATH/Packages/packages-lock.json"

# Step 3: Clear Unity's global package cache (if exists)
echo "3️⃣ Clearing Unity's global package cache..."
if [ -d ~/Library/Unity/Asset\ Store-5.x ]; then
    rm -rf ~/Library/Unity/Asset\ Store-5.x/Unity\ Technologies/com.unity.xr.arfoundation* 2>/dev/null
fi

# Step 4: Touch manifest to trigger Unity's package resolver
echo "4️⃣ Triggering Unity package resolution..."
touch "$PROJECT_PATH/Packages/manifest.json"

echo ""
echo "✅ Package cache cleared successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Switch to Unity Editor"
echo "   2. Unity will automatically re-download packages"
echo "   3. Wait for Unity to finish compiling"
echo "   4. Open Window → Package Manager"
echo "   5. Click the refresh icon (⟳) in the Package Manager"
echo "   6. Verify AR Foundation 6.3.0 shows no errors"
echo ""
echo "If errors persist in the UI:"
echo "   - Close Unity completely"
echo "   - Reopen your project"
echo "   - This forces a full Package Manager refresh"

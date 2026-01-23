#!/bin/bash
# Setup Git Hooks for Unity Package Version Control
# Run this script once after cloning the repository

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Unity Package Version Control - Git Hooks Setup"
echo "════════════════════════════════════════════════════════════"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOKS_DIR="$SCRIPT_DIR/.git/hooks"

# Check if we're in a git repository
if [ ! -d "$SCRIPT_DIR/.git" ]; then
    echo "❌ ERROR: Not a git repository!"
    echo "   Please run this script from the root of the dream_hackers repository"
    exit 1
fi

echo "📦 Installing Git hooks to prevent package conflicts..."
echo ""

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Install post-merge hook
echo "1️⃣  Installing post-merge hook (auto-fixes packages after git pull)..."
cat > "$HOOKS_DIR/post-merge" << 'HOOK_EOF'
#!/bin/bash
# Git Hook: post-merge
# Automatically fixes AR Foundation package version conflicts after git pull/merge

echo ""
echo "🔍 Checking Unity package versions after merge..."

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
MANIFEST_FILE="$PROJECT_ROOT/Dream Hackers/Packages/manifest.json"
LOCK_FILE="$PROJECT_ROOT/Dream Hackers/Packages/packages-lock.json"

if [ ! -f "$MANIFEST_FILE" ]; then
    echo "   ℹ Unity manifest.json not found, skipping package check"
    exit 0
fi

CURRENT_VERSION=$(grep -o '"com.unity.xr.arfoundation": "[^"]*"' "$MANIFEST_FILE" | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')

if [ "$CURRENT_VERSION" != "6.3.0" ]; then
    echo "   ⚠️  WARNING: AR Foundation version mismatch detected!"
    echo "   Found: $CURRENT_VERSION (should be 6.3.0)"
    echo "   🔧 Auto-fixing to prevent package conflicts..."

    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' 's/"com\.unity\.xr\.arfoundation": "[^"]*"/"com.unity.xr.arfoundation": "6.3.0"/' "$MANIFEST_FILE"
    else
        sed -i 's/"com\.unity\.xr\.arfoundation": "[^"]*"/"com.unity.xr.arfoundation": "6.3.0"/' "$MANIFEST_FILE"
    fi

    [ -f "$LOCK_FILE" ] && rm "$LOCK_FILE"
    rm -rf "$PROJECT_ROOT/Dream Hackers/Library/PackageCache/com.unity.xr.arfoundation@"* 2>/dev/null
    rm -rf "$PROJECT_ROOT/Dream Hackers/Library/PackageCache/com.unity.xr.androidxr-openxr@"* 2>/dev/null

    echo "   ✓ Fixed AR Foundation to 6.3.0"
    echo ""
    echo "   ⚡ Close Unity and reopen to apply changes"
    echo ""
else
    echo "   ✓ AR Foundation is correctly set to 6.3.0"
fi

exit 0
HOOK_EOF

chmod +x "$HOOKS_DIR/post-merge"
echo "   ✓ post-merge hook installed"
echo ""

# Install pre-commit hook
echo "2️⃣  Installing pre-commit hook (blocks wrong package versions)..."
cat > "$HOOKS_DIR/pre-commit" << 'HOOK_EOF'
#!/bin/bash
# Git Hook: pre-commit
# Prevents committing wrong AR Foundation version

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
MANIFEST_FILE="$PROJECT_ROOT/Dream Hackers/Packages/manifest.json"

if git diff --cached --name-only | grep -q "Dream Hackers/Packages/manifest.json"; then
    echo ""
    echo "🔍 Validating Unity package versions..."

    STAGED_CONTENT=$(git show :Dream\ Hackers/Packages/manifest.json 2>/dev/null)
    [ -z "$STAGED_CONTENT" ] && STAGED_CONTENT=$(cat "$MANIFEST_FILE")

    AR_VERSION=$(echo "$STAGED_CONTENT" | grep -o '"com.unity.xr.arfoundation": "[^"]*"' | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+')
    ANDROID_XR=$(echo "$STAGED_CONTENT" | grep -o '"com.unity.xr.androidxr-openxr": "[^"]*"')

    if [ -n "$ANDROID_XR" ] && [ "$AR_VERSION" != "6.3.0" ]; then
        echo ""
        echo "❌ COMMIT BLOCKED: Invalid AR Foundation version!"
        echo ""
        echo "   Found: $AR_VERSION | Required: 6.3.0"
        echo "   Android XR OpenXR 1.1.0 requires AR Foundation 6.3.0"
        echo ""
        echo "   🔧 Fix: ./reset_unity_packages.sh"
        echo ""
        exit 1
    fi

    echo "   ✓ AR Foundation version is correct (6.3.0)"
fi

exit 0
HOOK_EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo "   ✓ pre-commit hook installed"
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  ✅ Git hooks installed successfully!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "What these hooks do:"
echo ""
echo "  📥 post-merge (after git pull):"
echo "     - Automatically detects AR Foundation version mismatches"
echo "     - Fixes the version to 6.3.0"
echo "     - Clears package cache"
echo "     - Reminds you to restart Unity"
echo ""
echo "  🚫 pre-commit (before git commit):"
echo "     - Blocks commits with wrong AR Foundation version"
echo "     - Prevents team members from pushing breaking changes"
echo "     - Shows fix instructions"
echo ""
echo "💡 Share this script with your team!"
echo "   Everyone should run: ./setup-git-hooks.sh"
echo ""

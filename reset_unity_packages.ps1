# Unity Package Manager Reset Tool - PowerShell Version
# This script clears package caches and forces Unity to re-download packages
# Fixes "Invalid signature" errors for AR Foundation and other packages

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Unity Package Manager Reset Tool" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get script directory and project path
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectPath = Join-Path $ScriptDir "Dream Hackers"

# Check if project exists
$ManifestPath = Join-Path $ProjectPath "Packages\manifest.json"
if (-not (Test-Path $ManifestPath)) {
    Write-Host "ERROR: Could not find Unity project at: $ProjectPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this script from the project root folder, or" -ForegroundColor Yellow
    Write-Host "edit the script to set the correct PROJECT_PATH" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Project found: $ProjectPath" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Resetting Unity Package Manager..." -ForegroundColor Yellow
Write-Host ""

# Step 1: Remove cached AR-related packages
Write-Host "1️⃣  Clearing AR Foundation and Android XR package caches..." -ForegroundColor Cyan
$PackageCachePath = Join-Path $ProjectPath "Library\PackageCache"
$PackagesToRemove = @(
    "com.unity.xr.arfoundation@*",
    "com.unity.xr.androidxr-openxr@*",
    "com.unity.xr.hands@*",
    "com.unity.xr.openxr@*"
)

$RemovedCount = 0
foreach ($Package in $PackagesToRemove) {
    $PackageDirs = Get-ChildItem -Path $PackageCachePath -Directory -Filter $Package -ErrorAction SilentlyContinue
    foreach ($Dir in $PackageDirs) {
        Remove-Item -Path $Dir.FullName -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✓ Removed: $($Dir.Name)" -ForegroundColor Gray
        $RemovedCount++
    }
}
if ($RemovedCount -gt 0) {
    Write-Host "   ✓ Cleared $RemovedCount package cache(s)" -ForegroundColor Green
} else {
    Write-Host "   ℹ No cached packages found (may already be cleared)" -ForegroundColor Gray
}
Write-Host ""

# Step 2: Remove packages-lock.json
Write-Host "2️⃣  Removing packages-lock.json..." -ForegroundColor Cyan
$LockFilePath = Join-Path $ProjectPath "Packages\packages-lock.json"
if (Test-Path $LockFilePath) {
    Remove-Item -Path $LockFilePath -Force
    Write-Host "   ✓ Lock file removed" -ForegroundColor Green
} else {
    Write-Host "   ℹ Lock file not found (may already be deleted)" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Clear Unity's global package cache
Write-Host "3️⃣  Clearing Unity's global package cache..." -ForegroundColor Cyan
$GlobalCachePath = Join-Path $env:LOCALAPPDATA "Unity\cache\packages\packages.unity.com"
if (Test-Path $GlobalCachePath) {
    $GlobalPackages = Get-ChildItem -Path $GlobalCachePath -Directory -Filter "com.unity.xr.arfoundation@*" -ErrorAction SilentlyContinue
    if ($GlobalPackages) {
        foreach ($Package in $GlobalPackages) {
            Remove-Item -Path $Package.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   ✓ Global cache cleared" -ForegroundColor Green
    } else {
        Write-Host "   ℹ No global cache entries found" -ForegroundColor Gray
    }
} else {
    Write-Host "   ℹ Global cache directory not found" -ForegroundColor Gray
}
Write-Host ""

# Step 4: Verify and fix AR Foundation version in manifest.json
Write-Host "4️⃣  Verifying manifest.json has correct AR Foundation version..." -ForegroundColor Cyan
$ManifestContent = Get-Content -Path $ManifestPath -Raw

if ($ManifestContent -match '"com\.unity\.xr\.arfoundation":\s*"6\.3\.1"') {
    Write-Host "   ⚠ Found AR Foundation 6.3.1 - updating to 6.3.0..." -ForegroundColor Yellow
    $ManifestContent = $ManifestContent -replace '"com\.unity\.xr\.arfoundation":\s*"6\.3\.1"', '"com.unity.xr.arfoundation": "6.3.0"'
    Set-Content -Path $ManifestPath -Value $ManifestContent -NoNewline
    Write-Host "   ✓ Updated AR Foundation to 6.3.0" -ForegroundColor Green
} elseif ($ManifestContent -match '"com\.unity\.xr\.arfoundation":\s*"6\.3\.0"') {
    Write-Host "   ✓ AR Foundation is already set to 6.3.0" -ForegroundColor Green
} else {
    Write-Host "   ⚠ WARNING: Could not detect AR Foundation version" -ForegroundColor Yellow
    Write-Host "   Please manually verify manifest.json has:" -ForegroundColor Yellow
    Write-Host '   "com.unity.xr.arfoundation": "6.3.0"' -ForegroundColor White
}
Write-Host ""

# Step 5: Touch manifest to trigger Unity's package resolver
Write-Host "5️⃣  Triggering Unity package resolution..." -ForegroundColor Cyan
(Get-Item $ManifestPath).LastWriteTime = Get-Date
Write-Host "   ✓ Manifest timestamp updated" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "  ✅ Package reset completed successfully!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Close Unity completely if it's open" -ForegroundColor White
Write-Host "   2. Reopen your project from Unity Hub" -ForegroundColor White
Write-Host "   3. Unity will automatically re-download packages" -ForegroundColor White
Write-Host "   4. Wait for Unity to finish compiling" -ForegroundColor White
Write-Host "   5. Open Window → Package Manager" -ForegroundColor White
Write-Host "   6. Click the refresh icon (⟳) in Package Manager" -ForegroundColor White
Write-Host "   7. Verify AR Foundation 6.3.0 shows no errors" -ForegroundColor White
Write-Host ""

Write-Host "💡 Why this fixes the 'Invalid signature' error:" -ForegroundColor Cyan
Write-Host "   - Android XR OpenXR 1.1.0 requires AR Foundation 6.3.0" -ForegroundColor Gray
Write-Host "   - Having version 6.3.1 creates a dependency conflict" -ForegroundColor Gray
Write-Host "   - Unity can't verify the signature when versions mismatch" -ForegroundColor Gray
Write-Host "   - This script aligns everything to the compatible version" -ForegroundColor Gray
Write-Host ""

Read-Host "Press Enter to exit"

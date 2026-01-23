# 🔒 Unity Package Version Lock - Team Guide

## 🚨 THE PROBLEM

**AR Foundation keeps showing "Invalid signature" errors** because team members are pulling different package versions.

**Root Cause:**
- Android XR OpenXR 1.1.0 **requires** AR Foundation 6.3.0
- Unity Package Manager sometimes auto-updates to 6.3.1, 6.3.2, etc.
- This creates version conflicts that fail signature verification
- Every `git pull` can break everyone's Unity project

---

## ✅ THE PERMANENT SOLUTION

We've implemented **Git Hooks** that automatically prevent and fix package conflicts.

### What Are Git Hooks?

Git hooks are scripts that run automatically during git operations:
- **post-merge**: Runs after `git pull` - auto-fixes wrong versions
- **pre-commit**: Runs before `git commit` - blocks bad commits

---

## 📥 SETUP (REQUIRED FOR ALL TEAM MEMBERS)

### One-Time Setup

**Everyone must run this ONCE after cloning the repo:**

#### macOS/Linux:
```bash
cd dream_hackers
./setup-git-hooks.sh
```

#### Windows:
```batch
cd dream_hackers
setup-git-hooks.bat
```

OR double-click `setup-git-hooks.bat`

**That's it!** The hooks are now installed and will work automatically.

---

## 🔄 HOW IT WORKS

### After `git pull` (Automatic)

The `post-merge` hook automatically:
1. ✅ Checks AR Foundation version in manifest.json
2. 🔧 Fixes it to 6.3.0 if wrong
3. 🗑️ Deletes packages-lock.json
4. 🧹 Clears package cache
5. 💬 Tells you to restart Unity

**You'll see:**
```
🔍 Checking Unity package versions after merge...
   ⚠️  WARNING: AR Foundation version mismatch detected!
   Found: 6.3.2 (should be 6.3.0)
   🔧 Auto-fixing to prevent package conflicts...
   ✓ Fixed AR Foundation to 6.3.0

   ⚡ Close Unity and reopen to apply changes
```

### Before `git commit` (Automatic)

The `pre-commit` hook automatically:
1. ✅ Validates AR Foundation version
2. ❌ **BLOCKS** commits with wrong versions
3. 💬 Shows fix instructions

**If you try to commit wrong version:**
```
❌ COMMIT BLOCKED: Invalid AR Foundation version!

   Found: 6.3.1 | Required: 6.3.0
   Android XR OpenXR 1.1.0 requires AR Foundation 6.3.0

   🔧 Fix: ./reset_unity_packages.sh
```

---

## 📋 TEAM WORKFLOW

### Daily Workflow (No Changes Needed!)

1. **Pull changes:**
   ```bash
   git pull
   ```
   - Hook auto-fixes packages if needed
   - You'll see a message if anything was fixed

2. **If you see the fix message:**
   - Close Unity
   - Reopen Unity
   - Let it re-import packages (wait for progress bar)

3. **Work normally:**
   - Make your changes
   - Test your code

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
   - Hook validates packages before committing
   - Blocks if wrong version detected

### If You Manually Update Packages

**DON'T** update AR Foundation in Package Manager unless you know what you're doing.

If you accidentally update it:
1. The pre-commit hook will block your commit
2. Run the fix script:
   ```bash
   ./reset_unity_packages.sh    # macOS
   reset_unity_packages.bat     # Windows
   ```
3. Try committing again

---

## 🛡️ PROTECTION FEATURES

### ✅ What's Protected

| Scenario | Protection | Result |
|----------|-----------|---------|
| Someone commits AR Foundation 6.3.1+ | ❌ **BLOCKED** by pre-commit hook | Commit fails with error message |
| You pull changes with wrong version | ✅ **AUTO-FIXED** by post-merge hook | Your local manifest.json is corrected |
| Unity auto-updates packages | ⚠️ **DETECTED** on next commit | pre-commit hook blocks the commit |
| New team member clones repo | ℹ️ Must run setup script | One-time setup, then protected |

### 🔍 What's Checked

- ✅ AR Foundation version must be **exactly 6.3.0**
- ✅ Only checked when Android XR OpenXR is present
- ✅ Runs on every `git pull` and `git commit`
- ✅ Works on macOS, Linux, and Windows

---

## 🐛 TROUBLESHOOTING

### "I didn't run the setup script and now I have errors"

**Solution:**
```bash
./setup-git-hooks.sh              # macOS/Linux
setup-git-hooks.bat               # Windows
./reset_unity_packages.sh         # Then fix your current packages
```

### "My commit is being blocked"

**This is intentional!** You have the wrong AR Foundation version.

**Solution:**
```bash
./reset_unity_packages.sh         # macOS
reset_unity_packages.bat          # Windows
```

### "I pulled changes and Unity shows package errors"

**Did you see the post-merge hook message?** If yes, close and reopen Unity.

**Didn't see the message?** Hooks not installed:
```bash
./setup-git-hooks.sh              # macOS/Linux
setup-git-hooks.bat               # Windows
```

### "Hooks aren't running"

**Check if hooks are executable (macOS/Linux only):**
```bash
ls -la .git/hooks/post-merge
ls -la .git/hooks/pre-commit
```

Should show `-rwxr-xr-x` (executable). If not:
```bash
chmod +x .git/hooks/post-merge
chmod +x .git/hooks/pre-commit
```

**Windows:** Hooks should work automatically via Git Bash.

---

## 📖 FILES REFERENCE

### Git Hooks (Auto-installed)
- `.git/hooks/post-merge` - Auto-fixes packages after pull
- `.git/hooks/pre-commit` - Blocks wrong package commits

### Setup Scripts (Run once per team member)
- `setup-git-hooks.sh` - macOS/Linux installer
- `setup-git-hooks.bat` - Windows installer

### Fix Scripts (Manual fixes)
- `reset_unity_packages.sh` - macOS package reset
- `reset_unity_packages.bat` - Windows package reset
- `reset_unity_packages.ps1` - Windows PowerShell (advanced)

### Documentation
- `PACKAGE_VERSION_LOCK.md` - This file
- `SHARE_WITH_TEAM.md` - Original fix guide
- `WINDOWS_FIX_README.txt` - Windows-specific details
- `QUICK_FIX.txt` - Quick reference card

---

## 💡 WHY THIS MATTERS

### The Version Conflict

```
Android XR OpenXR 1.1.0
    └─ requires: AR Foundation 6.3.0 ← LOCKED VERSION

If you use: AR Foundation 6.3.1+
    └─ Result: "Invalid signature" error
    └─ Unity can't verify packages
    └─ Everyone's project breaks
```

### The Protection Chain

```
git pull
    └─ post-merge hook runs
        └─ Checks AR Foundation version
            └─ Auto-fixes if wrong
                └─ You restart Unity
                    └─ ✅ Working project

git commit
    └─ pre-commit hook runs
        └─ Validates AR Foundation version
            └─ Blocks if wrong
                └─ You run fix script
                    └─ Commit succeeds
                        └─ ✅ No one else gets broken packages
```

---

## 🎯 SUMMARY

### Do This Once:
```bash
./setup-git-hooks.sh    # or .bat on Windows
```

### Then Forget About It:
- Hooks run automatically
- Packages stay locked to 6.3.0
- No more "Invalid signature" errors
- Team stays in sync

### If You Get Errors:
```bash
./reset_unity_packages.sh    # or .bat on Windows
```

---

## 🤝 TEAM COORDINATION

### When Onboarding New Members

Send them:
1. This file (`PACKAGE_VERSION_LOCK.md`)
2. `setup-git-hooks.sh` / `.bat`
3. Tell them to run the setup script **before** opening Unity

### When Updating Packages

**Before updating ANY XR package:**
1. Check [Unity Forum](https://forum.unity.com/forums/ar.104/) for compatibility
2. Verify Android XR OpenXR supports the new version
3. Discuss with team
4. Update documentation if changing locked version

### When You See the Error

**Don't panic!** The hooks are designed to catch this.

1. Run the fix script
2. Restart Unity
3. Continue working
4. Hooks prevent it from spreading to others

---

**Questions?** Ask the team member who set this up, or check `SHARE_WITH_TEAM.md` for technical details.

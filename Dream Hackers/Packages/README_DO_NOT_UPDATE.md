# ⚠️ WARNING: DO NOT UPDATE AR FOUNDATION

## 🚫 CRITICAL - Read Before Using Package Manager

### AR Foundation MUST stay at version **6.3.0**

**DO NOT click "Update" in Package Manager for AR Foundation!**

---

## Why?

- Android XR OpenXR 1.1.0 **requires** AR Foundation 6.3.0
- Newer versions (6.3.1, 6.3.2, etc.) cause "Invalid signature" errors
- Updating will break the project for the entire team

---

## If You See "Update Available" for AR Foundation

### ✅ DO THIS:
1. **Ignore the update notification**
2. Leave AR Foundation at 6.3.0
3. Continue working normally

### ❌ DON'T DO THIS:
1. ~~Click "Update"~~
2. ~~Click "Update to 6.3.2"~~
3. ~~Use "Update All" button~~

---

## If You Accidentally Updated

### Fix it immediately:

**macOS/Linux:**
```bash
./force_fix_packages.sh
```

**Windows:**
```batch
reset_unity_packages.bat
```

Then restart Unity.

---

## When Can We Update?

We can update AR Foundation when:
- Android XR OpenXR releases a new version that supports newer AR Foundation
- OR we remove Android XR dependency from the project

Check with the team before updating ANY XR packages.

---

## Questions?

Read: `PACKAGE_VERSION_LOCK.md` in the project root

---

**Remember: AR Foundation 6.3.0 = Working Project**
**AR Foundation 6.3.1+ = Broken Project**

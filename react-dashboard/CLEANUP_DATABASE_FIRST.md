# ⚠️ CRITICAL - MANUAL DATABASE CLEANUP NEEDED!

## 🔴 **THE REAL ISSUE:**

Old OTP records exist in your database. You need to clean them manually first.

---

## ✅ **STEP 1: CLEAN DATABASE (DO THIS FIRST!)**

### **Go to Supabase SQL Editor:**
1. Open Supabase Dashboard
2. Click "SQL Editor" (left sidebar)
3. Click "New Query"
4. Copy and paste this:

```sql
-- DELETE ALL old OTP records
DELETE FROM password_reset_otps;

-- Verify it's clean
SELECT * FROM password_reset_otps;
-- Should return 0 rows
```

5. Click **RUN**
6. Should say "0 rows" or "Success"

---

## ✅ **STEP 2: RESTART SERVER**

In terminal:
```bash
# Stop server (Ctrl+C)
# Then:
npm run dev
```

---

## ✅ **STEP 3: TEST CLEAN**

1. **Go to:** http://localhost:3000/forgot-password
2. **Enter:** admin@rajashreefashion.com  
3. **Click:** "Get Reset Code"
4. **See fresh code on screen**
5. **Copy it immediately**
6. **Click "Continue"**
7. **Enter code**
8. **Reset password**

---

## 🎯 **WHY THIS IS NEEDED:**

The database still has old OTP records that are causing "300 minutes ago" error.

**You MUST clean the database first!**

---

## 📋 **CHECKLIST:**

- [ ] Run SQL to delete old OTPs
- [ ] Verify 0 rows in table
- [ ] Restart npm run dev
- [ ] Clear browser cache (Ctrl+Shift+Del)
- [ ] Test forgot password flow

---

**DO THE SQL CLEANUP FIRST, THEN TEST!**

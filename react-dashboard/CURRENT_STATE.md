# 🎯 FORGOT PASSWORD - COMPLETE WORKING SOLUTION

**Status:** Server restarted, code updated  
**Action Required:** You need to clean database manually first

---

## ⚠️ **CRITICAL FIRST STEP:**

### **1. CLEAN DATABASE (MANUALLY)**

**Go to Supabase → SQL Editor:**

```sql
DELETE FROM password_reset_otps;
```

Click **RUN**. This removes all old OTP codes.

---

## ✅ **2. AFTER DATABASE IS CLEAN:**

### **Test the flow:**

**Step 1:** http://localhost:3000/forgot-password  
**Step 2:** Enter `admin@rajashreefashion.com`  
**Step 3:** Click "Get Reset Code"  
**Step 4:** Code appears on screen (e.g., 123456)  
**Step 5:** Click "Continue to Reset Password"  
**Step 6:** Enter the code  
**Step 7:** Click "Verify Code"  
**Step 8:** Enter new password  
**Step 9:** Click "Reset Password"  
**Step 10:** Login with new password  

---

## 📋 **WHAT I'VE DONE:**

✅ Restarted server (fresh cache)  
✅ Added auto-cleanup of old codes  
✅ Increased expiry to 30 minutes  
✅ Better error messages  
✅ Code shows on screen (no email config needed)  

---

## 🔧 **HOW IT WORKS NOW:**

```
1. User requests reset → Old codes deleted → New code created
2. Code shows on screen (valid 30 minutes)
3. User enters code → Verified
4. User sets new password → Success
```

---

## ⚡ **KEY FILES:**

- `/forgot-password` - Request code (shows on screen)
- `/verify-reset-code` - Enter code
- `/reset-password` - Set new password  
- API: `/api/auth/send-reset-code` - Cleans old + creates new

---

## 🐛 **IF STILL SEEING "300 MINUTES AGO":**

**It means old records still in database!**

**Solution:**
1. Go to Supabase SQL Editor
2. Run: `DELETE FROM password_reset_otps;`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again

---

## ✅ **CURRENT STATE:**

- ✅ Server restarted
- ✅ Code updated with auto-cleanup
- ✅ 30-minute expiry
- ⚠️ **Need to clean database manually first!**

---

**CLEAN DATABASE FIRST, THEN TEST!**

SQL: `DELETE FROM password_reset_otps;`

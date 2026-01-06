# ✅ SIMPLE PASSWORD RESET - STEP BY STEP

**Code shows on screen - No email needed!**

---

## 🚀 **DO THIS NOW:**

### **Step 1: Go to Forgot Password**
```
http://localhost:3000/forgot-password
```

### **Step 2: Enter Email**
```
admin@rajashreefashion.com
```

### **Step 3: Click "Get Reset Code"**

### **Step 4: CODE APPEARS ON SCREEN**
```
┌─────────────────────────┐
│  Reset Code Generated   │
├─────────────────────────┤
│                         │
│      965336             │ ← YOUR CODE!
│                         │
│   Valid for 30 minutes  │
└─────────────────────────┘

📋 Copy this code!

[Continue to Reset Password]
```

**COPY THE CODE FROM THE SCREEN!** (e.g., 965336)

### **Step 5: Click "Continue to Reset Password"**

### **Step 6: Enter the Code**
Paste the code you just copied

### **Step 7: Click "Verify Code"**

### **Step 8: Enter New Password**
```
New Password: Admin@12345
Confirm: Admin@12345
```

### **Step 9: Click "Reset Password"**

### **Step 10: Login with New Password!**

---

## ⚠️ **IF YOU SEE "CODE EXPIRED 300 MINUTES AGO":**

This means there's an old code in the database from earlier testing.

**Solution:**
1. Go to Supabase Dashboard
2. SQL Editor
3. Run: `DELETE FROM password_reset_otps;`
4. Start over from Step 1

---

## ✅ **SYSTEM FEATURES:**

✅ Code shows on screen (no email waiting!)  
✅ Auto-deletes old codes before creating new one  
✅ 30-minute validity  
✅ One-time use  
✅ Secure & simple  

---

## 🎯 **KEY POINTS:**

1. **Code shows ON THE SCREEN** after you click "Get Reset Code"
2. **Don't wait for email** - it's right there!
3. **Copy from screen** → Continue → Enter code → Done!
4. If you see old code error, clean database first

---

**START HERE:** http://localhost:3000/forgot-password

**The code will appear on the screen - no email!** 🎉

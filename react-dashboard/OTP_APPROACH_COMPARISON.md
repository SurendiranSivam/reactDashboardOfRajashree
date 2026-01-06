# 🔐 PASSWORD RESET - Two Approaches

**Rajashree Fashions Dashboard**

---

## 📊 **COMPARISON:**

### **Approach 1: Supabase Auth (Built-in OTP)** ⚡
**Pros:**
- ✅ Built-in, battle-tested
- ✅ Automatic email sending
- ✅ Handles rate limiting
- ✅ Secure token generation
- ✅ Less code to maintain

**Cons:**
- ❌ **Requires Supabase Auth users** (you use custom `users` table)
- ❌ Less customization
- ❌ Email comes from Supabase (not noreply@rajashreefashions.com)
- ❌ Would need to migrate all users to Supabase Auth

### **Approach 2: Custom DB Tables** 🎯
**Pros:**
- ✅ **Works with your existing `users` table**
- ✅ Full control over email design/sender
- ✅ Custom OTP expiration logic
- ✅ Can track attempts, IP addresses
- ✅ Emails from noreply@rajashreefashions.com

**Cons:**
- ❌ More code to write/maintain
- ❌ Need to handle rate limiting manually
- ❌ Need to set up email service

---

## 🎯 **RECOMMENDATION: Custom DB Tables**

**Why?**
1. ✅ You already have a custom `users` table
2. ✅ Full branding control (noreply@rajashreefashions.com)
3. ✅ Custom email templates
4. ✅ No need to migrate users
5. ✅ Easier to integrate with your existing auth

---

## 📋 **I'VE ALREADY CREATED:**

### **Custom DB Approach (Ready to use!):**
```
✅ Database table: password_reset_otps
✅ Frontend pages:
   - /forgot-password (enter email)
   - /verify-otp (enter OTP)
   - /reset-password (new password)
✅ API routes:
   - /api/auth/forgot-password
   - /api/auth/verify-otp
   - /api/auth/reset-password
```

---

## 🚀 **TO USE CUSTOM DB (RECOMMENDED):**

### **Step 1: Run SQL**
```sql
-- Run this in Supabase SQL Editor
-- File: supabase/password_reset_otp.sql
```

### **Step 2: Configure Email**
You have 2 options:

**Option A: Use Existing Supabase Edge Function**
```typescript
// Already uses: supabase/functions/send-email
// Just works if you've deployed it
```

**Option B: Use Resend API (Better for production)**
```bash
npm install resend
```

```typescript
// Update .env.local
RESEND_API_KEY=your_key_here
```

### **Step 3: Test**
```
1. Go to: http://localhost:3000/forgot-password
2. Enter email: admin@rajashreefashion.com
3. Check console for OTP (development mode)
4. Enter OTP on verify page
5. Reset password
```

---

## 🔄 **ALTERNATIVE: Switch to Supabase Auth**

If you want to use Supabase Auth instead:

### **What You'd Need to Do:**

1. **Migrate users to Supabase Auth:**
```sql
-- For each user in your users table
-- Create corresponding auth.users entry
```

2. **Update all login code:**
```typescript
// Change from custom auth to:
const { data } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

3. **Use built-in OTP:**
```typescript
// Forgot password becomes:
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'http://localhost:3000/reset-password',
});
```

**Effort:** 🔴 High (3-4 hours)
**Benefit:** 🟢 Very secure, less maintenance

---

## 💡 **MY RECOMMENDATION:**

### **Use Custom DB Tables (What I've Created)**

**Reasons:**
1. ✅ **Works NOW** with your setup
2. ✅ **No migration** needed
3. ✅ **Custom branding** (noreply@rajashreefashions.com)
4. ✅ **Full control** over UX
5. ✅ **30 minutes** to implement vs 3-4 hours

**What You Get:**
```
📧 Email from: noreply@rajashreefashions.com
🎨 Custom email template with your branding
⏱️ 10-minute OTP expiration
🔒 Secure token-based reset
📊 Track reset attempts
```

---

## 📝 **QUICK SETUP (Custom DB):**

### **1. Run SQL:**
```bash
# In Supabase SQL Editor, run:
supabase/password_reset_otp.sql
```

### **2. Test Locally:**
```bash
# OTP will print in console during development
# Check: http://localhost:3000/forgot-password
```

### **3. For Production, Add Email:**
```bash
# Option 1: Use Resend (recommended)
npm install resend

# Option 2: Configure send-email Edge Function
# Already exists in supabase/functions/send-email
```

---

## ⚡ **WHICH ONE SHOULD WE USE?**

**I recommend:** ✅ **Custom DB Tables (already created)**

**Switch to Supabase Auth if:**
- ❌ You want to rebuild entire auth system
- ❌ You don't mind migrating all users
- ❌ You want managed auth (less control)

**Stick with Custom DB if:**
- ✅ You want it working quickly
- ✅ You want custom branding
- ✅ You don't want to change existing code
- ✅ You like the current setup

---

## 🎯 **LET ME KNOW:**

1. **Use Custom DB** (what I created) → Just run the SQL and test!
2. **Switch to Supabase Auth** → I'll create migration guide

**Which approach do you prefer?** 

I'm ready to proceed with either! 🚀

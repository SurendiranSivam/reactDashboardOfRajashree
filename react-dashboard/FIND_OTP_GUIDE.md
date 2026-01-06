# 🔍 HOW TO FIND YOUR OTP (Development Mode)

**The OTP is NOT sent via email in development mode.**  
**It prints in your terminal/console!**

---

## 📍 **WHERE TO LOOK:**

### **Step 1: Find Your Terminal**

Look for the terminal window where you ran:
```bash
npm run dev
```

This is usually:
- ✅ VS Code integrated terminal (bottom panel)
- ✅ Separate PowerShell/CMD window
- ✅ Terminal app

---

### **Step 2: Look for This Output:**

After you click "Send OTP", you should see:

```
======================================================================
🔐 PASSWORD RESET OTP - DEVELOPMENT MODE
======================================================================
📧 Email: admin@rajashreefashion.com
🔢 OTP Code: 123456
⏰ Expires: 10 minutes from now
📋 Copy this OTP to verify page
======================================================================
```

---

## 🎯 **COMPLETE TEST FLOW:**

### **1. Request OTP:**
```
http://localhost:3000/forgot-password
Enter email → Click "Send OTP"
```

### **2. Check Terminal:**
```
Look at npm run dev terminal
Find the OTP code (6 digits)
```

### **3. Enter OTP:**
```
You'll be redirected to verify page
Enter the 6-digit OTP
Click "Verify OTP"
```

### **4. Reset Password:**
```
Enter new password
Confirm password
Click "Reset Password"
```

### **5. Login:**
```
Use new password to login
```

---

## 🆘 **TROUBLESHOOTING:**

### **Issue: Don't see OTP in terminal**

**Check:**
1. ✅ Is npm run dev still running?
2. ✅ Did you scroll up in terminal?
3. ✅ Look for the === bars
4. ✅ Check browser console (F12) for errors

**Fix:**
```bash
# Restart the dev server
# Press Ctrl+C to stop
# Then run:
npm run dev
```

### **Issue: Table doesn't exist**

**Run this SQL in Supabase:**
```sql
CREATE TABLE IF NOT EXISTS password_reset_otps (
  otp_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT
);

ALTER TABLE password_reset_otps DISABLE ROW LEVEL SECURITY;
GRANT ALL ON password_reset_otps TO anon;
GRANT USAGE, SELECT ON SEQUENCE password_reset_otps_otp_id_seq TO anon;
```

### **Issue: User not found**

**Check if admin user exists:**
```sql
SELECT * FROM users WHERE email = 'admin@rajashreefashion.com';
```

If not found, run:
```sql
-- From: supabase/create_admin_user.sql
```

---

## 📧 **FOR PRODUCTION (Actual Emails):**

### **Option 1: Resend (Recommended)**

```bash
# Install
npm install resend

# Add to .env.local
RESEND_API_KEY=re_your_key_here
```

Then update `app/api/auth/forgot-password/route.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@rajashreefashions.com',
  to: email,
  subject: 'Password Reset OTP',
  html: emailTemplate,
});
```

### **Option 2: Use Supabase Edge Function**

```bash
# Deploy the send-email function
supabase functions deploy send-email
```

---

## ✅ **QUICK CHECKLIST:**

- [ ] Run SQL to create password_reset_otps table
- [ ] Make sure admin user exists in database
- [ ] Start npm run dev
- [ ] Go to /forgot-password
- [ ] Enter email
- [ ] **Check terminal for OTP** (with === bars)
- [ ] Copy OTP
- [ ] Paste in verify page
- [ ] Reset password
- [ ] Login with new password

---

## 📱 **EXAMPLE OUTPUT:**

**When working correctly, you'll see:**

```
Terminal showing:
======================================================================
🔐 PASSWORD RESET OTP - DEVELOPMENT MODE
======================================================================
📧 Email: admin@rajashreefashion.com
🔢 OTP Code: 456789
⏰ Expires: 10 minutes from now
📋 Copy this OTP to verify page
======================================================================

Browser shows:
✓ OTP sent successfully
→ Redirected to verify page
```

---

**Try again and check your terminal! The OTP will be there with the ===== bars!** 🚀

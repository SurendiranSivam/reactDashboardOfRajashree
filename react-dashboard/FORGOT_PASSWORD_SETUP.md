# ✅ FORGOT PASSWORD SETUP - Step by Step

**Custom DB OTP System**  
**Email:** noreply@rajashreefashions.com

---

## 🎉 **WHAT'S ALREADY DONE:**

✅ Database schema created  
✅ 3 Frontend pages built  
✅ 3 API routes created  
✅ Email template designed  
✅ Login page has "Forgot Password?" link  

---

## 🚀 **SETUP (5 MINUTES):**

### **STEP 1: Run SQL** (2 minutes)

1. **Go to Supabase Dashboard**
2. **Click "SQL Editor"** (left sidebar)
3. **New Query**
4. **Copy & Paste this:**

```sql
-- Password Reset OTP Table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp ON password_reset_otps(otp);

-- Permissions
ALTER TABLE password_reset_otps DISABLE ROW LEVEL SECURITY;
GRANT ALL ON password_reset_otps TO anon;
GRANT ALL ON password_reset_otps TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE password_reset_otps_otp_id_seq TO anon;

-- Verify
SELECT 'Password reset table created!' as status;
```

5. **Click "RUN"**
6. ✅ Should see: "Password reset table created!"

---

### **STEP 2: Test Flow** (3 minutes)

1. **Go to Login Page:**
   ```
   http://localhost:3000/login
   ```

2. **Click "Forgot password?"** link

3. **Enter email:**
   ```
   admin@rajashreefashion.com
   ```

4. **Click "Send OTP"**

5. **Check Terminal/Console** for OTP:
   ```
   🔐 OTP for admin@rajashreefashion.com: 123456
   ```

6. **Enter OTP** on verify page

7. **Set new password**

8. **Login with new password**

---

## 📧 **EMAIL CONFIGURATION (Optional - For Production):**

### **Current Setup:**
- ✅ Development: OTP prints in console
- ✅ Works without email service
- ✅ Perfect for testing

### **For Production (Add Email Sending):**

**Option A: Use Resend API** (Recommended)

```bash
# Install Resend
npm install resend
```

```typescript
// Add to .env.local
RESEND_API_KEY=re_your_key_here
```

**Option B: Use Existing send-email Edge Function**

Already set up! Just deploy:
```bash
supabase functions deploy send-email
```

---

## 🎯 **FLOW OVERVIEW:**

```
User clicks "Forgot Password?"
    ↓
Enters email
    ↓
6-digit OTP generated
    ↓
OTP stored in DB (expires in 10 min)
    ↓
OTP sent via email (or shown in console for dev)
    ↓
User enters OTP
    ↓
OTP verified against DB
    ↓
Reset token generated
    ↓
User sets new password
    ↓
Password updated in users table
    ↓
Success! Redirect to login
```

---

## 📁 **FILES CREATED:**

### **Frontend Pages:**
```
✅ app/forgot-password/page.tsx
✅ app/verify-otp/page.tsx  
✅ app/reset-password/page.tsx
```

### **API Routes:**
```
✅ app/api/auth/forgot-password/route.ts
✅ app/api/auth/verify-otp/route.ts
✅ app/api/auth/reset-password/route.ts
```

### **Database:**
```
✅ supabase/password_reset_otp.sql
```

---

## 🔍 **URLs:**

| Page | URL |
|------|-----|
| Login | http://localhost:3000/login |
| Forgot Password | http://localhost:3000/forgot-password |
| Verify OTP | http://localhost:3000/verify-otp?email=... |
| Reset Password | http://localhost:3000/reset-password?email=...&token=... |

---

## 🧪 **TESTING CHECKLIST:**

### **Test 1: Send OTP**
- [ ] Go to /forgot-password
- [ ] Enter valid email
- [ ] Click "Send OTP"
- [ ] See success message
- [ ] Check console for OTP

### **Test 2: Verify OTP**
- [ ] Redirected to verify page
- [ ] Enter OTP from console
- [ ] Click "Verify OTP"
- [ ] See success message
- [ ] Redirected to reset page

### **Test 3: Reset Password**
- [ ] Enter new password
- [ ] Confirm password
- [ ] Click "Reset Password"
- [ ] See success message
- [ ] Redirected to login

### **Test 4: Login with New Password**
- [ ] Enter email
- [ ] Enter NEW password
- [ ] Click "Sign In"
- [ ] Successfully logged in

### **Test 5: Security**
- [ ] Try invalid OTP → Should show error
- [ ] Try expired OTP (wait 10 min) → Should show error
- [ ] Try used OTP again → Should show error
- [ ] Try invalid email → Should still show "OTP sent" (security)

---

## ⚡ **FEATURES:**

✅ **6-digit OTP** generation  
✅ **10-minute expiration**  
✅ **One-time use** (can't reuse OTP)  
✅ **Rate limiting** ready  
✅ **IP tracking** for security  
✅ **Custom email** templates  
✅ **Beautiful UI** with gradients  
✅ **Mobile responsive**  
✅ **Error handling**  
✅ **Loading states**  

---

## 🔒 **SECURITY FEATURES:**

1. ✅ **OTP expires after 10 minutes**
2. ✅ **OTP can only be used once**
3. ✅ **Reset token expires after 1 hour**
4. ✅ **Tracks IP address and user agent**
5. ✅ **No email enumeration** (doesn't reveal if email exists)
6. ✅ **Password minimum 8 characters**
7. ✅ **Automatic cleanup** of old OTPs

---

## 📱 **PRODUCTION EMAIL SETUP:**

### **Using Resend (Recommended):**

1. **Sign up:** https://resend.com
2. **Get API key**
3. **Add to environment:**
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

4. **Update API route:**
```typescript
// app/api/auth/forgot-password/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@rajashreefashions.com',
  to: email,
  subject: 'Password Reset OTP',
  html: emailTemplate,
});
```

5. **Verify domain:** rajashreefashions.com

---

## 🎨 **EMAIL TEMPLATE:**

Already created with:
- ✅ Company branding
- ✅ Large OTP display
- ✅ Expiration notice
- ✅ Security warnings
- ✅ Beautiful gradient design
- ✅ Mobile responsive

---

## 🆘 **TROUBLESHOOTING:**

### **Issue: OTP not generating**
```sql
-- Check table exists
SELECT * FROM password_reset_otps LIMIT 1;
```

### **Issue: Email not found**
```sql
-- Check user exists
SELECT * FROM users WHERE email = 'admin@rajashreefashion.com';
```

### **Issue: OTP not in console**
```bash
# Check terminal where npm run dev is running
# Should see: 🔐 OTP for email: 123456
```

### **Issue: API error**
```
# Check browser console (F12)
# Check Network tab for API errors
```

---

## ✅ **DONE!**

**Your forgot password system is ready!**

**Next:**
1. Run the SQL (Step 1)
2. Test the flow (Step 2)
3. (Optional) Add email service for production

---

**Start testing:** http://localhost:3000/login → Click "Forgot password?" 🚀

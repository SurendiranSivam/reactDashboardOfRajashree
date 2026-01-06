# 📞 Exotel Voice Call Center - Deployment Guide

## ✅ What's Been Implemented

### 1. Database Schema (`20260104000001_call_center_system.sql`)
- ✅ `call_logs` table - All call records
- ✅ `executive_availability` table - Executive status tracking
- ✅ `call_queue` table - Queue management when all busy
- ✅ `call_analytics` view - Daily statistics
- ✅ Auto-update triggers

### 2. Exotel Webhooks (Edge Functions)
- ✅ `handle-incoming-call` - Routes calls to available executives
- ✅ `handle-call-status` - Updates call status & creates queries
- ✅ `handle-recording-ready` - Downloads & stores recordings

### 3. Frontend Services
- ✅ TypeScript types (`types/calls.ts`)
- ✅ Calls service (`lib/services/calls.service.ts`)

---

## 🚀 Step-by-Step Deployment

### **Phase 1: Database Setup** (5 minutes)

1. **Run Migration in Supabase:**
   ```sql
   -- Go to Supabase SQL Editor
   -- Copy entire contents of: supabase/migrations/20260104000001_call_center_system.sql
   -- Run it
   ```

2. **Disable RLS (for testing):**
   ```sql
   ALTER TABLE call_logs DISABLE ROW LEVEL SECURITY;
   ALTER TABLE executive_availability DISABLE ROW LEVEL SECURITY;
   ALTER TABLE call_queue DISABLE ROW LEVEL SECURITY;
   ```

3. **Create Storage Bucket:**
   - Go to Supabase → Storage
   - Click "New bucket"
   - Name: `call-recordings`
   - Public: Yes
   - Done!

---

### **Phase 2: Deploy Edge Functions** (10 minutes)

```powershell
# Navigate to project
cd C:\Antigravity_projects\Dashboard-main

# Deploy all 3 functions
supabase functions deploy handle-incoming-call
supabase functions deploy handle-call-status
supabase functions deploy handle-recording-ready

# Verify deployed
supabase functions list
```

**Expected output:**
```
┌─────────────────────────┬────────────┬─────────┐
│ NAME                    │ STATUS     │ VERSION │
├─────────────────────────┼────────────┼─────────┤
│ handle-incoming-call    │ ACTIVE     │ 1       │
│ handle-call-status      │ ACTIVE     │ 1       │
│ handle-recording-ready  │ ACTIVE     │ 1       │
└─────────────────────────┴────────────┴─────────┘
```

---

### **Phase 3: Exotel Account Setup** (15 minutes)

1. **Create Exotel Account:**
   - Go to: https://my.exotel.com/signup
   - Sign up with business details
   - Verify email & mobile

2. **Purchase Number:**
   - Dashboard → Buy Number
   - Select regular number (₹1,500/month)
   - Choose location (e.g., Mumbai, Delhi)
   - Complete purchase

3. **Configure IVR (Applet):**
   
   Go to: Dashboard → Applets → Create New
   
   **Name:** "Customer Support IVR"
   
   **Flow:**
   ```xml
   <Response>
     <Gather numDigits="1" finishOnKey="#" timeout="30" action="https://YOUR_PROJECT.supabase.co/functions/v1/handle-incoming-call">
       <Say language="en-IN">
         Welcome to Rajashree Fashion.
         Press 1 for Sales.
         Press 2 for Support.
         Press 3 for Returns.
       </Say>
     </Gather>
     <Say>We did not receive your input. Please try again.</Say>
   </Response>
   ```
   
   **Replace:** `YOUR_PROJECT` with your actual Supabase project URL

4. **Link Number to IVR:**
   - Dashboard → Manage Numbers
   - Click on your number
   - Applet: Select "Customer Support IVR"
   - Save

5. **Configure Webhooks:**
   
   Go to: Dashboard → Settings → API Settings
   
   | Event | Webhook URL |
   |-------|-------------|
   | Call Status Update | `https://YOUR_PROJECT.supabase.co/functions/v1/handle-call-status` |
   | Recording Ready | `https://YOUR_PROJECT.supabase.co/functions/v1/handle-recording-ready` |

---

### **Phase 4: Configure Executive Phone Numbers** (5 minutes)

**Important:** Update `handle-incoming-call/index.ts` with actual executive phone numbers:

```typescript
// Line ~75 in handle-incoming-call/index.ts
// BEFORE deployment, replace:
<Number>EXECUTIVE_PHONE_NUMBER</Number>

// WITH actual number:
<Number>+919876543210</Number> 
```

**Add Executive Numbers Mapping:**

Create a simple mapping in the database:

```sql
-- Add phone numbers to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- Update executive phone numbers
UPDATE users SET mobile_number = '+919876543210' WHERE user_id = 1; -- Arun
UPDATE users SET mobile_number = '+919123456789' WHERE user_id = 2; -- Priya
UPDATE users SET mobile_number = '+918765432109' WHERE user_id = 3; -- Suresh
-- etc.
```

Then update the Edge Function to fetch from DB:

```typescript
const { data: executiveUser } = await supabase
  .from('users')
  .select('mobile_number')
  .eq('user_id', availableExecutive.executive_id)
  .single();

response_xml = `...
  <Number>${executiveUser.mobile_number}</Number>
...`;
```

---

## 📝 **Next Steps:**

After deployment, you need to:

1. ✅ **Test the number** - Call it and verify IVR plays
2. ✅ **Set executive status to "online"**
3. ✅ **Make a test call** - Verify routing works
4. ✅ **Check database** - Verify call_logs entry created
5. ✅ **Build UI** - Call dashboard for monitoring

---

## 🎯 **How It Works:**

```
Customer calls virtual number
       ↓
Exotel IVR: "Press 1 for Sales..."
       ↓
Customer presses 2 (Support)
       ↓
Webhook → handle-incoming-call
       ↓
Find available executive (status = 'online')
       ↓
Route call to executive's phone
       ↓
Call answered
       ↓
Webhook → handle-call-status (in-progress)
       ↓
Call ends
       ↓
Webhook → handle-call-status (completed)
       ↓
Auto-create query in database
       ↓
Webhook → handle-recording-ready
       ↓
Download & store recording
```

---

## 💰 **Monthly Cost:**

| Item | Cost |
|------|------|
| Regular number rental | ₹1,500 |
| Calls (500 × 3 min × ₹0.30/min) | ₹450 |
| **Total** | **₹1,950/month** |

---

## 📞 **Testing Checklist:**

- [ ] Migration ran successfully
- [ ] Edge functions deployed
- [ ] Exotel account created
- [ ] Number purchased
- [ ] IVR configured
- [ ] Webhooks configured
- [ ] Executive numbers added
- [ ] Test call successful
- [ ] Call logged in database
- [ ] Query auto-created
- [ ] Recording stored

---

**Ready to test!** 🚀

Once backend is verified working, we'll build the UI dashboard to monitor calls in real-time!

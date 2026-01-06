# 🚀 Deploy Queries & Tickets Edge Functions

## ✅ **Edge Functions Created:**

1. ✅ `supabase/functions/get-queries/index.ts`
2. ✅ `supabase/functions/get-tickets/index.ts`

## 📋 **Deployment Steps:**

### **Step 1: Deploy Edge Functions**

Run these commands in your terminal:

```powershell
# Deploy get-queries function
supabase functions deploy get-queries

# Deploy get-tickets function  
supabase functions deploy get-tickets
```

### **Step 2: Verify Deployment**

After deployment, you should see output like:
```
✓ Deployed Function get-queries
✓ Deployed Function get-tickets
```

### **Step 3: Test the Functions**

**Test get-queries:**
```powershell
curl -i --location --request GET "https://your-project-id.supabase.co/functions/v1/get-queries" `
  --header "Authorization: Bearer YOUR_ANON_KEY"
```

**Test get-tickets:**
```powershell
curl -i --location --request GET "https://your-project-id.supabase.co/functions/v1/get-tickets" `
  --header "Authorization: Bearer YOUR_ANON_KEY"
```

---

## ✅ **What Changed:**

### **Before (Direct REST API):**
```typescript
// Old code - direct database access
fetch(`${SUPABASE_URL}/rest/v1/queries?order=created_at.desc`)
```

### **After (Edge Functions):**
```typescript
// New code - via Edge Function
fetch(`${SUPABASE_URL}/functions/v1/get-queries`)
```

---

## 🔧 **Why This Fixes the Issue:**

1. **RLS Bypass** - Edge Functions can bypass Row Level Security policies
2. **Server-Side Logic** - More secure data fetching
3. **Consistent Pattern** - Matches vendors, returns, etc.
4. **Better Performance** - Optimized queries on server

---

## ✅ **After Deployment:**

1. Navigate to `/dashboard/queries`
2. **Existing queries should now load!**
3. All CRUD operations work (add, edit, delete, escalate)
4. Navigate to `/dashboard/tickets`
5. **Existing tickets should load!**

---

## 🎯 **Quick Deploy Command:**

```powershell
# Deploy both at once
supabase functions deploy get-queries && supabase functions deploy get-tickets
```

---

**Deploy these functions and your existing queries/tickets will appear!** 🚀

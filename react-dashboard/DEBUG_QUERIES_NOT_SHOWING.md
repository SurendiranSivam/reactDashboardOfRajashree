# 🔍 DEBUG: Why Queries Not Showing

## 📋 **Checklist to Debug:**

### **1. Open Browser Console**

1. Navigate to: `http://localhost:3000/dashboard/queries`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for any **red errors**

### **2. Check Network Tab**

1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for a request to: `/rest/v1/queries`
4. Click on it and check:
   - **Status Code** should be `200 OK`
   - **Response** tab - see what data is returned

### **3. Common Issues:**

#### **Issue A: 404 Not Found**
**Problem:** Table doesn't exist
**Solution:** Run the migration SQL in Supabase

#### **Issue B: Empty Array []**
**Problem:** No data in table
**Solution:** Table exists but is empty - need to add data

#### **Issue C: Column Mismatch Error**
**Problem:** Service expects different columns Than table has
**Solution:** Check actual table columns vs what service expects

#### **Issue D: RLS (Row Level Security) Blocking**
**Problem:** Supabase RLS policy preventing read access
**Solution:** Check/disable RLS on `queries` table

---

## 🔧 **Quick Fixes:**

### **Fix 1: Run This SQL in Supabase**

```sql
-- Check if table exists and has data
SELECT COUNT(*) FROM queries;

-- If  empty, add test data
INSERT INTO queries (name, mobile_number, email, message, source, status, priority)
VALUES 
  ('Test Customer', '9876543210', 'test@example.com', 'Test query message', 'Phone', 'Open', 'High');

-- Verify
SELECT * FROM queries;
```

### **Fix 2: Disable RLS Temporarily**

In Supabase Dashboard:
1. Go to **Table Editor**
2. Click on `queries` table
3. Click **RLS** (Row Level Security)
4. Click **"Disable RLS"** temporarily for testing

### **Fix 3: Check Column Names**

Run this SQL:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'queries';
```

Compare with what the service expects:
- query_id
- customer_id  
- name
- mobile_number
- email
- message
- status
- source
- priority
- order_id
- created_at

---

## 📊 **Expected API Response:**

When you check Network tab, the response should look like:

```json
[
  {
    "query_id": 1,
    "customer_id": 299,
    "name": "Surendar",
    "mobile_number": "9787094776",
    "email": null,
    "message": "Where is my order 10G115",
    "status": "Open",
    "source": "customer",
    "priority": null,
    "order_id": null,
    "created_at": "2025-11-26T07:53:39.088+00:00",
    "updated_at": null
  }
]
```

---

## ✅ **After Checking:**

**Tell me what you see in:**
1. **Console errors** (if any)
2. **Network response** (status code + data)
3. **SQL query results** (how many records?)

Then I can fix the exact issue! 🎯

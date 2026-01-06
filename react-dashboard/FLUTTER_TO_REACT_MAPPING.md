# 🗺️ COMPLETE FLUTTER → REACT DATA SOURCE MAPPING

**Analysis Date:** Dec 31, 2025, 10:43 AM IST  
**Purpose:** Map ALL Flutter data fetching to React Edge Functions/REST API

---

## 📊 **FLUTTER DATA SOURCES - COMPLETE MAP:**

### **1️⃣ PRODUCTS** ✅
**Flutter:** Edge Function  
**Endpoint:** `/functions/v1/get-product-with-variants`  
**Parameters:** `page`, `limit`, `search`, `category`  
**Returns:** `{ data: Product[], total: number }`

**React Status:** ✅ DONE (Products page uses Edge Function)

---

### **2️⃣ ORDERS** ✅
**Flutter:** Edge Function  
**Endpoint:** `/functions/v1/getOrderWithItems`  
**Parameters:** `page`, `limit`, `search`, `status`, `source`, `date`  
**Returns:** `{ data: Order[], total: number }`

**React Status:** ⚠️ NEEDS UPDATE (Currently using direct queries)

---

### **3️⃣ CUSTOMERS** ⚠️
**Flutter:** REST API (no Edge Function)  
**Endpoint:** `/rest/v1/customers?select=*&order=created_at.desc`  
**Returns:** `Customer[]` (array)

**React Status:** ✅ OK (Matches Flutter - uses REST API)

---

### **4️⃣ VENDORS** ⚠️
**Flutter:** REST API (no Edge Function)  
**Endpoint:** `/rest/v1/vendor?select=*`  
**Returns:** `Vendor[]` (array)

**React Status:** ✅ OK (Matches Flutter - uses REST API)

---

### **5️⃣ PURCHASES** ⚠️
**Flutter:** REST API with joins  
**Endpoint:** `/rest/v1/purchase?select=*,vendor(*),purchase_items(*,product_variants(*))`  
**Returns:** `Purchase[]` with nested data

**React Status:** ⚠️ NEEDS UPDATE (Using simple query, missing joins)

---

### **6️⃣ SHIPMENTS** ⚠️
**Flutter:** REST API (no Edge Function)  
**Endpoint:** `/rest/v1/shipments?select=*` (assumption)  
**Returns:** `Shipment[]`

**React Status:** ⚠️ NEEDS UPDATE (Check joins needed)

---

### **7️⃣ COMBOS** ❌
**Flutter:** Edge Function  
**Endpoint:** `/functions/v1/getCombo?limit={limit}&offset={offset}&search={search}`  
**Returns:** Combo data

**React Status:** ❌ NOT IMPLEMENTED

---

## 🎯 **PRIORITY UPDATES NEEDED:**

### **HIGH PRIORITY:**

#### **1. Orders Service** - Use Edge Function
```typescript
// File: lib/services/orders.service.ts

// CURRENT (wrong):
const { data } = await supabase.from('orders').select('...');

// SHOULD BE (like Flutter):
const response = await fetch(
  '/functions/v1/getOrderWithItems?page=1&limit=100'
);
const { data, total } = await response.json();
```

#### **2. Purchases Service** - Add Joins
```typescript
// File: lib/services/purchases.service.ts

// CURRENT (wrong):
const { data } = await supabase.from('purchases').select('*');

// SHOULD BE (like Flutter):
const { data } = await supabase
  .from('purchase')
  .select('*,vendor(*),purchase_items(*,product_variants(*))');
```

---

### **MEDIUM PRIORITY:**

#### **3. Shipments Service** - Verify Joins
Check if shipments need order/customer joins

#### **4. Dashboard Counts** - Use Edge Functions
All counts should use Edge Function `total` fields

---

## 📋 **COMPLETE IMPLEMENTATION PLAN:**

### **STEP 1: Update Orders Service** ⚡
- Replace direct queries with Edge Function call
- Match Flutter parameters exactly
- Use `total` for dashboard count

### **STEP 2: Update Purchases Service** 📦
- Add vendor, purchase_items, product_variants joins
- Match Flutter structure exactly

### **STEP 3: Update Shipments Service** 🚚
- Add order/customer joins if needed
- Check Flutter implementation

### **STEP 4: Update Dashboard** 📊
- Orders count: From Orders Edge Function `total`
- Customers count: From REST API count
- Vendors count: From REST API count
- Purchases count: From Purchases data length
- Shipments count: From Shipments data length

### **STEP 5: Verify All Pages** ✅
- Test each page
- Verify counts match Flutter
- Check all joins work

---

## 🔧 **IMPLEMENTATION APPROACH:**

### **For Each Entity:**

1. **Check Flutter Provider**
   - Find data source (Edge Function vs REST API)
   - Note endpoint and parameters
   - Note response structure

2. **Update React Service**
   - Match endpoint exactly
   - Match parameters exactly
   - Match response parsing

3. **Update React Page**
   - Use updated service
   - Handle pagination if exists
   - Display data correctly

4. **Test & Verify**
   - Compare with Flutter
   - Check counts
   - Verify all features work

---

## 📊 **FLUTTER ENDPOINTS SUMMARY:**

```
✅ Edge Functions (prefer these):
- /functions/v1/get-product-with-variants
- /functions/v1/getOrderWithItems
- /functions/v1/getCombo

⚠️ REST API (use when no Edge Function):
- /rest/v1/customers
- /rest/v1/vendor
- /rest/v1/purchase (with joins)
- /rest/v1/shipments
```

---

## 🎯 **NEXT ACTIONS:**

1. **Confirm:** Which screens to update first?
2. **Orders:** Update to use Edge Function
3. **Purchases:** Add proper joins
4. **Dashboard:** Use Edge Function totals
5. **Test:** All screens match Flutter

---

## 📝 **NOTES:**

- **Edge Functions** return `{ data, total }` - use for pagination
- **REST API** returns array directly - count with `{ count: 'exact' }`
- **Joins** in REST API use syntax: `table(*,nested(*))`
- **Flutter** is source of truth for ALL data structures

---

**Which screen should I update first?**

A) Orders (Edge Function)
B) Purchases (Add joins)
C) Dashboard counts (Use Edge Functions)
D) All of the above sequentially

Let me know and I'll implement!

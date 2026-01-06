# ✅ QUERIES SYSTEM - SCHEMA CONFIRMED & FIXES

## 🎯 **Schema Analysis:**

### **✅ Queries Table - Correct!**
```sql
CREATE TABLE public.queries (
  query_id bigint GENERATED ALWAYS AS IDENTITY,
  customer_id bigint,
  name character varying,
  mobile_number character varying NOT NULL,
  email character varying,
  message text NOT NULL,
  status character varying NOT NULL DEFAULT 'Open',
  created_at timestamp with time zone,
  priority text,
  order_id text,
  remarks text,
  source character varying CHECK (source IN ('Email', 'WhatsApp', 'Phone')),
  is_escalated boolean DEFAULT false,
  escalated_ticket_id bigint,
  ...
);
```

### **❌ Issue Found: Type Mismatch**

**Problem:**
```sql
-- queries table
query_id: BIGINT ✅

-- query_messages table
query_id: INTEGER ❌  (Should be BIGINT!)
```

**This causes:**
- JOIN errors between queries and query_messages
- Potential data loss for IDs > 2,147,483,647

---

## 🔧 **Fixes Required:**

### **1. Fix query_messages Column Type**

Run this SQL in Supabase:

```sql
ALTER TABLE query_messages 
ALTER COLUMN query_id TYPE bigint;
```

### **2. Add Test Data**

The table is currently **EMPTY** (0 records). Add test data:

```sql
INSERT INTO queries (
    customer_id, name, mobile_number, email, 
    message, status, source, priority, created_at
) VALUES 
    (299, 'Surendar', '9787094776', NULL, 
     'Where is my order 10G115', 'Open', 'Phone', 'High', NOW()),
    (317, 'Arun', '9741804752', NULL, 
     'Chain Venum', 'Open', 'Email', 'Medium', NOW()),
    (NULL, 'Test Customer', '9876543210', 'test@example.com', 
     'Delivery delayed', 'In Progress', 'WhatsApp', 'High', NOW());
```

### **3. Verify**

```sql
SELECT COUNT(*) FROM queries;
SELECT * FROM queries ORDER BY created_at DESC LIMIT 5;
```

---

## ✅ **Other Tables - Confirmed Correct:**

### **Tickets Table** ✅
```sql
ticket_id: integer (Primary Key)
query_id: bigint ✅ (References queries.query_id)
customer_id: bigint ✅
```

### **Query Conversations** ✅
```sql
conversation_id: integer
query_id: bigint ✅ (References queries.query_id)
```

### **Ticket Conversations** ✅
```sql
conversation_id: integer  
ticket_id: bigint ✅ (References tickets.ticket_id)
```

---

## 🎯 **Action Plan:**

1. **Run the fix SQL:**
   - Open Supabase SQL Editor
   - Run: `fix_queries_and_add_data.sql`
   - This fixes type mismatch and adds 5 test queries

2. **Refresh the queries page:**
   - Navigate to: `http://localhost:3000/dashboard/queries`
   - You should see 5 test queries appear!

3. **Test features:**
   - ✅ View queries in table
   - ✅ Search queries
   - ✅ Click "Add Query" to add phone queries
   - ✅ Change status
   - ✅ View conversations

---

## 📊 **Expected Result:**

After running the SQL, your queries page should show:

| Source | ID | Name | Contact | Status | Priority | Message |
|--------|--- |------|---------|--------|----------|---------|
| ☎️ Phone | 1 | Surendar | 9787... | Open | High | Where is my... |
| 📧 Email | 2 | Arun | 9741... | Open | Medium | Chain Venum |
| 📱 WhatsApp | 3 | Test Customer | 9876... | In Progress | High | Delivery... |

---

## ✅ **After This:**

All 3 sources will work:
- 📧 **Email** - Auto-imported (you can add manually for testing)
- 📱 **WhatsApp** - Auto-imported (you can add manually for testing)
- ☎️ **Phone** - Manual entry via "Add Query" button ✅

**Run the SQL script and refresh the page!** 🚀

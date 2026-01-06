# Queries Screen Implementation Summary

## ✅ Navigation Updated

**Sidebar order now:**
1. Dashboard
2. Orders
3. Customers
4. Products
5. Vendors
6. **Shipments**
7. **Queries** ⬅️ Moved here!
8. Returns
9. Combos
10. Purchases
11. Banners

---

## 📋 Queries Screen Features (From Flutter)

### Table Columns:
1. ☑️ **Checkbox** - Multi-select rows
2. **Ticket ID** - TKT-{id} with blue badge
3. **Customer Name** - Clickable to copy
4. **Source** - WhatsApp (green) or Email (blue) icon
5. **Contact** - Mobile + Email
6. **Status** - Chip (Open/In Progress/Resolved/Closed) - Clickable to change
7. **Priority** - High/Medium/Low chip
8. **Order ID** - Clickable to view order details
9. **Actions** - Conversation viewer, Edit, Delete

### Status Colors:
- **Open** → Red
- **In Progress** → Orange
- **Resolved** → Green
- **Closed** → Grey

### Priority Logic:
- Has Order ID → **High**
- No Order ID → **Medium**

### Features:
1. ✅ Search by name, mobile, email, status, order ID, message
2. ✅ Pagination with rows per page (5, 10, 25, 50)
3. ✅ Export selected to Excel
4. ✅ Add new query
5. ✅ Edit query (Admin only)
6. ✅ Delete query (Admin/bulk delete)
7. ✅ Change status (Admin/Manager)
8. ✅ View/Edit remarks
9. ✅ Conversation dialog (WhatsApp/Email threads)
10. ✅ Order details dialog
11. ✅ Copy to clipboard (name, mobile)

### Role-Based Permissions:
- **Executive:** View only, can view conversations
- **Manager:** View + Change status + Reply to conversations
- **Admin:** Full access (Edit, Delete, Status, Add)

---

## 📊 Database Structure

### `queries` Table:
```sql
CREATE TABLE queries (
  query_id SERIAL PRIMARY KEY,
  customer_id BIGINT REFERENCES customers(customer_id),
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  customer_email TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'Open',
  order_id TEXT,
  priority TEXT DEFAULT 'Medium',
  remarks TEXT,
  source TEXT DEFAULT 'Email', -- 'WhatsApp' or 'Email'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `query_conversations` Table:
```sql
CREATE TABLE query_conversations (
  conversation_id SERIAL PRIMARY KEY,
  query_id BIGINT REFERENCES queries(query_id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'Customer' or 'Admin'
  sender_name TEXT,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎨 Key UI Components

### 1. Queries Table
Matches Flutter with:
- Blue TKT-ID badges
- Source icons (WhatsApp green, Email blue)
- Status chips (colored by status)
- Priority chips  
- Clickable order IDs
- Premium gradient conversation button

### 2. Status Change Dialog
Radio buttons for:
- Open
- In Progress
- Resolved
- Closed

### 3. Add/Edit Dialog
Fields:
- Name *
- Mobile *
- Email
- Message *
- Order ID
- Auto-calculated priority

### 4. Conversation Dialog
- Shows all messages in thread
- Customer messages (left)
- Admin replies (right)
- Reply textarea (Admin/Manager only)
- Send via WhatsApp or Email

### 5. Remarks Editor
Simple textarea to edit internal notes

---

## 🚀 Implementation Files Needed

### 1. Types (`types/queries.ts`)
```typescript
- Query interface
- QueryConversation interface
- QueryStatus type
- QueryPriority type
```

### 2. Service (`lib/services/queries.service.ts`)
```typescript
- fetchQueries()
- addQuery()
- updateStatus()
- updateMessage()
- updateRemarks()
- deleteQuery()
- fetchConversations()
- addConversation()
```

### 3. Page (`app/dashboard/queries/page.tsx`)
Main queries screen with all features

### 4. Dialog Component (`components/queries/conversation-dialog.tsx`)
Conversation viewer and reply interface

---

## 🎯 Next Steps

Due to the comprehensive nature of the Queries screen (1200+ lines in Flutter), I recommend creating it in phases:

**Phase 1:** Basic table with data ✅
- Types
- Service
- Main page with table
- Search and pagination

**Phase 2:** Dialogs ✅
- Add/Edit query
- Status change
- Remarks editor

**Phase 3:** Advanced ✅
- Conversation dialog
- Order details integration
- Export to Excel
- Role-based permissions

---

## 💡 Quick Start

**Would you like me to:**
1. Create the complete Queries implementation now? (All features)
2. Create it in phases? (Start with Phase 1)
3. Focus on a specific feature first?

The queries screen is feature-rich with:
- 11 table columns
- 4 dialogs
- Role-based access
- Conversation threads
- Order integration

Let me know and I'll create whichever approach you prefer! 🚀

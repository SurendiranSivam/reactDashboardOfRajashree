# 📞 Customer Support System - Two-Tier Design

## 🎯 System Overview

This is a **two-tier customer support system** with escalation workflow:

```
┌──────────────────────────────────────┐
│         TIER 1: QUERIES              │
│  (Simple inquiries & questions)      │
└───────────────┬──────────────────────┘
                │
                │ Escalate if serious
                ↓
┌──────────────────────────────────────┐
│         TIER 2: TICKETS              │
│  (Serious issues - Team handling)    │
└──────────────────────────────────────┘
```

---

## 📥 **Query Sources (3 Sources)**

### **1. Email (Automated)** 📧
- **How it works:** Customer fills contact form on website
- **Action:** System automatically creates query in database
- **Source field:** `'Email'`
- **Priority:** Auto-set based on order_id

### **2. WhatsApp (Automated)** 📱
- **How it works:** Customer sends message via WhatsApp chatbot
- **Action:** Chatbot integration auto-creates query
- **Source field:** `'WhatsApp'`
- **Priority:** Auto-set

### **3. Phone/Call (Manual)** ☎️
- **How it works:** Customer calls helpline
- **Action:** **Customer Service Executive manually adds query**
- **Source field:** `'Phone'`
- **Priority:** Set by executive
- **Button:** "Add Query" in dashboard

---

## 🔄 **Complete Workflow**

### **Step 1: Query Creation**

```sql
INSERT INTO queries (
  name, mobile_number, email, message,
  source,  -- 'Email', 'WhatsApp', or 'Phone'
  status,  -- 'Open' (default)
  priority -- Auto or manual
)
```

**Query appears in Queries table**

### **Step 2: Customer Service Reviews**

Executive can:
- ✅ View query details
- ✅ **Click customer name → View full customer details**
  - Total orders
  - Total spent
  - Address
  - Order history
  - Previous queries/tickets
- ✅ Add conversation replies
- ✅ Update status (Open → In Progress → Resolved → Closed)
- ✅ Add remarks (internal notes)

### **Step 3: Escalation Decision**

**If query is simple:**
- Resolve directly
- Status → 'Resolved' → 'Closed'
- Query stays in Queries table

**If query is SERIOUS:**
- Click "Escalate to Ticket" button
- Escalation dialog opens

### **Step 4: Escalation Process**

**Escalation Dialog:**
```
┌─────────────────────────────────────┐
│  Escalate Query #123 to Ticket     │
├─────────────────────────────────────┤
│ Ticket Subject: ___________________│
│ Category: [Dropdown]               │
│   - Order Issue                    │
│   - Product Complaint              │
│   - Delivery Problem               │
│   - Payment Issue                  │
│   - Technical Support              │
│   - Other                          │
│                                     │
│ Severity: [Dropdown]               │
│   - Critical (1-2 hours)           │
│   - High (4-8 hours)               │
│   - Medium (1-2 days)              │
│   - Low (3-5 days)                 │
│                                     │
│ Assign to: [Dropdown/Search]       │
│   - Support Team                   │
│   - Technical Team                 │
│   - Order Management Team          │
│                                     │
│ Description: ____________________  │
│ (Auto-filled from query message)   │
│                                     │
│ [Cancel]  [Create Ticket]          │
└─────────────────────────────────────┘
```

**On "Create Ticket":**
1. Creates new record in `tickets` table
2. Generates ticket number: `TKT-2026-001`
3. Updates query:
   - `is_escalated = TRUE`
   - `status = 'Escalated'`
   - `escalated_ticket_id = {ticket_id}`
4. Links query to ticket

### **Step 5: Ticket Handling**

**Ticket goes to assigned team/person**

**Ticket Workflow:**
```
New → Assigned → In Progress → Resolved → Closed
         ↓
    Pending Customer  (waiting for customer response)
         ↓
    Pending Internal  (waiting for internal info)
```

**Team can:**
- ✅ View full ticket details
- ✅ See original query that was escalated
- ✅ View customer details
- ✅ Add internal notes (not visible to customer)
- ✅ Update status
- ✅ Add resolution
- ✅ Close ticket

---

## 📊 **Data Structure**

### **Queries Table (Tier 1)**
```typescript
{
  query_id: 123,
  customer_id: 456,
  name: "John Doe",
  mobile_number: "+919876543210",
  email: "john@example.com",
  message: "My order hasn't arrived",
  status: "Open",              // Open, In Progress, Resolved, Closed, Escalated
  order_id: "ORD-001",
  priority: "High",             // High, Medium, Low
  source: "Phone",              // Email, WhatsApp, Phone ← NEW
  remarks: "Customer called helpline",
  is_escalated: false,          // ← NEW
  escalated_ticket_id: null,    // ← NEW
  created_at: "2026-01-03",
  updated_at: "2026-01-03"
}
```

### **Tickets Table (Tier 2)**
```typescript
{
  ticket_id: 789,
  query_id: 123,                // Link to original query
  customer_id: 456,
  ticket_number: "TKT-2026-001", // Auto-generated
  subject: "Missing order - urgent",
  description: "Customer order ORD-001 not delivered...",
  category: "Delivery Problem",
  severity: "High",              // Critical, High, Medium, Low
  status: "In Progress",
  assigned_to: "Logistics Team",
  assigned_department: "Operations",
  resolution: "Found package, will deliver tomorrow",
  escalated_by: "Rajesh Kumar",  // Who escalated
  created_at: "2026-01-03",
  resolved_at: "2026-01-04",
  closed_at: null
}
```

---

## 🎨 **UI Components**

### **1. Queries Table**

**New Button:** `[+ Add Query]` (for Phone source)

| ☑️ | Source | TKT-ID | Name | Contact | Status | Priority | Order | Actions |
|----|--------|--------|------|---------|--------|----------|-------|---------|
| ☑️ | 📧 | Q-123 | John | 9876... | Open | High | ORD-01 | 👁️ 💬 ⬆️ |
| ☑️ | 📱 | Q-124 | Mary | 9123... | Progress | Medium | - | 👁️ 💬 ⬆️ |
| ☑️ | ☎️ | Q-125 | Kumar | 8765... | Open | High | ORD-02 | 👁️ 💬 ⬆️ |

**Icons:**
- 📧 Email (Blue)
- 📱 WhatsApp (Green)
- ☎️ Phone (Orange) ← NEW

**Actions:**
- 👁️ View Details
- 💬 Conversation
- ⬆️ **Escalate to Ticket** (New button)

### **2. Customer Details Dialog**

**Triggered by:** Clicking customer name

```
┌──────────────────────────────────────┐
│  Customer: John Doe                  │
├──────────────────────────────────────┤
│ 📞 Mobile: +91 9876543210            │
│ 📧 Email: john@example.com           │
│ 📍 Address: 123 Main St, Mumbai      │
│                                       │
│ ┌────────────────────────────────┐  │
│ │ ORDER HISTORY                   │  │
│ ├────────────────────────────────┤  │
│ │ Total Orders: 15                │  │
│ │ Total Spent: ₹45,000            │  │
│ │ Last Order: 2 days ago          │  │
│ │ Status: Delivered               │  │
│ │                                  │  │
│ │ Recent Orders:                   │  │
│ │ - ORD-001: ₹3,500 (Delivered)   │  │
│ │ - ORD-002: ₹2,800 (Shipped)     │  │
│ └────────────────────────────────┘  │
│                                       │
│ ┌────────────────────────────────┐  │
│ │ SUPPORT HISTORY                 │  │
│ ├────────────────────────────────┤  │
│ │ Queries: 3 (2 resolved)         │  │
│ │ Tickets: 1 (closed)             │  │
│ │                                  │  │
│ │ Previous Issues:                 │  │
│ │ - Q-100: Size query (Closed)    │  │
│ │ - TKT-2025-050: Refund (Closed) │  │
│ └────────────────────────────────┘  │
│                                       │
│ [Close]                              │
└──────────────────────────────────────┘
```

### **3. Add Query Dialog (Manual - Phone)**

```
┌──────────────────────────────────────┐
│  Add Query (Phone Call)              │
├──────────────────────────────────────┤
│ Source: ● Phone  ○ Email  ○ WhatsApp│
│                                       │
│ Customer Name: _____________________ │
│ Mobile Number: _____________________ │
│ Email (optional): _________________  │
│                                       │
│ Order ID (if any): _________________│
│ Priority: [High/Medium/Low]          │
│                                       │
│ Message: _________________________  │
│ ____________________________________│
│ ____________________________________│
│                                       │
│ Remarks (internal): ________________│
│                                       │
│ [Cancel]  [Save Query]               │
└──────────────────────────────────────┘
```

### **4. Escalation Dialog**

```
┌──────────────────────────────────────┐
│  Escalate Query #123 to Ticket       │
├──────────────────────────────────────┤
│ Customer: John Doe                    │
│ Original Query: "Order not arrived"   │
│                                       │
│ Ticket Subject: ___________________  │
│                                       │
│ Category: [Dropdown]                  │
│ ├─ Order Issue                        │
│ ├─ Product Complaint                  │
│ ├─ Delivery Problem      ← Selected  │
│ ├─ Payment Issue                      │
│ ├─ Technical Support                  │
│ └─ Other                              │
│                                       │
│ Severity: [Dropdown]                  │
│ ├─ Critical (Immediate)               │
│ ├─ High (4-8 hours)      ← Selected  │
│ ├─ Medium (1-2 days)                  │
│ └─ Low (3-5 days)                     │
│                                       │
│ Assign to: [Dropdown]                 │
│ └─ Logistics Team        ← Selected  │
│                                       │
│ Description: _______________________  │
│ (auto-filled from query, can edit)    │
│                                       │
│ [Cancel]  [Create Ticket]             │
└──────────────────────────────────────┘
```

---

## 👥 **Role-Based Access**

### **Customer Service Executive**
- ✅ View all queries
- ✅ Add query (Phone source)
- ✅ Reply to conversations
- ✅ Update status
- ✅ Add remarks
- ✅ **Escalate to ticket**
- ✅ View customer details
- ❌ Delete queries
- ❌ Access ticket management (only concerned team)

### **Support Team/Manager**
- ✅ Everything Executive can do
- ✅ View tickets assigned to them
- ✅ Update ticket status
- ✅ Add internal notes
- ✅ Resolve tickets

### **Admin**
- ✅ Full access to everything
- ✅ Delete queries/tickets
- ✅ Assign tickets
- ✅ View all tickets
- ✅ Analytics & reports

---

## 📈 **Benefits of Two-Tier System**

1. **Organized**: Simple queries separate from complex tickets
2. **Efficient**: Quick resolution for simple issues
3. **Focused**: Serious issues get dedicated team attention
4. **Trackable**: Clear escalation path
5. **Metrics**: Separate KPIs for queries vs tickets

---

## ✅ **Implementation Files**

1. ✅ `types/queries.ts` - Complete types
2. ✅ `migrations/...queries_tickets_system.sql` - Database schema
3. ⏳ `lib/services/queries.service.ts` - Query operations
4. ⏳ `lib/services/tickets.service.ts` - Ticket operations
5. ⏳ `app/dashboard/queries/page.tsx` - Queries management
6. ⏳ `app/dashboard/tickets/page.tsx` - Tickets management
7. ⏳ `components/queries/add-query-dialog.tsx` - Manual addition
8. ⏳ `components/queries/escalate-dialog.tsx` - Escalation form
9. ⏳ `components/queries/customer-details-dialog.tsx` - Customer view

---

**Ready to implement?** Let me know if you want any adjustments! 🚀

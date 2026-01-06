# Returns & Combo Screens - Implementation Guide

## Phase 1: Returns Screen ✅

### Files Created:
1. ✅ `types/returns.ts` - Return types and statuses
2. ✅ `lib/services/returns.service.ts` - Complete API service
3. ⏳ `app/dashboard/returns/page.tsx` - Main returns page (NEXT)

### Returns Screen Features (Matching Flutter):

#### Table Columns:
- ✅ Checkbox (Select)
- ✅ Order ID
- ✅ Return Date
- ✅ Status (Inline dropdown edit)
- ✅ Reason (Read-only text, multi-line)
- ✅ Returned Items (Read-only text, multi-line)
- ✅ Refund Amount
- ✅ Actions (Edit, Delete)

#### Return Statuses:
- Requested (grey)
- Received (blue-grey)
- Inspecting (orange)
- Approved (blue)
- Rejected (red)
- Refund Initiated (teal)
- Refunded (green)
- Closed (purple)

#### Features:
- ✅ Search by Order ID / Status / Reason
- ✅ Pagination (10 items per page)
- ✅ Export to Excel button
- ✅ Add Return dialog
- ✅ Edit Return dialog (Status, Reason, Items)
- ✅ Delete with confirmation
- ✅ Inline status change via dropdown
- ✅ Row selection checkboxes

### Add Return Dialog Fields:
- Return ID (auto-generated or manual)
- Order ID
- Return Date (date picker)
- Status (dropdown)
- Reason / Problem Statement
- Returned Items
- Refund Amount

### Edit Return Dialog Fields:
- Status (dropdown)
- Reason / Problem Statement
- Returned Items

---

## Phase 2: Combo Screen ⏳

### Files To Create:
1. ⏳ `types/combo.ts` - Combo types
2. ⏳ `lib/services/combo.service.ts` - Combo API service
3. ⏳ `app/dashboard/combos/page.tsx` - Main combo page
4. ⏳ `components/combos/combo-form-dialog.tsx` - Add/Edit form

### Combo Screen Features (Matching Flutter):

#### Table Columns:
- Checkbox (Select all / individual)
- Image (Clickable to view full size)
- SKU (Clickable to view combo items)
- Name
- Price
- Quantity (combo quantity)
- Status (Active/Inactive toggle)
- Actions (Edit button)

#### Features:
- ✅ Search combos
- ✅ Server-side pagination
- ✅ Page size selector (5, 10, 25, 50)
- ✅ Export selected combos
- ✅ Add Combo button in header
- ✅ Image zoom dialog
- ✅ Combo details dialog (shows all items with stock status)
- ✅ Edit combo dialog
- ✅ Active/Inactive toggle

### Combo Details Dialog Shows:
- All items in the combo
- Each item's SKU
- Quantity per combo
- Current stock (Red if low, Green if adequate)
- Edit Combo button

### Combo Form Fields:
- SKU (unique)
- Name
- Price
- Combo Quantity
- Image URL
- Items (Multi-select product variants with quantity)

---

## Database Tables

### `returns` Table:
```sql
CREATE TABLE returns (
  return_id SERIAL PRIMARY KEY,
  order_id TEXT,
  return_date TIMESTAMP,
  status TEXT NOT NULL,
  reason TEXT,
  returned_items TEXT,
  refund_amount NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `combo` Table:
```sql
CREATE TABLE combo (
  combo_id SERIAL PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  combo_quantity INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `combo_items` Table:
```sql
CREATE TABLE combo_items (
  combo_item_id SERIAL PRIMARY KEY,
  combo_id INTEGER REFERENCES combo(combo_id) ON DELETE CASCADE,
  variant_id INTEGER REFERENCES product_variants(variant_id),
  quantity_per_combo INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Implementation Steps

### Step 1: Create Returns Page ⏳
Location: `/app/dashboard/returns/page.tsx`

Features to implement:
1. Data table with all columns
2. Search functionality
3. Pagination controls
4. Status dropdown (inline edit)
5. Add Return dialog
6. Edit Return dialog
7. Delete confirmation
8. Export to Excel

### Step 2: Create Combo Types ⏳
Location: `/types/combo.ts`

Interfaces needed:
- Combo
- ComboItem
- ComboFormData

### Step 3: Create Combo Service ⏳
Location: `/lib/services/combo.service.ts`

Methods needed:
- fetchCombos()
- addCombo()
- updateCombo()
- toggleStatus()
- Search combos

### Step 4: Create Combo Page ⏳
Location: `/app/dashboard/combos/page.tsx`

Features:
- Data table
- Image viewer dialog
- Combo details dialog
- Pagination
- Search

### Step 5: Create Combo Form Dialog ⏳
Location: `/components/combos/combo-form-dialog.tsx`

Fields:
- SKU input
- Name input
- Price input
- Quantity input
- Image URL input
- Items multi-select with quantities

---

## Next Actions

**I'll create the Returns page now, then the Combo screen.**

Ready to proceed?

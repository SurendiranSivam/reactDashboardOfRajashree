# Database Schema Reference

**Complete Database Schema for React Dashboard Integration**

---

## 📊 All Tables (32 Total)

### ✅ Currently Integrated (10 tables):
1. **queries** - Customer support tickets
2. **query_messages** - Ticket conversation history
3. **orders** - Customer orders
4. **order_items** - Order line items
5. **customers** - Customer data
6. **master_product** - Product catalog (base products)
7. **product_variants** - Product SKUs with pricing
8. **vendor** - Vendor information
9. **purchase** - Purchase orders
10. **purchase_items** - Purchase line items

### ⏳ Partially Integrated (5 tables):
11. **shipment_tracking** - Order shipments
12. **returns** - Product returns
13. **returns_progress** - Return status history
14. **combo** - Product bundles
15. **combo_items** - Bundle contents
16. **banners** - Website banners

### 📝 Ready for Integration (16 tables):
17. **addresses** - Customer shipping addresses
18. **categories** - Product categories
19. **subcategories** - Product subcategories
20. **cart** - Shopping cart
21. **cart_item** - Cart contents
22. **reviews** - Product reviews with sentiment
23. **payments** - Razorpay payment tracking
24. **users** - Internal staff (admin/executive)
25. **stock_ledger** - Inventory change history
26. **shipping_cost** - State-wise shipping rates
27. **product_catalogue_table** - Unified product view
28. **wishlist** - Customer wishlists
29. **wishlist_item** - Wishlist contents
30. **return_items** - Individual returned items
31. **logs** - System activity logs

---

## 🔧 Key Schema Corrections Needed

### 1. Banners Service - UUID Type
```typescript
// CURRENT (WRONG):
export interface Banner {
  banner_id: number; // ❌ Should be string (UUID)
}

// CORRECT:
export interface Banner {
  banner_id: string; // ✅ UUID type
  title: string;
  subtitle: string | null;
  image_url: string;
  redirect_url: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### 2. Vendor Service - Field Name
```typescript
// CURRENT (WRONG):
export interface Vendor {
  vendor_name: string; // ❌ Wrong field name
}

// CORRECT:
export interface Vendor {
  vendor_id: number;
  name: string; // ✅ Correct field name
  address: string;
  contact_number: string;
  contact_person: string | null;
  email: string | null;
  gst: string | null;
  payment_terms: string | null;
  bank_account: string | null;
  ifsc: string | null;
  pan_number: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### 3. Shipment Service - UUID Type
```typescript
// CURRENT (WRONG):
export interface Shipment {
  shipment_id: number; // ❌ Should be string (UUID)
}

// CORRECT:
export interface Shipment {
  shipment_id: string; // ✅ UUID type
  order_id: string;
  tracking_number: string | null;
  shipping_provider: string | null;
  tracking_url: string | null;
  shipping_status: string;
  shipped_date: string | null;
  delivered_date: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}
```

### 4. Combo Service - Numeric Type
```typescript
// CORRECT:
export interface Combo {
  combo_id: number; // numeric in DB
  name: string;
  description: string | null;
  image_url: string | null;
  combo_quantity: number;
  saleprice: number | null;
  regularprice: number | null;
  sku: string | null;
  is_active: boolean;
  subcategory_id: number | null;
  created_at: string;
  updated_at: string | null;
  combo_items?: ComboItem[];
}
```

### 5. Returns Progress - Table Name
```typescript
// CURRENT (WRONG):
// Using 'return_progress' table

// CORRECT:
// Should use 'returns_progress' table
export async function fetchReturnProgress(returnId: number): Promise<ReturnProgress[]> {
  const { data, error } = await supabase
    .from('returns_progress') // ✅ Correct table name
    .select('*')
    .eq('return_id', returnId)
    .order('created_at', { ascending: false });
  
  return data || [];
}
```

---

## 📋 Additional Tables to Implement

### High Priority (Customer Features):
```typescript
// 1. Categories & Subcategories
export interface Category {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Subcategory {
  subcategory_id: number;
  category_id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// 2. Reviews with Sentiment
export interface Review {
  review_id: string; // UUID
  variant_id: number;
  customer_id: number;
  rating: number; // 1-5
  status: boolean;
  summary: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  created_at: string;
}

// 3. Internal Users
export interface User {
  user_id: number;
  email: string;
  full_name: string | null;
  role: 'admin' | 'Executive'; // user_role enum
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 🎯 Implementation Priority

### Phase 1: Fix Type Mismatches (Immediate)
1. ✅ Update banners.service.ts - `banner_id` to string
2. ✅ Update vendors.service.ts - `vendor_name` to `name`
3. ✅ Update shipments.service.ts - `shipment_id` to string
4. ✅ Update returns.service.ts - table name to `returns_progress`

### Phase 2: Add Missing Core Features
1. Categories & Subcategories management
2. Product reviews display
3. Internal user authentication
4. Customer addresses management

### Phase 3: Advanced Features
1. Stock ledger tracking
2. Payment integration (Razorpay)
3. Shopping cart (if building customer portal)
4. Wishlist functionality

---

## 📝 Notes

- **UUID fields:** banner_id, shipment_id, cart_id, wishlist_id, review_id, payments.id
- **Numeric fields:** combo_id, prices, amounts
- **Generated IDs:** Most use `GENERATED ALWAYS AS IDENTITY`
- **Enums:** user_role (admin, Executive)
- **Constraints:** Ratings 1-5, stock_ledger change_type (IN/OUT)

---

**Total Tables:** 32  
**Currently Used:** 10  
**Type Corrections Needed:** 4  
**Additional Tables Available:** 16

This schema provides a **complete e-commerce platform** foundation! 🚀

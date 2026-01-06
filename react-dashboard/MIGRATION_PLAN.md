# Complete Flutter to React Migration Plan

## Database Tables Analysis

### Core Tables:
1. **queries** - Customer queries/tickets ✅
2. **query_messages** - Conversation history ✅
3. **orders** - Customer orders ✅
4. **order_items** - Order line items ✅
5. **customers** - Customer data ✅
6. **products** - Product catalog ✅
7. **product_variants** - Product variants (SKU, price, stock) ✅
8. **categories** - Product categories
9. **subcategories** - Product subcategories
10. **vendors** - Vendor information ⏳
11. **vendor_transactions** - Vendor payments ⏳
12. **purchase** - Purchase orders from vendors ⏳
13. **purchase_items** - Purchase order line items ⏳
14. **shipment_tracking** - Order shipments ⏳
15. **returns** - Product returns ⏳
16. **return_progress** - Return status tracking ⏳
17. **combo** - Product bundles ⏳
18. **combo_items** - Items in bundles ⏳
19. **banner** - Website banners ⏳

## Flutter Providers to Migrate:

### 1. QueriesProvider ✅ COMPLETE
- fetchQueries() ✅
- fetchQueryMessages() ✅
- sendReply() ✅
- updateQueryStatus() ✅
- updateQueryPriority() ✅
- findOrCreateTicket() ⏳

### 2. OrderProvider ✅ COMPLETE (Partial)
- fetchOrders() ✅
- fetchOrderItems() ✅
- updateOrderStatus() ✅
- fetchOrderJson() ⏳
- uploadInvoiceToSupabaseStorage() ⏳

### 3. CustomerProvider ✅ COMPLETE
- fetchCustomers() ✅

### 4. ProductProvider ✅ COMPLETE (Partial)
- fetchProducts() ✅
- fetchSubcategories() ⏳
- addProduct() ⏳
- updateProduct() ⏳
- adjustVariantStock() ✅
- fetchCategoriesWithSubcategories() ⏳

### 5. VendorProvider ⏳ TO IMPLEMENT
- fetchVendors()
- addVendor()
- toggleVendorStatus()
- fetchVendorTransactions()
- addVendorTransaction()
- fetchUnpaidInvoices()

### 6. PurchaseProvider ⏳ TO IMPLEMENT
- fetchPurchases()
- addPurchase()

### 7. ShipmentProvider ⏳ TO IMPLEMENT
- fetchShipments()
- updateTrackingNumber()
- sendShipmentStatus()

### 8. ReturnsProvider ⏳ TO IMPLEMENT
- fetchReturns()
- addReturn()
- updateStatus()
- updateReason()
- updateRefundAmount()
- addProgressNote()

### 9. ComboProvider ⏳ TO IMPLEMENT
- fetchCombos()
- addCombo()
- updateCombo()
- toggleStatus()

## Implementation Order:

### Phase 1: Data Layer ⏳
1. Create all service files
2. Create all TypeScript interfaces
3. Create all React Query hooks

### Phase 2: UI Components ⏳
1. Create reusable components (tables, modals, forms)
2. Create page-specific components
3. Implement forms with validation

### Phase 3: Pages ⏳
1. Complete all placeholder pages
2. Add CRUD operations
3. Add filters and search

### Phase 4: Advanced Features ⏳
1. File uploads (invoices, images)
2. WhatsApp integration
3. Email integration
4. Real-time subscriptions

---

## Files to Create:

### Services (lib/services/):
- vendors.service.ts ⏳
- purchases.service.ts ⏳
- shipments.service.ts ⏳
- returns.service.ts ⏳
- combos.service.ts ⏳
- banners.service.ts ⏳
- categories.service.ts ⏳

### Hooks (lib/hooks/):
- use-vendors.ts ⏳
- use-purchases.ts ⏳
- use-shipments.ts ⏳
- use-returns.ts ⏳
- use-combos.ts ⏳
- use-banners.ts ⏳
- use-categories.ts ⏳

### Components (components/):
- vendors/* ⏳
- purchases/* ⏳
- shipments/* ⏳
- returns/* ⏳
- combos/* ⏳
- shared/DataTable.tsx ⏳
- shared/FormDialog.tsx ⏳

### Pages (app/dashboard/):
- vendors/page.tsx ⏳
- purchases/page.tsx ⏳
- shipments/page.tsx ⏳
- returns/page.tsx ⏳
- combos/page.tsx ⏳
- banners/page.tsx ⏳

---

## Next: Full Implementation Starting Now...

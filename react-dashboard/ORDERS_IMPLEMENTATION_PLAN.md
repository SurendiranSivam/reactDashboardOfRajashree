# 📋 ORDERS SCREEN - COMPLETE IMPLEMENTATION PLAN

**Created:** December 31, 2025, 1:35 AM IST

---

## 🎯 **FLUTTER FEATURES TO IMPLEMENT:**

### **1. Data Fetching & Display** ✅
- [x] Fetch all orders from provider
- [x] Display in DataTable format
- [x] Show columns: Date, Order ID, Customer, Mobile, Amount, Source, Status, Shipment, Invoice, Payment

### **2. Search & Filters** ✅
- [x] Search by: mobile, source, order ID, customer name, address
- [x] Multi-select Status filter (processing, Completed, failed)
- [x] Multi-select Source filter (Website, WhatsApp)
- [x] Date picker filter
  
### **3. Pagination** ✅
- [x] Page size options: 10, 20, 50, 100
- [x] Previous/Next buttons
- [x] Page counter (Page X / Y)

### **4. Row Selection** ✅
- [x] Checkbox per row
- [x] Multi-select capability
- [x] Track selected order IDs

### **5. Bulk Actions** ✅
- [x] Generate Invoices (PDF merge)
- [x] Export to Excel
- [x] SKU Summary dialog

### **6. Order Details Dialog** ✅
- [x] Click Order ID to view details
- [x] Show customer info
- [x] Show shipping address
- [x] Show order items with SKU, variant, price
- [x] Show payment info

### **7. SKU Summary** ✅
- [x] Date picker for SKU summary
- [x] DataTable with: SKU, Variant, Qty Sold, Current Stock, Sale Price
- [x] Export SKU to Excel
- [x] Stock warning (red if stock \u003c sold)

### **8. External Links** ✅
- [x] Invoice PDF link (opens in new tab)
- [x] Razorpay payment link
- [x] Shipment status link (to tracking page)

---

## 📦 **DATA STRUCTURE:**

```typescript
interface Order {
  order_id: string;
  customer_id: string;
  created_at: string;
  total_amount: number;
  shipping_amount: number;
  source: string; // 'Website' | 'WhatsApp'
  order_status: string; // 'processing' | 'Completed' | 'failed'
  shipment_status: string | null;
  invoice_url: string | null;
  payment_transaction_id: string | null;
  payment_method: string;
  order_note: string;
  name: string;
  contact_number: string;
  shipping_address: string;
  shipping_state: string;
  
  // Joined data
  customer?: {
    customer_id: string;
    full_name: string;
    mobile_number: string;
    email: string;
  };
  
  order_items?: OrderItem[];
}

interface OrderItem {
  quantity: number;
  product_variants?: {
    sku: string;
    variant_name: string;
    saleprice: number;
  };
}

interface SkuSummary {
  sku: string;
  variant_name: string;
  total_qty: number;
  current_stock: number;
  saleprice: number;
}
```

---

## 🔧 **SERVICES NEEDED:**

### **1. Order Provider** (React)
```typescript
- fetchOrders(): Promise\u003cOrder[]\u003e
- fetchOrderItems(orderId): Promise\u003cOrderItem[]\u003e
- fetchOrderJson(orderId): Promise\u003cany\u003e
- uploadInvoiceToSupabaseStorage(data): Promise\u003cstring\u003e
```

### **2. Invoice Service**
```typescript
- generateInvoiceFromJson(orderData): Promise\u003cUint8Array\u003e
- mergePDFs(urls): Promise\u003cUint8Array\u003e
```

### **3. Excel Service**
```typescript
- exportToExcel(orders): Promise\u003cboolean\u003e
- exportSkuSummaryToExcel(skuData, date): Promise\u003cboolean\u003e
```

### **4. Dashboard Service** (already exists)
```typescript
- fetchDailySkuSummary(date): Promise\u003cSkuSummary[]\u003e
```

---

## 🎨 **UI COMPONENTS:**

### **Main Screen:**
1. Search bar
2. Filter chips (Status, Source, Date)
3. Action buttons (Invoice, Export, SKU Summary)
4. DataTable with all columns
5. Pagination controls

### **Dialogs:**
1. Order Details Modal
2. SKU Summary Modal
3. Multi-select Filter Modal

---

## 🚀 **IMPLEMENTATION STEPS:**

### **Phase 1: Data & Services** (Priority 1)
1. Create order types/interfaces
2. Create order provider/hook
3. Implement fetchOrders with joins
4. Implement fetchOrderItems

### **Phase 2: Main Table** (Priority 1)
1. DataTable with all columns
2. Row selection
3. Pagination controls
4. Search functionality

### **Phase 3: Filters** (Priority 2)
1. Multi-select Status filter
2. Multi-select Source filter
3. Date picker filter
4. Clear filters

### **Phase 4: Actions** (Priority 2)
1. Order details dialog
2. External links (invoice, payment, shipment)

### **Phase 5: Bulk Actions** (Priority 3)
1. Export to Excel
2. Generate & merge invoices
3. SKU Summary dialog
4. SKU Export to Excel

---

**Starting implementation now!** 🔨

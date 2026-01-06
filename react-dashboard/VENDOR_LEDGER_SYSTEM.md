# Vendor Ledger System - Professional Double-Entry Bookkeeping

## 🎯 System Overview

This implementation provides a **professional accounting ledger system** for tracking vendor transactions following double-entry bookkeeping principles.

---

## 📊 Database Architecture

### 1. New Table: `vendor_ledger`

```sql
CREATE TABLE vendor_ledger (
    ledger_id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE,
    transaction_type TEXT CHECK (IN ('DEBIT', 'CREDIT')),
    reference_type TEXT CHECK (IN ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'OPENING_BALANCE')),
    reference_id INTEGER, -- Links to purchase_id or payment_id
    debit_amount NUMERIC(10,2), -- Amount owed (purchases)
    credit_amount NUMERIC(10,2), -- Amount paid
    running_balance NUMERIC(10,2), -- Auto-calculated
    description TEXT,
    invoice_no TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Auto-Balance Calculation (Trigger)

```sql
CREATE FUNCTION calculate_vendor_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Get previous balance
    SELECT running_balance INTO prev_balance
    FROM vendor_ledger
    WHERE vendor_id = NEW.vendor_id
    ORDER BY ledger_id DESC LIMIT 1;
    
    -- Calculate: Balance = Previous + Debit - Credit  
    NEW.running_balance := COALESCE(prev_balance, 0) 
                          + NEW.debit_amount 
                          - NEW.credit_amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 3. View: `vendor_balances`

```sql
CREATE VIEW vendor_balances AS
SELECT 
    vendor_id,
    name,
    (SELECT running_balance FROM vendor_ledger 
     WHERE vendor_id = v.vendor_id 
     ORDER BY ledger_id DESC LIMIT 1) as current_balance,
    SUM(debit_amount) as total_purchases,
    SUM(credit_amount) as total_paid
FROM vendor v
LEFT JOIN vendor_ledger USING (vendor_id)
GROUP BY vendor_id;
```

---

## 🔄 Transaction Flow

### When Purchase is Created:

```typescript
// DEBIT Entry (Increases Liability)
{
  vendor_id: 1,
  transaction_type: 'DEBIT',
  reference_type: 'PURCHASE',
  reference_id: purchase_id,
  debit_amount: 10000,
  credit_amount: 0,
  description: 'Purchase Invoice: INV-001',
  invoice_no: 'INV-001'
}
// Result: Running Balance +10,000
```

### When Payment is Made:

```typescript
// CREDIT Entry (Decreases Liability)
{
  vendor_id: 1,
  transaction_type: 'CREDIT',
  reference_type: 'PAYMENT',
  reference_id: purchase_id, // Optional
  debit_amount: 0,
  credit_amount: 5000,
  description: 'Payment against Invoice INV-001',
  invoice_no: 'INV-001'
}
// Result: Running Balance -5,000 (now ₹5,000 due)
```

---

## 📝 Ledger Example

| ledger_id | Date | Type | Reference | Debit | Credit | Balance | Description |
|-----------|------|------|-----------|-------|--------|---------|-------------|
| 1 | 2026-01-01 | DEBIT | Purchase #123 | 10,000 | 0 | 10,000 | Invoice INV-001 |
| 2 | 2026-01-05 | CREDIT | Payment | 0 | 3,000 | 7,000 | Part Payment |
| 3 | 2026-01-10 | DEBIT | Purchase #124 | 5,000 | 0 | 12,000 | Invoice INV-002 |
| 4 | 2026-01-15 | CREDIT | Payment | 0 | 7,000 | 5,000 | Full Payment INV-001 |

**Current Balance: ₹5,000** (Amount still owed)

---

## 🔧 Integration Steps

### Step 1: Run Migration

```bash
# Apply the migration
psql -d your_db -f supabase/migrations/20260103000001_create_vendor_ledger.sql
```

### Step 2: Update Purchase Service

In `purchases-api.service.ts`, replace old `vendor_transactions` code with ledger:

```typescript
// After creating purchase, add ledger entry
await fetch(`${SUPABASE_URL}/rest/v1/vendor_ledger`, {
    method: 'POST',
    headers: { /*...*/ },
    body: JSON.stringify({
        vendor_id: purchaseData.vendor_id,
        transaction_date: purchaseData.invoice_date,
        transaction_type: 'DEBIT',
        reference_type: 'PURCHASE',
        reference_id: purchaseId,
        debit_amount: purchaseData.amount,
        credit_amount: 0,
        description: `Purchase Invoice: ${purchaseData.invoice_no}`,
        invoice_no: purchaseData.invoice_no,
    })
});
```

### Step 3: Update Vendor Details Page

Replace old vendor transaction service with new ledger service:

```typescript
import { vendorLedgerService } from '@/lib/services/vendor-ledger.service';

// Fetch ledger
const ledger = await vendorLedgerService.fetchVendorLedger(vendorId);

// Get balance
const balance = await vendorLedgerService.getVendorBalance(vendorId);

// Record payment
await vendorLedgerService.recordPayment({
    vendor_id: vendorId,
    amount: 5000,
    description: 'Payment against INV-001',
    purchase_id: 123,
    invoice_no: 'INV-001'
});
```

---

## 📊 Vendor Details Page UI

### Balance Summary Cards:
```tsx
<Card>
  <CardContent>
    <div>Current Balance</div>
    <div className="text-2xl font-bold text-red-600">
      ₹{balance.current_balance.toLocaleString()}
    </div>
  </CardContent>
</Card>

<Card>
  <CardContent>
    <div>Total Purchases</div>
    <div className="text-2xl font-bold">
      ₹{balance.total_purchases.toLocaleString()}
    </div>
  </CardContent>
</Card>

<Card>
  <CardContent>
    <div>Total Paid</div>
    <div className="text-2xl font-bold text-green-600">
      ₹{balance.total_paid.toLocaleString()}
    </div>
  </CardContent>
</Card>
```

### Ledger Table:
```tsx
<table>
  <thead>
    <tr>
      <th>Date</th>
      <th>Type</th>
      <th>Invoice</th>
      <th>Debit</th>
      <th>Credit</th>
      <th>Balance</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    {ledger.map(entry => (
      <tr>
        <td>{formatDate(entry.transaction_date)}</td>
        <td>
          <span className={entry.transaction_type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}>
            {entry.transaction_type}
          </span>
        </td>
        <td>{entry.invoice_no || '-'}</td>
        <td className="text-right text-red-600">
          {entry.debit_amount > 0 ? `₹${entry.debit_amount.toLocaleString()}` : '-'}
        </td>
        <td className="text-right text-green-600">
          {entry.credit_amount > 0 ? `₹${entry.credit_amount.toLocaleString()}` : '-'}
        </td>
        <td className="text-right font-bold">
          ₹{entry.running_balance.toLocaleString()}
        </td>
        <td>{entry.description}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## ✅ Benefits of This System

1. ✅ **Accurate Balance Tracking** - Auto-calculated running balance
2. ✅ **Audit Trail** - Every transaction is recorded
3. ✅ **Double-Entry Principles** - DEBIT/CREDIT system
4. ✅ **Invoice Linking** - Track payments against specific invoices
5. ✅ **Historical Ledger** - Complete transaction history
6. ✅ **Data Integrity** - Database triggers ensure correctness
7. ✅ **Flexible** - Support for adjustments and opening balances
8. ✅ **Professional** - Follows accounting standards

---

## 🔍 Key Differences from Old System

| Old System | New Ledger System |
|-----------|-------------------|
| Stores `amount_paid` + `balance_amount` per record | Stores `debit` OR `credit` per transaction |
| Balance calculated in frontend | Balance auto-calculated via trigger |
| No transaction type | Clear DEBIT/CREDIT types |
| Limited audit trail | Complete chronological ledger |
| Hard to reconcile | Easy to audit and reconcile |

---

## 📁 Files Created

1. ✅ `supabase/migrations/20260103000001_create_vendor_ledger.sql`
2. ✅ `types/vendor-ledger.ts`
3. ✅ `lib/services/vendor-ledger.service.ts`
4. ⏳ Update `lib/services/purchases-api.service.ts` (line 160-180)
5. ⏳ Update `app/dashboard/vendors/[id]/page.tsx`

---

## 🚀 Next Actions

1. **Run the migration** to create `vendor_ledger` table
2. **Update purchases service** to use ledger instead of old transactions
3. **Update vendor details page** to show proper ledger
4. **Test the flow**: Create purchase → Check ledger → Make payment → Verify balance
5. **Migrate existing data** (if any) from `vendor_transactions` to `vendor_ledger`

---

**This is the industry-standard way to handle accounting transactions!** 🎯

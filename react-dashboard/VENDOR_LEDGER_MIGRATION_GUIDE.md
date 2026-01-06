# Vendor Transactions → Vendor Ledger Migration Guide

## 🎯 Overview

You have an existing `vendor_transactions` table. We're migrating to a professional **double-entry ledger system** (`vendor_ledger`) while preserving all your existing data.

---

## 📊 What Changes?

### Old Structure (`vendor_transactions`):
```sql
transaction_id, vendor_id, purchase_id,
amount_paid, balance_amount,  -- ❌ Redundant, calculated fields
transaction_date, comment
```

### New Structure (`vendor_ledger`):
```sql
ledger_id, vendor_id, transaction_date,
transaction_type (DEBIT/CREDIT),  -- ✅ Professional accounting
reference_type (PURCHASE/PAYMENT/ADJUSTMENT),
debit_amount, credit_amount,
running_balance,  -- ✅ Auto-calculated via trigger
description, invoice_no
```

---

## 🔄 Migration Strategy (Safe & Reversible)

### Phase 1: Create New Table ✅
- Creates `vendor_ledger` table alongside existing `vendor_transactions`
- Both tables coexist during transition
- Zero downtime

### Phase 2: Migrate Data ✅
The migration function converts old records to new format:

```sql
Old Record:
  purchase_id: 123
  amount_paid: 5000
  balance_amount: 5000 (out of 10000 total)

Converts To:
1. DEBIT Entry (Purchase):
   debit_amount: 10000
   credit_amount: 0
   running_balance: 10000
   description: "Purchase Invoice INV-001"

2. CREDIT Entry (Payment):
   debit_amount: 0
   credit_amount: 5000
   running_balance: 5000
   description: "Payment against INV-001"
```

### Phase 3: Parallel Run (1-2 weeks)
- ✅ Old table still exists (backup)
- ✅ New table active
- ✅ Frontend uses new table
- ✅ Can rollback if needed

### Phase 4: Deprecate Old Table
- After confirming everything works
- Rename or drop `vendor_transactions`

---

## 🚀 Step-by-Step Execution

### Step 1: Backup First! 🔒
```sql
-- Already included in migration script
CREATE TABLE vendor_transactions_backup AS 
SELECT * FROM vendor_transactions;
```

### Step 2: Run Migration Script
```bash
# In Supabase SQL Editor or psql
psql -d your_database -f supabase/migrations/20260103000001_vendor_ledger_migration.sql
```

### Step 3: Execute Data Migration
```sql
-- Uncomment this line in the migration script and run
SELECT migrate_vendor_transactions_to_ledger();
```

This will:
- ✅ Read all `vendor_transactions` records
- ✅ Convert to DEBIT/CREDIT entries
- ✅ Calculate running balances
- ✅ Preserve purchase links
- ✅ Migrate comments and dates

### Step 4: Verify Migration
```sql
-- Check record counts
SELECT 
    'vendor_transactions' as table_name,
    COUNT(*) as record_count
FROM vendor_transactions
UNION ALL
SELECT 
    'vendor_ledger' as table_name,
    COUNT(*) as record_count
FROM vendor_ledger;

-- Check balances match
SELECT 
    vendor_id,
    name,
    current_balance
FROM vendor_balances
ORDER BY current_balance DESC;

-- Compare with old system
SELECT 
    vt.vendor_id,
    MAX(vt.balance_amount) as old_balance,
    vb.current_balance as new_balance
FROM vendor_transactions vt
JOIN vendor_balances vb ON vb.vendor_id = vt.vendor_id
GROUP BY vt.vendor_id, vb.current_balance;
```

### Step 5: Update Application Code

**Already created for you:**
- ✅ `types/vendor-ledger.ts` - New types
- ✅ `lib/services/vendor-ledger.service.ts` - New service
- ✅ Updated vendor details page to use ledger

**You need to update:**
- `lib/services/purchases-api.service.ts` - Change line 160-180 to create ledger entry

**Old code (in purchases service):**
```typescript
// ❌ OLD - Delete this
await fetch(`${SUPABASE_URL}/rest/v1/vendor_transactions`, {
    body: JSON.stringify({
        vendor_id: purchaseData.vendor_id,
        purchase_id: purchaseId,
        amount_paid: 0,
        balance_amount: purchaseData.amount,
        transaction_date: new Date().toISOString(),
    }),
});
```

**New code:**
```typescript
// ✅ NEW - Use this
await fetch(`${SUPABASE_URL}/rest/v1/vendor_ledger`, {
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
    }),
});
```

### Step 6: Test Everything

1. **View Vendor Details:**
   - Navigate to any vendor
   - Check ledger displays correctly
   - Verify balance is accurate

2. **Create New Purchase:**
   - Add a new purchase
   - Check DEBIT entry created in ledger
   - Verify running balance updated

3. **Record Payment:**
   - Make a payment against invoice
   - Check CREDIT entry created
   - Verify balance decreased

4. **Check Outstanding Invoices:**
   - Use the `outstanding_invoices` view
   - Verify unpaid amounts are correct

---

## 📊 New Features Available

### 1. Professional Ledger View
```sql
SELECT * FROM vendor_ledger 
WHERE vendor_id = 1 
ORDER BY ledger_id DESC;
```

### 2. Instant Balance Query
```sql
SELECT * FROM vendor_balances 
WHERE vendor_id = 1;
```

### 3. Outstanding Invoices
```sql
SELECT * FROM outstanding_invoices 
WHERE vendor_id = 1;
```

### 4. Adjustments
```sql
-- Can now record adjustments, opening balances, etc.
INSERT INTO vendor_ledger (
    vendor_id, transaction_type, reference_type,
    debit_amount, description
) VALUES (
    1, 'DEBIT', 'ADJUSTMENT',
    500, 'Price correction for damaged goods'
);
```

---

## ⚠️ Important Notes

### DO NOT Delete Old Table Immediately
- ✅ Keep `vendor_transactions` for 2 weeks minimum
- ✅ Already backed up to `vendor_transactions_backup`
- ✅ Can rollback if issues arise

### Auto-Balance Calculation
- ✅ Running balance automatically calculated
- ✅ Database trigger ensures accuracy
- ✅ No manual calculation needed

### Data Integrity
- ✅ Foreign keys preserved
- ✅ All constraints in place
- ✅ Check constraints prevent negative amounts

---

## 🔍 Troubleshooting

### Problem: Balances Don't Match
```sql
-- Find discrepancies
SELECT 
    vt.vendor_id,
    MAX(vt.balance_amount) as old_balance,
    vb.current_balance as new_balance,
    MAX(vt.balance_amount) - vb.current_balance as difference
FROM vendor_transactions vt
JOIN vendor_balances vb ON vb.vendor_id = vt.vendor_id
GROUP BY vt.vendor_id, vb.current_balance
HAVING ABS(MAX(vt.balance_amount) - vb.current_balance) > 0.01;
```

### Problem: Missing Transactions
```sql
-- Count transactions per vendor
SELECT 
    vendor_id,
    COUNT(*) as old_count
FROM vendor_transactions
GROUP BY vendor_id
ORDER BY vendor_id;

SELECT 
    vendor_id,
    COUNT(*) as new_count
FROM vendor_ledger
GROUP BY vendor_id
ORDER BY vendor_id;
```

---

## 📁 Files Reference

1. ✅ Migration SQL: `supabase/migrations/20260103000001_vendor_ledger_migration.sql`
2. ✅ Types: `types/vendor-ledger.ts`
3. ✅ Service: `lib/services/vendor-ledger.service.ts`
4. ⏳ Update: `lib/services/purchases-api.service.ts` (line 160-180)
5. ⏳ Update: `app/dashboard/vendors/[id]/page.tsx`

---

## ✅ Benefits After Migration

1. ✅ **Professional** - Follows accounting standards
2. ✅ **Accurate** - Auto-calculated balances
3. ✅ **Auditable** - Complete transaction history
4. ✅ **Flexible** - Support adjustments, opening balances
5. ✅ **Clear** - DEBIT/CREDIT instead of confusing fields
6. ✅ **Linked** - Track payments to specific invoices
7. ✅ **Fast** - Indexed queries, materialized views

---

**Ready to migrate? Follow the steps above!** 🚀

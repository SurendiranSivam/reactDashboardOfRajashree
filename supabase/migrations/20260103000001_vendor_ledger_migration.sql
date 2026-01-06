-- ============================================
-- VENDOR LEDGER MIGRATION SCRIPT
-- Migrates from vendor_transactions to vendor_ledger
-- Safe migration: Keeps old table, creates new one
-- ============================================

-- Step 1: Create the new vendor_ledger table
CREATE TABLE IF NOT EXISTS vendor_ledger (
    ledger_id SERIAL PRIMARY KEY,
    vendor_id BIGINT NOT NULL REFERENCES vendor(vendor_id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('DEBIT', 'CREDIT')),
    reference_type TEXT NOT NULL CHECK (reference_type IN ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'OPENING_BALANCE')),
    reference_id BIGINT NULL,
    debit_amount NUMERIC(10,2) DEFAULT 0 CHECK (debit_amount >= 0),
    credit_amount NUMERIC(10,2) DEFAULT 0 CHECK (credit_amount >= 0),
    running_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    invoice_no TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_vendor ON vendor_ledger(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_date ON vendor_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_reference ON vendor_ledger(reference_type, reference_id);

-- Add comments
COMMENT ON TABLE vendor_ledger IS 'Professional double-entry ledger for vendor transactions';
COMMENT ON COLUMN vendor_ledger.debit_amount IS 'Amount owed to vendor (purchases)';
COMMENT ON COLUMN vendor_ledger.credit_amount IS 'Amount paid to vendor (payments)';
COMMENT ON COLUMN vendor_ledger.running_balance IS 'Balance = Previous + Debit - Credit';

-- ============================================
-- Step 2: Migrate existing data
-- ============================================

-- Create a function to migrate old transactions to new ledger
CREATE OR REPLACE FUNCTION migrate_vendor_transactions_to_ledger()
RETURNS void AS $$
DECLARE
    v_record RECORD;
    prev_balance NUMERIC(10,2);
    new_balance NUMERIC(10,2);
BEGIN
    -- Process each vendor
    FOR v_record IN 
        SELECT DISTINCT vendor_id 
        FROM vendor_transactions 
        ORDER BY vendor_id
    LOOP
        prev_balance := 0;
        
        -- Get all transactions for this vendor in chronological order
        FOR v_record IN
            SELECT 
                vt.vendor_id,
                vt.purchase_id,
                vt.transaction_date,
                vt.amount_paid,
                vt.balance_amount,
                vt.comment,
                p.invoice_no,
                p.amount as purchase_amount
            FROM vendor_transactions vt
            LEFT JOIN purchase p ON p.purchase_id = vt.purchase_id
            WHERE vt.vendor_id = v_record.vendor_id
            ORDER BY vt.transaction_date, vt.transaction_id
        LOOP
            -- If this is the first transaction for a purchase, create DEBIT for the purchase
            IF NOT EXISTS (
                SELECT 1 FROM vendor_ledger 
                WHERE vendor_id = v_record.vendor_id 
                AND reference_type = 'PURCHASE' 
                AND reference_id = v_record.purchase_id
            ) THEN
                -- Create DEBIT entry for purchase
                new_balance := prev_balance + COALESCE(v_record.purchase_amount, 0);
                
                INSERT INTO vendor_ledger (
                    vendor_id,
                    transaction_date,
                    transaction_type,
                    reference_type,
                    reference_id,
                    debit_amount,
                    credit_amount,
                    running_balance,
                    description,
                    invoice_no
                ) VALUES (
                    v_record.vendor_id,
                    v_record.transaction_date,
                    'DEBIT',
                    'PURCHASE',
                    v_record.purchase_id,
                    COALESCE(v_record.purchase_amount, 0),
                    0,
                    new_balance,
                    'Migrated: Purchase Invoice ' || COALESCE(v_record.invoice_no, v_record.purchase_id::TEXT),
                    v_record.invoice_no
                );
                
                prev_balance := new_balance;
            END IF;
            
            -- Create CREDIT entry for payment (if amount_paid > 0)
            IF v_record.amount_paid > 0 THEN
                new_balance := prev_balance - v_record.amount_paid;
                
                INSERT INTO vendor_ledger (
                    vendor_id,
                    transaction_date,
                    transaction_type,
                    reference_type,
                    reference_id,
                    debit_amount,
                    credit_amount,
                    running_balance,
                    description,
                    invoice_no
                ) VALUES (
                    v_record.vendor_id,
                    v_record.transaction_date,
                    'CREDIT',
                    'PAYMENT',
                    v_record.purchase_id,
                    0,
                    v_record.amount_paid,
                    new_balance,
                    COALESCE(
                        'Migrated: Payment - ' || v_record.comment,
                        'Migrated: Payment against ' || COALESCE(v_record.invoice_no, v_record.purchase_id::TEXT)
                    ),
                    v_record.invoice_no
                );
                
                prev_balance := new_balance;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- Execute migration (comment out after first run)
-- SELECT migrate_vendor_transactions_to_ledger();

-- ============================================
-- Step 3: Create trigger for auto-balance calculation
-- (Only for NEW entries, not for migrated data)
-- ============================================

CREATE OR REPLACE FUNCTION calculate_vendor_balance()
RETURNS TRIGGER AS $$
DECLARE
    prev_balance NUMERIC(10,2);
BEGIN
    -- Get the last balance for this vendor
    SELECT COALESCE(running_balance, 0) INTO prev_balance
    FROM vendor_ledger
    WHERE vendor_id = NEW.vendor_id
      AND ledger_id < COALESCE(NEW.ledger_id, 999999999)
    ORDER BY ledger_id DESC
    LIMIT 1;

    -- Calculate running balance: Previous + Debit - Credit
    NEW.running_balance := COALESCE(prev_balance, 0) + NEW.debit_amount - NEW.credit_amount;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_balance
    BEFORE INSERT ON vendor_ledger
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vendor_balance();

-- ============================================
-- Step 4: Create helpful views
-- ============================================

-- View: Current vendor balances
CREATE OR REPLACE VIEW vendor_balances AS
SELECT 
    v.vendor_id,
    v.name,
    COALESCE(
        (SELECT running_balance 
         FROM vendor_ledger 
         WHERE vendor_id = v.vendor_id 
         ORDER BY ledger_id DESC 
         LIMIT 1), 
        0
    ) AS current_balance,
    COALESCE(
        (SELECT SUM(debit_amount) 
         FROM vendor_ledger 
         WHERE vendor_id = v.vendor_id), 
        0
    ) AS total_purchases,
    COALESCE(
        (SELECT SUM(credit_amount) 
         FROM vendor_ledger 
         WHERE vendor_id = v.vendor_id), 
        0
    ) AS total_paid
FROM vendor v;

-- View: Outstanding invoices with amounts
CREATE OR REPLACE VIEW outstanding_invoices AS
SELECT 
    p.vendor_id,
    p.purchase_id,
    p.invoice_no,
    p.invoice_date,
    p.amount AS total_amount,
    COALESCE(
        (SELECT SUM(credit_amount) 
         FROM vendor_ledger 
         WHERE reference_type = 'PAYMENT' 
         AND reference_id = p.purchase_id), 
        0
    ) AS paid_amount,
    p.amount - COALESCE(
        (SELECT SUM(credit_amount) 
         FROM vendor_ledger 
         WHERE reference_type = 'PAYMENT' 
         AND reference_id = p.purchase_id), 
        0
    ) AS balance_amount
FROM purchase p
WHERE p.amount > COALESCE(
    (SELECT SUM(credit_amount) 
     FROM vendor_ledger 
     WHERE reference_type = 'PAYMENT' 
     AND reference_id = p.purchase_id), 
    0
);

-- ============================================
-- Step 5: Backup old table (optional but recommended)
-- ============================================

-- Create backup of old table
CREATE TABLE IF NOT EXISTS vendor_transactions_backup AS 
SELECT * FROM vendor_transactions;

COMMENT ON TABLE vendor_transactions_backup IS 'Backup of vendor_transactions before migration to vendor_ledger';

-- ============================================
-- MIGRATION VERIFICATION QUERIES
-- ============================================

-- Check if migration needed
-- SELECT 
--     'vendor_transactions' as table_name,
--     COUNT(*) as record_count
-- FROM vendor_transactions
-- UNION ALL
-- SELECT 
--     'vendor_ledger' as table_name,
--     COUNT(*) as record_count
-- FROM vendor_ledger;

-- Verify balances match
-- SELECT 
--     vt.vendor_id,
--     MAX(vt.balance_amount) as old_balance,
--     vb.current_balance as new_balance,
--     MAX(vt.balance_amount) - vb.current_balance as difference
-- FROM vendor_transactions vt
-- JOIN vendor_balances vb ON vb.vendor_id = vt.vendor_id
-- GROUP BY vt.vendor_id, vb.current_balance
-- HAVING MAX(vt.balance_amount) - vb.current_balance != 0;

-- ============================================
-- INSTRUCTIONS FOR EXECUTION
-- ============================================

/*
1. Run this entire script to create the new vendor_ledger table

2. Uncomment and run the migration function:
   SELECT migrate_vendor_transactions_to_ledger();

3. Verify the migration:
   SELECT * FROM vendor_balances;
   
4. Check for any discrepancies using verification queries above

5. Update your application code to use vendor_ledger instead of vendor_transactions

6. After confirming everything works (1-2 weeks), you can optionally:
   -- Rename old table
   ALTER TABLE vendor_transactions RENAME TO vendor_transactions_deprecated;
   
   -- Or drop it (be careful!)
   -- DROP TABLE vendor_transactions;

Note: Keep both tables for at least 2 weeks to ensure smooth transition
*/

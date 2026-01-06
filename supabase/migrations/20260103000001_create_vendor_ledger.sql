-- Drop old table if migrating
-- DROP TABLE IF EXISTS vendor_transactions;

-- Create proper vendor ledger table
CREATE TABLE IF NOT EXISTS vendor_ledger (
    ledger_id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendor(vendor_id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('DEBIT', 'CREDIT')),
    reference_type TEXT NOT NULL CHECK (reference_type IN ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'OPENING_BALANCE')),
    reference_id INTEGER NULL, -- purchase_id or payment_id
    debit_amount NUMERIC(10,2) DEFAULT 0 CHECK (debit_amount >= 0),
    credit_amount NUMERIC(10,2) DEFAULT 0 CHECK (credit_amount >= 0),
    running_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    invoice_no TEXT,
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_vendor ON vendor_ledger(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_date ON vendor_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_vendor_ledger_reference ON vendor_ledger(reference_type, reference_id);

-- Add comments for documentation
COMMENT ON TABLE vendor_ledger IS 'Double-entry ledger system for vendor transactions';
COMMENT ON COLUMN vendor_ledger.transaction_type IS 'DEBIT (purchase/liability increase) or CREDIT (payment/liability decrease)';
COMMENT ON COLUMN vendor_ledger.reference_type IS 'Type of source document: PURCHASE, PAYMENT, ADJUSTMENT, OPENING_BALANCE';
COMMENT ON COLUMN vendor_ledger.debit_amount IS 'Amount owed to vendor (purchases, adjustments up)';
COMMENT ON COLUMN vendor_ledger.credit_amount IS 'Amount paid to vendor (payments, adjustments down)';
COMMENT ON COLUMN vendor_ledger.running_balance IS 'Cumulative balance after this transaction (Balance = Previous + Debit - Credit)';

-- Function to calculate running balance
CREATE OR REPLACE FUNCTION calculate_vendor_balance()
RETURNS TRIGGER AS $$
DECLARE
    prev_balance NUMERIC(10,2);
BEGIN
    -- Get previous balance for this vendor
    SELECT COALESCE(running_balance, 0) INTO prev_balance
    FROM vendor_ledger
    WHERE vendor_id = NEW.vendor_id
      AND ledger_id < NEW.ledger_id
    ORDER BY ledger_id DESC
    LIMIT 1;

    -- Calculate new running balance
    -- Balance = Previous Balance + Debit - Credit
    NEW.running_balance := COALESCE(prev_balance, 0) + NEW.debit_amount - NEW.credit_amount;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate running balance
CREATE TRIGGER trg_calculate_balance
    BEFORE INSERT ON vendor_ledger
    FOR EACH ROW
    EXECUTE FUNCTION calculate_vendor_balance();

-- View to get vendor balances
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

COMMENT ON VIEW vendor_balances IS 'Current balance summary for all vendors';

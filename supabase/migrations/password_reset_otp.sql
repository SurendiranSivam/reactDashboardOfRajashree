-- ====================================
-- PASSWORD RESET OTP SYSTEM
-- ====================================

-- Create table for storing OTPs
CREATE TABLE IF NOT EXISTS password_reset_otps (
  otp_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_otps(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp ON password_reset_otps(otp);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_otps(expires_at);

-- Disable RLS for simplicity (or configure as needed)
ALTER TABLE password_reset_otps DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON password_reset_otps TO anon;
GRANT ALL ON password_reset_otps TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE password_reset_otps_otp_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE password_reset_otps_otp_id_seq TO authenticated;

-- Function to clean up old OTPs (optional, for cleanup)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_otps 
  WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Test the table
SELECT 'Password reset OTP table created successfully!' as status;

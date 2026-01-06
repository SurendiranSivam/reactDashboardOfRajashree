-- Clean up all old/expired OTP records
DELETE FROM password_reset_otps 
WHERE email = 'admin@rajashreefashion.com';

-- Or clean up ALL expired OTPs (optional)
DELETE FROM password_reset_otps 
WHERE expires_at < NOW() OR used = true;

-- Verify cleanup
SELECT * FROM password_reset_otps;

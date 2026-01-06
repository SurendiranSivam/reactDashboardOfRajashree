-- RUN THIS NOW IN SUPABASE SQL EDITOR
-- This will clean ALL old codes

DELETE FROM password_reset_otps;

-- Verify it's empty
SELECT COUNT(*) as total_codes FROM password_reset_otps;
-- Should show 0

-- Success message
SELECT 'Database cleaned! Now go to /forgot-password and request new code' as message;

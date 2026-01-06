-- Check if admin exists in Supabase Auth
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'admin@rajashreefashion.com';

-- If no results, user only exists in custom users table
-- Supabase Auth password reset won't work

-- Check custom users table
SELECT user_id, email, full_name, role, is_active
FROM users
WHERE email = 'admin@rajashreefashion.com';

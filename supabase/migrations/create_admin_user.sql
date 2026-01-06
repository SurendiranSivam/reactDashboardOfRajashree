-- ====================================
-- CREATE ADMIN USER FOR DASHBOARD
-- ====================================

-- First, check what enum values exist for user_role
-- SELECT enum_range(NULL::user_role);

-- Insert admin user (if not exists)
-- Using 'Executive' as the role in the users table (enum value)
-- The actual Admin permissions come from the user_roles table
INSERT INTO users (email, password, full_name, role, is_active)
VALUES (
  'admin@rajashreefashion.com',
  'Admin@123',  -- CHANGE THIS AFTER FIRST LOGIN!
  'Rajashree Admin',
  'Executive',  -- This is the enum value, actual admin role is in user_roles table
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  is_active = true;

-- Now assign the Admin role from the roles table
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT 
  u.user_id,
  r.role_id,
  u.user_id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'admin@rajashreefashion.com'
  AND r.role_name = 'Admin'
ON CONFLICT DO NOTHING;

-- Verify the user was created and has Admin role
SELECT 
  u.user_id, 
  u.email, 
  u.full_name, 
  u.role as user_table_role,
  u.is_active,
  r.role_name as assigned_role
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'admin@rajashreefashion.com';

-- ====================================
-- DEFAULT ADMIN CREDENTIALS
-- ====================================
-- Email: admin@rajashreefashion.com
-- Password: Admin@123
-- 
-- IMPORTANT: Change password after first login!
-- ====================================

-- ====================================
-- FIX ALL ISSUES - Run this in Supabase SQL Editor
-- ====================================

-- STEP 1: Check if user_role enum exists and what values it has
DO $$
BEGIN
    -- Try to add 'Admin' to user_role enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'user_role' AND e.enumlabel = 'Admin'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'Admin';
    END IF;
END $$;

-- STEP 2: Create/Update admin user
INSERT INTO users (email, password, full_name, role, is_active)
VALUES (
  'admin@rajashreefashion.com',
  'Admin@123',
  'Rajashree Admin',
  'Admin',  -- Now this should work
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = true;

-- STEP 3: Disable RLS on users table temporarily (for testing)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- STEP 4: Grant permissions
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;

-- STEP 5: Assign Admin role in user_roles table
DO $$
DECLARE
  admin_user_id BIGINT;
  admin_role_id INT;
BEGIN
  -- Get admin user ID
  SELECT user_id INTO admin_user_id 
  FROM users 
  WHERE email = 'admin@rajashreefashion.com' 
  LIMIT 1;
  
  -- Get Admin role ID
  SELECT role_id INTO admin_role_id 
  FROM roles 
  WHERE role_name = 'Admin';
  
  -- Assign if both exist
  IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    -- Delete existing role assignments for this user
    DELETE FROM user_roles WHERE user_id = admin_user_id;
    
    -- Insert new admin role
    INSERT INTO user_roles (user_id, role_id, assigned_by)
    VALUES (admin_user_id, admin_role_id, admin_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- STEP 6: Verify admin user was created
SELECT 
  u.user_id, 
  u.email, 
  u.full_name, 
  u.role as user_table_role,
  u.is_active,
  r.role_name as assigned_rbac_role
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'admin@rajashreefashion.com';

-- STEP 7: Show all enum values for user_role
SELECT e.enumlabel as role_name
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- ====================================
-- RESULT: You should see admin user with role 'Admin'
-- ====================================

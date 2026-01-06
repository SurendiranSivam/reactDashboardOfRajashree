-- ====================================
-- ALTERNATIVE FIX - If Admin enum doesn't exist
-- ====================================

-- Option 1: Use existing enum value
-- Check what enum values you actually have:
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role';

-- Option 2: Create admin user with 'Executive' but give them Admin role in RBAC
INSERT INTO users (email, password, full_name, role, is_active)
VALUES (
  'admin@rajashreefashion.com',
  'Admin@123',
  'Rajashree Admin',
  'Executive',  -- Use valid enum value
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  full_name = EXCLUDED.full_name,
  is_active = true,
  role = EXCLUDED.role;

-- Then assign Admin role via RBAC (this gives full permissions)
DO $$
DECLARE
  admin_user_id BIGINT;
  admin_role_id INT;
BEGIN
  SELECT user_id INTO admin_user_id FROM users WHERE email = 'admin@rajashreefashion.com';
  SELECT role_id INTO admin_role_id FROM roles WHERE role_name = 'Admin';
  
  IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    DELETE FROM user_roles WHERE user_id = admin_user_id;
    INSERT INTO user_roles (user_id, role_id, assigned_by)
    VALUES (admin_user_id, admin_role_id, admin_user_id);
  END IF;
END $$;

-- Verify
SELECT u.*, r.role_name as rbac_role
FROM users u
LEFT JOIN user_roles ur ON u.user_id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'admin@rajashreefashion.com';

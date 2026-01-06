-- ====================================
-- RBAC Schema - Simple Version (No RLS)
-- Run this version first to set up the structure
-- ====================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  permission_id SERIAL PRIMARY KEY,
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by BIGINT REFERENCES users(user_id),
  PRIMARY KEY (user_id, role_id)
);

-- 2. Insert Roles
INSERT INTO roles (role_name, description, is_system_role) VALUES
('Admin', 'Full system access', TRUE),
('Manager', 'Manage products and orders', TRUE),
('Executive', 'Process orders and queries', TRUE),
('Inventory', 'Manage stock', TRUE),
('Support', 'Handle queries', TRUE),
('Viewer', 'Read-only access', TRUE)
ON CONFLICT (role_name) DO NOTHING;

-- 3. Insert Permissions (Core modules only)
INSERT INTO permissions (permission_name, module, action, description) VALUES
-- Dashboard
('dashboard.view', 'dashboard', 'view', 'View dashboard'),
-- Products
('products.view', 'products', 'view', 'View products'),
('products.create', 'products', 'create', 'Add products'),
('products.update', 'products', 'update', 'Edit products'),
('products.delete', 'products', 'delete', 'Delete products'),
('products.export', 'products', 'export', 'Export products'),
-- Queries
('queries.view', 'queries', 'view', 'View queries'),
('queries.create', 'queries', 'create', 'Create queries'),
('queries.update', 'queries', 'update', 'Update queries'),
('queries.delete', 'queries', 'delete', 'Delete queries'),
('queries.export', 'queries', 'export', 'Export queries'),
-- Orders
('orders.view', 'orders', 'view', 'View orders'),
('orders.create', 'orders', 'create', 'Create orders'),
('orders.update', 'orders', 'update', 'Update orders'),
('orders.delete', 'orders', 'delete', 'Delete orders'),
('orders.export', 'orders', 'export', 'Export orders'),
-- Roles
('roles.view', 'roles', 'view', 'View roles'),
('roles.assign', 'roles', 'assign', 'Assign roles')
ON CONFLICT (permission_name) DO NOTHING;

-- 4. Assign permissions to Admin (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Admin'),
  permission_id
FROM permissions
ON CONFLICT DO NOTHING;

-- 5. Assign permissions to Manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Manager'),
  permission_id
FROM permissions
WHERE module IN ('dashboard', 'products', 'orders')
  AND action IN ('view', 'create', 'update', 'export')
ON CONFLICT DO NOTHING;

-- 6. Assign permissions to Executive
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Executive'),
  permission_id
FROM permissions
WHERE module IN ('dashboard', 'queries', 'orders')
  AND action IN ('view', 'create', 'update')
ON CONFLICT DO NOTHING;

-- 7. Create simple RPC functions (without permission checks for now)
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id BIGINT)
RETURNS TABLE (
  permission_name VARCHAR,
  module VARCHAR,
  action VARCHAR
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT DISTINCT
    p.permission_name,
    p.module,
    p.action
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.permission_id
  WHERE ur.user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION user_has_permission(p_user_id BIGINT, p_permission_name VARCHAR)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT EXISTS (
SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE ur.user_id = p_user_id
      AND p.permission_name = p_permission_name
  );
$$;

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);  
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- 9. Grant Admin role to admin user
DO $$
DECLARE
  admin_user_id BIGINT;
  admin_role_id INT;
BEGIN
  SELECT user_id INTO admin_user_id FROM users WHERE email = 'admin@rajashreefashion.com' LIMIT 1;
  SELECT role_id INTO admin_role_id FROM roles WHERE role_name = 'Admin';
  
  IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, assigned_by)
    VALUES (admin_user_id, admin_role_id, admin_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Done! Test with:
-- SELECT * FROM roles;
-- SELECT * FROM permissions;
-- SELECT * FROM get_user_permissions(1);

-- ====================================
-- RBAC (Role-Based Access Control) Schema
-- Rajashree Fashions Dashboard
-- Updated to work with existing 'users' table
-- ====================================

-- 1. Roles Table (for detailed permission-based roles)
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- Cannot be deleted if true
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  permission_id SERIAL PRIMARY KEY,
  permission_name VARCHAR(100) UNIQUE NOT NULL,
  module VARCHAR(50) NOT NULL, -- e.g., 'products', 'orders', 'queries'
  action VARCHAR(50) NOT NULL, -- e.g., 'view', 'create', 'update', 'delete'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Role-Permission Mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- 4. User-Role Mapping (extends existing users table)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by BIGINT REFERENCES users(user_id),
  PRIMARY KEY (user_id, role_id)
);

-- ====================================
-- Insert Default Roles (matching your user_role enum)
-- ====================================

INSERT INTO roles (role_name, description, is_system_role) VALUES
('Admin', 'Full system access - can manage everything including roles', TRUE),
('Manager', 'Can manage products, orders, and customers', TRUE),
('Executive', 'Can view and process orders and queries', TRUE),
('Inventory', 'Can manage products, purchases, and shipments', TRUE),
('Support', 'Can only view and respond to queries', TRUE),
('Viewer', 'Read-only access to all modules', TRUE)
ON CONFLICT (role_name) DO NOTHING;

-- ====================================
-- Insert Permissions
-- ====================================

-- Dashboard
INSERT INTO permissions (permission_name, module, action, description) VALUES
('dashboard.view', 'dashboard', 'view', 'View dashboard home page')
ON CONFLICT (permission_name) DO NOTHING;

-- Queries Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('queries.view', 'queries', 'view', 'View customer queries'),
('queries.create', 'queries', 'create', 'Create new queries'),
('queries.update', 'queries', 'update', 'Update query status and reply'),
('queries.delete', 'queries', 'delete', 'Delete queries'),
('queries.export', 'queries', 'export', 'Export queries data')
ON CONFLICT (permission_name) DO NOTHING;

-- Orders Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('orders.view', 'orders', 'view', 'View orders'),
('orders.create', 'orders', 'create', 'Create new orders'),
('orders.update', 'orders', 'update', 'Update order status'),
('orders.delete', 'orders', 'delete', 'Delete orders'),
('orders.export', 'orders', 'export', 'Export orders data')
ON CONFLICT (permission_name) DO NOTHING;

-- Customers Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('customers.view', 'customers', 'view', 'View customers'),
('customers.create', 'customers', 'create', 'Add new customers'),
('customers.update', 'customers', 'update', 'Update customer info'),
('customers.delete', 'customers', 'delete', 'Delete customers'),
('customers.export', 'customers', 'export', 'Export customers data')
ON CONFLICT (permission_name) DO NOTHING;

-- Products Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('products.view', 'products', 'view', 'View products'),
('products.create', 'products', 'create', 'Add new products'),
('products.update', 'products', 'update', 'Update product info'),
('products.delete', 'products', 'delete', 'Delete products'),
('products.adjust_stock', 'products', 'adjust_stock', 'Adjust product stock levels'),
('products.export', 'products', 'export', 'Export products data')
ON CONFLICT (permission_name) DO NOTHING;

-- Vendors Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('vendors.view', 'vendors', 'view', 'View vendors'),
('vendors.create', 'vendors', 'create', 'Add new vendors'),
('vendors.update', 'vendors', 'update', 'Update vendor info'),
('vendors.delete', 'vendors', 'delete', 'Delete vendors'),
('vendors.export', 'vendors', 'export', 'Export vendors data')
ON CONFLICT (permission_name) DO NOTHING;

-- Purchases Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('purchases.view', 'purchases', 'view', 'View purchases'),
('purchases.create', 'purchases', 'create', 'Add new purchases'),
('purchases.update', 'purchases', 'update', 'Update purchase info'),
('purchases.delete', 'purchases', 'delete', 'Delete purchases'),
('purchases.export', 'purchases', 'export', 'Export purchases data')
ON CONFLICT (permission_name) DO NOTHING;

-- Shipments Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('shipments.view', 'shipments', 'view', 'View shipments'),
('shipments.create', 'shipments', 'create', 'Create shipments'),
('shipments.update', 'shipments', 'update', 'Update shipment tracking'),
('shipments.delete', 'shipments', 'delete', 'Delete shipments'),
('shipments.export', 'shipments', 'export', 'Export shipments data')
ON CONFLICT (permission_name) DO NOTHING;

-- Returns Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('returns.view', 'returns', 'view', 'View returns'),
('returns.create', 'returns', 'create', 'Process new returns'),
('returns.update', 'returns', 'update', 'Update return status'),
('returns.delete', 'returns', 'delete', 'Delete returns'),
('returns.export', 'returns', 'export', 'Export returns data')
ON CONFLICT (permission_name) DO NOTHING;

-- Combos Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('combos.view', 'combos', 'view', 'View combos'),
('combos.create', 'combos', 'create', 'Create new combos'),
('combos.update', 'combos', 'update', 'Update combo info'),
('combos.delete', 'combos', 'delete', 'Delete combos'),
('combos.export', 'combos', 'export', 'Export combos data')
ON CONFLICT (permission_name) DO NOTHING;

-- Banners Module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('banners.view', 'banners', 'view', 'View banners'),
('banners.create', 'banners', 'create', 'Create new banners'),
('banners.update', 'banners', 'update', 'Update banner info'),
('banners.delete', 'banners', 'delete', 'Delete banners'),
('banners.export', 'banners', 'export', 'Export banners data')
ON CONFLICT (permission_name) DO NOTHING;

-- Role Management (Admin Only)
INSERT INTO permissions (permission_name, module, action, description) VALUES
('roles.view', 'roles', 'view', 'View roles and permissions'),
('roles.create', 'roles', 'create', 'Create new roles'),
('roles.update', 'roles', 'update', 'Update role permissions'),
('roles.delete', 'roles', 'delete', 'Delete roles'),
('roles.assign', 'roles', 'assign', 'Assign roles to users')
ON CONFLICT (permission_name) DO NOTHING;

-- ====================================
-- Assign Permissions to Roles
-- ====================================

-- ADMIN: Full access to everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Admin'),
  permission_id
FROM permissions
ON CONFLICT DO NOTHING;

-- MANAGER: Can manage products, orders, customers, vendors
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Manager'),
  permission_id
FROM permissions
WHERE module IN ('dashboard', 'products', 'orders', 'customers', 'vendors', 'purchases', 'shipments', 'returns', 'combos', 'banners')
  AND action IN ('view', 'create', 'update', 'export')
ON CONFLICT DO NOTHING;

-- EXECUTIVE: Orders and queries management (same as Sales)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Executive'),
  permission_id
FROM permissions
WHERE module IN ('dashboard', 'queries', 'orders', 'customers')
  AND action IN ('view', 'create', 'update', 'export')
ON CONFLICT DO NOTHING;

-- INVENTORY: Products, purchases, shipments
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Inventory'),
  permission_id
FROM permissions
WHERE module IN ('dashboard', 'products', 'vendors', 'purchases', 'shipments')
  AND action IN ('view', 'create', 'update', 'adjust_stock', 'export')
ON CONFLICT DO NOTHING;

-- SUPPORT: Only queries
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Support'),
  permission_id
FROM permissions
WHERE module IN ('dashboard', 'queries')
  AND action IN ('view', 'update')
ON CONFLICT DO NOTHING;

-- VIEWER: Read-only access
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT role_id FROM roles WHERE role_name = 'Viewer'),
  permission_id
FROM permissions
WHERE action = 'view'
ON CONFLICT DO NOTHING;

-- ====================================
-- RPC Functions for RBAC
-- ====================================

-- Get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id BIGINT)
RETURNS TABLE (
  permission_name VARCHAR,
  module VARCHAR,
  action VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.permission_name,
    p.module,
    p.action
  FROM user_roles ur
  JOIN role_permissions rp ON ur.role_id = rp.role_id
  JOIN permissions p ON rp.permission_id = p.permission_id
  WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id BIGINT,
  p_permission_name VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.permission_id
    WHERE ur.user_id = p_user_id
      AND p.permission_name = p_permission_name
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user roles with permissions
CREATE OR REPLACE FUNCTION get_user_roles_with_permissions(p_user_id BIGINT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'role_id', r.role_id,
      'role_name', r.role_name,
      'description', r.description,
      'permissions', (
        SELECT json_agg(
          json_build_object(
            'permission_name', p.permission_name,
            'module', p.module,
            'action', p.action
          )
        )
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE rp.role_id = r.role_id
      )
    )
  )INTO result
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.role_id
  WHERE ur.user_id = p_user_id;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Assign role to user (admin only)
CREATE OR REPLACE FUNCTION assign_role_to_user(
  p_user_id BIGINT,
  p_role_id INT,
  p_assigned_by BIGINT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if assigner has permission
  IF NOT user_has_permission(p_assigned_by, 'roles.assign') THEN
    RAISE EXCEPTION 'Insufficient permissions to assign roles';
  END IF;
  
  INSERT INTO user_roles (user_id, role_id, assigned_by)
  VALUES (p_user_id, p_role_id, p_assigned_by)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove role from user (admin only)
CREATE OR REPLACE FUNCTION remove_role_from_user(
  p_user_id BIGINT,
  p_role_id INT,
  p_removed_by BIGINT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if remover has permission
  IF NOT user_has_permission(p_removed_by, 'roles.assign') THEN
    RAISE EXCEPTION 'Insufficient permissions to remove roles';
  END IF;
  
  DELETE FROM user_roles
  WHERE user_id = p_user_id AND role_id = p_role_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- Enable RLS on new tables
-- ====================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Everyone can view, only admins can modify

-- Roles
CREATE POLICY "Anyone can view roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Only admins can insert roles" ON roles FOR INSERT WITH CHECK (
  user_has_permission(auth.uid()::bigint, 'roles.create')
);
CREATE POLICY "Only admins can update roles" ON roles FOR UPDATE USING (
  user_has_permission(auth.uid()::bigint, 'roles.update')
);
CREATE POLICY "Only admins can delete non-system roles" ON roles FOR DELETE USING (
  user_has_permission(auth.uid()::bigint, 'roles.delete') AND NOT is_system_role
);

-- Permissions
CREATE POLICY "Anyone can view permissions" ON permissions FOR SELECT USING (true);

-- Role Permissions
CREATE POLICY "Anyone can view role_permissions" ON role_permissions FOR SELECT USING (true);

-- User Roles
CREATE POLICY "Anyone can view user_roles" ON user_roles FOR SELECT USING (true);

-- ====================================
-- Indexes for Performance
-- ====================================

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

-- ====================================
-- Grant default admin role to existing admin user
-- ====================================

-- Assign Admin role to user with email 'admin@rajashree.com'
DO $$
DECLARE
  admin_user_id BIGINT;
  admin_role_id INT;
BEGIN
  -- Get admin user ID from users table
  SELECT user_id INTO admin_user_id
  FROM users
  WHERE email = 'admin@rajashree.com'
  LIMIT 1;
  
  -- Get Admin role ID
  SELECT role_id INTO admin_role_id
  FROM roles
  WHERE role_name = 'Admin';
  
  -- Assign if both exist
  IF admin_user_id IS NOT NULL AND admin_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id, assigned_by)
    VALUES (admin_user_id, admin_role_id, admin_user_id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ====================================
-- Complete! RBAC System Ready
-- ====================================

COMMENT ON TABLE roles IS 'User roles for access control';
COMMENT ON TABLE permissions IS 'Granular permissions for actions';
COMMENT ON TABLE role_permissions IS 'Maps permissions to roles';
COMMENT ON TABLE user_roles IS 'Assigns roles to users';

-- ================================================
-- ADD MARKETING & GROWTH MODULE PERMISSIONS
-- ================================================
-- This migration adds permissions for the new Marketing & Growth features:
-- - Coupons
-- - Affiliates  
-- Campaigns

-- Insert new permissions for Coupons module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('coupons.view', 'coupons', 'view', 'View coupons list'),
('coupons.create', 'coupons', 'create', 'Create new coupons'),
('coupons.update', 'coupons', 'update', 'Update existing coupons'),
('coupons.delete', 'coupons', 'delete', 'Delete coupons'),
('coupons.validate', 'coupons', 'validate', 'Validate coupon codes');

-- Insert new permissions for Affiliates module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('affiliates.view', 'affiliates', 'view', 'View affiliates list'),
('affiliates.create', 'affiliates', 'create', 'Create new affiliates'),
('affiliates.update', 'affiliates', 'update', 'Update affiliate details'),
('affiliates.delete', 'affiliates', 'delete', 'Delete affiliates'),
('affiliates.referrals', 'affiliates', 'referrals', 'View affiliate referral logs');

-- Insert new permissions for Campaigns module
INSERT INTO permissions (permission_name, module, action, description) VALUES
('campaigns.view', 'campaigns', 'view', 'View campaigns list'),
('campaigns.create', 'campaigns', 'create', 'Create new campaigns'),
('campaigns.update', 'campaigns', 'update', 'Update campaign details'),
('campaigns.delete', 'campaigns', 'delete', 'Delete campaigns'),
('campaigns.send', 'campaigns', 'send', 'Send campaigns to customers');

-- ==================================================
-- AUTO-GRANT ALL NEW PERMISSIONS TO ADMIN ROLE
-- ==================================================
-- This automatically gives Admin role all new permissions

-- Get Admin role ID and assign all new Marketing & Growth permissions
DO $$
DECLARE
    admin_role_id INT;
    perm_id INT;
BEGIN
    -- Get Admin role ID
    SELECT role_id INTO admin_role_id 
    FROM roles 
    WHERE role_name = 'Admin' 
    LIMIT 1;
    
    -- If Admin role exists, grant all marketing permissions
    IF admin_role_id IS NOT NULL THEN
        -- Grant Coupons permissions
        FOR perm_id IN 
            SELECT permission_id FROM permissions WHERE module = 'coupons'
        LOOP
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (admin_role_id, perm_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        -- Grant Affiliates permissions
        FOR perm_id IN 
            SELECT permission_id FROM permissions WHERE module = 'affiliates'
        LOOP
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (admin_role_id, perm_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        -- Grant Campaigns permissions
        FOR perm_id IN 
            SELECT permission_id FROM permissions WHERE module = 'campaigns'
        LOOP
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (admin_role_id, perm_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Marketing & Growth permissions added and granted to Admin role';
    ELSE
        RAISE WARNING 'Admin role not found - permissions added but not assigned';
    END IF;
END $$;

-- ==================================================
-- CREATE TRIGGER FOR AUTO-GRANTING NEW PERMISSIONS
-- ==================================================
-- This ensures any future permissions are automatically granted to Admin

CREATE OR REPLACE FUNCTION auto_grant_admin_permissions()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id INT;
BEGIN
    -- Get Admin role ID
    SELECT role_id INTO admin_role_id 
    FROM roles 
    WHERE role_name = 'Admin' 
    LIMIT 1;
    
    -- Auto-grant new permission to Admin role
    IF admin_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        VALUES (admin_role_id, NEW.permission_id)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Auto-granted permission % to Admin role', NEW.permission_name;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires after new permission is inserted
DROP TRIGGER IF EXISTS trg_auto_grant_admin ON permissions;
CREATE TRIGGER trg_auto_grant_admin
AFTER INSERT ON permissions
FOR EACH ROW
EXECUTE FUNCTION auto_grant_admin_permissions();

-- ==================================================
-- VERIFICATION
-- ==================================================
-- Check that permissions were created and assigned

SELECT 
    'Marketing & Growth Permissions Added' AS status,
    COUNT(*) AS total_permissions
FROM permissions 
WHERE module IN ('coupons', 'affiliates', 'campaigns');

SELECT 
    'Admin Role Permissions' AS status,
    r.role_name,
    COUNT(rp.permission_id) AS granted_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
WHERE r.role_name = 'Admin'
GROUP BY r.role_id, r.role_name;

import { supabase } from '@/lib/supabase';

export interface Role {
    role_id: number;
    role_name: string;
    description: string | null;
    is_system_role: boolean;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    permission_id: number;
    permission_name: string;
    module: string;
    action: string;
    description: string | null;
}

export interface RoleWithPermissions extends Role {
    permissions: Permission[];
}

export interface UserRole {
    user_id: number;
    role_id: number;
    assigned_at: string;
    assigned_by: number | null;
    role: Role;
}

// Fetch all roles
export async function fetchRoles(): Promise<Role[]> {
    try {
        const { data, error } = await supabase
            .from('roles')
            .select('*')
            .order('role_name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching roles:', error);
        return [];
    }
}

// Fetch all permissions
export async function fetchPermissions(): Promise<Permission[]> {
    try {
        const { data, error } = await supabase
            .from('permissions')
            .select('*')
            .order('module, action');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return [];
    }
}

// Fetch permissions for a specific role
export async function fetchRolePermissions(roleId: number): Promise<Permission[]> {
    try {
        const { data, error } = await supabase
            .from('role_permissions')
            .select(`
        permission_id,
        permissions (*)
      `)
            .eq('role_id', roleId);

        if (error) throw error;
        return data?.map((rp: any) => rp.permissions) || [];
    } catch (error) {
        console.error('Error fetching role permissions:', error);
        return [];
    }
}

// Fetch user's roles
export async function fetchUserRoles(userId: number): Promise<UserRole[]> {
    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select(`
        *,
        role:roles (*)
      `)
            .eq('user_id', userId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
    }
}

// Get user permissions (via RPC or direct query)
export async function getUserPermissions(userId: number): Promise<Permission[]> {
    try {
        // Try RPC first
        const { data, error } = await supabase
            .rpc('get_user_permissions', { p_user_id: userId });

        if (error) {
            // Fallback to direct query if RPC doesn't exist
            console.log('RPC not found, using direct query');
            const { data: directData, error: directError } = await supabase
                .from('user_roles')
                .select(`
                    role_permissions (
                        permissions (*)
                    )
                `)
                .eq('user_id', userId);

            if (directError) throw directError;

            // Flatten the permissions
            const permissions: Permission[] = [];
            directData?.forEach((ur: any) => {
                ur.role_permissions?.forEach((rp: any) => {
                    if (rp.permissions && !permissions.find(p => p.permission_id === rp.permissions.permission_id)) {
                        permissions.push(rp.permissions);
                    }
                });
            });

            return permissions;
        }

        return data || [];
    } catch (error) {
        console.error('Error getting user permissions:', error);
        return [];
    }
}

// Check if user has specific permission
export async function userHasPermission(
    userId: number,
    permissionName: string
): Promise<boolean> {
    try {
        // Try RPC first
        const { data, error } = await supabase
            .rpc('user_has_permission', {
                p_user_id: userId,
                p_permission_name: permissionName,
            });

        if (error) {
            // Fallback to getUserPermissions
            console.log('RPC not found, checking via getUserPermissions');
            const permissions = await getUserPermissions(userId);
            return permissions.some(p => p.permission_name === permissionName);
        }

        return data || false;
    } catch (error) {
        console.error('Error checking permission:', error);
        // Last fallback - check if user has Admin role
        try {
            const { data: userRoles } = await supabase
                .from('user_roles')
                .select('role:roles(role_name)')
                .eq('user_id', userId);

            return userRoles?.some((ur: any) => ur.role?.role_name === 'Admin') || false;
        } catch {
            return false;
        }
    }
}

// Assign role to user
export async function assignRoleToUser(
    userId: number,
    roleId: number,
    assignedBy: number
): Promise<boolean> {
    try {
        // Direct insert instead of RPC
        const { error } = await supabase
            .from('user_roles')
            .insert({
                user_id: userId,
                role_id: roleId,
                assigned_by: assignedBy,
            });

        if (error) {
            // Ignore duplicate key errors
            if (error.code === '23505') {
                console.log('Role already assigned');
                return true;
            }
            throw error;
        }
        return true;
    } catch (error) {
        console.error('Error assigning role:', error);
        return false;
    }
}

// Remove role from user
export async function removeRoleFromUser(
    userId: number,
    roleId: number,
    removedBy: number
): Promise<boolean> {
    try {
        // Direct delete instead of RPC
        const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role_id', roleId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error removing role:', error);
        return false;
    }
}

// Update role permissions
export async function updateRolePermissions(
    roleId: number,
    permissionIds: number[]
): Promise<boolean> {
    try {
        // First, delete all existing permissions for this role
        const { error: deleteError } = await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId);

        if (deleteError) throw deleteError;

        // Then, insert the new permissions
        if (permissionIds.length > 0) {
            const { error: insertError } = await supabase
                .from('role_permissions')
                .insert(
                    permissionIds.map((permissionId) => ({
                        role_id: roleId,
                        permission_id: permissionId,
                    }))
                );

            if (insertError) throw insertError;
        }

        return true;
    } catch (error) {
        console.error('Error updating role permissions:', error);
        return false;
    }
}

// Create new role
export async function createRole(
    roleName: string,
    description: string
): Promise<Role | null> {
    try {
        const { data, error } = await supabase
            .from('roles')
            .insert({
                role_name: roleName,
                description,
                is_system_role: false,
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating role:', error);
        return null;
    }
}

// Update role
export async function updateRole(
    roleId: number,
    roleName: string,
    description: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('roles')
            .update({
                role_name: roleName,
                description,
                updated_at: new Date().toISOString(),
            })
            .eq('role_id', roleId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating role:', error);
        return false;
    }
}

// Delete role (only non-system roles)
export async function deleteRole(roleId: number): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('roles')
            .delete()
            .eq('role_id', roleId)
            .eq('is_system_role', false);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting role:', error);
        return false;
    }
}

// Group permissions by module
export function groupPermissionsByModule(permissions: Permission[]): Record<string, Permission[]> {
    return permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
            acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
    }, {} as Record<string, Permission[]>);
}

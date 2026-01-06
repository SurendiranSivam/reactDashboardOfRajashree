import { useQuery } from '@tanstack/react-query';
import { getUserPermissions, userHasPermission } from '@/lib/services/rbac.service';

// Hook to get all user permissions
export function useUserPermissions(userId: number | undefined) {
    return useQuery({
        queryKey: ['user-permissions', userId],
        queryFn: () => (userId ? getUserPermissions(userId) : Promise.resolve([])),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Hook to check a single permission
export function usePermission(permission: string) {
    const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');

    return useQuery({
        queryKey: ['has-permission', user.user_id, permission],
        queryFn: () => userHasPermission(user.user_id, permission),
        enabled: !!user.user_id && !!permission,
        staleTime: 5 * 60 * 1000,
    });
}

// Hook to check multiple permissions (user must have ALL)
export function usePermissions(permissions: string[]) {
    const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');

    return useQuery({
        queryKey: ['has-permissions', user.user_id, permissions],
        queryFn: async () => {
            if (!user.user_id || !permissions.length) return false;

            const results = await Promise.all(
                permissions.map(p => userHasPermission(user.user_id, p))
            );

            return results.every(r => r === true);
        },
        enabled: !!user.user_id && permissions.length > 0,
        staleTime: 5 * 60 * 1000,
    });
}

// Hook to check if user has ANY of the permissions
export function useAnyPermission(permissions: string[]) {
    const user = JSON.parse(localStorage.getItem('dashboard_user') || '{}');

    return useQuery({
        queryKey: ['has-any-permission', user.user_id, permissions],
        queryFn: async () => {
            if (!user.user_id || !permissions.length) return false;

            const results = await Promise.all(
                permissions.map(p => userHasPermission(user.user_id, p))
            );

            return results.some(r => r === true);
        },
        enabled: !!user.user_id && permissions.length > 0,
        staleTime: 5 * 60 * 1000,
    });
}

// Hook to get permissions grouped by module
export function usePermissionsByModule(userId: number | undefined) {
    const { data: permissions = [] } = useUserPermissions(userId);

    const grouped = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, typeof permissions>);

    return grouped;
}

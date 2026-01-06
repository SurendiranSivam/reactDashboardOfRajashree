'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRoles, fetchPermissions, fetchRolePermissions, updateRolePermissions } from '@/lib/services/rbac.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, ChevronRight, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Protected } from '@/components/auth/protected';

export default function RoleManagementPage() {
    const [selectedRole, setSelectedRole] = useState<number | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const { data: roles = [], isLoading: rolesLoading } = useQuery({
        queryKey: ['roles'],
        queryFn: fetchRoles,
    });

    const { data: allPermissions = [], isLoading: permissionsLoading } = useQuery({
        queryKey: ['permissions'],
        queryFn: fetchPermissions,
    });

    const { data: rolePermissions = [], refetch: refetchRolePermissions } = useQuery({
        queryKey: ['role-permissions', selectedRole],
        queryFn: () => (selectedRole ? fetchRolePermissions(selectedRole) : Promise.resolve([])),
        enabled: !!selectedRole,
    });

    // Group permissions by module
    const permissionsByModule = allPermissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
    }, {} as Record<string, typeof allPermissions>);

    // Load role permissions when role is selected
    const handleRoleSelect = (roleId: number) => {
        setSelectedRole(roleId);
        // Set selected permissions after role permissions are fetched
        setTimeout(() => {
            const permIds = rolePermissions.map(p => p.permission_id);
            setSelectedPermissions(permIds);
        }, 100);
    };

    // Toggle permission
    const togglePermission = (permissionId: number) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    // Save permissions
    const handleSave = async () => {
        if (!selectedRole) return;

        setIsSaving(true);
        try {
            const success = await updateRolePermissions(selectedRole, selectedPermissions);

            if (success) {
                toast.success('Permissions updated successfully');
                refetchRolePermissions();
            } else {
                toast.error('Failed to update permissions');
            }
        } catch (error) {
            toast.error('Error updating permissions');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedRoleData = roles.find(r => r.role_id === selectedRole);

    if (rolesLoading || permissionsLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <Protected permission="roles.view" fallback={
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
                    <p className="text-gray-600 mt-2">You don't have permission to view this page</p>
                </div>
            </div>
        }>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Role Management</h2>
                    <p className="text-gray-600 mt-1">Manage roles and permissions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Roles List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>Select a role to edit permissions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {roles.map((role) => (
                                    <button
                                        key={role.role_id}
                                        onClick={() => handleRoleSelect(role.role_id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedRole === role.role_id
                                                ? 'bg-indigo-50 border-indigo-600'
                                                : 'hover:bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{role.role_name}</p>
                                                <p className="text-sm text-gray-600">{role.description}</p>
                                            </div>
                                            {role.is_system_role && (
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                    System
                                                </Badge>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Editor */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>
                                        {selectedRoleData ? `${selectedRoleData.role_name} Permissions` : 'Permissions'}
                                    </CardTitle>
                                    <CardDescription>
                                        {selectedRoleData
                                            ? `Configure permissions for ${selectedRoleData.role_name}`
                                            : 'Select a role to edit permissions'}
                                    </CardDescription>
                                </div>
                                {selectedRole && (
                                    <Protected permission="roles.update">
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="gap-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </Protected>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!selectedRole ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>Select a role from the list to view and edit permissions</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(permissionsByModule).map(([module, permissions]) => (
                                        <div key={module} className="border rounded-lg p-4">
                                            <h3 className="font-semibold text-gray-900 mb-3 capitalize flex items-center gap-2">
                                                <ChevronRight className="h-4 w-4" />
                                                {module}
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {permissions.map((perm) => (
                                                    <label
                                                        key={perm.permission_id}
                                                        className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            checked={selectedPermissions.includes(perm.permission_id)}
                                                            onCheckedChange={() => togglePermission(perm.permission_id)}
                                                            disabled={selectedRoleData?.is_system_role && selectedRoleData.role_name === 'Admin'}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900 capitalize">
                                                                {perm.action.replace('_', ' ')}
                                                            </p>
                                                            {perm.description && (
                                                                <p className="text-xs text-gray-600">{perm.description}</p>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Protected>
    );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, UserPlus, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Protected } from '@/components/auth/protected';
import { fetchRoles, assignRoleToUser } from '@/lib/services/rbac.service';

interface User {
    user_id: number;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export default function UsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'Executive',
    });

    const queryClient = useQueryClient();
    const currentUser = JSON.parse(localStorage.getItem('dashboard_user') || '{}');

    // Fetch users
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as User[];
        },
    });

    // Fetch roles for dropdown
    const { data: roles = [] } = useQuery({
        queryKey: ['roles'],
        queryFn: fetchRoles,
    });

    // Add user mutation
    const addUserMutation = useMutation({
        mutationFn: async (userData: typeof formData) => {
            // Insert user
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert([{
                    email: userData.email,
                    password: userData.password,
                    full_name: userData.full_name,
                    role: userData.role,
                    is_active: true,
                }])
                .select()
                .single();

            if (userError) throw userError;

            // Assign role from roles table
            const selectedRole = roles.find(r => r.role_name === userData.role);
            if (selectedRole && newUser) {
                await assignRoleToUser(newUser.user_id, selectedRole.role_id, currentUser.user_id);
            }

            return newUser;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User added successfully');
            setShowAddDialog(false);
            setFormData({ email: '', password: '', full_name: '', role: 'Executive' });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add user');
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: async (userId: number) => {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully');
            setShowDeleteDialog(false);
            setSelectedUser(null);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete user');
        },
    });

    // Toggle user active status
    const toggleUserStatus = useMutation({
        mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
            const { error } = await supabase
                .from('users')
                .update({ is_active: !isActive })
                .eq('user_id', userId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User status updated');
        },
    });

    // Update user role
    const updateUserRole = useMutation({
        mutationFn: async ({ userId, newRole }: { userId: number; newRole: string }) => {
            // Update role in users table
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('user_id', userId);

            if (error) throw error;

            // Also update in user_roles table
            const selectedRole = roles.find(r => r.role_name === newRole);
            if (selectedRole) {
                // Remove old role assignments
                await supabase.from('user_roles').delete().eq('user_id', userId);
                // Add new role
                await assignRoleToUser(userId, selectedRole.role_id, currentUser.user_id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User role updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update role');
        },
    });

    const filteredUsers = users.filter((user) =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddUser = () => {
        if (!formData.email || !formData.password || !formData.full_name) {
            toast.error('Please fill all required fields');
            return;
        }

        // Check max 3 admins validation
        if (formData.role === 'Admin') {
            const adminCount = users.filter(u => u.role === 'Admin').length;
            if (adminCount >= 3) {
                toast.error('Maximum 3 Admin users allowed. Cannot add more admins.');
                return;
            }
        }

        addUserMutation.mutate(formData);
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            deleteUserMutation.mutate(selectedUser.user_id);
        }
    };

    const columns = [
        {
            key: 'user_id',
            label: 'ID',
            render: (user: User) => (
                <span className="font-mono text-sm text-gray-600">#{user.user_id}</span>
            ),
        },
        {
            key: 'full_name',
            label: 'Name',
            render: (user: User) => (
                <div>
                    <p className="font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            ),
        },
        {
            key: 'role',
            label: 'Role',
            render: (user: User) => (
                <Select
                    value={user.role}
                    onValueChange={(value) => {
                        // Validate max 3 admins when changing to Admin
                        if (value === 'Admin' && user.role !== 'Admin') {
                            const adminCount = users.filter(u => u.role === 'Admin').length;
                            if (adminCount >= 3) {
                                toast.error('Maximum 3 Admin users allowed');
                                return;
                            }
                        }
                        updateUserRole.mutate({ userId: user.user_id, newRole: value });
                    }}
                >
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {roles.map((role) => (
                            <SelectItem key={role.role_id} value={role.role_name}>
                                {role.role_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (user: User) => (
                <Badge
                    variant="outline"
                    className={
                        user.is_active
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }
                >
                    {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'created_at',
            label: 'Created',
            render: (user: User) => new Date(user.created_at).toLocaleDateString(),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (user: User) => (
                <div className="flex items-center gap-2">
                    <Protected permission="roles.assign">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus.mutate({ userId: user.user_id, isActive: user.is_active })}
                        >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </Protected>
                </div>
            ),
        },
    ];

    if (isLoading) {
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
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
                    <p className="text-gray-600 mt-2">You don't have permission to view users</p>
                </div>
            </div>
        }>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Users Management</h2>
                        <p className="text-gray-600 mt-1">Manage dashboard users ({users.length} total, Max 3 Admins)</p>
                    </div>
                    <Protected permission="roles.assign">
                        <Button
                            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600"
                            onClick={() => setShowAddDialog(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </Button>
                    </Protected>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Users</p>
                                    <p className="text-2xl font-bold mt-1">{users.length}</p>
                                </div>
                                <div className="bg-indigo-50 p-3 rounded-lg">
                                    <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Active Users</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {users.filter(u => u.is_active).length}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Inactive Users</p>
                                    <p className="text-2xl font-bold mt-1">
                                        {users.filter(u => !u.is_active).length}
                                    </p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <Users className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Users</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={filteredUsers}
                            columns={columns}
                            getRowId={(user) => user.user_id}
                            exportFilename="users"
                        />
                    </CardContent>
                </Card>

                {/* Add User Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                            <DialogDescription>
                                Create a new dashboard user with specific role
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="full_name">Full Name *</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Minimum 8 characters"
                                />
                            </div>
                            <div>
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => {
                                            // Disable Admin if already have 3
                                            const adminCount = users.filter(u => u.role === 'Admin').length;
                                            const isAdminDisabled = role.role_name === 'Admin' && adminCount >= 3;
                                            return (
                                                <SelectItem
                                                    key={role.role_id}
                                                    value={role.role_name}
                                                    disabled={isAdminDisabled}
                                                >
                                                    {role.role_name} {isAdminDisabled && '(Max 3)'}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {formData.role === 'Admin' && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        ⚠️ Admin users have full system access
                                    </p>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddUser} disabled={addUserMutation.isPending}>
                                {addUserMutation.isPending ? 'Adding...' : 'Add User'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete User</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete {selectedUser?.full_name}? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteUser}
                                disabled={deleteUserMutation.isPending}
                            >
                                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </Protected>
    );
}

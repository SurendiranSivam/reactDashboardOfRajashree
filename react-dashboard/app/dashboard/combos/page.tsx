'use client';

import { useState } from 'react';
import { useCombos } from '@/lib/hooks/use-combos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Search, Package, Plus } from 'lucide-react';

export default function CombosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: combos = [], isLoading } = useCombos();

    const filteredCombos = combos.filter((combo) =>
        combo.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeCombos = combos.filter(c => c.is_active).length;

    const columns = [
        {
            key: 'combo_id',
            label: 'ID',
            render: (combo: any) => (
                <span className="font-mono text-sm text-gray-600">#{combo.combo_id}</span>
            ),
        },
        {
            key: 'name',
            label: 'Combo Name',
            render: (combo: any) => (
                <div className="flex items-center gap-3">
                    {combo.image_url && (
                        <img
                            src={combo.image_url}
                            alt={combo.name}
                            className="w-10 h-10 rounded-lg object-cover"
                        />
                    )}
                    <p className="font-medium text-gray-900">{combo.name}</p>
                </div>
            ),
        },
        {
            key: 'description',
            label: 'Description',
            render: (combo: any) => (
                <p className="text-sm text-gray-600 max-w-xs truncate">{combo.description || '-'}</p>
            ),
        },
        {
            key: 'price',
            label: 'Price',
            render: (combo: any) => (
                <span className="font-semibold text-gray-900">₹{combo.price?.toLocaleString()}</span>
            ),
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (combo: any) => (
                <Badge
                    variant="outline"
                    className={
                        combo.is_active
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                    }
                >
                    {combo.is_active ? 'Active' : 'Inactive'}
                </Badge>
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Combos</h2>
                    <p className="text-gray-600 mt-1">Manage product combos ({combos.length} total)</p>
                </div>
                <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Plus className="h-4 w-4" />
                    Add Combo
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Combos</p>
                                <p className="text-2xl font-bold mt-1">{combos.length}</p>
                            </div>
                            <div className="bg-indigo-50 p-3 rounded-lg">
                                <Package className="h-6 w-6 text-indigo-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold mt-1">{activeCombos}</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg">
                                <Package className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold mt-1">{combos.length - activeCombos}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg">
                                <Package className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Combos Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Combos</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search combos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={filteredCombos}
                        columns={columns}
                        getRowId={(combo) => combo.combo_id}
                        exportFilename="combos"
                    />
                </CardContent>
            </Card>
        </div>
    );
}

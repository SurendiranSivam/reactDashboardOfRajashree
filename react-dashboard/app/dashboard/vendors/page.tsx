'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Plus, Trash2, Edit2, CheckCircle2, XCircle, Eye } from 'lucide-react';
import { AddVendorDialog } from '@/components/vendors/add-vendor-dialog';
import { vendorsApiService } from '@/lib/services/vendors-api.service';
import type { Vendor } from '@/types/vendors';

export default function VendorsPage() {
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | undefined>(undefined);

    // Load vendors on mount
    useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        setLoading(true);
        const result = await vendorsApiService.fetchVendors();
        console.log('📦 Loaded vendors:', result);
        setVendors(result.data || []);
        setLoading(false);
    };

    // Filter vendors by search
    const filteredVendors = vendors.filter(v =>
        v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.contact_number?.includes(searchQuery)
    );

    const handleDelete = async (vendorId: number) => {
        if (!confirm('Are you sure you want to delete this vendor?')) return;

        const result = await vendorsApiService.deleteVendor(vendorId);
        if (result.success) {
            await loadVendors();
        } else {
            alert('Failed to delete vendor: ' + result.error);
        }
    };

    const handleEdit = (vendor: Vendor) => {
        setEditingVendor(vendor);
        setShowAddDialog(true);
    };

    const handleDialogClose = () => {
        setShowAddDialog(false);
        setEditingVendor(undefined);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Vendors</h1>
                    <p className="text-gray-600">Total Vendors: {vendors.length}</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Vendor
                </Button>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by Vendor Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                </Button>
            </div>

            {/* Vendors List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                </div>
            ) : filteredVendors.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No vendors found
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredVendors.map((vendor) => (
                        <Card key={vendor.vendor_id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold">{vendor.name}</h3>
                                            {vendor.is_active ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">📞</span>
                                                <span>{vendor.contact_number}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">📍</span>
                                                <span className="truncate">{vendor.address}</span>
                                            </div>
                                            {vendor.email && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">📧</span>
                                                    <span>{vendor.email}</span>
                                                </div>
                                            )}
                                            {vendor.gst && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">GST:</span>
                                                    <span>{vendor.gst}</span>
                                                </div>
                                            )}
                                            {vendor.contact_person && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">Contact Person:</span>
                                                    <span>{vendor.contact_person}</span>
                                                </div>
                                            )}
                                            {vendor.payment_terms && (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">Payment:</span>
                                                    <span>{vendor.payment_terms}</span>
                                                </div>
                                            )}
                                        </div>

                                        {vendor.notes && (
                                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                                <span className="font-semibold">Notes:</span> {vendor.notes}
                                            </div>
                                        )}

                                        {vendor.updated_at && (
                                            <div className="mt-2 text-xs text-gray-400">
                                                🕒 Updated: {new Date(vendor.updated_at).toLocaleString('en-IN')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => router.push(`/dashboard/vendors/${vendor.vendor_id}`)}
                                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="h-4 w-4 text-green-600" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(vendor)}
                                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4 text-blue-600" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(vendor.vendor_id!)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Vendor Dialog */}
            <AddVendorDialog
                open={showAddDialog}
                onOpenChange={handleDialogClose}
                onSuccess={loadVendors}
                initialVendor={editingVendor}
            />
        </div>
    );
}

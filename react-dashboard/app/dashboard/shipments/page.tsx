'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Plus, Send, Package, Truck, CheckCircle2, Edit2, Save, X, QrCode } from 'lucide-react';
import { AddShipmentDialog } from '@/components/shipments/add-shipment-dialog';
import { shipmentsApiService } from '@/lib/services/shipments-api.service';
import type { Shipment } from '@/types/shipments';

export default function ShipmentsPage() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedShipments, setSelectedShipments] = useState<Set<string>>(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Editing states
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTracking, setEditingTracking] = useState('');

    // Stats
    const stats = {
        totalShipments: shipments.length,
        yetToShip: shipments.filter(s => !s.shipping_status || s.shipping_status === 'Yet to Ship').length,
        shipped: shipments.filter(s => s.shipping_status === 'Shipped').length,
        delivered: shipments.filter(s => s.shipping_status === 'Delivered').length,
    };

    // Load shipments on mount
    useEffect(() => {
        loadShipments();
    }, []);

    const loadShipments = async () => {
        setLoading(true);
        const result = await shipmentsApiService.fetchShipments();
        console.log('📦 Loaded shipments:', result);
        setShipments(result.data || []);
        setLoading(false);
    };

    // Filter shipments by search
    const filteredShipments = shipments.filter(s =>
        s.order_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Paginate
    const paginatedShipments = filteredShipments.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const totalPages = Math.ceil(filteredShipments.length / pageSize);

    const handleSelectShipment = (shipmentId: string) => {
        const newSelected = new Set(selectedShipments);
        if (newSelected.has(shipmentId)) {
            newSelected.delete(shipmentId);
        } else {
            newSelected.add(shipmentId);
        }
        setSelectedShipments(newSelected);
    };

    const handleSendStatus = async () => {
        const selectedShipmentsList = shipments.filter(s =>
            s.shipment_id && selectedShipments.has(s.shipment_id)
        );

        if (selectedShipmentsList.length === 0) {
            alert('Please select at least one shipment');
            return;
        }

        const result = await shipmentsApiService.sendShipmentStatus(selectedShipmentsList);
        if (result.success) {
            alert(`Status sent for ${selectedShipmentsList.length} shipment(s)`);
            setSelectedShipments(new Set());
        } else {
            alert('Failed to send status: ' + result.error);
        }
    };

    const handleEditTracking = (shipment: Shipment) => {
        setEditingId(shipment.shipment_id || null);
        setEditingTracking(shipment.tracking_number || '');
    };

    const handleSaveTracking = async (orderId: string, provider: string) => {
        if (!editingTracking.trim()) {
            alert('Tracking number cannot be empty');
            return;
        }

        const result = await shipmentsApiService.updateTrackingNumber(
            orderId,
            editingTracking,
            provider,
            true
        );

        if (result.success) {
            alert('Tracking number updated successfully');
            setEditingId(null);
            await loadShipments();
        } else {
            alert('Failed to update: ' + result.error);
        }
    };

    const handleCancelEdit = (original: string) => {
        setEditingId(null);
        setEditingTracking(original);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Shipment Tracking</h1>
                    <p className="text-gray-600">Total Shipments: {stats.totalShipments}</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={handleSendStatus}
                        disabled={selectedShipments.size === 0}
                        variant="outline"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Send Status ({selectedShipments.size})
                    </Button>
                    <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Shipment
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-orange-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-semibold">Yet to Ship</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.yetToShip}</p>
                            </div>
                            <Package className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-semibold">Shipped</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.shipped}</p>
                            </div>
                            <Truck className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-semibold">Delivered</p>
                                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                            </div>
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by Order ID or Tracking Number"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(0);
                        }}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Shipments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Shipments ({filteredShipments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : paginatedShipments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No shipments found
                        </div>
                    ) : (
                        <>
                            {/* Horizontal Scrollable Table */}
                            <div className="overflow-x-auto w-full">
                                <table className="w-full border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b">
                                            <th className="p-3 text-left w-12">
                                                <input
                                                    type="checkbox"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedShipments(new Set(paginatedShipments.map(s => s.shipment_id!).filter(Boolean)));
                                                        } else {
                                                            setSelectedShipments(new Set());
                                                        }
                                                    }}
                                                    checked={selectedShipments.size === paginatedShipments.filter(s => s.shipment_id).length && paginatedShipments.length > 0}
                                                />
                                            </th>
                                            <th className="p-3 text-left font-semibold">Order ID</th>
                                            <th className="p-3 text-left font-semibold">Provider</th>
                                            <th className="p-3 text-left font-semibold">Shipped Date</th>
                                            <th className="p-3 text-left font-semibold">Tracking Number</th>
                                            <th className="p-3 text-left font-semibold">Tracking URL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedShipments.map((shipment) => {
                                            const isEditing = editingId === shipment.shipment_id;

                                            return (
                                                <tr key={shipment.shipment_id} className="border-b hover:bg-gray-50 transition-colors">
                                                    <td className="p-3">
                                                        {shipment.shipment_id && (
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedShipments.has(shipment.shipment_id)}
                                                                onChange={() => handleSelectShipment(shipment.shipment_id!)}
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="p-3 font-medium">{shipment.order_id || '-'}</td>
                                                    <td className="p-3">{shipment.shipping_provider || '-'}</td>
                                                    <td className="p-3 text-sm">
                                                        {shipment.shipped_date
                                                            ? new Date(shipment.shipped_date).toLocaleDateString('en-CA')
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-2">
                                                            {isEditing ? (
                                                                <>
                                                                    <Input
                                                                        value={editingTracking}
                                                                        onChange={(e) => setEditingTracking(e.target.value)}
                                                                        className="w-48"
                                                                    />
                                                                    <button
                                                                        className="p-1 hover:bg-blue-50 rounded"
                                                                        title="QR Code Scanner"
                                                                    >
                                                                        <QrCode className="h-5 w-5 text-blue-600" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSaveTracking(
                                                                            shipment.order_id || '',
                                                                            shipment.shipping_provider || ''
                                                                        )}
                                                                        className="p-1 hover:bg-green-50 rounded"
                                                                        title="Save"
                                                                    >
                                                                        <Save className="h-5 w-5 text-green-600" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancelEdit(shipment.tracking_number || '')}
                                                                        className="p-1 hover:bg-red-50 rounded"
                                                                        title="Cancel"
                                                                    >
                                                                        <X className="h-5 w-5 text-red-600" />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span>{shipment.tracking_number || '-'}</span>
                                                                    <button
                                                                        onClick={() => handleEditTracking(shipment)}
                                                                        className="p-1 hover:bg-gray-100 rounded"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="h-4 w-4 text-gray-600" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {shipment.tracking_url ? (
                                                            <a
                                                                href={shipment.tracking_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline text-sm"
                                                            >
                                                                Open Link
                                                            </a>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-end mt-4 pt-4 border-t gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Rows per page:</span>
                                    <select
                                        className="border rounded px-2 py-1 text-sm"
                                        value={pageSize}
                                        onChange={(e) => {
                                            setPageSize(Number(e.target.value));
                                            setCurrentPage(0);
                                        }}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                >
                                    <RefreshCw className="h-4 w-4 rotate-180" />
                                </Button>

                                <span className="text-sm">
                                    Page {currentPage + 1} of {totalPages || 1}
                                </span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Add Shipment Dialog */}
            <AddShipmentDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={loadShipments}
            />
        </div>
    );
}

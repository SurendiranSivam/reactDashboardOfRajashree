'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit2, Trash2, Download, RefreshCw } from 'lucide-react';
import { returnsService } from '@/lib/services/returns.service';
import type { Return, ReturnStatus } from '@/types/returns';
import { RETURN_STATUSES } from '@/types/returns';

export default function ReturnsPage() {
    const [returns, setReturns] = useState<Return[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Dialogs
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [editingReturn, setEditingReturn] = useState<Return | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        order_id: '',
        return_date: new Date().toISOString().split('T')[0],
        status: 'Requested' as ReturnStatus,
        reason: '',
        returned_items: '',
        refund_amount: '',
    });

    useEffect(() => {
        loadReturns();
    }, []);

    const loadReturns = async () => {
        setLoading(true);
        const result = await returnsService.fetchReturns();
        setReturns(result.data || []);
        setLoading(false);
    };

    // Filter and paginate
    const filteredReturns = returns.filter(r => {
        const searchLower = searchQuery.toLowerCase();
        return (
            r.order_id?.toLowerCase().includes(searchLower) ||
            r.status.toLowerCase().includes(searchLower) ||
            r.reason?.toLowerCase().includes(searchLower) ||
            r.return_id?.toString().includes(searchLower)
        );
    });

    const paginatedReturns = filteredReturns.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const totalPages = Math.ceil(filteredReturns.length / pageSize);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Requested': return 'bg-gray-100 text-gray-800';
            case 'Received': return 'bg-gray-400 text-white';
            case 'Inspecting': return 'bg-orange-100 text-orange-800';
            case 'Approved': return 'bg-blue-100 text-blue-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Refund Initiated': return 'bg-teal-100 text-teal-800';
            case 'Refunded': return 'bg-green-100 text-green-800';
            case 'Closed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleAddReturn = async () => {
        const result = await returnsService.addReturn({
            order_id: formData.order_id || null,
            return_date: formData.return_date,
            status: formData.status,
            reason: formData.reason || null,
            returned_items: formData.returned_items || null,
            refund_amount: formData.refund_amount ? parseFloat(formData.refund_amount) : null,
        });

        if (result.success) {
            setShowAddDialog(false);
            resetForm();
            await loadReturns();
            alert('✅ Return added successfully');
        } else {
            alert('❌ Failed to add return: ' + result.error);
        }
    };

    const handleEditReturn = async () => {
        if (!editingReturn) return;

        const result = await returnsService.updateReturnDetails(
            editingReturn.return_id!,
            {
                status: formData.status,
                reason: formData.reason,
                returned_items: formData.returned_items,
            }
        );

        if (result.success) {
            setShowEditDialog(false);
            setEditingReturn(null);
            resetForm();
            await loadReturns();
            alert('✅ Return updated successfully');
        } else {
            alert('❌ Failed to update return: ' + result.error);
        }
    };

    const handleStatusChange = async (returnId: number, newStatus: string) => {
        const result = await returnsService.updateStatus(returnId, newStatus);
        if (result.success) {
            await loadReturns();
        } else {
            alert('❌ Failed to update status: ' + result.error);
        }
    };

    const handleDelete = async (returnId: number) => {
        if (!confirm('Are you sure you want to delete this return?')) return;

        const result = await returnsService.deleteReturn(returnId);
        if (result.success) {
            await loadReturns();
            alert('✅ Return deleted successfully');
        } else {
            alert('❌ Failed to delete return: ' + result.error);
        }
    };

    const openEditDialog = (returnItem: Return) => {
        setEditingReturn(returnItem);
        setFormData({
            order_id: returnItem.order_id || '',
            return_date: returnItem.return_date?.split('T')[0] || new Date().toISOString().split('T')[0],
            status: returnItem.status as ReturnStatus,
            reason: returnItem.reason || '',
            returned_items: returnItem.returned_items || '',
            refund_amount: returnItem.refund_amount?.toString() || '',
        });
        setShowEditDialog(true);
    };

    const resetForm = () => {
        setFormData({
            order_id: '',
            return_date: new Date().toISOString().split('T')[0],
            status: 'Requested',
            reason: '',
            returned_items: '',
            refund_amount: '',
        });
    };

    const handleExport = () => {
        // TODO: Implement Excel export
        alert('Export functionality will be implemented');
    };

    const toggleRowSelection = (returnId: number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(returnId)) {
            newSelected.delete(returnId);
        } else {
            newSelected.add(returnId);
        }
        setSelectedRows(newSelected);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Returns Management</h1>
                    <p className="text-gray-600">Total Returns: {filteredReturns.length}</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline" className="bg-green-600 text-white hover:bg-green-700">
                        <Download className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                    <Button onClick={() => setShowAddDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Return
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by Order ID / Status / Reason..."
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(0);
                    }}
                    className="pl-10"
                />
            </div>

            {/* Returns Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-blue-100">
                                        <tr>
                                            <th className="p-3 text-left font-semibold">
                                                <input
                                                    type="checkbox"
                                                    className="rounded"
                                                    checked={paginatedReturns.length > 0 && paginatedReturns.every(r => selectedRows.has(r.return_id!))}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            const allIds = new Set(paginatedReturns.map(r => r.return_id!));
                                                            setSelectedRows(allIds);
                                                        } else {
                                                            setSelectedRows(new Set());
                                                        }
                                                    }}
                                                />
                                            </th>
                                            <th className="p-3 text-left font-semibold">Order ID</th>
                                            <th className="p-3 text-left font-semibold">Return Date</th>
                                            <th className="p-3 text-left font-semibold">Status</th>
                                            <th className="p-3 text-left font-semibold">Reason</th>
                                            <th className="p-3 text-left font-semibold">Returned Items</th>
                                            <th className="p-3 text-right font-semibold">Refund</th>
                                            <th className="p-3 text-center font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedReturns.map((returnItem) => (
                                            <tr key={returnItem.return_id} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded"
                                                        checked={selectedRows.has(returnItem.return_id!)}
                                                        onChange={() => toggleRowSelection(returnItem.return_id!)}
                                                    />
                                                </td>
                                                <td className="p-3">{returnItem.order_id || '-'}</td>
                                                <td className="p-3 text-sm">
                                                    {returnItem.return_date
                                                        ? new Date(returnItem.return_date).toLocaleDateString('en-IN')
                                                        : '-'}
                                                </td>
                                                <td className="p-3">
                                                    <select
                                                        value={returnItem.status}
                                                        onChange={(e) => handleStatusChange(returnItem.return_id!, e.target.value)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(returnItem.status)}`}
                                                    >
                                                        {RETURN_STATUSES.map((status) => (
                                                            <option key={status} value={status}>{status}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="p-3 max-w-xs">
                                                    <div className="text-sm text-gray-700 truncate" title={returnItem.reason || ''}>
                                                        {returnItem.reason || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-3 max-w-xs">
                                                    <div className="text-sm text-gray-700 truncate" title={returnItem.returned_items || ''}>
                                                        {returnItem.returned_items || '-'}
                                                    </div>
                                                </td>
                                                <td className="p-3 text-right font-semibold">
                                                    {returnItem.refund_amount ? `₹${returnItem.refund_amount.toFixed(2)}` : '-'}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditDialog(returnItem)}
                                                            className="p-2 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="h-4 w-4 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(returnItem.return_id!)}
                                                            className="p-2 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between p-4 border-t">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredReturns.length)} of {filteredReturns.length}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Rows per page:</span>
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
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm">
                                        Page {currentPage + 1} of {totalPages || 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Add Return Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Add Return</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="order_id">Order ID</Label>
                            <Input
                                id="order_id"
                                value={formData.order_id}
                                onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="return_date">Return Date</Label>
                            <Input
                                id="return_date"
                                type="date"
                                value={formData.return_date}
                                onChange={(e) => setFormData({ ...formData, return_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ReturnStatus })}
                            >
                                {RETURN_STATUSES.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="reason">Reason / Problem Statement</Label>
                            <textarea
                                id="reason"
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="returned_items">Returned Items</Label>
                            <textarea
                                id="returned_items"
                                rows={2}
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.returned_items}
                                onChange={(e) => setFormData({ ...formData, returned_items: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="refund_amount">Refund Amount</Label>
                            <Input
                                id="refund_amount"
                                type="number"
                                step="0.01"
                                value={formData.refund_amount}
                                onChange={(e) => setFormData({ ...formData, refund_amount: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddReturn} className="bg-blue-600 hover:bg-blue-700">
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Return Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Return #{editingReturn?.return_id}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edit_status">Status</Label>
                            <select
                                id="edit_status"
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ReturnStatus })}
                            >
                                {RETURN_STATUSES.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="edit_reason">Reason / Problem Statement</Label>
                            <textarea
                                id="edit_reason"
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit_returned_items">Returned Items</Label>
                            <textarea
                                id="edit_returned_items"
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md"
                                value={formData.returned_items}
                                onChange={(e) => setFormData({ ...formData, returned_items: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingReturn(null); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditReturn} className="bg-blue-600 hover:bg-blue-700">
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

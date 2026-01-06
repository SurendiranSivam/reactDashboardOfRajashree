'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, FileDown, Package, ShoppingCart, Plus, Trash2, Eye, Download, Image } from 'lucide-react';
import { AddPurchaseDialog } from '@/components/purchases/add-purchase-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { purchasesApiService } from '@/lib/services/purchases-api.service';
import type { Purchase } from '@/types/purchases';

export default function PurchasesPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Stats - calculate from actual data
    const stats = {
        totalPurchases: purchases.length,
        totalAmount: purchases.reduce((sum, p) => sum + (p.amount || 0), 0),
        paid: purchases.filter(p => p.payment_status === 'Paid').length,
        pending: purchases.filter(p => p.payment_status === 'Pending').length,
    };

    // Load purchases on mount
    useEffect(() => {
        loadPurchases();
    }, []);

    const loadPurchases = async () => {
        setLoading(true);
        const result = await purchasesApiService.fetchPurchases();
        console.log('📦 Loaded purchases:', result);
        setPurchases(result.data || []);
        setLoading(false);
    };

    // Filter purchases
    const filteredPurchases = purchases.filter(p => {
        const matchesSearch =
            p.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.vendor?.contact_number?.includes(searchQuery);
        return matchesSearch;
    });

    // Paginate
    const paginatedPurchases = filteredPurchases.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const totalPages = Math.ceil(filteredPurchases.length / pageSize);

    const handleDelete = async (purchaseId: number) => {
        if (!confirm('Are you sure you want to delete this purchase?')) return;

        const result = await purchasesApiService.deletePurchase(purchaseId);
        if (result.success) {
            await loadPurchases();
        } else {
            alert('Failed to delete purchase: ' + result.error);
        }
    };

    const handleViewDetails = (purchase: Purchase) => {
        setSelectedPurchase(purchase);
        setShowDetailsDialog(true);
    };

    const handleDownloadInvoice = (invoiceImage: string, invoiceNo: string) => {
        const link = document.createElement('a');
        link.href = invoiceImage;
        link.download = `invoice-${invoiceNo}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExport = () => {
        // TODO: Implement Excel export
        alert('Excel export will be implemented');
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Purchase Report</h1>
                    <p className="text-gray-600">Total Purchases: {stats.totalPurchases}</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={handleExport} variant="outline">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export to Excel
                    </Button>
                    <Button onClick={() => setShowAddDialog(true)} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Purchase
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Purchases</p>
                                <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold">₹{(stats.totalAmount / 1000).toFixed(1)}K</p>
                            </div>
                            <Package className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Paid</p>
                                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-red-600">{stats.pending}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by Vendor or Invoice No"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Purchases Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Purchases ({filteredPurchases.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : paginatedPurchases.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No purchases found
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-blue-600 text-white">
                                            <th className="p-3 text-left font-semibold">Purchase ID</th>
                                            <th className="p-3 text-left font-semibold">Invoice No</th>
                                            <th className="p-3 text-left font-semibold">Vendor Name</th>
                                            <th className="p-3 text-left font-semibold">Invoice Date</th>
                                            <th className="p-3 text-center font-semibold">Invoice Image</th>
                                            <th className="p-3 text-right font-semibold">Total Amount</th>
                                            <th className="p-3 text-center font-semibold">Item Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedPurchases.map((purchase) => (
                                            <tr key={purchase.purchase_id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="p-3 font-medium">{purchase.purchase_id}</td>
                                                <td className="p-3">{purchase.invoice_no}</td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => handleViewDetails(purchase)}
                                                        className="text-blue-600 hover:underline font-medium"
                                                    >
                                                        {purchase.vendor?.name || '-'}
                                                    </button>
                                                </td>
                                                <td className="p-3 text-sm">
                                                    {purchase.invoice_date
                                                        ? new Date(purchase.invoice_date).toLocaleDateString('en-IN')
                                                        : '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    {purchase.invoice_image ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleViewDetails(purchase)}
                                                                className="p-1 hover:bg-blue-50 rounded transition-colors"
                                                                title="View Invoice"
                                                            >
                                                                <Eye className="h-5 w-5 text-blue-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadInvoice(purchase.invoice_image!, purchase.invoice_no!)}
                                                                className="p-1 hover:bg-green-50 rounded transition-colors"
                                                                title="Download Invoice"
                                                            >
                                                                <Download className="h-5 w-5 text-green-600" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No Image</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right font-semibold">
                                                    ₹{purchase.amount?.toLocaleString('en-IN') || 0}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                                        {purchase.purchase_items?.length || 0} items
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredPurchases.length)} of {filteredPurchases.length} purchases
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
                                            <option value={20}>20</option>
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

            {/* Add Purchase Dialog */}
            <AddPurchaseDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                onSuccess={loadPurchases}
            />

            {/* Purchase Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Purchase Details - {selectedPurchase?.invoice_no}</DialogTitle>
                    </DialogHeader>

                    {selectedPurchase && (
                        <div className="space-y-4">
                            {/* Purchase Info */}
                            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Purchase ID</p>
                                    <p className="font-semibold">{selectedPurchase.purchase_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Invoice No</p>
                                    <p className="font-semibold">{selectedPurchase.invoice_no}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Vendor</p>
                                    <p className="font-semibold">{selectedPurchase.vendor?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Contact</p>
                                    <p className="font-semibold">{selectedPurchase.vendor?.contact_number || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Invoice Date</p>
                                    <p className="font-semibold">
                                        {selectedPurchase.invoice_date
                                            ? new Date(selectedPurchase.invoice_date).toLocaleDateString('en-IN')
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Total Amount</p>
                                    <p className="font-semibold text-lg text-green-600">
                                        ₹{selectedPurchase.amount?.toLocaleString('en-IN') || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Invoice Image */}
                            {selectedPurchase.invoice_image && (
                                <div className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold">Invoice Image</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadInvoice(selectedPurchase.invoice_image!, selectedPurchase.invoice_no!)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                    </div>
                                    <img
                                        src={selectedPurchase.invoice_image}
                                        alt="Invoice"
                                        className="w-full max-h-96 object-contain border rounded"
                                    />
                                </div>
                            )}

                            {/* Purchase Items */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">Purchase Items</h3>
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-2 text-left text-sm">SKU</th>
                                            <th className="p-2 text-center text-sm">Quantity</th>
                                            <th className="p-2 text-right text-sm">Unit Price</th>
                                            <th className="p-2 text-right text-sm">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedPurchase.purchase_items?.map((item: any, idx: number) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-2">
                                                    {item.product_variants?.sku || item.variant_id}
                                                </td>
                                                <td className="p-2 text-center">{item.quantity}</td>
                                                <td className="p-2 text-right">
                                                    ₹{(item.cost_price / item.quantity).toFixed(2)}
                                                </td>
                                                <td className="p-2 text-right font-semibold">
                                                    ₹{item.cost_price?.toLocaleString('en-IN') || 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

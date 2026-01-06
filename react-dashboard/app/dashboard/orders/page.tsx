'use client';

import { useState, useEffect, useMemo } from 'react';
import { ordersService } from '@/lib/services/orders.service';
import { excelService } from '@/lib/services/excel.service';
import type { Order, OrderItem, SkuSummary } from '@/types/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Search,
    FileDown,
    FileText,
    RefreshCw,
    Filter,
    X,
    ExternalLink,
    Package,
    ShoppingCart,
    DollarSign,
    CheckCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
    // State
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const pageSizeOptions = [10, 20, 50, 100];

    // Filters
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedSources, setSelectedSources] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Dialogs
    const [orderDetailsDialog, setOrderDetailsDialog] = useState<{ open: boolean; order: Order | null }>({
        open: false,
        order: null,
    });
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [skuDialog, setSkuDialog] = useState(false);
    const [skuSummary, setSkuSummary] = useState<SkuSummary[]>([]);
    const [skuDate, setSkuDate] = useState(new Date());

    // Multi-select filter dialog
    const [filterDialog, setFilterDialog] = useState<{
        open: boolean;
        type: 'status' | 'source' | null;
    }>({ open: false, type: null });

    // Filter options
    const filterOptions = {
        status: ['processing', 'Completed', 'failed'],
        source: ['Website', 'WhatsApp'],
    };

    // Fetch orders on mount using Edge Function (matching Flutter)
    useEffect(() => {
        async function loadOrders() {
            setLoading(true);
            console.log('📡 Loading orders via Edge Function...');
            const result = await ordersService.fetchOrders();
            setOrders(result.orders);
            console.log(`✅ Loaded ${result.orders.length} orders (total: ${result.total})`);
            setLoading(false);
        }
        loadOrders();
    }, []);

    // Calculate summary stats from filtered orders
    const orderStats = useMemo(() => {
        const total = orders.length;
        const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const processing = orders.filter(o => o.order_status?.toLowerCase() === 'processing').length;
        const completed = orders.filter(o => o.order_status?.toLowerCase() === 'completed').length;

        return { total, totalSales, processing, completed };
    }, [orders]);

    // Apply filters
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const customer = order.customers;

            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                (customer?.full_name?.toLowerCase().includes(searchLower)) ||
                (customer?.mobile_number?.includes(searchQuery)) ||
                order.shipping_address?.toLowerCase().includes(searchLower) ||
                order.shipping_state?.toLowerCase().includes(searchLower) ||
                order.source?.toLowerCase().includes(searchLower) ||
                order.order_id?.toLowerCase().includes(searchLower);

            // Status filter
            const matchesStatus =
                selectedStatuses.length === 0 ||
                selectedStatuses.includes(order.order_status);

            // Source filter
            const matchesSource =
                selectedSources.length === 0 ||
                selectedSources.includes(order.source);

            // Date filter
            const matchesDate =
                !selectedDate ||
                (order.created_at &&
                    new Date(order.created_at).toDateString() === selectedDate.toDateString());

            return matchesSearch && matchesStatus && matchesSource && matchesDate;
        });
    }, [orders, searchQuery, selectedStatuses, selectedSources, selectedDate]);

    //Pagination
    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
    const paginatedOrders = filteredOrders.slice(
        page * pageSize,
        (page + 1) * pageSize
    );

    // Load order details
    async function loadOrderDetails(order: Order) {
        const items = await ordersService.fetchOrderItems(order.order_id);
        setOrderItems(items);
        setOrderDetailsDialog({ open: true, order });
    }

    // Load SKU summary
    async function loadSkuSummary() {
        const data = await ordersService.fetchDailySkuSummary(skuDate);
        setSkuSummary(data);
        setSkuDialog(true);
    }

    // Handle row selection
    function toggleOrderSelection(orderId: string) {
        const newSelected = new Set(selectedOrderIds);
        if (newSelected.has(orderId)) {
            newSelected.delete(orderId);
        } else {
            newSelected.add(orderId);
        }
        setSelectedOrderIds(newSelected);
    }

    // Export to Excel
    function exportToExcel() {
        if (selectedOrderIds.size === 0) {
            alert('Please select at least one order');
            return;
        }

        const selectedOrders = orders.filter(o => selectedOrderIds.has(o.order_id));
        const success = excelService.exportOrdersToExcel(selectedOrders);

        if (success) {
            alert(`Successfully exported ${selectedOrderIds.size} orders to Excel!`);
        } else {
            alert('Failed to export orders');
        }
    }

    // Generate invoices (placeholder - requires PDF library)
    function generateInvoices() {
        if (selectedOrderIds.size === 0) {
            alert('Please select at least one order');
            return;
        }
        alert(`Generating invoices for ${selectedOrderIds.size} orders... (PDF generation in development)`);
    }

    // Export SKU to Excel
    function exportSkuToExcel() {
        const success = excelService.exportSkuSummaryToExcel(skuSummary, skuDate);
        if (success) {
            alert('Successfully exported SKU summary to Excel!');
        } else {
            alert('Failed to export SKU summary');
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Orders Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage and track all orders
                    </p>
                </div>

                <Button onClick={loadSkuSummary} variant="outline" className="gap-2">
                    <Package className="h-4 w-4" />
                    SKU Summary
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Orders</p>
                                <p className="text-2xl font-bold">{orderStats.total}</p>
                            </div>
                            <ShoppingCart className="h-8 w-8 text-indigo-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Sales</p>
                                <p className="text-2xl font-bold">₹{(orderStats.totalSales / 1000).toFixed(1)}K</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Processing</p>
                                <p className="text-2xl font-bold text-yellow-600">{orderStats.processing}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-600">{orderStats.completed}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Actions */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Search */}
                        <div className="flex-1 min-w-[250px]">
                            <label className="text-sm font-medium mb-2 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by mobile, order ID, name..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(0);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Status</label>
                            <div className="flex gap-2 flex-wrap">
                                {selectedStatuses.map((status) => (
                                    <Badge key={status} variant="secondary" className="gap-1">
                                        {status}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => {
                                                setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                                                setPage(0);
                                            }}
                                        />
                                    </Badge>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilterDialog({ open: true, type: 'status' })}
                                >
                                    <Filter className="h-4 w-4 mr-1" />
                                    {selectedStatuses.length === 0 ? 'Select' : 'Edit'}
                                </Button>
                            </div>
                        </div>

                        {/* Source Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Source</label>
                            <div className="flex gap-2 flex-wrap">
                                {selectedSources.map((source) => (
                                    <Badge key={source} variant="secondary" className="gap-1">
                                        {source}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => {
                                                setSelectedSources(selectedSources.filter(s => s !== source));
                                                setPage(0);
                                            }}
                                        />
                                    </Badge>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFilterDialog({ open: true, type: 'source' })}
                                >
                                    <Filter className="h-4 w-4 mr-1" />
                                    {selectedSources.length === 0 ? 'Select' : 'Edit'}
                                </Button>
                            </div>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Date</label>
                            <div className="flex gap-2">
                                <DatePicker
                                    date={selectedDate || new Date()}
                                    onDateChange={(date) => {
                                        setSelectedDate(date);
                                        setPage(0);
                                    }}
                                />
                                {selectedDate && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedDate(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 pt-4 border-t">
                        <Button onClick={generateInvoices} disabled={selectedOrderIds.size === 0}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Invoice ({selectedOrderIds.size})
                        </Button>
                        <Button onClick={exportToExcel} variant="outline" disabled={selectedOrderIds.size === 0}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export Excel ({selectedOrderIds.size})
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSelectedOrderIds(new Set());
                                setSearchQuery('');
                                setSelectedStatuses([]);
                                setSelectedSources([]);
                                setSelectedDate(null);
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Orders ({filteredOrders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    ) : paginatedOrders.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No orders found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="p-3 text-left">
                                            <input
                                                type="checkbox"
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedOrderIds(new Set(paginatedOrders.map(o => o.order_id)));
                                                    } else {
                                                        setSelectedOrderIds(new Set());
                                                    }
                                                }}
                                                checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrderIds.has(o.order_id))}
                                            />
                                        </th>
                                        <th className="p-3 text-left font-semibold">Date</th>
                                        <th className="p-3 text-left font-semibold">Order ID</th>
                                        <th className="p-3 text-left font-semibold">Customer Name</th>
                                        <th className="p-3 text-left font-semibold">Mobile</th>
                                        <th className="p-3 text-left font-semibold">Amount</th>
                                        <th className="p-3 text-left font-semibold">Source</th>
                                        <th className="p-3 text-left font-semibold">Order Status</th>
                                        <th className="p-3 text-left font-semibold">Shipment Status</th>
                                        <th className="p-3 text-left font-semibold">Invoice</th>
                                        <th className="p-3 text-left font-semibold">Payment</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedOrders.map((order) => (
                                        <tr key={order.order_id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrderIds.has(order.order_id)}
                                                    onChange={() => toggleOrderSelection(order.order_id)}
                                                />
                                            </td>
                                            <td className="p-3 text-sm">
                                                {order.order_date ? format(new Date(order.order_date), 'yyyy-MM-dd HH:mm') :
                                                    order.created_at ? format(new Date(order.created_at), 'yyyy-MM-dd HH:mm') :
                                                        'N/A'}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => loadOrderDetails(order)}
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    {order.order_id}
                                                </button>
                                            </td>
                                            <td className="p-3">{order.customers?.full_name || 'N/A'}</td>
                                            <td className="p-3">{order.customers?.mobile_number || order.contact_number || 'N/A'}</td>
                                            <td className="p-3 font-semibold">₹{order.total_amount.toFixed(2)}</td>
                                            <td className="p-3">
                                                <Badge variant={order.source === 'Website' ? 'default' : 'secondary'}>
                                                    {order.source}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge
                                                    variant={
                                                        order.order_status === 'Completed' ? 'default' :
                                                            order.order_status === 'processing' ? 'secondary' : 'destructive'
                                                    }
                                                >
                                                    {order.order_status}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-blue-600">
                                                    {order.shipment_status || 'Yet to Ship'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {order.invoice_url ? (
                                                    <a
                                                        href={order.invoice_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <FileText className="h-5 w-5" />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {order.payment_transaction_id ? (
                                                    <a
                                                        href={`https://dashboard.razorpay.com/app/orders/${order.payment_transaction_id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                                                    >
                                                        {order.payment_transaction_id.substring(0, 10)}...
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">Not Paid</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(0);
                                }}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 0}
                            >
                                Previous
                            </Button>
                            <span className="text-sm px-4">
                                Page {page + 1} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Order Details Dialog */}
            <Dialog open={orderDetailsDialog.open} onOpenChange={(open) => setOrderDetailsDialog({ open, order: null })}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order {orderDetailsDialog.order?.order_id}</DialogTitle>
                    </DialogHeader>
                    {orderDetailsDialog.order && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Customer Information</h3>
                                <div className="text-sm space-y-1">
                                    <p><strong>Name:</strong> {orderDetailsDialog.order.customers?.full_name || 'N/A'}</p>
                                    <p><strong>Mobile:</strong> {orderDetailsDialog.order.customers?.mobile_number || 'N/A'}</p>
                                    <p><strong>Email:</strong> {orderDetailsDialog.order.customers?.email || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Shipping Address</h3>
                                <p className="text-sm">
                                    {orderDetailsDialog.order.name}, {orderDetailsDialog.order.shipping_address}, {orderDetailsDialog.order.shipping_state}
                                    <br />
                                    Contact: {orderDetailsDialog.order.contact_number}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Order Details</h3>
                                <div className="text-sm space-y-1">
                                    <p><strong>Amount:</strong> ₹{orderDetailsDialog.order.total_amount} (Shipping: ₹{orderDetailsDialog.order.shipping_amount})</p>
                                    <p><strong>Source:</strong> {orderDetailsDialog.order.source}</p>
                                    <p><strong>Payment:</strong> {orderDetailsDialog.order.payment_method} - {orderDetailsDialog.order.payment_transaction_id || 'N/A'}</p>
                                    {orderDetailsDialog.order.order_note && (
                                        <p><strong>Note:</strong> {orderDetailsDialog.order.order_note}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Order Items</h3>
                                <div className="space-y-2">
                                    {orderItems.map((item, idx) => (
                                        <div key={idx} className="border rounded p-3 text-sm">
                                            <p><strong>SKU:</strong> {item.product_variants?.sku || 'N/A'}</p>
                                            <p><strong>Variant:</strong> {item.product_variants?.variant_name || 'N/A'}</p>
                                            <p><strong>Price:</strong> ₹{item.product_variants?.saleprice || 0}</p>
                                            <p><strong>Quantity:</strong> {item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* SKU Summary Dialog */}
            <Dialog open={skuDialog} onOpenChange={setSkuDialog}>
                <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white -mx-6 -mt-6 p-6 rounded-t-lg mb-4">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl flex items-center gap-2 text-white">
                                <Package className="h-6 w-6" />
                                📦 Daily SKU Sales Summary
                            </DialogTitle>
                            <div className="flex items-center gap-2">
                                <DatePicker date={skuDate} onDateChange={setSkuDate} />
                                <Button
                                    size="sm"
                                    onClick={loadSkuSummary}
                                    variant="secondary"
                                >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Refresh
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={exportSkuToExcel}
                                    disabled={skuSummary.length === 0}
                                >
                                    <FileDown className="h-4 w-4 mr-1" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </DialogHeader>

                    {skuSummary.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">No SKU summary available for this date</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Low Stock Alert */}
                            {skuSummary.filter(item => item.current_stock < 10).length > 0 && (
                                <Card className="bg-red-50 border-red-200">
                                    <CardContent className="pt-4 pb-4">
                                        <div className="flex items-center gap-2 text-red-700">
                                            <AlertTriangle className="h-5 w-5" />
                                            <p className="font-semibold">
                                                ⚠️ {skuSummary.filter(item => item.current_stock < 10).length} items with low stock (less than 10 units)!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                                        <tr>
                                            <th className="p-3 text-left font-semibold border-b-2 border-indigo-200">SKU</th>
                                            <th className="p-3 text-left font-semibold border-b-2 border-indigo-200">Variant</th>
                                            <th className="p-3 text-right font-semibold border-b-2 border-indigo-200">Qty Sold</th>
                                            <th className="p-3 text-right font-semibold border-b-2 border-indigo-200">Current Stock</th>
                                            <th className="p-3 text-right font-semibold border-b-2 border-indigo-200">Sale Price</th>
                                            <th className="p-3 text-right font-semibold border-b-2 border-indigo-200">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {skuSummary.map((sku, idx) => {
                                            const lowStock = sku.current_stock < 10;
                                            const revenue = sku.total_qty * sku.saleprice;

                                            return (
                                                <tr
                                                    key={idx}
                                                    className={`border-b transition-colors ${lowStock ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="p-3 font-mono text-sm">{sku.sku}</td>
                                                    <td className="p-3">{sku.variant_name}</td>
                                                    <td className="p-3 text-right font-semibold">{sku.total_qty}</td>
                                                    <td className={`p-3 text-right font-semibold ${lowStock ? 'text-red-600' : 'text-green-600'}`}>
                                                        <div className="flex items-center justify-end gap-1">
                                                            {lowStock && <AlertTriangle className="h-4 w-4" />}
                                                            {sku.current_stock}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-right">₹{sku.saleprice.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-bold text-green-700">
                                                        ₹{revenue.toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className="bg-gray-100 font-bold border-t-2">
                                        <tr>
                                            <td colSpan={2} className="p-3">TOTAL</td>
                                            <td className="p-3 text-right">
                                                {skuSummary.reduce((sum, item) => sum + item.total_qty, 0)}
                                            </td>
                                            <td className="p-3 text-right">-</td>
                                            <td className="p-3 text-right">-</td>
                                            <td className="p-3 text-right text-green-700">
                                                ₹{skuSummary.reduce((sum, item) => sum + (item.total_qty * item.saleprice), 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Multi-Select Filter Dialog */}
            <Dialog open={filterDialog.open} onOpenChange={(open) => setFilterDialog({ open, type: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Select {filterDialog.type === 'status' ? 'Status' : 'Source'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {filterDialog.type && filterOptions[filterDialog.type].map((option) => {
                            const isSelected = filterDialog.type === 'status'
                                ? selectedStatuses.includes(option)
                                : selectedSources.includes(option);

                            return (
                                <label key={option} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                            if (filterDialog.type === 'status') {
                                                if (e.target.checked) {
                                                    setSelectedStatuses([...selectedStatuses, option]);
                                                } else {
                                                    setSelectedStatuses(selectedStatuses.filter(s => s !== option));
                                                }
                                            } else {
                                                if (e.target.checked) {
                                                    setSelectedSources([...selectedSources, option]);
                                                } else {
                                                    setSelectedSources(selectedSources.filter(s => s !== option));
                                                }
                                            }
                                        }}
                                    />
                                    <span>{option}</span>
                                </label>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setFilterDialog({ open: false, type: null })}>
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

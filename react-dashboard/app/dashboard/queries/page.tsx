'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Search, Plus, Mail, MessageCircle, Phone, ArrowUpCircle,
    Trash2, Eye, Download, Edit
} from 'lucide-react';
import { queriesService } from '@/lib/services/queries.service';
import type { Query } from '@/types/queries';
import { AddQueryDialog } from '@/components/queries/add-query-dialog';
import { CustomerDetailsDialog } from '@/components/queries/customer-details-dialog';
import { EscalateDialog } from '@/components/queries/escalate-dialog';
import { ConversationDialog } from '@/components/queries/conversation-dialog';

export default function QueriesPage() {
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Dialogs
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showCustomerDialog, setShowCustomerDialog] = useState(false);
    const [showEscalateDialog, setShowEscalateDialog] = useState(false);
    const [showConversationDialog, setShowConversationDialog] = useState(false);
    const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);

    useEffect(() => {
        loadQueries();
    }, []);

    const loadQueries = async () => {
        setLoading(true);
        const result = await queriesService.fetchQueries();
        if (result.data) {
            setQueries(result.data);
        }
        setLoading(false);
    };

    // Filter queries
    const filteredQueries = queries.filter(query => {
        if (!searchQuery) return true;
        const search = searchQuery.toLowerCase();
        return (
            query.name.toLowerCase().includes(search) ||
            query.mobile_number.includes(search) ||
            query.email?.toLowerCase().includes(search) ||
            query.status.toLowerCase().includes(search) ||
            query.order_id?.toLowerCase().includes(search) ||
            query.message.toLowerCase().includes(search)
        );
    });

    // Paginate
    const totalPages = Math.ceil(filteredQueries.length / pageSize);
    const paginatedQueries = filteredQueries.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    // Source icon & color
    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'Email':
                return <Mail className="h-4 w-4 text-blue-600" />;
            case 'WhatsApp':
                return <MessageCircle className="h-4 w-4 text-green-600" />;
            case 'Phone':
                return <Phone className="h-4 w-4 text-orange-600" />;
            default:
                return <Mail className="h-4 w-4" />;
        }
    };

    // Status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open':
                return 'bg-red-100 text-red-800';
            case 'In Progress':
                return 'bg-orange-100 text-orange-800';
            case 'Resolved':
                return 'bg-green-100 text-green-800';
            case 'Closed':
                return 'bg-gray-100 text-gray-800';
            case 'Escalated':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Priority color
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'Medium':
                return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Low':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    // Handle status change
    const handleStatusChange = async (query: Query, newStatus: string) => {
        const result = await queriesService.updateStatus(query.query_id!, newStatus as any);
        if (result.success) {
            await loadQueries();
        } else {
            alert('Failed to update status');
        }
    };

    // Handle delete
    const handleDelete = async (queryId: number) => {
        if (!confirm('Are you sure you want to delete this query?')) return;

        const result = await queriesService.deleteQuery(queryId);
        if (result.success) {
            await loadQueries();
        } else {
            alert('Failed to delete query');
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        if (selectedRows.size === 0) {
            alert('No queries selected');
            return;
        }

        if (!confirm(`Delete ${selectedRows.size} selected queries?`)) return;

        for (const id of selectedRows) {
            await queriesService.deleteQuery(id);
        }

        setSelectedRows(new Set());
        await loadQueries();
    };

    // Handle customer name click
    const handleCustomerClick = (query: Query) => {
        if (query.customer_id) {
            setSelectedCustomerId(query.customer_id);
            setShowCustomerDialog(true);
        } else {
            alert('No customer linked to this query');
        }
    };

    // Handle escalate
    const handleEscalate = (query: Query) => {
        setSelectedQuery(query);
        setShowEscalateDialog(true);
    };

    // Handle conversation
    const handleConversation = (query: Query) => {
        setSelectedQuery(query);
        setShowConversationDialog(true);
    };

    // Toggle row selection
    const toggleRowSelection = (queryId: number) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(queryId)) {
            newSelected.delete(queryId);
        } else {
            newSelected.add(queryId);
        }
        setSelectedRows(newSelected);
    };

    // Select all
    const toggleSelectAll = () => {
        if (selectedRows.size === paginatedQueries.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedQueries.map(q => q.query_id!)));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading queries...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Customer Queries</h1>
                    <p className="text-gray-600">Manage customer inquiries from Email, WhatsApp, and Phone</p>
                </div>
                <div className="flex items-center gap-3">
                    {selectedRows.size > 0 && (
                        <>
                            <Button variant="destructive" onClick={handleBulkDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Selected ({selectedRows.size})
                            </Button>
                            <Button variant="outline" onClick={() => alert('Export feature coming soon')}>
                                <Download className="h-4 w-4 mr-2" />
                                Export Selected
                            </Button>
                        </>
                    )}
                    <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Query
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total Queries</div>
                        <div className="text-2xl font-bold text-purple-600">{queries.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Open</div>
                        <div className="text-2xl font-bold text-red-600">
                            {queries.filter(q => q.status === 'Open').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">In Progress</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {queries.filter(q => q.status === 'In Progress').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Resolved</div>
                        <div className="text-2xl font-bold text-green-600">
                            {queries.filter(q => q.status === 'Resolved').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Escalated</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {queries.filter(q => q.is_escalated).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by name, mobile, email, status, order ID, or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.size === paginatedQueries.length && paginatedQueries.length > 0}
                                            onChange={toggleSelectAll}
                                            className="rounded"
                                        />
                                    </th>
                                    <th className="p-3 text-left font-semibold text-sm">Source</th>
                                    <th className="p-3 text-left font-semibold text-sm">Customer</th>
                                    <th className="p-3 text-left font-semibold text-sm">Contact</th>
                                    <th className="p-3 text-left font-semibold text-sm">Status</th>
                                    <th className="p-3 text-left font-semibold text-sm">Priority</th>
                                    <th className="p-3 text-left font-semibold text-sm">Order ID</th>
                                    <th className="p-3 text-left font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedQueries.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-gray-500">
                                            No queries found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedQueries.map((query) => (
                                        <tr key={query.query_id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRows.has(query.query_id!)}
                                                    onChange={() => toggleRowSelection(query.query_id!)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    {getSourceIcon(query.source)}
                                                    <span className="text-xs text-gray-600">{query.source}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <button
                                                        onClick={() => handleCustomerClick(query)}
                                                        className="text-purple-600 hover:text-purple-800 hover:underline font-medium"
                                                    >
                                                        {query.name}
                                                    </button>
                                                    {query.is_escalated && (
                                                        <div className="mt-1">
                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-semibold border border-purple-300">
                                                                ⬆️ Escalated to Ticket
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="text-sm">
                                                    <div className="font-medium">{query.mobile_number}</div>
                                                    {query.email && (
                                                        <div className="text-xs text-gray-500">{query.email}</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <select
                                                    value={query.status}
                                                    onChange={(e) => handleStatusChange(query, e.target.value)}
                                                    className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getStatusColor(query.status)}`}
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Resolved">Resolved</option>
                                                    <option value="Closed">Closed</option>
                                                </select>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(query.priority || 'Medium')}`}>
                                                    {query.priority || 'Medium'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {query.order_id ? (
                                                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                                                        {query.order_id}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleConversation(query)}
                                                        title="View Conversation"
                                                    >
                                                        <MessageCircle className="h-4 w-4" />
                                                    </Button>
                                                    {!query.is_escalated && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEscalate(query)}
                                                            title="Escalate to Ticket"
                                                            className="text-purple-600 hover:text-purple-800"
                                                        >
                                                            <ArrowUpCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDelete(query.query_id!)}
                                                        title="Delete"
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setCurrentPage(0);
                                }}
                                className="border rounded px-2 py-1 text-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="text-sm text-gray-600">
                            Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredQueries.length)} of {filteredQueries.length} queries
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
                            <span className="text-sm text-gray-600">
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
                </CardContent>
            </Card>

            {/* Dialogs */}
            {showAddDialog && (
                <AddQueryDialog
                    open={showAddDialog}
                    onClose={() => setShowAddDialog(false)}
                    onSuccess={loadQueries}
                />
            )}

            {showCustomerDialog && selectedCustomerId && (
                <CustomerDetailsDialog
                    open={showCustomerDialog}
                    onClose={() => {
                        setShowCustomerDialog(false);
                        setSelectedCustomerId(null);
                    }}
                    customerId={selectedCustomerId}
                />
            )}

            {showEscalateDialog && selectedQuery && (
                <EscalateDialog
                    open={showEscalateDialog}
                    onClose={() => {
                        setShowEscalateDialog(false);
                        setSelectedQuery(null);
                    }}
                    query={selectedQuery}
                    onSuccess={loadQueries}
                />
            )}

            {showConversationDialog && selectedQuery && (
                <ConversationDialog
                    open={showConversationDialog}
                    onClose={() => {
                        setShowConversationDialog(false);
                        setSelectedQuery(null);
                    }}
                    query={selectedQuery}
                />
            )}
        </div>
    );
}

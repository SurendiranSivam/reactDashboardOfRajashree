'use client';

import { useState, useEffect, useMemo } from 'react';
import { customersService } from '@/lib/services/customers.service';
import { excelService } from '@/lib/services/excel.service';
import type { Customer } from '@/types/customers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search, RefreshCw, FileDown, Users, UserPlus, Mail,
    Phone, TrendingUp, Filter, Download, Trash2, CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [selectedCustomers, setSelectedCustomers] = useState<Set<number>>(new Set());
    const [filterState, setFilterState] = useState('all');
    const pageSizeOptions = [10, 20, 50, 100];

    // Fetch customers
    useEffect(() => {
        async function loadCustomers() {
            setLoading(true);
            const data = await customersService.fetchCustomers();
            setCustomers(data);
            setLoading(false);
        }
        loadCustomers();
    }, []);

    // Calculate summary stats
    const stats = useMemo(() => {
        const totalCustomers = customers.length;
        const thisMonth = customers.filter(c => {
            const created = new Date(c.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        }).length;

        const withEmail = customers.filter(c => c.email && c.email.length > 0).length;
        const withMobile = customers.filter(c => c.mobile_number && c.mobile_number.length > 0).length;

        return {
            total: totalCustomers,
            newThisMonth: thisMonth,
            withEmail,
            withMobile,
            growthRate: totalCustomers > 0 ? ((thisMonth / totalCustomers) * 100).toFixed(1) : '0'
        };
    }, [customers]);

    // Search filter
    const filteredCustomers = useMemo(() => {
        const query = searchQuery.toLowerCase();
        let filtered = customers;

        // Apply state filter
        if (filterState !== 'all') {
            filtered = filtered.filter(c => c.state === filterState);
        }

        // Apply search
        if (query) {
            filtered = filtered.filter((customer) =>
                customer.full_name?.toLowerCase().includes(query) ||
                customer.mobile_number?.includes(query) ||
                customer.email?.toLowerCase().includes(query) ||
                customer.state?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [customers, searchQuery, filterState]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
    const paginatedCustomers = filteredCustomers.slice(
        page * pageSize,
        (page + 1) * pageSize
    );

    // Selection handlers
    const handleSelectAll = () => {
        if (selectedCustomers.size === paginatedCustomers.length) {
            setSelectedCustomers(new Set());
        } else {
            setSelectedCustomers(new Set(paginatedCustomers.map(c => c.customer_id)));
        }
    };

    const handleSelectCustomer = (id: number) => {
        const newSelected = new Set(selectedCustomers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedCustomers(newSelected);
    };

    // Export to Excel
    function exportToExcel() {
        const excelData = filteredCustomers.map(customer => ({
            'Customer ID': customer.customer_id,
            'Full Name': customer.full_name,
            'Mobile': customer.mobile_number,
            'Email': customer.email,
            'State': customer.state || '-',
            'Pincode': customer.pincode || '-',
            'Address': customer.address || '-',
            'Created': format(new Date(customer.created_at), 'yyyy-MM-dd'),
        }));

        const XLSX = require('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

        const timestamp = new Date().toISOString().split('T')[0];
        XLSX.writeFile(workbook, `Customers_${timestamp}.xlsx`);
    }

    // Get unique states
    const uniqueStates = useMemo(() => {
        return Array.from(new Set(customers.map(c => c.state).filter(Boolean))).sort();
    }, [customers]);

    return (
        <div className="p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            Customer Management
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Manage and track your customer base
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={() => window.location.reload()} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={exportToExcel} variant="outline" disabled={filteredCustomers.length === 0}>
                            <FileDown className="h-4 w-4 mr-2" />
                            Export Excel
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-600 opacity-10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            Total Customers
                        </CardTitle>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                            <Users className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                        <p className="text-sm text-gray-600 mt-2">All time customers</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 opacity-10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            New This Month
                        </CardTitle>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                            <UserPlus className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-gray-900">{stats.newThisMonth}</div>
                        <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {stats.growthRate}% of total
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            With Email
                        </CardTitle>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                            <Mail className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-gray-900">{stats.withEmail}</div>
                        <p className="text-sm text-gray-600 mt-2">
                            {((stats.withEmail / stats.total) * 100).toFixed(0)}% coverage
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 opacity-10 rounded-full -mr-16 -mt-16" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                        <CardTitle className="text-sm font-medium text-gray-700">
                            With Mobile
                        </CardTitle>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                            <Phone className="h-5 w-5 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="text-3xl font-bold text-gray-900">{stats.withMobile}</div>
                        <p className="text-sm text-gray-600 mt-2">
                            {((stats.withMobile / stats.total) * 100).toFixed(0)}% coverage
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters \u0026 Actions */}
            <Card className="border-0 shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-4 items-end">
                        {/* Search */}
                        <div className="flex-1 min-w-[250px]">
                            <label className="text-sm font-medium mb-2 block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by name, mobile, email, or state..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(0);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* State Filter */}
                        <div className="min-w-[180px]">
                            <label className="text-sm font-medium mb-2 block">Filter by State</label>
                            <select
                                value={filterState}
                                onChange={(e) => {
                                    setFilterState(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium"
                            >
                                <option value="all">All States</option>
                                {uniqueStates.map(state => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSearchQuery('');
                                setFilterState('all');
                                setPage(0);
                            }}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>

                    {/* Selection Actions */}
                    {selectedCustomers.size > 0 && (
                        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2 text-indigo-900">
                                <CheckSquare className="h-5 w-5" />
                                <span className="font-medium">{selectedCustomers.size} customer(s) selected</span>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                </Button>
                                <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export Selected
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-600" />
                        Customers ({filteredCustomers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-8 w-8 animate-spin text-orange-600" />
                        </div>
                    ) : paginatedCustomers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No customers found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                                        <th className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedCustomers.size === paginatedCustomers.length}
                                                onChange={handleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="p-4 text-left font-semibold text-gray-700">ID</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Name</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Mobile</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Email</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">State</th>
                                        <th className="p-4 text-left font-semibold text-gray-700">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedCustomers.map((customer) => (
                                        <tr
                                            key={customer.customer_id}
                                            className={cn(
                                                "border-b hover:bg-indigo-50/50 transition-colors",
                                                selectedCustomers.has(customer.customer_id) && "bg-indigo-50"
                                            )}
                                        >
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCustomers.has(customer.customer_id)}
                                                    onChange={() => handleSelectCustomer(customer.customer_id)}
                                                    className="w-4 h-4 rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="p-4 text-sm font-mono text-gray-600">{customer.customer_id}</td>
                                            <td className="p-4 font-medium text-gray-900">{customer.full_name}</td>
                                            <td className="p-4 text-gray-700">{customer.mobile_number}</td>
                                            <td className="p-4 text-sm text-gray-600">{customer.email || '-'}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                    {customer.state || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600">
                                                {format(new Date(customer.created_at), 'dd MMM yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(0);
                                }}
                                className="border rounded px-3 py-1.5 text-sm bg-white"
                            >
                                {pageSizeOptions.map((size) => (
                                    <option key={size} value={size}>
                                        {size}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                Showing {page * pageSize + 1} - {Math.min((page + 1) * pageSize, filteredCustomers.length)} of {filteredCustomers.length}
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                >
                                    Previous
                                </Button>
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Search, DollarSign, Receipt, List, TrendingUp, TrendingDown } from 'lucide-react';
import { vendorsApiService } from '@/lib/services/vendors-api.service';
import { vendorLedgerService } from '@/lib/services/vendor-ledger.service';
import type { Vendor } from '@/types/vendors';
import type { VendorLedgerEntry, VendorBalance } from '@/types/vendor-ledger';

export default function VendorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = parseInt(params.id as string);

    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [ledger, setLedger] = useState<VendorLedgerEntry[]>([]);
    const [balance, setBalance] = useState<VendorBalance | null>(null);
    const [outstandingInvoices, setOutstandingInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    // Payment form
    const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
    const [amountPaid, setAmountPaid] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadVendorData();
    }, [vendorId]);

    const loadVendorData = async () => {
        setLoading(true);

        // Fetch vendor
        const vendorsResult = await vendorsApiService.fetchVendors();
        const foundVendor = vendorsResult.data.find(v => v.vendor_id === vendorId);
        setVendor(foundVendor || null);

        // Fetch ledger
        const ledgerResult = await vendorLedgerService.fetchVendorLedger(vendorId);
        setLedger(ledgerResult.data || []);

        // Fetch balance
        const balanceResult = await vendorLedgerService.getVendorBalance(vendorId);
        setBalance(balanceResult.data);

        // Fetch outstanding invoices
        const invoicesResult = await vendorLedgerService.getOutstandingInvoices(vendorId);
        setOutstandingInvoices(invoicesResult.data || []);

        setLoading(false);
    };

    const handleOpenPaymentDialog = () => {
        setShowPaymentDialog(true);
        setSelectedInvoiceId(null);
        setAmountPaid('');
        setDescription('');
    };

    const handleSubmitPayment = async () => {
        if (!amountPaid || parseFloat(amountPaid) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const selectedInvoice = outstandingInvoices.find(inv => inv.purchase_id === selectedInvoiceId);

        const result = await vendorLedgerService.recordPayment({
            vendor_id: vendorId,
            amount: parseFloat(amountPaid),
            description: description || undefined,
            purchase_id: selectedInvoiceId || undefined,
            invoice_no: selectedInvoice?.invoice_no || undefined,
        });

        if (result.success) {
            setShowPaymentDialog(false);
            await loadVendorData();
            alert('✅ Payment recorded successfully');
        } else {
            alert('❌ Failed to record payment: ' + result.error);
        }
    };

    const handleToggleStatus = async () => {
        if (!vendor) return;

        const result = await vendorLedgerService.toggleVendorStatus(vendorId, !vendor.is_active);

        if (result.success) {
            await loadVendorData();
            alert('✅ Vendor status updated');
        } else {
            alert('❌ Failed to update status: ' + result.error);
        }
    };

    // Filter ledger
    const filteredLedger = ledger.filter(entry =>
        searchQuery === '' ||
        entry.invoice_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.reference_id?.toString().includes(searchQuery)
    );

    const selectedInvoice = outstandingInvoices.find(inv => inv.purchase_id === selectedInvoiceId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading vendor ledger...</p>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="p-6">
                <p className="text-red-600">Vendor not found</p>
                <Button onClick={() => router.back()} className="mt-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-purple-600">{vendor.name}</h1>
                        <p className="text-gray-600">Vendor Ledger & Transactions</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant={vendor.is_active ? "outline" : "default"}
                        onClick={handleToggleStatus}
                        className={vendor.is_active ? "border-green-600 text-green-600" : "bg-red-600 text-white"}
                    >
                        {vendor.is_active ? '✓ Active' : '✗ Inactive'}
                    </Button>
                    <Button onClick={handleOpenPaymentDialog} className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Record Payment
                    </Button>
                </div>
            </div>

            {/* Vendor Info Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Contact Number</p>
                            <p className="font-semibold">📞 {vendor.contact_number}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-semibold">📍 {vendor.address}</p>
                        </div>
                        {vendor.gst && (
                            <div>
                                <p className="text-sm text-gray-600">GST</p>
                                <p className="font-semibold">{vendor.gst}</p>
                            </div>
                        )}
                        {vendor.email && (
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-semibold">📧 {vendor.email}</p>
                            </div>
                        )}
                        {vendor.contact_person && (
                            <div>
                                <p className="text-sm text-gray-600">Contact Person</p>
                                <p className="font-semibold">{vendor.contact_person}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Balance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Current Balance</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ₹{(balance?.current_balance || 0).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Amount Owed</p>
                            </div>
                            <DollarSign className="h-8 w-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Purchases</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    ₹{(balance?.total_purchases || 0).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">All Time</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Paid</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₹{(balance?.total_paid || 0).toLocaleString('en-IN')}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">All Payments</p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Transactions</p>
                                <p className="text-2xl font-bold text-blue-600">{filteredLedger.length}</p>
                                <p className="text-xs text-gray-500 mt-1">Total Entries</p>
                            </div>
                            <List className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search by Invoice No, Description, or Reference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Ledger Table */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Ledger Entries</h2>
                    {filteredLedger.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No ledger entries found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="p-3 text-left font-semibold">Date</th>
                                        <th className="p-3 text-left font-semibold">Type</th>
                                        <th className="p-3 text-left font-semibold">Reference</th>
                                        <th className="p-3 text-left font-semibold">Invoice</th>
                                        <th className="p-3 text-right font-semibold text-red-600">Debit (+)</th>
                                        <th className="p-3 text-right font-semibold text-green-600">Credit (-)</th>
                                        <th className="p-3 text-right font-semibold">Running Balance</th>
                                        <th className="p-3 text-left font-semibold">Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLedger.map((entry) => (
                                        <tr key={entry.ledger_id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-sm">
                                                {new Date(entry.transaction_date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${entry.transaction_type === 'DEBIT'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {entry.transaction_type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm">
                                                <span className="text-gray-600">{entry.reference_type}</span>
                                                {entry.reference_id && (
                                                    <span className="text-gray-400 ml-1">#{entry.reference_id}</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-sm">{entry.invoice_no || '-'}</td>
                                            <td className="p-3 text-right font-semibold text-red-600">
                                                {entry.debit_amount > 0 ? `₹${entry.debit_amount.toLocaleString('en-IN')}` : '-'}
                                            </td>
                                            <td className="p-3 text-right font-semibold text-green-600">
                                                {entry.credit_amount > 0 ? `₹${entry.credit_amount.toLocaleString('en-IN')}` : '-'}
                                            </td>
                                            <td className="p-3 text-right font-bold text-purple-600">
                                                ₹{entry.running_balance.toLocaleString('en-IN')}
                                            </td>
                                            <td className="p-3 text-sm text-gray-700">
                                                {entry.description || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Record Payment Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Invoice Selection */}
                        <div>
                            <Label htmlFor="invoice">Select Invoice (Optional)</Label>
                            <select
                                id="invoice"
                                className="w-full px-3 py-2 border rounded-md mt-1"
                                value={selectedInvoiceId || ''}
                                onChange={(e) => setSelectedInvoiceId(e.target.value ? parseInt(e.target.value) : null)}
                            >
                                <option value="">Manual Payment (No Invoice)</option>
                                {outstandingInvoices.map((inv) => (
                                    <option key={inv.purchase_id} value={inv.purchase_id}>
                                        {inv.invoice_no} (₹{inv.balance.toLocaleString('en-IN')} pending)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Invoice Details */}
                        {selectedInvoice && (
                            <div className="p-3 bg-gray-50 rounded-lg space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Invoice Total:</span>
                                    <span className="font-semibold">₹{selectedInvoice.total_amount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Already Paid:</span>
                                    <span className="font-semibold">₹{selectedInvoice.paid.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Outstanding:</span>
                                    <span className="font-semibold text-red-600">₹{selectedInvoice.balance.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        )}

                        {/* Amount Paid */}
                        <div>
                            <Label htmlFor="amount">Amount Paid *</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="Enter amount"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        {/* New Balance Preview */}
                        {selectedInvoice && amountPaid && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-blue-900">New Balance:</span>
                                    <span className="text-xl font-bold text-blue-900">
                                        ₹{Math.max(0, selectedInvoice.balance - parseFloat(amountPaid || '0')).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                placeholder="Add a note..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitPayment} className="bg-green-600 hover:bg-green-700">
                            Save Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

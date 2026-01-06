'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface CustomerDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    customerId: number;
}

export function CustomerDetailsDialog({ open, onClose, customerId }: CustomerDetailsDialogProps) {
    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && customerId) {
            loadCustomerDetails();
        }
    }, [open, customerId]);

    const loadCustomerDetails = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/customers?customer_id=eq.${customerId}`,
                {
                    headers: {
                        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
                    },
                }
            );
            const data = await response.json();
            setCustomer(data[0] || null);
        } catch (error) {
            console.error('Error loading customer:', error);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Customer Details</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : !customer ? (
                    <div className="text-center py-8 text-gray-500">Customer not found</div>
                ) : (
                    <div className="space-y-4">
                        {/* Basic Info */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-lg mb-3">{customer.full_name || customer.name}</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-gray-600">📞 Mobile:</span>
                                        <span className="ml-2 font-medium">{customer.mobile}</span>
                                    </div>
                                    {customer.email && (
                                        <div>
                                            <span className="text-gray-600">📧 Email:</span>
                                            <span className="ml-2 font-medium">{customer.email}</span>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div className="col-span-2">
                                            <span className="text-gray-600">📍 Address:</span>
                                            <span className="ml-2">{customer.address}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order History Placeholder */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-2">Order History</h3>
                                <div className="text-sm text-gray-500">
                                    Feature coming soon - will show order statistics
                                </div>
                            </CardContent>
                        </Card>

                        {/* Support History Placeholder */}
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-2">Support History</h3>
                                <div className="text-sm text-gray-500">
                                    Feature coming soon - will show previous queries & tickets
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

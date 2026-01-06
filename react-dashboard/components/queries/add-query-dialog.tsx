'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queriesService } from '@/lib/services/queries.service';

interface AddQueryDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddQueryDialog({ open, onClose, onSuccess }: AddQueryDialogProps) {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [orderId, setOrderId] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name || !mobile || !message) {
            alert('Please fill required fields');
            return;
        }

        setLoading(true);
        const result = await queriesService.addQuery({
            name,
            mobile_number: mobile,
            email: email || undefined,
            message,
            order_id: orderId || undefined,
            remarks: remarks || undefined,
            source: 'Phone', // Always Phone for manual entry
            priority: orderId ? 'High' : 'Medium',
            status: 'Open',
        });

        setLoading(false);

        if (result.success) {
            onSuccess();
            onClose();
            // Reset form
            setName('');
            setMobile('');
            setEmail('');
            setMessage('');
            setOrderId('');
            setRemarks('');
        } else {
            alert('Failed to add query: ' + result.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Query (Phone Call)</DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        For manual entry of phone call queries.
                        Email & WhatsApp queries are auto-imported.
                    </p>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name">Customer Name *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter customer name"
                        />
                    </div>

                    {/* Mobile */}
                    <div>
                        <Label htmlFor="mobile">Mobile Number *</Label>
                        <Input
                            id="mobile"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="+91 9876543210"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="customer@example.com"
                        />
                    </div>

                    {/* Order ID */}
                    <div>
                        <Label htmlFor="orderId">Order ID (Optional)</Label>
                        <Input
                            id="orderId"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="ORD-001"
                        />
                        {orderId && (
                            <p className="text-xs text-gray-500 mt-1">Priority will be set to High</p>
                        )}
                    </div>

                    {/* Message */}
                    <div>
                        <Label htmlFor="message">Message *</Label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe the customer's query..."
                            className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                        />
                    </div>

                    {/* Remarks */}
                    <div>
                        <Label htmlFor="remarks">Internal Remarks (Optional)</Label>
                        <Input
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder="Internal notes..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                        {loading ? 'Saving...' : 'Save Query'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

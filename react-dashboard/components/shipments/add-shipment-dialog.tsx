'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { shipmentsApiService } from '@/lib/services/shipments-api.service';
import { SHIPPING_PROVIDERS, type ShippingProvider } from '@/types/shipments';

interface AddShipmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddShipmentDialog({ open, onOpenChange, onSuccess }: AddShipmentDialogProps) {
    const [orderId, setOrderId] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shippingProvider, setShippingProvider] = useState<ShippingProvider | ''>('');
    const [trackingUrl, setTrackingUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-detect provider from tracking number
    useEffect(() => {
        if (!trackingNumber) return;

        let provider: ShippingProvider | '' = '';

        // India Post → CxxxxxIN
        if (trackingNumber.startsWith('C') && trackingNumber.endsWith('IN')) {
            provider = 'India Post';
        }
        // DTDC → Starts with C + digits but NOT ending with IN
        else if (/^C\d+$/.test(trackingNumber)) {
            provider = 'DTDC';
        }
        // Franch Express → numeric only + starts with 480
        else if (/^480\d+$/.test(trackingNumber)) {
            provider = 'Franch Express';
        }

        setShippingProvider(provider);
    }, [trackingNumber]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderId || !trackingNumber || !shippingProvider) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await shipmentsApiService.updateTrackingNumber(
                orderId,
                trackingNumber,
                shippingProvider,
                false
            );

            if (result.success) {
                onSuccess();
                onOpenChange(false);
                resetForm();
            } else {
                setError(result.error || 'Failed to add shipment');
            }
        } catch (err) {
            setError('An error occurred while adding shipment');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setOrderId('');
        setTrackingNumber('');
        setShippingProvider('');
        setTrackingUrl('');
        setError(null);
    };

    // Mock data for testing
    const fillMockData = () => {
        setOrderId('WA000005');
        setTrackingNumber('C123456');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Shipment</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Order ID */}
                    <div>
                        <Label htmlFor="order-id">Order ID *</Label>
                        <Input
                            id="order-id"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            required
                            placeholder="Scan or enter Order ID"
                        />
                    </div>

                    {/* Tracking ID */}
                    <div>
                        <Label htmlFor="tracking-id">Tracking ID *</Label>
                        <Input
                            id="tracking-id"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            required
                            placeholder="Scan or enter Tracking ID"
                        />
                    </div>

                    {/* Shipping Provider */}
                    <div>
                        <Label htmlFor="provider">Shipping Provider *</Label>
                        <select
                            id="provider"
                            className="w-full px-3 py-2 border rounded-md"
                            value={shippingProvider}
                            onChange={(e) => setShippingProvider(e.target.value as ShippingProvider)}
                            required
                        >
                            <option value="">Select Provider</option>
                            {SHIPPING_PROVIDERS.map(provider => (
                                <option key={provider} value={provider}>
                                    {provider}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tracking URL (if available) */}
                    {trackingUrl && (
                        <div className="text-sm text-blue-600">
                            🔗 Tracking URL: {trackingUrl}
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={fillMockData}>
                            Fill Mock Data
                        </Button>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

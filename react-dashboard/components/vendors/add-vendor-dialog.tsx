'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { vendorsApiService } from '@/lib/services/vendors-api.service';
import type { Vendor } from '@/types/vendors';

interface AddVendorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    initialVendor?: Vendor;
}

export function AddVendorDialog({ open, onOpenChange, onSuccess, initialVendor }: AddVendorDialogProps) {
    const [name, setName] = useState(initialVendor?.name || '');
    const [address, setAddress] = useState(initialVendor?.address || '');
    const [contactNumber, setContactNumber] = useState(initialVendor?.contact_number || '');
    const [gst, setGst] = useState(initialVendor?.gst || '');
    const [email, setEmail] = useState(initialVendor?.email || '');
    const [contactPerson, setContactPerson] = useState(initialVendor?.contact_person || '');
    const [paymentTerms, setPaymentTerms] = useState(initialVendor?.payment_terms || '');
    const [bankAccount, setBankAccount] = useState(initialVendor?.bank_account || '');
    const [ifsc, setIfsc] = useState(initialVendor?.ifsc || '');
    const [panNumber, setPanNumber] = useState(initialVendor?.pan_number || '');
    const [notes, setNotes] = useState(initialVendor?.notes || '');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEditMode = !!initialVendor;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !address || !contactNumber) {
            setError('Please fill all required fields (Name, Address, Contact Number)');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const vendorData: Vendor = {
                name,
                address,
                contact_number: contactNumber,
                gst,
                email: email || undefined,
                contact_person: contactPerson || undefined,
                payment_terms: paymentTerms || undefined,
                bank_account: bankAccount || undefined,
                ifsc: ifsc || undefined,
                pan_number: panNumber || undefined,
                notes: notes || undefined,
                is_active: true,
            };

            const result = isEditMode
                ? await vendorsApiService.updateVendor(initialVendor.vendor_id!, vendorData)
                : await vendorsApiService.addVendor(vendorData);

            if (result.success) {
                onSuccess();
                onOpenChange(false);
                resetForm();
            } else {
                setError(result.error || 'Failed to save vendor');
            }
        } catch (err) {
            setError('An error occurred while saving vendor');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setAddress('');
        setContactNumber('');
        setGst('');
        setEmail('');
        setContactPerson('');
        setPaymentTerms('');
        setBankAccount('');
        setIfsc('');
        setPanNumber('');
        setNotes('');
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Vendor' : 'Add Vendor'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Mandatory Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="name">Vendor Name *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="ABC Suppliers"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="address">Address *</Label>
                            <Textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                placeholder="Street, City, State, PIN"
                                rows={2}
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact">Contact Number *</Label>
                            <Input
                                id="contact"
                                type="tel"
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                required
                                placeholder="9876543210"
                            />
                        </div>

                        <div>
                            <Label htmlFor="gst">GST Number</Label>
                            <Input
                                id="gst"
                                value={gst}
                                onChange={(e) => setGst(e.target.value)}
                                placeholder="22AAAAA0000A1Z5"
                            />
                        </div>
                    </div>

                    {/* Optional Fields */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold mb-3">Additional Information (Optional)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vendor@example.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact-person">Contact Person</Label>
                                <Input
                                    id="contact-person"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <Label htmlFor="payment-terms">Payment Terms</Label>
                                <Input
                                    id="payment-terms"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                    placeholder="Net 30 days"
                                />
                            </div>

                            <div>
                                <Label htmlFor="bank-account">Bank Account</Label>
                                <Input
                                    id="bank-account"
                                    value={bankAccount}
                                    onChange={(e) => setBankAccount(e.target.value)}
                                    placeholder="1234567890"
                                />
                            </div>

                            <div>
                                <Label htmlFor="ifsc">IFSC Code</Label>
                                <Input
                                    id="ifsc"
                                    value={ifsc}
                                    onChange={(e) => setIfsc(e.target.value)}
                                    placeholder="SBIN0001234"
                                />
                            </div>

                            <div>
                                <Label htmlFor="pan">PAN Number</Label>
                                <Input
                                    id="pan"
                                    value={panNumber}
                                    onChange={(e) => setPanNumber(e.target.value)}
                                    placeholder="AAAAA1234A"
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                            {loading ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

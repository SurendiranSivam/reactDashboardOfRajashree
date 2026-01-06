'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Plus, X, Check } from 'lucide-react';
import { purchasesApiService } from '@/lib/services/purchases-api.service';
import { productsService } from '@/lib/services/products.service';

interface AddPurchaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface PurchaseItem {
    variant_id: number | null;
    sku: string;
    quantity: number;
    unit_price: number;
}

export function AddPurchaseDialog({ open, onOpenChange, onSuccess }: AddPurchaseDialogProps) {
    const [invoiceNo, setInvoiceNo] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [vendorId, setVendorId] = useState<number | ''>('');
    const [invoiceImageUrl, setInvoiceImageUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [items, setItems] = useState<PurchaseItem[]>([]);

    const [vendors, setVendors] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch vendors and variants on mount
    useEffect(() => {
        if (open) {
            fetchVendorsAndVariants();
        }
    }, [open]);

    const fetchVendorsAndVariants = async () => {
        try {
            // Fetch products to get all variants with SKUs
            const productsResult = await productsService.fetchProductsViaEdgeFunction(1, 1000);
            const allVariants: any[] = [];

            productsResult.data.forEach((product: any) => {
                if (product.variants && product.variants.length > 0) {
                    product.variants.forEach((variant: any) => {
                        allVariants.push({
                            variant_id: variant.variant_id || variant.id,
                            sku: variant.sku,
                            product_name: product.name,
                            variant_name: variant.variant_name || variant.name,
                        });
                    });
                }
            });

            setVariants(allVariants);
            console.log('✅ Loaded', allVariants.length, 'variants');

            // Fetch vendors
            const { vendorsApiService } = await import('@/lib/services/vendors-api.service');
            const vendorsResult = await vendorsApiService.fetchVendors();
            setVendors(vendorsResult.data || []);
            console.log('✅ Loaded', vendorsResult.data?.length || 0, 'vendors');
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // TODO: Upload to Supabase Storage
            // For now, create a data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setInvoiceImageUrl(reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Upload error:', err);
            setIsUploading(false);
        }
    };

    const handleAddSKU = () => {
        setItems([...items, { variant_id: null, sku: '', quantity: 1, unit_price: 0 }]);
    };

    const handleRemoveSKU = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-fill SKU when variant is selected
        if (field === 'variant_id' && value) {
            const variant = variants.find(v => v.variant_id === value);
            if (variant) {
                newItems[index].sku = variant.sku;
            }
        }

        setItems(newItems);
    };

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!invoiceNo || !vendorId || items.length === 0) {
            setError('Please fill all required fields and add at least one item');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const purchaseData = {
                invoice_no: invoiceNo,
                invoice_date: invoiceDate,
                vendor_id: vendorId,
                amount: total,
                invoice_image: invoiceImageUrl,
                items: items.map(item => ({
                    variant_id: item.variant_id!,
                    quantity: item.quantity,
                    cost_price: item.unit_price
                }))
            };

            const result = await purchasesApiService.addPurchase(purchaseData);

            if (result.success) {
                onSuccess();
                onOpenChange(false);
                resetForm();
            } else {
                setError(result.error || 'Failed to add purchase');
            }
        } catch (err) {
            setError('An error occurred while adding purchase');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setInvoiceNo('');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setVendorId('');
        setInvoiceImageUrl(null);
        setItems([]);
        setError(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Purchase</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Invoice No */}
                    <div>
                        <Label htmlFor="invoice-no">Invoice No *</Label>
                        <Input
                            id="invoice-no"
                            value={invoiceNo}
                            onChange={(e) => setInvoiceNo(e.target.value)}
                            required
                            placeholder="q35q45"
                        />
                    </div>

                    {/* Vendor */}
                    <div>
                        <Label htmlFor="vendor">Vendor *</Label>
                        <select
                            id="vendor"
                            className="w-full px-3 py-2 border rounded-md"
                            value={vendorId}
                            onChange={(e) => setVendorId(parseInt(e.target.value))}
                            required
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map(v => (
                                <option key={v.vendor_id} value={v.vendor_id}>
                                    {v.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Invoice Date */}
                    <div>
                        <Label htmlFor="invoice-date">Invoice Date *</Label>
                        <Input
                            id="invoice-date"
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            required
                        />
                    </div>

                    {/* Upload Invoice Image */}
                    <div className="border-t pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={isUploading}
                            />
                            <Button type="button" variant="outline" asChild>
                                <span>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Invoice Image
                                </span>
                            </Button>
                            {invoiceImageUrl && <Check className="h-5 w-5 text-green-600" />}
                            {isUploading && (
                                <div className="h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                            )}
                        </label>
                    </div>

                    {/* SKU Items */}
                    <div className="border-t pt-4 space-y-3">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                {/* SKU Dropdown */}
                                <div className="col-span-4">
                                    <Label className="text-xs">SKU *</Label>
                                    <select
                                        className="w-full px-2 py-1 border rounded text-sm"
                                        value={item.variant_id || ''}
                                        onChange={(e) => handleItemChange(index, 'variant_id', parseInt(e.target.value))}
                                        required
                                    >
                                        <option value="">Select SKU</option>
                                        {variants.map(v => (
                                            <option key={v.variant_id} value={v.variant_id}>
                                                {v.sku} - {v.product_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Quantity */}
                                <div className="col-span-2">
                                    <Label className="text-xs">Qty *</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className="text-sm"
                                        required
                                    />
                                </div>

                                {/* Unit Price */}
                                <div className="col-span-3">
                                    <Label className="text-xs">Unit Price *</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={item.unit_price}
                                        onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                        className="text-sm"
                                        required
                                    />
                                </div>

                                {/* Subtotal */}
                                <div className="col-span-2 text-right font-semibold text-sm">
                                    ₹{(item.quantity * item.unit_price).toFixed(2)}
                                </div>

                                {/* Remove Button */}
                                <div className="col-span-1">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSKU(index)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Remove"
                                    >
                                        <X className="h-4 w-4 text-red-600" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add SKU Button */}
                        <Button type="button" variant="outline" size="sm" onClick={handleAddSKU}>
                            <Plus className="h-4 w-4 mr-1" />
                            Add SKU
                        </Button>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                        <p className="text-lg font-bold text-center">
                            Total: ₹{total.toFixed(2)}
                        </p>
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

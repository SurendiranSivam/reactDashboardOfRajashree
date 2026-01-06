'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Trash2, Edit, Copy } from 'lucide-react';
import { marketingService } from '@/lib/services/marketing.service';
import type { Coupon } from '@/types/marketing';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

    // Form state
    const [code, setCode] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed_amount' | 'buy_x_get_y'>('percentage');
    const [value, setValue] = useState('');
    const [minOrderValue, setMinOrderValue] = useState('');
    const [usageLimit, setUsageLimit] = useState('');
    const [startsAt, setStartsAt] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        const { data } = await marketingService.fetchCoupons();
        setCoupons(data);
        setLoading(false);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
    };

    const handleSubmit = async () => {
        if (!code || !value || !startsAt || !expiresAt) {
            alert('Please fill all required fields');
            return;
        }

        const couponData: Partial<Coupon> = {
            code: code.toUpperCase(),
            type,
            value: parseFloat(value),
            min_order_value: minOrderValue ? parseFloat(minOrderValue) : 0,
            usage_limit: usageLimit ? parseInt(usageLimit) : null,
            starts_at: new Date(startsAt).toISOString(),
            expires_at: new Date(expiresAt).toISOString(),
            is_active: true,
        };

        if (editingCoupon) {
            await marketingService.updateCoupon(editingCoupon.id, couponData);
        } else {
            await marketingService.addCoupon(couponData);
        }

        resetForm();
        loadCoupons();
        setShowDialog(false);
    };

    const resetForm = () => {
        setCode('');
        setType('percentage');
        setValue('');
        setMinOrderValue('');
        setUsageLimit('');
        setStartsAt('');
        setExpiresAt('');
        setEditingCoupon(null);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setCode(coupon.code);
        setType(coupon.type);
        setValue(coupon.value.toString());
        setMinOrderValue(coupon.min_order_value.toString());
        setUsageLimit(coupon.usage_limit?.toString() || '');
        setStartsAt(new Date(coupon.starts_at).toISOString().slice(0, 16));
        setExpiresAt(new Date(coupon.expires_at).toISOString().slice(0, 16));
        setShowDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this coupon?')) return;
        await marketingService.deleteCoupon(id);
        loadCoupons();
    };

    const toggleActive = async (coupon: Coupon) => {
        await marketingService.updateCoupon(coupon.id, { is_active: !coupon.is_active });
        loadCoupons();
    };

    const getCouponStatus = (coupon: Coupon) => {
        if (!coupon.is_active) return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
        const now = new Date();
        const expires = new Date(coupon.expires_at);
        if (now > expires) return { label: 'Expired', color: 'bg-red-100 text-red-800' };
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return { label: 'Limit Reached', color: 'bg-orange-100 text-orange-800' };
        }
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Coupon Manager</h1>
                    <p className="text-gray-600">Create and manage discount coupons</p>
                </div>
                <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coupon
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total Coupons</div>
                        <div className="text-2xl font-bold text-purple-600">{coupons.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Active</div>
                        <div className="text-2xl font-bold text-green-600">
                            {coupons.filter(c => c.is_active && new Date(c.expires_at) > new Date()).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total Usage</div>
                        <div className="text-2xl font-bold text-blue-600">
                            {coupons.reduce((sum, c) => sum + c.usage_count, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Expired</div>
                        <div className="text-2xl font-bold text-red-600">
                            {coupons.filter(c => new Date(c.expires_at) < new Date()).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-6">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left font-semibold text-sm">Code</th>
                                <th className="p-3 text-left font-semibold text-sm">Type</th>
                                <th className="p-3 text-left font-semibold text-sm">Value</th>
                                <th className="p-3 text-left font-semibold text-sm">Usage</th>
                                <th className="p-3 text-left font-semibold text-sm">Valid Until</th>
                                <th className="p-3 text-left font-semibold text-sm">Status</th>
                                <th className="p-3 text-left font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className="p-12 text-center text-gray-500">Loading...</td></tr>
                            ) : coupons.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-gray-500">No coupons found</td></tr>
                            ) : (
                                coupons.map(coupon => {
                                    const status = getCouponStatus(coupon);
                                    return (
                                        <tr key={coupon.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-purple-600">{coupon.code}</span>
                                                    <button onClick={() => navigator.clipboard.writeText(coupon.code)} className="text-gray-400 hover:text-gray-600">
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3 capitalize">{coupon.type.replace('_', ' ')}</td>
                                            <td className="p-3 font-semibold">
                                                {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                                            </td>
                                            <td className="p-3">
                                                {coupon.usage_count} / {coupon.usage_limit || '∞'}
                                            </td>
                                            <td className="p-3 text-sm">
                                                {new Date(coupon.expires_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => handleEdit(coupon)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => toggleActive(coupon)}>
                                                        {coupon.is_active ? '🔴' : '🟢'}
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDelete(coupon.id)} className="text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingCoupon ? 'Edit' : 'Add'} Coupon</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Coupon Code *</Label>
                            <div className="flex gap-2">
                                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SAVE20" />
                                <Button type="button" onClick={generateCode} variant="outline">Generate</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Discount Type *</Label>
                                <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full border rounded px-3 py-2">
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed_amount">Fixed Amount</option>
                                    <option value="buy_x_get_y">Buy X Get Y</option>
                                </select>
                            </div>
                            <div>
                                <Label>Value *</Label>
                                <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'percentage' ? '20' : '500'} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Min Order Value</Label>
                                <Input type="number" value={minOrderValue} onChange={(e) => setMinOrderValue(e.target.value)} placeholder="0" />
                            </div>
                            <div>
                                <Label>Usage Limit</Label>
                                <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="Unlimited" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Starts At *</Label>
                                <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                            </div>
                            <div>
                                <Label>Expires At *</Label>
                                <Input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                                {editingCoupon ? 'Update' : 'Create'} Coupon
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

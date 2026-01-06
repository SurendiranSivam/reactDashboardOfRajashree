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
import { Plus, Copy, ExternalLink, TrendingUp } from 'lucide-react';
import { marketingService } from '@/lib/services/marketing.service';
import type { Affiliate, ReferralLog } from '@/types/marketing';

export default function AffiliatesPage() {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [referralLogs, setReferralLogs] = useState<ReferralLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [showLinkGenerator, setShowLinkGenerator] = useState(false);

    // Form state
    const [referralCode, setReferralCode] = useState('');
    const [commissionRate, setCommissionRate] = useState('10');

    // Link generator state
    const [productUrl, setProductUrl] = useState('');
    const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [affiliatesRes, logsRes] = await Promise.all([
            marketingService.fetchAffiliates(),
            marketingService.fetchReferralLogs(),
        ]);
        setAffiliates(affiliatesRes.data);
        setReferralLogs(logsRes.data);
        setLoading(false);
    };

    const generateReferralCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setReferralCode(result);
    };

    const handleSubmit = async () => {
        if (!referralCode || !commissionRate) {
            alert('Please fill all fields');
            return;
        }

        await marketingService.addAffiliate({
            referral_code: referralCode.toUpperCase(),
            commission_rate: parseFloat(commissionRate),
        });

        setReferralCode('');
        setCommissionRate('10');
        setShowDialog(false);
        loadData();
    };

    const generateAffiliateLink = () => {
        if (!selectedAffiliate || !productUrl) return '';
        const baseUrl = productUrl.includes('?') ? productUrl + '&' : productUrl + '?';
        return `${baseUrl}ref=${selectedAffiliate.referral_code}`;
    };

    const copyLink = () => {
        const link = generateAffiliateLink();
        navigator.clipboard.writeText(link);
        alert('Link copied to clipboard!');
    };

    const topPerformer = affiliates.reduce((top, current) =>
        current.total_earnings > (top?.total_earnings || 0) ? current : top
        , affiliates[0]);

    const totalPending = affiliates.reduce((sum, a) => sum + a.total_earnings, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Affiliate Network</h1>
                    <p className="text-gray-600">Manage affiliate partners and referral tracking</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setShowLinkGenerator(true)} variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Generate Link
                    </Button>
                    <Button onClick={() => { generateReferralCode(); setShowDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Affiliate
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total Affiliates</div>
                        <div className="text-2xl font-bold text-purple-600">{affiliates.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total Commissions Pending</div>
                        <div className="text-2xl font-bold text-green-600">₹{totalPending.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-orange-600" />
                            <div>
                                <div className="text-sm text-gray-600">Top Performer</div>
                                <div className="text-lg font-bold text-orange-600">{topPerformer?.referral_code || 'N/A'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Affiliates Table */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Affiliates</h2>
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left font-semibold text-sm">Referral Code</th>
                                <th className="p-3 text-left font-semibold text-sm">Commission Rate</th>
                                <th className="p-3 text-left font-semibold text-sm">Total Earnings</th>
                                <th className="p-3 text-left font-semibold text-sm">Referrals</th>
                                <th className="p-3 text-left font-semibold text-sm">Status</th>
                                <th className="p-3 text-left font-semibold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-500">Loading...</td></tr>
                            ) : affiliates.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-gray-500">No affiliates found</td></tr>
                            ) : (
                                affiliates.map(affiliate => {
                                    const referralCount = referralLogs.filter(r => r.affiliate_id === affiliate.id).length;
                                    return (
                                        <tr key={affiliate.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-purple-600">{affiliate.referral_code}</span>
                                                    <button onClick={() => navigator.clipboard.writeText(affiliate.referral_code)} className="text-gray-400 hover:text-gray-600">
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3 font-semibold">{affiliate.commission_rate}%</td>
                                            <td className="p-3 font-semibold text-green-600">₹{affiliate.total_earnings.toFixed(2)}</td>
                                            <td className="p-3">{referralCount} orders</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${affiliate.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {affiliate.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedAffiliate(affiliate); setShowLinkGenerator(true); }}>
                                                    Generate Link
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Recent Referrals */}
            <Card>
                <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Referrals</h2>
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left font-semibold text-sm">Order ID</th>
                                <th className="p-3 text-left font-semibold text-sm">Affiliate</th>
                                <th className="p-3 text-left font-semibold text-sm">Order Total</th>
                                <th className="p-3 text-left font-semibold text-sm">Commission</th>
                                <th className="p-3 text-left font-semibold text-sm">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {referralLogs.slice(0, 10).map(log => {
                                const affiliate = affiliates.find(a => a.id === log.affiliate_id);
                                return (
                                    <tr key={log.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-mono text-sm">{log.order_id}</td>
                                        <td className="p-3 font-semibold text-purple-600">{affiliate?.referral_code}</td>
                                        <td className="p-3">₹{log.order_total.toFixed(2)}</td>
                                        <td className="p-3 font-semibold text-green-600">₹{log.commission_amount.toFixed(2)}</td>
                                        <td className="p-3 text-sm text-gray-600">{new Date(log.created_at).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Add Affiliate Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Affiliate</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Referral Code *</Label>
                            <div className="flex gap-2">
                                <Input value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} placeholder="ABC123" />
                                <Button type="button" onClick={generateReferralCode} variant="outline">Generate</Button>
                            </div>
                        </div>

                        <div>
                            <Label>Commission Rate (%) *</Label>
                            <Input type="number" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} placeholder="10" />
                        </div>

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">Create Affiliate</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Link Generator Dialog */}
            <Dialog open={showLinkGenerator} onOpenChange={setShowLinkGenerator}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Affiliate Link</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Select Affiliate</Label>
                            <select value={selectedAffiliate?.id || ''} onChange={(e) => setSelectedAffiliate(affiliates.find(a => a.id === e.target.value) || null)} className="w-full border rounded px-3 py-2">
                                <option value="">Choose affiliate...</option>
                                {affiliates.map(a => (
                                    <option key={a.id} value={a.id}>{a.referral_code} ({a.commission_rate}%)</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Product/Page URL</Label>
                            <Input value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://yoursite.com/product/123" />
                        </div>

                        {selectedAffiliate && productUrl && (
                            <div className="p-4 bg-gray-100 rounded">
                                <Label className="text-xs">Generated Link:</Label>
                                <div className="flex items-center gap-2 mt-2">
                                    <code className="text-sm flex-1 bg-white p-2 rounded border">{generateAffiliateLink()}</code>
                                    <Button size="sm" onClick={copyLink}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 justify-end pt-4">
                            <Button variant="outline" onClick={() => setShowLinkGenerator(false)}>Close</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

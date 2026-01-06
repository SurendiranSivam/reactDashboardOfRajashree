'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Send, Users, Mail, MessageSquare } from 'lucide-react';
import { marketingService } from '@/lib/services/marketing.service';
import type { Campaign } from '@/types/marketing';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [step, setStep] = useState(1);

    // Form state
    const [name, setName] = useState('');
    const [subjectLine, setSubjectLine] = useState('');
    const [content, setContent] = useState('');
    const [channel, setChannel] = useState<'email' | 'sms'>('email');
    const [targetSegment, setTargetSegment] = useState('all');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setLoading(true);
        const { data } = await marketingService.fetchCampaigns();
        setCampaigns(data);
        setLoading(false);
    };

    const resetForm = () => {
        setName('');
        setSubjectLine('');
        setContent('');
        setChannel('email');
        setTargetSegment('all');
        setStep(1);
    };

    const handleNext = () => {
        if (step === 1 && !name) {
            alert('Please enter campaign name');
            return;
        }
        if (step === 2 && channel === 'email' && !subjectLine) {
            alert('Please enter subject line for email');
            return;
        }
        if (step === 3 && !content) {
            alert('Please enter campaign content');
            return;
        }
        setStep(step + 1);
    };

    const handleSaveDraft = async () => {
        const { success } = await marketingService.addCampaign({
            name,
            subject_line: subjectLine || name,
            content,
            channel,
            target_segment: targetSegment,
            status: 'draft',
        });

        if (success) {
            resetForm();
            setShowWizard(false);
            loadCampaigns();
            alert('Campaign saved as draft');
        }
    };

    const handleSendNow = async () => {
        if (!confirm('Send this campaign now?')) return;

        setSending(true);

        // First save the campaign
        const { success, data } = await marketingService.addCampaign({
            name,
            subject_line: subjectLine || name,
            content,
            channel,
            target_segment: targetSegment,
            status: 'draft',
        });

        if (success && data) {
            // Then send it
            const sendResult = await marketingService.sendCampaign(data.id);
            setSending(false);

            if (sendResult.success) {
                alert(`Campaign sent! ${sendResult.sent} successful, ${sendResult.failed} failed`);
                resetForm();
                setShowWizard(false);
                loadCampaigns();
            } else {
                alert(`Error: ${sendResult.error}`);
            }
        } else {
            setSending(false);
            alert('Failed to create campaign');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-green-100 text-green-800';
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-purple-600">Campaign Builder</h1>
                    <p className="text-gray-600">Create and send email & SMS campaigns</p>
                </div>
                <Button onClick={() => { resetForm(); setShowWizard(true); }} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Total Campaigns</div>
                        <div className="text-2xl font-bold text-purple-600">{campaigns.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Sent</div>
                        <div className="text-2xl font-bold text-green-600">
                            {campaigns.filter(c => c.status === 'sent').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-sm text-gray-600">Drafts</div>
                        <div className="text-2xl font-bold text-gray-600">
                            {campaigns.filter(c => c.status === 'draft').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Campaigns Table */}
            <Card>
                <CardContent className="p-6">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left font-semibold text-sm">Name</th>
                                <th className="p-3 text-left font-semibold text-sm">Channel</th>
                                <th className="p-3 text-left font-semibold text-sm">Segment</th>
                                <th className="p-3 text-left font-semibold text-sm">Status</th>
                                <th className="p-3 text-left font-semibold text-sm">Sent At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-500">Loading...</td></tr>
                            ) : campaigns.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-500">No campaigns found</td></tr>
                            ) : (
                                campaigns.map(campaign => (
                                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{campaign.name}</td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                {campaign.channel === 'email' ? (
                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <MessageSquare className="h-4 w-4 text-green-600" />
                                                )}
                                                <span className="capitalize">{campaign.channel}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 capitalize">{campaign.target_segment}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {campaign.sent_at ? new Date(campaign.sent_at).toLocaleString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Campaign Wizard */}
            <Dialog open={showWizard} onOpenChange={setShowWizard}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create Campaign - Step {step} of 4</DialogTitle>
                    </DialogHeader>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-6">
                        {[1, 2, 3, 4].map(s => (
                            <div key={s} className={`flex-1 h-2 rounded ${s <= step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    {/* Step 1: Campaign Details */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Campaign Details</h3>
                            <div>
                                <Label>Campaign Name *</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale 2026" />
                            </div>
                            <div>
                                <Label>Target Audience</Label>
                                <select value={targetSegment} onChange={(e) => setTargetSegment(e.target.value)} className="w-full border rounded px-3 py-2">
                                    <option value="all">All Customers</option>
                                    <option value="vip">VIP Customers (5+ orders)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Channel Selection */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Choose Channel</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setChannel('email')} className={`p-6 border-2 rounded-lg text-center ${channel === 'email' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}>
                                    <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                    <div className="font-semibold">Email</div>
                                    <div className="text-sm text-gray-600">Rich content, attachments</div>
                                </button>
                                <button onClick={() => setChannel('sms')} className={`p-6 border-2 rounded-lg text-center ${channel === 'sms' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`}>
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                    <div className="font-semibold">SMS</div>
                                    <div className="text-sm text-gray-600">Quick, direct messages</div>
                                </button>
                            </div>

                            {channel === 'email' && (
                                <div>
                                    <Label>Subject Line *</Label>
                                    <Input value={subjectLine} onChange={(e) => setSubjectLine(e.target.value)} placeholder="Summer Sale - Up to 50% Off!" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Content Editor */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Campaign Content</h3>
                            <div>
                                <Label>Message *</Label>
                                <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} placeholder={channel === 'email' ? 'Hi {{name}},\n\nWe are excited to announce...' : 'Hi {{name}}! Summer sale is live. Get 20% off. Shop now!'} />
                                <p className="text-xs text-gray-500 mt-2">Use {'{{name}}'} to personalize with customer name</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Send */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Review & Send</h3>
                            <div className="space-y-3 p-4 bg-gray-50 rounded">
                                <div><span className="font-semibold">Name:</span> {name}</div>
                                <div><span className="font-semibold">Channel:</span> {channel === 'email' ? '📧 Email' : '📱 SMS'}</div>
                                {channel === 'email' && <div><span className="font-semibold">Subject:</span> {subjectLine}</div>}
                                <div><span className="font-semibold">Audience:</span> {targetSegment === 'all' ? 'All Customers' : 'VIP Customers'}</div>
                                <div>
                                    <span className="font-semibold">Content:</span>
                                    <p className="mt-2 text-sm whitespace-pre-wrap bg-white p-3 rounded border">{content}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 justify-between pt-4">
                        <div>
                            {step > 1 && (
                                <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {step === 4 && (
                                <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
                            )}
                            {step < 4 ? (
                                <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">Next</Button>
                            ) : (
                                <Button onClick={handleSendNow} disabled={sending} className="bg-green-600 hover:bg-green-700">
                                    <Send className="h-4 w-4 mr-2" />
                                    {sending ? 'Sending...' : 'Send Now'}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

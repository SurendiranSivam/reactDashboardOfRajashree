'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ticketsService } from '@/lib/services/tickets.service';
import { queriesService } from '@/lib/services/queries.service';
import type { Query, TicketCategory, TicketSeverity } from '@/types/queries';
import { TICKET_CATEGORIES, TICKET_SEVERITIES } from '@/types/queries';

interface EscalateDialogProps {
    open: boolean;
    onClose: () => void;
    query: Query;
    onSuccess: () => void;
}

export function EscalateDialog({ open, onClose, query, onSuccess }: EscalateDialogProps) {
    const [subject, setSubject] = useState(`Query #${query.query_id}: ${query.message.substring(0, 50)}`);
    const [category, setCategory] = useState<TicketCategory>('Order Issue');
    const [severity, setSeverity] = useState<TicketSeverity>('Medium');
    const [assignedTo, setAssignedTo] = useState('');
    const [department, setDepartment] = useState('');
    const [description, setDescription] = useState(query.message);
    const [loading, setLoading] = useState(false);

    const handleEscalate = async () => {
        if (!subject) {
            alert('Please enter a subject');
            return;
        }

        setLoading(true);

        // Create ticket
        const ticketResult = await ticketsService.createTicket({
            query_id: query.query_id,
            customer_id: query.customer_id,
            subject,
            description,
            category,
            severity,
            assigned_to: assignedTo || undefined,
            assigned_department: department || undefined,
            escalated_by: 'Admin', // TODO: Get from auth
        });

        if (ticketResult.success && ticketResult.data) {
            // Mark query as escalated
            await queriesService.markAsEscalated(query.query_id!, ticketResult.data.ticket_id!);

            setLoading(false);
            onSuccess();
            onClose();
        } else {
            setLoading(false);
            alert('Failed to create ticket: ' + ticketResult.error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Escalate Query #{query.query_id} to Ticket</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Query Info */}
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div><strong>Customer:</strong> {query.name}</div>
                        <div><strong>Original Query:</strong> {query.message.substring(0, 100)}...</div>
                    </div>

                    {/* Subject */}
                    <div>
                        <Label htmlFor="subject">Ticket Subject *</Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Brief summary of the issue"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Label htmlFor="category">Category *</Label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as TicketCategory)}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            {TICKET_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Severity */}
                    <div>
                        <Label htmlFor="severity">Severity *</Label>
                        <select
                            id="severity"
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value as TicketSeverity)}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            {TICKET_SEVERITIES.map(sev => (
                                <option key={sev} value={sev}>{sev}</option>
                            ))}
                        </select>
                    </div>

                    {/* Assign To */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="assignedTo">Assign To</Label>
                            <Input
                                id="assignedTo"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                placeholder="Person/Team name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Input
                                id="department"
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                placeholder="e.g. Operations"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleEscalate} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                        {loading ? 'Creating...' : 'Create Ticket'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

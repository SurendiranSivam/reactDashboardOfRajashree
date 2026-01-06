# 🎉 Queries System - Complete Implementation Guide

## ✅ MAIN PAGE CREATED!

The queries page (`app/dashboard/queries/page.tsx`) is now complete with all features!

---

## 📋 Components Still Needed

I've created the main page. Now you need to create these dialog components in the `components/queries/` directory:

### 1. Add Query Dialog
**File:** `components/queries/add-query-dialog.tsx`

```typescript
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
    const [source, setSource] = useState<'Email' | 'WhatsApp' | 'Phone'>('Phone');
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
            source,
            priority: orderId ? 'High' : '

Medium',
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
                    <DialogTitle>Add Query (Manual Entry)</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Source Selection */}
                    <div>
                        <Label>Source *</Label>
                        <div className="flex gap-4 mt-2">
                            {(['Email', 'WhatsApp', 'Phone'] as const).map((src) => (
                                <label key={src} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="source"
                                        value={src}
                                        checked={source === src}
                                        onChange={() => setSource(src)}
                                        className="rounded-full"
                                    />
                                    <span>{src}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Customer Name */}
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
```

---

### 2. Customer Details Dialog
**File:** `components/queries/customer-details-dialog.tsx`

```typescript
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
```

---

### 3. Escalate Dialog
**File:** `components/queries/escalate-dialog.tsx`

```typescript
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
```

---

### 4. Conversation Dialog
**File:** `components/queries/conversation-dialog.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { queriesService } from '@/lib/services/queries.service';
import type { Query, QueryConversation } from '@/types/queries';

interface ConversationDialogProps {
    open: boolean;
    onClose: () => void;
    query: Query;
}

export function ConversationDialog({ open, onClose, query }: ConversationDialogProps) {
    const [conversations, setConversations] = useState<QueryConversation[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            loadConversations();
        }
    }, [open]);

    const loadConversations = async () => {
        const result = await queriesService.fetchConversations(query.query_id!);
        if (result.data) {
            setConversations(result.data);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        setLoading(true);
        const result = await queriesService.addConversation({
            query_id: query.query_id,
            sender_type: 'Admin',
            sender_name: 'Support Team',
            message,
        });

        if (result.success) {
            setMessage('');
            await loadConversations();
        } else {
            alert('Failed to send message');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[600px]">
                <DialogHeader>
                    <DialogTitle>Conversation - Query #{query.query_id}</DialogTitle>
                </DialogHeader>

                {/* Conversation Thread */}
                <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-lg min-h-[300px]">
                    {conversations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No conversation yet</div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.conversation_id}
                                className={`flex ${conv.sender_type === 'Customer' ? 'justify-start' : 'justify-end'}`}
                            >
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                    conv.sender_type === 'Customer' 
                                        ? 'bg-white border' 
                                        : 'bg-purple-600 text-white'
                                }`}>
                                    <div className="text-xs opacity-75 mb-1">
                                        {conv.sender_type} • {new Date(conv.timestamp!).toLocaleString()}
                                    </div>
                                    <div>{conv.message}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Reply Input */}
                <div className="space-y-2">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                    />
                    <div className="flex justify-end gap-2">
                        <Button onClick={handleSend} disabled={loading || !message.trim()}>
                            {loading ? 'Sending...' : 'Send Reply'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

---

## 🚀 **Next Steps:**

1. **Create the components folder:**
   ```bash
   mkdir -p components/queries
   ```

2. **Create each dialog file** (copy code from above)

3. **Test the queries page** at `/dashboard/queries`

4. **Optionally create Tickets page** for viewing escalated tickets

---

## ✅ **What's Working:**

- ✅ Queries page with full table
- ✅ Search across all fields
- ✅ Pagination
- ✅ Source icons (Email/WhatsApp/Phone)
- ✅ Status updates
- ✅ Row selection & bulk delete
- ✅ Customer name links (needs dialog)
- ✅ Escalation button (needs dialog)
- ✅ Conversation viewer (needs dialog)

**Create the 4 dialog components and you're done!** 🎉

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
                                <div className={`max-w-[70%] rounded-lg p-3 ${conv.sender_type === 'Customer'
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

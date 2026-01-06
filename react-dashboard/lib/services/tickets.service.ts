import type { Ticket, TicketConversation, TicketStatus } from '@/types/queries';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

class TicketsService {
    /**
     * Generate ticket number
     */
    async generateTicketNumber(): Promise<{ data: string | null; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/rpc/generate_ticket_number`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                return { data: null, error: 'Failed to generate ticket number' };
            }

            const ticketNumber = await response.json();
            return { data: ticketNumber };
        } catch (error) {
            console.error('Error generating ticket number:', error);
            return { data: null, error: String(error) };
        }
    }

    /**
     * Fetch all tickets
     */
    async fetchTickets(): Promise<{ data: Ticket[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/tickets?order=created_at.desc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch tickets' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching tickets:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Create ticket from escalated query
     */
    async createTicket(ticket: Partial<Ticket>): Promise<{ success: boolean; error?: string; data?: Ticket }> {
        try {
            // Generate ticket number first
            const ticketNumberResult = await this.generateTicketNumber();
            if (!ticketNumberResult.data) {
                return { success: false, error: 'Failed to generate ticket number' };
            }

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/tickets`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify({
                        ticket_number: ticketNumberResult.data,
                        query_id: ticket.query_id,
                        customer_id: ticket.customer_id,
                        subject: ticket.subject,
                        description: ticket.description,
                        category: ticket.category,
                        severity: ticket.severity || 'Medium',
                        status: ticket.status || 'New',
                        assigned_to: ticket.assigned_to,
                        assigned_department: ticket.assigned_department,
                        escalated_by: ticket.escalated_by,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to create ticket' };
            }

            const data = await response.json();
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creating ticket:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Update ticket status
     */
    async updateStatus(ticketId: number, status: TicketStatus): Promise<{ success: boolean; error?: string }> {
        try {
            const updates: any = {
                status,
                updated_at: new Date().toISOString(),
            };

            if (status === 'Resolved') {
                updates.resolved_at = new Date().toISOString();
            } else if (status === 'Closed') {
                updates.closed_at = new Date().toISOString();
            }

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/tickets?ticket_id=eq.${ticketId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updates),
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to update status' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating status:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Update ticket details
     */
    async updateTicket(ticketId: number, updates: Partial<Ticket>): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/tickets?ticket_id=eq.${ticketId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...updates,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );

            if (!response.ok) {
                return { success: false, error: 'Failed to update ticket' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating ticket:', error);
            return { success: false, error: String(error) };
        }
    }

    /**
     * Fetch ticket conversations
     */
    async fetchConversations(ticketId: number): Promise<{ data: TicketConversation[]; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/ticket_conversations?ticket_id=eq.${ticketId}&order=timestamp.asc`,
                {
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                return { data: [], error: 'Failed to fetch conversations' };
            }

            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return { data: [], error: String(error) };
        }
    }

    /**
     * Add conversation to ticket
     */
    async addConversation(conversation: Partial<TicketConversation>): Promise<{ success: boolean; error?: string }> {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/ticket_conversations`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': ANON_KEY,
                        'Authorization': `Bearer ${ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify({
                        ticket_id: conversation.ticket_id,
                        sender_type: conversation.sender_type,
                        sender_name: conversation.sender_name,
                        message: conversation.message,
                        is_internal: conversation.is_internal || false,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                return { success: false, error: error.message || 'Failed to add conversation' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding conversation:', error);
            return { success: false, error: String(error) };
        }
    }
}

export const ticketsService = new TicketsService();

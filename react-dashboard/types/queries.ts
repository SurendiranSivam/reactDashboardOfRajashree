// ============================================
// QUERIES & TICKETS SYSTEM - Two Tier Support
// ============================================

// -----------------
// QUERIES (Tier 1)
// -----------------
export interface Query {
    query_id?: number;
    customer_id?: number | null;
    name: string;
    mobile_number: string;
    email?: string | null;
    customer_email?: string | null;
    message: string;
    status: QueryStatus;
    order_id?: string | null;
    priority?: QueryPriority;
    remarks?: string | null;
    source: QuerySource;
    is_escalated?: boolean;       // NEW: Has been escalated to ticket
    escalated_ticket_id?: number | null; // NEW: Link to created ticket
    created_at?: string;
    updated_at?: string;
}

export type QuerySource = 'Email' | 'WhatsApp' | 'Phone';  // NEW: Added Phone
export type QueryStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Escalated'; // NEW: Added Escalated
export type QueryPriority = 'High' | 'Medium' | 'Low';

export const QUERY_SOURCES: QuerySource[] = ['Email', 'WhatsApp', 'Phone'];
export const QUERY_STATUSES: QueryStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Escalated'];
export const QUERY_PRIORITIES: QueryPriority[] = ['High', 'Medium', 'Low'];

// -----------------
// TICKETS (Tier 2)
// -----------------
export interface Ticket {
    ticket_id?: number;
    query_id: number;              // Link to original query
    customer_id?: number | null;
    ticket_number: string;         // TKT-2026-001
    subject: string;
    description: string;
    category: TicketCategory;
    severity: TicketSeverity;
    status: TicketStatus;
    assigned_to?: string | null;   // Team/Person name
    assigned_department?: string | null;
    resolution?: string | null;
    escalated_by?: string | null;  // Who escalated from query
    created_at?: string;
    updated_at?: string;
    resolved_at?: string | null;
    closed_at?: string | null;
}

export type TicketCategory =
    | 'Order Issue'
    | 'Product Complaint'
    | 'Delivery Problem'
    | 'Payment Issue'
    | 'Technical Support'
    | 'Other';

export type TicketSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketStatus =
    | 'New'
    | 'Assigned'
    | 'In Progress'
    | 'Pending Customer'
    | 'Pending Internal'
    | 'Resolved'
    | 'Closed';

export const TICKET_CATEGORIES: TicketCategory[] = [
    'Order Issue',
    'Product Complaint',
    'Delivery Problem',
    'Payment Issue',
    'Technical Support',
    'Other'
];

export const TICKET_SEVERITIES: TicketSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

export const TICKET_STATUSES: TicketStatus[] = [
    'New',
    'Assigned',
    'In Progress',
    'Pending Customer',
    'Pending Internal',
    'Resolved',
    'Closed'
];

// -----------------
// CONVERSATIONS
// -----------------
export interface QueryConversation {
    conversation_id?: number;
    query_id: number;
    sender_type: 'Customer' | 'Admin';
    sender_name?: string | null;
    message: string;
    timestamp?: string;
}

export interface TicketConversation {
    conversation_id?: number;
    ticket_id: number;
    sender_type: 'Customer' | 'Team' | 'Admin';
    sender_name?: string | null;
    message: string;
    is_internal?: boolean;  // Internal team notes
    timestamp?: string;
}

// -----------------
// CUSTOMER DETAILS VIEW
// -----------------
export interface CustomerDetails {
    customer_id: number;
    name: string;
    email?: string;
    mobile: string;
    address?: string;
    total_orders?: number;
    total_spent?: number;
    queries_count?: number;
    tickets_count?: number;
    registration_date?: string;
    last_order_date?: string;
}

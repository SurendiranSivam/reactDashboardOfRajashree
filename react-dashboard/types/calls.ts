// Call Center Types

export interface CallLog {
    call_id: string;
    call_sid: string;
    from_number: string;
    to_number: string;
    executive_id?: number;
    customer_id?: number;
    direction: 'inbound' | 'outbound';
    status: CallStatus;
    duration?: number;
    recording_url?: string;
    recording_duration?: number;
    ivr_selection?: string;
    query_id?: number;
    auto_query_created: boolean;
    started_at: string;
    answered_at?: string;
    ended_at?: string;
    created_at: string;
    updated_at: string;
}

export type CallStatus =
    | 'ringing'
    | 'in-progress'
    | 'completed'
    | 'no-answer'
    | 'busy'
    | 'failed';

export interface ExecutiveAvailability {
    availability_id: number;
    executive_id: number;
    status: ExecutiveStatus;
    current_call_id?: string;
    last_call_at?: string;
    total_calls_today: number;
    total_duration_today: number;
    created_at: string;
    updated_at: string;

    // Joined from users table
    users?: {
        user_id: number;
        full_name: string;
        email: string;
    };
}

export type ExecutiveStatus =
    | 'online'
    | 'offline'
    | 'busy'
    | 'on-call'
    | 'break';

export interface CallQueue {
    queue_id: number;
    call_sid: string;
    from_number: string;
    ivr_selection?: string;
    queue_position?: number;
    wait_time: number;
    status: QueueStatus;
    queued_at: string;
    connected_at?: string;
    ended_at?: string;
}

export type QueueStatus =
    | 'waiting'
    | 'connected'
    | 'abandoned'
    | 'timeout';

export interface CallAnalytics {
    call_date: string;
    executive_id: number;
    executive_name: string;
    total_calls: number;
    answered_calls: number;
    missed_calls: number;
    avg_duration: number;
    total_duration: number;
}

// Form data for manual calling
export interface MakeCallRequest {
    to_number: string;
    executive_id: number;
    customer_id?: number;
}

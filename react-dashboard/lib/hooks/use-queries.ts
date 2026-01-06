import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchQueries,
    fetchQueryMessages,
    sendQueryReply,
    updateQueryStatus,
    updateQueryPriority,
} from '@/lib/services/queries.service';
import { QueryFilters } from '@/lib/types';
import { toast } from 'sonner';

export function useQueries(filters?: QueryFilters) {
    return useQuery({
        queryKey: ['queries', filters],
        queryFn: () => fetchQueries(filters),
        staleTime: 30000, // 30 seconds
    });
}

export function useQueryMessages(queryId: number) {
    return useQuery({
        queryKey: ['query-messages', queryId],
        queryFn: () => fetchQueryMessages(queryId),
        enabled: queryId > 0,
    });
}

export function useSendReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ queryId, message }: { queryId: number; message: string }) =>
            sendQueryReply(queryId, message),
        onSuccess: (_, variables) => {
            toast.success('Reply sent successfully');
            queryClient.invalidateQueries({ queryKey: ['query-messages', variables.queryId] });
        },
        onError: () => {
            toast.error('Failed to send reply');
        },
    });
}

export function useUpdateQueryStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ queryId, status }: { queryId: number; status: string }) =>
            updateQueryStatus(queryId, status),
        onSuccess: () => {
            toast.success('Status updated');
            queryClient.invalidateQueries({ queryKey: ['queries'] });
        },
        onError: () => {
            toast.error('Failed to update status');
        },
    });
}

export function useUpdateQueryPriority() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ queryId, priority }: { queryId: number; priority: string }) =>
            updateQueryPriority(queryId, priority),
        onSuccess: () => {
            toast.success('Priority updated');
            queryClient.invalidateQueries({ queryKey: ['queries'] });
        },
        onError: () => {
            toast.error('Failed to update priority');
        },
    });
}

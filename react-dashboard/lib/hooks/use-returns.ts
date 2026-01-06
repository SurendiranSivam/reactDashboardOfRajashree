import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchReturns,
    addReturn,
    updateReturnStatus,
    updateReturnedItems,
    updateRefundAmount,
    addProgressNote,
    fetchReturnProgress,
    Return,
} from '@/lib/services/returns.service';
import { toast } from 'sonner';

export function useReturns() {
    return useQuery({
        queryKey: ['returns'],
        queryFn: fetchReturns,
        staleTime: 30000,
    });
}

export function useReturnProgress(returnId: number) {
    return useQuery({
        queryKey: ['return-progress', returnId],
        queryFn: () => fetchReturnProgress(returnId),
        enabled: !!returnId,
    });
}

export function useAddReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (returnData: Partial<Return>) => addReturn(returnData),
        onSuccess: () => {
            toast.success('Return added successfully');
            queryClient.invalidateQueries({ queryKey: ['returns'] });
        },
        onError: () => {
            toast.error('Failed to add return');
        },
    });
}

export function useUpdateReturnStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ returnId, status }: { returnId: number; status: string }) =>
            updateReturnStatus(returnId, status),
        onSuccess: () => {
            toast.success('Return status updated');
            queryClient.invalidateQueries({ queryKey: ['returns'] });
        },
        onError: () => {
            toast.error('Failed to update return status');
        },
    });
}

export function useUpdateReturnedItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ returnId, items }: { returnId: number; items: string }) =>
            updateReturnedItems(returnId, items),
        onSuccess: () => {
            toast.success('Returned items updated');
            queryClient.invalidateQueries({ queryKey: ['returns'] });
        },
        onError: () => {
            toast.error('Failed to update returned items');
        },
    });
}

export function useUpdateRefundAmount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ returnId, amount }: { returnId: number; amount: number }) =>
            updateRefundAmount(returnId, amount),
        onSuccess: () => {
            toast.success('Refund amount updated');
            queryClient.invalidateQueries({ queryKey: ['returns'] });
        },
        onError: () => {
            toast.error('Failed to update refund amount');
        },
    });
}

export function useAddProgressNote() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            returnId,
            status,
            note,
        }: {
            returnId: number;
            status: string | null;
            note: string | null;
        }) => addProgressNote(returnId, status, note),
        onSuccess: (_, variables) => {
            toast.success('Progress note added');
            queryClient.invalidateQueries({ queryKey: ['return-progress', variables.returnId] });
        },
        onError: () => {
            toast.error('Failed to add progress note');
        },
    });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchOrders, fetchOrderItems, updateOrderStatus } from '@/lib/services/orders.service';
import { toast } from 'sonner';

export function useOrders(search?: string, filter?: string) {
    return useQuery({
        queryKey: ['orders', search, filter],
        queryFn: () => fetchOrders(search, filter),
        staleTime: 30000,
    });
}

export function useOrderItems(orderId: string) {
    return useQuery({
        queryKey: ['order-items', orderId],
        queryFn: () => fetchOrderItems(orderId),
        enabled: !!orderId,
    });
}

export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
            updateOrderStatus(orderId, status),
        onSuccess: () => {
            toast.success('Order status updated');
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: () => {
            toast.error('Failed to update order status');
        },
    });
}

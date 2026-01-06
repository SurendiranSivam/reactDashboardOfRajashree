import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchPurchases,
    addPurchase,
    Purchase,
    PurchaseItem,
} from '@/lib/services/purchases.service';
import { toast } from 'sonner';

export function usePurchases() {
    return useQuery({
        queryKey: ['purchases'],
        queryFn: fetchPurchases,
        staleTime: 60000,
    });
}

export function useAddPurchase() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            purchase,
            items,
        }: {
            purchase: Partial<Purchase>;
            items: Partial<PurchaseItem>[];
        }) => addPurchase(purchase, items),
        onSuccess: () => {
            toast.success('Purchase added successfully');
            queryClient.invalidateQueries({ queryKey: ['purchases'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
        onError: () => {
            toast.error('Failed to add purchase');
        },
    });
}

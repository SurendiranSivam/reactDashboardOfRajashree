import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts, adjustVariantStock } from '@/lib/services/products.service';
import { toast } from 'sonner';

export function useProducts(search?: string, categoryId?: number) {
    return useQuery({
        queryKey: ['products', search, categoryId],
        queryFn: () => fetchProducts(search, categoryId),
        staleTime: 60000,
    });
}

export function useAdjustStock() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            variantId,
            stock,
            reason,
        }: {
            variantId: string;
            stock: number;
            reason: string;
        }) => adjustVariantStock(variantId, stock, reason),
        onSuccess: () => {
            toast.success('Stock updated');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: () => {
            toast.error('Failed to update stock');
        },
    });
}

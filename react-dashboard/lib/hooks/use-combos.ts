import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchCombos,
    addCombo,
    updateCombo,
    toggleComboStatus,
    Combo,
} from '@/lib/services/combos.service';
import { toast } from 'sonner';

export function useCombos(search?: string, limit: number = 10, offset: number = 0) {
    return useQuery({
        queryKey: ['combos', search, limit, offset],
        queryFn: () => fetchCombos(search, limit, offset),
        staleTime: 60000,
    });
}

export function useAddCombo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (combo: Partial<Combo>) => addCombo(combo),
        onSuccess: () => {
            toast.success('Combo added successfully');
            queryClient.invalidateQueries({ queryKey: ['combos'] });
        },
        onError: () => {
            toast.error('Failed to add combo');
        },
    });
}

export function useUpdateCombo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (combo: Combo) => updateCombo(combo),
        onSuccess: () => {
            toast.success('Combo updated successfully');
            queryClient.invalidateQueries({ queryKey: ['combos'] });
        },
        onError: () => {
            toast.error('Failed to update combo');
        },
    });
}

export function useToggleComboStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ comboId, isActive }: { comboId: number; isActive: boolean }) =>
            toggleComboStatus(comboId, isActive),
        onSuccess: () => {
            toast.success('Combo status updated');
            queryClient.invalidateQueries({ queryKey: ['combos'] });
        },
        onError: () => {
            toast.error('Failed to update combo status');
        },
    });
}

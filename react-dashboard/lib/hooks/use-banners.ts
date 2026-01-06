import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchBanners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    Banner,
} from '@/lib/services/banners.service';
import { toast } from 'sonner';

export function useBanners() {
    return useQuery({
        queryKey: ['banners'],
        queryFn: fetchBanners,
        staleTime: 60000,
    });
}

export function useAddBanner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (banner: Partial<Banner>) => addBanner(banner),
        onSuccess: () => {
            toast.success('Banner added successfully');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        },
        onError: () => {
            toast.error('Failed to add banner');
        },
    });
}

export function useUpdateBanner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bannerId, updates }: { bannerId: string; updates: Partial<Banner> }) =>
            updateBanner(bannerId, updates),
        onSuccess: () => {
            toast.success('Banner updated successfully');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        },
        onError: () => {
            toast.error('Failed to update banner');
        },
    });
}

export function useDeleteBanner() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bannerId: string) => deleteBanner(bannerId),
        onSuccess: () => {
            toast.success('Banner deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        },
        onError: () => {
            toast.error('Failed to delete banner');
        },
    });
}

export function useToggleBannerStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ bannerId, isActive }: { bannerId: string; isActive: boolean }) =>
            toggleBannerStatus(bannerId, isActive),
        onSuccess: () => {
            toast.success('Banner status updated');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
        },
        onError: () => {
            toast.error('Failed to update banner status');
        },
    });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchShipments,
    updateTrackingNumber,
    sendShipmentStatus,
} from '@/lib/services/shipments.service';
import { toast } from 'sonner';

export function useShipments() {
    return useQuery({
        queryKey: ['shipments'],
        queryFn: fetchShipments,
        staleTime: 30000,
    });
}

export function useUpdateTracking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            orderId,
            trackingNumber,
            shippingProvider,
            inline,
        }: {
            orderId: string;
            trackingNumber: string;
            shippingProvider: string;
            inline?: boolean;
        }) => updateTrackingNumber(orderId, trackingNumber, shippingProvider, inline),
        onSuccess: () => {
            toast.success('Tracking number updated');
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: () => {
            toast.error('Failed to update tracking number');
        },
    });
}

export function useSendShipmentStatus() {
    return useMutation({
        mutationFn: (shipmentIds: string[]) => sendShipmentStatus(shipmentIds),
        onSuccess: () => {
            toast.success('Shipment status sent successfully');
        },
        onError: () => {
            toast.error('Failed to send shipment status');
        },
    });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchVendors,
    addVendor,
    toggleVendorStatus,
    fetchVendorTransactions,
    addVendorTransaction,
    fetchUnpaidInvoices,
    Vendor,
    VendorTransaction,
} from '@/lib/services/vendors.service';
import { toast } from 'sonner';

export function useVendors() {
    return useQuery({
        queryKey: ['vendors'],
        queryFn: fetchVendors,
        staleTime: 60000,
    });
}

export function useVendorTransactions(vendorId: number) {
    return useQuery({
        queryKey: ['vendor-transactions', vendorId],
        queryFn: () => fetchVendorTransactions(vendorId),
        enabled: !!vendorId,
    });
}

export function useUnpaidInvoices(vendorId: number) {
    return useQuery({
        queryKey: ['unpaid-invoices', vendorId],
        queryFn: () => fetchUnpaidInvoices(vendorId),
        enabled: !!vendorId,
    });
}

export function useAddVendor() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (vendor: Partial<Vendor>) => addVendor(vendor),
        onSuccess: () => {
            toast.success('Vendor added successfully');
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
        onError: () => {
            toast.error('Failed to add vendor');
        },
    });
}

export function useToggleVendorStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ vendorId, isActive }: { vendorId: number; isActive: boolean }) =>
            toggleVendorStatus(vendorId, isActive),
        onSuccess: () => {
            toast.success('Vendor status updated');
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
        },
        onError: () => {
            toast.error('Failed to update vendor status');
        },
    });
}

export function useAddVendorTransaction() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (transaction: Partial<VendorTransaction>) =>
            addVendorTransaction(transaction),
        onSuccess: (_, variables) => {
            toast.success('Transaction added successfully');
            queryClient.invalidateQueries({ queryKey: ['vendor-transactions', variables.vendor_id] });
            queryClient.invalidateQueries({ queryKey: ['unpaid-invoices', variables.vendor_id] });
        },
        onError: () => {
            toast.error('Failed to add transaction');
        },
    });
}

import { useQuery } from '@tanstack/react-query';
import { fetchCustomers } from '@/lib/services/customers.service';

export function useCustomers() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: fetchCustomers,
        staleTime: 60000,
    });
}

'use client';

import { usePermission } from '@/lib/hooks/use-permissions';
import { Loader2 } from 'lucide-react';

interface ProtectedProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    loading?: React.ReactNode;
}

/**
 * Protected component - shows children only if user has permission
 * 
 * @example
 * <Protected permission="products.create">
 *   <Button>Add Product</Button>
 * </Protected>
 */
export function Protected({ permission, children, fallback = null, loading }: ProtectedProps) {
    const { data: hasPermission, isLoading } = usePermission(permission);

    if (isLoading) {
        return loading || (
            <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
        );
    }

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Protected button - button is disabled if user doesn't have permission
 * 
 * @example
 * <ProtectedButton permission="products.delete" onClick={handleDelete}>
 *   Delete
 * </ProtectedButton>
 */
export function ProtectedButton({
    permission,
    children,
    fallback,
    ...props
}: ProtectedButtonProps) {
    const { data: hasPermission, isLoading } = usePermission(permission);

    if (isLoading) {
        return (
            <button {...props} disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
            </button>
        );
    }

    if (!hasPermission) {
        return <>{fallback}</> || null;
    }

    return <button {...props}>{children}</button>;
}

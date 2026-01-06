// Example: Using the affiliate tracking hook in root layout

import { useAffiliateTracker } from '@/hooks/useAffiliateTracker';

export default function RootLayout({ children }) {
    // Track affiliate referrals automatically
    useAffiliateTracker();

    return (
        <html>
            <body>{children}</body>
        </html>
    );
}

// ================================================
// Example: Using affiliate ref during checkout
// ================================================

import { getAffiliateRef, clearAffiliateRef } from '@/hooks/useAffiliateTracker';

async function handleCheckout() {
    const affiliateRef = getAffiliateRef();

    const orderData = {
        items: cartItems,
        total: cartTotal,
        // Attach affiliate code to order_note for commission tracking
        order_note: affiliateRef ? `ref=${affiliateRef}` : '',
    };

    // Create order
    const order = await createOrder(orderData);

    // Clear the affiliate ref after successful order
    if (order.success) {
        clearAffiliateRef();
    }

    return order;
}

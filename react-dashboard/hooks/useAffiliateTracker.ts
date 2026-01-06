'use client';

import { useEffect } from 'react';

/**
 * Affiliate Tracking Hook
 * 
 * Tracks affiliate referrals via URL parameters and stores in cookies
 * Usage: Add to root layout.tsx to track all page visits
 * 
 * How it works:
 * 1. Checks URL for ?ref=CODE parameter
 * 2. If found, stores in cookie for 30 days
 * 3. During checkout, read cookie and attach to order
 */
export function useAffiliateTracker() {
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');

        if (refCode) {
            // Store referral code in cookie (30 days)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            document.cookie = `affiliate_ref=${refCode.toUpperCase()}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

            console.log(`[Affiliate Tracker] Stored referral code: ${refCode}`);

            // Optional: Clean URL (remove ref parameter)
            const url = new URL(window.location.href);
            url.searchParams.delete('ref');
            window.history.replaceState({}, '', url.toString());
        }
    }, []);
}

/**
 * Get stored affiliate referral code
 */
export function getAffiliateRef(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const affiliateCookie = cookies.find(c => c.trim().startsWith('affiliate_ref='));

    if (affiliateCookie) {
        return affiliateCookie.split('=')[1];
    }

    return null;
}

/**
 * Clear affiliate referral (called after order is placed)
 */
export function clearAffiliateRef() {
    if (typeof document === 'undefined') return;

    document.cookie = 'affiliate_ref=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('[Affiliate Tracker] Cleared referral code');
}

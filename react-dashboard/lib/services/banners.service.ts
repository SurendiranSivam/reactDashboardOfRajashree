import { supabase } from '@/lib/supabase';

export interface Banner {
    banner_id: string; // UUID
    title: string;
    image_url: string;
    link_url: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export async function fetchBanners(): Promise<Banner[]> {
    try {
        const { data, error } = await supabase
            .from('banner')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

export async function addBanner(banner: Partial<Banner>): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('banner')
            .insert([banner]);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error adding banner:', error);
        return false;
    }
}

export async function updateBanner(
    bannerId: string,
    updates: Partial<Banner>
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('banner')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('banner_id', bannerId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating banner:', error);
        return false;
    }
}

export async function deleteBanner(bannerId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('banner')
            .delete()
            .eq('banner_id', bannerId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting banner:', error);
        return false;
    }
}

export async function toggleBannerStatus(
    bannerId: string,
    isActive: boolean
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('banner')
            .update({ is_active: isActive })
            .eq('banner_id', bannerId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error toggling banner status:', error);
        return false;
    }
}

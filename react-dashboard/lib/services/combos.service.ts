import { supabase } from '@/lib/supabase';

export interface Combo {
    combo_id: number;
    combo_name: string;
    combo_price: number;
    is_active: boolean;
    created_at: string;
    combo_items?: ComboItem[];
}

export interface ComboItem {
    combo_item_id: number;
    combo_id: number;
    variant_id: string;
    quantity: number;
}

export async function fetchCombos(
    search?: string,
    limit: number = 10,
    offset: number = 0
): Promise<{ combos: Combo[]; total: number }> {
    try {
        const params: Record<string, string> = {
            limit: limit.toString(),
            offset: offset.toString(),
        };
        if (search) params.search = search;

        const queryString = new URLSearchParams(params).toString();

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/getCombo?${queryString}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                },
            }
        );

        if (!response.ok) throw new Error('Failed to fetch combos');

        const data = await response.json();

        return {
            combos: data.combos || [],
            total: data.total_count || 0,
        };
    } catch (error) {
        console.error('Error fetching combos:', error);
        return { combos: [], total: 0 };
    }
}

export async function addCombo(combo: Partial<Combo>): Promise<boolean> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-combo-with-items`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(combo),
            }
        );

        if (!response.ok) throw new Error('Failed to add combo');
        return true;
    } catch (error) {
        console.error('Error adding combo:', error);
        return false;
    }
}

export async function updateCombo(combo: Combo): Promise<boolean> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/insert-item-in-combo`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'combo-id': combo.combo_id.toString(),
                },
                body: JSON.stringify(combo),
            }
        );

        if (!response.ok) throw new Error('Failed to update combo');
        return true;
    } catch (error) {
        console.error('Error updating combo:', error);
        return false;
    }
}

export async function toggleComboStatus(
    comboId: number,
    isActive: boolean
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('combo')
            .update({ is_active: isActive })
            .eq('combo_id', comboId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error toggling combo status:', error);
        return false;
    }
}

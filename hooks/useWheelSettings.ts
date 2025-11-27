
import { useState, useEffect } from 'react';
import { API_BASE_URL, DEFAULT_WHEEL_ITEMS } from '../constants';

export interface WheelItem {
    label: string;
    weight: number; // Probability weight
}

export const useWheelSettings = () => {
    const [items, setItems] = useState<WheelItem[]>(DEFAULT_WHEEL_ITEMS);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/wheel`);
            if (response.ok) {
                const data = await response.json();
                if (data.items && Array.isArray(data.items) && data.items.length > 0) {
                    setItems(data.items);
                }
            }
        } catch (error) {
            console.error("Failed to fetch wheel settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { items, loading, refetch: fetchData };
};

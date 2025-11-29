
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../constants';

export interface SpinQueueItem {
    _id: string;
    user: string;
    nisaballs: number;
    createdAt: string;
    sourceEventId?: string;
}

export interface SpinHistoryItem {
    _id: string;
    user: string;
    reward: string;
    timestamp: string;
}

export const useWheelGame = () => {
    const [queue, setQueue] = useState<SpinQueueItem[]>([]);
    const [history, setHistory] = useState<SpinHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [qRes, hRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/wheel/queue`),
                fetch(`${API_BASE_URL}/api/wheel/history`)
            ]);
            
            if (qRes.ok) setQueue(await qRes.json());
            if (hRes.ok) setHistory(await hRes.json());
        } catch (error) {
            // Suppress error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 3000); // Poll more frequently for game flow
        return () => clearInterval(interval);
    }, [fetchData]);

    const completeSpin = async (user: string, reward: string, queueId?: string, password?: string) => {
        try {
            await fetch(`${API_BASE_URL}/api/wheel/spin-result`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': password || '' 
                },
                body: JSON.stringify({ user, reward, queueId })
            });
            fetchData(); // Refresh immediately
        } catch (e) {
            console.error(e);
        }
    };

    return { queue, history, loading, completeSpin };
};

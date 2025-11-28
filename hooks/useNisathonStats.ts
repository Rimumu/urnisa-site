
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

export interface NisathonStatsData {
    currentSubs: number;
    currentBits: number;
    currentDonations: number;
    totalNisaballs: number;
    timerEndTime: string; // ISO String
    isPaused: boolean;
}

export const useNisathonStats = () => {
    const [stats, setStats] = useState<NisathonStatsData>({
        currentSubs: 0,
        currentBits: 0,
        currentDonations: 0,
        totalNisaballs: 0,
        timerEndTime: new Date().toISOString(),
        isPaused: false
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/nisathon/stats`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch Nisathon stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Poll every 5 seconds for near real-time updates
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return { stats, loading, refetch: fetchStats };
};

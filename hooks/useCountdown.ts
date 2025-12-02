import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

export interface CountdownData {
    timerEndTime: string;
    isPaused: boolean;
    remainingTimeMs?: number;
}

export const useCountdown = (pollInterval = 1000) => {
    const [stats, setStats] = useState<CountdownData>({
        timerEndTime: new Date().toISOString(),
        isPaused: true,
        remainingTimeMs: 0
    });

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/countdown/stats`);
            if (response.ok) {
                setStats(await response.json());
            }
        } catch (e) {
            // Silent fail
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, pollInterval);
        return () => clearInterval(interval);
    }, [pollInterval]);

    return { stats };
};
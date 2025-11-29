
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

export interface NisathonStatsData {
    currentSubs: number;
    currentBits: number;
    currentDonations: number;
    totalNisaballs: number;
    timerEndTime: string; // ISO String
    isPaused: boolean;
    remainingTimeMs?: number;
}

export interface TopContributor {
    rank: number;
    user: string;
    totalNisaballs: number;
}

export interface ContributorEvent {
    _id: string;
    user: string;
    type: string;
    amountDisplay: string;
    message: string;
    createdAt: string;
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
    const [leaderboard, setLeaderboard] = useState<TopContributor[]>([]);
    const [recentEvents, setRecentEvents] = useState<ContributorEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            // Fetch Stats
            const statsRes = await fetch(`${API_BASE_URL}/api/nisathon/stats`);
            if (statsRes.ok) setStats(await statsRes.json());

            // Fetch Leaderboard
            const lbRes = await fetch(`${API_BASE_URL}/api/nisathon/leaderboard`);
            if (lbRes.ok) setLeaderboard(await lbRes.json());

            // Fetch Recent
            const recentRes = await fetch(`${API_BASE_URL}/api/nisathon/recent`);
            if (recentRes.ok) setRecentEvents(await recentRes.json());

        } catch (error) {
            // Silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);
    }, []);

    return { stats, leaderboard, recentEvents, loading, refetch: fetchAll };
};

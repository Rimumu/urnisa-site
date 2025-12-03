
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
    activeEvent?: string | null; // e.g. "DOUBLE_TIMER"
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
    nisaballAmount: number;
}

// Accept pollInterval to allow components like Overlay to update faster (default 5s)
export const useNisathonStats = (pollInterval = 5000) => {
    const [stats, setStats] = useState<NisathonStatsData>({
        currentSubs: 0,
        currentBits: 0,
        currentDonations: 0,
        totalNisaballs: 0,
        timerEndTime: new Date().toISOString(),
        isPaused: false,
        activeEvent: null
    });
    const [leaderboard, setLeaderboard] = useState<TopContributor[]>([]);
    const [recentEvents, setRecentEvents] = useState<ContributorEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        try {
            // Fetch ALL data in parallel. 
            // This is crucial. We need the new Timer Stats AND the new Recent Event (Username) 
            // to arrive at the exact same time so the animation logic in Overlay sees them together.
            const [statsRes, lbRes, recentRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/nisathon/stats`),
                fetch(`${API_BASE_URL}/api/nisathon/leaderboard`),
                fetch(`${API_BASE_URL}/api/nisathon/recent`)
            ]);

            const newStats = statsRes.ok ? await statsRes.json() : null;
            const newLb = lbRes.ok ? await lbRes.json() : null;
            const newRecent = recentRes.ok ? await recentRes.json() : null;

            // Batch State Updates
            // In React 18+, updates inside async functions are batched automatically, 
            // ensuring the component re-renders once with all new data.
            if (newStats) setStats(newStats);
            if (newLb) setLeaderboard(newLb);
            if (newRecent) setRecentEvents(newRecent);

        } catch (error) {
            // Silently fail to avoid console spam during polls
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, pollInterval);
        return () => clearInterval(interval);
    }, [pollInterval]);

    return { stats, leaderboard, recentEvents, loading, refetch: fetchAll };
};

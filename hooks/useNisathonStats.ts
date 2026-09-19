
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
    isEnded?: boolean;
    eventListenerActive?: boolean;
    subsRate?: number;
    bitsRate?: number;
    donationRate?: number;
    timePerNb?: number;
    nbFromSubs?: number;
    nbFromBits?: number;
    nbFromDonations?: number;
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
    adminNote?: string;
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
        activeEvent: null,
        isEnded: false,
        eventListenerActive: true
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
                fetch(`${API_BASE_URL}/api/nisathon/recent?limit=250`)
            ]);

            const newStats = statsRes.ok ? await statsRes.json() : null;
            const newLb = lbRes.ok ? await lbRes.json() : null;
            const newRecent = recentRes.ok ? await recentRes.json() : null;

            // Batch State Updates
            // In React 18+, updates inside async functions are batched automatically, 
            // ensuring the component re-renders once with all new data.
            if (newStats) {
                // If live timer data has positive remaining time, cache it in localStorage
                if (typeof newStats.remainingTimeMs === 'number' && newStats.remainingTimeMs > 0) {
                    try { localStorage.setItem('nisathon_preserved_timer_ms', newStats.remainingTimeMs.toString()); } catch (_) {}
                } else if (!newStats.isPaused && newStats.timerEndTime) {
                    const diff = new Date(newStats.timerEndTime).getTime() - Date.now();
                    if (diff > 0) {
                        try { localStorage.setItem('nisathon_preserved_timer_ms', diff.toString()); } catch (_) {}
                    }
                }

                // If ended or paused and remainingTimeMs is missing/zero, restore from cache if available
                if ((newStats.isEnded || newStats.isPaused) && (!newStats.remainingTimeMs || newStats.remainingTimeMs <= 0)) {
                    try {
                        const cached = localStorage.getItem('nisathon_preserved_timer_ms');
                        if (cached && Number(cached) > 0) {
                            newStats.remainingTimeMs = Number(cached);
                        }
                    } catch (_) {}
                }

                setStats(newStats);
            }
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
        if (pollInterval > 0) {
            const interval = setInterval(fetchAll, pollInterval);
            return () => clearInterval(interval);
        }
    }, [pollInterval]);

    return { stats, leaderboard, recentEvents, loading, refetch: fetchAll };
};

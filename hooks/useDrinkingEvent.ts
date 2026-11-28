import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../constants';

export type DrinkType = 'shot';
export type DrinkStatus = 'pending' | 'completed' | 'skipped';

export interface DrinkWheelItem {
    label: string;
    weight: number;
}

export interface DrinkSettings {
    eventTitle: string;
    eventSubtitle: string;
    donationsActive: boolean;
    gbpPerShot: number;
    shotLabel: string;
    shotsPerSpin: number;
    wheelItems: DrinkWheelItem[];
}

export interface DrinkQueueItem {
    _id: string;
    user: string;
    drinkType: DrinkType;
    drinkLabel: string;
    triggerType: string;
    amountDisplay: string;
    gbpAmount?: number;
    message?: string;
    totalShots: number;
    servedShots: number;
    skippedShots: number;
    remainingShots: number;
    status: DrinkStatus;
    isTest?: boolean;
    sourceEventId?: string;
    createdAt: string;
    completedAt?: string;
}

export interface DrinkSpinRecord {
    _id?: string;
    spinId: string;
    winningIndex: number;
    reward: string;
    isFreeSpin: boolean;
    shotCountAtSpin: number;
    spunBy?: string;
    startedAt: string;
    revealAt: string;
}

export interface DrinkStats {
    pendingCardsCount: number;
    pendingShotsCount: number;
    completedShots: number;
    skippedShots?: number;
    totalShotsQueued: number;
    shotsPerSpin: number;
    unlockedSpins: number;
    usedEarnedSpins: number;
    availableSpins: number;
    shotsIntoCurrentSpin: number;
    nextSpinIn: number;
    spinReady: boolean;
}

export interface TopBartender {
    rank: number;
    user: string;
    totalShots: number;
    servedShots: number;
    totalGbp?: number;
    lastTrigger: string;
}

export interface DrinkDebugLogEntry {
    _id: string;
    source: string;
    triggerType: string;
    user: string;
    amountDisplay: string;
    outcome: 'queued' | 'skipped' | 'dry_run' | 'error';
    reason: string;
    queuedSummary: string;
    isTest: boolean;
    createdAt: string;
}

export interface DrinkDebugResponse {
    seSocketConnected: boolean;
    seJwtConfigured: boolean;
    resolvedChannelId: string | null;
    nisathonListenerActive: boolean;
    nisathonEnded: boolean;
    drinkSettings: DrinkSettings;
    testItemsCount: number;
    logs: DrinkDebugLogEntry[];
}

export interface DrinkSimulationEvalResult {
    shouldQueue: boolean;
    normalizedType: string;
    amountDisplay: string;
    gbpAmount?: number;
    originalAmount?: number;
    originalCurrency?: string;
    shotCount: number;
    items: { drinkType: DrinkType; drinkLabel: string; totalShots?: number }[];
    reason: string;
    summary?: string;
    dryRun?: boolean;
    isTest?: boolean;
    createdCount?: number;
}

export interface DrinkStateResponse {
    settings: DrinkSettings;
    stats: DrinkStats;
    pendingQueue: DrinkQueueItem[];
    recentHistory: DrinkQueueItem[];
    leaderboard: TopBartender[];
    latestTrigger: DrinkQueueItem | null;
    activeSpin: DrinkSpinRecord | null;
    spinHistory: DrinkSpinRecord[];
}

export const DEFAULT_DRINK_WHEEL_ITEMS: DrinkWheelItem[] = [];

export const DEFAULT_DRINK_SETTINGS: DrinkSettings = {
    eventTitle: 'Shots with Urnisa',
    eventSubtitle: 'Every donation auto-converts to GBP (£), rounds down to whole shots, and unlocks a live Wheel Spin every 5 shots.',
    donationsActive: false,
    gbpPerShot: 3,
    shotLabel: 'Shot',
    shotsPerSpin: 5,
    wheelItems: DEFAULT_DRINK_WHEEL_ITEMS
};

export const DEFAULT_DRINK_STATS: DrinkStats = {
    pendingCardsCount: 0,
    pendingShotsCount: 0,
    completedShots: 0,
    totalShotsQueued: 0,
    shotsPerSpin: 5,
    unlockedSpins: 0,
    usedEarnedSpins: 0,
    availableSpins: 0,
    shotsIntoCurrentSpin: 0,
    nextSpinIn: 5,
    spinReady: false
};

export const useDrinkingEvent = (pollInterval = 3000) => {
    const [settings, setSettings] = useState<DrinkSettings>(DEFAULT_DRINK_SETTINGS);
    const [stats, setStats] = useState<DrinkStats>(DEFAULT_DRINK_STATS);
    const [pendingQueue, setPendingQueue] = useState<DrinkQueueItem[]>([]);
    const [recentHistory, setRecentHistory] = useState<DrinkQueueItem[]>([]);
    const [leaderboard, setLeaderboard] = useState<TopBartender[]>([]);
    const [latestTrigger, setLatestTrigger] = useState<DrinkQueueItem | null>(null);
    const [activeSpin, setActiveSpin] = useState<DrinkSpinRecord | null>(null);
    const [spinHistory, setSpinHistory] = useState<DrinkSpinRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const refetch = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/drinks/state`);
            if (!res.ok) return;
            const data: DrinkStateResponse = await res.json();
            if (data.settings) {
                setSettings({
                    ...DEFAULT_DRINK_SETTINGS,
                    ...data.settings,
                    wheelItems: Array.isArray(data.settings.wheelItems) && data.settings.wheelItems.length > 0
                        ? data.settings.wheelItems
                        : DEFAULT_DRINK_WHEEL_ITEMS
                });
            }
            if (data.stats) setStats(data.stats);
            if (Array.isArray(data.pendingQueue)) setPendingQueue(data.pendingQueue);
            if (Array.isArray(data.recentHistory)) setRecentHistory(data.recentHistory);
            if (Array.isArray(data.leaderboard)) setLeaderboard(data.leaderboard);
            setLatestTrigger(data.latestTrigger || null);
            setActiveSpin(data.activeSpin || null);
            if (Array.isArray(data.spinHistory)) setSpinHistory(data.spinHistory);
        } catch {
            // Silently recover so polling never spams console errors
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
        if (pollInterval > 0) {
            const timer = window.setInterval(refetch, pollInterval);
            return () => window.clearInterval(timer);
        }
    }, [pollInterval, refetch]);

    return {
        settings,
        stats,
        pendingQueue,
        recentHistory,
        leaderboard,
        latestTrigger,
        activeSpin,
        spinHistory,
        loading,
        refetch
    };
};

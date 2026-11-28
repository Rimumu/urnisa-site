import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, DEFAULT_SCHEDULE_URL } from '../constants';

export type ScheduleMode = 'poster' | 'countdown';
export type BackdropFit = 'cover' | 'contain';

export interface ScheduleConfig {
    mode: ScheduleMode;
    url: string;
    countdownTitle: string;
    countdownTarget: string;
    countdownBackdropUrl: string;
    countdownBackdropFit: BackdropFit;
    liveDetectedAt: string;
    streamStarted: boolean;
    streamTitle: string;
}

export interface StoredScheduleLiveState {
    targetIso: string;
    liveDetectedAt: string;
    streamStarted: boolean;
    streamTitle: string;
}

const SCHEDULE_LIVE_STORAGE_KEY = 'urnisa_schedule_live_state_v1';

export const getStoredScheduleLiveState = (targetIso: string): StoredScheduleLiveState | null => {
    if (!targetIso || typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(SCHEDULE_LIVE_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.targetIso !== targetIso) return null;
        return {
            targetIso,
            liveDetectedAt: typeof parsed.liveDetectedAt === 'string' ? parsed.liveDetectedAt : '',
            streamStarted: Boolean(parsed.streamStarted),
            streamTitle: typeof parsed.streamTitle === 'string' ? parsed.streamTitle : '',
        };
    } catch {
        return null;
    }
};

export const saveStoredScheduleLiveState = (
    targetIso: string,
    state: Omit<StoredScheduleLiveState, 'targetIso'>
): void => {
    if (!targetIso || typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(
            SCHEDULE_LIVE_STORAGE_KEY,
            JSON.stringify({
                targetIso,
                liveDetectedAt: state.liveDetectedAt || '',
                streamStarted: Boolean(state.streamStarted),
                streamTitle: state.streamTitle || '',
            })
        );
    } catch {
        // Ignore storage errors (e.g., private browsing quota)
    }
};

export const clearStoredScheduleLiveState = (): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(SCHEDULE_LIVE_STORAGE_KEY);
    } catch {
        // Ignore storage errors
    }
};

const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
    mode: 'poster',
    url: DEFAULT_SCHEDULE_URL,
    countdownTitle: '',
    countdownTarget: '',
    countdownBackdropUrl: '',
    countdownBackdropFit: 'cover',
    liveDetectedAt: '',
    streamStarted: false,
    streamTitle: '',
};

export interface UseScheduleOptions {
    pollIntervalMs?: number;
}

export const useSchedule = (options: UseScheduleOptions = {}) => {
    const { pollIntervalMs = 0 } = options;
    const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/schedule`);
            if (response.ok) {
                const data = await response.json();
                const mode: ScheduleMode = data.mode === 'countdown' ? 'countdown' : 'poster';
                const countdownTarget = typeof data.countdownTarget === 'string' ? data.countdownTarget : '';

                if (mode === 'poster') {
                    clearStoredScheduleLiveState();
                }

                const backendHasLiveFields = typeof data.streamStarted === 'boolean';
                const stored = mode === 'countdown' ? getStoredScheduleLiveState(countdownTarget) : null;

                let liveDetectedAt = '';
                let streamStarted = false;
                let streamTitle = '';

                if (mode === 'countdown') {
                    if (backendHasLiveFields) {
                        liveDetectedAt = typeof data.liveDetectedAt === 'string' ? data.liveDetectedAt : '';
                        streamStarted = Boolean(data.streamStarted);
                        streamTitle = typeof data.streamTitle === 'string' ? data.streamTitle : '';

                        if (!streamStarted && !liveDetectedAt) {
                            clearStoredScheduleLiveState();
                        } else {
                            saveStoredScheduleLiveState(countdownTarget, {
                                liveDetectedAt,
                                streamStarted,
                                streamTitle,
                            });
                        }
                    } else if (stored) {
                        liveDetectedAt = stored.liveDetectedAt;
                        streamStarted = stored.streamStarted;
                        streamTitle = stored.streamTitle;
                    }
                }

                setScheduleConfig({
                    mode,
                    url: typeof data.url === 'string' && data.url ? data.url : DEFAULT_SCHEDULE_URL,
                    countdownTitle: typeof data.countdownTitle === 'string' ? data.countdownTitle : '',
                    countdownTarget,
                    countdownBackdropUrl: typeof data.countdownBackdropUrl === 'string' ? data.countdownBackdropUrl : '',
                    countdownBackdropFit: data.countdownBackdropFit === 'contain' ? 'contain' : 'cover',
                    liveDetectedAt,
                    streamStarted,
                    streamTitle,
                });
            }
        } catch {
            // Silently fail to default schedule if backend is unreachable
            // This prevents spamming "Failed to fetch" in console during dev/deploy
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    useEffect(() => {
        if (!pollIntervalMs || pollIntervalMs <= 0) return;

        const interval = window.setInterval(fetchSchedule, pollIntervalMs);
        const handleFocusOrVisible = () => {
            if (document.visibilityState === 'visible') {
                fetchSchedule();
            }
        };

        window.addEventListener('focus', handleFocusOrVisible);
        document.addEventListener('visibilitychange', handleFocusOrVisible);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener('focus', handleFocusOrVisible);
            document.removeEventListener('visibilitychange', handleFocusOrVisible);
        };
    }, [pollIntervalMs, fetchSchedule]);

    return {
        scheduleUrl: scheduleConfig.url,
        scheduleConfig,
        loading,
        refetch: fetchSchedule,
    };
};

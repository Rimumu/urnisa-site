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
}

const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
    mode: 'poster',
    url: DEFAULT_SCHEDULE_URL,
    countdownTitle: '',
    countdownTarget: '',
    countdownBackdropUrl: '',
    countdownBackdropFit: 'cover',
};

export const useSchedule = () => {
    const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE_CONFIG);
    const [loading, setLoading] = useState(true);

    const fetchSchedule = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/schedule`);
            if (response.ok) {
                const data = await response.json();
                setScheduleConfig({
                    mode: data.mode === 'countdown' ? 'countdown' : 'poster',
                    url: typeof data.url === 'string' && data.url ? data.url : DEFAULT_SCHEDULE_URL,
                    countdownTitle: typeof data.countdownTitle === 'string' ? data.countdownTitle : '',
                    countdownTarget: typeof data.countdownTarget === 'string' ? data.countdownTarget : '',
                    countdownBackdropUrl: typeof data.countdownBackdropUrl === 'string' ? data.countdownBackdropUrl : '',
                    countdownBackdropFit: data.countdownBackdropFit === 'contain' ? 'contain' : 'cover',
                });
            }
        } catch (error) {
            // Silently fail to default schedule if backend is unreachable
            // This prevents spamming "Failed to fetch" in console during dev/deploy
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    return {
        scheduleUrl: scheduleConfig.url,
        scheduleConfig,
        loading,
        refetch: fetchSchedule,
    };
};

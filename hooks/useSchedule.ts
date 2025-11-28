
import { useState, useEffect } from 'react';
import { API_BASE_URL, DEFAULT_SCHEDULE_URL } from '../constants';

export const useSchedule = () => {
    const [scheduleUrl, setScheduleUrl] = useState<string>(DEFAULT_SCHEDULE_URL);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/schedule`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.url) {
                        setScheduleUrl(data.url);
                    }
                }
            } catch (error) {
                // Silently fail to default schedule if backend is unreachable
                // This prevents spamming "Failed to fetch" in console during dev/deploy
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    return { scheduleUrl, loading };
};

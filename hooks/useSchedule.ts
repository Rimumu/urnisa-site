
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
                console.error("Failed to fetch schedule, using default.", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    return { scheduleUrl, loading };
};

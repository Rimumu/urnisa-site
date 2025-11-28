
import { useState, useEffect } from 'react';
import { API_BASE_URL, DEFAULT_NISATHON_GOALS } from '../constants';

export interface NisathonGoal {
    count: number;
    reward: string;
    secret?: boolean;
}

export const useNisathonGoals = () => {
    const [goals, setGoals] = useState<NisathonGoal[]>(DEFAULT_NISATHON_GOALS);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/goals`);
            if (response.ok) {
                const data = await response.json();
                if (data.goals && Array.isArray(data.goals) && data.goals.length > 0) {
                    // Sort goals by count ascending to ensure correct roadmap order
                    const sortedGoals = data.goals.sort((a: NisathonGoal, b: NisathonGoal) => a.count - b.count);
                    setGoals(sortedGoals);
                }
            }
        } catch (error) {
            // Silently fail to defaults if backend is unreachable
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { goals, loading, refetch: fetchData };
};

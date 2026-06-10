import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

// Types matching the live hooks but for archived data
export interface ArchiveNisathonStats {
    archiveId: string;
    eventName: string;
    archivedAt: string;
    finalStats: {
        currentSubs: number;
        currentBits: number;
        currentDonations: number;
        totalNisaballs: number;
    };
    topContributors: {
        rank: number;
        user: string;
        totalNisaballs: number;
    }[];
    events: {
        _id: string;
        user: string;
        type: string;
        amountDisplay: string;
        message: string;
        createdAt: string;
        nisaballAmount: number;
    }[];
}

// Fetch archived Nisathon events
export const useArchiveNisathon = () => {
    const [archives, setArchives] = useState<ArchiveNisathonStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArchives = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/archive/nisathon`);
            if (response.ok) {
                const data = await response.json();
                setArchives(data.archives || []);
            } else {
                // Fallback to empty - archive endpoint might not exist in backend yet
                setArchives([]);
            }
        } catch (e) {
            setError('Failed to load archived Nisathon data');
            setArchives([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchives();
    }, []);

    return { archives, loading, error, refetch: fetchArchives };
};
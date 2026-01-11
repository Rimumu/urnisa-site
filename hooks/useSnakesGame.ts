import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../constants';

export interface SnakesQueueItem {
    _id: string;
    user: string;
    avatarUrl?: string;
    amount: number;
    type: string;
    createdAt: string;
}

export interface SnakesPlayer {
    _id: string;
    user: string;
    avatarUrl?: string;
    position: number;
    lastMovedAt: string;
}

export interface SnakesHistoryItem {
    _id: string;
    user: string;
    roll: number;
    fromPosition: number;
    toPosition: number;
    specialMove?: string;
    timestamp: string;
}

export interface SnakesWinner {
    _id: string;
    user: string;
    avatarUrl?: string;
    winCount: number;
    lastWinAt: string;
}

export interface SnakesBoard {
    ladders: Record<number, number>;
    snakes: Record<number, number>;
}

export interface SnakesGameState {
    queue: SnakesQueueItem[];
    players: SnakesPlayer[];
    history: SnakesHistoryItem[];
    winners: SnakesWinner[];
    isActive: boolean;
    board: SnakesBoard;
}

export interface MoveResult {
    success: boolean;
    user: string;
    roll: number;
    fromPosition: number;
    toPosition: number;
    specialMove?: string;
    isWinner: boolean;
}

export const useSnakesGame = () => {
    const [state, setState] = useState<SnakesGameState | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastMoveResult, setLastMoveResult] = useState<MoveResult | null>(null);

    const fetchState = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/snakes/state`);
            if (res.ok) {
                const data = await res.json();
                setState(data);
            }
        } catch (error) {
            console.error('Failed to fetch snakes state:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchState();
        const interval = setInterval(fetchState, 3000);
        return () => clearInterval(interval);
    }, [fetchState]);

    const processMove = async (password: string): Promise<MoveResult | null> => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/snakes/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                }
            });
            const data = await res.json();
            if (data.success) {
                setLastMoveResult(data);
                fetchState();
                return data;
            }
            return null;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const toggleActive = async (password: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/snakes/toggle`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                }
            });
            const data = await res.json();
            if (data.success) {
                fetchState();
            }
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const addTestEvent = async (password: string, user: string, amount: number = 1) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/snakes/test-event`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ user, amount })
            });
            const data = await res.json();
            if (data.success) {
                fetchState();
            }
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const resetGame = async (password: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/snakes/reset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                }
            });
            const data = await res.json();
            if (data.success) {
                setLastMoveResult(null);
                fetchState();
            }
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const adminMovePlayer = async (password: string, user: string, spaces: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/snakes/admin/move`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ user, spaces })
            });
            const data = await res.json();
            if (data.success) {
                fetchState();
            }
            return data;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    return {
        state,
        loading,
        lastMoveResult,
        processMove,
        toggleActive,
        addTestEvent,
        resetGame,
        adminMovePlayer,
        refetch: fetchState
    };
};

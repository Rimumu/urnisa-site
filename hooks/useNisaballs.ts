import { useState, useEffect, useCallback } from 'react';
import { getNisaballsBalance, getNisaballHistory, ECONOMY_UPDATE_EVENT, NisaballTransaction, setNisaballsBalance } from '../utils/economy';
import { API_BASE_URL } from '../constants';

export function useNisaballs(twitchUsername: string | null | undefined, pollInterval = 5000) {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<NisaballTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveBalance = useCallback(async () => {
    if (!twitchUsername) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/nisathon/user/${encodeURIComponent(twitchUsername.trim())}`);
      if (response.ok) {
        const data = await response.json();
        const liveBal = data.totalNisaballs || 0;
        
        // Map backend events to frontend NisaballTransaction structure
        const liveHistory: NisaballTransaction[] = (data.events || []).map((e: any) => ({
          id: e.id,
          amount: e.nisaballAmount || 0,
          type: e.type || 'sub',
          channel: 'urnisa_',
          description: e.message || e.amountDisplay || 'Twitch contribution',
          timestamp: e.createdAt ? new Date(e.createdAt).getTime() : Date.now()
        }));

        setBalance(liveBal);
        setHistory(liveHistory);

        // Sync with local storage so other legacy/offline components are aware
        setNisaballsBalance(twitchUsername, liveBal);
      } else {
        // Fallback to local storage if API returned non-200 (e.g. backend not deployed yet)
        setBalance(getNisaballsBalance(twitchUsername));
        setHistory(getNisaballHistory(twitchUsername));
      }
    } catch (error) {
      // Fallback on network errors
      setBalance(getNisaballsBalance(twitchUsername));
      setHistory(getNisaballHistory(twitchUsername));
    }
  }, [twitchUsername]);

  useEffect(() => {
    if (!twitchUsername) {
      setBalance(0);
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Initial fetch from backend (or fallback)
    fetchLiveBalance().finally(() => setLoading(false));

    // Poll for real-time changes while the page is active
    const interval = setInterval(fetchLiveBalance, pollInterval);

    // Also listen to local triggers/changes
    const handleLocalUpdate = () => {
      setBalance(getNisaballsBalance(twitchUsername));
      setHistory(getNisaballHistory(twitchUsername));
    };
    window.addEventListener(ECONOMY_UPDATE_EVENT, handleLocalUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener(ECONOMY_UPDATE_EVENT, handleLocalUpdate);
    };
  }, [twitchUsername, pollInterval, fetchLiveBalance]);

  return { balance: Math.floor(balance), history, loading, refetch: fetchLiveBalance };
}

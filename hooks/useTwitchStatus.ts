
import { useState, useEffect, useCallback } from 'react';
import { TWITCH_CHANNEL_NAME, API_BASE_URL } from '../constants';

/**
 * A hook that fetches the real-time live status of the Twitch channel.
 * It first checks the backend for a manual override.
 * If set to 'auto', it uses the decapi.me API to check uptime.
 * 
 * @returns {boolean} A boolean indicating if the stream is live.
 */
export const useTwitchStatus = (): boolean => {
  const [isLive, setIsLive] = useState(false);

  const checkStatus = useCallback(async () => {
    // 1. Check Backend Override first
    try {
        const overrideRes = await fetch(`${API_BASE_URL}/api/stream-status`);
        if (overrideRes.ok) {
            const { override } = await overrideRes.json();
            if (override === 'live') { 
                setIsLive(true); 
                return; // Skip decapi check if overridden
            }
            if (override === 'offline') { 
                setIsLive(false); 
                return; // Skip decapi check if overridden
            }
            // If 'auto', proceed to normal check
        }
    } catch (e) {
        // Ignore error and fall back to decapi
    }

    // 2. Fallback to decapi.me if no override or 'auto'
    try {
      // decapi.me returns the uptime if live, or "[channel] is offline" if not.
      const response = await fetch(`https://decapi.me/twitch/uptime/${TWITCH_CHANNEL_NAME}`);
      
      if (response.ok) {
        const text = await response.text();
        const cleanText = text.trim().toLowerCase();
        // If the text includes 'offline', the channel is not live.
        // Otherwise, it returns a time string (e.g., "2 hours, 4 minutes"), meaning they are live.
        setIsLive(!cleanText.includes('offline') && cleanText.length > 0);
      }
    } catch (error) {
      console.error('Error fetching Twitch status:', error);
    }
  }, []);

  useEffect(() => {
    // Check status immediately on mount
    checkStatus();

    // Poll every 60 seconds to keep status updated
    const interval = setInterval(checkStatus, 60000);

    return () => clearInterval(interval);
  }, [checkStatus]);

  return isLive;
};

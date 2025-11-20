import { useState, useEffect, useCallback } from 'react';
import { TWITCH_CHANNEL_NAME } from '../constants';

/**
 * A hook that fetches the real-time live status of the Twitch channel.
 * Uses the decapi.me API to check uptime, which avoids the need for 
 * server-side OAuth handling for a simple status check.
 * 
 * @returns {boolean} A boolean indicating if the stream is live.
 */
export const useTwitchStatus = (): boolean => {
  const [isLive, setIsLive] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      // decapi.me returns the uptime if live, or "[channel] is offline" if not.
      // This is a reliable way to check status from the frontend without CORS issues.
      const response = await fetch(`https://decapi.me/twitch/uptime/${TWITCH_CHANNEL_NAME}`);
      
      if (response.ok) {
        const text = await response.text();
        // If the text includes 'offline', the channel is not live.
        // Otherwise, it returns a time string (e.g., "2 hours, 4 minutes"), meaning they are live.
        setIsLive(!text.includes('offline'));
      }
    } catch (error) {
      console.error('Error fetching Twitch status:', error);
      // We do not update state on error to prevent UI flickering
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
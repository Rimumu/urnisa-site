import { useState, useEffect } from 'react';

/**
 * A mock hook to simulate fetching Twitch live status.
 * In a real application, this would involve making an API call to the Twitch API
 * via a secure backend proxy to avoid exposing API keys on the client-side.
 * 
 * @returns {boolean} A boolean indicating if the stream is live.
 */
export const useTwitchStatus = (): boolean => {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Start with a random status to make the initial state unpredictable.
    setIsLive(Math.random() > 0.5);

    // Set up an interval to toggle the live status every 10 seconds.
    // This demonstrates the dynamic nature of the UI component.
    const interval = setInterval(() => {
      setIsLive(prevStatus => !prevStatus);
    }, 10000);

    // Clean up the interval when the component unmounts to prevent memory leaks.
    return () => clearInterval(interval);
  }, []);

  return isLive;
};

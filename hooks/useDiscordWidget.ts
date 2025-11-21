
import { useState, useEffect } from 'react';
import { DISCORD_ROLES_CONFIG, API_BASE_URL } from '../constants';

// TypeScript interfaces for the Discord widget API response
interface Game {
  name: string;
}

interface Member {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  avatar_url: string;
  game?: Game;
  nick?: string; // Server nickname
  global_name?: string; // Global display name
}

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string | null;
  channels: { id: string; name:string; position: number }[];
  members: Member[];
  presence_count: number;
}

// Data structure returned by our custom server.js
interface DiscordOwnerData {
    id: string;
    username: string;
    global_name: string | null;
    discriminator: string;
    nick: string | null;
    avatar_url: string;
    status: string;
}

interface UseDiscordWidgetReturn {
  data: DiscordWidgetData | null;
  ownerData: DiscordOwnerData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * A custom hook to fetch live data from a Discord server's widget API.
 * Also attempts to fetch specific user data for the owner to handle offline states.
 * 
 * @param {string} serverId The ID of the Discord server.
 * @returns {UseDiscordWidgetReturn} An object containing the widget data, owner profile data, loading state, and error state.
 */
export const useDiscordWidget = (serverId: string): UseDiscordWidgetReturn => {
  const [data, setData] = useState<DiscordWidgetData | null>(null);
  const [ownerData, setOwnerData] = useState<DiscordOwnerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!serverId) return;

    const fetchData = async () => {
      // Only set loading true on the very first fetch to prevent UI flickering on polls
      if (!data) setLoading(true);
      setError(null);
      try {
        // 1. Fetch Server Widget Data (Online members)
        const widgetResponse = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`);
        if (!widgetResponse.ok) {
          throw new Error(`Failed to fetch Discord widget data. Status: ${widgetResponse.status}`);
        }
        const widgetData: DiscordWidgetData = await widgetResponse.json();
        setData(widgetData);

        // 2. Fetch Owner Data (Real profile via our local Bot Proxy)
        try {
            // We use the API_BASE_URL from constants.
            const userResponse = await fetch(`${API_BASE_URL}/api/owner`);
            if (userResponse.ok) {
                const userData: DiscordOwnerData = await userResponse.json();
                setOwnerData(userData);
            } else {
                // Only warn in console, don't break the UI
                // console.warn("Bot proxy server returned error:", userResponse.status);
            }
        } catch (userError) {
             // console.warn(`Could not connect to bot server at ${API_BASE_URL}. Owner data will use fallbacks.`);
        }

      } catch (e) {
        if (e instanceof Error) {
            setError(e);
        } else {
            setError(new Error('An unknown error occurred while fetching Discord data.'));
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 10 seconds for real-time status updates
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, [serverId]); // We don't include 'data' in dependencies to avoid infinite loops.

  return { data, ownerData, loading, error };
};

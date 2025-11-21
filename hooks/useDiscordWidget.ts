
import { useState, useEffect } from 'react';

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
  nick?: string;
  global_name?: string;
}

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string | null;
  channels: { id: string; name:string; position: number }[];
  members: Member[];
  presence_count: number;
}

interface UseDiscordWidgetReturn {
  data: DiscordWidgetData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * A custom hook to fetch live data from a Discord server's widget API.
 * 
 * @param {string} serverId The ID of the Discord server.
 * @returns {UseDiscordWidgetReturn} An object containing the widget data, loading state, and error state.
 */
export const useDiscordWidget = (serverId: string): UseDiscordWidgetReturn => {
  const [data, setData] = useState<DiscordWidgetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!serverId) return;

    const fetchData = async () => {
      // Only set loading true on the very first fetch to prevent UI flickering on polls
      if (!data) setLoading(true);
      setError(null);
      try {
        // Fetch Server Widget Data (Online members & presence count)
        const widgetResponse = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`);
        if (!widgetResponse.ok) {
          throw new Error(`Failed to fetch Discord widget data. Status: ${widgetResponse.status}`);
        }
        const widgetData: DiscordWidgetData = await widgetResponse.json();
        setData(widgetData);

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

    // Initial fetch only
    fetchData();

  }, [serverId]); 

  return { data, loading, error };
};
